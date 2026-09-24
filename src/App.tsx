import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { solveStepByStep, PRESET_EXAMPLES } from './utils/mathSolver';
import { PlaybackSpeed, MathSolution } from './types';
import { MathBoardHeader } from './components/MathBoardHeader';
import { DigitalBlackboard } from './components/DigitalBlackboard';
import { VideoPlayerControls } from './components/VideoPlayerControls';
import { PedagogyStepsList } from './components/PedagogyStepsList';
import { AlertTriangle, BookCheck } from 'lucide-react';

export default function App() {
  // Initial default example from prompt: "12 + 3 × 2 + (6 ÷ 3) − 5"
  const [currentExpression, setCurrentExpression] = useState<string>(
    '12 + 3 × 2 + (6 ÷ 3) − 5'
  );

  // Solved mathematical data
  const solution: MathSolution = useMemo(() => {
    return solveStepByStep(currentExpression);
  }, [currentExpression]);

  // Video State (speech and sounds removed per user request: "ovoz ham kerak emas")
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Scene Sequence
  // Scene 0: INTRO_TEXT
  // Scene 1: INTRO_EXPR
  // Scene 2 .. 2 + stepCount - 1: STEP_i
  // Scene 2 + stepCount: FINAL_ANSWER
  // Scene 3 + stepCount: RULE_SUMMARY
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);

  // Micro-phases within a STEP:
  // 'HIGHLIGHT' (Avvalgi holat, bajariladigan amal ko'rsatilishi) ->
  // 'CALCULATE' (Bajariladigan amal olov rangida yonishi - glow flame) ->
  // 'TRANSFORM' (Uning o'rnida natija hosil bo'lishi va normal holatga qaytishi)
  const [subStepPhase, setSubStepPhase] = useState<'HIGHLIGHT' | 'CALCULATE' | 'TRANSFORM'>('HIGHLIGHT');
  const [stepProgressPercent, setStepProgressPercent] = useState<number>(0);

  const boardContainerRef = useRef<HTMLDivElement>(null);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Compute scene descriptors
  const sceneList = useMemo(() => {
    if (!solution.isValid) return [];

    const list: {
      type: 'INTRO_TEXT' | 'INTRO_EXPR' | 'STEP' | 'FINAL_ANSWER' | 'RULE_SUMMARY';
      title: string;
      stepIdx: number;
    }[] = [
      { type: 'INTRO_TEXT', title: 'Kirish', stepIdx: -1 },
      { type: 'INTRO_EXPR', title: 'Misol', stepIdx: -1 },
    ];

    solution.steps.forEach((step, idx) => {
      list.push({
        type: 'STEP',
        title: `${idx + 1}-Amal: ${step.activeSubExpression}`,
        stepIdx: idx,
      });
    });

    list.push({ type: 'FINAL_ANSWER', title: 'Yakuniy Natija', stepIdx: -1 });
    list.push({ type: 'RULE_SUMMARY', title: 'Qoidalar Xulosasi', stepIdx: -1 });

    return list;
  }, [solution]);

  const activeScene = sceneList[currentSceneIdx] || sceneList[0] || {
    type: 'INTRO_TEXT',
    title: 'Kirish',
    stepIdx: -1,
  };

  const activeStepIdx = activeScene.stepIdx >= 0 ? activeScene.stepIdx : 0;

  // Handle Automatic Video Playback with strictly controlled 5-SECOND ZOOM & PEDAGOGICAL PHASES
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    // Step duration: exactly 5000ms at 1x playback speed
    let stepDuration = 5000 / playbackSpeed;

    if (activeScene.type === 'INTRO_TEXT') stepDuration = 3000 / playbackSpeed;
    if (activeScene.type === 'INTRO_EXPR') stepDuration = 3400 / playbackSpeed;
    if (activeScene.type === 'FINAL_ANSWER') stepDuration = 4200 / playbackSpeed;
    if (activeScene.type === 'RULE_SUMMARY') stepDuration = 5000 / playbackSpeed;

    // Inside a STEP, strictly partition the 5 seconds:
    // 0ms - 1800ms: HIGHLIGHT & ZOOM IN on the targeted operation in the previous expression
    // 1800ms - 3600ms: CALCULATE - Operation blazes in burning flame orange (olov rangida yonib ketadi)
    // 3600ms - 5000ms: TRANSFORM - Replaced by result and normalized back for next step
    if (activeScene.type === 'STEP') {
      setSubStepPhase('HIGHLIGHT');
      setStepProgressPercent(0);

      const t1 = setTimeout(() => {
        setSubStepPhase('CALCULATE');
      }, 1800 / playbackSpeed);

      const t2 = setTimeout(() => {
        setSubStepPhase('TRANSFORM');
      }, 3600 / playbackSpeed);

      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, Math.round((elapsed / stepDuration) * 100));
        setStepProgressPercent(pct);
      }, 80);

      playTimerRef.current = setTimeout(() => {
        clearTimeout(t1);
        clearTimeout(t2);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

        setCurrentSceneIdx((prev) => {
          if (prev < sceneList.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, stepDuration);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        if (playTimerRef.current) clearTimeout(playTimerRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      };
    } else {
      setSubStepPhase('HIGHLIGHT');
      setStepProgressPercent(0);

      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, Math.round((elapsed / stepDuration) * 100));
        setStepProgressPercent(pct);
      }, 100);

      playTimerRef.current = setTimeout(() => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setCurrentSceneIdx((prev) => {
          if (prev < sceneList.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, stepDuration);

      return () => {
        if (playTimerRef.current) clearTimeout(playTimerRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      };
    }
  }, [isPlaying, currentSceneIdx, activeScene, playbackSpeed, sceneList.length]);

  // Video navigation handlers
  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleNextScene = useCallback(() => {
    if (currentSceneIdx < sceneList.length - 1) {
      setCurrentSceneIdx((prev) => prev + 1);
      setSubStepPhase('HIGHLIGHT');
      setStepProgressPercent(0);
    }
  }, [currentSceneIdx, sceneList.length]);

  const handlePrevScene = useCallback(() => {
    if (currentSceneIdx > 0) {
      setCurrentSceneIdx((prev) => prev - 1);
      setSubStepPhase('HIGHLIGHT');
      setStepProgressPercent(0);
    }
  }, [currentSceneIdx]);

  const handleReplay = useCallback(() => {
    setCurrentSceneIdx(0);
    setSubStepPhase('HIGHLIGHT');
    setStepProgressPercent(0);
    setIsPlaying(true);
  }, []);

  const handleSelectScene = useCallback((idx: number) => {
    setCurrentSceneIdx(idx);
    setSubStepPhase('HIGHLIGHT');
    setStepProgressPercent(0);
  }, []);

  const handleSelectPreset = useCallback((expr: string) => {
    setCurrentExpression(expr);
    setCurrentSceneIdx(0);
    setSubStepPhase('HIGHLIGHT');
    setStepProgressPercent(0);
    setIsPlaying(false);
  }, []);

  const handleCustomSubmit = useCallback((expr: string) => {
    setCurrentExpression(expr);
    setCurrentSceneIdx(0);
    setSubStepPhase('HIGHLIGHT');
    setStepProgressPercent(0);
    setIsPlaying(false);
  }, []);

  const handleSelectStepFromList = useCallback((stepIdx: number) => {
    const targetIdx = sceneList.findIndex(
      (s) => s.type === 'STEP' && s.stepIdx === stepIdx
    );
    if (targetIdx !== -1) {
      setCurrentSceneIdx(targetIdx);
      setSubStepPhase('HIGHLIGHT');
      setStepProgressPercent(0);
    }
  }, [sceneList]);

  const handleToggleFullscreen = useCallback(() => {
    if (!boardContainerRef.current) return;
    if (!document.fullscreenElement) {
      boardContainerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#060b14] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Header & Formula Keypad Bar */}
      <MathBoardHeader
        currentInput={currentExpression}
        onSelectPreset={handleSelectPreset}
        onCustomSubmit={handleCustomSubmit}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Main Educational Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 md:p-6 flex flex-col gap-4">
        {/* Expression Validation Error Notice if syntax error */}
        {!solution.isValid && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-3 text-red-200">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <p className="font-bold text-sm">Matematik ifodada xatolik topildi</p>
              <p className="text-xs text-red-300">
                {solution.errorMessage || "Iltimos, qavslar va arifmetik amallarni to'g'ri kiriting."}
              </p>
            </div>
          </div>
        )}

        {/* Video Blackboard Screen Container */}
        <div
          ref={boardContainerRef}
          className={`w-full flex flex-col items-center transition-all ${
            isFullscreen ? 'fixed inset-0 z-50 bg-[#060b14] p-3 sm:p-6 justify-center' : ''
          }`}
        >
          {solution.isValid && (
            <div className="w-full flex flex-col gap-3">
              {/* The Digital Mathematics Blackboard with burning flame transitions */}
              <DigitalBlackboard
                solution={solution}
                sceneType={activeScene.type}
                activeStepIndex={activeStepIdx}
                subStepPhase={subStepPhase}
                stepProgressPercent={stepProgressPercent}
              />

              {/* Video Player Navigation Controls */}
              <VideoPlayerControls
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                currentSceneIdx={currentSceneIdx}
                totalScenes={sceneList.length}
                sceneTitles={sceneList.map((s) => s.title)}
                onSelectScene={handleSelectScene}
                onPrev={handlePrevScene}
                onNext={handleNextScene}
                canPrev={currentSceneIdx > 0}
                canNext={currentSceneIdx < sceneList.length - 1}
                onReplay={handleReplay}
                speed={playbackSpeed}
                onSpeedChange={setPlaybackSpeed}
              />
            </div>
          )}
        </div>

        {/* Step-by-Step Pedagogical Journal */}
        {solution.isValid && solution.steps.length > 0 && (
          <section className="w-full mt-2">
            <PedagogyStepsList
              solution={solution}
              activeStepIndex={activeStepIdx}
              onSelectStep={handleSelectStepFromList}
            />
          </section>
        )}

        {/* Golden Rule Reference Banner */}
        <footer className="mt-4 p-4 rounded-2xl bg-[#091122]/90 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-lg">
          <div className="flex items-center gap-2">
            <BookCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Matematik Amallar Tartibi:</strong> 1. Daraja va ildiz (kvadrat va yuqori darajali) → 2. Qavs ichi → 3. Ko‘paytirish va bo‘lish → 4. Qo‘shish va ayirish.
            </span>
          </div>
          <div className="text-[11px] text-amber-300/90 font-medium whitespace-nowrap">
            Bir xil darajadagi amallar: Chapdan o‘ngga qarab bajariladi
          </div>
        </footer>
      </main>
    </div>
  );
}
