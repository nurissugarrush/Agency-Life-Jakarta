/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameState } from './types/game';
import {
  createInitialCharacter,
  advanceAge,
  CAMPAIGN_BRIEFS_POOL,
} from './game/simulation';
import { loadGameState, saveGameState, clearGameSlot } from './game/storage';
import { TopStatusBar } from './components/TopStatusBar';
import { BottomNav, TabType } from './components/BottomNav';
import { LifeFeed } from './components/LifeFeed';
import { CareerTab } from './components/CareerTab';
import { RelationshipsTab } from './components/RelationshipsTab';
import { ActivitiesTab } from './components/ActivitiesTab';
import { AssetsTab } from './components/AssetsTab';
import { GodModeModal } from './components/GodModeModal';
import { CharacterCreationModal } from './components/CharacterCreationModal';
import { CampaignBriefModal } from './components/CampaignBriefModal';
import { EventModal } from './components/EventModal';
import { AgencyManagementModal } from './components/AgencyManagementModal';
import { LifeSummaryModal } from './components/LifeSummaryModal';

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    // Check if ?autostart=1 or existing saved game
    const saved = loadGameState();
    if (saved) return saved;

    return createInitialCharacter({
      name: 'Dimas Pratama',
      gender: 'male',
      socioeconomic: 'middle_class',
      startingMoneyIDR: 10_000_000,
      familyWealthIDR: 100_000_000,
      homeNeighborhood: 'Tebet',
    });
  });

  const [activeTab, setActiveTab] = useState<TabType>('life');

  // Modals state
  const [isGodModeOpen, setIsGodModeOpen] = useState(false);
  const [isCharacterCreationOpen, setIsCharacterCreationOpen] = useState(false);
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
  const [isFoundingAgencyMode, setIsFoundingAgencyMode] = useState(false);
  const [isPendingEventOpen, setIsPendingEventOpen] = useState(false);
  const [isPendingBriefOpen, setIsPendingBriefOpen] = useState(false);
  const [isLifeSummaryOpen, setIsLifeSummaryOpen] = useState(false);

  // Autosave whenever state changes
  useEffect(() => {
    if (state) {
      saveGameState(state);
    }
  }, [state]);

  // Check game over
  useEffect(() => {
    if (state.isGameOver) {
      setIsLifeSummaryOpen(true);
    }
  }, [state.isGameOver]);

  const handleAdvanceAge = () => {
    const nextState = advanceAge(state);
    setState(nextState);

    // If new brief or event triggered, auto pop up prompt
    if (nextState.currentPendingBrief) {
      setIsPendingBriefOpen(true);
    } else if (nextState.currentPendingEvent) {
      setIsPendingEventOpen(true);
    }
  };

  const handleRestart = () => {
    setIsCharacterCreationOpen(true);
  };

  const handleCharacterCreated = (initialState: GameState) => {
    clearGameSlot();
    setState(initialState);
    setActiveTab('life');
    setIsCharacterCreationOpen(false);
    setIsLifeSummaryOpen(false);
  };

  const handleTriggerPitchBrief = () => {
    const randomBrief = CAMPAIGN_BRIEFS_POOL[Math.floor(Math.random() * CAMPAIGN_BRIEFS_POOL.length)];
    const nextState = JSON.parse(JSON.stringify(state)) as GameState;
    nextState.currentPendingBrief = JSON.parse(JSON.stringify(randomBrief));
    setState(nextState);
    setIsPendingBriefOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center items-start lg:py-6 lg:px-4 selection:bg-amber-500/30">
      {/* Desktop Left Brand & Lore Panel (visible on lg+) */}
      <aside className="hidden lg:flex flex-col gap-4 w-72 mr-8 pt-4 sticky top-6 text-left">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            Jakarta Edition
          </span>
          <h1 className="text-lg font-extrabold text-slate-100 mt-0.5">
            AGENCY LIFE
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            A deep text-based life simulator set in Jakarta, Indonesia. Live from birth to retirement inside the world of advertising agencies.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 space-y-2">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span>✨</span>
            <span>Key Game Features:</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li>· Real agencies: Ogilvy, TBWA, VML, Dentsu, Bujukrayu, FCN</li>
            <li>· Career ladder: Intern to Chief Creative Officer</li>
            <li>· Cannes Lions & Citra Pariwara award campaigns</li>
            <li>· Resign & found your own agency empire in SCBD</li>
            <li>· 100% Free & permanently unlocked God Mode</li>
          </ul>
        </div>
      </aside>

      {/* Mobile-first centered phone simulator container */}
      <div className="w-full max-w-md min-h-screen lg:min-h-[844px] lg:max-h-[92vh] bg-slate-950 flex flex-col border-x border-slate-900 lg:border lg:border-slate-800 lg:rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Sticky Top Status Header */}
        <TopStatusBar
          state={state}
          onOpenGodMode={() => setIsGodModeOpen(true)}
          onRestart={handleRestart}
        />

        {/* Tab Content Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'life' && (
            <LifeFeed
              state={state}
              onAdvanceAge={handleAdvanceAge}
              onOpenPendingEvent={() => setIsPendingEventOpen(true)}
              onOpenPendingBrief={() => setIsPendingBriefOpen(true)}
            />
          )}

          {activeTab === 'career' && (
            <CareerTab
              state={state}
              onUpdateState={setState}
              onOpenAgencyManagement={() => {
                setIsFoundingAgencyMode(false);
                setIsAgencyModalOpen(true);
              }}
              onOpenFoundAgency={() => {
                setIsFoundingAgencyMode(true);
                setIsAgencyModalOpen(true);
              }}
              onTriggerPitchBrief={handleTriggerPitchBrief}
            />
          )}

          {activeTab === 'relationships' && (
            <RelationshipsTab
              state={state}
              onUpdateState={setState}
            />
          )}

          {activeTab === 'activities' && (
            <ActivitiesTab
              state={state}
              onUpdateState={setState}
            />
          )}

          {activeTab === 'assets' && (
            <AssetsTab
              state={state}
              onUpdateState={setState}
            />
          )}

          {activeTab === 'godmode' && (
            <div className="space-y-4 pb-24">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                <h3 className="font-bold text-sm text-amber-300 mb-1">
                  God Mode Controls
                </h3>
                <p>
                  You have absolute power over character attributes, money, promotions, awards, and the simulation reality.
                </p>
                <button
                  onClick={() => setIsGodModeOpen(true)}
                  className="mt-3 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                >
                  Open Full God Mode Editor Window
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Fixed Bottom Navigation */}
        <BottomNav
          currentTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'godmode') {
              setIsGodModeOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          hasPendingAction={!!state.currentPendingBrief || !!state.currentPendingEvent}
        />

        {/* Modals */}
        <GodModeModal
          state={state}
          isOpen={isGodModeOpen}
          onClose={() => setIsGodModeOpen(false)}
          onUpdateState={setState}
        />

        <CharacterCreationModal
          isOpen={isCharacterCreationOpen}
          onCharacterCreated={handleCharacterCreated}
        />

        {state.currentPendingBrief && (
          <CampaignBriefModal
            state={state}
            brief={state.currentPendingBrief}
            isOpen={isPendingBriefOpen}
            onClose={() => setIsPendingBriefOpen(false)}
            onUpdateState={setState}
          />
        )}

        {state.currentPendingEvent && (
          <EventModal
            state={state}
            event={state.currentPendingEvent}
            isOpen={isPendingEventOpen}
            onClose={() => setIsPendingEventOpen(false)}
            onUpdateState={setState}
          />
        )}

        <AgencyManagementModal
          state={state}
          isOpen={isAgencyModalOpen}
          isFoundingMode={isFoundingAgencyMode}
          onClose={() => setIsAgencyModalOpen(false)}
          onUpdateState={setState}
        />

        <LifeSummaryModal
          state={state}
          isOpen={isLifeSummaryOpen}
          onRestartNewLife={() => {
            setIsLifeSummaryOpen(false);
            setIsCharacterCreationOpen(true);
          }}
          onContinueAsChild={(childState) => {
            setState(childState);
            setIsLifeSummaryOpen(false);
            setActiveTab('life');
          }}
        />
      </div>
    </div>
  );
}
