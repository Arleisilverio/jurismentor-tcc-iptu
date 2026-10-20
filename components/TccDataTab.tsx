import React, { useState } from 'react';
import { BookOpen, Scale, Lightbulb, Search, Award, ScrollText, Zap } from 'lucide-react';
import { MONOGRAFIA } from '@/lib/tccData';

export const TccDataTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<'capitulos' | 'propostas' | 'normas'>('capitulos');

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
          <button
            onClick={() => setActiveSection('normas')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-black transition ${
              activeSection === 'normas'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Normas & TJPR
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar termo ou artigo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Chapters Section */}
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

      {/* 3 Proposals Section */}
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

      {/* Legal Devices & Landmark Precedent */}
      {activeSection === 'normas' && (
        <div className="space-y-4">
          {/* Landmark Decision Card with High Contrast */}
          <div className="bg-slate-900/95 rounded-2xl p-5 sm:p-6 border border-amber-500/50 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.2)] space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-black text-xs sm:text-sm uppercase tracking-widest">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Precedente Paradigmático do TJPR no seu TCC</span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-white">
              TJPR - 2ª C.Cível - Apelação 0004521-88.2021.8.16.0004 (Curitiba)
            </h4>
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 text-sm sm:text-base text-slate-200 italic leading-relaxed">
              &ldquo;APELAÇÃO CÍVEL. TRIBUTÁRIO. EMBARGOS À EXECUÇÃO FISCAL. IPTU. MUNICÍPIO DE CURITIBA. IMÓVEL EM CONSTRUÇÃO. ENQUADRAMENTO COMO TERRITORIAL. IMPOSSIBILIDADE DE APLICAÇÃO DE ALÍQUOTA MAIS GRAVOSA DESTINADA A COIBIR ESPECULAÇÃO IMOBILIÁRIA. EXISTÊNCIA DE ALVARÁ DE CONSTRUÇÃO VÁLIDO E EFETIVO ANDAMENTO DAS OBRAS. PRINCÍPIO DA RAZOABILIDADE E DA CAPACIDADE CONTRIBUTIVA. DESCARACTERIZAÇÃO DO IMÓVEL COMO 'NÃO EDIFICADO'. RECURSO PROVIDO.&rdquo;
            </div>
            <p className="text-xs sm:text-sm text-amber-300 font-bold">
              Relator: Desembargador Rogério Kanayama • Decisão Unânime
            </p>
          </div>

          {/* Legal Matrix */}
          {MONOGRAFIA.dispositivos_chave.map((dip, idx) => (
            <div key={idx} className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
              <h4 className="text-xs sm:text-sm font-black text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>{dip.diploma}</span>
              </h4>
              <div className="space-y-2">
                {dip.artigos.map((art, aIdx) => (
                  <div
                    key={aIdx}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm sm:text-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5"
                  >
                    <span className="font-bold text-amber-300">{art.art}</span>
                    <span className="text-slate-200 font-normal">{art.tema}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
