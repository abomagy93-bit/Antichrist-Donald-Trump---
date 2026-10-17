import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ExternalLink,
  Share2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { ResearchArticle, Language } from '../types';
import { UI_STRINGS } from '../data/translations';
import { SmartHorizontalGallery } from './SmartHorizontalGallery';
import { ShareModal } from './ShareModal';

interface ArticleViewProps {
  article: ResearchArticle;
  currentLang: Language;
}

const FormattedContent: React.FC<{ text: string; className?: string }> = ({
  text,
  className = '',
}) => {
  if (!text) return null;

  const blocks = text.split(/\n\s*\n/);

  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed === '---' || trimmed === '----------------' || trimmed === '---------------------' || trimmed === '------------------------' || trimmed === '----------------------------') {
          return (
            <div key={index} className="my-6 flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent w-full max-w-md"></div>
            </div>
          );
        }

        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.replace(/^###\s+/, '').replace(/\*\*/g, '');
          return (
            <h3
              key={index}
              className="text-2xl sm:text-3xl font-black text-amber-300 mt-8 mb-4 tracking-wide pb-2 border-b border-amber-500/20"
            >
              {headingText}
            </h3>
          );
        }

        if (trimmed.startsWith('#### ')) {
          const subHeadingText = trimmed.replace(/^####\s+/, '').replace(/\*\*/g, '');
          return (
            <h4
              key={index}
              className="text-xl sm:text-2xl font-bold text-amber-200/90 mt-6 mb-3 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
              {subHeadingText}
            </h4>
          );
        }

        if (/^(\*\*)?\d+\./.test(trimmed)) {
          return (
            <div
              key={index}
              className="mt-6 mb-2 text-lg sm:text-xl font-bold text-amber-100/95 p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 shadow-sm"
            >
              <RenderInlineText text={trimmed} />
            </div>
          );
        }

        const lines = trimmed.split('\n');
        const isBulletList = lines.every((line) => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('* '));

        if (isBulletList) {
          return (
            <ul key={index} className="space-y-2.5 my-3 ps-2">
              {lines.map((line, lIdx) => {
                const bulletContent = line.replace(/^[•\-*]\s*/, '').trim();
                return (
                  <li key={lIdx} className="flex items-start gap-2.5 text-slate-200">
                    <span className="text-amber-400 font-bold mt-1 text-base leading-none select-none">
                      •
                    </span>
                    <span className="flex-1">
                      <RenderInlineText text={bulletContent} />
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Standard paragraph
        return (
          <p key={index} className="text-slate-200/90 leading-relaxed text-justify">
            <RenderInlineText text={trimmed} />
          </p>
        );
      })}
    </div>
  );
};

// Inline parser for bold (**text**), italic (*text*), and external URLs
const RenderInlineText: React.FC<{ text: string }> = ({ text }) => {
  // Regex to split by bold (**...**) and links
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|https?:\/\/[^\s]+|kareem-ashmawy\.netlify\.app)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;

        // Bold
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          return (
            <strong key={i} className="font-extrabold text-amber-300/95">
              {content}
            </strong>
          );
        }

        // Italic
        if (part.startsWith('*') && part.endsWith('*')) {
          const content = part.slice(1, -1);
          return (
            <em key={i} className="italic text-slate-300">
              {content}
            </em>
          );
        }

        // Website mention
        if (part === 'kareem-ashmawy.netlify.app' || part.startsWith('http')) {
          const url = part.startsWith('http') ? part : `https://${part}`;
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline underline-offset-4 font-medium inline-flex items-center gap-1 mx-1"
            >
              <span>{part}</span>
              <ExternalLink className="w-3 h-3 inline" />
            </a>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export const ArticleView: React.FC<ArticleViewProps> = ({ article, currentLang }) => {
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const t = UI_STRINGS[currentLang];

  // Safely extract localized strings with fallback
  const getLoc = (obj: any): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[currentLang] || obj.ar || obj.en || '';
  };

  const title = getLoc(article.title);
  const subtitle = getLoc(article.subtitle);
  const authorTitle = getLoc(article.authorTitle);
  const featuredImageCaption = getLoc(article.featuredImageCaption);
  const introduction = getLoc(article.introduction);
  const conclusion = getLoc(article.conclusion);

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const contentFontSizeClass = 'text-base sm:text-lg lg:text-[1.125rem] leading-relaxed sm:leading-loose text-slate-200';

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header & Meta */}
      <header className="mb-8 text-center">
        {/* Research Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold mb-5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{authorTitle || t.authorBio}</span>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-amber-100 mb-5 leading-tight tracking-tight">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto mb-6 leading-relaxed">
          {subtitle}
        </p>

        {/* Author & Publish Info Bar + Share Action */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-400 py-3 border-y border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-amber-300">{article.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-medium text-slate-300">{article.publishedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.readTime}</span>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-all active:scale-95"
            title={t.share}
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.share}</span>
          </button>
        </div>
      </header>

      {/* Hero Featured Image */}
      {article.featuredImageUrl && (
        <div className="mb-12 rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-950 shadow-2xl relative group">
          <div className="relative w-full min-h-[300px] max-h-[580px] flex items-center justify-center bg-gradient-to-b from-slate-950 via-black to-slate-950 p-2 sm:p-4">
            <img
              src={article.featuredImageUrl}
              alt={featuredImageCaption || title}
              className="max-h-[540px] w-auto max-w-full rounded-xl object-contain shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]"
            />
            {/* Quick Share Overlay Badge */}
            <button
              onClick={handleShare}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-amber-600 text-amber-300 hover:text-slate-950 text-xs font-semibold backdrop-blur-md border border-amber-500/40 shadow-lg transition-colors cursor-pointer"
              title="مشاركة صورة الغلاف والبحث"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.share}</span>
            </button>
          </div>
          {featuredImageCaption && (
            <div className="p-3.5 text-xs sm:text-sm text-center text-amber-200/90 border-t border-slate-800 bg-slate-950/80 font-medium">
              {featuredImageCaption}
            </div>
          )}
        </div>
      )}

      {/* Introduction Section */}
      <section className="mb-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-4">
          <BookOpen className="w-4 h-4" />
          <span>مقدمة البحث التحليلي / Executive Summary</span>
        </div>
        <FormattedContent text={introduction} className={contentFontSizeClass} />
      </section>

      {/* Sections (Gallery, Part Two Details, Video, etc.) */}
      <div className="space-y-12">
        {article.sections.map((section) => {
          const secHeading = getLoc(section.heading);
          const secContent = getLoc(section.content);
          const secCaption = getLoc(section.media?.caption);

          return (
            <section
              key={section.id}
              id={section.id}
              className="bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm"
            >
              {/* Section Heading */}
              {secHeading && (
                <h2 className="text-2xl sm:text-3xl font-black text-amber-200 mb-6 border-b border-amber-500/20 pb-4">
                  {secHeading}
                </h2>
              )}

              {/* Section Content */}
              {secContent && (
                <div className="mb-8">
                  <FormattedContent text={secContent} className={contentFontSizeClass} />
                </div>
              )}

              {/* Smart Horizontal Image Gallery */}
              {((section.gallery && section.gallery.length > 0) ||
                (section.id === 'sec-photos-gallery' && article.gallery && article.gallery.length > 0)) && (
                <SmartHorizontalGallery
                  images={section.gallery || article.gallery || []}
                  currentLang={currentLang}
                />
              )}

              {/* Section Media (Video or single Image) */}
              {section.media && section.media.type === 'video' && section.media.url && (
                <div className="space-y-3">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl bg-black">
                    <iframe
                      src={section.media.url}
                      title={secCaption || secHeading}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                  {secCaption && (
                    <p className="text-center text-xs sm:text-sm text-amber-400/90 font-medium pt-1">
                      {secCaption}
                    </p>
                  )}
                </div>
              )}

              {section.media && section.media.type === 'image' && section.media.url && !section.gallery && (
                <div className="space-y-3">
                  <div className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                    <img
                      src={section.media.url}
                      alt={secCaption || secHeading}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  {secCaption && (
                    <p className="text-center text-xs sm:text-sm text-slate-400">
                      {secCaption}
                    </p>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Conclusion Section */}
      {conclusion && (
        <section className="mt-16 p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-amber-900/30 border-2 border-amber-500/40 shadow-2xl">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-lg sm:text-xl mb-6">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{t.conclusionTitle}</span>
          </div>
          <FormattedContent text={conclusion} className={contentFontSizeClass} />
        </section>
      )}

      {/* Share Modal Dialog with Thumbnail and Direct Platforms */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={title}
        subtitle={subtitle}
        author={article.author}
        imageUrl={article.featuredImageUrl || 'https://i.ibb.co/8gpv9njM/1792275042204.jpg'}
        currentLang={currentLang}
      />
    </article>
  );
};
