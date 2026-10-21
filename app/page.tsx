'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { BottomNav, TabType } from '@/components/BottomNav';
import { ChatTab } from '@/components/ChatTab';
import { BancaTab } from '@/components/BancaTab';
import { PresentationTab } from '@/components/PresentationTab';
import { TccDataTab } from '@/components/TccDataTab';
import { SettingsModal } from '@/components/SettingsModal';
import { PresentationGeneratorModal } from '@/components/PresentationGeneratorModal';
import { CyberCanvas } from '@/components/CyberCanvas';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPresentationGenOpen, setIsPresentationGenOpen] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  const checkSupabaseStatus = () => {
    if (typeof window === 'undefined') return;
    const url = localStorage.getItem('JURIS_SUPABASE_URL') || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = localStorage.getItem('JURIS_SUPABASE_KEY') || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const client = getSupabaseClient(url, key);
      setSupabaseConnected(!!client);
    } else {
      setSupabaseConnected(false);
    }
  };

  useEffect(() => {
    checkSupabaseStatus();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* 2D Cyber Canvas Background Animation */}
      <CyberCanvas />

      {/* Top Gamer HUD Navbar */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPresentationGenerator={() => setIsPresentationGenOpen(true)}
        supabaseConnected={supabaseConnected}
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
        {activeTab === 'chat' && <ChatTab />}
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

      {/* Settings & Keys Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={checkSupabaseStatus}
      />
    </div>
  );
}
