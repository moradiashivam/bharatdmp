#!/usr/bin/env node
/** Runs deadline reminders (and the weekly digest with --digest) once, for cron / Task Scheduler. */
require('dotenv').config();
const { runReminders, runWeeklyDigest } = require('../src/services/reminder.service');
const logger = require('../src/services/logger').child('reminders');

(async () => {
  try {
    const r = await runReminders();
    logger.info(`Deadline reminders sent: ${r.sent}`);
    if (process.argv.includes('--digest')) {
      const d = await runWeeklyDigest();
      logger.info(`Weekly digest (${d.week}) sent: ${d.sent}`);
    }
    // Emails are queued; send them now so this one-off run finishes the job.
    require('../src/services/job-handlers'); // eslint-disable-line global-require
    const jobs = require('../src/services/job-queue.service'); // eslint-disable-line global-require
    let n = 0; let ran;
    do { ran = await jobs.processBatch(50); n += ran; } while (ran > 0); // eslint-disable-line no-await-in-loop
    if (n) logger.info(`Queued jobs processed: ${n}`);
    process.exit(0);
  } catch (err) {
    logger.error('Reminder run failed', { error: err.message });
    process.exit(1);
  }
})();
