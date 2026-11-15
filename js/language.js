/* Each translation is a complete HTML page. The link also works without JS. */
(function () {
  'use strict';

  var preferenceKey = 'ml-language';
  var detectedKey = 'ml-detected-language';
  var chinese = 'zh-Hans';

  function read(storage, key) {
    try { return window[storage].getItem(key); } catch (e) { return null; }
  }

  function remember(storage, key, value) {
    try { window[storage].setItem(key, value); } catch (e) { /* storage disabled */ }
  }

  function init() {
    var inChinese = document.documentElement.lang.toLowerCase().startsWith('zh');
    var other = inChinese ? 'en' : chinese;
    var alternate = document.querySelector('link[rel="alternate"][hreflang="' + other + '"]');
    if (!alternate) return;

    // Use the alternate's path on the current host (also works on local previews).
    function destination() {
      var url = new URL(window.location.href);
      url.pathname = new URL(alternate.href).pathname;
      if (other === 'en') url.searchParams.set('lang', 'en');
      else if (url.searchParams.has('lang')) url.searchParams.delete('lang');
      return url.href;
    }

    function updateLink() {
      var link = document.querySelector('[data-language-switch]');
      if (link) link.href = destination();
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateLink, { once: true });
    } else {
      updateLink();
    }
    window.addEventListener('hashchange', updateLink);
    window.addEventListener('popstate', updateLink);

    var manual = false;
    // The language link may not have been parsed when this head script runs.
    document.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('a[data-language-switch]');
      if (!link) return;
      manual = true;
      remember('localStorage', preferenceKey, other);
      link.href = destination();
    }, true);

    // Honor an explicitly shared Chinese page or ?lang=en, embedded content,
    // and the page the visitor just returned to using Back or Forward.
    var requested = new URL(window.location.href).searchParams.get('lang');
    if (inChinese || requested === 'en' || window.self !== window.top || navigator.onLine === false) return;
    var navigation = window.performance && window.performance.getEntriesByType &&
      window.performance.getEntriesByType('navigation')[0];
    if (navigation && navigation.type === 'back_forward') return;

    if (requested === 'zh' || requested === chinese) {
      window.location.replace(destination());
      return;
    }
    // Internal links already point to the visitor's current edition, including
    // when they follow a shared English link despite an older saved preference.
    if (document.referrer && new URL(document.referrer).origin === window.location.origin) return;
    var preference = read('localStorage', preferenceKey);
    if (preference === chinese) { window.location.replace(destination()); return; }
    if (preference === 'en') return;
    var detected = read('sessionStorage', detectedKey);
    if (detected === chinese) window.location.replace(destination());
    if (detected || !/^https?:$/.test(window.location.protocol) ||
        !window.fetch || !window.AbortController) return;

    // GeoJS's plain-text country endpoint returns only a two-letter code.
    // Keep only the resulting edition in session storage, including on failure.
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 2200);
    window.addEventListener('pagehide', function () { controller.abort(); }, { once: true });
    remember('sessionStorage', detectedKey, 'en');
    fetch('https://get.geojs.io/v1/ip/country', {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller.signal
    }).then(function (response) {
      return response.ok ? response.text() : '';
    }).then(function (code) {
      if (code.trim() === 'CN' && !controller.signal.aborted) {
        remember('sessionStorage', detectedKey, chinese);
        if (!manual && !read('localStorage', preferenceKey)) window.location.replace(destination());
      }
    }).catch(function () { /* Keep the English page if the service is unavailable. */ })
      .finally(function () { clearTimeout(timer); });
  }

  // The language alternates precede this script in the head. Pick an edition
  // independently of the body, stylesheets, and web fonts.
  init();
})();
