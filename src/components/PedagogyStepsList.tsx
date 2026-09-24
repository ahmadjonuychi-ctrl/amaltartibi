import React from 'react';
import { MathSolution } from '../types';
import { CheckCircle2, ChevronRight, Layers, Flame } from 'lucide-react';
import { getStepColor } from './DigitalBlackboard';

interface Props {
  solution: MathSolution;
  activeStepIndex: number;
  onSelectStep: (idx: number) => void;
}

export const PedagogyStepsList: React.FC<Props> = ({
  solution,
  activeStepIndex,
  onSelectStep,
}) => {
  const currentStep = solution.steps[activeStepIndex];
  const activeCol = getStepColor(activeStepIndex);

  return (
    <div className="w-full bg-[#0d1627]/90 rounded-2xl border border-slate-800 p-3 sm:p-5 flex flex-col gap-3.5 shadow-xl">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Bosqichma-bosqich Yechim Jurnali
          </h3>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono border border-slate-700">
          Jami: {solution.steps.length} ta amal
        </span>
      </div>

      {/* 5-QADAMLI PEDAGOGIK ALGORITM (Har bir amal uchun sabab va hisob) */}
      {currentStep && (
        <div className={`p-3 sm:p-4 rounded-xl bg-slate-900/90 border ${activeCol.border} ${activeCol.glow}`}>
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full ${activeCol.badgeBg} ${activeCol.badgeText} text-xs font-black flex items-center justify-center`}>
                ✓
              </span>
              <span className={`text-xs sm:text-sm font-bold ${activeCol.text} uppercase tracking-wider`}>
                {currentStep.stepIndex}-Amal: {currentStep.categoryTitleUz}
              </span>
            </div>
            <div className={`flex items-center gap-1.5 text-[11px] ${activeCol.text}`}>
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              <span>Olov rangda yonib yechilmoqda</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-300 mt-2.5">
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/70">
              <span className={`${activeCol.text} font-bold block mb-0.5`}>1. Amal:</span>
              <span className="text-white font-math font-bold">{currentStep.activeSubExpression}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/70">
              <span className={`${activeCol.text} font-bold block mb-0.5`}>2. Sababi:</span>
              <span className="text-slate-200 text-[11px] leading-tight block">
                {currentStep.pedagogyWhyUz}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/70">
              <span className={`${activeCol.text} font-bold block mb-0.5`}>3. Qanday yechildi:</span>
              <span className={`font-math font-bold ${activeCol.text}`}>
                {currentStep.calculationEquation}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/70 md:col-span-3">
              <span className="text-emerald-400 font-bold block mb-0.5">4. Qoida va hosil bo‘lgan natija:</span>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-slate-300 text-[11px]">{currentStep.pedagogyRuleUz}</span>
                <span className={`font-math text-xs bg-slate-900 px-2 py-0.5 rounded border ${activeCol.border} ${activeCol.text}`}>
                  {currentStep.expressionAfter}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step by step card list */}
      <div className="flex flex-col gap-2">
        {solution.steps.map((step, idx) => {
          const isSelected = idx === activeStepIndex;
          const isPast = idx < activeStepIndex;
          const col = getStepColor(idx);

          return (
            <div
              key={step.id}
              onClick={() => onSelectStep(idx)}
              className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                isSelected
                  ? `${col.bgLight} ${col.border} shadow-md ring-1 ring-white/50`
                  : isPast
                  ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/60'
                  : 'bg-slate-900/30 border-slate-800/60 opacity-85 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected
                      ? `${col.badgeBg} ${col.badgeText} font-black shadow`
                      : isPast
                      ? `${col.badgeBg} ${col.badgeText} opacity-90`
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-200">
                      {step.categoryBadgeUz}
                    </span>
                    <span className={`font-math font-bold text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 ${col.text}`}>
                      {step.calculationEquation}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{step.pedagogyWhyUz}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className={`text-[11px] font-math px-2 py-1 rounded border ${col.bgLight} ${col.border} ${col.text}`}>
                  {step.expressionAfter}
                </span>
                <ChevronRight
                  className={`w-4 h-4 ${isSelected ? col.text : 'text-slate-600'}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
