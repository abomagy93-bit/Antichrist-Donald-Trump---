import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Radio,
  RefreshCw,
  RadioTower,
  ChevronDown,
} from 'lucide-react';
import { Language } from '../types';
import { UI_STRINGS } from '../data/translations';

// Verified, high-availability live streams for Holy Quran Radio Cairo (إذاعة القرآن الكريم من القاهرة)
export interface QuranStreamSource {
  id: string;
  name: string;
  shortName: string;
  url: string;
}

export const QURAN_STREAMS: QuranStreamSource[] = [
  {
    id: 'cairo-primary',
    name: 'إذاعة القرآن الكريم من القاهرة (بث رئيسي معتمد)',
    shortName: 'القاهرة 98.2 FM',
    url: 'https://radio.xecod.com/station/quran-cairo',
  },
  {
    id: 'cairo-jar-node',
    name: 'إذاعة القرآن الكريم - القاهرة (سيرفر احتياطي 1)',
    shortName: 'سيرفر احتياطي 1',
    url: 'https://n0a.radiojar.com/8s5u5tpdtwzuv',
  },
  {
    id: 'cairo-jar-canonical',
    name: 'إذاعة القرآن الكريم - القاهرة (سيرفر احتياطي 2)',
    shortName: 'سيرفر احتياطي 2',
    url: 'https://stream.radiojar.com/8s5u5tpdtwzuv',
  },
  {
    id: 'quran-tarateel',
    name: 'تلاوات وتراتيل القرآن الكريم (بث نقي)',
    shortName: 'تلاوات وتراتيل',
    url: 'https://qurango.net/radio/tarateel',
  },
];

interface QuranRadioProps {
  currentLang: Language;
}

