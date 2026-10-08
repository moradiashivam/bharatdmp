# Public API and Webhooks (Phase 29)

Lets other systems (university CRIS, grant-management, repositories) read DMP data and react to events.

## Where to manage it
Sidebar → **API & Webhooks**
- Super Admin: `/admin/developer` — platform keys (see all organizations) or keys for one organization.
- Funder / Institution admin: `/funder/developer`, `/institution/developer` — own organization only. Reviewers can view but not change.

Public documentation: `/api/docs` · OpenAPI 3: `/api/v1/openapi.json`

## API keys
- Format `dmp_<12 hex>_<secret>`; only a SHA-256 hash is stored. The full key is shown once.
- Scopes: `projects:read`, `plans:read`, `submissions:read`, `submissions:write`, `reference:read`.
- Per-key requests-per-minute limit (429 when exceeded), optional expiry, instant revoke, last-used time/IP and request count.
- Send as `Authorization: Bearer <key>` or `X-API-Key: <key>`.

## Endpoints (`/api/v1`)
| Method | Path | Scope |
|---|---|---|
| GET | /me | – |
| GET | /projects, /projects/{id} | projects:read |
| GET | /plans, /plans/{id} | plans:read |
| GET | /submissions, /submissions/{id} | submissions:read |
| PATCH | /submissions/{id}/status `{status, remarks}` | submissions:write |
| GET | /domains, /field-types | reference:read |
| GET | /webhook-events | – |

Lists: `page`, `limit` (≤100) and filters (`status`, `project_id`, `updated_since`). Status changes via API are written to the audit log and fire webhooks.

## Webhooks
- Events: `dmp.started`, `dmp.submitted`, `dmp.returned`, `dmp.approved`, `dmp.rejected`, `dmp.status_changed`, `review.assigned`, `review.overdue`, `project.window_closing`, `ping`.
- Raised automatically from the existing notification events (de-duplicated per event), plus API status changes.
- Signed: `X-DMP-Signature: t=<unix>,v1=HMAC-SHA256(secret, "<t>.<body>")`. Secrets are encrypted at rest and can be rotated.
- Retries: 1 min, 5 min, 30 min, 2 h, 12 h (6 attempts total) by a background worker started with the app (`WEBHOOK_WORKER=off` disables it).
- Delivery log with payload, response, manual "Retry now" and "Send test".
- Emails, tokens and links are stripped from payloads. Private/localhost addresses are refused unless `WEBHOOK_ALLOW_PRIVATE=true` (useful for local testing).

## Database
`db/phase29.sql` (run automatically by SETUP.bat): `api_keys`, `webhooks`, `webhook_deliveries`.
