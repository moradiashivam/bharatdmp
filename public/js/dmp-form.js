document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('dmpForm');
  if (!form || !form.dataset.autosaveUrl) return;
  var status = document.getElementById('saveStatus');
  var timer;
  var saving = false;

  function save() {
    if (saving) return;
    saving = true;
    status.textContent = 'Saving…';
    fetch(form.dataset.autosaveUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') || {}).content || '',
      },
      credentials: 'same-origin',
      body: new FormData(form),
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) {
        if (!response.ok) throw new Error(body.message || 'Could not save. Use Save draft.');
        return body;
      });
    }).then(function () {
      status.textContent = 'Last saved just now';
    }).catch(function (err) {
      status.textContent = err.message || 'Could not save. Use Save draft.';
    }).finally(function () { saving = false; });
  }

  form.addEventListener('input', function () {
    window.clearTimeout(timer);
    status.textContent = 'Unsaved changes';
    timer = window.setTimeout(save, 1200);
  });
  form.addEventListener('change', function () {
    window.clearTimeout(timer);
    timer = window.setTimeout(save, 300);
  });
});
// Phase 26: local draft recovery - keeps typed text in the browser until the server confirms a save.
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('dmpForm');
  if (!form || !form.dataset.draftKey || !window.localStorage) return;
  var key = form.dataset.draftKey;
  var status = document.getElementById('saveStatus');
  function textInputs() { return form.querySelectorAll('input[type=text],input[type=email],input[type=url],input[type=tel],input[type=number],textarea'); }
  try {
    var saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && saved.values) {
      var restored = 0;
      textInputs().forEach(function (el) {
        if (el.name && Object.prototype.hasOwnProperty.call(saved.values, el.name) && el.value !== saved.values[el.name] && !el.disabled) { el.value = saved.values[el.name]; restored += 1; }
      });
      if (restored && status) { status.textContent = 'Unsaved changes from your last visit were restored.'; form.dispatchEvent(new Event('input', { bubbles: true })); }
    }
  } catch (e) { /* ignore */ }
  form.addEventListener('input', function () {
    var values = {};
    textInputs().forEach(function (el) { if (el.name) values[el.name] = el.value; });
    try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), values: values })); } catch (e) { /* full */ }
  });
  // Clear once the server reports a successful save.
  if (status) new MutationObserver(function () { if (/just now/i.test(status.textContent)) { try { localStorage.removeItem(key); } catch (e) {} } }).observe(status, { childList: true, characterData: true, subtree: true });
  form.addEventListener('submit', function () { try { localStorage.removeItem(key); } catch (e) {} });
});

// Phase 27: word/character counters and storage-size inputs.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-counter-for]').forEach(function (box) {
    var input = document.getElementById(box.getAttribute('data-counter-for'));
    if (!input) return;
    var n = function (k) { var v = box.getAttribute(k); return v ? Number(v) : null; };
    function update() {
      var text = input.value.trim();
      var words = text ? text.split(/\s+/).length : 0;
      var chars = input.value.length;
      var parts = [];
      var bad = false;
      if (n('data-word-max') || n('data-word-min')) {
        parts.push(words + (n('data-word-max') ? ' / ' + n('data-word-max') : '') + ' words');
        if ((n('data-word-max') && words > n('data-word-max')) || (n('data-word-min') && text && words < n('data-word-min'))) bad = true;
      }
      if (n('data-char-max') || n('data-char-min')) {
        parts.push(chars + (n('data-char-max') ? ' / ' + n('data-char-max') : '') + ' characters');
        if ((n('data-char-max') && chars > n('data-char-max')) || (n('data-char-min') && text && chars < n('data-char-min'))) bad = true;
      }
      box.textContent = parts.join(' · ');
      box.classList.toggle('text-danger', bad);
      box.classList.toggle('fw-semibold', bad);
    }
    input.addEventListener('input', update);
    update();
  });
  document.querySelectorAll('[data-storage]').forEach(function (wrap) {
    var num = wrap.querySelector('[data-storage-num]');
    var unit = wrap.querySelector('[data-storage-unit]');
    var hidden = wrap.querySelector('input[type=hidden]');
    function sync() {
      hidden.value = num.value === '' ? '' : num.value + ' ' + unit.value;
      hidden.dispatchEvent(new Event('change', { bubbles: true }));
    }
    num.addEventListener('input', sync);
    unit.addEventListener('change', function (e) { e.stopPropagation(); sync(); });
  });
});
