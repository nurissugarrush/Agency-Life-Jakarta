import React, { useState } from 'react';
import { Gender, SocioeconomicStatus, CharacterStats } from '../types/game';
import { createInitialCharacter, formatIDR } from '../game/simulation';
import { sound } from '../game/sound';
import { User, Sparkles, Dice5, Shield } from 'lucide-react';

interface CharacterCreationModalProps {
  isOpen: boolean;
  onCharacterCreated: (initialState: ReturnType<typeof createInitialCharacter>) => void;
}

export const CharacterCreationModal: React.FC<CharacterCreationModalProps> = ({
  isOpen,
  onCharacterCreated,
}) => {
  const [name, setName] = useState<string>('Dimas Pratama');
  const [gender, setGender] = useState<Gender>('male');
  const [avatarEmoji, setAvatarEmoji] = useState<string>('👨‍💼');
  const [socioeconomic, setSocioeconomic] = useState<SocioeconomicStatus>('middle_class');
  const [startingMoneyPreset, setStartingMoneyPreset] = useState<number>(10_000_000); // Rp10M
  const [customMoney, setCustomMoney] = useState<string>('');
  const [neighborhood, setNeighborhood] = useState<string>('Tebet');

  const [stats, setStats] = useState<CharacterStats>({
    happiness: 85,
    health: 90,
    intelligence: 75,
    creativity: 85,
    looks: 70,
    stress: 10,
    charisma: 65,
    ambition: 80,
    luck: 50,
  });

  if (!isOpen) return null;

  const randomizeName = () => {
    sound.playTap();
    const maleNames = ['Dimas Pratama', 'Reza Rahadian', 'Aditya Nugraha', 'Fikri Ramadhan', 'Bimo Wicaksono', 'Farhan Maulana'];
    const femaleNames = ['Nadia Pramudita', 'Clarissa Tan', 'Aurelia Stephanie', 'Putri Indah', 'Siti Rahma', 'Maya Kartika'];
    const nbNames = ['Alex Tan', 'Bintang Surya', 'Kirana Aditya', 'Jordan Prasetya'];

    if (gender === 'male') {
      setName(maleNames[Math.floor(Math.random() * maleNames.length)]);
      setAvatarEmoji('👨‍💼');
    } else if (gender === 'female') {
      setName(femaleNames[Math.floor(Math.random() * femaleNames.length)]);
      setAvatarEmoji('👩‍💼');
    } else {
      setName(nbNames[Math.floor(Math.random() * nbNames.length)]);
      setAvatarEmoji('🧑‍💼');
    }
  };

  const handleCreate = () => {
    sound.playAwardFanfare();
    const finalMoney = customMoney ? parseInt(customMoney, 10) || 0 : startingMoneyPreset;
    const familyWealth = socioeconomic === 'scbd_conglomerate' ? 10_000_000_000 :
      socioeconomic === 'upper_middle' ? 500_000_000 :
      socioeconomic === 'middle_class' ? 100_000_000 : 10_000_000;

    const initialState = createInitialCharacter({
      name,
      gender,
      avatarEmoji,
      socioeconomic,
      startingMoneyIDR: finalMoney,
      familyWealthIDR: familyWealth,
      homeNeighborhood: neighborhood,
      initialStats: stats,
    });

    onCharacterCreated(initialState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Agency Life: Jakarta Edition
            </span>
            <h1 className="text-base font-bold text-slate-100">
              Create New Life in Jakarta
            </h1>
          </div>
          <button
            onClick={randomizeName}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <Dice5 className="w-3.5 h-3.5" />
            <span>Randomize</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Identity & Avatar */}
          <div className="flex items-center gap-3">
            <div className="text-3xl p-3 rounded-2xl bg-slate-800 border border-slate-700 select-none">
              {avatarEmoji}
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Gender selection */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Gender Identity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'male', label: 'Male', emoji: '👨‍💼' },
                { id: 'female', label: 'Female', emoji: '👩‍💼' },
                { id: 'non-binary', label: 'Non-Binary', emoji: '🧑‍💼' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setGender(g.id as Gender);
                    setAvatarEmoji(g.emoji);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    gender === g.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}
                >
                  <span>{g.emoji}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Socioeconomic Class & Neighborhood */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Family Socioeconomic Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'middle_class', label: 'Middle Class', hood: 'Tebet', money: 10_000_000 },
                { id: 'upper_middle', label: 'Upper Middle Class', hood: 'Pondok Indah', money: 50_000_000 },
                { id: 'scbd_conglomerate', label: 'SCBD / Menteng Conglomerate', hood: 'Menteng', money: 1_000_000_000 },
                { id: 'underprivileged', label: 'Underprivileged (Hard Mode)', hood: 'Kemayoran', money: 0 },
              ].map((status) => (
                <button
                  key={status.id}
                  onClick={() => {
                    setSocioeconomic(status.id as SocioeconomicStatus);
                    setNeighborhood(status.hood);
                    setStartingMoneyPreset(status.money);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    socioeconomic === status.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400'
                  }`}
                >
                  <h4 className="text-xs font-bold">{status.label}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{status.hood} · Default {formatIDR(status.money)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Starting Money Customizer */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Starting Personal Cash
              </label>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {customMoney ? formatIDR(parseInt(customMoney, 10) || 0) : formatIDR(startingMoneyPreset)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {[
                { label: 'Rp0', val: 0 },
                { label: 'Rp1M', val: 1_000_000 },
                { label: 'Rp10M', val: 10_000_000 },
                { label: 'Rp100M', val: 100_000_000 },
                { label: 'Rp1B', val: 1_000_000_000 },
                { label: 'Rp10B', val: 10_000_000_000 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setStartingMoneyPreset(preset.val);
                    setCustomMoney('');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-colors ${
                    startingMoneyPreset === preset.val && !customMoney
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <input
              type="number"
              value={customMoney}
              onChange={(e) => setCustomMoney(e.target.value)}
              placeholder="Or enter any custom IDR amount"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Initial Attributes allocation */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
              Starting Attributes
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Creativity</span>
                  <span className="font-mono text-purple-300">{stats.creativity}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={stats.creativity}
                  onChange={(e) => setStats({ ...stats, creativity: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-slate-800 accent-purple-500 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Intelligence</span>
                  <span className="font-mono text-sky-300">{stats.intelligence}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={stats.intelligence}
                  onChange={(e) => setStats({ ...stats, intelligence: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-slate-800 accent-sky-500 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Health</span>
                  <span className="font-mono text-rose-300">{stats.health}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={stats.health}
                  onChange={(e) => setStats({ ...stats, health: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-slate-800 accent-rose-500 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Ambition</span>
                  <span className="font-mono text-amber-300">{stats.ambition}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={stats.ambition}
                  onChange={(e) => setStats({ ...stats, ambition: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-slate-800 accent-amber-500 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={handleCreate}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
          >
            Start Agency Life in Jakarta →
          </button>
        </div>
      </div>
    </div>
  );
};
