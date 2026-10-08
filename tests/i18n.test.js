// Run with: npm test   (uses Node's built-in test runner, no database needed)
const test = require('node:test');
const assert = require('node:assert');
const i18n = require('../src/services/i18n.service');

test('selected language wins when it has text', () => {
  assert.strictEqual(i18n.resolveText(['નમસ્તે', 'Hello', 'Hi'], 'greet.hello'), 'નમસ્તે');
});

test('empty or blank selected text falls back to default language', () => {
  assert.strictEqual(i18n.resolveText(['', 'Hello'], 'greet.hello'), 'Hello');
  assert.strictEqual(i18n.resolveText(['   ', null, 'Hello'], 'greet.hello'), 'Hello');
  assert.strictEqual(i18n.resolveText([undefined, undefined, 'Built-in'], 'greet.hello'), 'Built-in');
});

test('never returns empty or the raw key', () => {
  const out = i18n.resolveText([null, '', undefined], 'form.save_draft');
  assert.ok(out.trim().length > 0);
  assert.notStrictEqual(out, 'form.save_draft');
  assert.strictEqual(out, 'Save draft');
});

test('t() uses selected, then default, then built-in English', () => {
  const sel = new Map([['nav.dashboard', 'ડેશબોર્ડ']]);
  const def = new Map([['nav.funders', 'Funders (custom)']]);
  const t = i18n.makeT(sel, def);
  assert.strictEqual(t('nav.dashboard'), 'ડેશબોર્ડ');
  assert.strictEqual(t('nav.funders'), 'Funders (custom)');
  assert.strictEqual(t('nav.themes'), 'Themes');
  assert.strictEqual(t('researcher.welcome', { name: 'Asha' }), 'Welcome, Asha');
  assert.strictEqual(t('unknown.some_key'), 'Some key');
});

test('ISO 639-1 validation', () => {
  ['en', 'hi', 'gu', 'fr'].forEach((c) => assert.ok(i18n.isValidCode(c), c));
  ['xx', 'eng', '', 'g'].forEach((c) => assert.ok(!i18n.isValidCode(c), c));
});
