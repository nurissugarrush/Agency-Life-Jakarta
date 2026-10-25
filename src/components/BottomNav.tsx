import React from 'react';
import { Newspaper, Briefcase, Heart, Compass, Wallet, Sparkles } from 'lucide-react';
import { sound } from '../game/sound';

export type TabType = 'life' | 'career' | 'relationships' | 'activities' | 'assets' | 'godmode';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  hasPendingAction?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, hasPendingAction }) => {
  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'life', label: 'Life', icon: Newspaper },
    { id: 'career', label: 'Career', icon: Briefcase },
    { id: 'relationships', label: 'Relations', icon: Heart },
    { id: 'activities', label: 'Activities', icon: Compass },
    { id: 'assets', label: 'Assets', icon: Wallet },
    { id: 'godmode', label: 'God Mode', icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe flex justify-center pointer-events-none">
      <div className="w-full max-w-md grid grid-cols-6 items-center h-16 px-1 pointer-events-auto bg-slate-900 border-x border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playTap();
                onSelectTab(tab.id);
              }}
              aria-label={tab.label}
              className={`relative flex flex-col items-center justify-center h-full min-h-[44px] transition-colors rounded-lg ${
                isActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.id === 'life' && hasPendingAction && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
                {tab.id === 'godmode' && (
                  <span className="absolute -top-1 -right-1.5 text-[8px] font-bold text-amber-300">
                    ★
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[54px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
