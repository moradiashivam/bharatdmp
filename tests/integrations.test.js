const test = require('node:test');
const assert = require('node:assert');
const integ = require('../src/services/integrations.service');
const dep = require('../src/services/deposit.service');
const reg = require('../src/services/registry.service');

test('FAIRsharing search results are parsed', () => {
  const r = integ.parseFairsharing({ data: [{ id: 123, attributes: { name: 'Dublin Core', abbreviation: 'DC', doi: '10.25504/FAIRsharing.123', record_type: 'terminology_artefact' } }, { id: 9, attributes: {} }] });
  assert.strictEqual(r.length, 1);
  assert.strictEqual(r[0].name, 'Dublin Core');
  assert.strictEqual(r[0].url, 'https://doi.org/10.25504/FAIRsharing.123');
});

test('ORCID works are parsed with DOI', () => {
  const w = integ.parseOrcidWorks({ group: [{ 'work-summary': [{ 'put-code': 55, type: 'journal-article', title: { title: { value: 'Rice genomes' } },
    'publication-date': { year: { value: '2024' } }, 'journal-title': { value: 'Nature' },
    'external-ids': { 'external-id': [{ 'external-id-type': 'doi', 'external-id-value': 'https://doi.org/10.1/abc' }] } }] }, { 'work-summary': [{}] }] });
  assert.deepStrictEqual(w, [{ put_code: '55', title: 'Rice genomes', work_type: 'journal-article', year: '2024', journal: 'Nature', doi: '10.1/abc', url: 'https://doi.org/10.1/abc' }]);
  assert.strictEqual(integ.cleanOrcid('https://orcid.org/0000-0002-1825-009x'), '0000-0002-1825-009X');
  assert.strictEqual(integ.cleanOrcid('abc'), null);
});

test('repository addresses must be public https', () => {
  assert.strictEqual(dep.safeUrl('https://demo.dataverse.org/'), 'https://demo.dataverse.org');
  assert.throws(() => dep.safeUrl('http://x.org'));
  assert.throws(() => dep.safeUrl('https://192.168.1.4'));
  assert.throws(() => dep.safeUrl('https://localhost'));
});

test('deposit without a token gives a clear message', async () => {
  await assert.rejects(dep.deposit('zenodo', null, {}, []), /Add your Zenodo token/);
});

test('standard and publication answers display readably', () => {
  assert.strictEqual(reg.displayText(JSON.stringify({ name: 'Dublin Core', abbreviation: 'DC', url: 'https://dublincore.org' })), 'Dublin Core (DC) - https://dublincore.org');
  assert.strictEqual(reg.displayText({ name: 'Rice genomes', year: '2024', doi: '10.1/abc' }), 'Rice genomes (2024, DOI 10.1/abc)');
});

const ai = require('../src/services/ai.service');
test('AI prompts carry guidance, keep placeholders and ask for JSON', () => {
  const m = ai.suggestPrompt({ project: 'Rice call', domain: 'Agriculture', field: { field_label: 'Storage', guidance_text: 'Mention backups', max_length: 500 }, priorAnswers: [{ label: 'Data type', answer: 'Images' }], language: 'Hindi' });
  assert.match(m[1].content, /Mention backups/); assert.match(m[1].content, /Hindi/); assert.match(m[1].content, /under 500/);
  assert.match(ai.critiquePrompt({ project: 'X', items: [{ id: 7, label: 'Q', answer: '' }] })[1].content, /\[7\][\s\S]*\(blank\)[\s\S]*"items"/);
  assert.match(ai.uiFillPrompt({ items: [{ id: '0', text: 'Hello {name}' }], to: 'French' })[1].content, /Hello \{name\}/);
  assert.deepStrictEqual(ai.parseJson('Sure! {"t":{"0":"Bonjour"}} done'), { t: { 0: 'Bonjour' } });
  assert.strictEqual(ai.parseJson('nope'), null);
});

test('AI chat talks to an OpenAI-compatible endpoint and maps errors', async () => {
  const http = require('http');
  let seen = null;
  const srv = http.createServer((req, res) => {
    let b = ''; req.on('data', (c) => { b += c; }); req.on('end', () => {
      seen = { auth: req.headers.authorization, body: JSON.parse(b), url: req.url };
      if (seen.body.model === 'bad') { res.writeHead(401); return res.end('{}'); }
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ choices: [{ message: { content: ' OK ' } }] }));
    });
  });
  await new Promise((r) => srv.listen(0, r));
  const base = `http://127.0.0.1:${srv.address().port}/v1`;
  const out = await ai.chat([{ role: 'user', content: 'hi' }], { s: { base_url: base, model: 'm', api_key: 'k1' } });
  assert.strictEqual(out, 'OK'); assert.strictEqual(seen.url, '/v1/chat/completions'); assert.strictEqual(seen.auth, 'Bearer k1');
  await assert.rejects(ai.chat([{ role: 'user', content: 'x' }], { s: { base_url: base, model: 'bad', api_key: '' } }), /rejected the API key/);
  srv.close();
});
