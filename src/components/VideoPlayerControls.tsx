import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  FastForward,
  CheckCircle2,
  ListOrdered,
} from 'lucide-react';
import { PlaybackSpeed } from '../types';

interface Props {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReplay: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  currentSceneIdx: number;
  totalScenes: number;
  sceneTitles: string[];
  onSelectScene: (idx: number) => void;
  speed: PlaybackSpeed;
  onSpeedChange: (speed: PlaybackSpeed) => void;
}

export const VideoPlayerControls: React.FC<Props> = ({
  isPlaying,
  onTogglePlay,
  onReplay,
  onPrev,
  onNext,
  canPrev,
  canNext,
  currentSceneIdx,
  totalScenes,
  sceneTitles,
  onSelectScene,
  speed,
  onSpeedChange,
}) => {
  const speeds: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5];

  const progressPercent = totalScenes > 1 ? (currentSceneIdx / (totalScenes - 1)) * 100 : 0;

  return (
    <div className="w-full bg-[#0a1120]/95 border-t border-slate-800/80 px-4 sm:px-8 py-3.5 flex flex-col gap-2.5 backdrop-blur-md z-20">
      {/* Timeline scrubber with markers */}
      <div className="w-full flex flex-col gap-1">
        <div className="relative w-full h-3 flex items-center group cursor-pointer">
          {/* Background track */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Interactive Step Markers */}
          <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
            {sceneTitles.map((title, idx) => {
              const isPassed = idx <= currentSceneIdx;
              const isCurrent = idx === currentSceneIdx;
              return (
                <div
                  key={idx}
                  className="pointer-events-auto relative group/dot -translate-x-1/2 first:translate-x-0 last:translate-x-0"
                  onClick={() => onSelectScene(idx)}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                      isCurrent
                        ? 'bg-amber-400 border-amber-200 scale-125 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                        : isPassed
                        ? 'bg-amber-500/80 border-slate-900'
                        : 'bg-slate-700 border-slate-900 hover:bg-slate-500'
                    }`}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-slate-900/95 border border-slate-700 text-[11px] text-slate-200 whitespace-nowrap opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg">
                    {title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scene indicator text */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-300 font-medium">
              {sceneTitles[currentSceneIdx] || 'Bosqich'}
            </span>
          </div>
          <div className="font-math text-slate-400">
            Bosqich {currentSceneIdx + 1} / {totalScenes}
          </div>
        </div>
      </div>

      {/* Primary playback control row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Left: Replay & step navigation */}
        <div className="flex items-center gap-1.5">
          <button
            id="video-replay-btn"
            onClick={onReplay}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition-colors active:scale-95"
            title="Qaytadan boshlash"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="video-prev-btn"
            onClick={onPrev}
            disabled={!canPrev}
            className={`p-2 rounded-lg border transition-all active:scale-95 flex items-center gap-1 text-xs font-medium ${
              canPrev
                ? 'bg-slate-800/60 hover:bg-slate-700 border-slate-700/60 text-slate-200'
                : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Oldingi qadam"
          >
            <SkipBack className="w-4 h-4" />
            <span className="hidden sm:inline">Oldingi</span>
          </button>

          {/* Primary Play / Pause Button */}
          <button
            id="video-play-pause-btn"
            onClick={onTogglePlay}
            className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-md ${
              isPlaying
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 hover:bg-amber-400/30'
                : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>To‘xtatish</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Videoni ijro etish</span>
              </>
            )}
          </button>

          <button
            id="video-next-btn"
            onClick={onNext}
            disabled={!canNext}
            className={`p-2 rounded-lg border transition-all active:scale-95 flex items-center gap-1 text-xs font-medium ${
              canNext
                ? 'bg-slate-800/60 hover:bg-slate-700 border-slate-700/60 text-slate-200'
                : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Keyingi qadam"
          >
            <span className="hidden sm:inline">Keyingi</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Playback Speed selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline flex items-center gap-1">
            <FastForward className="w-3.5 h-3.5 text-slate-400" />
            Tezlik:
          </span>
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  speed === s
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Quick jump to summary rule */}
          <button
            onClick={() => onSelectScene(totalScenes - 1)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-medium transition-colors"
            title="Asosiy qoidalar xulosasiga o'tish"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Qoidalar xulosasi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
