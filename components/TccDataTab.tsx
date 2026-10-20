import React, { useState } from 'react';
import { BookOpen, FileText, Scale, Lightbulb, CheckSquare, Search, Award } from 'lucide-react';
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
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-700/60 space-y-2.5">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30 uppercase tracking-wider">
            {MONOGRAFIA.area}
          </span>
          <span className="text-xs text-slate-400">• Curitiba/PR</span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
          {MONOGRAFIA.titulo}
        </h2>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
          <span className="font-semibold text-amber-400 block">Problema Central de Pesquisa:</span>
          <p className="leading-relaxed">{MONOGRAFIA.problema_central}</p>
        </div>
      </div>

      {/* Section Switcher & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={() => setActiveSection('capitulos')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSection === 'capitulos'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Capítulos
          </button>
          <button
            onClick={() => setActiveSection('propostas')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSection === 'propostas'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3 Propostas
          </button>
          <button
            onClick={() => setActiveSection('normas')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSection === 'normas'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Normas & TJPR
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar termo ou artigo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-60 pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Chapters Section */}
      {activeSection === 'capitulos' && (
        <div className="space-y-3">
          {filteredChapters.map((cap, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  {cap.numero}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {cap.titulo}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                {cap.resumo}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 3 Proposals Section */}
      {activeSection === 'propostas' && (
        <div className="space-y-3">
          {MONOGRAFIA.propostas_lege_ferenda.map((prop) => (
            <div key={prop.item} className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-700/60 space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <Lightbulb className="w-4 h-4" />
                <span>Proposta {prop.item}: {prop.nome}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {prop.descricao}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Legal Devices & TJPR Landmark Decision */}
      {activeSection === 'normas' && (
        <div className="space-y-4">
          {/* Landmark TJPR Decision Banner */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-amber-500/40 bg-amber-500/5 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Precedente Paradigmático do TJPR no seu TCC</span>
            </div>
            <h4 className="text-sm font-bold text-white">
              TJPR - 2ª C.Cível - Apelação 0004521-88.2021.8.16.0004 (Curitiba)
            </h4>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              &ldquo;APELAÇÃO CÍVEL. TRIBUTÁRIO. EMBARGOS À EXECUÇÃO FISCAL. IPTU. MUNICÍPIO DE CURITIBA. IMÓVEL EM CONSTRUÇÃO. ENQUADRAMENTO COMO TERRITORIAL. IMPOSSIBILIDADE DE APLICAÇÃO DE ALÍQUOTA MAIS GRAVOSA DESTINADA A COIBIR ESPECULAÇÃO IMOBILIÁRIA. EXISTÊNCIA DE ALVARÁ DE CONSTRUÇÃO VÁLIDO E EFETIVO ANDAMENTO DAS OBRAS. PRINCÍPIO DA RAZOABILIDADE E DA CAPACIDADE CONTRIBUTIVA. DESCARACTERIZAÇÃO DO IMÓVEL COMO 'NÃO EDIFICADO'. RECURSO PROVIDO.&rdquo;
            </p>
            <p className="text-[11px] text-amber-300 font-medium pt-1">
              Relator: Desembargador Rogério Kanayama • Decisão Unânime
            </p>
          </div>

          {/* Legal Codes Matrix */}
          {MONOGRAFIA.dispositivos_chave.map((dip, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>{dip.diploma}</span>
              </h4>
              <div className="space-y-1.5">
                {dip.artigos.map((art, aIdx) => (
                  <div
                    key={aIdx}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                  >
                    <span className="font-semibold text-amber-300">{art.art}</span>
                    <span className="text-slate-300">{art.tema}</span>
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
