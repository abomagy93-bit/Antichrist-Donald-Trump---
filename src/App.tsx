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
import {
  getLanguageFromUrl,
  getLanguagePath,
  syncDocumentSeo,
  RTL_LANGUAGES,
} from './services/languageRouting';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>(() => getLanguageFromUrl());
  const article = DEFAULT_ARTICLE;

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // Sync state if browser back/forward buttons are used
  useEffect(() => {
    const handlePopState = () => {
      const detected = getLanguageFromUrl();
      setCurrentLang(detected);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle user language selection with history pushState
  const handleLanguageChange = (newLang: Language) => {
    if (newLang === currentLang) return;
    setCurrentLang(newLang);
    const newPath = getLanguagePath(newLang);
    if (window.location.pathname !== newPath) {
      window.history.pushState({ lang: newLang }, '', newPath);
    }
  };

  useEffect(() => {
    const currentTitle = article.title[currentLang] || article.title.ar;
    const currentDesc = article.subtitle[currentLang] || article.subtitle.ar;
    const authorName = UI_STRINGS[currentLang]?.authorName || article.author;

    // Synchronize comprehensive SEO metadata and canonical tags
    syncDocumentSeo(currentLang, currentTitle, currentDesc, authorName);

    // Ensure thumbnail image is firmly set to the introduction image
    const thumbUrl = article.featuredImageUrl || 'https://i.ibb.co/8gpv9njM/1792275042204.jpg';
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute('content', thumbUrl);
    const twImg = document.querySelector('meta[name="twitter:image"]');
    if (twImg) twImg.setAttribute('content', thumbUrl);
  }, [currentLang, article]);

  const isRtl = RTL_LANGUAGES.includes(currentLang);

  return (
    <div
      className={`min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col font-cairo selection:bg-amber-600 selection:text-white ${
        isRtl ? 'rtl' : 'ltr'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header containing Brand, Live Cairo Quran Radio, and 12-Language Selector */}
      <Navbar currentLang={currentLang} onLanguageChange={handleLanguageChange} />

      <main className="flex-1 w-full max-w-full min-w-0">
        <ArticleView article={article} currentLang={currentLang} />
      </main>

      <Footer currentLang={currentLang} />
    </div>
  );
}
