import React from 'react';
import { GameState, InteractiveEvent } from '../types/game';
import { resolveEventOption } from '../game/simulation';
import { sound } from '../game/sound';
import { AlertTriangle, Sparkles, X } from 'lucide-react';

interface EventModalProps {
  state: GameState;
  event: InteractiveEvent;
  isOpen: boolean;
  onClose: () => void;
  onUpdateState: (newState: GameState) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  state,
  event,
  isOpen,
  onClose,
  onUpdateState,
}) => {
  if (!isOpen) return null;

  const handleSelectOption = (index: number) => {
    sound.playTap();
    const next = resolveEventOption(state, index);
    onUpdateState(next);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-100">
              {event.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Dismiss event"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrative Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
            <p className="text-xs text-slate-200 leading-relaxed">
              {event.description}
            </p>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              What do you do?
            </label>
            <div className="space-y-2">
              {event.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className="w-full p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-sky-500 text-left transition-all group active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                      {opt.label}
                    </h4>
                  </div>
                  {opt.description && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      {opt.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
