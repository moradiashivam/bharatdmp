const test = require('node:test');
const assert = require('node:assert');
const std = require('../src/services/standards.service');

const model = {
  language: 'en',
  plan: { id: 7, title: 'Open Data Call - Asha Rao', number: 'DMP-2026-0007', version: 2, status: 'approved',
    created: '2026-05-01T10:00:00Z', modified: '2026-06-01T10:00:00Z', project: 'Open Data Call', organization: 'ICSSR', url: null },
  contact: { name: 'Asha Rao', email: 'asha@example.org', orcid: '0000-0002-1825-0097', institution: 'IIT' },
  sections: [{ title: 'Data', description: 'About the data', fields: [
    { id: 1, field_name: 'project_title', label: 'Project title', type: 'short_text', value: 'Rural water survey' },
    { id: 2, field_name: 'personal_data', label: 'Personal data?', type: 'single_select', value: 'Yes' },
    { id: 3, field_name: 'licence', label: 'Licence', type: 'licence_picker', value: 'CC-BY' },
    { id: 4, field_name: 'storage_size', label: 'Size', type: 'storage_size', value: '{"value":2,"unit":"GB"}' },
    { id: 5, field_name: 'repository', label: 'Repository', type: 'repository_picker', value: '{"name":"Zenodo","url":"https://zenodo.org"}' },
    { id: 6, field_name: 'keywords', label: 'Keywords', type: 'short_text', value: 'water, survey; india' },
    { id: 7, field_name: 'notes', label: 'Notes "quoted", <b>', type: 'long_text', value: 'line1\nline2' },
    { id: 8, field_name: 'project_start_date', label: 'Start', type: 'date', value: '2026-07-01' },
  ] }],
};
const mappings = {
  project_title: 'dmp.project.title', personal_data: 'dmp.dataset.personal_data', licence: 'dmp.dataset.distribution.license',
  storage_size: 'dmp.dataset.distribution.byte_size', repository: 'dmp.dataset.distribution.host', keywords: 'dmp.dataset.keyword',
  project_start_date: 'dmp.project.start',
};

test('maDMP export validates against the official RDA schema', () => {
  const doc = std.toMadmp(model, mappings);
  const r = std.validateMadmp(doc);
  assert.deepStrictEqual(r.errors, []);
  assert.strictEqual(doc.dmp.dataset[0].personal_data, 'yes');
  assert.strictEqual(doc.dmp.dataset[0].distribution[0].byte_size, 2 * 1024 ** 3);
  assert.strictEqual(doc.dmp.dataset[0].distribution[0].host.url, 'https://zenodo.org');
  assert.strictEqual(doc.dmp.dataset[0].distribution[0].license[0].license_ref, 'https://creativecommons.org/licenses/by/4.0/');
  assert.deepStrictEqual(doc.dmp.dataset[0].keyword, ['water', 'survey', 'india']);
  assert.strictEqual(doc.dmp.contact.contact_id.type, 'orcid');
  assert.strictEqual(doc.dmp.project[0].start, '2026-07-01');
});

test('maDMP export is valid even with no mappings and an empty plan', () => {
  const empty = { ...model, contact: { name: '', email: 'bad' }, sections: [] };
  assert.deepStrictEqual(std.validateMadmp(std.toMadmp(empty, {})).errors, []);
});

test('validator rejects a broken document', () => {
  const r = std.validateMadmp({ dmp: { title: 'x' } });
  assert.strictEqual(r.valid, false);
  assert.ok(r.errors.length > 0);
});

test('round trip: export then import restores every answer', () => {
  const back = std.fromMadmp(std.toMadmp(model, mappings), mappings);
  assert.strictEqual(back.project_title, 'Rural water survey');
  assert.strictEqual(back.notes, 'line1\nline2');
});

test('import from a foreign maDMP uses the mapping table', () => {
  const foreign = { dmp: { title: 'X', project: [{ title: 'Foreign project', start: '2025-01-01' }],
    dataset: [{ title: 'D', personal_data: 'no', sensitive_data: 'no', dataset_id: { identifier: 'x', type: 'other' }, keyword: ['a', 'b'] }] } };
  const back = std.fromMadmp(foreign, mappings);
  assert.strictEqual(back.project_title, 'Foreign project');
  assert.strictEqual(back.personal_data, 'no');
  assert.strictEqual(back.keywords, 'a, b');
  assert.throws(() => std.fromMadmp({ nope: 1 }, mappings));
});

test('HTML, Markdown, CSV and XML escape user text', () => {
  assert.ok(std.toHtml(model).includes('Notes &quot;quoted&quot;, &lt;b&gt;'));
  assert.ok(!std.toHtml(model).includes('<b>'));
  assert.ok(std.toMarkdown(model).includes('## 1. Data'));
  const csv = std.toCsv([model, model]);
  assert.strictEqual(csv.trim().split('\r\n').length, 1 + 16);
  assert.ok(csv.includes('"Notes ""quoted"", <b>"'));
  assert.ok(std.toXml(model).includes('&lt;b&gt;'));
});

test('DOCX is a valid zip with the required Word parts', async () => {
  const buf = await std.toDocx(model, { cover: true, coverTitle: 'Cover', footerText: 'Confidential' });
  assert.strictEqual(buf.slice(0, 2).toString(), 'PK');
  const s = buf.toString('latin1');
  ['[Content_Types].xml', 'word/document.xml', 'word/styles.xml', 'word/footer1.xml'].forEach((n) => assert.ok(s.includes(n), n));
});
