// @ts-check
(function () {
  'use strict';

  const root = document.documentElement;
  const themePreference = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const themeButton = document.querySelector('.theme-toggle');
  const storageKey = 'theme-preference';
  let selectedTheme = readTheme();

  /** @returns {'dark' | 'light' | null} */
  function readTheme() {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored === 'dark' || stored === 'light' ? stored : null;
    } catch {
      return null;
    }
  }

  /** @param {'dark' | 'light'} theme */
  function applyTheme(theme) {
    root.dataset.theme = theme;
    themeButton?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    themeButton?.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  applyTheme(selectedTheme || (themePreference.matches ? 'dark' : 'light'));
  if (themeButton) {
    themeButton.removeAttribute('hidden');
    themeButton.addEventListener('click', () => {
      selectedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(storageKey, selectedTheme); } catch { /* Theme still works without storage. */ }
      applyTheme(selectedTheme);
    });
  }
  themePreference.addEventListener('change', () => {
    if (!selectedTheme) applyTheme(themePreference.matches ? 'dark' : 'light');
  });
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey || event.key === null) {
      selectedTheme = readTheme();
      applyTheme(selectedTheme || (themePreference.matches ? 'dark' : 'light'));
    }
  });

  /** @type {HTMLButtonElement | null} */
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#site-menu');
  const navigation = document.querySelector('.nav-container');
  /** @param {boolean} open */
  function setMenu(open) {
    menuButton?.setAttribute('aria-expanded', String(open));
    menu?.classList.toggle('is-open', open);
    if (menuButton?.lastElementChild) menuButton.lastElementChild.textContent = open ? '−' : '+';
  }
  if (menuButton && menu && navigation) {
    menuButton.hidden = false;
    navigation.classList.add('menu-ready');
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuButton.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (event.target instanceof Node && !navigation.contains(event.target)) setMenu(false);
    });
  }

  const publicationToolbar = document.querySelector('.publication-toolbar');
  const filterButtons = document.querySelectorAll('.publication-filter');
  /** @type {NodeListOf<HTMLElement>} */
  const publications = document.querySelectorAll('.publications-list .publication-entry');
  const publicationStatus = document.querySelector('#publication-status');
  if (publicationToolbar && publications.length) {
    publicationToolbar.removeAttribute('hidden');
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const category = button.getAttribute('data-filter');
        let count = 0;
        publications.forEach((entry) => {
          entry.hidden = category !== 'all' && entry.dataset.category !== category;
          if (!entry.hidden) count += 1;
        });
        filterButtons.forEach((filter) => filter.setAttribute('aria-pressed', String(filter === button)));
        if (publicationStatus) publicationStatus.textContent = `${count} ${count === 1 ? 'publication' : 'publications'}`;
      });
    });
  }

  /** @typedef {{stop: () => void}} AnimationControl */
  /** @typedef {{animate: (target: Element, frames: Record<string, number | number[]>, options: {duration: number, ease?: number[]}) => AnimationControl}} MotionLibrary */
  const motion = /** @type {Window & {Motion?: MotionLibrary}} */ (window).Motion;
  /** @type {AnimationControl[]} */
  const animations = [];
  /** @type {AnimationControl | null} */
  let traceAnimation = null;
  const heroCopy = document.querySelector('.hero-copy');
  const networkArt = document.querySelector('.network-art');
  const networkButton = document.querySelector('.network-toggle');
  const tracePath = document.querySelector('.network-trace path');
  if (networkArt && networkButton && tracePath) {
    networkButton.removeAttribute('hidden');
    networkButton.addEventListener('click', () => {
      traceAnimation?.stop();
      traceAnimation = null;
      const traced = networkButton.getAttribute('aria-pressed') !== 'true';
      networkButton.setAttribute('aria-pressed', String(traced));
      networkArt.classList.toggle('is-traced', traced);
      if (networkButton.lastElementChild) networkButton.lastElementChild.textContent = traced ? 'Reset connection' : 'Trace a connection';
      if (traced && motion && !reducedMotion.matches) {
        traceAnimation = motion.animate(tracePath, {strokeDashoffset: [1, 0]}, {duration: .8});
      }
    });
  }
  // A single entrance; content is visible before animation and without the library.
  if (motion && !reducedMotion.matches) {
    if (heroCopy) animations.push(motion.animate(heroCopy, {opacity: [.7, 1], y: [12, 0]}, {duration: .65, ease: [.2, .8, .2, 1]}));
    if (networkArt) animations.push(motion.animate(networkArt, {opacity: [.6, 1], y: [16, 0]}, {duration: .85, ease: [.2, .8, .2, 1]}));
  }
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      animations.forEach((animation) => animation.stop());
      traceAnimation?.stop();
      for (const element of [heroCopy, networkArt, tracePath]) {
        if (element instanceof HTMLElement || element instanceof SVGElement) {
          element.style.removeProperty('opacity');
          element.style.removeProperty('transform');
          element.style.removeProperty('stroke-dashoffset');
        }
      }
    }
  });
})();
