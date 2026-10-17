import React, { useState, useRef, useEffect } from 'react';
import { Globe, ExternalLink, ChevronDown, Check, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { LANGUAGES, UI_STRINGS } from '../data/translations';
import { QuranRadio } from './QuranRadio';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentLang, onLanguageChange }) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const t = UI_STRINGS[currentLang] || UI_STRINGS.ar;
  const activeLang = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full max-w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md sticky top-0 z-50 shadow-xl">
      <div className="w-full max-w-7xl mx-auto px-2 xs:px-3 sm:px-6 py-2 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Brand / Title - shrinks gracefully */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-slate-950 text-xs shadow-md shadow-amber-500/20 shrink-0">
            KD
          </div>
          <div className="leading-tight min-w-0">
            <span className="font-extrabold text-xs sm:text-sm text-amber-100 block truncate max-w-[95px] xs:max-w-[130px] sm:max-w-[200px] md:max-w-xs lg:max-w-none">
              {t.title}
            </span>
            <span className="text-[10px] text-amber-400/80 font-medium hidden sm:block truncate">
              {t.authorName}
            </span>
          </div>
        </div>

        {/* Center: Live Cairo Quran Radio - fits within available space */}
        <div className="flex items-center justify-center shrink-0">
          <QuranRadio currentLang={currentLang} />
        </div>

        {/* Right Actions: 12-Language Selector & Official Author Link */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Language Switcher Dropdown with all 12 languages */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-slate-200 text-xs font-medium transition-all shadow-sm active:scale-95"
              aria-expanded={isLangOpen}
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm leading-none shrink-0">{activeLang.flag}</span>
              <span className="hidden md:inline text-xs">{activeLang.nativeName}</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform shrink-0 ${
                  isLangOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isLangOpen && (
              <div className="absolute end-0 mt-2 w-60 sm:w-72 max-h-[75vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl py-2 z-[60] animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-800">
                <div className="px-3.5 py-2 flex items-center justify-between text-[11px] font-bold text-amber-400/90 uppercase tracking-wider">
                  <span>Languages / اللغات</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                    12
                  </span>
                </div>

                <div className="py-1 grid grid-cols-1 divide-y divide-slate-800/50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-left rtl:text-right transition-colors ${
                        currentLang === lang.code
                          ? 'bg-amber-500/15 text-amber-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm sm:text-base">{lang.flag}</span>
                        <div className="leading-snug">
                          <span className="block font-medium">{lang.nativeName}</span>
                          <span className="text-[10px] text-slate-400">{lang.name}</span>
                        </div>
                      </span>
                      {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Official Site Link (Only visible on wide desktop screens to avoid squeezing) */}
          <a
            href="https://kareem-ashmawy.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all"
            title="الموقع الرسمي للمفكر كريم عشماوي"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="truncate">{t.authorName}</span>
            <ExternalLink className="w-3 h-3 text-amber-400/80" />
          </a>
        </div>
      </div>
    </header>
  );
};
