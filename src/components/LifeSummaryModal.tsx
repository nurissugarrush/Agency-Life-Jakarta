import React from 'react';
import { GameState } from '../types/game';
import { formatIDR, calculateNetWorth, createInitialCharacter } from '../game/simulation';
import { sound } from '../game/sound';
import { Award, DollarSign, Calendar, Heart, RotateCcw, ArrowRight } from 'lucide-react';

interface LifeSummaryModalProps {
  state: GameState;
  isOpen: boolean;
  onRestartNewLife: () => void;
  onContinueAsChild: (childState: GameState) => void;
}

export const LifeSummaryModal: React.FC<LifeSummaryModalProps> = ({
  state,
  isOpen,
  onRestartNewLife,
  onContinueAsChild,
}) => {
  if (!isOpen) return null;

  const netWorth = calculateNetWorth(state);
  const highestJob = state.career.currentJob || (state.career.pastJobs.length > 0 ? state.career.pastJobs[state.career.pastJobs.length - 1] : null);
  const livingChildren = state.npcs.filter((n) => n.relation === 'child' && n.alive);

  const handleContinueChild = () => {
    if (livingChildren.length === 0) return;
    sound.playAwardFanfare();

    const child = livingChildren[0];
    const inheritedWealth = Math.max(0, Math.round(netWorth * 0.8));

    const nextState = createInitialCharacter({
      name: child.name,
      gender: 'male',
      socioeconomic: 'upper_middle',
      startingMoneyIDR: inheritedWealth,
      familyWealthIDR: inheritedWealth,
      homeNeighborhood: state.character.homeNeighborhood,
    });

    onContinueAsChild(nextState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center">
        {/* Header Ribbon */}
        <div className="p-6 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-800">
          <span className="text-4xl block mb-2">🕊️</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Life Summary & Obituary
          </span>
          <h1 className="text-xl font-bold text-slate-100 mt-1">
            {state.character.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {state.character.birthYear} — {state.character.birthYear + state.character.currentAge} (Age {state.character.currentAge})
          </p>
          <p className="text-xs text-amber-300/90 italic mt-2 max-w-sm mx-auto">
            "{state.gameOverReason || 'Lived a rich, vibrant life navigating the relentless excitement of the Jakarta advertising agency industry.'}"
          </p>
        </div>

        {/* Career & Financial Stats Grid */}
        <div className="p-5 overflow-y-auto space-y-4 text-left">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Final Net Worth</span>
              <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                {formatIDR(netWorth)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Peak Agency Role</span>
              <span className="text-xs font-bold text-sky-300 truncate block mt-0.5">
                {highestJob ? highestJob.title : 'Independent Freelancer'}
              </span>
            </div>
          </div>

          {/* Trophy Case Summary */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-1.5 mb-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">
                Lifetime Awards & Honors
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-800/60">
                <span className="font-bold text-amber-300 font-mono text-sm">{state.career.cannesLionsCount}</span>
                <span className="block text-[10px] text-slate-400">Cannes Lions</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/60">
                <span className="font-bold text-amber-300 font-mono text-sm">{state.career.citraPariwaraCount}</span>
                <span className="block text-[10px] text-slate-400">Citra Pariwara</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/60">
                <span className="font-bold text-amber-300 font-mono text-sm">{state.career.totalAwardsCount}</span>
                <span className="block text-[10px] text-slate-400">Total Trophies</span>
              </div>
            </div>
          </div>

          {/* Agency Legacy */}
          {state.ownedAgency && (
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs">
              <span className="font-bold text-purple-300 block mb-0.5">
                Agency Empire: {state.ownedAgency.name}
              </span>
              <p className="text-slate-400">
                Founded in {state.ownedAgency.officeLocation}. Won {state.ownedAgency.agencyOfTheYearTitles} Agency of the Year titles at Citra Pariwara!
              </p>
            </div>
          )}

          {/* Family & Children */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 mb-1 font-bold">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Family Legacy:</span>
            </div>
            <p className="text-slate-400">
              Survived by {livingChildren.length} children and loved ones in {state.character.homeNeighborhood}, Jakarta.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
          {livingChildren.length > 0 && (
            <button
              onClick={handleContinueChild}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
            >
              <span>Continue as Child ({livingChildren[0].name}) with Inherited Wealth</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              sound.playTap();
              onRestartNewLife();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start a Fresh Life in Jakarta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
