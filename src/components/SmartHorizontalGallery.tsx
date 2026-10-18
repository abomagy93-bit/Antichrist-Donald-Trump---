import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Grid,
  SlidersHorizontal,
  ExternalLink,
  Play,
  Pause,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Eye,
} from 'lucide-react';
import { GalleryImage, Language } from '../types';
import { UI_STRINGS } from '../data/translations';

interface SmartHorizontalGalleryProps {
  images: GalleryImage[];
  currentLang: Language;
}

export const SmartHorizontalGallery: React.FC<SmartHorizontalGalleryProps> = ({
  images,
  currentLang,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'horizontal' | 'grid'>('horizontal');
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);

  const t = UI_STRINGS[currentLang];
  const isRtl = ['ar', 'fa', 'ur', 'he'].includes(currentLang);

  const stripRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRenderRef = useRef<boolean>(true);

  const getLoc = useCallback(
    (obj: any): string => {
      if (!obj) return '';
      if (typeof obj === 'string') return obj;
      return obj[currentLang] || obj.ar || obj.en || '';
    },
    [currentLang]
  );

  // Next / Previous helpers
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleLightboxNext = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
    setLightboxZoom(1);
  }, [images.length]);

  const handleLightboxPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
    setLightboxZoom(1);
  }, [images.length]);

  // Autoplay functionality
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        handleNext();
      }, 4000);
    } else if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, handleNext]);

  // Scroll active thumbnail inside the horizontal strip container only (never scroll the window)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (stripRef.current) {
      const activeThumb = stripRef.current.children[activeIndex] as HTMLElement;
      if (activeThumb) {
        const container = stripRef.current;
        const thumbOffset = activeThumb.offsetLeft;
        const thumbWidth = activeThumb.offsetWidth;
        const containerWidth = container.offsetWidth;
        container.scrollTo({
          left: thumbOffset - containerWidth / 2 + thumbWidth / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [activeIndex]);

  // Lightbox keyboard shortcuts
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        if (isRtl) handleLightboxPrev();
        else handleLightboxNext();
      } else if (e.key === 'ArrowLeft') {
        if (isRtl) handleLightboxNext();
        else handleLightboxPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handleLightboxNext, handleLightboxPrev, isRtl]);

  const openLightboxAt = (index: number) => {
    setLightboxIndex(index);
    setLightboxZoom(1);
    setIsLightboxOpen(true);
  };

  const activeImage = images[activeIndex] || images[0];
  const activeTitle = getLoc(activeImage.title);
  const activeCaption = getLoc(activeImage.caption);

  return (
    <div className="w-full my-8">
      {/* Gallery Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-3 rounded-xl bg-slate-900/90 border border-amber-500/20 backdrop-blur-md">
        {/* Gallery Title & Count Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-amber-200 font-bold text-sm sm:text-base flex items-center gap-2">
              <span>{t.galleryTitle}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                {images.length} {t.imageCount}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {viewMode === 'horizontal' ? t.galleryHorizontalView : t.galleryGridView}
            </div>
          </div>
        </div>

        {/* Action Buttons: Autoplay & View Mode Switch */}
        <div className="flex items-center gap-2">
          {viewMode === 'horizontal' && (
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isAutoPlaying
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
              title={isAutoPlaying ? t.pauseAutoPlay : t.autoPlay}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.pauseAutoPlay}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{t.autoPlay}</span>
                </>
              )}
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('horizontal')}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'horizontal'
                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.galleryHorizontalView}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.galleryHorizontalView}</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.galleryGridView}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.galleryGridView}</span>
            </button>
          </div>
        </div>
      </div>

      {/* HORIZONTAL SMART VIEW */}
      {viewMode === 'horizontal' && (
        <div className="space-y-4">
          {/* Main Large Showcase Card */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-slate-950 shadow-2xl group">
            {/* Image Container with Aspect Ratio */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full flex items-center justify-center bg-black/80 overflow-hidden">
              <img
                src={activeImage.url}
                alt={activeTitle || `Visual document ${activeIndex + 1}`}
                className="w-full h-full object-contain cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                onClick={() => openLightboxAt(activeIndex)}
                loading="eager"
              />

              {/* Navigation Arrows: Left & Right */}
              <button
                onClick={handlePrev}
                className="absolute start-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-950/80 hover:bg-amber-600 border border-amber-500/40 text-white flex items-center justify-center transition-all shadow-xl backdrop-blur-md opacity-80 hover:opacity-100 focus:outline-none"
                aria-label={t.previous}
              >
                {isRtl ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
              </button>

              <button
                onClick={handleNext}
                className="absolute end-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-950/80 hover:bg-amber-600 border border-amber-500/40 text-white flex items-center justify-center transition-all shadow-xl backdrop-blur-md opacity-80 hover:opacity-100 focus:outline-none"
                aria-label={t.next}
              >
                {isRtl ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
              </button>

              {/* Top Overlay Badges */}
              <div className="absolute top-3 start-3 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-lg">
                  {activeIndex + 1} / {images.length}
                </span>
              </div>

              {/* Top Right Zoom Button */}
              <div className="absolute top-3 end-3 flex items-center gap-2">
                <button
                  onClick={() => openLightboxAt(activeIndex)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950/85 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 text-white text-xs font-medium backdrop-blur-md flex items-center gap-1.5 transition-all shadow-lg"
                  title={t.openFullscreen}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.openFullscreen}</span>
                </button>
              </div>
            </div>

            {/* Showcase Caption & Details Bar */}
            <div className="p-4 sm:p-5 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900/90 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <h4 className="text-base sm:text-lg font-bold text-amber-200 mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    {activeTitle || `${t.imageCount} #${activeIndex + 1}`}
                  </h4>
                  {activeCaption && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {activeCaption}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Smart Horizontal Scroll Strip (Thumbnails) */}
          <div className="relative">
            {/* Scroll Container */}
            <div
              ref={stripRef}
              className="flex gap-2.5 overflow-x-auto py-2 px-1 scroll-smooth snap-x snap-mandatory focus:outline-none scrollbar-thin scrollbar-thumb-amber-500/40 scrollbar-track-slate-900"
              style={{ scrollbarWidth: 'thin' }}
            >
              {images.map((img, index) => {
                const isActive = index === activeIndex;
                const thumbTitle = getLoc(img.title);

                return (
                  <button
                    key={img.id || index}
                    onClick={() => setActiveIndex(index)}
                    className={`relative flex-shrink-0 w-24 sm:w-28 h-18 sm:h-20 rounded-xl overflow-hidden border-2 transition-all snap-center focus:outline-none group ${
                      isActive
                        ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105 shadow-lg shadow-amber-500/20'
                        : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                    }`}
                    title={thumbTitle || `${index + 1}`}
                  >
                    <img
                      src={img.url}
                      alt={thumbTitle || `Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />

                    {/* Thumbnail Number Badge */}
                    <span
                      className={`absolute bottom-1 end-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-black/70 text-slate-300'
                      }`}
                    >
                      {index + 1}
                    </span>

                    {isActive && (
                      <div className="absolute inset-0 bg-amber-500/10 pointer-events-none"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {images.map((img, index) => {
            const cardTitle = getLoc(img.title);
            const cardCaption = getLoc(img.caption);

            return (
              <div
                key={img.id || index}
                className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900/90 hover:border-amber-500/50 transition-all hover:shadow-xl hover:shadow-amber-500/10 flex flex-col cursor-pointer"
                onClick={() => openLightboxAt(index)}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/50">
                  <img
                    src={img.url}
                    alt={cardTitle || `Image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Number Tag */}
                  <span className="absolute top-2 start-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-amber-300 text-[11px] font-mono font-bold border border-amber-500/30">
                    #{index + 1}
                  </span>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2 rounded-full bg-amber-500 text-slate-950 transform translate-y-2 group-hover:translate-y-0 transition-transform shadow-lg">
                      <Eye className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Card Title */}
                <div className="p-2.5 text-start">
                  <p className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {cardTitle || `${t.imageCount} #${index + 1}`}
                  </p>
                  {cardCaption && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {cardCaption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between"
          role="dialog"
          aria-modal="true"
        >
          {/* Lightbox Header Bar */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80">
            {/* Title & Counter */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-xs sm:text-sm font-bold">
                {lightboxIndex + 1} / {images.length}
              </span>
              <h3 className="text-white font-bold text-sm sm:text-base line-clamp-1">
                {getLoc(images[lightboxIndex]?.title) || `${t.imageCount} #${lightboxIndex + 1}`}
              </h3>
            </div>

            {/* Actions: Zoom Controls, Original Link, Close */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLightboxZoom((prev) => Math.min(prev + 0.25, 3))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLightboxZoom((prev) => Math.max(prev - 0.25, 0.75))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              {lightboxZoom !== 1 && (
                <button
                  onClick={() => setLightboxZoom(1)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors ms-2"
                title={t.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Stage */}
          <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
            <img
              src={images[lightboxIndex]?.url}
              alt={getLoc(images[lightboxIndex]?.title) || `Visual Document ${lightboxIndex + 1}`}
              className="max-h-[80vh] max-w-[90vw] object-contain transition-transform duration-200 select-none shadow-2xl"
              style={{ transform: `scale(${lightboxZoom})` }}
            />

            {/* Navigation Buttons: Prev & Next */}
            <button
              onClick={handleLightboxPrev}
              className="absolute start-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/80 hover:bg-amber-600 border border-amber-500/40 text-white flex items-center justify-center transition-all shadow-2xl backdrop-blur-md"
              aria-label={t.previous}
            >
              {isRtl ? <ChevronRight className="w-7 h-7" /> : <ChevronLeft className="w-7 h-7" />}
            </button>

            <button
              onClick={handleLightboxNext}
              className="absolute end-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/80 hover:bg-amber-600 border border-amber-500/40 text-white flex items-center justify-center transition-all shadow-2xl backdrop-blur-md"
              aria-label={t.next}
            >
              {isRtl ? <ChevronLeft className="w-7 h-7" /> : <ChevronRight className="w-7 h-7" />}
            </button>
          </div>

          {/* Lightbox Footer Caption */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-center">
            {getLoc(images[lightboxIndex]?.caption) && (
              <p className="text-sm text-slate-300 max-w-2xl mx-auto">
                {getLoc(images[lightboxIndex]?.caption)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
