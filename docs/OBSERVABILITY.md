# Observability: health checks, structured logs, error tracking

## Health checks
| URL | Purpose | Touches DB |
|---|---|---|
| `GET /health/live` | Liveness: the process is up | No |
| `GET /health` | Readiness: database, storage folder, job queue | Yes |
| `GET /healthz` | Kept for older monitors (same as `/health/live`) | No |

`/health` returns `200` with `status: "ok"` or `"degraded"` (a non-critical check such as the job queue failed) and `503` with `status: "fail"` when the database or storage is unavailable. Responses include version, release, build, environment and uptime, never hostnames, credentials or error text. Health checks run before sessions and rate limits, so monitors don't create sessions.

## Structured logs
All app, worker and script logs are one JSON object per line: `time`, `level`, `msg`, `component`, and inside a request `requestId`, `userId` and `orgId`. Every request writes one `request` line (method, path without query string, status, durationMs). Static files and health checks are skipped unless they fail.

- Keys that look like secrets (`password`, `token`, `secret`, `authorization`, `cookie`, `apiKey`, `dsn`, …) become `[REDACTED]`. Bearer tokens and `dmp_…` API keys are cut, and e-mail addresses are masked (`j***@example.org`).
- Each response has an `X-Request-Id` header. A safe incoming `X-Request-Id` from the proxy is reused. The 500 page shows it as a support reference.
- In code: `const log = require('./services/logger').child('mail'); log.error('Send failed', { err });`

| Variable | Default | |
|---|---|---|
| `LOG_LEVEL` | `info` (`silent` when `NODE_ENV=test`) | `debug`, `info`, `warn`, `error`, `silent` |
| `LOG_FORMAT` | `json` in production, `pretty` otherwise | Use `json` for log collectors |

## Error tracking (Sentry, self-hosted Sentry or GlitchTip)
Leave `SENTRY_DSN` empty to switch error tracking off. Nothing is sent and nothing breaks. When it is set:
- **Server:** errors returning 500, unhandled promise rejections and crashes are sent with request ID, user ID, organisation ID, path and release.
- **Browser:** `public/js/error-reporter.js` is on every layout. It posts uncaught errors to `POST /errors/client` (max 5 per page, rate-limited, CSRF-protected). The server forwards them, so the DSN never reaches the browser and the Content Security Policy is unchanged.
- **Release tag:** `dmp-system@<package version>+<BUILD_SHA>`. Set `BUILD_SHA` (for example the git commit) at deploy time. The app ships unbundled JavaScript, so source maps are not needed: stack traces point at real files.
- No SDK dependency is used. The tracker uses the standard Sentry envelope API over HTTPS via built-in `fetch`.

| Variable | Default |
|---|---|
| `SENTRY_DSN` | empty (off) |
| `SENTRY_ENVIRONMENT` | `NODE_ENV` |
| `SENTRY_RELEASE` | `dmp-system@<version>[+BUILD_SHA]` |
| `SENTRY_SAMPLE_RATE` | `1` |
| `ERROR_TRACKING_BROWSER` | `true` |
| `BUILD_SHA` | empty |

### Check it works
1. `npm run error:test` sends one test error and prints the event id. It exits with 1 if the tracker is off or rejected the event.
2. Super Admin → Performance → **Send test error** throws a real request error. It appears in the tracker tagged with your request ID.
3. Browser: on any page, run `setTimeout(() => { throw new Error('test') })` in the console.
