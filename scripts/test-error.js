/**
 * Sends one deliberate test error to the error tracker and prints the result.
 *   npm run error:test
 * Exits 1 when SENTRY_DSN is missing or the tracker did not accept the event.
 */
require('dotenv').config();
const tracker = require('../src/services/error-tracker');
const logger = require('../src/services/logger').child('error-test');

(async () => {
  if (!tracker.enabled()) {
    logger.warn('SENTRY_DSN is not set (or invalid) — error tracking is off. Nothing was sent.');
    process.exit(1);
  }
  const err = new Error('Deliberate test error from npm run error:test');
  err.name = 'DmpTestError';
  const id = await tracker.capture(err, { tags: { test: 'true' } });
  if (!id) { logger.error('The error tracker did not accept the test event. Check SENTRY_DSN and network access.'); process.exit(1); }
  logger.info('Test error sent', { eventId: id, release: tracker.release() });
})();
