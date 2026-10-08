/* Phase 32 - AI helpers on the plan form: draft suggestions and translation. Nothing is applied without a click. */
(function () {
  var token = (document.querySelector('meta[name="csrf-token"]') || {}).content || '';
  function post(url, body) {
    return fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-Token': token }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return { success: false, message: 'Unexpected answer from the server.' }; }); });
  }
  function setValue(el, text) {
    if (!el) return;
    el.value = text;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    if (window.tinymce && tinymce.get && tinymce.get(el.id)) tinymce.get(el.id).setContent(text.replace(/\n/g, '<br>'));
  }
  document.querySelectorAll('[data-ai-suggest]').forEach(function (w) {
    var go = w.querySelector('[data-ai-go]'), box = w.querySelector('[data-ai-box]'), out = w.querySelector('[data-ai-text]'), st = w.querySelector('[data-ai-status]');
    var target = document.getElementById(w.getAttribute('data-target'));
    go.addEventListener('click', function () {
      go.disabled = true; st.textContent = 'Writing a suggestion…'; box.hidden = true;
      post('/researcher/dmp/' + w.getAttribute('data-plan') + '/ai/suggest', { field_id: w.getAttribute('data-field') }).then(function (j) {
        go.disabled = false;
        if (!j.success) { st.textContent = j.message || 'No suggestion available.'; return; }
        st.textContent = ''; out.textContent = j.text; box.hidden = false;
      }).catch(function () { go.disabled = false; st.textContent = 'Could not reach the server.'; });
    });
    w.querySelector('[data-ai-use]').addEventListener('click', function () {
      if (target && target.value.trim() && !confirm('Replace your current answer with this suggestion?')) return;
      setValue(target, out.textContent); box.hidden = true; st.textContent = 'Suggestion inserted - please review and edit it.';
    });
    w.querySelector('[data-ai-discard]').addEventListener('click', function () { box.hidden = true; st.textContent = ''; });
  });
  document.querySelectorAll('[data-ai-translate]').forEach(function (w) {
    var go = w.querySelector('[data-ai-go]'), st = w.querySelector('[data-ai-status]');
    go.addEventListener('click', function () {
      var src = document.getElementById(w.getAttribute('data-source')), target = document.getElementById(w.getAttribute('data-target'));
      if (target.value.trim() && !confirm('Replace the text already in this language?')) return;
      go.disabled = true; st.textContent = 'Translating…';
      post('/researcher/dmp/' + w.getAttribute('data-plan') + '/ai/translate', { text: src ? src.value : '', lang_id: w.getAttribute('data-lang') }).then(function (j) {
        go.disabled = false;
        if (!j.success) { st.textContent = j.message; return; }
        setValue(target, j.text); st.textContent = 'Machine translation inserted - a person must check it.';
      }).catch(function () { go.disabled = false; st.textContent = 'Could not reach the server.'; });
    });
  });
  /* Reviewer summary on the submission page */
  document.querySelectorAll('[data-ai-summary]').forEach(function (w) {
    var go = w.querySelector('[data-ai-go]'), st = w.querySelector('[data-ai-status]'), out = w.querySelector('[data-ai-text]');
    go.addEventListener('click', function () {
      go.disabled = true; st.textContent = 'Summarising the plan…';
      post(w.getAttribute('data-url'), {}).then(function (j) {
        go.disabled = false;
        if (!j.success) { st.textContent = j.message; return; }
        st.textContent = 'AI summary - advisory only. Always read the full plan before deciding.'; out.textContent = j.text; out.hidden = false;
      }).catch(function () { go.disabled = false; st.textContent = 'Could not reach the server.'; });
    });
  });
})();
