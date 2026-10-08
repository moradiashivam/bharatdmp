// Sidebar toggle for tablet/mobile
document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('appSidebar');
  var toggle = document.getElementById('sidebarToggle');
  var backdrop = document.getElementById('sidebarBackdrop');
  function close() { sidebar.classList.remove('show'); backdrop.classList.remove('show'); }
  if (toggle) {
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('show');
      backdrop.classList.toggle('show');
    });
  }
  if (backdrop) backdrop.addEventListener('click', close);

  // Confirm destructive actions
  document.querySelectorAll('form[data-confirm]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (!window.confirm(form.getAttribute('data-confirm'))) e.preventDefault();
    });
  });

  // Auto-slug from name
  var nameInput = document.querySelector('[data-slug-source]');
  var slugInput = document.querySelector('[data-slug-target]');
  if (nameInput && slugInput) {
    nameInput.addEventListener('blur', function () {
      if (!slugInput.value) {
        slugInput.value = nameInput.value.toLowerCase().trim()
          .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
    });
  }

  // Repeatable option rows (master field form)
  var optionsBox = document.getElementById('optionRows');
  var addOption = document.getElementById('addOption');
  if (optionsBox && addOption) {
    addOption.addEventListener('click', function () {
      var row = optionsBox.querySelector('.option-row').cloneNode(true);
      row.querySelectorAll('input').forEach(function (i) { i.value = ''; });
      optionsBox.appendChild(row);
    });
    optionsBox.addEventListener('click', function (e) {
      if (e.target.closest('.remove-option') && optionsBox.querySelectorAll('.option-row').length > 1) {
        e.target.closest('.option-row').remove();
      }
    });
  }
});

/* Phase 34 accessibility: scrollable tables can be reached and scrolled with the keyboard (WCAG 2.1.1). */
(function () {
  function mark() {
    document.querySelectorAll('.table-responsive').forEach(function (el) {
      if (el.scrollWidth > el.clientWidth + 1) {
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        if (!el.hasAttribute('role')) el.setAttribute('role', 'region');
        if (!el.hasAttribute('aria-label')) {
          var cap = el.querySelector('caption') || (el.closest('section, .card') || document).querySelector('h1, h2, h3, .card-header');
          el.setAttribute('aria-label', (cap ? cap.textContent.trim().slice(0, 80) + ' - ' : '') + 'scrollable table');
        }
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mark); else mark();
  window.addEventListener('resize', function () { clearTimeout(mark.t); mark.t = setTimeout(mark, 200); });
})();
