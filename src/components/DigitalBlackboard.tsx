import React, { useRef, useEffect } from 'react';
import { MathSolution } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  CheckCircle2,
  BookOpen,
  Check,
  Equal,
} from 'lucide-react';

interface Props {
  solution: MathSolution;
  sceneType: 'INTRO_TEXT' | 'INTRO_EXPR' | 'STEP' | 'FINAL_ANSWER' | 'RULE_SUMMARY';
  activeStepIndex: number;
  subStepPhase: 'HIGHLIGHT' | 'CALCULATE' | 'TRANSFORM';
  stepProgressPercent: number;
}

// Distinct pedagogical step color palette:
// Step 1: Emerald Green (yashil)
// Step 2: Sky Blue (ko'k)
// Step 3: Amber / Orange (sariq/olov)
// Step 4: Purple / Violet (binafsha)
// Step 5: Rose / Pink (pushti)
// Step 6: Teal (firuzarang)
export const STEP_COLORS = [
  {
    name: 'Yashil (Emerald)',
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-slate-950',
    border: 'border-emerald-400',
    bgLight: 'bg-emerald-950/80',
    text: 'text-emerald-300',
    glow: 'shadow-[0_0_18px_rgba(16,185,129,0.55)]',
    colorHex: '#10b981',
  },
  {
    name: 'Ko‘k (Sky Blue)',
    badgeBg: 'bg-sky-400',
    badgeText: 'text-slate-950',
    border: 'border-sky-400',
    bgLight: 'bg-sky-950/80',
    text: 'text-sky-300',
    glow: 'shadow-[0_0_18px_rgba(56,189,248,0.55)]',
    colorHex: '#38bdf8',
  },
  {
    name: 'Sariq-Olov (Amber)',
    badgeBg: 'bg-amber-400',
    badgeText: 'text-slate-950',
    border: 'border-amber-400',
    bgLight: 'bg-amber-950/80',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_18px_rgba(251,191,36,0.55)]',
    colorHex: '#fbbf24',
  },
  {
    name: 'Binafsha (Purple)',
    badgeBg: 'bg-purple-400',
    badgeText: 'text-slate-950',
    border: 'border-purple-400',
    bgLight: 'bg-purple-950/80',
    text: 'text-purple-300',
    glow: 'shadow-[0_0_18px_rgba(192,132,252,0.55)]',
    colorHex: '#c084fc',
  },
  {
    name: 'Pushti (Rose)',
    badgeBg: 'bg-rose-400',
    badgeText: 'text-slate-950',
    border: 'border-rose-400',
    bgLight: 'bg-rose-950/80',
    text: 'text-rose-300',
    glow: 'shadow-[0_0_18px_rgba(251,113,133,0.55)]',
    colorHex: '#fb7185',
  },
  {
    name: 'Firuzarang (Teal)',
    badgeBg: 'bg-teal-400',
    badgeText: 'text-slate-950',
    border: 'border-teal-400',
    bgLight: 'bg-teal-950/80',
    text: 'text-teal-300',
    glow: 'shadow-[0_0_18px_rgba(45,212,191,0.55)]',
    colorHex: '#2dd4bf',
  },
];

export function getStepColor(stepIdx: number) {
  return STEP_COLORS[stepIdx % STEP_COLORS.length];
}

