const test = require('node:test');
const assert = require('node:assert');
const reg = require('../src/services/registry.service');
const std = require('../src/services/standards.service');

test('re3data list and record XML are parsed', () => {
  const list = '<list><repository><id>r3d100010468</id><doi>https://doi.org/10.17616/R3QP53</doi><name>Zenodo</name></repository><repository><id>bad</id><name>x</name></repository></list>';
  assert.deepStrictEqual(reg.parseRe3dataList(list), [{ id: 'r3d100010468', name: 'Zenodo', doi: 'https://doi.org/10.17616/R3QP53' }]);
  const rec = '<r3d:re3data><r3d:repository><r3d:repositoryName language="eng">Data &amp; Co</r3d:repositoryName><r3d:repositoryURL>https://d.example.org</r3d:repositoryURL><r3d:pidSystem>DOI</r3d:pidSystem><r3d:pidSystem>hdl</r3d:pidSystem><r3d:certificate>CoreTrustSeal</r3d:certificate><r3d:databaseAccessType>open</r3d:databaseAccessType></r3d:repository></r3d:re3data>';
  const r = reg.parseRe3dataRecord(rec, 'r3d100000001');
  assert.strictEqual(r.name, 'Data & Co');
  assert.strictEqual(r.url, 'https://d.example.org');
  assert.deepStrictEqual(r.certified_with, ['coretrustseal']);
  assert.deepStrictEqual(r.pid_systems, ['DOI', 'hdl']);
});

test('ROR v2 and Crossref funder responses are parsed', () => {
  const ror = reg.parseRor({ items: [{ id: 'https://ror.org/02qyf5152', names: [{ value: 'IITB', types: ['acronym'] }, { value: 'Indian Institute of Technology Bombay', types: ['ror_display'] }],
    locations: [{ geonames_details: { country_name: 'India', name: 'Mumbai' } }], links: [{ type: 'website', value: 'http://www.iitb.ac.in/' }], types: ['education'] }] });
  assert.strictEqual(ror[0].name, 'Indian Institute of Technology Bombay');
  assert.strictEqual(ror[0].country, 'India');
  const f = reg.parseFunders({ message: { items: [{ id: '100010269', name: 'Wellcome Trust', location: 'United Kingdom' }] } });
  assert.strictEqual(f[0].doi, 'https://doi.org/10.13039/100010269');
});

test('stored registry values display as readable text', () => {
  assert.strictEqual(reg.displayText('{"name":"Zenodo","re3data":"r3d100010468","url":"https://zenodo.org/"}'), 'Zenodo (re3data r3d100010468) - https://zenodo.org/');
  assert.strictEqual(reg.displayText('zenodo'), 'zenodo');
  assert.strictEqual(reg.displayText('{"x":1}'), '{"x":1}');
});

test('maDMP export carries the re3data identifier, certification, PID system, dataset link and Crossref funder', () => {
  const model = { language: 'en', plan: { id: 1, title: 'T', number: 'N', version: 1, status: 'submitted', created: '2026-01-01T00:00:00Z', modified: '2026-01-02T00:00:00Z', project: 'P', organization: 'Fund' },
    contact: { name: 'A', email: 'a@b.org' },
    sections: [{ title: 'S', fields: [
      { id: 1, field_name: 'repository', label: 'Repo', type: 'repository_picker', value: JSON.stringify({ source: 're3data', name: 'Zenodo', re3data: 'r3d100010468', url: 'https://zenodo.org/', certified_with: ['coretrustseal'], pid_systems: ['DOI'], deposit_url: 'https://doi.org/10.5281/zenodo.1' }) },
      { id: 2, field_name: 'funder', label: 'Funder', type: 'funder_lookup', value: JSON.stringify({ source: 'crossref', name: 'Wellcome Trust', funder_id: '100010269' }) },
    ] }] };
  const doc = std.toMadmp(model, { repository: 'dmp.dataset.distribution.host', funder: 'dmp.project.funding.funder_id' });
  assert.deepStrictEqual(std.validateMadmp(doc).errors, []);
  const dist = doc.dmp.dataset[0].distribution[0];
  assert.strictEqual(dist.host.url, 'https://zenodo.org/');
  assert.match(dist.host.description, /r3d100010468/);
  assert.strictEqual(dist.host.certified_with, 'coretrustseal');
  assert.deepStrictEqual(dist.host.pid_system, ['doi']);
  assert.strictEqual(dist.access_url, 'https://doi.org/10.5281/zenodo.1');
  assert.deepStrictEqual(doc.dmp.project[0].funding[0].funder_id, { identifier: 'https://doi.org/10.13039/100010269', type: 'fundref' });
});
