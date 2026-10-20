import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle, AlertOctagon, ChevronLeft, ChevronRight, Mic, Volume2, Sparkles, Timer } from 'lucide-react';
import { SLIDES, PresentationSlide } from '@/lib/tccData';

export const PresentationTab: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

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
  const progressPercent = Math.min(100, (seconds / 900) * 100);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-4">
      {/* Stopwatch & Speedrun HUD */}
      <div className="bg-slate-900/95 rounded-2xl p-4 sm:p-5 border border-amber-500/30 shadow-[0_0_20px_rgba(0,0,0,0.6)] space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
                  Cronômetro de Sustentação Oral
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  SPEEDRUN
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Meta Oficial da Banca: <strong className="text-amber-400">12 a 15 minutos</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`px-5 py-2 rounded-xl font-mono text-2xl sm:text-3xl font-black tracking-widest border shadow-inner ${
              seconds > 900
                ? 'bg-rose-950/40 text-rose-400 border-rose-500/50 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-slate-950 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            }`}>
              {formatTime(seconds)}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsActive(!isActive)}
                className={`p-3 rounded-xl font-black transition active:scale-95 shadow-lg ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                    : 'bg-gradient-to-r from-emerald-400 to-green-500 hover:brightness-110 text-slate-950 shadow-emerald-500/30'
                }`}
                title={isActive ? 'Pausar Treino' : 'Iniciar Treino'}
              >
                {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button
                onClick={handleResetTimer}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                title="Zerar Cronômetro"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-500 ${
              seconds > 900 ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 shadow-[0_0_10px_#f59e0b]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Slide Navigation Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Slide {currentSlideIndex + 1} de {SLIDES.length}: {currentSlide.titulo}</span>
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentSlideIndex((i) => Math.max(0, i - 1))}
            disabled={currentSlideIndex === 0}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white border border-slate-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlideIndex((i) => Math.min(SLIDES.length - 1, i + 1))}
            disabled={currentSlideIndex === SLIDES.length - 1}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white border border-slate-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Card with High Legibility & Large Fonts */}
      <div className="bg-slate-900/95 rounded-2xl p-5 sm:p-7 border border-slate-700/80 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black text-base shadow-[0_0_10px_rgba(245,158,11,0.4)]">
              {currentSlide.slide}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {currentSlide.titulo}
            </h3>
          </div>
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-slate-800 text-amber-300 border border-slate-700">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Tempo Estimado: {currentSlide.tempo_sugerido}</span>
          </span>
        </div>

        {/* Objective */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sm sm:text-base text-slate-200 leading-relaxed">
          <strong className="text-amber-400 font-bold block mb-1">Missão do Slide:</strong> {currentSlide.objetivo}
        </div>

        {/* Speech Script (Large Font for Reading with Glasses) */}
        <div className="space-y-2.5">
          <span className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
            <Volume2 className="w-5 h-5" />
            <span>Roteiro de Fala Sugerido (Treine em Voz Alta):</span>
          </span>
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 text-base sm:text-lg text-slate-100 leading-relaxed font-normal shadow-inner">
            &ldquo;{currentSlide.fala_sugerida}&rdquo;
          </div>
        </div>

        {/* Key Points */}
        <div className="space-y-2.5">
          <span className="text-sm font-black text-slate-200 uppercase tracking-wider">
            Pontos de Ênfase na Fala:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentSlide.pontos_chave.map((p, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-200"
              >
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="font-medium">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What to Avoid */}
        <div className="p-4 rounded-xl bg-rose-950/25 border border-rose-500/30 flex items-start space-x-3 text-sm sm:text-base text-rose-200">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-400 font-black">O que JAMAIS dizer neste slide:</strong> {currentSlide.evitar}
          </div>
        </div>
      </div>

      {/* Slide Thumbnails Grid */}
      <div className="grid grid-cols-7 gap-2 pt-1">
        {SLIDES.map((s, idx) => (
          <button
            key={s.slide}
            onClick={() => setCurrentSlideIndex(idx)}
            className={`py-2.5 px-1 rounded-xl text-xs sm:text-sm font-black transition-all text-center ${
              currentSlideIndex === idx
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            SLIDE {s.slide}
          </button>
        ))}
      </div>
    </div>
  );
};
