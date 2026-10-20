import React, { useState } from 'react';
import { Gavel, CheckCircle2, AlertTriangle, BookOpen, ChevronRight, ChevronLeft, Award, HelpCircle, Eye } from 'lucide-react';
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

    // Save to Supabase if connected
    const customUrl = localStorage.getItem('JURIS_SUPABASE_URL') || undefined;
    const customKey = localStorage.getItem('JURIS_SUPABASE_KEY') || undefined;
    const client = getSupabaseClient(customUrl, customKey);
    if (client) {
      try {
        await client.from('banca_simulations').insert([
          {
            question_id: currentQ.id,
            question_text: currentQ.pergunta,
            user_answer: userAnswer || 'Apenas conferiu resposta ideal',
            evaluator_score: score,
            feedback: score >= 8 ? 'Excelente domínio dogmático' : 'Revisar jurisprudência do TJPR'
          }
        ]);
      } catch (e) {
        console.warn('Erro ao salvar no Supabase:', e);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-4">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-700/60 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
              Questão {currentIndex + 1} de {PERGUNTAS_BANCA.length}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              currentQ.nivel_dificuldade.includes('Difícil') || currentQ.nivel_dificuldade.includes('Avançado')
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
            }`}>
              {currentQ.nivel_dificuldade}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white mt-1.5 flex items-center space-x-2">
            <Gavel className="w-5 h-5 text-amber-400" />
            <span>Simulador de Arguição da Banca</span>
          </h2>
          <p className="text-xs text-slate-400">
            Perfil do Examinador: <strong className="text-slate-200">{currentQ.examinador_perfil}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition"
            title="Questão anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === PERGUNTAS_BANCA.length - 1}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition"
            title="Próxima questão"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0 font-bold text-xs mt-0.5">
            ?
          </div>
          <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
            {currentQ.pergunta}
          </p>
        </div>

        {/* User practice textarea */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Sua Resposta Oral ou Rascunho de Defesa:</span>
            <span className="text-[11px] text-slate-500">Treine falar em voz alta antes de ler a resposta ideal</span>
          </label>
          <textarea
            rows={3}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Digite os principais tópicos da sua sustentação oral para esta pergunta..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Action Button: Reveal Answer */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition active:scale-95 shadow-md shadow-amber-400/20"
          >
            <Eye className="w-4 h-4" />
            <span>{showAnswer ? 'Ocultar Resposta Ideal' : 'Revelar Resposta Ideal e Armadilhas'}</span>
          </button>

          {savedScores[currentQ.id] !== undefined && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Award className="w-4 h-4" />
              <span>Sua autoavaliação: {savedScores[currentQ.id]}/10</span>
            </div>
          )}
        </div>
      </div>

      {/* Revealed Solution & Analysis */}
      {showAnswer && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Ideal Answer */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-emerald-500/30 space-y-2.5 bg-emerald-950/10">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span className="uppercase tracking-wider">Resposta Ideal e Sustentação Técnica</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {currentQ.resposta_ideal}
            </p>
          </div>

          {/* Trap to Avoid */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-amber-500/30 space-y-2 bg-amber-950/10">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span className="uppercase tracking-wider">Pegadinha da Banca / O que NÃO falar</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentQ.armadilha_a_evitar}
            </p>
          </div>

          {/* Legal Foundation Pills */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-700/60 space-y-2">
            <div className="flex items-center space-x-2 text-slate-300 font-bold text-xs">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Fundamentos Jurídicos Obrigatórios:</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {currentQ.fundamentos.map((f, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900 border border-slate-700 text-sky-300"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Self-Score Rating Bar */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Como foi seu desempenho nesta questão?</span>
              <span className="text-[11px] text-slate-400">Atribua uma nota de 0 a 10 para salvar seu progresso</span>
            </div>
            <div className="flex items-center space-x-1">
              {[5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() => handleSaveScore(score)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition active:scale-95 ${
                    selfScore === score
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
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
