/**
 * i18n.js — Portfolio Alexis
 *
 * Usage in HTML:
 *   <span data-i18n="nav.home"></span>
 *   <a data-i18n="contact.cta_contact" data-i18n-attr="title"></a>  ← for attribute
 *   <html lang="fr">  ← updated automatically
 *
 * The current language is stored in localStorage under the key "lang".
 * Default: browser language if fr or en, otherwise "fr".
 */

const SUPPORTED_LANGS = ['fr', 'en'];
const DEFAULT_LANG = 'fr';

/**
 * Determine the base path to /lang/ depending on where the current page sits.
 * - Root pages (index.html) → "lang/"
 * - Pages inside /pages/   → "../lang/"
 */
function getLangBasePath() {
  const path = window.location.pathname;
  return path.includes('/pages/') ? '../lang/' : 'lang/';
}

/**
 * Resolve the preferred language:
 * 1. localStorage
 * 2. Browser language
 * 3. Default
 */
function resolveInitialLang() {
  const stored = localStorage.getItem('lang');
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

  const browser = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
  if (SUPPORTED_LANGS.includes(browser)) return browser;

  return DEFAULT_LANG;
}

/**
 * Fetch and parse a translation file.
 * @param {string} lang - 'fr' | 'en'
 * @returns {Promise<object>}
 */
async function loadTranslations(lang) {
  const base = getLangBasePath();
  const res = await fetch(`${base}${lang}.json`);
  if (!res.ok) throw new Error(`Failed to load ${lang}.json`);
  return res.json();
}

/**
 * Deep-get a nested key from an object using dot notation.
 * e.g. get(obj, "nav.home") → obj.nav.home
 * @param {object} obj
 * @param {string} key
 * @returns {string|undefined}
 */
function deepGet(obj, key) {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Apply translations to all [data-i18n] elements in the document.
 * - data-i18n="key.path"          → sets innerHTML
 * - data-i18n-attr="attrName"     → sets the given attribute instead of innerHTML
 * @param {object} translations
 */
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

/**
 * Update the <html lang> attribute and the document <title> if a title key exists.
 * @param {object} translations
 * @param {string} lang
 * @param {string} pageTitleKey  e.g. "index.title" | "about.title"
 */
function applyMetadata(translations, lang, pageTitleKey) {
  document.documentElement.setAttribute('lang', lang);
  if (pageTitleKey) {
    const title = deepGet(translations, pageTitleKey);
    if (title) document.title = title;
  }
}

/**
 * Render the language switcher button(s).
 * Looks for an element with id="lang-switcher" and fills it.
 * @param {string} currentLang
 * @param {function} onSwitch
 */
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

/**
 * Main init function. Call this on DOMContentLoaded.
 *
 * @param {string} pageTitleKey  Dot-path to the page title in the JSON, e.g. "index.title"
 */
async function initI18n(pageTitleKey = '') {
  let currentLang = resolveInitialLang();

  async function switchTo(lang) {
    try {
      const translations = await loadTranslations(lang);
      currentLang = lang;
      localStorage.setItem('lang', lang);
      applyTranslations(translations);
      applyMetadata(translations, lang, pageTitleKey);
      renderSwitcher(lang, switchTo);

      // Dispatch an event so other scripts can react (e.g. navbar, footer)
      document.dispatchEvent(new CustomEvent('langchange', { detail: { lang, translations } }));
    } catch (err) {
      console.error('[i18n] Error switching language:', err);
    }
  }

  // Initial load
  await switchTo(currentLang);
}

// Export for module usage; also works as a plain <script> include
if (typeof module !== 'undefined') {
  module.exports = { initI18n, loadTranslations, applyTranslations };
}