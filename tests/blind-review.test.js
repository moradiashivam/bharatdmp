const test = require('node:test');
const assert = require('node:assert');
const zlib = require('zlib');
const b = require('../src/services/blind-review.service');

test('alias format', () => { assert.match(b.randomAlias(), /^APP-[A-HJ-NP-Z2-9]{4}$/); });

test('COI: institution word order, co-author, generic email ignored', () => {
  assert.deepStrictEqual(b.coiReasons({ institution: 'University of Oxford', email: 'a@gmail.com' }, { name: 'X Y', institution: 'Oxford University', email: 'b@gmail.com' }), ['Same institution']);
  assert.ok(b.coiReasons({ coauthors: 'Jane Smith\nBob Lee' }, { name: 'Dr. Jane Smith' }).includes('Listed co-author'));
  assert.ok(b.coiReasons({ email: 'r@uni.edu' }, { name: 'Q', email: 'z@uni.edu' })[0].startsWith('Same email domain'));
  assert.deepStrictEqual(b.coiReasons({ institution: 'MIT' }, { name: 'Q', institution: 'Stanford' }), []);
});

test('identifying text is flagged', () => {
  const kinds = b.identifyingFlags('Building on our previous work [Smith 2021] (Lee et al., 2019) — see me@x.org', ['Smith']).map((f) => f.kind);
  ['Self-reference', 'Named citation', 'Email address', 'Known name'].forEach((k) => assert.ok(kinds.includes(k), k));
  assert.deepStrictEqual(b.identifyingFlags('The data management section is clear.'), []);
});

test('blinded DTO drops identity fields and redacts names', () => {
  const dto = b.blindedPlan({ sections: [{ title: 'A', fields: [
    { label: 'PI name', type: 'short_text', value: 'Jane Smith' },
    { label: 'Contact', type: 'email', value: 'j@x.org' },
    { label: 'Affiliation', type: 'ror_affiliation', value: { name: 'Oxford' } },
    { label: 'Data description', type: 'long_text', value: 'Jane Smith will collect surveys at Oxford. Mail j@x.org' },
  ] }] }, ['Jane Smith', 'Oxford']);
  assert.strictEqual(dto.removed, 3);
  const text = JSON.stringify(dto);
  assert.ok(!/Jane|Smith|Oxford|j@x\.org/.test(text), text);
  assert.ok(text.includes('[redacted]'));
});

test('PDF metadata is blanked with identical length', () => {
  const pdf = '%PDF-1.4\n1 0 obj << /Author (John Doe) /Company (ACME \\(UK\\)) /Title <FEFF004A> >> endobj\n<?xpacket begin="x"?><dc:creator>John</dc:creator><?xpacket end="w"?>\n%%EOF';
  const r = b.stripPdfMetadata(Buffer.from(pdf, 'latin1'));
  const out = r.buffer.toString('latin1');
  assert.strictEqual(r.buffer.length, pdf.length);
  assert.ok(!/John|ACME|004A/.test(out), out);
  assert.strictEqual(r.removed, 4);
});

test('PDF text extraction finds self-references', () => {
  const content = zlib.deflateSync(Buffer.from('BT (In our previous work we) Tj [(Smith ) (2021)] TJ ET'));
  const pdf = Buffer.concat([Buffer.from('%PDF-1.4\n4 0 obj << /Length ' + content.length + ' /Filter /FlateDecode >>\nstream\n'), content, Buffer.from('\nendstream\nendobj\n')]);
  const text = b.pdfText(pdf);
  assert.ok(/our previous work/.test(text));
  assert.ok(b.identifyingFlags(text, ['Smith']).length >= 2);
});

test('turnaround and days left', () => {
  assert.strictEqual(b.turnaroundDays([{ assigned_at: '2026-01-01T00:00:00Z', completed_at: '2026-01-05T00:00:00Z' }, { assigned_at: '2026-01-01', completed_at: null }]), 4);
  assert.strictEqual(b.daysLeft('2026-01-10', new Date('2026-01-07T12:00:00Z')), 3);
  assert.strictEqual(b.daysLeft('2026-01-05', new Date('2026-01-07T12:00:00Z')), -2);
});
