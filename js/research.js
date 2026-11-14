/* Native projection comparison and on-demand 3D overview. No libraries needed. */
(function () {
  'use strict';

  var explorer = document.querySelector('[data-native-explorer]');
  if (explorer) {
    var viewport = explorer.querySelector('.native-viewport');
    var pair = explorer.querySelector('.native-pair');
    var overlay = explorer.querySelector('.native-overlay');
    var divider = explorer.querySelector('.native-divider');
    var wipe = explorer.querySelector('#native-wipe');
    var wipeControl = explorer.querySelector('.native-wipe');
    var zoomLevel = explorer.querySelector('[data-zoom-level]');
    var status = explorer.querySelector('[role="status"]');
    var maps = Array.from(pair.querySelectorAll('img'));
    var size = 2048;
    var scale = 1;
    var fitted = true;
    var pointer = null;

    explorer.querySelectorAll('[data-native-controls]').forEach(function (el) { el.hidden = false; });

    function fitScale() { return Math.min(viewport.clientWidth, viewport.clientHeight) / size; }

    function setZoom(next, fit) {
      // Keep the same scientific location centered when changing the scale.
      var oldWidth = pair.getBoundingClientRect().width;
      var centerX = (viewport.scrollLeft + viewport.clientWidth / 2 - pair.offsetLeft) / oldWidth;
      var centerY = (viewport.scrollTop + viewport.clientHeight / 2) / oldWidth;
      fitted = fit;
      scale = fit ? fitScale() : Math.max(fitScale(), Math.min(2, next));
      pair.style.width = (size * scale) + 'px';
      viewport.scrollLeft = size * scale * centerX - viewport.clientWidth / 2 + pair.offsetLeft;
      viewport.scrollTop = size * scale * centerY - viewport.clientHeight / 2;
      viewport.classList.toggle('is-zoomed', scale > fitScale() + .001);
      viewport.classList.toggle('is-native-scale', scale >= 1);
      zoomLevel.textContent = Math.round(scale * 100) + '%';
      explorer.querySelector('[data-zoom="fit"]').setAttribute('aria-pressed', String(fitted));
      explorer.querySelector('[data-zoom="native"]').setAttribute('aria-pressed', String(Math.abs(scale - 1) < .001));
      explorer.querySelector('[data-zoom="out"]').disabled = scale <= fitScale() + .001;
      explorer.querySelector('[data-zoom="in"]').disabled = scale >= 2;
      updateWipe();
    }

    function updateWipe() {
      var fraction = Number(wipe.value);
      // Share one visible interval between the map and the slider, including
      // only the visible crop when zoomed or panned.
      var mapBounds = pair.getBoundingClientRect();
      var width = mapBounds.width;
      var mapLeft = mapBounds.left - viewport.getBoundingClientRect().left - viewport.clientLeft;
      var visibleLeft = Math.max(0, mapLeft);
      var visibleRight = Math.min(viewport.clientWidth, mapLeft + width);
      var visibleWidth = Math.max(0, visibleRight - visibleLeft);
      wipeControl.style.width = visibleWidth + 'px';
      wipeControl.style.marginLeft = visibleLeft + 'px';
      wipe.style.setProperty('--wipe-percent', fraction + '%');
      var split = Math.max(0, Math.min(width, visibleLeft - mapLeft + visibleWidth * fraction / 100));
      overlay.style.clipPath = 'inset(0 ' + (100 - 100 * split / width) + '% 0 0)';
      divider.style.left = split + 'px';
      divider.hidden = fraction === 0 || fraction === 100;
      explorer.querySelector('[data-left-label]').style.visibility = fraction === 0 ? 'hidden' : 'visible';
      explorer.querySelector('[data-right-label]').style.visibility = fraction === 100 ? 'hidden' : 'visible';
      wipe.setAttribute('aria-valuetext', fraction + '% Hα, ' + (100 - fraction) + '% soft X-ray');
    }

    wipe.addEventListener('input', updateWipe);
    viewport.addEventListener('scroll', updateWipe, { passive: true });
    explorer.querySelectorAll('[data-zoom]').forEach(function (button) {
      button.addEventListener('click', function () {
        var mode = button.dataset.zoom;
        setZoom(mode === 'native' ? 1 : scale * (mode === 'in' ? 1.5 : 1 / 1.5), mode === 'fit');
      });
    });
    viewport.addEventListener('keydown', function (event) {
      if (event.key === '+' || event.key === '=') { event.preventDefault(); setZoom(scale * 1.5, false); }
      if (event.key === '-') { event.preventDefault(); setZoom(scale / 1.5, false); }
      if (event.key === '0') { event.preventDefault(); setZoom(0, true); }
    });
    viewport.addEventListener('pointerdown', function (event) {
      // Touch retains native scrolling and pinch-to-zoom accessibility.
      if (event.pointerType !== 'mouse' || event.button !== 0 || !viewport.classList.contains('is-zoomed')) return;
      viewport.focus({ preventScroll: true });
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('is-dragging');
      event.preventDefault();
    });
    viewport.addEventListener('pointermove', function (event) {
      if (!pointer || pointer.id !== event.pointerId) return;
      viewport.scrollLeft = pointer.left + pointer.x - event.clientX;
      viewport.scrollTop = pointer.top + pointer.y - event.clientY;
    });
    function endDrag() { pointer = null; viewport.classList.remove('is-dragging'); }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('lostpointercapture', endDrag);

    function mapStatus() {
      var failed = maps.some(function (img) { return img.complete && !img.naturalWidth; });
      var loaded = maps.every(function (img) { return img.complete; });
      status.textContent = failed ? 'A map could not load. Open the individual maps below or reload to retry.' :
        loaded ? '' : 'Loading maps…';
    }
    maps.forEach(function (img) { img.addEventListener('load', mapStatus); img.addEventListener('error', mapStatus); });
    mapStatus();
    setZoom(0, true);
    if (window.ResizeObserver) {
      new ResizeObserver(function () { if (fitted) setZoom(0, true); else updateWipe(); }).observe(viewport);
    } else {
      window.addEventListener('resize', function () { if (fitted) setZoom(0, true); else updateWipe(); });
    }
  }

  var disclosure = document.querySelector('[data-volume-disclosure]');
  if (disclosure) {
    disclosure.addEventListener('toggle', function () {
      var mount = disclosure.querySelector('.volume-mount');
      var opening = disclosure.querySelector('[data-volume-opening]');
      if (disclosure.open && !mount.firstElementChild) {
        var frame = disclosure.querySelector('template').content.querySelector('iframe').cloneNode(true);
        opening.hidden = false;
        frame.addEventListener('load', function () {
          if (mount.firstElementChild === frame) opening.hidden = true;
        });
        frame.src = frame.dataset.src;
        frame.removeAttribute('data-src');
        mount.appendChild(frame);
      } else if (!disclosure.open) {
        // Closing the viewer releases its WebGL context and stops animation work.
        mount.replaceChildren();
        opening.hidden = true;
      }
    });
  }
})();
