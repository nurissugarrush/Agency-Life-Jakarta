import React, { useState } from 'react';
import { GameState, OwnedAgency } from '../types/game';
import { foundOwnAgency, formatIDR } from '../game/simulation';
import { sound } from '../game/sound';
import { Building, Users, DollarSign, Award, Plus, X, Briefcase, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AgencyManagementModalProps {
  state: GameState;
  isOpen: boolean;
  isFoundingMode: boolean;
  onClose: () => void;
  onUpdateState: (newState: GameState) => void;
}

export const AgencyManagementModal: React.FC<AgencyManagementModalProps> = ({
  state,
  isOpen,
  isFoundingMode,
  onClose,
  onUpdateState,
}) => {
  // Founding form state
  const [agencyName, setAgencyName] = useState<string>('Bujuk & Mad Men');
  const [location, setLocation] = useState<string>('SCBD');
  const [spec, setSpec] = useState<OwnedAgency['specialization']>('creative_boutique');
  const [capitalInput, setCapitalInput] = useState<string>('150000000'); // Rp150M

  // Message feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const agency = state.ownedAgency;

  const handleFoundSubmit = () => {
    const capital = parseInt(capitalInput, 10) || 50_000_000;
    const res = foundOwnAgency(state, agencyName, spec, location, capital);
    if (res.success) {
      sound.playAwardFanfare();
      confetti({ particleCount: 80, spread: 70 });
      onUpdateState(res.newState);
      onClose();
    } else {
      sound.playAlert();
      setFeedback(res.message);
    }
  };

  const handleHireEmployee = (role: string, salary: number, skill: number) => {
    if (!agency) return;
    if (agency.cashBalanceIDR < salary * 3) {
      sound.playAlert();
      setFeedback(`Agency reserves too low! Need at least 3 months runway (${formatIDR(salary * 3)}).`);
      return;
    }

    sound.playTap();
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    if (next.ownedAgency) {
      next.ownedAgency.employees.push({
        id: `emp_${Date.now()}`,
        name: `Senior Talent ${next.ownedAgency.employees.length + 1}`,
        role,
        department: 'creative',
        monthlySalaryIDR: salary,
        skill,
        morale: 95,
      });
      next.ownedAgency.reputation = Math.min(100, next.ownedAgency.reputation + 4);
    }
    setFeedback(`Hired ${role}! Agency creative capacity upgraded.`);
    onUpdateState(next);
  };

  const handlePitchNewClient = () => {
    if (!agency) return;
    sound.playTap();

    const clientNames = [
      'IndoMilk Dairy Group',
      'Bank Digital Nusantara',
      'Kopi Senopati Cold Brew',
      'EV Motor GoKilat',
      'AeroNusantara Airlines',
    ];
    const clientName = clientNames[Math.floor(Math.random() * clientNames.length)];
    const retainer = (agency.reputation > 70 ? 65_000_000 : 35_000_000);

    const next = JSON.parse(JSON.stringify(state)) as GameState;
    if (next.ownedAgency) {
      next.ownedAgency.clients.push({
        id: `client_${Date.now()}`,
        name: clientName,
        monthlyRetainerIDR: retainer,
        satisfaction: 85,
        contractYearsRemaining: 2,
      });
      next.ownedAgency.reputation = Math.min(100, next.ownedAgency.reputation + 6);
      next.stats.happiness = Math.min(100, next.stats.happiness + 20);
    }

    sound.playAwardFanfare();
    confetti({ particleCount: 50, spread: 60 });
    setFeedback(`Pitch Won! Signed ${clientName} on a ${formatIDR(retainer)}/month retainer contract!`);
    onUpdateState(next);
  };

  const handleEnterAgencyOfTheYear = () => {
    if (!agency) return;
    if (agency.reputation >= 75) {
      sound.playAwardFanfare();
      confetti({ particleCount: 100, spread: 80 });
      const next = JSON.parse(JSON.stringify(state)) as GameState;
      if (next.ownedAgency) {
        next.ownedAgency.agencyOfTheYearTitles += 1;
        next.ownedAgency.reputation = 100;
      }
      next.career.industryReputation = 100;
      next.stats.happiness = 100;
      next.history.unshift({
        id: `aoty_${Date.now()}`,
        age: next.character.currentAge,
        year: next.character.birthYear + next.character.currentAge,
        title: `🏆 CROWNED INDEPENDENT AGENCY OF THE YEAR!`,
        description: `Your agency ${agency.name} swept the stage at Citra Pariwara! The Jakarta advertising industry gave a standing ovation.`,
        category: 'award',
      });
      setFeedback(`🏆 CONGRATULATIONS! ${agency.name} won INDEPENDENT AGENCY OF THE YEAR at Citra Pariwara!`);
      onUpdateState(next);
    } else {
      sound.playAlert();
      setFeedback(`Judges reviewed your reel: Need at least 75% agency reputation to win Agency of the Year (Current: ${agency.reputation}%).`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {agency && !isFoundingMode ? agency.name : 'Found Your Own Advertising Agency'}
              </h2>
              <p className="text-[10px] text-slate-400">
                {agency && !isFoundingMode
                  ? `${agency.officeLocation} · Founded ${agency.foundedYear}`
                  : 'Start your creative independent shop in Jakarta'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {feedback && (
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex justify-between items-center shadow-sm">
              <span>{feedback}</span>
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-200 text-xs px-1">✕</button>
            </div>
          )}

          {/* Founding Form */}
          {(!agency || isFoundingMode) ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Agency Brand Name</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Headquarters Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
                >
                  <option value="SCBD">SCBD (Pacific Place / Treasury Tower) - Rp35M/mo</option>
                  <option value="Kemang">Kemang (Converted Tropical Villa) - Rp18M/mo</option>
                  <option value="Kuningan">Kuningan / Cyber Tower - Rp25M/mo</option>
                  <option value="Blok M">Blok M / M Bloc Space - Rp12M/mo</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Creative Specialization</label>
                <select
                  value={spec}
                  onChange={(e) => setSpec(e.target.value as typeof spec)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
                >
                  <option value="creative_boutique">Boutique Creative Hot Shop (Cannes Lions Focused)</option>
                  <option value="full_service">Full-Service 360 Agency (ATL + BTL + Media)</option>
                  <option value="digital_social">Digital, Social Media & Influencer Network</option>
                  <option value="ai_creative_tech">AI & Creative Technology Studio</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Starting Capital Investment (from personal funds)</label>
                <input
                  type="number"
                  value={capitalInput}
                  onChange={(e) => setCapitalInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-400"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Your Available Cash: {formatIDR(state.moneyIDR)}
                </span>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleFoundSubmit}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs shadow-lg"
                >
                  Launch Agency & Resign as Founder
                </button>
              </div>
            </div>
          ) : (
            /* Active Management View */
            <div className="space-y-4">
              {/* Financial Balance & Reputation */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Agency Cash Reserves</span>
                  <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                    {formatIDR(agency.cashBalanceIDR)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Industry Reputation</span>
                  <span className="text-sm font-mono font-bold text-purple-400 tabular-nums">
                    {agency.reputation}%
                  </span>
                </div>
              </div>

              {/* Retainers & Pitching */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Client Accounts ({agency.clients.length})
                    </span>
                  </div>
                  <button
                    onClick={handlePitchNewClient}
                    className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Pitch Client</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {agency.clients.map((client) => (
                    <div key={client.id} className="p-2 rounded-lg bg-slate-800/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">{client.name}</span>
                        <span className="block text-[10px] text-slate-400">Retainer: {formatIDR(client.monthlyRetainerIDR)}/mo</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold">{client.satisfaction}% Happy</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employee Roster */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Team Roster ({agency.employees.length})
                    </span>
                  </div>
                  <button
                    onClick={() => handleHireEmployee('Group Creative Director', 35_000_000, 90)}
                    className="px-2.5 py-1 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Hire GCD</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {agency.employees.map((emp) => (
                    <div key={emp.id} className="p-2 rounded-lg bg-slate-800/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">{emp.name}</span>
                        <span className="block text-[10px] text-slate-400">{emp.role} · {formatIDR(emp.monthlySalaryIDR)}/mo</span>
                      </div>
                      <span className="text-[10px] text-purple-400 font-semibold">Skill: {emp.skill}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agency of the Year Entry */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-800 border border-amber-500/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-200">Citra Pariwara AOTY</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Titles won: {agency.agencyOfTheYearTitles} · Req: &gt;75% Reputation
                  </p>
                </div>
                <button
                  onClick={handleEnterAgencyOfTheYear}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                >
                  Enter AOTY
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
