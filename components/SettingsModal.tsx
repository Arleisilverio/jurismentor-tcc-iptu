import React, { useState, useEffect } from 'react';
import { X, User, Crown, Key, LogOut, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  isAdmin: boolean;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  session,
  isAdmin,
  onLogout,
}) => {
  const [aiStatus, setAiStatus] = useState<{
    openai: boolean;
    openaiModel: string;
    gemini: boolean;
    geminiModel: string;
  } | null>(null);
  const [loadingAiStatus, setLoadingAiStatus] = useState(false);

  useEffect(() => {
    if (!isOpen || !session) return;
    setLoadingAiStatus(true);
    fetch('/api/chat', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setAiStatus(data);
      })
      .catch((err) => console.warn('Erro ao checar status de IA:', err))
      .finally(() => setLoadingAiStatus(false));
  }, [isOpen, session]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 shadow-2xl border border-slate-700/60 overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Conta & Configurações</span>
              {isAdmin && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/50 uppercase">
                  <Crown className="w-3 h-3" />
                  ADM
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">JurisMentor IPTU Curitiba • Sessão Ativa</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* User Profile Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Usuário Autenticado
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span className="truncate">{session?.user?.email}</span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {isAdmin
                  ? 'Acesso Total (Administrador / Orientando Arlei)'
                  : 'Acesso Pessoal (Histórico isolado por RLS)'}
              </span>
            </div>
          </div>

          {/* AI Engines Status Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Motores de Inteligência Artificial</span>
              </label>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Server-Side Seguro
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              As chamadas são processadas diretamente no servidor usando as chaves seguras do seu ambiente (
              <code>.env.local</code> / Vercel), sem expor suas chaves de API nem seus créditos no navegador.
            </p>

            <div className="space-y-2 pt-1">
              {/* OpenAI Status */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200">
                    OpenAI GPT ({aiStatus?.openaiModel || 'gpt-5-mini'})
                  </span>
                </div>
                {aiStatus?.openai ? (
                  <span className="flex items-center space-x-1 text-xs text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ativo (Principal)</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-xs text-amber-300 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Aguardando OPENAI_API_KEY</span>
                  </span>
                )}
              </div>

              {/* Gemini Status */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${aiStatus?.gemini ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                  <span className="text-xs font-bold text-slate-200">
                    Google Gemini ({aiStatus?.geminiModel || 'gemini-2.5-flash'})
                  </span>
                </div>
                {aiStatus?.gemini ? (
                  <span className="flex items-center space-x-1 text-xs text-cyan-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ativo (Backup)</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 font-normal">Opcional</span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              💡 Para ativar seus créditos do GPT, adicione <code>OPENAI_API_KEY=sk-...</code> no seu{' '}
              <code>.env.local</code> (e nas Environment Variables da Vercel para celular).
            </p>
          </div>

          {/* Database / Supabase Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Banco de Dados & Sincronização
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O histórico do chat, anotações e autoavaliações da banca são salvos no <strong>Supabase</strong> e no
              navegador, com proteção RLS. O script completo de tabelas e permissões está em{' '}
              <code className="text-amber-300">schema.sql</code>.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
