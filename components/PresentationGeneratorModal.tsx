'use client';

import React, { useState } from 'react';
import { X, Presentation, Download, CheckCircle2, Sparkles, Sliders, Layers, FileText, Check, AlertCircle } from 'lucide-react';
import { generateAcademicPptx, PresentationConfig } from '@/lib/pptxGenerator';
import { MONOGRAFIA } from '@/lib/tccData';

interface PresentationGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresentationGeneratorModal: React.FC<PresentationGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [tema, setTema] = useState(MONOGRAFIA.titulo);
  const [objetivo, setObjetivo] = useState<'defesa' | 'seminario' | 'aula' | 'estudo'>('defesa');
  const [quantidade, setQuantidade] = useState<5 | 10 | 15 | 20>(10);
  const [profundidade, setProfundidade] = useState<'sintese' | 'intermediario' | 'aprofundado'>('intermediario');
  const [estiloVisual, setEstiloVisual] = useState<'editorial' | 'infografico' | 'executivo'>('editorial');
  const [autor, setAutor] = useState('Arlei Silvério - 8º Período de Direito');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [downloadReady, setDownloadReady] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setDownloadReady(false);
    setErrorMessage('');
    setGenerationStep(1);

    try {
      // Step 1: Estruturando narrativa do TCC
      await new Promise(r => setTimeout(r, 600));
      setGenerationStep(2);

      // Step 2: Diagramando infográficos e tabelas
      await new Promise(r => setTimeout(r, 700));
      setGenerationStep(3);

      // Step 3: Compilando arquivo PowerPoint editável
      const blob = await generateAcademicPptx({
        tema,
        objetivo,
        quantidadeSlides: quantidade,
        profundidade,
        estiloVisual,
        autor
      });

      setGenerationStep(4);
      setDownloadBlob(blob);
      setDownloadReady(true);

      // Automatically trigger download
      triggerDownload(blob);

    } catch (err: any) {
      console.error('Erro na geração da apresentação:', err);
      setErrorMessage(err.message || 'Falha ao compilar a apresentação.');
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerDownload = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Apresentacao_TCC_IPTU_Curitiba_${quantidade}_Slides.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-amber-500/40 overflow-y-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Presentation className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
                Gerador de Apresentações Acadêmicas
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                NOTEBOOKLM STYLE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Gere slides PowerPoint editáveis (.pptx) com diagramação jurídica editorial
            </p>
          </div>
        </div>

        {/* Form Options */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Tema */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-200 flex items-center space-x-1.5">
              <span>Tema da Apresentação</span>
            </label>
            <input
              type="text"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Quantidade de Slides */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-200 flex items-center justify-between">
              <span>Quantidade de Slides</span>
              <span className="text-xs text-amber-400 font-mono font-bold">{quantidade} Slides selecionados</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([5, 10, 15, 20] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantidade(q)}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition ${
                    quantidade === q
                      ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-102'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {q} Slides {q === 10 ? '⭐' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Objetivo da Apresentação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-200 block">Objetivo</label>
              <select
                value={objetivo}
                onChange={(e: any) => setObjetivo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
              >
                <option value="defesa">Defesa de TCC (Banca Examinadora)</option>
                <option value="seminario">Seminário Acadêmico</option>
                <option value="aula">Exposição em Aula</option>
                <option value="estudo">Estudo Pessoal e Revisão</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-200 block">Estilo Visual</label>
              <select
                value={estiloVisual}
                onChange={(e: any) => setEstiloVisual(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
              >
                <option value="editorial">Acadêmico Editorial (NotebookLM Dark)</option>
                <option value="infografico">Infográfico Jurídico de Alto Impacto</option>
                <option value="executivo">Apresentação Executiva Forense</option>
              </select>
            </div>
          </div>

          {/* Autor */}
          <div className="space-y-1.5 pt-1">
            <label className="font-bold text-slate-200 block">Nome do Autor / Orientando</label>
            <input
              type="text"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Generation Progress Display */}
        {isGenerating && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
            <div className="flex items-center space-x-2 text-sm font-bold text-amber-300">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>
                {generationStep === 1 && 'Estruturando narrativa jurídica do TCC...'}
                {generationStep === 2 && 'Diagramando infográficos e tabelas comparativas...'}
                {generationStep === 3 && 'Compilando arquivo PowerPoint editável (.pptx)...'}
                {generationStep === 4 && 'Concluído com sucesso!'}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                style={{ width: `${(generationStep / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success / Download Ready Card */}
        {downloadReady && downloadBlob && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-sm font-black text-white block">Apresentação Gerada com Sucesso!</span>
                <span className="text-xs text-emerald-300 font-medium">Arquivo PowerPoint (.pptx) pronto e baixado</span>
              </div>
            </div>
            <button
              onClick={() => triggerDownload(downloadBlob)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center space-x-1.5 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Novamente</span>
            </button>
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-400 hover:text-white rounded-xl transition"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={handleStartGeneration}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 transition shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-40"
          >
            <Presentation className="w-5 h-5" />
            <span>{isGenerating ? 'Compilando Slides...' : 'Gerar Apresentação (.pptx)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
