(function () {
  'use strict';

  const map = document.querySelector('.hero-map');
  if (!map) return;

  const slider = map.querySelector('.hero-map-control');
  const heatLabel = map.querySelector('.hero-heat-label');
  const betaLabel = map.querySelector('.hero-beta-label');
  const instruction = document.getElementById('hero-map-instruction');

  function update() {
    const heat = slider.valueAsNumber;
    const beta = 100 - heat;
    map.style.setProperty('--split', heat + '%');
    slider.setAttribute('aria-valuetext', slider.dataset.valueText
      .replace('{heat}', heat).replace('{beta}', beta));

    // Keep each label inside the part of its own map that is still visible.
    const dividingX = map.clientWidth * heat / 100;
    heatLabel.style.visibility = heatLabel.offsetLeft + heatLabel.offsetWidth < dividingX ? '' : 'hidden';
    betaLabel.style.visibility = betaLabel.offsetLeft > dividingX ? '' : 'hidden';
  }

  slider.hidden = false;
  instruction.hidden = false;
  slider.addEventListener('input', update);
  window.addEventListener('resize', update);
  if (document.fonts) document.fonts.ready.then(update);
  update();
}());
