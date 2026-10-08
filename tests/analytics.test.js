const test = require('node:test');
const assert = require('node:assert');
const an = require('../src/services/analytics.service');

test('answers are normalised into value lists', () => {
  assert.deepStrictEqual(an.normalizeValues('["CSV","JSON"]'), ['CSV', 'JSON']);
  assert.deepStrictEqual(an.normalizeValues('{"name":"Zenodo","url":"https://zenodo.org"}'), ['Zenodo']);
  assert.deepStrictEqual(an.normalizeValues(['a', ['b']]), ['a', 'b']);
  assert.deepStrictEqual(an.normalizeValues('  '), []);
  assert.deepStrictEqual(an.normalizeValues(null), []);
});

test('open licence detection excludes non-commercial / no-derivatives', () => {
  ['CC-BY', 'CC BY 4.0', 'CC0', 'ODbL', 'MIT', 'cc-by-sa'].forEach((l) => assert.ok(an.isOpenLicence(l), l));
  ['CC-BY-NC', 'CC BY-ND 4.0', 'Proprietary', 'All rights reserved', ''].forEach((l) => assert.ok(!an.isOpenLicence(l), l));
});

test('storage answers convert to GB', () => {
  assert.strictEqual(an.toGb('2 TB'), 2048);
  assert.strictEqual(an.toGb('500'), 500);
  assert.strictEqual(an.toGb('{"value":2,"unit":"GB"}'), 2);
  assert.strictEqual(an.toGb('1,024 MB'), 1);
  assert.strictEqual(an.toGb('lots'), null);
  assert.deepStrictEqual(an.estimateCost(2048, { cost_per_tb_year: 100, retention_years: 10 }), { tb: 2, perYear: 200, lifetime: 2000 });
});

test('FAIR score: rules, principles and conditions', () => {
  const rules = [
    { id: 1, principle: 'F', field_name: 'keywords', condition_type: 'answered', points: 2 },
    { id: 2, principle: 'F', field_name: 'desc', condition_type: 'min_words', condition_value: '3', points: 2 },
    { id: 3, principle: 'A', field_name: 'repository', condition_type: 'one_of', condition_value: 'zenodo, dryad', points: 3 },
    { id: 4, principle: 'R', field_name: 'licence', condition_type: 'open_licence', points: 3 },
  ];
  const r = an.fairScore(rules, { keywords: 'water', desc: 'too short', repository: '{"name":"Zenodo"}', licence: 'CC-BY-NC' });
  assert.strictEqual(r.got, 2 + 3); // desc has only 2 words
  assert.strictEqual(r.max, 10);
  assert.strictEqual(r.score, 50);
  assert.deepStrictEqual(r.principles, { F: 50, A: 100, I: null, R: 0 });
  assert.strictEqual(an.fairScore([], {}).score, null);
  assert.ok(an.ruleMet({ condition_type: 'contains', condition_value: 'zen' }, 'Zenodo'));
  assert.ok(an.ruleMet({ condition_type: 'equals', condition_value: 'yes' }, 'Yes'));
});

test('distribution counts plans, not repeated values', () => {
  const d = an.distribution([['CC-BY', 'CC-BY'], ['CC0'], ['CC-BY'], []], 4);
  assert.deepStrictEqual(d, [{ value: 'CC-BY', count: 2, pct: 50 }, { value: 'CC0', count: 1, pct: 25 }]);
});

test('scope filters build parameterised SQL', () => {
  const s = an.scopeSql({ organizationId: 3, projectId: 9, from: '2026-01-01', to: '' });
  assert.strictEqual(s.sql, '1=1 AND p.organization_id = ? AND p.id = ? AND dr.created_at >= ?');
  assert.deepStrictEqual(s.params, [3, 9, '2026-01-01 00:00:00']);
});