export const DigitalBlackboard: React.FC<Props> = ({
  solution,
  sceneType,
  activeStepIndex,
  subStepPhase,
  stepProgressPercent,
}) => {
  const currentStep = solution.steps[activeStepIndex];
  const totalOperationsCount = solution.steps.length;
  const currentActiveStepNum = activeStepIndex + 1;
  const stageScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the main window smoothly if content wraps or expands
  useEffect(() => {
    if (stageScrollRef.current) {
      stageScrollRef.current.scrollTo({
        top: stageScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [activeStepIndex, subStepPhase, sceneType]);

  // Order marker status checker
  const getMarkerStatus = (stepNum: number) => {
    const isStepFinished =
      sceneType === 'FINAL_ANSWER' ||
      sceneType === 'RULE_SUMMARY' ||
      stepNum < currentActiveStepNum ||
      (sceneType === 'STEP' && stepNum === currentActiveStepNum && subStepPhase === 'TRANSFORM');

    const isCurrent =
      sceneType === 'STEP' && stepNum === currentActiveStepNum && subStepPhase !== 'TRANSFORM';

    return { isStepFinished, isCurrent };
  };

  const currentColorConfig = getStepColor(activeStepIndex);

  // Adapt font sizes dynamically depending on total steps
  const mathFontClasses =
    totalOperationsCount > 4
      ? 'text-sm sm:text-base md:text-xl font-bold px-1 py-0.5'
      : totalOperationsCount > 2
      ? 'text-base sm:text-xl md:text-2xl font-bold px-1.5 py-0.5'
      : 'text-lg sm:text-2xl md:text-3xl font-extrabold px-2 py-1';

  return (
    <div
      id="digital-math-board"
      className="relative w-full rounded-2xl bg-[#080e1b] border-2 border-slate-700/80 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[520px] sm:min-h-[580px] md:min-h-[640px] p-3 sm:p-5 md:p-6 select-none transition-all math-board-grid"
    >
      {/* Top ambient line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-400 opacity-80" />

      {/* ========================================================
          1. YUQORI QISM: BERILGAN MISOL VA UNING TEPASIDA AMAL TARTIBI
          Bajarilayotgan amal oldidan o'z rangiga o'tadi (1-amal yashil, 2-amal ko'k va h.k.)
          ======================================================== */}
      <div className="w-full flex flex-col items-center gap-1.5 z-10">
        <div className="w-full flex items-center justify-between px-1 text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Berilgan Misol va Amal Tartibi:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs text-slate-300 font-mono bg-slate-900/90 border border-slate-700/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span>Bajarildi:</span>
              <strong className="text-emerald-400">
                {sceneType === 'FINAL_ANSWER' || sceneType === 'RULE_SUMMARY'
                  ? totalOperationsCount
                  : activeStepIndex + (subStepPhase === 'TRANSFORM' ? 1 : 0)}
              </strong>
              <span>/ {totalOperationsCount} ta</span>
            </span>
          </div>
        </div>

        {/* INITIAL EXPRESSION CONTAINER */}
        <div className="w-full max-w-5xl px-3 sm:px-6 py-2 rounded-xl bg-slate-900/95 border border-slate-700/90 backdrop-blur-md shadow-xl overflow-x-auto scrollbar-thin">
          <div className="flex items-end justify-center gap-1 sm:gap-2 min-w-max mx-auto py-0.5">
            {solution.initialTokens && solution.initialTokens.length > 0 ? (
              solution.initialTokens.map((tok) => {
                const marker = solution.orderMarkers?.find((m) => m.tokenId === tok.id);
                const stepNum = marker ? marker.stepIndex : null;

                if (!marker || stepNum === null) {
                  return (
                    <div key={tok.id} className="flex flex-col items-center justify-end">
                      <div className="h-6 sm:h-7" />
                      <span className="font-math text-base sm:text-xl md:text-2xl font-bold tracking-wider px-1 py-0.5 text-slate-200">
                        {tok.value}
                      </span>
                    </div>
                  );
                }

                const stepZeroIdx = stepNum - 1;
                const col = getStepColor(stepZeroIdx);
                const { isStepFinished, isCurrent } = getMarkerStatus(stepNum);

                return (
                  <div
                    key={tok.id}
                    className="flex flex-col items-center justify-end group transition-all"
                  >
                    {/* AMAL TARTIBI NISHONI */}
                    <div className="h-6 sm:h-7 flex items-center justify-center mb-0.5">
                      <motion.div
                        animate={{
                          scale: isCurrent ? 1.2 : 1,
                          y: isCurrent ? -2 : 0,
                        }}
                        transition={{ duration: 0.25 }}
                        className={`flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] sm:text-[11px] font-mono font-bold transition-all duration-300 ${
                          isStepFinished
                            ? `${col.badgeBg} ${col.badgeText} shadow-md`
                            : isCurrent
                            ? `${col.badgeBg} ${col.badgeText} ring-2 ring-white font-black scale-110 shadow-lg`
                            : 'bg-amber-950/80 text-amber-300 border border-amber-400/60'
                        }`}
                      >
                        {isStepFinished ? (
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        ) : (
                          <span className="font-sans font-bold">№</span>
                        )}
                        <span>{marker.stepIndex}</span>
                      </motion.div>
                    </div>

                    {/* TOKEN VALUE OF THE INITIAL EXPRESSION */}
                    <span
                      className={`font-math text-base sm:text-xl md:text-2xl font-bold tracking-wider px-1 py-0.5 rounded-lg transition-all duration-300 ${
                        isCurrent
                          ? `${col.text} font-black ${col.bgLight} border ${col.border}`
                          : isStepFinished
                          ? `${col.text} font-bold opacity-90`
                          : 'text-slate-100'
                      }`}
                    >
                      {tok.value}
                    </span>
                  </div>
                );
              })
            ) : (
              <span className="text-slate-400 font-math text-lg">
                {solution.cleanExpression}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          2. ASOSIY KATTA YECHISH OYNASI (2-OYNA)
          User Talabi:
          - "videoda korsatayotgan 2- oynani kattaroq olchamda ajrat, hamma bajarilgan amal korinib tursin"
          - "pastdan surib korish funksiya kerak emas tola bitta oynada korinsin sirmasa shriftni sal kichraytirib ol, bir qatorga yozish shart emas, 2-3 qator bolib ketsa ham mayli"
          - "masalan 1-amal osha amal ishlanadigan ifoda ustida yoz, = belgisidan keyingi 1-amal yozuvini yozma, shu ketma ketlikni saqla"
          - "1-amal bajarilishidan avval yashil rangga otkaz = belgisidan keyin natijasi yashil rangda tursin, 2-mal bajarilganda boshqa rangda amalni belgila va = dan keyin natijasi osha rangda korinsin, ketma ketlikni saqlab bajar"
          ======================================================== */}
      <div className="w-full flex-1 flex flex-col my-2.5 relative z-10">
        <AnimatePresence mode="wait">
          {/* 0. INTRO TEXT */}
          {sceneType === 'INTRO_TEXT' && (
            <motion.div
              key="intro-text"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-3 py-4"
            >
              <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-emerald-400 mb-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30">
                Matematika Darsligi
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
                Amallarni Bajarishning Bosqichma-bosqich Zanjiri
              </h2>
              <p className="mt-2 text-xs sm:text-base text-slate-300 max-w-xl">
                Har bir amal ifoda ustida tartib raqami bilan ko‘rsatiladi, so‘ng olovda yonib hisoblanadi va tenglik belgisi bilan yangi natijasi hosil bo‘lib boradi.
              </p>
            </motion.div>
          )}

          {/* 1. INTRO EXPR */}
          {sceneType === 'INTRO_EXPR' && (
            <motion.div
              key="intro-expr"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex-1 flex flex-col items-center justify-center text-center px-2 py-3 max-w-4xl mx-auto"
            >
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-400 mb-2">
                Dastlabki Ifoda
              </span>
              <div className="p-3 sm:p-5 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl flex items-center justify-center max-w-full">
                <span className="font-math text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-wider">
                  {solution.cleanExpression}
                </span>
              </div>
            </motion.div>
          )}

          {/* 2. KATTA YECHISH OYNASI (STEP, FINAL_ANSWER, RULE_SUMMARY) */}
          {(sceneType === 'STEP' || sceneType === 'FINAL_ANSWER' || sceneType === 'RULE_SUMMARY') && (
            <motion.div
              key="main-chain-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col w-full"
            >
              {/* STATUS BAR & WHY EXPLANATION */}
              {sceneType === 'STEP' && currentStep && (
                <div className="w-full mb-2 flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full ${currentColorConfig.badgeBg} ${currentColorConfig.badgeText} font-bold text-xs shadow-md`}
                    >
                      <Flame className="w-3.5 h-3.5 animate-pulse" />
                      <span>{currentStep.stepIndex}-Amal: {currentStep.categoryBadgeUz}</span>
                    </div>

                    <span className="text-xs text-slate-300 font-medium">
                      {currentStep.stepIndex}-amal / {totalOperationsCount} ta
                    </span>

                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-[10px] text-amber-300 font-mono shadow-sm">
                      <span>5 soniya tahlil:</span>
                      <div className="w-14 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-100"
                          style={{ width: `${stepProgressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Why banner */}
                  <div
                    className={`w-full max-w-4xl px-3 py-1.5 rounded-xl bg-slate-900/95 border ${currentColorConfig.border} shadow-md flex flex-col sm:flex-row items-center justify-between gap-2`}
                  >
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <span className={`px-2 py-0.5 rounded ${currentColorConfig.badgeBg} ${currentColorConfig.badgeText} font-black text-xs shrink-0`}>
                        Sababi:
                      </span>
                      <span className={`${currentColorConfig.text} font-medium`}>
                        {currentStep.pedagogyWhyUz}
                      </span>
                    </div>

                    <div className="shrink-0 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono flex items-center gap-1.5 text-slate-200">
                      <span className="font-bold text-amber-300">Hisob:</span>
                      <span className={`font-math font-bold ${currentColorConfig.text}`}>
                        {currentStep.calculationEquation}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  KATTA KO'RINADIGAN 2-OYNA (NATIJALAR ZANJIRI)
                  - Butunlay bitta oynada ko'rinadi (flex-wrap, 2-3 qatorga tushadi, surish shart emas)
                  - Har bir ifoda ustida tegishli amal yorlig'i (1-amal, 2-amal...)
                  - = dan keyin "1-amal" yozuvi yozilmaydi, faqat natijasi o'sha rangda turadi!
                  ======================================================== */}
              <div
                ref={stageScrollRef}
                className="flex-1 w-full rounded-2xl bg-[#050b16]/95 border-2 border-slate-700/90 shadow-2xl p-3 sm:p-5 flex items-center justify-center"
              >
                {/* Wrap container for entire mathematical chain: expands across 1, 2, or 3 rows naturally */}
                <div className="w-full flex flex-wrap items-center justify-center content-center gap-x-2.5 sm:gap-x-3.5 gap-y-3 sm:gap-y-4">
                  {solution.steps.map((st, idx) => {
                    const isStepReached =
                      sceneType === 'FINAL_ANSWER' ||
                      sceneType === 'RULE_SUMMARY' ||
                      (sceneType === 'STEP' && idx <= activeStepIndex);

                    if (!isStepReached) return null;

                    const isCurrentStep = sceneType === 'STEP' && idx === activeStepIndex;
                    const stepCol = getStepColor(idx);

                    // For the initial expression (idx === 0):
                    if (idx === 0) {
                      return (
                        <React.Fragment key="chain-step-0">
                          {/* DASTLABKI IFODA — BU YERDA 1-AMAL ISHLANADIGAN IFODA USTIDA "1-amal" YOZILADI */}
                          <div className="inline-flex items-center gap-0.5 sm:gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-950 border border-slate-700/80 shadow-inner">
                            {st.tokensBefore.map((tok) => {
                              const isHighlighted = st.highlightTokenIds.includes(tok.id);

                              return (
                                <div
                                  key={tok.id}
                                  className="flex flex-col items-center justify-end"
                                >
                                  {/* 1-amal yozuvi osha amal ishlanadigan ifoda ustida yoziladi */}
                                  <div className="h-5 sm:h-6 flex items-center justify-center mb-0.5">
                                    {isHighlighted && (
                                      <motion.span
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`px-1.5 py-0.2 rounded text-[10px] sm:text-xs font-bold font-sans tracking-wide shadow ${stepCol.badgeBg} ${stepCol.badgeText}`}
                                      >
                                        1-amal
                                      </motion.span>
                                    )}
                                  </div>

                                  {/* Token value */}
                                  <motion.span
                                    animate={
                                      isCurrentStep && isHighlighted
                                        ? subStepPhase === 'CALCULATE'
                                          ? {
                                              scale: [1.12, 1.25, 1.18],
                                              y: -3,
                                            }
                                          : { scale: 1.12, y: -2 }
                                        : { scale: 1, y: 0 }
                                    }
                                    transition={{ duration: 0.3 }}
                                    className={`font-math ${mathFontClasses} rounded-lg whitespace-nowrap transition-all duration-300 ${
                                      isHighlighted
                                        ? isCurrentStep && subStepPhase === 'CALCULATE'
                                          ? 'text-orange-200 bg-gradient-to-r from-orange-600/80 via-red-600/80 to-amber-600/80 border-2 border-orange-400 glow-flame text-glow-flame z-20'
                                          : `${stepCol.text} ${stepCol.bgLight} border ${stepCol.border} font-black`
                                        : 'text-white'
                                    }`}
                                  >
                                    {tok.value}
                                  </motion.span>
                                </div>
                              );
                            })}
                          </div>

                          {/* = BELGISI */}
                          <span className="font-math font-extrabold text-xl sm:text-2xl md:text-3xl text-amber-400 px-0.5 shrink-0">
                            =
                          </span>

                          {/* = BELGISIDAN KEYIN 1-AMAL YOZUVINI YOZMAYMIZ! NATIJASI YASHIL RANGDA TURADI */}
                          <div className="inline-flex items-center gap-0.5 sm:gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-950 border border-slate-700/80 shadow-inner">
                            {st.tokensAfter.map((tok) => {
                              const isNewResult = tok.id.startsWith('res_');
                              const isStep2Next =
                                activeStepIndex === 1 &&
                                solution.steps[1]?.highlightTokenIds.includes(tok.id);
                              const step2Col = getStepColor(1);

                              return (
                                <div
                                  key={tok.id}
                                  className="flex flex-col items-center justify-end"
                                >
                                  {/* If step 2 is active or reached, show "2-amal" above the 2nd operation */}
                                  <div className="h-5 sm:h-6 flex items-center justify-center mb-0.5">
                                    {isStep2Next && (
                                      <motion.span
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`px-1.5 py-0.2 rounded text-[10px] sm:text-xs font-bold font-sans tracking-wide shadow ${step2Col.badgeBg} ${step2Col.badgeText}`}
                                      >
                                        2-amal
                                      </motion.span>
                                    )}
                                  </div>

                                  <motion.span
                                    animate={
                                      isStep2Next
                                        ? subStepPhase === 'CALCULATE'
                                          ? { scale: [1.12, 1.25, 1.18], y: -3 }
                                          : { scale: 1.12, y: -2 }
                                        : isNewResult && isCurrentStep && subStepPhase === 'TRANSFORM'
                                        ? { scale: [1.35, 1.12], opacity: 1 }
                                        : { scale: 1, y: 0 }
                                    }
                                    transition={{ duration: 0.3 }}
                                    className={`font-math ${mathFontClasses} rounded-lg whitespace-nowrap transition-all duration-300 ${
                                      isStep2Next && subStepPhase === 'CALCULATE'
                                        ? 'text-orange-200 bg-gradient-to-r from-orange-600/80 via-red-600/80 to-amber-600/80 border-2 border-orange-400 glow-flame text-glow-flame z-20'
                                        : isStep2Next
                                        ? `${step2Col.text} ${step2Col.bgLight} border ${step2Col.border} font-black`
                                        : isNewResult
                                        ? `${stepCol.text} ${stepCol.bgLight} border-2 ${stepCol.border} font-black shadow-[0_0_15px_rgba(16,185,129,0.5)]`
                                        : 'text-white'
                                    }`}
                                  >
                                    {tok.value}
                                  </motion.span>
                                </div>
                              );
                            })}
                          </div>
                        </React.Fragment>
                      );
                    }

                    // For step index >= 1 (Step 2, Step 3, etc.):
                    return (
                      <React.Fragment key={`chain-step-${idx}`}>
                        {/* = BELGISI */}
                        <span className="font-math font-extrabold text-xl sm:text-2xl md:text-3xl text-amber-400 px-0.5 shrink-0">
                          =
                        </span>

                        {/* = BELGISIDAN KEYINGI HOSIL BO'LGAN IFODA:
                            Natijasi shu amalning o'ziga xos rangida ko'rinadi!
                            Keyingi amal navbatdagi ifoda ustida o'z raqami bilan belgilanadi */}
                        <div className="inline-flex items-center gap-0.5 sm:gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-950 border border-slate-700/80 shadow-inner">
                          {st.tokensAfter.map((tok) => {
                            const isNewResult = tok.id.startsWith('res_');
                            const nextStepIdx = idx + 1;
                            const isNextOp =
                              activeStepIndex === nextStepIdx &&
                              solution.steps[nextStepIdx]?.highlightTokenIds.includes(tok.id);
                            const nextStepCol = getStepColor(nextStepIdx);

                            return (
                              <div
                                key={tok.id}
                                className="flex flex-col items-center justify-end"
                              >
                                {/* Next step badge if active */}
                                <div className="h-5 sm:h-6 flex items-center justify-center mb-0.5">
                                  {isNextOp && (
                                    <motion.span
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      className={`px-1.5 py-0.2 rounded text-[10px] sm:text-xs font-bold font-sans tracking-wide shadow ${nextStepCol.badgeBg} ${nextStepCol.badgeText}`}
                                    >
                                      {nextStepIdx + 1}-amal
                                    </motion.span>
                                  )}
                                </div>

                                <motion.span
                                  animate={
                                    isNextOp
                                      ? subStepPhase === 'CALCULATE'
                                        ? { scale: [1.12, 1.25, 1.18], y: -3 }
                                        : { scale: 1.12, y: -2 }
                                      : isNewResult && isCurrentStep && subStepPhase === 'TRANSFORM'
                                      ? { scale: [1.35, 1.12], opacity: 1 }
                                      : { scale: 1, y: 0 }
                                  }
                                  transition={{ duration: 0.3 }}
                                  className={`font-math ${mathFontClasses} rounded-lg whitespace-nowrap transition-all duration-300 ${
                                    isNextOp && subStepPhase === 'CALCULATE'
                                      ? 'text-orange-200 bg-gradient-to-r from-orange-600/80 via-red-600/80 to-amber-600/80 border-2 border-orange-400 glow-flame text-glow-flame z-20'
                                      : isNextOp
                                      ? `${nextStepCol.text} ${nextStepCol.bgLight} border ${nextStepCol.border} font-black`
                                      : isNewResult
                                      ? `${stepCol.text} ${stepCol.bgLight} border-2 ${stepCol.border} font-black ${stepCol.glow}`
                                      : 'text-white'
                                  }`}
                                >
                                  {tok.value}
                                </motion.span>
                              </div>
                            );
                          })}
                        </div>
                      </React.Fragment>
                    );
                  })}

                  {/* Yakuniy natija tengligi (oxirida) */}
                  {(sceneType === 'FINAL_ANSWER' || sceneType === 'RULE_SUMMARY') && (
                    <React.Fragment>
                      <span className="font-math font-extrabold text-2xl sm:text-3xl md:text-4xl text-emerald-400 px-1 shrink-0">
                        =
                      </span>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-emerald-950 border-2 border-emerald-400 text-emerald-300 font-math text-base sm:text-xl md:text-2xl font-black shadow-[0_0_25px_rgba(16,185,129,0.7)]"
                      >
                        <span className="text-[10px] sm:text-xs font-sans px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold">
                          Natija:
                        </span>
                        <span>{solution.finalResult}</span>
                      </motion.div>
                    </React.Fragment>
                  )}
                </div>
              </div>

              {/* Step indicator color legend below the window */}
              <div className="w-full flex items-center justify-center gap-1.5 sm:gap-3 mt-2 flex-wrap text-xs font-mono">
                {solution.steps.map((st, idx) => {
                  const c = getStepColor(idx);
                  const isDone =
                    sceneType === 'FINAL_ANSWER' ||
                    sceneType === 'RULE_SUMMARY' ||
                    idx < activeStepIndex ||
                    (idx === activeStepIndex && subStepPhase === 'TRANSFORM');

                  return (
                    <div
                      key={st.id}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] transition-all ${
                        isDone
                          ? `${c.bgLight} ${c.border} ${c.text} font-bold`
                          : idx === activeStepIndex
                          ? `${c.badgeBg} ${c.badgeText} font-black ring-2 ring-white shadow`
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-70'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: c.colorHex }}
                      />
                      <span>{idx + 1}-amal:</span>
                      <span className="font-math">{st.activeSubExpression}</span>
                      {isDone && <Check className="w-3 h-3 text-emerald-400" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* FINAL ANSWER STAMP */}
          {sceneType === 'FINAL_ANSWER' && (
            <motion.div
              key="final-stamp"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Barcha amallar muvaffaqiyatli yakunlandi va butun yechim to‘liq saqlandi!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================
          3. PASTKI QISM: AMALLARNI BAJARISHNING OLTIN QOIDASI (SHU MISOLGA MOSLAB ANIQ YOZILGAN)
          User Talabi:
          "oltin qoidani shu misol uchun aniq yozmading, bu misolda 1- bolishni bajaramiz, 2-amal kopaytirishni bajaramiz,3-qoshishni 4- amal ayirishni bajaramiz deb yoz"
          ======================================================== */}
      <div className="w-full max-w-5xl px-3 sm:px-6 py-2.5 rounded-2xl bg-[#060c18]/95 border border-slate-800 shadow-inner flex flex-col gap-2 z-10">
        <div className="flex items-center justify-between text-xs text-slate-300 flex-wrap gap-1">
          <span className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px] sm:text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-amber-400" />
            Ushbu Misol Uchun Amallarni Bajarishning Oltin Qoidasi:
          </span>
          <span className="text-[10px] text-slate-400">
            Aynan mazkur ifodadagi amallarning ketma-ketlik rejasi
          </span>
        </div>

        {/* DYNAMIC RULES TAILORED EXACTLY TO THIS MATHEMATICAL EXPRESSION */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full">
          {solution.steps.map((st, idx) => {
            const col = getStepColor(idx);
            const isDone =
              sceneType === 'FINAL_ANSWER' ||
              sceneType === 'RULE_SUMMARY' ||
              idx < activeStepIndex ||
              (idx === activeStepIndex && subStepPhase === 'TRANSFORM');
            const isCurrent =
              sceneType === 'STEP' && idx === activeStepIndex && subStepPhase !== 'TRANSFORM';

            return (
              <div
                key={`rule-step-${st.id}`}
                className={`flex-1 min-w-[160px] sm:min-w-[200px] px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${
                  isCurrent
                    ? `${col.bgLight} ${col.border} ring-2 ring-white/60 shadow-lg`
                    : isDone
                    ? `${col.bgLight} ${col.border} opacity-95`
                    : 'bg-slate-900/80 border-slate-700/80 text-slate-300'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full ${col.badgeBg} ${col.badgeText} font-black text-xs flex items-center justify-center shrink-0 shadow`}
                >
                  {idx + 1}
                </span>

                <div className="overflow-hidden">
                  <p className="text-[11px] sm:text-xs font-bold text-white truncate">
                    {idx + 1}-amal: <span className={col.text}>{st.actionNameUz}</span> bajaramiz
                  </p>
                  <p className="text-[10px] text-slate-400 truncate font-math">
                    ({st.activeSubExpression} = {st.resultDisplay || st.result})
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
