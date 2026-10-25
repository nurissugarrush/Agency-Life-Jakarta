import React, { useState } from 'react';
import { GameState, CareerDepartment } from '../types/game';
import { JAKARTA_AGENCIES, CAREER_LADDERS } from '../game/constants';
import { formatIDR, requestPromotion, applyForJob } from '../game/simulation';
import { sound } from '../game/sound';
import {
  Briefcase,
  Award,
  TrendingUp,
  Clock,
  Sparkles,
  Building,
  CheckCircle2,
  XCircle,
  HelpCircle,
  PlusCircle,
  Flame,
} from 'lucide-react';

interface CareerTabProps {
  state: GameState;
  onUpdateState: (newState: GameState) => void;
  onOpenAgencyManagement: () => void;
  onOpenFoundAgency: () => void;
  onTriggerPitchBrief: () => void;
}

export const CareerTab: React.FC<CareerTabProps> = ({
  state,
  onUpdateState,
  onOpenAgencyManagement,
  onOpenFoundAgency,
  onTriggerPitchBrief,
}) => {
  const [selectedDept, setSelectedDept] = useState<CareerDepartment>('creative');
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>(JAKARTA_AGENCIES[0].id);
  const [jobFeedback, setJobFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [interviewingRole, setInterviewingRole] = useState<{ agencyId: string; level: number } | null>(null);

  const currentJob = state.career.currentJob;
  const currentAgencyData = JAKARTA_AGENCIES.find((a) => a.id === currentJob?.agencyId);

  const handleWorkHard = () => {
    sound.playTap();
    if (!currentJob) return;
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    if (next.career.currentJob) {
      next.career.currentJob.performance = Math.min(100, next.career.currentJob.performance + 10);
      next.stats.stress = Math.min(100, next.stats.stress + 5);
      next.history.unshift({
        id: `work_${Date.now()}`,
        age: next.character.currentAge,
        year: next.character.birthYear + next.character.currentAge,
        title: 'Worked Diligently at Agency',
        description: `Put your head down and polished presentation decks with impeccable attention to detail. Boss noticed your high performance.`,
        category: 'career',
      });
    }
    onUpdateState(next);
  };

  const handleOvertime = () => {
    sound.playTap();
    if (!currentJob) return;
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    if (next.career.currentJob) {
      next.career.currentJob.performance = Math.min(100, next.career.currentJob.performance + 18);
      next.career.industryReputation = Math.min(100, next.career.industryReputation + 4);
      next.stats.stress = Math.min(100, next.stats.stress + 14);
      next.stats.health = Math.max(10, next.stats.health - 6);
      next.history.unshift({
        id: `ot_${Date.now()}`,
        age: next.character.currentAge,
        year: next.character.birthYear + next.character.currentAge,
        title: 'Sudirman Overnight Overtime (2:45 AM)',
        description: `Overtime sprint till 2:45 AM eating warm Gorengan and drinking double-shot Kopi Kenangan. Performance boosted significantly, but your back aches.`,
        category: 'career',
      });
    }
    onUpdateState(next);
  };

  const handleRequestPromotion = () => {
    sound.playTap();
    const res = requestPromotion(state);
    setJobFeedback({ success: res.success, message: res.message });
    if (res.success) {
      sound.playAwardFanfare();
    } else {
      sound.playAlert();
    }
    onUpdateState(res.newState);
  };

  const handleResign = () => {
    sound.playTap();
    if (!confirm('Are you sure you want to resign from your current agency?')) return;
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    if (next.career.currentJob) {
      next.career.pastJobs.push(next.career.currentJob);
      next.career.currentJob = undefined;
      next.stats.stress = Math.max(5, next.stats.stress - 25);
      next.history.unshift({
        id: `resign_${Date.now()}`,
        age: next.character.currentAge,
        year: next.character.birthYear + next.character.currentAge,
        title: 'Resigned from Agency',
        description: 'Submitted your 1-month notice and walked out into the Jakarta rain with a cardboard box and peace of mind.',
        category: 'career',
      });
    }
    onUpdateState(next);
  };

  const handleToggleFreelance = () => {
    sound.playCash();
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    if (next.career.freelanceClients > 0) {
      next.career.freelanceClients = 0;
    } else {
      next.career.freelanceClients = 2;
    }
    onUpdateState(next);
  };

  // Execute job application
  const handleApply = (agencyId: string, level: number) => {
    sound.playTap();
    const res = applyForJob(state, agencyId, selectedDept, level);
    setJobFeedback({ success: res.success, message: res.message });
    setInterviewingRole(null);
    if (res.success) {
      sound.playAwardFanfare();
    } else {
      sound.playAlert();
    }
    onUpdateState(res.newState);
  };

  const ladderSteps = CAREER_LADDERS[selectedDept] || CAREER_LADDERS.creative;
  const targetAgency = JAKARTA_AGENCIES.find((a) => a.id === selectedAgencyId) || JAKARTA_AGENCIES[0];

  return (
    <div className="flex flex-col gap-5 pb-24">
      {/* Feedback Banner */}
      {jobFeedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 shadow-sm ${
            jobFeedback.success
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}
        >
          {jobFeedback.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <p className="font-semibold">{jobFeedback.message}</p>
          </div>
          <button
            onClick={() => setJobFeedback(null)}
            className="text-slate-400 hover:text-slate-200 text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Current Employment Card */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Current Employment
            </span>
            <h2 className="text-base font-bold text-slate-100 mt-0.5">
              {currentJob ? currentJob.title : 'Unemployed in Jakarta'}
            </h2>
            <p className="text-xs text-slate-400">
              {currentJob ? `${currentJob.agencyName} (${currentAgencyData?.location || 'Jakarta'})` : 'Looking for advertising opportunities'}
            </p>
          </div>
          {currentJob && (
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {formatIDR(currentJob.monthlySalaryIDR)}/mo
              </span>
              <p className="text-[10px] text-slate-500">
                + 1-mo THR & Bonus
              </p>
            </div>
          )}
        </div>

        {currentJob && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
            {/* Performance Meter */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Performance Rating</span>
                <span className="font-mono text-slate-300 font-semibold tabular-nums">{currentJob.performance}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${currentJob.performance}%` }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleWorkHard}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Work Hard</span>
              </button>

              <button
                onClick={handleOvertime}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Overtime (OT)</span>
              </button>

              <button
                onClick={handleRequestPromotion}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                <span>Ask Promotion</span>
              </button>

              <button
                onClick={onTriggerPitchBrief}
                className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Pitch Client</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
              <button
                onClick={handleToggleFreelance}
                className="text-slate-400 hover:text-slate-200 text-left transition-colors"
              >
                Side Moonlighting:{' '}
                <span className={state.career.freelanceClients > 0 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                  {state.career.freelanceClients > 0 ? 'Active (2 Clients)' : 'Off'}
                </span>
              </button>
              <button
                onClick={handleResign}
                className="text-rose-400 hover:text-rose-300 font-medium transition-colors"
              >
                Resign
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Agency Ownership Hub */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Agency Entrepreneurship
            </span>
            <h3 className="text-sm font-bold text-slate-100 mt-0.5">
              {state.ownedAgency ? state.ownedAgency.name : 'Found Your Own Advertising Agency'}
            </h3>
            <p className="text-xs text-slate-400">
              {state.ownedAgency
                ? `${state.ownedAgency.officeLocation} · ${state.ownedAgency.clients.length} Retainer Clients`
                : 'Resign, rent an office in SCBD or Kemang, and build your own creative empire.'}
            </p>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              if (state.ownedAgency) {
                onOpenAgencyManagement();
              } else {
                onOpenFoundAgency();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition-all active:scale-95 shrink-0"
          >
            {state.ownedAgency ? 'Manage Agency' : 'Found Agency'}
          </button>
        </div>
      </div>

      {/* Awards Showcase Cabinet */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Creative Trophy Cabinet
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-300 font-semibold">
            {state.career.totalAwardsCount} Trophies
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
            <span className="text-lg">🦁</span>
            <div className="text-xs font-bold text-slate-200 mt-1 tabular-nums">
              {state.career.cannesLionsCount}
            </div>
            <div className="text-[10px] text-slate-400">Cannes Lions</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
            <span className="text-lg">🏆</span>
            <div className="text-xs font-bold text-slate-200 mt-1 tabular-nums">
              {state.career.citraPariwaraCount}
            </div>
            <div className="text-[10px] text-slate-400">Citra Pariwara</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
            <span className="text-lg">🎖️</span>
            <div className="text-xs font-bold text-slate-200 mt-1 tabular-nums">
              {state.career.industryReputation}%
            </div>
            <div className="text-[10px] text-slate-400">Industry Fame</div>
          </div>
        </div>
      </div>

      {/* Jakarta Agency Job Market Browser */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Jakarta Agency Job Market
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {JAKARTA_AGENCIES.length} Agencies
          </span>
        </div>

        {/* Department Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {(['creative', 'strategy', 'accounts', 'social_digital', 'media', 'production'] as CareerDepartment[]).map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedDept === dept ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {dept.replace(/_/g, ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Select Target Agency */}
        <div className="mt-3">
          <label className="text-[11px] text-slate-400 block mb-1">Select Agency Employer:</label>
          <select
            value={selectedAgencyId}
            onChange={(e) => setSelectedAgencyId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            {JAKARTA_AGENCIES.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name} ({agency.prestige}★ Prestige · {agency.location})
              </option>
            ))}
          </select>
        </div>

        {/* Agency Info Snapshot */}
        <div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-800 text-xs space-y-1">
          <div className="flex justify-between text-slate-300">
            <span>Workload Culture:</span>
            <span className="font-semibold text-amber-400 capitalize">{targetAgency.workload.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Client Tier:</span>
            <span className="font-semibold text-sky-400 capitalize">{targetAgency.clientTier.replace(/_/g, ' ')}</span>
          </div>
          <p className="text-[11px] text-slate-400 italic pt-1">
            "{targetAgency.vibe}"
          </p>
        </div>

        {/* Open Job Positions for this Department */}
        <div className="mt-3 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Available Positions
          </span>
          {ladderSteps.map((step) => {
            const salary = Math.round(step.baseSalaryMonthIDR * targetAgency.salaryMultiplier);
            return (
              <div
                key={step.level}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    {step.title}
                  </h4>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{formatIDR(salary)}/mo</span>
                    <span>·</span>
                    <span>Min {step.minExperienceYears}y exp</span>
                  </div>
                </div>

                <button
                  onClick={() => handleApply(targetAgency.id, step.level)}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow transition-all active:scale-95"
                >
                  Apply
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
