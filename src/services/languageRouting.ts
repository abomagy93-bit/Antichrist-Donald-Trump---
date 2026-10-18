import { Language } from '../types';

export const VALID_LANGUAGES: Language[] = [
  'ar',
  'en',
  'zh',
  'de',
  'hi',
  'ur',
  'tr',
  'ru',
  'es',
  'fa',
  'el',
  'he',
];

export const RTL_LANGUAGES: Language[] = ['ar', 'fa', 'ur', 'he'];

export const BASE_SITE_URL = 'https://kareem-ashmawy.netlify.app';

/**
 * Returns the canonical URL for a given language.
 * Arabic uses root '/' to preserve all current search rankings.
 */
export function getLanguagePath(lang: Language): string {
  if (lang === 'ar') {
    return '/';
  }
  return `/${lang}/`;
}

export function getFullLanguageUrl(lang: Language): string {
  if (lang === 'ar') {
    return `${BASE_SITE_URL}/`;
  }
  return `${BASE_SITE_URL}/${lang}/`;
}

/**
 * Extracts the active language code from window.location.
 * Supports:
 *  1. Clean subpath: /en, /en/, /zh, /zh/, etc.
 *  2. Search query parameter: ?lang=en
 *  3. Default fallback: 'ar'
 */
export function getLanguageFromUrl(): Language {
  if (typeof window === 'undefined') {
    return 'ar';
  }

  // 1. Check clean path segments
  const path = window.location.pathname.replace(/^\/|\/$/g, '');
  const segments = path.split('/');
  const firstSegment = segments[0]?.toLowerCase();

  if (firstSegment && VALID_LANGUAGES.includes(firstSegment as Language)) {
    return firstSegment as Language;
  }

  // 2. Check query parameter (?lang=xx)
  const searchParams = new URLSearchParams(window.location.search);
  const langParam = searchParams.get('lang')?.toLowerCase();
  if (langParam && VALID_LANGUAGES.includes(langParam as Language)) {
    return langParam as Language;
  }

  return 'ar';
}

/**
 * Maps language code to OpenGraph locale format (e.g. en_US, ar_EG)
 */
export function getOgLocale(lang: Language): string {
  const map: Record<Language, string> = {
    ar: 'ar_EG',
    en: 'en_US',
    zh: 'zh_CN',
    de: 'de_DE',
    hi: 'hi_IN',
    ur: 'ur_PK',
    tr: 'tr_TR',
    ru: 'ru_RU',
    es: 'es_ES',
    fa: 'fa_IR',
    el: 'el_GR',
    he: 'he_IL',
  };
  return map[lang] || 'ar_EG';
}

/**
 * Updates dynamic head tags (title, description, canonical, og, twitter, html lang/dir)
 */
export function syncDocumentSeo(
  lang: Language,
  title: string,
  description: string,
  author: string
): void {
  if (typeof document === 'undefined') return;

  const isRtl = RTL_LANGUAGES.includes(lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

  // 1. Page Title
  const fullTitle = `${title} | ${author}`;
  document.title = fullTitle;

  // 2. Meta Description
  const descMeta = document.querySelector('meta[name="description"]');
  if (descMeta) descMeta.setAttribute('content', description);

  // 3. Canonical Link
  const canonicalUrl = getFullLanguageUrl(lang);
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  // 4. OpenGraph Tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', fullTitle);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description);

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);

  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) ogLocale.setAttribute('content', getOgLocale(lang));

  // 5. Twitter Card Tags
  const twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.setAttribute('content', fullTitle);

  const twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) twDesc.setAttribute('content', description);

  const twUrl = document.querySelector('meta[name="twitter:url"]');
  if (twUrl) twUrl.setAttribute('content', canonicalUrl);
}
