import React, { useState } from 'react';
import { GameState } from '../types/game';
import { UNIVERSITIES } from '../game/constants';
import { formatIDR } from '../game/simulation';
import { sound } from '../game/sound';
import {
  GraduationCap,
  HeartPulse,
  Coffee,
  Plane,
  Sparkles,
  Dumbbell,
  CheckCircle,
  Wine,
} from 'lucide-react';

interface ActivitiesTabProps {
  state: GameState;
  onUpdateState: (newState: GameState) => void;
}

export const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ state, onUpdateState }) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const runActivity = (
    title: string,
    description: string,
    costIDR: number,
    statChanges: {
      health?: number;
      happiness?: number;
      stress?: number;
      intelligence?: number;
      creativity?: number;
      looks?: number;
      reputation?: number;
    }
  ) => {
    if (state.moneyIDR < costIDR) {
      sound.playAlert();
      setFeedback(`Insufficient funds! You need ${formatIDR(costIDR)} for this activity.`);
      return;
    }

    sound.playTap();
    if (costIDR > 0) sound.playCash();

    const next = JSON.parse(JSON.stringify(state)) as GameState;
    next.moneyIDR -= costIDR;

    if (statChanges.health) next.stats.health = Math.min(100, Math.max(0, next.stats.health + statChanges.health));
    if (statChanges.happiness) next.stats.happiness = Math.min(100, Math.max(0, next.stats.happiness + statChanges.happiness));
    if (statChanges.stress) next.stats.stress = Math.min(100, Math.max(0, next.stats.stress + statChanges.stress));
    if (statChanges.intelligence) next.stats.intelligence = Math.min(100, Math.max(0, next.stats.intelligence + statChanges.intelligence));
    if (statChanges.creativity) next.stats.creativity = Math.min(100, Math.max(0, next.stats.creativity + statChanges.creativity));
    if (statChanges.looks) next.stats.looks = Math.min(100, Math.max(0, next.stats.looks + statChanges.looks));
    if (statChanges.reputation) next.career.industryReputation = Math.min(100, Math.max(0, next.career.industryReputation + statChanges.reputation));

    next.history.unshift({
      id: `act_${Date.now()}`,
      age: next.character.currentAge,
      year: next.character.birthYear + next.character.currentAge,
      title,
      description,
      category: 'lifestyle',
    });

    setFeedback(`${title} completed! ${description}`);
    onUpdateState(next);
  };

  const handleEnrollUniversity = (uniId: string) => {
    const uni = UNIVERSITIES.find((u) => u.id === uniId);
    if (!uni) return;

    if (state.character.currentAge < 17) {
      setFeedback('You must be at least 17 years old to enroll in university.');
      return;
    }

    const next = JSON.parse(JSON.stringify(state)) as GameState;
    next.education.university = {
      name: uni.name,
      major: uni.major,
      gpa: 3.5,
      graduated: false,
    };
    next.stage = 'university';
    next.stats.intelligence = Math.min(100, next.stats.intelligence + 12);
    next.stats.creativity = Math.min(100, next.stats.creativity + 10);

    next.history.unshift({
      id: `uni_enroll_${Date.now()}`,
      age: next.character.currentAge,
      year: next.character.birthYear + next.character.currentAge,
      title: `Enrolled at ${uni.name}!`,
      description: `Accepted into the prestigious ${uni.major} program. Time to build your first portfolio!`,
      category: 'school',
    });

    sound.playAwardFanfare();
    setFeedback(`Enrolled at ${uni.name} studying ${uni.major}!`);
    onUpdateState(next);
  };

  return (
    <div className="flex flex-col gap-5 pb-24">
      {/* Feedback banner */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-xs flex justify-between items-center text-slate-200 shadow-sm">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-200 text-xs px-1">✕</button>
        </div>
      )}

      {/* Education & Masterclasses */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Education & Creative Development
          </h3>
        </div>

        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Study Hard & Read Advertising Books</h4>
              <p className="text-[11px] text-slate-400">Read Ogilvy on Advertising & Hey Whipple, Squeeze This</p>
            </div>
            <button
              onClick={() => runActivity(
                'Studied Advertising Craft',
                'Devoured classic and modern creative case studies. Mind sharpened!',
                0,
                { intelligence: 6, creativity: 5, stress: 2 }
              )}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold"
            >
              Free
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Cannes Lions Creative Masterclass</h4>
              <p className="text-[11px] text-slate-400">Intensive 3-day workshop with international award jurors</p>
            </div>
            <button
              onClick={() => runActivity(
                'Cannes Lions Masterclass',
                'Learned how to craft Titanium-worthy case study films and big ideas.',
                12_000_000,
                { creativity: 14, reputation: 10, stress: 5 }
              )}
              className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
            >
              {formatIDR(12_000_000)}
            </button>
          </div>
        </div>

        {/* Indonesian Universities List */}
        {!state.education.university && state.character.currentAge >= 17 && (
          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Apply to Indonesian University
            </span>
            <div className="space-y-1.5">
              {UNIVERSITIES.map((uni) => (
                <div key={uni.id} className="p-2.5 rounded-xl bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-semibold text-slate-200">{uni.name}</h5>
                    <p className="text-[10px] text-slate-400">{uni.major} · {formatIDR(uni.yearlyTuitionIDR)}/year</p>
                  </div>
                  <button
                    onClick={() => handleEnrollUniversity(uni.id)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-bold"
                  >
                    Enroll
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Health & Wellness */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <HeartPulse className="w-4 h-4 text-rose-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Health & Recovery (Anti-Burnout)
          </h3>
        </div>

        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Morning Jog at GBK Senayan</h4>
              <p className="text-[11px] text-slate-400">Sweat under the tropical palm trees around the national stadium</p>
            </div>
            <button
              onClick={() => runActivity(
                'Jogged around GBK',
                'Completed 3 laps around the ring road. Endorphins surging!',
                0,
                { health: 8, happiness: 6, stress: -10 }
              )}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold"
            >
              Free
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">SCBD Elite Fitness Gym</h4>
              <p className="text-[11px] text-slate-400">Personal trainer, sauna, and cold plunge before work</p>
            </div>
            <button
              onClick={() => runActivity(
                'SCBD Gym Workout',
                'Heavy squats followed by sauna session. Looking toned and sharp!',
                1_500_000,
                { health: 12, looks: 8, stress: -12 }
              )}
              className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs"
            >
              {formatIDR(1_500_000)}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Mental Health Therapy in South Jakarta</h4>
              <p className="text-[11px] text-slate-400">Unpack agency imposter syndrome and client PTSD with a psychologist</p>
            </div>
            <button
              onClick={() => runActivity(
                'Therapy Session',
                'Deep emotional breakthrough regarding work-life balance and creative boundaries.',
                1_200_000,
                { stress: -30, happiness: 18 }
              )}
              className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs"
            >
              {formatIDR(1_200_000)}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Medical Checkup at RS Pondok Indah</h4>
              <p className="text-[11px] text-slate-400">Comprehensive health screen, vitamins, and doctor consultation</p>
            </div>
            <button
              onClick={() => runActivity(
                'RS Pondok Indah Medical Checkup',
                'Doctor treated chronic gastric acid and cleared you for another year of pitching.',
                4_500_000,
                { health: 25, stress: -15 }
              )}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              {formatIDR(4_500_000)}
            </button>
          </div>
        </div>
      </div>

      {/* Jakarta Social & Vacations */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Plane className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Lifestyle, Nightlife & Vacations
          </h3>
        </div>

        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Cafe Hopping di Cipete & Senopati</h4>
              <p className="text-[11px] text-slate-400">Kopi Susu Tetangga, artisan matcha, and brainstorming</p>
            </div>
            <button
              onClick={() => runActivity(
                'South Jakarta Cafe Crawl',
                'Visited 3 hipster cafes in Cipete and came up with 5 new campaign hooks.',
                180_000,
                { happiness: 8, creativity: 6 }
              )}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              {formatIDR(180_000)}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Nightlife at SCBD (Lucy / Duck Down)</h4>
              <p className="text-[11px] text-slate-400">Celebrate winning a pitch with craft cocktails and loud music</p>
            </div>
            <button
              onClick={() => runActivity(
                'Wild Night Out in SCBD',
                'Danced till 3 AM with industry colleagues. High vibes, mild hangover.',
                1_800_000,
                { happiness: 20, stress: -15, health: -4 }
              )}
              className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold text-xs"
            >
              {formatIDR(1_800_000)}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Tropical Vacation to Bali (Uluwatu / Canggu)</h4>
              <p className="text-[11px] text-slate-400">5-day beach villa retreat, sunset cocktails, and zero Slack notifications</p>
            </div>
            <button
              onClick={() => runActivity(
                'Bali Beach Vacation',
                'Watched breathtaking sunsets over Uluwatu cliffs. Mind completely restored!',
                9_500_000,
                { happiness: 35, stress: -40, health: 10 }
              )}
              className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
            >
              {formatIDR(9_500_000)}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Tokyo Creative & Art Inspiration Trip</h4>
              <p className="text-[11px] text-slate-400">Explore Ginza galleries, Shibuya retail design, and Michelin dining</p>
            </div>
            <button
              onClick={() => runActivity(
                'Tokyo Creative Pilgrimage',
                'Inspected futuristic Japanese interactive advertising and modern graphic typography.',
                38_000_000,
                { happiness: 45, creativity: 25, stress: -30 }
              )}
              className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs"
            >
              {formatIDR(38_000_000)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
