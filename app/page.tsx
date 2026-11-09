'use client';

import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Loader2, KeyRound, Lock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BottomNav, TabType } from '@/components/BottomNav';
import { ChatTab } from '@/components/ChatTab';
import { BancaTab } from '@/components/BancaTab';
import { PresentationTab } from '@/components/PresentationTab';
import { TccDataTab } from '@/components/TccDataTab';
import { SettingsModal } from '@/components/SettingsModal';
import { PresentationGeneratorModal } from '@/components/PresentationGeneratorModal';
import { CyberCanvas } from '@/components/CyberCanvas';
import { LoginScreen } from '@/components/LoginScreen';
import { getSupabaseClient } from '@/lib/supabaseClient';

const ADMIN_EMAILS = ['arleisilverio41@gmail.com', 'arleisilveiro41@gmail.com', 'arlei85@hotmail.com'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('apresentacao');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPresentationGenOpen, setIsPresentationGenOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal de redefinição quando o usuário clica no link recebido por e-mail (PASSWORD_RECOVERY)
  const [isPasswordRecoveryOpen, setIsPasswordRecoveryOpen] = useState(false);
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('JURIS_LOCAL_MODE');
      if (window.location.hash && window.location.hash.includes('type=recovery')) {
        setIsPasswordRecoveryOpen(true);
      }
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let finished = false;
    const timeoutId = setTimeout(() => {
      if (!finished) {
        finished = true;
        setAuthLoading(false);
      }
    }, 6000);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeoutId);
        setSession(data.session);
        setAuthLoading(false);
      })
      .catch(() => {
        if (finished) return;
        finished = true;
        clearTimeout(timeoutId);
        setAuthLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setAuthLoading(false);

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecoveryOpen(true);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      listener.subscription.unsubscribe();
    };
  }, []);

  // Verifica se o usuário autenticado é o Administrador (Arlei)
  useEffect(() => {
    if (!session?.user) {
      setIsAdmin(false);
      return;
    }

    const userEmail = (session.user.email || '').trim().toLowerCase();
    if (ADMIN_EMAILS.includes(userEmail)) {
      setIsAdmin(true);
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    Promise.resolve(supabase.rpc('is_admin'))
      .then(({ data, error }) => {
        if (!error && typeof data === 'boolean') {
          setIsAdmin(data || ADMIN_EMAILS.includes(userEmail));
        }
      })
      .catch(() => {
        // mantém o resultado por e-mail
      });
  }, [session]);

  const handleSaveRecoveryPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');

    if (recoveryNewPassword.length < 6) {
      setRecoveryError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (recoveryNewPassword !== recoveryConfirmPassword) {
      setRecoveryError('A confirmação de senha não confere.');
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setRecoveryLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: recoveryNewPassword });
      if (error) {
        setRecoveryError(error.message);
      } else {
        setRecoverySuccess('Senha atualizada com sucesso!');
        setTimeout(() => {
          setIsPasswordRecoveryOpen(false);
          setRecoveryNewPassword('');
          setRecoveryConfirmPassword('');
          setRecoverySuccess('');
        }, 1400);
      }
    } catch (err: any) {
      setRecoveryError(err?.message || 'Erro ao atualizar a senha.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    try {
      await Promise.race([
        supabase?.auth.signOut(),
        new Promise((r) => setTimeout(r, 2000)),
      ]);
    } catch {
      // ignore signOut network error if offline
    }
    setSession(null);
    setIsSettingsOpen(false);
    setActiveTab('chat');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-amber-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 relative font-sans">
        <CyberCanvas />
        <LoginScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* 2D Cyber Canvas Background Animation */}
      <CyberCanvas />

      {/* Top Gamer HUD Navbar */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPresentationGenerator={() => setIsPresentationGenOpen(true)}
        supabaseConnected={true}
        isAdmin={isAdmin}
        activeMode={
          activeTab === 'chat'
            ? 'Modo Sábio // Mentor'
            : activeTab === 'banca'
            ? 'Arena // Boss Fight'
            : activeTab === 'apresentacao'
            ? 'Speedrun // 15 Min'
            : 'Artigo Científico // ABNT'
        }
      />

      {/* Main Interactive Screen with relative z-index over canvas */}
      <main className="flex-1 overflow-x-hidden relative z-10">
        {activeTab === 'chat' && <ChatTab userId={session.user.id} />}
        {activeTab === 'banca' && <BancaTab />}
        {activeTab === 'apresentacao' && (
          <PresentationTab onOpenPresentationGenerator={() => setIsPresentationGenOpen(true)} />
        )}
        {activeTab === 'tese' && <TccDataTab />}
      </main>

      {/* Fixed Bottom Gamer Navigation Deck */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Presentation Generator Modal */}
      <PresentationGeneratorModal
        isOpen={isPresentationGenOpen}
        onClose={() => setIsPresentationGenOpen(false)}
      />

      {/* Conta, IA e Banco */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        session={session}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      {/* Modal de Redefinição de Senha (quando vem pelo link de e-mail PASSWORD_RECOVERY) */}
      {isPasswordRecoveryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 rounded-2xl p-6 border border-amber-500/40 shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setIsPasswordRecoveryOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Definir Nova Senha</h2>
                <p className="text-xs text-slate-400">{session.user.email}</p>
              </div>
            </div>

            <form onSubmit={handleSaveRecoveryPassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nova Senha (mínimo 6 caracteres)</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={recoveryNewPassword}
                  onChange={(e) => setRecoveryNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Confirmar Nova Senha</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={recoveryConfirmPassword}
                  onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {recoveryError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{recoveryError}</span>
                </div>
              )}

              {recoverySuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{recoverySuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={recoveryLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 disabled:opacity-50"
              >
                {recoveryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Salvar Nova Senha</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
