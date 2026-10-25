import React from 'react';
import { GameState, CharacterStats } from '../types/game';
import { formatIDR } from '../game/simulation';
import { sound } from '../game/sound';
import { Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';

interface TopStatusBarProps {
  state: GameState;
  onOpenGodMode: () => void;
  onRestart: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({ state, onOpenGodMode, onRestart }) => {
  const [isMuted, setIsMuted] = React.useState(sound.isMuted());

  const toggleSound = () => {
    const next = !isMuted;
    sound.setMuted(next);
    setIsMuted(next);
    if (!next) sound.playTap();
  };

  const statConfig: {
    key: keyof CharacterStats;
    label: string;
    color: string;
    bgColor: string;
  }[] = [
    { key: 'happiness', label: 'Happy', color: 'bg-emerald-500', bgColor: 'bg-emerald-950/40' },
    { key: 'health', label: 'Health', color: 'bg-rose-500', bgColor: 'bg-rose-950/40' },
    { key: 'intelligence', label: 'Smarts', color: 'bg-sky-500', bgColor: 'bg-sky-950/40' },
    { key: 'creativity', label: 'Creative', color: 'bg-purple-500', bgColor: 'bg-purple-950/40' },
    { key: 'looks', label: 'Looks', color: 'bg-pink-500', bgColor: 'bg-pink-950/40' },
    { key: 'stress', label: 'Stress', color: 'bg-amber-500', bgColor: 'bg-amber-950/40' },
  ];

  const currentJobTitle = state.career.currentJob
    ? `${state.career.currentJob.title} @ ${state.career.currentJob.agencyName}`
    : state.stage === 'university'
    ? `Student @ ${state.education.university?.name || 'UI Depok'}`
    : state.stage === 'child' || state.stage === 'teen'
    ? 'Student in Jakarta'
    : state.stage === 'baby'
    ? 'Infant / Toddler'
    : 'Unemployed / Freelance';

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3.5 py-2.5 shadow-md">
      {/* Top line: Character identity, Quick actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-2xl select-none shrink-0" role="img" aria-label="avatar">
            {state.character.avatarEmoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                {state.character.name}
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Age {state.character.currentAge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {currentJobTitle}
            </p>
          </div>
        </div>

        {/* Money & Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-emerald-400 font-mono tabular-nums">
              {formatIDR(state.moneyIDR)}
            </div>
            <div className="text-[9px] text-slate-500">
              {state.character.homeNeighborhood}
            </div>
          </div>

          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onOpenGodMode}
            aria-label="Open God Mode"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-semibold hover:border-amber-400 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">God Mode</span>
          </button>

          <button
            onClick={onRestart}
            aria-label="Restart Life"
            title="Start New Life"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stat Meters Grid */}
      <div className="grid grid-cols-6 gap-1.5 mt-2 pt-2 border-t border-slate-800/80">
        {statConfig.map((stat) => {
          const val = state.stats[stat.key];
          return (
            <div key={stat.key} className="flex flex-col gap-0.5">
              <div className="flex justify-between items-center text-[9px] leading-tight">
                <span className="text-slate-400 font-medium truncate">{stat.label}</span>
                <span className="font-mono text-slate-300 tabular-nums">{val}%</span>
              </div>
              <div className={`h-1.5 w-full rounded-full ${stat.bgColor} overflow-hidden`}>
                <div
                  className={`h-full rounded-full ${stat.color} transition-all duration-300`}
                  style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </header>
  );
};
