const test = require('node:test');
const assert = require('node:assert');
const { parseReminderDays, daysBetween, dueReminder, weekKey } = require('../src/services/reminder.service');
const { effectiveMode, EVENTS } = require('../src/services/notification.service');

test('parseReminderDays cleans, de-duplicates and sorts', () => {
  assert.deepStrictEqual(parseReminderDays('7, 14,1,x,-3,7'), [14, 7, 1]);
  assert.deepStrictEqual(parseReminderDays(''), []);
});

test('daysBetween counts whole days', () => {
  assert.strictEqual(daysBetween('2026-10-01', '2026-10-15'), 14);
});

test('dueReminder fires only on configured days of an open call', () => {
  const p = { status: 'active', reminders_enabled: 1, reminder_days: '14,7,1', start_date: '2026-01-01', submission_deadline: '2026-10-15' };
  assert.deepStrictEqual(dueReminder(p, '2026-10-08'), { daysLeft: 7, closesOn: '2026-10-15' });
  assert.strictEqual(dueReminder(p, '2026-10-09'), null);
  assert.strictEqual(dueReminder({ ...p, reminders_enabled: 0 }, '2026-10-08'), null);
  assert.strictEqual(dueReminder({ ...p, status: 'paused' }, '2026-10-08'), null);
});

test('preferences: mandatory account emails cannot be turned off', () => {
  assert.strictEqual(effectiveMode('password_reset', 'off'), 'both');
  assert.strictEqual(effectiveMode('reviewer_comment', 'off'), 'off');
  assert.strictEqual(effectiveMode('reviewer_comment', 'nonsense'), 'both');
  assert.ok(EVENTS.window_closing && EVENTS.status_changed && EVENTS.weekly_digest);
});

test('weekKey is ISO week', () => {
  assert.strictEqual(weekKey(new Date(2026, 9, 7)), '2026-W41');
});
