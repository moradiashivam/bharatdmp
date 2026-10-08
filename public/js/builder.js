/* Phase 7 - form builder interactions: drag and drop, modals, option rows. */
(function () {
  var builder = document.getElementById('builder');
  if (!builder) return;
  var canEdit = builder.getAttribute('data-can-edit') === '1';
  var reorderUrl = builder.getAttribute('data-reorder-url');
  var statusEl = document.getElementById('reorderStatus');

  function setStatus(text, ok) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = 'badge align-self-center bg-' + (ok === false ? 'danger' : (ok ? 'success' : 'light')) +
      (ok ? ' text-white' : ' text-dark');
  }

  function persist() {
    var sections = [].slice.call(builder.querySelectorAll('.builder-section'))
      .map(function (el) { return el.getAttribute('data-section-id'); })
      .filter(function (id) { return id; });
    var fields = [];
    [].slice.call(builder.querySelectorAll('.field-list')).forEach(function (list) {
      var sectionId = list.getAttribute('data-section-id') || null;
      [].slice.call(list.querySelectorAll('.builder-field')).forEach(function (li) {
        fields.push({ id: li.getAttribute('data-field-id'), section_id: sectionId });
      });
    });
    setStatus('Saving order...');
    fetch(reorderUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') || {}).content || '',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ sections: sections, fields: fields })
    }).then(function (r) {
      setStatus(r.ok ? 'Order saved' : 'Could not save order', r.ok);
    }).catch(function () { setStatus('Could not save order', false); });
  }

  /* Drag and drop (falls back to the up/down buttons when unavailable). */
  if (canEdit && window.Sortable) {
    Sortable.create(builder, {
      handle: '.section-handle', draggable: '.builder-section', animation: 150, onEnd: persist
    });
    [].slice.call(builder.querySelectorAll('.field-list')).forEach(function (list) {
      Sortable.create(list, {
        group: 'fields', handle: '.drag-handle', draggable: '.builder-field', animation: 150, onEnd: persist
      });
    });
  }

  /* Section modal */
  var sectionModal = document.getElementById('sectionModal');
  if (sectionModal) {
    sectionModal.addEventListener('show.bs.modal', function (ev) {
      var btn = ev.relatedTarget;
      var raw = btn && btn.getAttribute('data-section');
      var s = raw ? JSON.parse(raw) : { id: '', title: '', description: '', instructions: '', status: 'active' };
      document.getElementById('sec-id').value = s.id || '';
      document.getElementById('sec-title').value = s.title || '';
      document.getElementById('sec-description').value = s.description || '';
      document.getElementById('sec-instructions').value = s.instructions || '';
      document.getElementById('sec-status').value = s.status || 'active';
    });
  }

  /* Field modal */
  var optionsWrap = document.getElementById('fld-options');
  function optionRow(label, value) {
    var row = document.createElement('div');
    row.className = 'input-group input-group-sm mb-2';
    row.innerHTML = '<input class="form-control" name="option_label" placeholder="Label">' +
      '<input class="form-control" name="option_value" placeholder="Value (optional)">' +
      '<button class="btn btn-outline-danger" type="button">&times;</button>';
    row.querySelectorAll('input')[0].value = label || '';
    row.querySelectorAll('input')[1].value = value || '';
    row.querySelector('button').addEventListener('click', function () { row.remove(); });
    optionsWrap.appendChild(row);
  }
  var addOption = document.getElementById('addOption');
  if (addOption) addOption.addEventListener('click', function () { optionRow('', ''); });

  function toggleOptionsVisibility() {
    var sel = document.getElementById('fld-type');
    var opt = sel.options[sel.selectedIndex];
    var has = opt && opt.getAttribute('data-has-options') === '1';
    document.getElementById('fld-options-wrap').classList.toggle('d-none', !has);
    if (has && !optionsWrap.children.length) { optionRow('', ''); }
  }

  var fieldModal = document.getElementById('fieldModal');
  if (fieldModal) {
    document.getElementById('fld-type').addEventListener('change', toggleOptionsVisibility);
    fieldModal.addEventListener('show.bs.modal', function (ev) {
      var btn = ev.relatedTarget;
      var raw = btn && btn.getAttribute('data-field');
      var f = raw ? JSON.parse(raw) : null;
      var isMaster = !!(f && f.source === 'master');
      document.getElementById('fieldModalTitle').textContent = f ? 'Edit field' : 'Add custom field';
      document.getElementById('fld-id').value = f ? f.id : '';
      document.getElementById('fld-label').value = f ? (f.field_label || '') : '';
      document.getElementById('fld-type').value = f ? f.field_type_id : document.getElementById('fld-type').options[0].value;
      document.getElementById('fld-section').value = f && f.section_id ? f.section_id : '';
      document.getElementById('fld-placeholder').value = f ? (f.placeholder || '') : '';
      document.getElementById('fld-help').value = f ? (f.help_text || '') : '';
      [['fld-guidance', 'guidance_text'], ['fld-guidance-example', 'guidance_example'], ['fld-guidance-links', 'guidance_links'], ['fld-prefill', 'prefill_source'], ['fld-word-min', 'word_min'], ['fld-word-max', 'word_max'], ['fld-min-value', 'min_value'], ['fld-max-value', 'max_value'], ['fld-date-min', 'date_min'], ['fld-date-max', 'date_max'], ['fld-regex', 'regex'], ['fld-regex-msg', 'regex_message']].forEach(function (pair) {
        var el = document.getElementById(pair[0]); if (el) el.value = f && f[pair[1]] !== null && f[pair[1]] !== undefined ? f[pair[1]] : '';
      });
      document.getElementById('fld-description').value = f ? (f.description || '') : '';
      document.getElementById('fld-default').value = f ? (f.default_value || '') : '';
      document.getElementById('fld-min').value = f && f.min_length != null ? f.min_length : '';
      document.getElementById('fld-max').value = f && f.max_length != null ? f.max_length : '';
      document.getElementById('fld-status').value = f ? f.status : 'active';
      document.getElementById('fld-required').checked = !!(f && Number(f.is_required));

      optionsWrap.innerHTML = '';
      if (f && f.options) { f.options.forEach(function (o) { optionRow(o.label, o.value); }); }

      document.getElementById('fld-master-note').classList.toggle('d-none', !isMaster);
      // Master fields can be renamed by the funder; their type and options stay fixed.
      ['fld-type', 'fld-description', 'fld-default', 'fld-min', 'fld-max'].forEach(function (id) {
        document.getElementById(id).disabled = isMaster;
      });
      document.getElementById('fld-label').disabled = false;
      document.getElementById('fld-options-wrap').classList.toggle('d-none', isMaster);
      if (!isMaster) toggleOptionsVisibility();
    });
  }

  /* Master field search */
  var search = document.getElementById('masterSearch');
  if (search) {
    search.addEventListener('input', function () {
      var q = search.value.toLowerCase();
      [].slice.call(document.querySelectorAll('#masterList .master-item')).forEach(function (el) {
        el.style.display = el.textContent.toLowerCase().indexOf(q) > -1 ? '' : 'none';
      });
    });
  }

  /* Master field selection counter */
  var masterList = document.getElementById('masterList');
  var masterCount = document.getElementById('masterCount');
  if (masterList && masterCount) {
    masterList.addEventListener('change', function () {
      masterCount.textContent = String(
        masterList.querySelectorAll('input[name="master_field_ids"]:checked').length
      );
    });
  }

  /* Master list scroll buttons: jump to the previous / next visible question. */
  function masterScrollStep(direction) {
    if (!masterList) return;
    var items = [].slice.call(masterList.querySelectorAll('.master-item'))
      .filter(function (el) { return el.style.display !== 'none'; });
    if (!items.length) return;
    var currentTop = masterList.scrollTop;
    var target = null;
    if (direction > 0) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].offsetTop > currentTop + 8) { target = items[i]; break; }
      }
      if (!target) target = items[items.length - 1];
    } else {
      for (var j = items.length - 1; j >= 0; j--) {
        if (items[j].offsetTop < currentTop - 8) { target = items[j]; break; }
      }
      if (!target) target = items[0];
    }
    masterList.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
  }
  var masterPrev = document.getElementById('masterPrev');
  var masterNext = document.getElementById('masterNext');
  if (masterPrev) masterPrev.addEventListener('click', function () { masterScrollStep(-1); });
  if (masterNext) masterNext.addEventListener('click', function () { masterScrollStep(1); });
}());
