'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { BottomNav, TabType } from '@/components/BottomNav';
import { ChatTab } from '@/components/ChatTab';
import { BancaTab } from '@/components/BancaTab';
import { PresentationTab } from '@/components/PresentationTab';
import { TccDataTab } from '@/components/TccDataTab';
import { SettingsModal } from '@/components/SettingsModal';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  const checkSupabaseStatus = () => {
    if (typeof window === 'undefined') return;
    const url = localStorage.getItem('JURIS_SUPABASE_URL');
    const key = localStorage.getItem('JURIS_SUPABASE_KEY');
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        supabaseConnected={supabaseConnected}
        activeMode={
          activeTab === 'chat'
            ? 'Mentor & Tutor'
            : activeTab === 'banca'
            ? 'Banca Simulada'
            : activeTab === 'apresentacao'
            ? 'Ensaio de Fala'
            : 'Guia da Tese'
        }
      />

      {/* Main Content Area based on Active Tab */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'banca' && <BancaTab />}
        {activeTab === 'apresentacao' && <PresentationTab />}
        {activeTab === 'tese' && <TccDataTab />}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Configuration & Connections Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={checkSupabaseStatus}
      />
    </div>
  );
}
