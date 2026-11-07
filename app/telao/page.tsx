'use client';

import React, { useState, useEffect } from 'react';
import { Shield, ChevronLeft, ChevronRight, Maximize2, Scale, CheckCircle2, Radio } from 'lucide-react';
import { SLIDES, MONOGRAFIA } from '@/lib/tccData';
import { subscribeToSlideChanges } from '@/lib/liveSlideSync';

export default function TelaoPage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [customImages, setCustomImages] = useState<{ [idx: number]: string }>({});
  const [syncPulse, setSyncPulse] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToSlideChanges((state) => {
      if (state.slideIndex >= 0 && state.slideIndex < SLIDES.length) {
        setSlideIndex(state.slideIndex);
        if (state.customImage) {
          setCustomImages((prev) => ({ ...prev, [state.slideIndex]: state.customImage! }));
        }
        setSyncPulse(true);
        setTimeout(() => setSyncPulse(false), 1200);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        setSlideIndex((i) => Math.min(SLIDES.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setSlideIndex((i) => Math.max(0, i - 1));
      } else if (e.key.toLowerCase() === 'f') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const slide = SLIDES[slideIndex] || SLIDES[0];
  const imgSrc = customImages[slideIndex] || slide.imagem_url || '/slides/slide-1.png';

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-between select-none overflow-hidden font-sans relative">
      {/* Subtle Ambient Glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px]" />

      {/* Top Institutional Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-amber-500/20 bg-slate-950/70 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                Defesa de Trabalho de Conclusão de Curso • Direito Tributário
              </span>
              <span
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                  syncPulse
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <Radio className="w-3 h-3 text-emerald-400" />
                <span>COPILOTO SINCRONIZADO</span>
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-200 truncate max-w-3xl">
              {MONOGRAFIA.titulo}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 font-mono text-sm font-black">
            SLIDE {slide.slide} / {SLIDES.length}
          </span>
          <button
            onClick={toggleFullscreen}
            title="Tela Cheia (Tecla F)"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main 16:9 Editorial Slide Content */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-8 lg:px-14 py-6 max-w-[1600px] w-full mx-auto">
        {/* Left Column: Structured Legal Thesis & Key Takeaways (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest">
              <Shield className="w-3.5 h-3.5" />
              <span>{slide.subtitulo_telao || 'Análise Dogmática e Jurisprudencial'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              {slide.titulo}
            </h2>
          </div>

          {/* Core Thesis Highlight Box */}
          {slide.destaque_telao && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-slate-900/90 border-l-4 border-amber-400 shadow-2xl">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-200 leading-relaxed">
                {slide.destaque_telao}
              </p>
            </div>
          )}

          {/* Visual Bullet Points */}
          <div className="space-y-3.5 pt-1">
            {(slide.topicos_telao || slide.pontos_chave).map((topico, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-900/85 border border-slate-800/90 shadow-lg"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-black text-sm shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-base sm:text-lg lg:text-xl text-slate-100 font-medium leading-snug">
                  {topico}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Editorial Visual Illustration (Nano Banana) (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-full aspect-video lg:aspect-[16/11] rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-[0_0_50px_rgba(0,0,0,0.85)] bg-slate-900 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={slide.titulo}
              className="w-full h-full object-cover transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="px-3 py-1 rounded-lg bg-slate-950/80 border border-amber-500/30 text-amber-300">
                Arlei Silvério • TCC Direito 2026
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-700 text-slate-400 font-mono">
                LC 40/2001 • TJPR • STF Tema 1.455
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Progress Bar & Discreet Controls */}
      <footer className="relative z-10 px-8 py-4 border-t border-slate-900 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {SLIDES.map((s, idx) => (
            <button
              key={s.slide}
              onClick={() => setSlideIndex(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === slideIndex
                  ? 'w-12 bg-amber-400 shadow-[0_0_10px_#f59e0b]'
                  : idx < slideIndex
                  ? 'w-4 bg-emerald-500/60'
                  : 'w-4 bg-slate-800 hover:bg-slate-700'
              }`}
              title={`Slide ${s.slide}: ${s.titulo}`}
            />
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
            disabled={slideIndex === 0}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSlideIndex((i) => Math.min(SLIDES.length - 1, i + 1))}
            disabled={slideIndex === SLIDES.length - 1}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-800"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}

