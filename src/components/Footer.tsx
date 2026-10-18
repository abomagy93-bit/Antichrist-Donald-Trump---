import React from 'react';
import { ExternalLink, Calendar, BookOpen } from 'lucide-react';
import { Language } from '../types';
import { UI_STRINGS } from '../data/translations';
import { VisitorCounter } from './VisitorCounter';

interface FooterProps {
  currentLang: Language;
}

export const Footer: React.FC<FooterProps> = ({ currentLang }) => {
  const t = UI_STRINGS[currentLang] || UI_STRINGS.ar;
  const isRtl = ['ar', 'fa', 'ur', 'he'].includes(currentLang);

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/95 py-10 mt-16 text-slate-400 text-sm">
      {/* Real Visitor Counter Section */}
      <VisitorCounter currentLang={currentLang} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-start pt-4">
        {/* Rights, Author, and 2025 Date */}
        <div className="space-y-1.5">
          <p className="font-semibold text-slate-200 flex items-center justify-center md:justify-start gap-2">
            <span>© 2025</span>
            <span>{t.rightsReserved}</span>
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-amber-400/90">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{isRtl ? 'إصدار وتوثيق: ٢٠٢٥ م' : 'Published & Documented: 2025'}</span>
            </span>
            <span>•</span>
            <span className="text-slate-500">{t.authorBio}</span>
          </div>
        </div>

        {/* Official Author Portal */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <a
            href="https://anti-christ.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-300 hover:text-amber-200 transition-colors shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.visitAuthorSite}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>
    </footer>
  );
};
