/* Mingxuan Liu — site behaviour. Progressive enhancement only:
   every page is fully readable with JavaScript disabled. */
(function () {
  'use strict';

  /* ---------------------------------------------------------- theme -- */

  var root = document.documentElement;
  var chinese = root.lang === 'zh-Hans';

  function describeTheme(mode) {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    var label = mode === 'dark'
      ? (chinese ? '切换到浅色模式' : 'Switch to light theme')
      : (chinese ? '切换到深色模式' : 'Switch to dark theme');
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-pressed', String(mode === 'dark'));
  }

  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    try { localStorage.setItem('ml-theme', mode); } catch (e) { /* private mode */ }
    describeTheme(mode);
  }

  describeTheme(root.getAttribute('data-theme'));

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.theme-toggle');
    if (!toggle) return;
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  // Keep in step with the OS unless the visitor has made a choice here.
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function (ev) {
      var stored = null;
      try { stored = localStorage.getItem('ml-theme'); } catch (e) { /* ignore */ }
      if (!stored) setTheme(ev.matches ? 'dark' : 'light');
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ----------------------------------------------------- mobile nav -- */

  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  /* ----------------------------------------------------- news scroll -- */

  var newsList = document.querySelector('.news-list');

  if (newsList) {
    var newsPanel = newsList.parentElement;
    var updateNewsScroll = function () {
      var travel = newsList.scrollHeight - newsList.clientHeight;
      newsPanel.classList.toggle('has-more-below', travel - newsList.scrollTop > 1);
      var overlay = travel > 1 && newsList.clientWidth === newsList.offsetWidth;
      newsPanel.classList.toggle('has-overlay-scrollbar', overlay);
      if (overlay) {
        newsPanel.style.setProperty('--news-thumb-size', newsList.clientHeight / newsList.scrollHeight * 100 + '%');
        newsPanel.style.setProperty('--news-scroll-progress', newsList.scrollTop / travel * 100 + '%');
      }
    };
    updateNewsScroll();
    newsList.addEventListener('scroll', updateNewsScroll, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(updateNewsScroll).observe(newsList);
    else window.addEventListener('resize', updateNewsScroll);
    if (document.fonts) document.fonts.ready.then(updateNewsScroll);
  }

  /* ------------------------------------------------ year in the footer -- */

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
