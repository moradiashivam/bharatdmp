/* Browser error reporting. Sends uncaught errors to /errors/client, which forwards
 * them to the error tracker when one is configured. The tracker key never reaches the browser.
 * At most 5 reports per page view; duplicates are skipped. */
(function () {
  'use strict';
  var sent = 0, seen = {};
  var meta = document.querySelector('meta[name="csrf-token"]');
  function report(message, stack, source) {
    try {
      var key = String(message).slice(0, 200);
      if (sent >= 5 || seen[key]) return;
      seen[key] = 1; sent += 1;
      var body = JSON.stringify({
        message: String(message || 'Unknown error').slice(0, 500),
        stack: String(stack || '').slice(0, 4000),
        source: String(source || '').slice(0, 300),
        page: location.pathname
      });
      var headers = { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
      if (meta) headers['X-CSRF-Token'] = meta.getAttribute('content');
      fetch('/errors/client', { method: 'POST', headers: headers, body: body, credentials: 'same-origin', keepalive: true }).catch(function () {});
    } catch (e) { /* never break the page */ }
  }
  window.addEventListener('error', function (e) {
    if (!e.error && !e.message) return; // resource load errors
    report(e.message, e.error && e.error.stack, e.filename);
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason || {};
    report(r.message || String(r), r.stack, 'unhandledrejection');
  });
  window.dmpReportError = function (err) { report(err && err.message || String(err), err && err.stack, 'manual'); };
})();
