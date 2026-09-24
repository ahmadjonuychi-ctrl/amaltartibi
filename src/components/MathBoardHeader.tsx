import React, { useState, useEffect } from 'react';
import { PRESET_EXAMPLES } from '../utils/mathSolver';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  BookOpen,
} from 'lucide-react';

interface Props {
  currentInput: string;
  onSelectPreset: (expression: string) => void;
  onCustomSubmit: (expression: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const MathBoardHeader: React.FC<Props> = ({
  currentInput,
  onSelectPreset,
  onCustomSubmit,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const [inputValue, setInputValue] = useState(currentInput);

  useEffect(() => {
    setInputValue(currentInput);
  }, [currentInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onCustomSubmit(inputValue.trim());
    }
  };

  const addSymbol = (sym: string) => {
    setInputValue((prev) => {
      if (sym === '√(' || sym === '3√(' || sym === '4√(') {
        return prev + sym;
      }
      if (sym === '^') {
        return prev + '^';
      }
      if (sym === '/') {
        // Fraction symbol
        return prev.trimEnd() + ' / ';
      }
      if (sym === '0.(') {
        // Periodic decimal symbol
        const trimmed = prev.trimEnd();
        // If previous ends with an operator or is empty, insert "0.("
        // If previous ends with a digit like "2", user might want "2.(" or "0.("
        if (trimmed === '' || /[+−×÷\(\/^]$/.test(trimmed)) {
          return trimmed + (trimmed === '' ? '' : ' ') + '0.(';
        }
        return trimmed + '0.(';
      }
      return `${prev} ${sym} `;
    });
  };

  return (
    <header className="w-full bg-[#0d1627]/95 border-b border-slate-800/80 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3 transition-all z-30 sticky top-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
        {/* Logo & Teacher Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold text-base sm:text-lg shadow-sm">
              ∑
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  Matematik Amallar Tartibi
                </h1>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-400/20 border border-amber-400/30 text-amber-300">
                  Animatsiyali Dars
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-normal">
                Ketma-ketlik zanjiri: Dastlabki ifoda = 1-amal = 2-amal... olovda yonib, o‘rnida natija hosil bo‘ladi
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 hover:text-white"
              title={isFullscreen ? "Kichraytirish" : "To'liq ekran"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Math Expression Quick Switcher & Input */}
        <div className="w-full md:w-auto flex-1 max-w-2xl flex flex-col gap-1.5 sm:gap-2">
          {/* Preset buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap mr-0.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              Namunalar:
            </span>
            {PRESET_EXAMPLES.map((preset, idx) => {
              const isSelected = currentInput === preset.expression;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectPreset(preset.expression)}
                  className={`text-xs px-2.5 py-0.5 sm:py-1 rounded-md border whitespace-nowrap transition-all duration-150 font-math ${
                    isSelected
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-750 hover:text-white'
                  }`}
                  title={preset.desc}
                >
                  {preset.expression}
                </button>
              );
            })}
          </div>

          {/* Formula Custom Input Bar with Quick Math Keypad */}
          <form onSubmit={handleSubmit} className="flex items-center gap-1 sm:gap-1.5 w-full">
            <div className="relative flex-1 flex items-center">
              <input
                id="math-expression-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Misol kiriting: 0.(3) × 9 + 0.(6) ÷ 2 yoki 24/4 + 2^3 × (10 − 6)"
                className="w-full bg-[#070d18] border border-slate-700/90 focus:border-amber-400 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-math text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all pr-2"
              />
            </div>

            <button
              id="apply-expression-btn"
              type="submit"
              className="px-3 sm:px-4 py-1.5 rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm flex items-center gap-1 shrink-0 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Yechish</span>
            </button>
          </form>

          {/* Quick Mathematical Operation Keypad:
              Davriy o'nli kasr: 0.(a)
              Kasr: a/b (Kasr)
              Arifmetik amallar: +, -, *, /, ^, ildizlar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap mr-1">Tugmalar:</span>
            {[
              { label: '0.(a) Davriy kasr', val: '0.(', highlight: 'periodic' },
              { label: 'a/b (Kasr)', val: '/', highlight: 'fraction' },
              { label: '÷', val: '÷' },
              { label: '×', val: '×' },
              { label: '+', val: '+' },
              { label: '−', val: '−' },
              { label: '(', val: '(' },
              { label: ')', val: ')' },
              { label: 'xʸ (^)', val: '^' },
              { label: '√(x)', val: '√(' },
              { label: '³√(x)', val: '3√(' },
              { label: '⁴√(x)', val: '4√(' },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => addSymbol(item.val)}
                className={`px-2 py-0.5 rounded text-[11px] font-math font-bold border whitespace-nowrap active:scale-95 transition-all ${
                  item.highlight === 'periodic'
                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-400/30 border-emerald-400/70 shadow-sm'
                    : item.highlight === 'fraction'
                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-400/30 border-amber-400/60 shadow-sm'
                    : 'bg-slate-800/90 text-slate-200 hover:bg-amber-400/20 hover:text-amber-300 border-slate-700/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Desktop Controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Fullscreen button */}
          <button
            id="toggle-fullscreen-btn"
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750 transition-colors"
            title={isFullscreen ? "Kichraytirish" : "To'liq ekran (Katta doska)"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
