import React, { useState } from 'react';
import { Swords, CheckCircle2, AlertTriangle, BookOpen, ChevronRight, ChevronLeft, Award, Eye, ShieldAlert, Sparkles } from 'lucide-react';
import { PERGUNTAS_BANCA, BancaQuestion } from '@/lib/tccData';
import { getSupabaseClient } from '@/lib/supabaseClient';

export const BancaTab: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [selfScore, setSelfScore] = useState<number | null>(null);
  const [savedScores, setSavedScores] = useState<{ [id: number]: number }>({});

  const currentQ: BancaQuestion = PERGUNTAS_BANCA[currentIndex];

  const handleNext = () => {
    if (currentIndex < PERGUNTAS_BANCA.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setShowAnswer(false);
      setSelfScore(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setUserAnswer('');
      setShowAnswer(false);
      setSelfScore(null);
    }
  };

  const handleSaveScore = async (score: number) => {
    setSelfScore(score);
    const newScores = { ...savedScores, [currentQ.id]: score };
    setSavedScores(newScores);

    const customUrl = localStorage.getItem('JURIS_SUPABASE_URL') || undefined;
    const customKey = localStorage.getItem('JURIS_SUPABASE_KEY') || undefined;
    const client = getSupabaseClient(customUrl, customKey);
    if (client) {
      try {
        await client.from('banca_simulations').insert([
          {
            question_id: currentQ.id,
            question_text: currentQ.pergunta,
            user_answer: userAnswer || 'Conferiu resposta ideal e armadilhas',
            evaluator_score: score,
            feedback: score >= 8 ? 'Excelente domínio da tese e TJPR' : 'Reforçar jurisprudência do TJPR'
          }
        ]);
      } catch (e) {
        console.warn('Erro ao salvar no Supabase:', e);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-4">
      {/* Boss Encounter Header */}
      <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-amber-500/30 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-400/15 text-amber-300 border border-amber-400/30 uppercase tracking-widest">
              Duelo {currentIndex + 1} de {PERGUNTAS_BANCA.length}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold border tracking-wider uppercase ${
              currentQ.nivel_dificuldade.includes('Difícil') || currentQ.nivel_dificuldade.includes('Avançado')
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
            }`}>
              {currentQ.nivel_dificuldade}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white mt-2 flex items-center space-x-2">
            <Swords className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>Arena da Banca // Arguição Oral</span>
          </h2>
          <p className="text-sm text-slate-300 font-medium mt-1">
            Boss da Banca: <strong className="text-amber-300">{currentQ.examinador_perfil}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-center">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition border border-slate-700"
            title="Duelo anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === PERGUNTAS_BANCA.length - 1}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition border border-slate-700"
            title="Próximo duelo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Question Card with larger text */}
      <div className="bg-slate-900/95 rounded-2xl p-5 sm:p-6 border border-slate-700/80 shadow-2xl space-y-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 font-black text-base mt-0.5 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
            VS
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed tracking-wide">
            &ldquo;{currentQ.pergunta}&rdquo;
          </p>
        </div>

        {/* User response rehearsal box */}
        <div className="space-y-2 pt-1">
          <label className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Sua Estratégia de Resposta Oral:</span>
            </span>
            <span className="text-xs text-slate-400 font-normal">Treine em voz alta antes de revelar</span>
          </label>
          <textarea
            rows={3}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Escreva os pontos-chave da sua réplica (artigos da CF, LC 40 e julgados do TJPR)..."
            className="w-full px-4 py-3 text-sm sm:text-base rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 leading-relaxed"
          />
        </div>

        {/* Action Button: Reveal Answer */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 transition active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:brightness-110"
          >
            <Eye className="w-5 h-5" />
            <span>{showAnswer ? 'Ocultar Resposta Ideal' : 'Revelar Contra-Ataque & Resposta Ideal'}</span>
          </button>

          {savedScores[currentQ.id] !== undefined && (
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-black shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>Sua Nota: {savedScores[currentQ.id]} / 10 XP</span>
            </div>
          )}
        </div>
      </div>

      {/* Revealed Solution & Analysis */}
      {showAnswer && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Ideal Answer with larger, very readable font */}
          <div className="bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-emerald-500/40 shadow-xl space-y-3 bg-emerald-950/15">
            <div className="flex items-center space-x-2 text-emerald-400 font-black text-sm tracking-wide uppercase">
              <CheckCircle2 className="w-5 h-5" />
              <span>Resposta Blindada para a Banca (O que você deve falar)</span>
            </div>
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal whitespace-pre-wrap">
              {currentQ.resposta_ideal}
            </p>
          </div>

          {/* Trap to Avoid */}
          <div className="bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-amber-500/40 shadow-xl space-y-2.5 bg-amber-950/15">
            <div className="flex items-center space-x-2 text-amber-400 font-black text-sm tracking-wide uppercase">
              <ShieldAlert className="w-5 h-5" />
              <span>Armadilha Fatal do Examinador (O que JAMAIS dizer)</span>
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              {currentQ.armadilha_a_evitar}
            </p>
          </div>

          {/* Legal Foundation Badges */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-700/80 space-y-2.5">
            <div className="flex items-center space-x-2 text-cyan-300 font-black text-sm uppercase tracking-wide">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>Dispositivos e Precedentes Obrigatórios para Citar:</span>
            </div>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {currentQ.fundamentos.map((f, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-950 border border-cyan-500/30 text-cyan-200 shadow-sm"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Self-Score Rating Bar */}
          <div className="bg-slate-900/95 rounded-2xl p-5 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <span className="text-sm sm:text-base font-bold text-white block">Autoavaliação da sua sustentação oral:</span>
              <span className="text-xs text-slate-400">Atribua sua nota de 5 a 10 para registrar seu progresso no Supabase</span>
            </div>
            <div className="flex items-center space-x-1.5">
              {[5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() => handleSaveScore(score)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-black transition-all active:scale-95 ${
                    selfScore === score
                      ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
