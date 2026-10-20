import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle, AlertOctagon, ChevronLeft, ChevronRight, Mic, Volume2 } from 'lucide-react';
import { SLIDES, PresentationSlide } from '@/lib/tccData';

export const PresentationTab: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Presentation stopwatch
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const currentSlide: PresentationSlide = SLIDES[currentSlideIndex];

  // Maximum recommended time is 15 minutes (900 seconds)
  const progressPercent = Math.min(100, (seconds / 900) * 100);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-4">
      {/* Stopwatch & Control Deck */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-700/60 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Cronômetro de Sustentação Oral
              </h2>
              <p className="text-xs text-slate-400">Meta: 12 a 15 minutos de apresentação</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`px-4 py-1.5 rounded-xl font-mono text-xl sm:text-2xl font-bold tracking-wider border ${
              seconds > 900
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                : 'bg-slate-900/90 text-amber-400 border-slate-700'
            }`}>
              {formatTime(seconds)}
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setIsActive(!isActive)}
                className={`p-2.5 rounded-xl font-bold transition active:scale-95 shadow-md ${
                  isActive
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
                title={isActive ? 'Pausar Cronômetro' : 'Iniciar Treino'}
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button
                onClick={handleResetTimer}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Zerar Cronômetro"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-500 ${
              seconds > 900 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-yellow-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Slide Navigation Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Slide {currentSlideIndex + 1} de {SLIDES.length}: {currentSlide.titulo}
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentSlideIndex((i) => Math.max(0, i - 1))}
            disabled={currentSlideIndex === 0}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentSlideIndex((i) => Math.min(SLIDES.length - 1, i + 1))}
            disabled={currentSlideIndex === SLIDES.length - 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              {currentSlide.slide}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {currentSlide.titulo}
            </h3>
          </div>
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800/80 text-amber-300 border border-slate-700">
            <Clock className="w-3.5 h-3.5" />
            <span>Tempo: {currentSlide.tempo_sugerido}</span>
          </span>
        </div>

        {/* Objective */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
          <strong className="text-amber-400">Objetivo deste Slide:</strong> {currentSlide.objetivo}
        </div>

        {/* Speech Script (O que Falar) */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Roteiro de Fala Sugerido (Treine em Voz Alta):</span>
          </span>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/20 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            &ldquo;{currentSlide.fala_sugerida}&rdquo;
          </div>
        </div>

        {/* Key Points */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Pontos de Ênfase Obrigatórios:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentSlide.pontos_chave.map((p, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs text-slate-300"
              >
                <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What to Avoid */}
        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 flex items-start space-x-2.5 text-xs text-rose-300">
          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-400">O que jamais dizer neste slide:</strong> {currentSlide.evitar}
          </div>
        </div>
      </div>

      {/* Slide Thumbnails Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
        {SLIDES.map((s, idx) => (
          <button
            key={s.slide}
            onClick={() => setCurrentSlideIndex(idx)}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
              currentSlideIndex === idx
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 scale-105'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            S{s.slide}
          </button>
        ))}
      </div>
    </div>
  );
};
