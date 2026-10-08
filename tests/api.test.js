const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const keys = require('../src/services/api-key.service');
const hooks = require('../src/services/webhook.service');
const openapi = require('../src/services/openapi');

test('API keys: generated, parsed, matched and never stored in plain text', () => {
  const g = keys.generate();
  assert.match(g.key, /^dmp_[a-f0-9]{12}_/);
  assert.strictEqual(keys.parse(g.key), g.prefix);
  assert.ok(keys.matches(g.key, g.hash));
  assert.ok(!keys.matches(`${g.key}x`, g.hash));
  assert.ok(!g.hash.includes(g.key));
  assert.strictEqual(keys.parse('Bearer nonsense'), null);
  assert.strictEqual(keys.parse(''), null);
});

test('API keys: scopes are whitelisted', () => {
  assert.deepStrictEqual(keys.cleanScopes(['plans:read', 'evil', 'plans:read']), ['plans:read']);
  assert.deepStrictEqual(keys.cleanScopes('projects:read, submissions:write'), ['projects:read', 'submissions:write']);
  assert.ok(keys.hasScope('projects:read', 'projects:read'));
  assert.ok(!keys.hasScope(['projects:read'], 'plans:read'));
});

test('Webhooks: signature round-trips and rejects tampering/old timestamps', () => {
  const body = JSON.stringify({ a: 1 });
  const header = hooks.signatureHeader('whsec_test', body);
  assert.ok(hooks.verify('whsec_test', header, body));
  assert.ok(!hooks.verify('whsec_other', header, body));
  assert.ok(!hooks.verify('whsec_test', header, `${body} `));
  assert.ok(!hooks.verify('whsec_test', header, body, 300, Date.now() + 10 * 60 * 1000));
});

test('Webhooks: subscriptions, backoff and URL safety', () => {
  assert.ok(hooks.subscribed('*', 'dmp.submitted'));
  assert.ok(hooks.subscribed('dmp.submitted,dmp.approved', 'dmp.approved'));
  assert.ok(!hooks.subscribed('dmp.submitted', 'dmp.approved'));
  assert.ok(hooks.subscribed('dmp.submitted', 'ping'));
  assert.deepStrictEqual([1, 2, 3, 4, 5, 9].map(hooks.backoffMinutes), [1, 5, 30, 120, 720, 720]);
  assert.strictEqual(hooks.validUrl('ftp://x.org'), null);
  assert.strictEqual(hooks.validUrl('http://localhost:3000/x'), null);
  assert.strictEqual(hooks.validUrl('http://192.168.1.5/x'), null);
  assert.strictEqual(hooks.validUrl('https://example.org/hook'), 'https://example.org/hook');
});

test('Webhooks: payload strips personal and secret values', () => {
  const p = hooks.buildPayload('dmp.submitted', 3, { submission_no: 'DMP-1', email: 'a@b.c', reset_token: 'x', action_url: 'http://x', project_name: 'Call' });
  assert.strictEqual(p.event, 'dmp.submitted');
  assert.match(p.id, /^evt_/);
  assert.deepStrictEqual(p.data, { submission_no: 'DMP-1', project_name: 'Call' });
  assert.strictEqual(hooks.FROM_NOTIFICATION.dmp_submitted, 'dmp.submitted');
  Object.values(hooks.FROM_NOTIFICATION).forEach((e) => assert.ok(hooks.EVENTS[e]));
});

test('Webhooks: a signed request reaches a real receiver and verifies', async () => {
  let got;
  const server = http.createServer((req, res) => {
    let body = ''; req.on('data', (c) => { body += c; });
    req.on('end', () => { got = { body, sig: req.headers['x-dmp-signature'] }; res.end('ok'); });
  });
  await new Promise((r) => server.listen(0, r));
  const body = JSON.stringify(hooks.buildPayload('ping', null, { message: 'hi' }));
  const res = await fetch(`http://127.0.0.1:${server.address().port}`, {
    method: 'POST', body, headers: { 'X-DMP-Signature': hooks.signatureHeader('s3cret', body) } });
  server.close();
  assert.strictEqual(res.status, 200);
  assert.ok(hooks.verify('s3cret', got.sig, got.body));
});

test('OpenAPI description lists every endpoint', () => {
  const doc = openapi.build('https://dmp.example.org');
  assert.strictEqual(doc.openapi, '3.0.3');
  assert.strictEqual(doc.servers[0].url, 'https://dmp.example.org/api/v1');
  ['/projects', '/projects/{id}', '/plans', '/plans/{id}', '/submissions', '/submissions/{id}/status'].forEach((p) => assert.ok(doc.paths[p], p));
});
