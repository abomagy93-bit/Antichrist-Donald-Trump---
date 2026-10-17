/**
 * Antichrist Donald Trump Research
 * Thinker & Researcher: Kareem Ashmawy
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ArticleView } from './components/ArticleView';
import { Footer } from './components/Footer';
import { DEFAULT_ARTICLE } from './data/defaultArticle';
import { UI_STRINGS } from './data/translations';
import { Language } from './types';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('ar');
  const article = DEFAULT_ARTICLE;

  useEffect(() => {
    // Sync html dir and lang attributes for RTL and LTR languages
    const isRtl = ['ar', 'fa', 'ur', 'he'].includes(currentLang);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;

    // Set page title dynamically based on active language
    const currentTitle = article.title[currentLang] || article.title.ar;
    const authorName = UI_STRINGS[currentLang]?.authorName || article.author;
    const pageTitle = `${currentTitle} | ${authorName}`;
    document.title = pageTitle;

    // Dynamic SEO synchronization across language changes
    const currentDesc = article.subtitle[currentLang] || article.subtitle.ar;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', currentDesc);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', currentDesc);

    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', pageTitle);

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', currentDesc);

    // Ensure thumbnail image is firmly set to the introduction image
    const thumbUrl = article.featuredImageUrl || 'https://i.ibb.co/8gpv9njM/1792275042204.jpg';
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute('content', thumbUrl);
    const twImg = document.querySelector('meta[name="twitter:image"]');
    if (twImg) twImg.setAttribute('content', thumbUrl);
  }, [currentLang, article]);

  const isRtl = ['ar', 'fa', 'ur', 'he'].includes(currentLang);

  return (
    <div
      className={`min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col font-cairo selection:bg-amber-600 selection:text-white ${
        isRtl ? 'rtl' : 'ltr'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header containing Brand, Live Cairo Quran Radio, and 12-Language Selector */}
      <Navbar currentLang={currentLang} onLanguageChange={setCurrentLang} />

      <main className="flex-1 w-full max-w-full min-w-0">
        <ArticleView article={article} currentLang={currentLang} />
      </main>

      <Footer currentLang={currentLang} />
    </div>
  );
}
