/* Mingxuan Liu — site behaviour. Progressive enhancement only:
   every page is fully readable with JavaScript disabled. */
(function () {
  'use strict';

  /* ---------------------------------------------------------- theme -- */

  var root = document.documentElement;

  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    try { localStorage.setItem('ml-theme', mode); } catch (e) { /* private mode */ }
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('aria-pressed', String(mode === 'dark'));
    }
  }

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

  /* --------------------------------------------------- news show-all -- */

  var newsBtn = document.querySelector('[data-news-toggle]');
  var newsList = document.querySelector('.news-list');

  if (newsBtn && newsList) {
    // Hidden by default so no-JS visitors just get the scrollable list.
    newsBtn.hidden = false;
    newsBtn.addEventListener('click', function () {
      var expanded = newsList.classList.toggle('is-expanded');
      newsBtn.textContent = expanded ? 'show less' : 'show all news';
      newsBtn.setAttribute('aria-expanded', String(expanded));
    });
  }

  /* ------------------------------------------------------- the husky -- */

  // The big portrait on Vanilla's page wiggles when you poke it. The tally is kept in
  // localStorage, so it carries across visits in this browser instead of restarting at
  // zero. Every poke is also reported to Analytics, where the total across everyone who
  // has ever visited shows up as the "pet_vanilla" event count.
  var PET_KEY = 'ml-vanilla-pets';

  function readPets() {
    try { return parseInt(localStorage.getItem(PET_KEY), 10) || 0; } catch (e) { return 0; }
  }
  function writePets(n) {
    try { localStorage.setItem(PET_KEY, String(n)); } catch (e) { /* storage blocked */ }
  }
  function renderPets(n) {
    document.querySelectorAll('[data-pet-count]').forEach(function (el) {
      el.textContent = n === 1 ? '1 pet' : n.toLocaleString() + ' pets';
    });
  }

  if (document.querySelector('[data-pet-count]')) renderPets(readPets());

  document.querySelectorAll('.vanilla-portrait').forEach(function (portrait) {
    var dog = portrait.querySelector('.vn-dog');
    if (!dog) return;
    portrait.setAttribute('tabindex', '0');
    portrait.setAttribute('role', 'button');
    portrait.setAttribute('aria-label', 'Pet Vanilla');

    var poke = function () {
      dog.classList.remove('is-wiggling');
      void dog.offsetWidth;            // restart the animation
      dog.classList.add('is-wiggling');

      var n = readPets() + 1;
      writePets(n);
      renderPets(n);
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'pet_vanilla', { event_category: 'vanilla' });
      }
    };

    portrait.addEventListener('click', poke);
    portrait.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(); }
    });
    dog.addEventListener('animationend', function () { dog.classList.remove('is-wiggling'); });
  });

  /* ------------------------------------------------ year in the footer -- */

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
