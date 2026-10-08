const test = require('node:test');
const assert = require('node:assert');
const totp = require('../src/services/totp.service');
const sec = require('../src/services/security-settings.service');
const oauth = require('../src/services/oauth.service');
const { methodAllowed, safeRedirect } = require('../src/services/signin.service');
const box = require('../src/services/crypto-box');

test('TOTP matches the RFC 6238 test vector', () => {
  const secret = totp.base32Encode(Buffer.from('12345678901234567890'));
  assert.strictEqual(totp.hotp(secret, Math.floor(59 / 30)).slice(-6), '287082');
  assert.strictEqual(totp.verify(secret, '287082', 59 * 1000), true);
  assert.strictEqual(totp.verify(secret, '000000', 59 * 1000), false);
  assert.strictEqual(totp.verify(secret, totp.totp(secret, 1000000 - 30000), 1000000), true); // one step of drift
});

test('base32 round trip and recovery codes', () => {
  const s = totp.generateSecret();
  assert.strictEqual(totp.base32Encode(totp.base32Decode(s)), s);
  const codes = totp.recoveryCodes();
  assert.strictEqual(new Set(codes).size, 10);
  assert.match(codes[0], /^[a-z2-9]{4}-[a-z2-9]{4}$/);
  assert.strictEqual(totp.hashCode(' ABCD-efgh '), totp.hashCode('abcd-efgh'));
});

test('password policy', () => {
  const policy = { minLength: 10, mixedCase: true, number: true, symbol: true };
  assert.strictEqual(sec.checkPassword('Abcdefgh1!', policy).length, 0);
  assert.deepStrictEqual(sec.checkPassword('abc', policy), ['at least 10 characters', 'upper- and lower-case letters', 'a number', 'a symbol']);
});

test('2FA requirement by role or organisation', () => {
  assert.strictEqual(sec.needs2fa({ role_code: 'funder_admin' }, ['funder_admin']), true);
  assert.strictEqual(sec.needs2fa({ role_code: 'researcher', org_require_2fa: 1 }, []), true);
  assert.strictEqual(sec.needs2fa({ role_code: 'researcher' }, ['super_admin']), false);
});

test('provider identity parsing and domain rules', () => {
  const idTok = (claims) => `x.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.y`;
  assert.deepStrictEqual(oauth.identityFrom('orcid', { orcid: '0000-0002-1825-0097', name: 'Josiah' }).subject, '0000-0002-1825-0097');
  const g = oauth.identityFrom('google', { id_token: idTok({ sub: '42', email: 'a@uni.edu', email_verified: true }) });
  assert.strictEqual(g.emailVerified, true);
  const m = oauth.identityFrom('microsoft', { id_token: idTok({ oid: 'abc', preferred_username: 'b@lab.org' }) });
  assert.strictEqual(m.subject, 'abc'); assert.strictEqual(m.emailVerified, false);
  assert.strictEqual(oauth.domainAllowed('x@dept.uni.edu', 'uni.edu'), true);
  assert.strictEqual(oauth.domainAllowed('x@evil.com', 'uni.edu, lab.org'), false);
  assert.strictEqual(oauth.domainAllowed('x@any.com', ''), true);
});

test('organisation sign-in methods and safe redirects', () => {
  assert.strictEqual(methodAllowed({ organization_id: 1, org_login_methods: 'password,orcid' }, 'google'), false);
  assert.strictEqual(methodAllowed({ organization_id: null }, 'google'), true);
  assert.strictEqual(safeRedirect('//evil.com'), '');
  assert.strictEqual(safeRedirect('/researcher/dashboard'), '/researcher/dashboard');
});

test('secrets are encrypted at rest', () => {
  const sealed = box.seal('top-secret');
  assert.ok(sealed.startsWith('v1:') && !sealed.includes('top-secret'));
  assert.strictEqual(box.open(sealed), 'top-secret');
});
