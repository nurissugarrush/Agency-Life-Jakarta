import React, { useState } from 'react';
import { GameState, NPC, NPCRelationshipType } from '../types/game';
import { formatIDR } from '../game/simulation';
import { sound } from '../game/sound';
import { Heart, UserPlus, MessageCircle, Gift, Sparkles, Smile, DollarSign } from 'lucide-react';

interface RelationshipsTabProps {
  state: GameState;
  onUpdateState: (newState: GameState) => void;
}

export const RelationshipsTab: React.FC<RelationshipsTabProps> = ({ state, onUpdateState }) => {
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleSpendQualityTime = (npc: NPC) => {
    sound.playTap();
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    const target = next.npcs.find((n) => n.id === npc.id);
    if (!target) return;

    target.relationshipScore = Math.min(100, target.relationshipScore + 12);
    next.stats.happiness = Math.min(100, next.stats.happiness + 8);
    next.stats.stress = Math.max(0, next.stats.stress - 6);

    next.history.unshift({
      id: `rel_${Date.now()}`,
      age: next.character.currentAge,
      year: next.character.birthYear + next.character.currentAge,
      title: `Spent Time with ${target.name}`,
      description: `Met up at a cozy coffee shop in Cipete for Kopi Susu and deep conversations about life and career aspirations.`,
      category: 'relationship',
    });

    setActionFeedback(`Had a wonderful time hanging out with ${target.name}! Relationship +12%`);
    onUpdateState(next);
  };

  const handleCompliment = (npc: NPC) => {
    sound.playTap();
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    const target = next.npcs.find((n) => n.id === npc.id);
    if (!target) return;

    target.relationshipScore = Math.min(100, target.relationshipScore + 8);
    next.stats.happiness = Math.min(100, next.stats.happiness + 4);

    setActionFeedback(`You complimented ${target.name}'s sharp creative instincts. They beamed with joy!`);
    onUpdateState(next);
  };

  const handleGiveGift = (npc: NPC) => {
    sound.playCash();
    const cost = 500_000; // Rp500k
    if (state.moneyIDR < cost) {
      setActionFeedback(`You need at least ${formatIDR(cost)} to buy a thoughtful gift.`);
      return;
    }

    const next = JSON.parse(JSON.stringify(state)) as GameState;
    const target = next.npcs.find((n) => n.id === npc.id);
    if (!target) return;

    next.moneyIDR -= cost;
    target.relationshipScore = Math.min(100, target.relationshipScore + 20);
    next.stats.happiness = Math.min(100, next.stats.happiness + 10);

    next.history.unshift({
      id: `gift_${Date.now()}`,
      age: next.character.currentAge,
      year: next.character.birthYear + next.character.currentAge,
      title: `Gift to ${target.name}`,
      description: `Bought ${target.name} an artisanal gift box with specialty coffee beans and sweets (${formatIDR(cost)}).`,
      category: 'relationship',
    });

    setActionFeedback(`Gave ${target.name} a wonderful gift! Relationship +20%`);
    onUpdateState(next);
  };

  const handleBorrowMoney = (npc: NPC) => {
    sound.playTap();
    if (npc.relationshipScore < 60) {
      sound.playAlert();
      setActionFeedback(`${npc.name} hesitated: "Sorry, I can't lend money right now." (Need >60% relationship)`);
      return;
    }

    const amount = 5_000_000;
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    const target = next.npcs.find((n) => n.id === npc.id);
    if (!target) return;

    next.moneyIDR += amount;
    target.relationshipScore = Math.max(10, target.relationshipScore - 15);

    next.history.unshift({
      id: `borrow_${Date.now()}`,
      age: next.character.currentAge,
      year: next.character.birthYear + next.character.currentAge,
      title: `Borrowed ${formatIDR(amount)} from ${target.name}`,
      description: `${target.name} lent you ${formatIDR(amount)} to cover urgent expenses in Jakarta.`,
      category: 'finance',
    });

    sound.playCash();
    setActionFeedback(`${npc.name} kindly lent you ${formatIDR(amount)}!`);
    onUpdateState(next);
  };

  const handleFindDateOrFriend = () => {
    sound.playTap();
    const indonesianNames = [
      'Aurelia Stephanie',
      'Rizky Pratama',
      'Jessica Halim',
      'Bimo Wicaksono',
      'Clarissa Tan',
      'Andika Kusuma',
      'Tasya Farasya',
      'Gilang Ramadhan',
    ];
    const roles = [
      'Senior Art Director at Bujukrayu',
      'Brand Strategist at Ogilvy',
      'Fashion Photographer in Kemang',
      'Tech Founder in SCBD',
      'Content Creator di Blok M',
    ];

    const randomName = indonesianNames[Math.floor(Math.random() * indonesianNames.length)];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];

    const newFriend: NPC = {
      id: `npc_${Date.now()}`,
      name: randomName,
      age: Math.max(18, state.character.currentAge + Math.floor(Math.random() * 5) - 2),
      relation: state.character.currentAge >= 18 ? 'partner' : 'friend',
      relationshipScore: 65,
      personality: 'supportive',
      occupation: randomRole,
      alive: true,
    };

    const next = JSON.parse(JSON.stringify(state)) as GameState;
    next.npcs.push(newFriend);
    next.stats.happiness = Math.min(100, next.stats.happiness + 15);

    next.history.unshift({
      id: `met_${Date.now()}`,
      age: next.character.currentAge,
      year: next.character.birthYear + next.character.currentAge,
      title: `Met ${newFriend.name}!`,
      description: `Crossed paths at a creative design mixer in M Bloc Space, Blok M. Hit it off instantly!`,
      category: 'relationship',
    });

    setActionFeedback(`You met ${newFriend.name} (${randomRole})!`);
    onUpdateState(next);
  };

  const handleHaveChild = () => {
    sound.playTap();
    const partner = state.npcs.find((n) => (n.relation === 'partner' || n.relation === 'spouse') && n.alive);
    if (!partner) {
      setActionFeedback('You need a committed romantic partner or spouse to have a baby!');
      return;
    }

    const babyNames = state.character.gender === 'female' ? ['Aiden Pratama', 'Alisha Kirana'] : ['Kenzo Aditya', 'Nayla Jasmine'];
    const babyName = babyNames[Math.floor(Math.random() * babyNames.length)];

    const childNPC: NPC = {
      id: `npc_child_${Date.now()}`,
      name: babyName,
      age: 0,
      relation: 'child',
      relationshipScore: 98,
      personality: 'chill',
      alive: true,
    };

    const next = JSON.parse(JSON.stringify(state)) as GameState;
    next.npcs.push(childNPC);
    next.stats.happiness = 100;

    next.history.unshift({
      id: `baby_${Date.now()}`,
      age: next.character.currentAge,
      year: next.character.birthYear + next.character.currentAge,
      title: `Welcomed Baby ${babyName}! 👶`,
      description: `Your child was born healthy at RS Pondok Indah! The entire family and agency team sent congratulations.`,
      category: 'family',
    });

    sound.playAwardFanfare();
    setActionFeedback(`Congratulations! You welcomed your child ${babyName} into the world!`);
    onUpdateState(next);
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Feedback message */}
      {actionFeedback && (
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex justify-between items-center shadow-sm">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-slate-200 text-xs px-1">✕</button>
        </div>
      )}

      {/* Top Banner & Quick Find */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-100">
            Social & Family Network
          </h2>
          <p className="text-xs text-slate-400">
            {state.npcs.filter((n) => n.alive).length} Active Relationships in Jakarta
          </p>
        </div>
        <div className="flex items-center gap-2">
          {state.character.currentAge >= 21 && (
            <button
              onClick={handleHaveChild}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>👶 Baby</span>
            </button>
          )}
          <button
            onClick={handleFindDateOrFriend}
            className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow transition-all active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Meet New</span>
          </button>
        </div>
      </div>

      {/* NPCs List */}
      <div className="space-y-3">
        {state.npcs.map((npc) => {
          return (
            <div
              key={npc.id}
              className={`p-4 rounded-2xl border transition-all ${
                npc.alive
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/60 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg shrink-0">
                    {npc.relation === 'mother' ? '👩' :
                     npc.relation === 'father' ? '👨' :
                     npc.relation === 'partner' || npc.relation === 'spouse' ? '💍' :
                     npc.relation === 'child' ? '👶' : '🧑'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100">
                      {npc.name} {!npc.alive && '(Deceased)'}
                    </h3>
                    <p className="text-[11px] text-slate-400 capitalize">
                      {npc.relation} · Age {npc.age} {npc.occupation ? `· ${npc.occupation}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-rose-400 tabular-nums">
                    {npc.relationshipScore}%
                  </span>
                  <p className="text-[10px] text-slate-500">Affection</p>
                </div>
              </div>

              {/* Relationship Bar */}
              <div className="h-1.5 w-full rounded-full bg-slate-800 mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${npc.relationshipScore}%` }}
                />
              </div>

              {/* Action Buttons for alive NPCs */}
              {npc.alive && (
                <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80">
                  <button
                    onClick={() => handleSpendQualityTime(npc)}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <Smile className="w-3 h-3 text-emerald-400" />
                    <span>Hangout</span>
                  </button>

                  <button
                    onClick={() => handleCompliment(npc)}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <MessageCircle className="w-3 h-3 text-sky-400" />
                    <span>Praise</span>
                  </button>

                  <button
                    onClick={() => handleGiveGift(npc)}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <Gift className="w-3 h-3 text-purple-400" />
                    <span>Gift</span>
                  </button>

                  <button
                    onClick={() => handleBorrowMoney(npc)}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <DollarSign className="w-3 h-3 text-amber-400" />
                    <span>Borrow</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
