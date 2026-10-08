const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const express = require('express');
const logger = require('../src/services/logger');
const tracker = require('../src/services/error-tracker');
const health = require('../src/controllers/health.controller');
const { requestId } = require('../src/middleware/observability');
const { requestContext } = require('../src/config/context');

function listen(app) {
  return new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
}

test('Logger: JSON lines with level, time, context; secrets redacted, e-mails masked', () => {
  const lines = [];
  logger.setSink((e) => lines.push(e));
  process.env.LOG_LEVEL = 'debug';
  requestContext.run({ requestId: 'req-12345678', userId: 7, orgId: 3 }, () => {
    logger.child('mail').info('Sent to jane.doe@example.org', {
      password: 'hunter2', nested: { apiKey: 'abc', ok: 1 }, header: 'Bearer abc.def.ghi',
    });
  });
  logger.setSink(null);
  const e = lines[0];
  assert.strictEqual(e.level, 'info');
  assert.ok(!Number.isNaN(Date.parse(e.time)));
  assert.strictEqual(e.component, 'mail');
  assert.deepStrictEqual([e.requestId, e.userId, e.orgId], ['req-12345678', 7, 3]);
  assert.strictEqual(e.password, '[REDACTED]');
  assert.strictEqual(e.nested.apiKey, '[REDACTED]');
  assert.strictEqual(e.nested.ok, 1);
  assert.strictEqual(e.header, 'Bearer [REDACTED]');
  assert.match(e.msg, /j\*\*\*@example\.org/);
  assert.ok(!JSON.stringify(e).includes('hunter2'));
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(e)));
});

test('Logger: respects LOG_LEVEL and serialises errors', () => {
  const lines = [];
  logger.setSink((e) => lines.push(e));
  process.env.LOG_LEVEL = 'warn';
  logger.info('hidden');
  logger.error('boom', new Error('bad thing'));
  logger.setSink(null);
  assert.strictEqual(lines.length, 1);
  assert.strictEqual(lines[0].err.message, 'bad thing');
  assert.ok(lines[0].err.stack.includes('bad thing'));
  delete process.env.LOG_LEVEL;
});

test('Error tracker: DSN parsing, off without DSN, events tagged with release and request', async () => {
  assert.deepStrictEqual(tracker.parseDsn('https://k1@o1.ingest.sentry.io/123'), { publicKey: 'k1', projectId: '123', url: 'https://o1.ingest.sentry.io/api/123/envelope/' });
  assert.strictEqual(tracker.parseDsn('not a dsn'), null);
  delete process.env.SENTRY_DSN;
  assert.strictEqual(tracker.enabled(), false);
  assert.strictEqual(await tracker.capture(new Error('x')), null);
  const ev = requestContext.run({ requestId: 'rid-abcdefgh', userId: 9 }, () => tracker.buildEvent(new Error('mail to a.b@x.org failed')));
  assert.match(ev.release, /^dmp-system@/);
  assert.strictEqual(ev.tags.request_id, 'rid-abcdefgh');
  assert.strictEqual(ev.user.id, '9');
  assert.ok(!ev.exception.values[0].value.includes('a.b@x.org'));
  assert.ok(ev.exception.values[0].stacktrace.frames.length > 0);
});

test('Error tracker: a deliberately thrown request error reaches the tracker', async () => {
  const received = [];
  const mock = http.createServer((req, res) => {
    let b = ''; req.on('data', (d) => { b += d; });
    req.on('end', () => { received.push({ url: req.url, auth: req.headers['x-sentry-auth'], body: b }); res.end('{}'); });
  });
  await new Promise((r) => mock.listen(0, r));
  process.env.SENTRY_DSN = `http://pub@127.0.0.1:${mock.address().port}/42`;
  logger.setSink(() => {});

  const app = express();
  app.use(requestId());
  app.get('/boom', () => { throw new Error('Deliberate test error'); });
  app.use(require('../src/middleware/error').errorHandler);
  const srv = await listen(app);
  const r = await fetch(`http://127.0.0.1:${srv.address().port}/boom`, { headers: { accept: 'application/json', 'x-request-id': 'trace-test-0001' } });
  assert.strictEqual(r.status, 500);
  assert.strictEqual(r.headers.get('x-request-id'), 'trace-test-0001');
  for (let i = 0; i < 50 && !received.length; i++) await new Promise((x) => setTimeout(x, 20));
  srv.close(); mock.close(); logger.setSink(null); delete process.env.SENTRY_DSN;

  assert.strictEqual(received.length, 1);
  assert.strictEqual(received[0].url, '/api/42/envelope/');
  assert.match(received[0].auth, /sentry_key=pub/);
  const event = JSON.parse(received[0].body.split('\n')[2]);
  assert.strictEqual(event.exception.values[0].value, 'Deliberate test error');
  assert.strictEqual(event.tags.request_id, 'trace-test-0001');
});

test('Health: liveness always ok; readiness 503 when the database fails, no error details leaked', async () => {
  const saved = { ...health.checks };
  const app = express();
  app.get('/health', health.ready);
  app.get('/health/live', health.live);
  const srv = await listen(app);
  const base = `http://127.0.0.1:${srv.address().port}`;
  try {
    health.checks.database = async () => null;
    health.checks.jobQueue = async () => ({ backlog: 2 });
    let r = await fetch(`${base}/health`); let j = await r.json();
    assert.strictEqual(r.status, 200);
    assert.strictEqual(j.status, 'ok');
    assert.ok(j.version && j.release);

    health.checks.jobQueue = async () => { throw new Error('table missing'); };
    j = await (await fetch(`${base}/health`)).json();
    assert.strictEqual(j.status, 'degraded');

    health.checks.database = async () => { throw new Error('ECONNREFUSED 10.0.0.5:3306 password=x'); };
    r = await fetch(`${base}/health`); const text = await r.text();
    assert.strictEqual(r.status, 503);
    assert.strictEqual(JSON.parse(text).status, 'fail');
    assert.ok(!/ECONNREFUSED|10\.0\.0\.5|password/.test(text));

    r = await fetch(`${base}/health/live`);
    assert.strictEqual(r.status, 200);
  } finally {
    Object.assign(health.checks, saved);
    srv.close();
  }
});