export const QuranRadio: React.FC<QuranRadioProps> = ({ currentLang }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [streamIndex, setStreamIndex] = useState<number>(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [showServerMenu, setShowServerMenu] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeMenuRef = useRef<HTMLDivElement>(null);
  const serverMenuRef = useRef<HTMLDivElement>(null);

  const t = UI_STRINGS[currentLang] || UI_STRINGS.ar;
  const currentStream = QURAN_STREAMS[streamIndex] || QURAN_STREAMS[0];

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (volumeMenuRef.current && !volumeMenuRef.current.contains(e.target as Node)) {
        setShowVolumeSlider(false);
      }
      if (serverMenuRef.current && !serverMenuRef.current.contains(e.target as Node)) {
        setShowServerMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playCurrentStream = useCallback(async () => {
    if (!audioRef.current) return;
    setIsLoading(true);
    setHasError(false);

    try {
      audioRef.current.src = currentStream.url;
      audioRef.current.load();
      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch {
      // Auto failover to next stream
      if (streamIndex + 1 < QURAN_STREAMS.length) {
        setStreamIndex((prev) => prev + 1);
      } else {
        setIsLoading(false);
        setIsPlaying(false);
        setHasError(true);
      }
    }
  }, [currentStream.url, streamIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsLoading(false);
    } else {
      playCurrentStream();
    }
  };

  const handleAudioError = () => {
    if (streamIndex + 1 < QURAN_STREAMS.length) {
      const nextIndex = streamIndex + 1;
      setStreamIndex(nextIndex);
      if (audioRef.current) {
        audioRef.current.src = QURAN_STREAMS[nextIndex].url;
        audioRef.current.load();
        if (isPlaying) {
          audioRef.current.play().catch(() => {});
        }
      }
    } else {
      setIsLoading(false);
      setIsPlaying(false);
      setHasError(true);
    }
  };

  const retryPlayback = () => {
    setStreamIndex(0);
    setHasError(false);
    setIsLoading(true);
    if (audioRef.current) {
      audioRef.current.src = QURAN_STREAMS[0].url;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => {
          if (QURAN_STREAMS.length > 1) {
            setStreamIndex(1);
          } else {
            setIsLoading(false);
            setHasError(true);
          }
        });
    }
  };

  const selectStream = (idx: number) => {
    setStreamIndex(idx);
    setShowServerMenu(false);
    setHasError(false);
    setIsLoading(true);
    if (audioRef.current) {
      audioRef.current.src = QURAN_STREAMS[idx].url;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          setHasError(true);
        });
    }
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-900/90 border border-emerald-500/30 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm max-w-[260px] sm:max-w-none shrink-0">
      <audio
        ref={audioRef}
        src={currentStream.url}
        preload="none"
        onError={handleAudioError}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
          setHasError(false);
        }}
        onPause={() => setIsPlaying(false)}
      />

      {/* Play / Pause Main Trigger */}
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className={`relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl font-bold transition-all shadow-sm active:scale-95 shrink-0 ${
          isPlaying
            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/30 ring-2 ring-amber-400/50'
            : hasError
            ? 'bg-rose-600 text-white hover:bg-rose-500'
            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/30'
        }`}
        title={isPlaying ? t.pauseRadio : t.playRadio}
        aria-label={isPlaying ? t.pauseRadio : t.playRadio}
      >
        {isLoading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
        ) : isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current ms-0.5" />
        )}

        {/* Pulsing live badge when playing */}
        {isPlaying && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
      </button>

      {/* Radio Station Info & Equalizer */}
      <div className="flex flex-col text-right rtl:text-right ltr:text-left leading-none min-w-0">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="font-bold text-[11px] sm:text-xs text-amber-200 tracking-tight flex items-center gap-1 truncate">
            <Radio className={`w-3 h-3 text-emerald-400 shrink-0 ${isPlaying ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline truncate">{t.radioTitle}</span>
            <span className="sm:hidden truncate">القرآن الكريم</span>
          </span>

          {/* Live Badge */}
          <span className="px-1 py-0.2 text-[8px] sm:text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider shrink-0">
            {t.live}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] sm:text-[10px] text-slate-300 flex items-center gap-0.5 shrink-0">
            <RadioTower className="w-2.5 h-2.5 text-emerald-400" />
            <span className="font-mono text-emerald-300/90 font-semibold">98.2 FM</span>
          </span>

          {/* Sound wave bars when playing */}
          {isPlaying ? (
            <div className="flex items-center gap-0.5 h-2.5">
              <span className="w-0.5 bg-emerald-400 rounded-full animate-wave-1"></span>
              <span className="w-0.5 bg-emerald-300 rounded-full animate-wave-2"></span>
              <span className="w-0.5 bg-amber-400 rounded-full animate-wave-3"></span>
              <span className="w-0.5 bg-emerald-400 rounded-full animate-wave-4"></span>
            </div>
          ) : (
            <span className="text-[9px] text-slate-400 hidden md:inline truncate">القاهرة</span>
          )}
        </div>
      </div>

      {/* Error Retry Indicator */}
      {hasError && (
        <button
          onClick={retryPlayback}
          className="flex items-center gap-1 text-[9px] text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-700/60 px-1.5 py-0.5 rounded transition-colors shrink-0"
          title={t.retry}
        >
          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
          <span>{t.retry}</span>
        </button>
      )}

      {/* Volume Control Popover (Hidden on small mobile to conserve horizontal space) */}
      <div className="relative hidden sm:block shrink-0" ref={volumeMenuRef}>
        <button
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          className="text-slate-400 hover:text-amber-300 p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          title={t.volume}
          aria-label={t.volume}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </button>

        {showVolumeSlider && (
          <div className="absolute top-full end-0 mt-2 p-2 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 flex items-center gap-2 w-32">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Stream / Server Switcher Dropdown (Desktop only) */}
      <div className="relative hidden lg:block shrink-0" ref={serverMenuRef}>
        <button
          onClick={() => setShowServerMenu(!showServerMenu)}
          className="flex items-center gap-1 text-[10px] font-semibold text-slate-300 hover:text-amber-300 bg-slate-800/70 border border-slate-700/70 px-1.5 py-0.5 rounded transition-colors"
          title="تغيير سيرفر البث"
        >
          <span className="max-w-[65px] truncate">{currentStream.shortName}</span>
          <ChevronDown className="w-2.5 h-2.5" />
        </button>

        {showServerMenu && (
          <div className="absolute top-full end-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl py-1 z-50">
            <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              سيرفرات إذاعة القرآن الكريم
            </div>
            {QURAN_STREAMS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => selectStream(idx)}
                className={`w-full text-right rtl:text-right ltr:text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                  streamIndex === idx
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="truncate">{s.name}</span>
                {streamIndex === idx && <span className="text-[10px] text-emerald-400">نشط</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
