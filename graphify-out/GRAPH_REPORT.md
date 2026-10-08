# Project connection report

Generated: 2026-10-08T03:38:31.956Z

- Files scanned: **293**
- Connections found: **715** (713 confirmed, 2 unresolved)

## Files by kind

- view: 131
- service: 44
- controller: 41
- database: 20
- table: 17
- route: 16
- test: 14
- support: 8
- other: 8
- browser script: 8
- middleware: 7

## Most connected files

| File | Kind | Used by | Uses |
| --- | --- | --- | --- |
| `src/config/database.js` | support | 75 | 3 |
| `src/app.js` | other | 0 | 43 |
| `src/services/audit.service.js` | service | 38 | 2 |
| `src/controllers/dmp-response.controller.js` | controller | 7 | 24 |
| `src/routes/admin.routes.js` | route | 1 | 28 |
| `src/services/logger.js` | service | 22 | 2 |
| `src/middleware/error.js` | middleware | 22 | 2 |
| `src/controllers/standards.controller.js` | controller | 9 | 15 |
| `src/services/notification.service.js` | service | 18 | 5 |
| `src/config/env.js` | support | 20 | 0 |
| `src/controllers/auth.controller.js` | controller | 2 | 17 |
| `src/controllers/identity.controller.js` | controller | 4 | 14 |
| `src/routes/funder.routes.js` | route | 1 | 17 |
| `src/routes/institution.routes.js` | route | 1 | 17 |
| `src/controllers/ai.controller.js` | controller | 5 | 11 |
| `src/middleware/auth.js` | middleware | 13 | 2 |
| `src/controllers/reviewer-portal.controller.js` | controller | 1 | 14 |
| `src/routes/public.routes.js` | route | 1 | 13 |
| `src/controllers/masterField.controller.js` | controller | 1 | 13 |
| `db/schema.sql` | database | 0 | 13 |

## Unresolved references (INFERRED)

- `views/admin/master-fields/bulk.ejs` includes `views/../../../public/samples/master-fields-sample.json.ejs` - target not found on disk
- `views/admin/master-fields/domain-links.ejs` includes `views/../../../public/samples/domain-links-sample.json.ejs` - target not found on disk

## Files nothing links to

- `db/phase16.sql`
- `db/phase19.sql`
- `db/phase26.sql`
- `db/phase28.sql`
- `db/phase30.sql`
- `db/phase34.sql`
- `db/repair-password-library.js`
- `db/seed.js`
- `db/setup.js`
- `ecosystem.config.js`
- `views/admin/reports.ejs`
- `views/errors/403.ejs`
- `views/errors/404.ejs`
- `views/errors/500.ejs`
- `views/funder/reports.ejs`
- `views/public/unavailable.ejs`
