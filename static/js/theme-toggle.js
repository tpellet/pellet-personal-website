(function () {
  'use strict';

  var STORAGE_KEY = 'theme-preference';
  var DARK = 'dark';
  var LIGHT = 'light';

  /**
   * Get the effective theme based on stored preference or system setting.
   */
  function getEffectiveTheme() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === DARK || stored === LIGHT) {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  /**
   * Apply theme to the document root and update the toggle button.
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', theme === DARK ? 'Switch to light mode' : 'Switch to dark mode');
      btn.textContent = theme === DARK ? '\u2600\uFE0F' : '\uD83C\uDF19';
    }
  }

  /**
   * Toggle between light and dark, persist the choice.
   */
  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || getEffectiveTheme();
    var next = current === DARK ? LIGHT : DARK;
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // Apply theme and wire up toggle on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(getEffectiveTheme());

    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.removeAttribute('hidden');
      btn.addEventListener('click', toggleTheme);
    }
  });

  // Listen for system preference changes when no explicit user choice
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(getEffectiveTheme());
    }
  });
})();
