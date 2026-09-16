(function () {
  var root = document.documentElement;
  var body = document.body;
  var themeButtons = document.querySelectorAll('[data-theme-toggle]');
  var savedTheme = localStorage.getItem('dware-theme');

  if (savedTheme === 'dark' || savedTheme === 'light') {
    root.setAttribute('data-theme', savedTheme);
  }

  function updateThemeLabels() {
    var isDark = root.getAttribute('data-theme') === 'dark';
    themeButtons.forEach(function (button) {
      button.textContent = isDark ? 'Light' : 'Dark';
      button.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  themeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', nextTheme);
      localStorage.setItem('dware-theme', nextTheme);
      updateThemeLabels();
    });
  });

  updateThemeLabels();

  // Mobile navigation
  var menu = document.querySelector('.mobile-menu');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var menuClose = document.querySelector('[data-menu-close]');
  var lastMenuFocus = null;

  function openMenu() {
    if (!menu) return;
    lastMenuFocus = document.activeElement;
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    body.classList.add('menu-open');
    menuClose.focus();
  }

  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
    if (lastMenuFocus) lastMenuFocus.focus();
  }

  if (menuToggle && menuClose && menu) {
    menuToggle.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);

    menu.addEventListener('click', function (event) {
      if (event.target === menu) closeMenu();
    });

    menu.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  // Project expansion
  document.querySelectorAll('.project-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = document.getElementById(button.getAttribute('aria-controls'));
      var willOpen = button.getAttribute('aria-expanded') !== 'true';

      button.setAttribute('aria-expanded', String(willOpen));
      panel.hidden = !willOpen;
    });
  });

  // Resume dialog
  var resumeDialog = document.querySelector('.resume-dialog');
  var resumeOpeners = document.querySelectorAll('[data-resume-open]');
  var activeResumeOpener = null;

  function closeResume() {
    if (resumeDialog && resumeDialog.open) resumeDialog.close();
  }

  if (resumeDialog) {
    resumeOpeners.forEach(function (opener) {
      opener.addEventListener('click', function () {
        if (menu && menu.classList.contains('open')) closeMenu();
        activeResumeOpener = opener;
        resumeDialog.showModal();
        body.classList.add('menu-open');
      });
    });

    resumeDialog.querySelectorAll('[data-resume-close]').forEach(function (button) {
      button.addEventListener('click', closeResume);
    });

    resumeDialog.addEventListener('click', function (event) {
      if (event.target === resumeDialog) closeResume();
    });

    resumeDialog.addEventListener('close', function () {
      body.classList.remove('menu-open');
      if (activeResumeOpener) activeResumeOpener.focus();
    });
  }

  // Scroll spy
  var sections = Array.from(document.querySelectorAll('.page-section'));
  var sectionLinks = document.querySelectorAll('[data-section-link]');
  var nextLink = document.querySelector('[data-next-section]');
  var activeSectionId = 'home';
  var ticking = false;

  function setActiveSection(id) {
    if (!id || id === activeSectionId && document.querySelector('.rail-link.current')) return;
    activeSectionId = id;

    sectionLinks.forEach(function (link) {
      var isCurrent = link.getAttribute('data-section-link') === id;
      link.classList.toggle('current', isCurrent);
      if (isCurrent) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });

    var currentIndex = sections.findIndex(function (section) {
      return section.id === id;
    });
    var nextSection = sections[currentIndex + 1] || sections[0];

    if (nextLink && nextSection) {
      var label = nextLink.querySelector('strong');
      var caption = nextLink.querySelector('span');
      nextLink.href = '#' + nextSection.id;
      label.textContent = nextSection.getAttribute('data-section-name');
      caption.textContent = currentIndex === sections.length - 1 ? 'Return to' : 'Next section';
    }
  }

  function updateActiveSection() {
    var marker = window.innerHeight * 0.38;
    var current = sections[0];

    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= marker) current = section;
    });

    setActiveSection(current.id);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(updateActiveSection);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateActiveSection);
  updateActiveSection();

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menu && menu.classList.contains('open')) {
      closeMenu();
    }
  });
})();
