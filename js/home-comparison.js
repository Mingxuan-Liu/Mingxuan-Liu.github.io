(function () {
  'use strict';

  const map = document.querySelector('.hero-map');
  if (!map) return;

  const slider = map.querySelector('.hero-map-control');
  const divider = map.querySelector('.hero-map-divider');
  const instruction = document.getElementById('hero-map-instruction');

  function update() {
    const heat = slider.valueAsNumber;
    const beta = 100 - heat;
    map.style.setProperty('--split', heat + '%');
    divider.hidden = heat === 0 || beta === 0;
    slider.setAttribute('aria-valuetext', slider.dataset.valueText
      .replace('{heat}', heat).replace('{beta}', beta));
  }

  slider.hidden = false;
  instruction.hidden = false;
  slider.addEventListener('input', update);
  update();

  // Seed the motes once. CSS moves them with the divider, without a per-frame script.
  const count = 18;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('span');
    spark.className = 'hero-map-spark';
    spark.style.top = ((i + Math.random()) / count * 100) + '%';
    spark.style.left = (Math.random() * 6 - 3) + 'px';
    spark.style.setProperty('--drift-x', (Math.random() * 18 - 9) + 'px');
    spark.style.setProperty('--drift-end', (Math.random() * 22 - 11) + 'px');
    const duration = 3 + Math.random() * 4;
    spark.style.setProperty('--drift-time', duration + 's');
    spark.style.setProperty('--drift-delay', (-Math.random() * duration) + 's');
    divider.appendChild(spark);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      map.style.setProperty('--mist-play-state', entry.isIntersecting ? 'running' : 'paused');
    });
    observer.observe(map);
  } else {
    map.style.setProperty('--mist-play-state', 'running');
  }
}());
