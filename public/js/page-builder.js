/**
 * Page builder helper for /admin/pages/:id/edit
 * - live preview of the HTML + CSS + JS boxes inside a sandboxed iframe
 * - ready-made design blocks the owner can insert and then edit
 */
(function () {
  var html = document.getElementById('pageHtml');
  var css = document.getElementById('pageCss');
  var js = document.getElementById('pageJs');
  var frame = document.getElementById('pagePreview');
  if (!html || !frame) return;

  var SNIPPETS = {
    hero:
      '<section class="pb-hero">\n' +
      '  <div class="container">\n' +
      '    <h2 class="pb-hero-title">A clear, confident headline</h2>\n' +
      '    <p class="pb-hero-text">One or two sentences explaining what this page is about.</p>\n' +
      '    <a class="btn btn-light btn-lg" href="/register">Get started</a>\n' +
      '  </div>\n' +
      '</section>\n',
    cards:
      '<section class="container py-5">\n' +
      '  <div class="row g-4">\n' +
      '    <div class="col-md-4"><div class="pb-card"><i class="bi bi-lightbulb"></i><h3>First point</h3><p>Short supporting sentence.</p></div></div>\n' +
      '    <div class="col-md-4"><div class="pb-card"><i class="bi bi-shield-check"></i><h3>Second point</h3><p>Short supporting sentence.</p></div></div>\n' +
      '    <div class="col-md-4"><div class="pb-card"><i class="bi bi-graph-up"></i><h3>Third point</h3><p>Short supporting sentence.</p></div></div>\n' +
      '  </div>\n' +
      '</section>\n',
    steps:
      '<section class="container py-5">\n' +
      '  <div class="row g-4">\n' +
      '    <div class="col-md-4"><div class="pb-step"><span>1</span><h3>Register</h3><p>Create your account.</p></div></div>\n' +
      '    <div class="col-md-4"><div class="pb-step"><span>2</span><h3>Fill the plan</h3><p>Answer each section.</p></div></div>\n' +
      '    <div class="col-md-4"><div class="pb-step"><span>3</span><h3>Submit</h3><p>Download the PDF.</p></div></div>\n' +
      '  </div>\n' +
      '</section>\n',
    cta:
      '<section class="pb-cta">\n' +
      '  <div class="container">\n' +
      '    <h2>Ready to begin?</h2>\n' +
      '    <p>Create a researcher account in under a minute.</p>\n' +
      '    <a class="btn btn-light btn-lg" href="/register">Register now</a>\n' +
      '  </div>\n' +
      '</section>\n',
    accordion:
      '<section class="container py-5">\n' +
      '  <div class="accordion" id="pbFaq">\n' +
      '    <div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button" data-bs-toggle="collapse" data-bs-target="#pbq1">Who can use this system?</button></h3>\n' +
      '      <div id="pbq1" class="accordion-collapse collapse show" data-bs-parent="#pbFaq"><div class="accordion-body">Any researcher applying to a participating funder or institution.</div></div></div>\n' +
      '    <div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#pbq2">Is there a fee?</button></h3>\n' +
      '      <div id="pbq2" class="accordion-collapse collapse" data-bs-parent="#pbFaq"><div class="accordion-body">No, the platform is free for researchers.</div></div></div>\n' +
      '  </div>\n' +
      '</section>\n',
  };

  var STARTER_CSS = {
    hero: '.pb-hero{padding:4rem 0;background:var(--brand-primary);color:#fff;text-align:center}\n.pb-hero-title{font-weight:700}\n.pb-hero-text{opacity:.85;max-width:38em;margin:0 auto 1.5rem}\n',
    cards: '.pb-card{background:#fff;border:1px solid #e7ecf3;border-radius:14px;padding:1.5rem;height:100%}\n.pb-card i{font-size:1.8rem;color:var(--brand-secondary)}\n.pb-card h3{font-size:1.05rem;margin:.75rem 0 .5rem}\n',
    steps: '.pb-step{background:#fff;border:1px solid #e7ecf3;border-radius:14px;padding:1.5rem;height:100%}\n.pb-step span{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:var(--brand-primary);color:#fff;font-weight:700}\n.pb-step h3{font-size:1.05rem;margin:.75rem 0 .5rem}\n',
    cta: '.pb-cta{padding:3.5rem 0;text-align:center;color:#fff;background:linear-gradient(135deg,var(--brand-primary),var(--brand-secondary))}\n',
    accordion: '',
  };

  function insert(area, text) {
    var start = area.selectionStart || area.value.length;
    area.value = area.value.slice(0, start) + text + area.value.slice(start);
    area.dispatchEvent(new Event('input'));
  }

  document.querySelectorAll('[data-snippet]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-snippet');
      insert(html, SNIPPETS[key] || '');
      var extra = STARTER_CSS[key];
      if (extra && css && css.value.indexOf(extra.split('{')[0]) === -1) {
        css.value = (css.value ? css.value.replace(/\s*$/, '\n\n') : '') + extra;
      }
    });
  });

  function render() {
    var theme = getComputedStyle(document.documentElement);
    var primary = theme.getPropertyValue('--brand-primary') || '#1B3A6B';
    var secondary = theme.getPropertyValue('--brand-secondary') || '#2E7D6F';
    var doc =
      '<!doctype html><html><head><meta charset="utf-8">' +
      '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">' +
      '<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">' +
      '<style>:root{--brand-primary:' + primary + ';--brand-secondary:' + secondary + '}body{margin:0}' +
      (css ? css.value : '') + '</style></head><body>' +
      html.value +
      '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"><\/script>' +
      '<script>try{' + (js ? js.value : '') + '}catch(e){console.error(e)}<\/script>' +
      '</body></html>';
    frame.srcdoc = doc;
  }

  var timer;
  [html, css, js].forEach(function (el) {
    if (!el) return;
    el.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(render, 500);
    });
  });
  var tab = document.getElementById('previewTab');
  if (tab) tab.addEventListener('shown.bs.tab', render);
  var refresh = document.getElementById('refreshPreview');
  if (refresh) refresh.addEventListener('click', render);
  render();
})();
