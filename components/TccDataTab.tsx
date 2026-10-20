import React, { useState } from 'react';
import { BookOpen, Scale, Lightbulb, Search, Award, ScrollText, Zap, ChevronDown, ChevronUp, Copy, Check, ShieldCheck, ExternalLink } from 'lucide-react';
import { MONOGRAFIA, GRIMORIO_LEIS, LegalArticle } from '@/lib/tccData';

export const TccDataTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<'normas' | 'capitulos' | 'propostas'>('normas');
  const [expandedArticles, setExpandedArticles] = useState<{ [key: string]: boolean }>({
    'Art. 42 da LC 40/2001': true, // Open by default since it's the core of the thesis!
    'Art. 145, § 1º': true,
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleArticle = (key: string) => {
    setExpandedArticles(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredChapters = MONOGRAFIA.capitulos.filter(c =>
    c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.resumo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-4">
      {/* Monograph Header Card */}
      <div className="bg-slate-900/95 rounded-2xl p-5 sm:p-6 border border-amber-500/30 shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-400/15 text-amber-300 border border-amber-400/30 uppercase tracking-widest">
            {MONOGRAFIA.area}
          </span>
          <span className="text-xs sm:text-sm text-slate-300">• Curitiba/PR</span>
        </div>

        <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
          {MONOGRAFIA.titulo}
        </h2>

        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-sm sm:text-base text-slate-200 space-y-1.5 leading-relaxed">
          <span className="font-bold text-amber-400 flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Problema Central de Pesquisa:</span>
          </span>
          <p>{MONOGRAFIA.problema_central}</p>
        </div>
      </div>

      {/* Section Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveSection('normas')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-black transition ${
              activeSection === 'normas'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Leis & Artigos
          </button>
          <button
            onClick={() => setActiveSection('capitulos')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-black transition ${
              activeSection === 'capitulos'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Capítulos
          </button>
          <button
            onClick={() => setActiveSection('propostas')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-black transition ${
              activeSection === 'propostas'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3 Propostas
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar artigo, lei ou tema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* 1. SEÇÃO DE LEIS & ARTIGOS CLICÁVEIS COM TEXTO INTEGRAL */}
      {activeSection === 'normas' && (
        <div className="space-y-5">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs sm:text-sm text-amber-300 font-medium">
            <span className="flex items-center space-x-2">
              <ScrollText className="w-4 h-4 text-amber-400" />
              <span>Toque em qualquer artigo para expandir o <strong>título exato, texto da lei e impacto no seu TCC</strong>.</span>
            </span>
          </div>

          {GRIMORIO_LEIS.map((diploma, dIdx) => {
            // Filter articles if searching
            const matchingArticles = diploma.artigos.filter(a =>
              a.art.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.texto_integral.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (matchingArticles.length === 0) return null;

            return (
              <div key={dIdx} className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <Scale className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white tracking-wide uppercase">
                        {diploma.diploma}
                      </h3>
                      <span className="text-xs text-amber-400/80 font-mono font-bold">
                        {diploma.sigla}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {matchingArticles.length} {matchingArticles.length === 1 ? 'dispositivo' : 'dispositivos'}
                  </span>
                </div>

                {/* List of Clickable Article Accordions */}
                <div className="space-y-3 pt-1">
                  {matchingArticles.map((art) => {
                    const isExpanded = !!expandedArticles[art.art];
                    return (
                      <div
                        key={art.art}
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isExpanded
                            ? 'bg-slate-950 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90'
                        }`}
                      >
                        {/* Clickable Header Bar */}
                        <button
                          type="button"
                          onClick={() => toggleArticle(art.art)}
                          className="w-full p-4 flex items-center justify-between text-left group"
                        >
                          <div className="space-y-1 pr-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm sm:text-base font-black text-amber-300 group-hover:text-amber-200 transition">
                                {art.art}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                                {art.titulo}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400 line-clamp-1 font-medium">
                              {art.texto_integral}
                            </p>
                          </div>

                          <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 group-hover:text-amber-400 group-hover:border-amber-500/40 transition shrink-0">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </button>

                        {/* Expanded Full Details */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-800/80 animate-in fade-in duration-200">
                            {/* Official Full Title */}
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-amber-400/90 uppercase tracking-widest block">
                                Ementa / Título Oficial:
                              </span>
                              <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                                {art.titulo}
                              </h4>
                            </div>

                            {/* Exact Legal Text with large legible font */}
                            <div className="space-y-1.5">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Texto Integral da Legislação:
                              </span>
                              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm sm:text-base text-slate-100 font-normal leading-relaxed whitespace-pre-wrap select-text">
                                &ldquo;{art.texto_integral}&rdquo;
                              </div>
                            </div>

                            {/* TCC Practical Application & Impact */}
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-200 space-y-1.5">
                              <div className="flex items-center space-x-1.5 text-amber-400 font-black text-xs sm:text-sm uppercase tracking-wide">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Impacto & Aplicação Prática no seu TCC:</span>
                              </div>
                              <p className="text-xs sm:text-sm leading-relaxed text-slate-200 font-medium">
                                {art.comentario_tcc}
                              </p>
                            </div>

                            {/* Copy Citation Button */}
                            <div className="flex items-center justify-end pt-1">
                              <button
                                onClick={() => handleCopyText(art.art, `${art.art} - ${art.titulo}\n"${art.texto_integral}"`)}
                                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition active:scale-95"
                              >
                                {copiedKey === art.art ? (
                                  <>
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    <span className="text-emerald-400">Texto Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 text-amber-400" />
                                    <span>Copiar para Citação do TCC</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. SEÇÃO DOS CAPÍTULOS */}
      {activeSection === 'capitulos' && (
        <div className="space-y-3.5">
          {filteredChapters.map((cap, idx) => (
            <div key={idx} className="bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-2.5">
              <div className="flex items-center space-x-2.5">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-400/15 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  {cap.numero}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {cap.titulo}
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed pt-1 font-normal">
                {cap.resumo}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 3. SEÇÃO DAS 3 PROPOSTAS */}
      {activeSection === 'propostas' && (
        <div className="space-y-3.5">
          {MONOGRAFIA.propostas_lege_ferenda.map((prop) => (
            <div key={prop.item} className="bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-amber-500/30 shadow-xl space-y-2.5">
              <div className="flex items-center space-x-2 text-amber-400 font-black text-base sm:text-lg">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <span>Proposta {prop.item}: {prop.nome}</span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                {prop.descricao}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
