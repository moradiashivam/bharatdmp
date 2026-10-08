// Refreshes the security code image without reloading the page.
(function () {
  function bind(root) {
    root.querySelectorAll('[data-captcha-refresh]').forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () {
        var wrap = btn.closest('.mb-3') || document;
        var img = wrap.querySelector('[data-captcha-image]');
        if (img) img.src = '/captcha.svg?ts=' + Date.now();
        var input = wrap.querySelector('input[name="captcha"]');
        if (input) { input.value = ''; input.focus(); }
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { bind(document); });
  } else {
    bind(document);
  }
})();
