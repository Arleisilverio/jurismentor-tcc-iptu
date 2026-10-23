'use client';

import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPresentationGenOpen, setIsPresentationGenOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Sessão de login (Supabase Auth)
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);

      // Usuário chegou pelo link "Esqueci minha senha"
      if (event === 'PASSWORD_RECOVERY') {
        const newPassword = window.prompt('Digite sua nova senha (mínimo 6 caracteres):');
        if (newPassword && newPassword.length >= 6) {
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          alert(error ? `Erro ao trocar a senha: ${error.message}` : 'Senha alterada com sucesso!');
        }
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Papel do usuário: o admin é definido no banco (função is_admin() do schema.sql)
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !session) {
      setIsAdmin(false);
      return;
    }
    supabase.rpc('is_admin').then(({ data, error }) => {
      setIsAdmin(!error && data === true);
    });
  }, [session]);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase?.auth.signOut();
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
    </div>
  );
}
