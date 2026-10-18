/**
 * Multilingual SEO Static Page Generator for Netlify
 * Generates physical HTML entry files for each language in dist/
 * (e.g. dist/en/index.html, dist/es/index.html) so Googlebot and
 * crawlers receive dedicated static HTML matching each URL.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_ARTICLE } from '../src/data/defaultArticle.js';
import { UI_STRINGS, LANGUAGES } from '../src/data/translations.js';
import {
  BASE_SITE_URL,
  getFullLanguageUrl,
  getOgLocale,
  RTL_LANGUAGES,
} from '../src/services/languageRouting.js';
import { Language } from '../src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

function generateSeoPages() {
  if (!fs.existsSync(distDir)) {
    console.error('Error: dist directory does not exist. Run "vite build" first.');
    process.exit(1);
  }

  const baseHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(baseHtmlPath)) {
    console.error('Error: dist/index.html does not exist.');
    process.exit(1);
  }

  const templateHtml = fs.readFileSync(baseHtmlPath, 'utf8');

  console.log('Generating multilingual static HTML pages for SEO...');

  for (const langInfo of LANGUAGES) {
    const lang = langInfo.code as Language;
    const isRtl = RTL_LANGUAGES.includes(lang);
    const dir = isRtl ? 'rtl' : 'ltr';

    const title = DEFAULT_ARTICLE.title[lang] || DEFAULT_ARTICLE.title.ar;
    const subtitle = DEFAULT_ARTICLE.subtitle[lang] || DEFAULT_ARTICLE.subtitle.ar;
    const author = UI_STRINGS[lang]?.authorName || DEFAULT_ARTICLE.author;
    const pageTitle = `${title} | ${author}`;
    const canonicalUrl = getFullLanguageUrl(lang);
    const ogLocale = getOgLocale(lang);

    // Transform HTML template specifically for this language
    let pageHtml = templateHtml;

    // 1. html tag lang and dir
    pageHtml = pageHtml.replace(
      /<html[^>]*>/i,
      `<html lang="${lang}" dir="${dir}">`
    );

    // 2. Title tag
    pageHtml = pageHtml.replace(
      /<title>.*?<\/title>/i,
      `<title>${escapeHtml(pageTitle)}</title>`
    );

    // 3. Meta description
    pageHtml = pageHtml.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(subtitle)}" />`
    );

    // 4. Canonical link
    pageHtml = pageHtml.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${canonicalUrl}" />`
    );

    // 5. OpenGraph tags
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtml(pageTitle)}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(subtitle)}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:url" content="${canonicalUrl}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:locale" content="${ogLocale}" />`
    );

    // 6. Twitter tags
    pageHtml = pageHtml.replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${escapeHtml(pageTitle)}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${escapeHtml(subtitle)}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:url" content="${canonicalUrl}" />`
    );

    // Target output folder (e.g. dist/en, dist/zh, etc.)
    const targetLangDir = path.join(distDir, lang);
    if (!fs.existsSync(targetLangDir)) {
      fs.mkdirSync(targetLangDir, { recursive: true });
    }

    fs.writeFileSync(path.join(targetLangDir, 'index.html'), pageHtml, 'utf8');
    console.log(`✓ Created: /${lang}/index.html (${langInfo.name}) -> ${canonicalUrl}`);
  }

  console.log('Successfully generated all 12 multilingual SEO static pages.');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

generateSeoPages();
