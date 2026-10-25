import React, { useState } from 'react';
import { GameState, HousingAsset, VehicleAsset, InvestmentAsset } from '../types/game';
import { HOUSING_CATALOG, VEHICLE_CATALOG } from '../game/constants';
import { formatIDR, calculateNetWorth } from '../game/simulation';
import { sound } from '../game/sound';
import { Home, Car, TrendingUp, DollarSign, Key, Check, Plus, Minus } from 'lucide-react';

interface AssetsTabProps {
  state: GameState;
  onUpdateState: (newState: GameState) => void;
}

export const AssetsTab: React.FC<AssetsTabProps> = ({ state, onUpdateState }) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [investAmountInput, setInvestAmountInput] = useState<string>('10000000');

  const netWorth = calculateNetWorth(state);

  // Rent Housing
  const handleRentHousing = (house: HousingAsset) => {
    sound.playTap();
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    next.assets.currentHousing = { ...house, isOwned: false };
    next.stats.happiness = Math.min(100, next.stats.happiness + 10);
    setFeedback(`Moved into ${house.name} in ${house.neighborhood}! Rent: ${formatIDR(house.monthlyRentOrCostIDR)}/month.`);
    onUpdateState(next);
  };

  // Buy Housing
  const handleBuyHousing = (house: HousingAsset) => {
    sound.playTap();
    if (!house.purchasePriceIDR) return;
    if (state.moneyIDR < house.purchasePriceIDR) {
      sound.playAlert();
      setFeedback(`Insufficient funds! Need ${formatIDR(house.purchasePriceIDR)} to purchase.`);
      return;
    }

    sound.playCash();
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    next.moneyIDR -= house.purchasePriceIDR;
    const boughtHouse: HousingAsset = { ...house, isOwned: true };
    next.assets.currentHousing = boughtHouse;
    next.assets.ownedProperties.push(boughtHouse);
    next.stats.happiness = 100;

    next.history.unshift({
      id: `buy_house_${Date.now()}`,
      age: next.character.currentAge,
      year: next.character.birthYear + next.character.currentAge,
      title: `Purchased Property: ${house.name}!`,
      description: `Officially signed property deeds in ${house.neighborhood} for ${formatIDR(house.purchasePriceIDR)}. A proud milestone!`,
      category: 'finance',
    });

    setFeedback(`Congratulations! You purchased ${house.name}!`);
    onUpdateState(next);
  };

  // Buy Vehicle
  const handleBuyVehicle = (veh: VehicleAsset) => {
    sound.playTap();
    if (state.moneyIDR < veh.purchasePriceIDR) {
      sound.playAlert();
      setFeedback(`Insufficient funds! Need ${formatIDR(veh.purchasePriceIDR)} to purchase ${veh.name}.`);
      return;
    }

    sound.playCash();
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    next.moneyIDR -= veh.purchasePriceIDR;
    next.assets.vehicles.push(veh);
    next.stats.happiness = Math.min(100, next.stats.happiness + 20);
    next.stats.looks = Math.min(100, next.stats.looks + 10);

    next.history.unshift({
      id: `buy_veh_${Date.now()}`,
      age: next.character.currentAge,
      year: next.character.birthYear + next.character.currentAge,
      title: `Purchased ${veh.name}!`,
      description: `Rode out of the dealership in your shiny new ride. Cruising through Sudirman feels magnificent!`,
      category: 'lifestyle',
    });

    setFeedback(`Purchased ${veh.name} for ${formatIDR(veh.purchasePriceIDR)}!`);
    onUpdateState(next);
  };

  // Invest Money
  const handleAddInvestment = (type: InvestmentAsset['type'], name: string, returnPct: number) => {
    const amount = parseInt(investAmountInput, 10);
    if (isNaN(amount) || amount <= 0) return;
    if (state.moneyIDR < amount) {
      sound.playAlert();
      setFeedback(`Insufficient funds to invest ${formatIDR(amount)}.`);
      return;
    }

    sound.playCash();
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    next.moneyIDR -= amount;

    const existing = next.assets.investments.find((i) => i.name === name);
    if (existing) {
      existing.amountInvestedIDR += amount;
      existing.currentValueIDR += amount;
    } else {
      next.assets.investments.push({
        id: `inv_${Date.now()}`,
        name,
        type,
        amountInvestedIDR: amount,
        currentValueIDR: amount,
        annualReturnRatePct: returnPct,
      });
    }

    setFeedback(`Invested ${formatIDR(amount)} into ${name}!`);
    onUpdateState(next);
  };

  // Liquidate Investment
  const handleLiquidate = (inv: InvestmentAsset) => {
    sound.playCash();
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    next.moneyIDR += inv.currentValueIDR;
    next.assets.investments = next.assets.investments.filter((i) => i.id !== inv.id);

    setFeedback(`Liquidated ${inv.name} for ${formatIDR(inv.currentValueIDR)}!`);
    onUpdateState(next);
  };

  // Take Emergency Loan
  const handleTakeLoan = (amount: number) => {
    sound.playCash();
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    next.moneyIDR += amount;
    next.debtIDR += Math.round(amount * 1.15); // 15% interest
    setFeedback(`Received loan of ${formatIDR(amount)}. Total debt now: ${formatIDR(next.debtIDR)}.`);
    onUpdateState(next);
  };

  const handleRepayDebt = () => {
    if (state.debtIDR <= 0) return;
    const payment = Math.min(state.moneyIDR, state.debtIDR);
    if (payment <= 0) {
      setFeedback('You do not have cash to pay debt.');
      return;
    }
    sound.playCash();
    const next = JSON.parse(JSON.stringify(state)) as GameState;
    next.moneyIDR -= payment;
    next.debtIDR -= payment;
    setFeedback(`Repaid ${formatIDR(payment)} in debt! Remaining debt: ${formatIDR(next.debtIDR)}.`);
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

      {/* Net Worth & Financial Balance Sheet */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Total Net Worth
            </span>
            <h2 className="text-xl font-bold font-mono text-emerald-300 mt-0.5 tabular-nums">
              {formatIDR(netWorth)}
            </h2>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-400 block">Liquid Cash:</span>
            <span className="font-mono text-slate-100 font-semibold">{formatIDR(state.moneyIDR)}</span>
            {state.debtIDR > 0 && (
              <span className="block text-rose-400 font-mono mt-0.5">
                Debt: -{formatIDR(state.debtIDR)}
              </span>
            )}
          </div>
        </div>

        {state.debtIDR > 0 && (
          <div className="mt-3 pt-2 border-t border-slate-700 flex justify-end">
            <button
              onClick={handleRepayDebt}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
            >
              Repay Debt With Cash
            </button>
          </div>
        )}
      </div>

      {/* Current Residence */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Current Residence
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {state.assets.currentHousing?.isOwned ? 'Owned Property' : 'Rented'}
          </span>
        </div>

        {state.assets.currentHousing ? (
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
            <h4 className="text-xs font-bold text-slate-100">
              {state.assets.currentHousing.name}
            </h4>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Location: {state.assets.currentHousing.neighborhood}</span>
              <span>
                {state.assets.currentHousing.isOwned
                  ? 'Zero Rent (Owner)'
                  : `${formatIDR(state.assets.currentHousing.monthlyRentOrCostIDR)}/month`}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Living with parents / family.</p>
        )}

        {/* Housing Catalog */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Jakarta Housing Market (Rent or Buy)
          </span>
          <div className="space-y-2">
            {HOUSING_CATALOG.map((house) => {
              const isCurrent = state.assets.currentHousing?.id === house.id;
              return (
                <div
                  key={house.id}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-200 truncate">{house.name}</h5>
                    <p className="text-[10px] text-slate-400">
                      {house.neighborhood} · {formatIDR(house.monthlyRentOrCostIDR)}/mo
                      {house.purchasePriceIDR ? ` · Buy: ${formatIDR(house.purchasePriceIDR)}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isCurrent ? (
                      <span className="text-xs text-emerald-400 font-semibold px-2 py-1 bg-emerald-950/40 rounded-lg">
                        Current
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleRentHousing(house)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold"
                        >
                          Rent
                        </button>
                        {house.purchasePriceIDR && (
                          <button
                            onClick={() => handleBuyHousing(house)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                          >
                            Buy
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vehicles */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Vehicles Garage ({state.assets.vehicles.length})
            </h3>
          </div>
        </div>

        {state.assets.vehicles.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {state.assets.vehicles.map((v, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-800/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200">{v.name}</span>
                  <span className="block text-[10px] text-slate-400">Resale Value: {formatIDR(v.resaleValueIDR)}</span>
                </div>
                <span className="text-[10px] text-sky-400 font-semibold">Cool: {v.coolScore}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Vehicle Dealership */}
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Jakarta Dealership
        </span>
        <div className="space-y-2">
          {VEHICLE_CATALOG.map((veh) => (
            <div key={veh.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-slate-200">{veh.name}</h5>
                <p className="text-[10px] text-slate-400">{formatIDR(veh.purchasePriceIDR)} · Maint: {formatIDR(veh.monthlyMaintenanceIDR)}/mo</p>
              </div>
              <button
                onClick={() => handleBuyVehicle(veh)}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold"
              >
                Buy
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Investments Portfolio */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Investments Portfolio
            </h3>
          </div>
          <span className="text-xs font-mono text-purple-300 font-semibold">
            {formatIDR(state.assets.investments.reduce((acc, i) => acc + i.currentValueIDR, 0))}
          </span>
        </div>

        {/* Existing Investments List */}
        {state.assets.investments.length > 0 && (
          <div className="space-y-2 mb-4">
            {state.assets.investments.map((inv) => (
              <div key={inv.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-200">{inv.name}</h5>
                  <p className="text-[11px] text-slate-400">
                    Invested: {formatIDR(inv.amountInvestedIDR)} · Expected: +{inv.annualReturnRatePct}%/yr
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {formatIDR(inv.currentValueIDR)}
                  </span>
                  <button
                    onClick={() => handleLiquidate(inv)}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] rounded"
                  >
                    Cash Out
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Invest Options */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-slate-400">Investment Amount:</span>
            <input
              type="number"
              value={investAmountInput}
              onChange={(e) => setInvestAmountInput(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 w-32 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => handleAddInvestment('deposito', 'BCA Deposito Berjangka', 5)}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-200">Deposito BCA</div>
              <div className="text-[10px] text-slate-400">Guaranteed 5% p.a.</div>
            </button>

            <button
              onClick={() => handleAddInvestment('reksadana', 'Bibit Reksadana Obligasi', 8)}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-200">Reksadana Bibit</div>
              <div className="text-[10px] text-slate-400">Target 8% p.a.</div>
            </button>

            <button
              onClick={() => handleAddInvestment('saham_ihsg', 'Saham BBCA & Blue Chip', 14)}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-200">Saham IHSG (BBCA)</div>
              <div className="text-[10px] text-slate-400">Growth + Dividend (14%)</div>
            </button>

            <button
              onClick={() => handleAddInvestment('crypto', 'Bitcoin & Ethereum', 28)}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-left transition-colors"
            >
              <div className="text-xs font-bold text-slate-200">Crypto (BTC/ETH)</div>
              <div className="text-[10px] text-slate-400">High Volatility (28%)</div>
            </button>
          </div>
        </div>

        {/* Emergency Loans / Pinjol */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300">Need Quick Cash?</span>
            <p className="text-[10px] text-slate-500">Emergency BCA / Bank loan (15% interest)</p>
          </div>
          <button
            onClick={() => handleTakeLoan(20_000_000)}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold"
          >
            Borrow {formatIDR(20_000_000)}
          </button>
        </div>
      </div>
    </div>
  );
};
