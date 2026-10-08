# Sign-in and security (Phase 25)

## Super Admin: Sign-in & Security (sidebar)
- **ORCID / Google / Microsoft** – switch each one on and paste the Client ID and secret from the provider's developer console. Register the **Redirect URL** shown on the page with the provider; it must match your `APP_URL` exactly. Secrets are stored encrypted. Optional settings:
  - **Allowed email domains** limits sign-in to, for example, `uni.edu`.
  - **Let new researchers create an account** allows sign-up with that provider.
  - Use **ORCID sandbox** while testing.
- **Require two-step sign-in for** – tick roles such as Super Admin or Funder Admin. Those users must set up an authenticator app before they can do anything else. It is off for everyone by default.
- **Password policy** – minimum length, mixed case, number and symbol. This applies to registration, password reset and password changes.
- **Captcha** – shows the security code only after 2 failed sign-in attempts.

## Super Admin: per organisation
On a funder or institution edit page, the **Sign-in rules** card sets which methods that organisation's staff may use, and can require two-step sign-in for all its staff.

## Everyone: Account security (name menu > Account security)
- **Two-step sign-in** – scan the QR code with Google Authenticator, Microsoft Authenticator, Authy or similar, then enter the code. Save the 10 one-time recovery codes. You can create new codes or turn two-step sign-in off; turning it off needs a current code and is blocked when it is required.
- **Where you're signed in** – shows each device, IP address and last activity. You can sign out one session or all others.
- **Linked sign-in accounts** – link or remove ORCID, Google and Microsoft. Linking ORCID saves your ORCID iD, plus your current employer if your profile has none and your ORCID record is public.

## How researchers sign in with ORCID
1. On the Sign in or Register page, click **Sign in with ORCID**.
2. Existing accounts are found by a linked ORCID login, by the ORCID iD on the profile, or (Google) by a verified email address.
3. New researchers confirm their name and email (ORCID does not share email), accept the terms, and the account is created with the ORCID iD filled in.

## API
`POST /api/auth/login` also needs `"otp": "123456"` for users who have two-step sign-in on.

## Not included yet
- SAML / institutional single sign-on (P2)
- Magic-link sign-in for invited co-authors (P2)

## Upgrade
Run **SETUP.bat** once — it applies `db/phase25.sql`. Run `npm install` too, because one small package was added for the QR code.
