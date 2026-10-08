/* Phase 31 - searchable registry pickers (re3data, ROR, Crossref funders). */
(function () {
  function debounce(fn, ms) { var t; return function () { var a = arguments; clearTimeout(t); t = setTimeout(function () { fn.apply(null, a); }, ms); }; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  function search(source, q, projectId) {
    var u = '/registry/search?source=' + encodeURIComponent(source) + '&q=' + encodeURIComponent(q || '') + (projectId ? '&project_id=' + projectId : '');
    return fetch(u, { credentials: 'same-origin', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } }).then(function (r) { return r.json(); });
  }
  function detail(id) {
    return fetch('/registry/re3data/' + encodeURIComponent(id), { credentials: 'same-origin', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
      .then(function (r) { return r.json(); }).then(function (j) { return j.data; }).catch(function () { return null; });
  }
  function subtitle(item) {
    if (item.source === 'catalog') return 'Recommended by ' + item.recommended_by + (item.policy ? ' · ' + item.policy : '');
    if (item.source === 're3data') return 're3data ' + item.re3data;
    if (item.source === 'ror') return [item.city, item.country].filter(Boolean).join(', ') + ' · ROR ' + String(item.ror).replace('https://ror.org/', '');
    if (item.source === 'crossref') return (item.country || '') + ' · Funder ID 10.13039/' + item.funder_id;
    if (item.source === 'fairsharing') return [item.abbreviation, item.record_type, item.doi ? 'DOI ' + item.doi : ''].filter(Boolean).join(' · ');
    if (item.source === 'orcid_work') return [item.year, item.journal, item.doi ? 'DOI ' + item.doi : ''].filter(Boolean).join(' · ');
    if (item.source === 'preset') return 'Common choice';
    return '';
  }
  function renderList(box, groups, onPick) {
    box.innerHTML = '';
    groups.forEach(function (g) {
      if (!g.items || !g.items.length) return;
      box.appendChild(el('div', 'list-group-item small text-muted bg-light py-1', g.title));
      g.items.forEach(function (item) {
        var b = el('button', 'list-group-item list-group-item-action py-2'); b.type = 'button';
        var n = el('div', 'fw-semibold', item.name);
        if (item.source === 'catalog') { var badge = el('span', 'badge text-bg-success ms-1', 'Recommended'); n.appendChild(badge); }
        b.appendChild(n); b.appendChild(el('div', 'small text-muted', subtitle(item)));
        b.addEventListener('click', function () { onPick(item); });
        box.appendChild(b);
      });
    });
  }

  /* ---------------------------------------------------------------- form pickers */
  document.querySelectorAll('[data-registry]').forEach(function (wrap) {
    var source = wrap.getAttribute('data-registry');
    var projectId = wrap.getAttribute('data-project') || '';
    var hidden = wrap.querySelector('input[type=hidden]');
    var q = wrap.querySelector('[data-q]');
    var box = wrap.querySelector('[data-results]');
    var chip = wrap.querySelector('[data-selected]');
    var deposit = wrap.querySelector('[data-deposit]');
    var status = wrap.querySelector('[data-status]');
    var disabled = q && q.disabled;

    function current() { try { var v = JSON.parse(hidden.value || ''); return v && typeof v === 'object' ? v : null; } catch (e) { return hidden.value ? { name: hidden.value, source: 'manual' } : null; } }
    function write(v) {
      hidden.value = v ? JSON.stringify(v) : '';
      hidden.dispatchEvent(new Event('input', { bubbles: true }));
      hidden.dispatchEvent(new Event('change', { bubbles: true }));
      show();
    }
    function show() {
      var v = current(); chip.innerHTML = '';
      if (!v || !v.name) { chip.hidden = true; q.hidden = false; if (deposit) deposit.closest('[data-deposit-wrap]').hidden = true; return; }
      chip.hidden = false; q.hidden = true; box.innerHTML = '';
      var card = el('div', 'border rounded p-2 d-flex justify-content-between align-items-start gap-2 bg-light');
      var info = el('div'); info.appendChild(el('div', 'fw-semibold', v.name));
      var bits = [];
      if (v.re3data) bits.push('re3data ' + v.re3data);
      if (v.ror) bits.push('ROR ' + String(v.ror).replace('https://ror.org/', ''));
      if (v.funder_id) bits.push('Funder ID 10.13039/' + v.funder_id);
      if (v.abbreviation) bits.push(v.abbreviation);
      if (v.year) bits.push(v.year);
      if (v.doi && !v.re3data) bits.push('DOI ' + v.doi);
      if (v.certified_with && v.certified_with.length) bits.push('Certified: ' + v.certified_with.join(', '));
      if (v.source === 'manual') bits.push('typed by you');
      info.appendChild(el('div', 'small text-muted', bits.join(' · ')));
      if (v.url) { var a = el('a', 'small text-break', v.url); a.href = v.url; a.target = '_blank'; a.rel = 'noopener'; info.appendChild(a); }
      card.appendChild(info);
      if (!disabled) {
        var c = el('button', 'btn btn-outline-secondary btn-sm', 'Change'); c.type = 'button';
        c.addEventListener('click', function () { write(null); q.value = ''; q.focus(); load(''); });
        card.appendChild(c);
      }
      chip.appendChild(card);
      if (deposit) { deposit.closest('[data-deposit-wrap]').hidden = false; deposit.value = v.deposit_url || ''; }
    }
    function pick(item) {
      var v = { source: item.source === 'preset' ? 'manual' : item.source, name: item.name };
      ['re3data', 'url', 're3data_url', 'ror', 'country', 'funder_id', 'doi', 'catalog_id', 'abbreviation', 'fairsharing_id', 'year', 'journal', 'put_code'].forEach(function (k) { if (item[k]) v[k] = item[k]; });
      if (item.source === 'catalog') v.source = item.re3data ? 're3data' : 'catalog';
      write(v);
      if (source === 're3data' && v.re3data) {
        if (status) status.textContent = 'Fetching repository details…';
        detail(v.re3data).then(function (d) {
          if (status) status.textContent = '';
          if (!d) return;
          var cur = current() || v;
          cur.url = cur.url || d.url; cur.certified_with = d.certified_with; cur.pid_systems = d.pid_systems; cur.re3data_url = d.re3data_url;
          write(cur);
        });
      }
    }
    var load = debounce(function (text) {
      if (status) status.textContent = text.length >= 2 ? 'Searching…' : '';
      search(source, text, projectId).then(function (j) {
        if (status) status.textContent = j.error || '';
        var groups = [];
        if (j.catalog && j.catalog.length) groups.push({ title: 'Recommended', items: j.catalog });
        if (j.results && j.results.length) groups.push({ title: { re3data: 'From re3data (registry of research data repositories)', ror: 'From ROR (Research Organization Registry)', funders: 'From the Crossref Funder Registry', fairsharing: 'From FAIRsharing (standards)', works: 'Your ORCID publications' }[source], items: j.results });
        if (!text && j.presets && j.presets.length) groups.push({ title: 'Common choices', items: j.presets });
        if (text.length >= 2) groups.push({ title: 'Not listed?', items: [{ source: 'manual', name: text }] });
        renderList(box, groups, pick);
      }).catch(function () { if (status) status.textContent = 'Search unavailable - type the name and choose "Not listed?".'; });
    }, 300);
    if (q) {
      q.addEventListener('input', function () { load(q.value.trim()); });
      q.addEventListener('focus', function () { if (!box.children.length) load(q.value.trim()); });
      q.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });
    }
    if (deposit) deposit.addEventListener('change', function () { var v = current(); if (!v) return; var u = deposit.value.trim(); if (u) v.deposit_url = u; else delete v.deposit_url; write(v); });
    show();
  });

  /* ---------------------------------------------------------------- storage catalog: fill from re3data */
  document.querySelectorAll('[data-cat-search]').forEach(function (wrap) {
    var q = wrap.querySelector('[data-q]'); var box = wrap.querySelector('[data-results]');
    var form = wrap.parentElement.querySelector('form');
    var load = debounce(function () {
      if (q.value.trim().length < 2) { box.innerHTML = ''; return; }
      search('re3data', q.value.trim()).then(function (j) {
        renderList(box, [{ title: j.error || 'From re3data', items: j.results || [] }], function (item) {
          form.querySelector('[data-cat-name]').value = item.name;
          form.querySelector('[data-cat-re3]').value = item.re3data;
          box.innerHTML = ''; q.value = '';
          detail(item.re3data).then(function (d) { if (d && d.url) form.querySelector('[data-cat-url]').value = d.url; });
        });
      });
    }, 300);
    q.addEventListener('input', load);
  });

  /* ---------------------------------------------------------------- organization form: fill from ROR */
  document.querySelectorAll('[data-ror-fill]').forEach(function (wrap) {
    var q = wrap.querySelector('[data-q]'); var box = wrap.querySelector('[data-results]');
    var form = wrap.closest('form');
    var set = function (name, val) { var i = form.querySelector('[name="' + name + '"]'); if (i && val && !i.value) i.value = val; };
    var load = debounce(function () {
      if (q.value.trim().length < 2) { box.innerHTML = ''; return; }
      search('ror', q.value.trim()).then(function (j) {
        renderList(box, [{ title: j.error || 'From ROR', items: j.results || [] }], function (item) {
          form.querySelector('[name="ror_id"]').value = item.ror;
          var n = form.querySelector('[name="name"]'); if (n) n.value = item.name;
          set('country', item.country); set('city', item.city); set('website', item.url);
          box.innerHTML = ''; q.value = '';
          var shown = wrap.querySelector('[data-ror-shown]'); if (shown) shown.textContent = 'Linked to ' + item.ror;
        });
      });
    }, 300);
    q.addEventListener('input', load);
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });
  });
})();
