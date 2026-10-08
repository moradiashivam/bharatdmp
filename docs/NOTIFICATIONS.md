# Notifications and reminders (Phase 22)

## For everyone
- **Bell in the top bar** shows your unread count and the latest five alerts. Click one to open it (it is marked read).
- **Notifications page** (`/notifications`): filter by All / Unread / Read and by type, mark one or all as read.
- **Preferences** (`/notifications/preferences`, also in your name menu): for each event choose *Email + in-app*, *Email only*, *In-app only* or *Off*. Account-security emails (verification, password reset, password changed) are always sent.

## For funders and institutions
- **Deadline reminders**: in a project's settings, card *Deadline reminders*. Switch on and list the days before closing, e.g. `14,7,1`. Researchers whose plan is still a draft (or returned) get one alert per listed day. The closing date is the earlier of End date and Submission deadline.
- **Weekly digest**: every Monday reviewers receive new submissions, plans waiting for review and open calls.
- **Email templates**: the new events *Call closing soon*, *Plan status changed* and *Weekly digest* appear under Email & Notifications > Templates and can be edited per organisation.

## For the Super Admin
- **Email delivery log** now has a **Retry** button for failed or skipped emails, and shows the number of attempts.

## Events
plan submitted, reviewer comment, researcher reply, returned / approved / rejected, status changed, call closing soon, deadline reminder, weekly digest, plus account emails.

## Scheduler
The app checks hourly while it runs (first check 30 seconds after start). To use Windows Task Scheduler or cron instead, set `NOTIFY_SCHEDULER=off` in `.env` and run:

    npm run send-reminders      # deadline reminders
    npm run send-digest         # reminders + weekly digest

Each reminder and digest is recorded, so running more often never sends duplicates.

## Upgrade
Run **SETUP.bat** once — it applies `db/phase22.sql` safely.
