/* Both editions share the same Worker and the same browser outbox. */
(function () {
  'use strict';

  const PET_API = 'https://vanilla-counter.mingxuan-liu278.workers.dev/';
  const portrait = document.querySelector('.vanilla-portrait');
  const dog = portrait.querySelector('.vn-dog');
  const label = document.querySelector('[data-pet-count]');
  const chinese = document.documentElement.lang === 'zh-Hans';

  // Tabs claim the same immutable batch inside an IndexedDB transaction. A
  // lost response or simultaneous retry sends the same ID to the Worker.
  const initial = { pending: 0, flight: null, imported: 0 };
  const database = new Promise((resolve, reject) => {
    const request = indexedDB.open('vanilla-pets', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('counter');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).catch(() => null);

  async function updateOutbox(change) {
    const db = await database;
    // Storage may be disabled. New pets can still be submitted while this
    // tab remains open. Historical imports require a persistent checkpoint.
    if (!db) {
      change(initial, false);
      return initial;
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction('counter', 'readwrite');
      const store = tx.objectStore('counter');
      const get = store.get('outbox');
      let state;
      get.onsuccess = () => {
        state = get.result || { ...initial };
        if (change(state, true)) store.put(state, 'outbox');
      };
      tx.oncomplete = () => resolve(state);
      tx.onabort = () => reject(tx.error);
    });
  }

  function migrateLocalTotal(state, persistent) {
    if (!persistent) return false;
    let oldTotal;
    try { oldTotal = Number(localStorage.getItem('ml-vanilla-pets')); }
    catch { return false; }
    if (!Number.isSafeInteger(oldTotal) || oldTotal <= state.imported) return false;
    state.pending += oldTotal - state.imported;
    state.imported = oldTotal;
    return true;
  }

  function claimBatch(state) {
    if (state.flight || !state.pending) return false;
    const by = Math.min(1000, state.pending);
    state.flight = { id: crypto.randomUUID(), by };
    state.pending -= by;
    return true;
  }

  let total = null;
  function render(available) {
    const number = total === null ? '' : total.toLocaleString(chinese ? 'zh-CN' : 'en-US');
    const pattern = available ? (total === 1 ? label.dataset.one : label.dataset.many)
      : (total === null ? label.dataset.offline : label.dataset.stale);
    const message = pattern.replace('{n}', number);
    if (message !== label.textContent) label.textContent = message;
  }

  let timer;
  let scheduled = Infinity;
  let busy = false;
  let newPets = false;
  let failures = 0;

  function schedule(delay) {
    const next = Date.now() + delay;
    if (busy || document.hidden || next >= scheduled) return;
    clearTimeout(timer);
    scheduled = next;
    timer = setTimeout(refresh, delay);
  }

  async function refresh() {
    scheduled = Infinity;
    if (document.hidden || busy) return;
    busy = true;
    newPets = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const { flight } = await updateOutbox(claimBatch);
      const options = { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal };
      if (flight) {
        options.method = 'POST';
        options.body = JSON.stringify(flight);
        options.keepalive = true;
      }
      const response = await fetch(PET_API, options);
      if (!response.ok) throw Error('Counter unavailable');
      const result = await response.json();
      if (!Number.isSafeInteger(result.count) || result.count < 0) throw Error('Invalid pet total');
      total = Math.max(total || 0, result.count);
      if (flight) {
        const state = await updateOutbox(current => {
          if (current.flight?.id !== flight.id) return false;
          current.flight = null;
          return true;
        });
        newPets ||= !!(state.pending || state.flight);
      }
      failures = 0;
      render(true);
    } catch {
      failures = Math.min(failures + 1, 6);
      render(false);
    } finally {
      clearTimeout(timeout);
      busy = false;
      const delay = failures ? Math.min(300000, 5000 * 2 ** (failures - 1)) : (newPets ? 100 : 5000);
      schedule(delay);
    }
  }

  let squintTimer;
  function pet() {
    dog.classList.remove('is-wiggling');
    void dog.offsetWidth;
    dog.classList.add('is-wiggling', 'is-petted');
    clearTimeout(squintTimer);
    squintTimer = setTimeout(() => dog.classList.remove('is-petted'), 750);
    updateOutbox(state => { state.pending++; return true; }).then(() => {
      newPets = true;
      if (!failures) schedule(200);
    }).catch(() => render(false));
    if (typeof window.gtag === 'function') window.gtag('event', 'pet_vanilla', { event_category: 'vanilla' });
  }

  portrait.setAttribute('tabindex', '0');
  portrait.setAttribute('role', 'button');
  portrait.setAttribute('aria-label', chinese ? '摸摸香草的头' : 'Pet Vanilla');
  portrait.addEventListener('click', pet);
  portrait.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); pet(); }
  });
  dog.addEventListener('animationend', event => {
    if (event.target === dog) dog.classList.remove('is-wiggling');
  });
  document.querySelector('[data-pet-prompt]').hidden = false;

  function start() {
    updateOutbox(migrateLocalTotal).then(() => schedule(0)).catch(() => render(false));
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) start();
    else { clearTimeout(timer); scheduled = Infinity; }
  });
  window.addEventListener('online', start);
  window.addEventListener('pageshow', start);
  start();
})();
