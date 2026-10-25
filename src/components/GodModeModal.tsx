import React, { useState } from 'react';
import { GameState, CharacterStats } from '../types/game';
import {
  godModeSetStat,
  godModeSetMoney,
  godModeWinAward,
  formatIDR,
  requestPromotion,
} from '../game/simulation';
import { sound } from '../game/sound';
import { Sparkles, DollarSign, Award, Heart, Zap, X, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GodModeModalProps {
  state: GameState;
  isOpen: boolean;
  onClose: () => void;
  onUpdateState: (newState: GameState) => void;
}

export const GodModeModal: React.FC<GodModeModalProps> = ({
  state,
  isOpen,
  onClose,
  onUpdateState,
}) => {
  const [customMoney, setCustomMoney] = useState<string>('1000000000'); // 1 Billion IDR

  if (!isOpen) return null;

  const handleStatChange = (statKey: keyof CharacterStats, value: number) => {
    sound.playTap();
    const updated = godModeSetStat(state, statKey, value);
    onUpdateState(updated);
  };

  const handleSetPresetMoney = (amount: number) => {
    sound.playCash();
    const updated = godModeSetMoney(state, amount);
    onUpdateState(updated);
  };

  const handleSetCustomMoney = () => {
    const val = parseInt(customMoney, 10);
    if (!isNaN(val)) {
      handleSetPresetMoney(val);
    }
  };

  const handleWinInstantAward = (type: 'cannes' | 'citra') => {
    sound.playAwardFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    if (type === 'cannes') {
      const updated = godModeWinAward(state, 'cannes_lions', 'grand_prix_or_pencil');
      onUpdateState(updated);
    } else {
      const updated = godModeWinAward(state, 'citra_pariwara', 'gold');
      onUpdateState(updated);
    }
  };

  const handleInstantPromotion = () => {
    sound.playTap();
    const res = requestPromotion(state);
    if (res.success) {
      sound.playAwardFanfare();
      confetti({ particleCount: 60, spread: 60 });
      onUpdateState(res.newState);
    } else {
      // Force promote through God Mode
      const next = JSON.parse(JSON.stringify(state)) as GameState;
      if (next.career.currentJob) {
        next.career.currentJob.level += 1;
        next.career.currentJob.monthlySalaryIDR = Math.round(next.career.currentJob.monthlySalaryIDR * 1.5);
        next.career.currentJob.performance = 90;
        next.career.industryReputation = Math.min(100, next.career.industryReputation + 15);
        next.stats.happiness = 100;
        sound.playAwardFanfare();
        confetti({ particleCount: 60, spread: 60 });
        onUpdateState(next);
      }
    }
  };

  const handleHealAll = () => {
    sound.playTap();
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    next.stats.health = 100;
    next.stats.stress = 0;
    next.stats.happiness = 100;
    onUpdateState(next);
  };

  const handleMaxRelationships = () => {
    sound.playTap();
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    for (const npc of next.npcs) {
      if (npc.alive) npc.relationshipScore = 100;
    }
    onUpdateState(next);
  };

  const handleClearDebt = () => {
    sound.playCash();
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    next.debtIDR = 0;
    onUpdateState(next);
  };

  const statsList: { key: keyof CharacterStats; label: string; color: string }[] = [
    { key: 'happiness', label: 'Happiness', color: 'accent-emerald-500' },
    { key: 'health', label: 'Health', color: 'accent-rose-500' },
    { key: 'intelligence', label: 'Intelligence', color: 'accent-sky-500' },
    { key: 'creativity', label: 'Creativity', color: 'accent-purple-500' },
    { key: 'looks', label: 'Looks', color: 'accent-pink-500' },
    { key: 'stress', label: 'Stress', color: 'accent-amber-500' },
    { key: 'charisma', label: 'Charisma', color: 'accent-indigo-500' },
    { key: 'ambition', label: 'Ambition', color: 'accent-orange-500' },
    { key: 'luck', label: 'Luck', color: 'accent-emerald-400' },
  ];

  const moneyPresets = [
    { label: 'Rp0 (Broke)', val: 0 },
    { label: 'Rp10M', val: 10_000_000 },
    { label: 'Rp100M', val: 100_000_000 },
    { label: 'Rp1B (Billion)', val: 1_000_000_000 },
    { label: 'Rp10B (Rich)', val: 10_000_000_000 },
    { label: 'Rp100B (Tycoon)', val: 100_000_000_000 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <div>
              <h2 className="text-sm font-bold text-amber-300">
                GOD MODE (Unlocked & 100% Free)
              </h2>
              <p className="text-[10px] text-slate-400">
                Infinite powers over reality, finances, awards & stats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close God Mode"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Instant God Miracle Buttons */}
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-2">
              ⚡ Instant God Miracles
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleWinInstantAward('cannes')}
                className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>🦁 Win Cannes Grand Prix</span>
              </button>

              <button
                onClick={() => handleWinInstantAward('citra')}
                className="p-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>🏆 Win Citra Pariwara Gold</span>
              </button>

              <button
                onClick={handleInstantPromotion}
                className="p-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>🚀 Instant Job Promotion</span>
              </button>

              <button
                onClick={handleHealAll}
                className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>❤️ Full Heal & 0% Stress</span>
              </button>

              <button
                onClick={handleMaxRelationships}
                className="p-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>💖 Max All Relationships</span>
              </button>

              <button
                onClick={handleClearDebt}
                className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>💸 Clear All Debt</span>
              </button>
            </div>
          </div>

          {/* Money Presets & Custom Input */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-2">
              💰 Modify Personal Bank Account
            </span>
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {moneyPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleSetPresetMoney(preset.val)}
                  className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customMoney}
                onChange={(e) => setCustomMoney(e.target.value)}
                placeholder="Enter custom IDR amount"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleSetCustomMoney}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Set Money
              </button>
            </div>
          </div>

          {/* Character Attribute Sliders */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-2">
              🧬 Modify Character Stats (0 - 100)
            </span>
            <div className="space-y-3">
              {statsList.map((stat) => (
                <div key={stat.key} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span className="font-medium">{stat.label}</span>
                    <span className="font-mono font-bold text-slate-100">{state.stats[stat.key]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={state.stats[stat.key]}
                    onChange={(e) => handleStatChange(stat.key, parseInt(e.target.value, 10))}
                    className={`w-full h-2 bg-slate-800 rounded-lg cursor-pointer ${stat.color}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
          >
            Done Editing Reality
          </button>
        </div>
      </div>
    </div>
  );
};
