#!/usr/bin/env node
/**
 * Stand-alone background job worker.
 *   npm run worker            - keeps running, processes jobs as they arrive
 *   npm run worker -- --once  - processes everything due, then exits (cron / Task Scheduler)
 * When you run this separately, set JOB_WORKER=off for the web app so jobs are
 * only handled here. Several workers may run at once; each job runs only once.
 */
require('dotenv').config();
require('../src/services/job-handlers');
const jobs = require('../src/services/job-queue.service');
const logger = require('../src/services/logger').child('worker');

const POLL_MS = Number(process.env.JOB_POLL_MS || 3000);
let stopping = false;
process.on('SIGINT', () => { stopping = true; });
process.on('SIGTERM', () => { stopping = true; });

(async () => {
  logger.info(`Job worker ${jobs.WORKER_ID} started${process.argv.includes('--once') ? ' (single run)' : ''}.`);
  for (;;) {
    let ran = 0;
    try { ran = await jobs.processBatch(20); } catch (err) { logger.error('Worker error', { error: err.message }); }
    if (ran) logger.info(`Processed ${ran} job(s)`);
    if (process.argv.includes('--once') && !ran) break;
    if (stopping) break;
    if (!ran) await new Promise((r) => setTimeout(r, POLL_MS));
  }
  logger.info('Job worker stopped.');
  process.exit(0);
})();
