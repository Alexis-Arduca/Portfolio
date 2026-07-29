const SUPPORTED_LANGS = ['fr', 'en'];
const DEFAULT_LANG = 'fr';

function getLangBasePath() {
  const path = window.location.pathname;
  return path.includes('/pages/') ? '../lang/' : 'lang/';
}

function resolveInitialLang() {
  const stored = localStorage.getItem('lang');
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

  const browser = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
  if (SUPPORTED_LANGS.includes(browser)) return browser;

  return DEFAULT_LANG;
}

async function loadTranslations(lang) {
  const base = getLangBasePath();
  const res = await fetch(`${base}${lang}.json`);
  if (!res.ok) throw new Error(`Failed to load ${lang}.json`);
  return res.json();
}

function deepGet(obj, key) {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function applyTranslations(translations) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = deepGet(translations, key);
    if (value === undefined) {
      console.warn(`[i18n] Missing key: "${key}"`);
      return;
    }

    const attr = el.getAttribute('data-i18n-attr');
    if (attr) {
      el.setAttribute(attr, value);
    } else {
      el.innerHTML = value;
    }
  });
}

function applyMetadata(translations, lang, pageTitleKey) {
  document.documentElement.setAttribute('lang', lang);
  if (pageTitleKey) {
    const title = deepGet(translations, pageTitleKey);
    if (title) document.title = title;
  }
}

function renderSwitcher(currentLang, onSwitch) {
  const container = document.getElementById('lang-switcher');
  if (!container) return;

  container.innerHTML = '';
  SUPPORTED_LANGS.forEach(lang => {
    const btn = document.createElement('button');
    btn.className = 'lang-btn' + (lang === currentLang ? ' lang-btn--active' : '');
    btn.setAttribute('aria-label', `Switch language to ${lang.toUpperCase()}`);
    btn.textContent = lang.toUpperCase();
    btn.addEventListener('click', () => {
      if (lang !== currentLang) onSwitch(lang);
    });
    container.appendChild(btn);
  });
}

// Tracks the most recent translations/lang so components that mount after
// the initial i18n pass (e.g. the navbar, injected via an async fetch) can
// translate themselves on demand instead of racing DOMContentLoaded.
let _lastTranslations = null;
let _lastLang = null;
let _switchToFn = null;

async function initI18n(pageTitleKey = '') {
  let currentLang = resolveInitialLang();

  async function switchTo(lang) {
    try {
      const translations = await loadTranslations(lang);
      currentLang = lang;
      _lastLang = lang;
      _lastTranslations = translations;
      localStorage.setItem('lang', lang);
      applyTranslations(translations);
      applyMetadata(translations, lang, pageTitleKey);
      renderSwitcher(lang, switchTo);

      document.dispatchEvent(new CustomEvent('langchange', { detail: { lang, translations } }));
    } catch (err) {
      console.error('[i18n] Error switching language:', err);
    }
  }

  _switchToFn = switchTo;
  await switchTo(currentLang);
}

// Public hook: call this after injecting any HTML that contains [data-i18n]
// elements or a #lang-switcher container (e.g. from navbar.js's fetch callback).
// It re-applies the last known translations without re-fetching anything.
window.reapplyI18nUI = function () {
  if (!_lastTranslations) return;
  applyTranslations(_lastTranslations);
  if (_switchToFn) renderSwitcher(_lastLang, _switchToFn);
};

if (typeof module !== 'undefined') {
  module.exports = { initI18n, loadTranslations, applyTranslations };
}