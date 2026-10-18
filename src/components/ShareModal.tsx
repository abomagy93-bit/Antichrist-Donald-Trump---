import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  ExternalLink,
  Download,
  Eye,
} from 'lucide-react';
import { Language } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  author: string;
  imageUrl: string;
  currentLang: Language;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  author,
  imageUrl,
  currentLang,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://anti-christ.netlify.app';
  const encodedUrl = encodeURIComponent(currentUrl);
  const shareText = `${title}\n${author}\n\n${subtitle.slice(0, 160)}...`;
  const encodedText = encodeURIComponent(shareText);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyImageUrl = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${title} - ${author}`,
          url: currentUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + '\n' + author + '\n' + currentUrl)}`,
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-sky-500 hover:bg-sky-400 text-white',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-slate-800 hover:bg-slate-700 text-white',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-500 text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-600 text-white',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  const isRtl = currentLang === 'ar' || currentLang === 'fa';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100"
        onClick={(e) => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400">
            <Share2 className="w-5 h-5" />
            <h3 className="font-bold text-lg text-white">
              {isRtl ? 'مشاركة البحث والصورة عبر المنصات' : 'Share Research & Preview'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Social Card Preview with introduction thumbnail */}
        <div className="my-5 rounded-xl border border-slate-700 bg-slate-950/70 overflow-hidden shadow-lg">
          <div className="relative aspect-video w-full bg-slate-950 overflow-hidden group">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-semibold text-amber-300 border border-amber-500/30">
              {isRtl ? 'صورة الغلاف والمعاينة (Thumbnail)' : 'Social Share Card Thumbnail'}
            </div>
          </div>
          <div className="p-3.5 space-y-1 bg-slate-900/90 border-t border-slate-800">
            <p className="text-xs text-amber-400 font-semibold tracking-wide">
              anti-christ.netlify.app
            </p>
            <h4 className="font-bold text-sm text-slate-100 line-clamp-2">
              {title}
            </h4>
            <p className="text-xs text-slate-400 line-clamp-2">
              {subtitle}
            </p>
          </div>
        </div>

        {/* One-click share buttons */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400">
            {isRtl ? 'مشاركة مباشرة بنقرة واحدة:' : 'Direct One-Click Share:'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {shareLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-xs transition-transform hover:scale-102 shadow-md ${item.color}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </a>
              );
            })}

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-xs bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-transform hover:scale-102 shadow-md col-span-2 sm:col-span-1"
              >
                <Share2 className="w-4 h-4" />
                <span>{isRtl ? 'مشاركة النظام' : 'Device Share'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Copy Link & Image Tools */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
          {/* Link Copy */}
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-transparent text-xs text-slate-300 outline-none px-2 font-mono truncate"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-950" />
                  <span>{isRtl ? 'تم النسخ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'نسخ الرابط' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          {/* Direct Image Link */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 px-1">
            <span className="flex items-center gap-1 text-[11px]">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              {isRtl ? 'صورة الغلاف (1024x1024 High-Res)' : 'Thumbnail direct image'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyImageUrl}
                className="hover:text-amber-300 underline transition-colors cursor-pointer"
              >
                {copiedImage ? (isRtl ? 'تم نسخ رابط الصورة' : 'Copied Image URL') : (isRtl ? 'نسخ رابط الصورة' : 'Copy Image Link')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
