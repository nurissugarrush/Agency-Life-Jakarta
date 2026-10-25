import React from 'react';
import { GameState } from '../types/game';
import { sound } from '../game/sound';
import { Plus, Award, AlertCircle, Briefcase, GraduationCap, Heart, Sparkles, Building2 } from 'lucide-react';

interface LifeFeedProps {
  state: GameState;
  onAdvanceAge: () => void;
  onOpenPendingEvent: () => void;
  onOpenPendingBrief: () => void;
}

export const LifeFeed: React.FC<LifeFeedProps> = ({
  state,
  onAdvanceAge,
  onOpenPendingEvent,
  onOpenPendingBrief,
}) => {
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'award':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'career':
        return <Briefcase className="w-4 h-4 text-sky-400" />;
      case 'school':
        return <GraduationCap className="w-4 h-4 text-indigo-400" />;
      case 'relationship':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'birth':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'finance':
        return <Building2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-slate-600" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Pending Action Banners */}
      {state.currentPendingBrief && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-amber-200">
                New Client Campaign Brief!
              </h2>
              <p className="text-xs text-amber-300/80 mt-0.5 line-clamp-2">
                {state.currentPendingBrief.clientName}: {state.currentPendingBrief.productName}
              </p>
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenPendingBrief();
                }}
                className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all active:scale-95"
              >
                Review Brief & Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {state.currentPendingEvent && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-sky-500/20 border border-purple-500/40 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 shrink-0">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-purple-200">
                {state.currentPendingEvent.title}
              </h2>
              <p className="text-xs text-purple-300/80 mt-0.5 line-clamp-2">
                {state.currentPendingEvent.description}
              </p>
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenPendingEvent();
                }}
                className="mt-3 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all active:scale-95"
              >
                Make Your Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prominent + AGE Button */}
      <div className="pt-1">
        <button
          onClick={() => {
            sound.playAgeUp();
            onAdvanceAge();
          }}
          disabled={state.isGameOver}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-xl transition-all duration-200 active:scale-[0.98] ${
            state.isGameOver
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20 hover:shadow-emerald-500/30'
          }`}
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>+ AGE (Advance to Year {state.character.birthYear + state.character.currentAge + 1})</span>
        </button>
        <p className="text-center text-[11px] text-slate-500 mt-1.5">
          Advance 1 year · Collect salary & THR · Unlock life events
        </p>
      </div>

      {/* Chronological Life Events Timeline */}
      <div className="space-y-3 mt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Life Chronology
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            {state.history.length} Milestones
          </span>
        </div>

        <div className="space-y-2.5">
          {state.history.map((event) => (
            <div
              key={event.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm flex items-start gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-slate-800/80 shrink-0 mt-0.5">
                {getCategoryIcon(event.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-200 truncate">
                    {event.title}
                  </h3>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                    {event.year} (Age {event.age})
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
