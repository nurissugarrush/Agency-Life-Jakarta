import React, { useState } from 'react';
import { GameState, CampaignBrief, CampaignResult } from '../types/game';
import { evaluateCampaignBrief, formatIDR } from '../game/simulation';
import { sound } from '../game/sound';
import { Sparkles, Award, AlertCircle, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CampaignBriefModalProps {
  state: GameState;
  brief: CampaignBrief;
  isOpen: boolean;
  onClose: () => void;
  onUpdateState: (newState: GameState) => void;
}

export const CampaignBriefModal: React.FC<CampaignBriefModalProps> = ({
  state,
  brief,
  isOpen,
  onClose,
  onUpdateState,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 'result'>(1);
  const [bigIdea, setBigIdea] = useState<'emotional_tearjerker' | 'absurdist_meme_comedy' | 'high_concept_visual' | 'guerrilla_prank' | 'ai_interactive'>('high_concept_visual');
  const [prodChoice, setProdChoice] = useState<'shoestring' | 'standard' | 'blockbuster_hollywood'>('standard');
  const [revisionResponse, setRevisionResponse] = useState<'obedient_yes_boss' | 'diplomatic_compromise' | 'bold_artistic_stand'>('diplomatic_compromise');
  const [campaignResult, setCampaignResult] = useState<CampaignResult | null>(null);

  if (!isOpen) return null;

  const handleLaunchCampaign = () => {
    sound.playTap();
    const { newState, result } = evaluateCampaignBrief(state, brief, {
      bigIdeaAngle: bigIdea,
      productionBudgetChoice: prodChoice,
      revisionResponse,
    });

    setCampaignResult(result);
    setStep('result');

    if (result.awardsWon.length > 0) {
      sound.playAwardFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } else {
      sound.playCash();
    }

    onUpdateState(newState);
  };

  const handleFinish = () => {
    sound.playTap();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Agency Client Brief
            </span>
            <h2 className="text-sm font-bold text-slate-100">
              {brief.clientName}: {brief.productName}
            </h2>
          </div>
          {step === 'result' ? (
            <button onClick={handleFinish} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          ) : (
            <div className="text-xs font-mono font-bold text-emerald-400">
              Budget: {formatIDR(brief.budgetIDR)}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Industry:</span>
                  <span className="font-semibold text-slate-200">{brief.industry}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Client Temperament:</span>
                  <span className="font-semibold text-amber-400 capitalize">{brief.clientTemperament.replace(/_/g, ' ')}</span>
                </div>
                <div className="pt-1.5 text-slate-300">
                  <span className="font-bold text-slate-200 block mb-0.5">Objective:</span>
                  <p className="text-slate-400 italic">"{brief.objective}"</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-2">
                  Step 1: Choose Your Creative Angle / Big Idea
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'emotional_tearjerker', title: 'Emotional Tearjerker (Air Mata Lebaran)', desc: 'Heartwarming family reunion story with melancholic acoustic guitar. Guaranteed 50 million tears.' },
                    { id: 'absurdist_meme_comedy', title: 'Absurdist Gen Z Meme Comedy', desc: 'Surreal humor, talking animals, and unhinged TikTok trending dance choreography.' },
                    { id: 'high_concept_visual', title: 'High-Concept Cinematic Art Direction', desc: 'Sleek filmic lighting, minimal copy, philosophical metaphor. Targeted for Cannes Lions & D&AD.' },
                    { id: 'guerrilla_prank', title: 'Wild Guerrilla Stunt di Sudirman', desc: 'Giant inflatable mascot hanging from MRT bridge causing instant netizen controversy.' },
                    { id: 'ai_interactive', title: 'Interactive AI Experiential Stunt', desc: 'Personalized AI story generator integrated with QRIS rewards. High-tech and buzzy.' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setBigIdea(opt.id as typeof bigIdea)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        bigIdea === opt.id
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-100'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <h4 className="text-xs font-bold">{opt.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                >
                  Next: Production Execution →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-2">
                  Step 2: Choose Production House Execution
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'shoestring', title: 'Shoestring Guerrilla DIY', desc: 'Shot on iPhone 16 Pro with CapCut grading. Maximum budget savings, authentic raw feel.' },
                    { id: 'standard', title: 'Established Jakarta Production House', desc: 'Professional studio in Jagakarsa, RED camera, skilled local gaffer and sound designers.' },
                    { id: 'blockbuster_hollywood', title: 'Blockbuster Regional Production (Bangkok Post-Production)', desc: 'Top international director, 3D CGI rendering, and orchestral musical score.' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setProdChoice(opt.id as typeof prodChoice)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        prodChoice === opt.id
                          ? 'bg-sky-500/20 border-sky-500/60 text-sky-100'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <h4 className="text-xs font-bold">{opt.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow"
                >
                  Next: Client Revision Feedback →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Client Feedback Arrived:</span>
                </div>
                <p className="italic text-amber-300/90">
                  "Halo mas/mbak, direksi kami suka idenya! Tapi tolong logo produk dibesarkan 300%, durasi jingle diperpanjang, dan tambahkan maskot kucing joget di pojok kanan."
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-2">
                  Step 3: How Will You Respond to the Client?
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'obedient_yes_boss', title: 'Obedient: "Siap pak/bu, segera kami revisi!"', desc: '100% compliant. Client is thrilled and pays fast, but creative integrity takes a hit.' },
                    { id: 'diplomatic_compromise', title: 'Diplomatic Compromise: Subtle Logo Glow & Tasteful Cameo', desc: 'Present an elegant middle ground that protects the narrative while making the client feel heard.' },
                    { id: 'bold_artistic_stand', title: 'Bold Artistic Stand: "Trust The Creative Process"', desc: 'Fight aggressively for the pure vision. Risky move! If it succeeds, awards await.' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setRevisionResponse(opt.id as typeof revisionResponse)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        revisionResponse === opt.id
                          ? 'bg-purple-500/20 border-purple-500/60 text-purple-100'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <h4 className="text-xs font-bold">{opt.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  ← Back
                </button>
                <button
                  onClick={handleLaunchCampaign}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg"
                >
                  🚀 Launch Campaign to Indonesia!
                </button>
              </div>
            </div>
          )}

          {step === 'result' && campaignResult && (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700">
                <span className="text-3xl block mb-2">
                  {campaignResult.awardsWon.length > 0 ? '🏆' : '📈'}
                </span>
                <h3 className="text-base font-bold text-slate-100">
                  {campaignResult.campaignTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Launched across national television, TikTok, Instagram, and Sudirman digital billboards!
                </p>

                {/* Score Meters */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800">
                  <div className="p-2 rounded-xl bg-slate-800/80">
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      {campaignResult.effectiveness}%
                    </div>
                    <div className="text-[10px] text-slate-400">Effectiveness</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/80">
                    <div className="text-xs font-mono font-bold text-sky-400">
                      {campaignResult.clientSatisfaction}%
                    </div>
                    <div className="text-[10px] text-slate-400">Client Joy</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/80">
                    <div className="text-xs font-mono font-bold text-purple-400">
                      {campaignResult.buzz}%
                    </div>
                    <div className="text-[10px] text-slate-400">Netizen Buzz</div>
                  </div>
                </div>

                {/* Awards Won */}
                {campaignResult.awardsWon.length > 0 ? (
                  <div className="mt-4 p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-left">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Award Festival Victories:</span>
                    </div>
                    <ul className="text-xs text-amber-200/90 space-y-1">
                      {campaignResult.awardsWon.map((aw, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span>✨</span>
                          <span className="font-semibold">{aw.tier.toUpperCase()}</span>
                          <span>at {aw.festivalName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-3 italic">
                    The campaign didn't take home gold at Citra Pariwara this time, but the client approved the final payment invoice.
                  </p>
                )}
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow"
              >
                Continue Your Agency Career
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
