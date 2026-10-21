import React from 'react';
import { Shield, Settings, Zap, Database, Terminal, Presentation } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenPresentationGenerator: () => void;
  supabaseConnected: boolean;
  activeMode: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenPresentationGenerator,
  supabaseConnected,
  activeMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-amber-500/25 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo and Gamer Tag */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-700 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.35)] text-slate-950 font-black border border-yellow-300/40">
              <Shield className="w-6 h-6 text-slate-950" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 shadow-[0_0_8px_#34d399]" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                JurisMentor <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">IPTU</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-black bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 tracking-widest uppercase">
                LVL 8
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium tracking-wide">
              TCC: Imóveis Não Edificados • Curitiba
            </p>
          </div>
        </div>

        {/* Right HUD Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Active Mode Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-amber-500/30 text-xs font-bold text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{activeMode}</span>
          </div>

          {/* Gerar PPTX Action Button */}
          <button
            onClick={onOpenPresentationGenerator}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 hover:text-amber-200 transition-all border border-amber-500/40 active:scale-95 shadow-[0_0_12px_rgba(245,158,11,0.2)] text-xs font-bold cursor-pointer"
            title="Gerar Apresentação de Slides (PowerPoint / NotebookLM)"
          >
            <Presentation className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Gerar PPTX</span>
          </button>

          {/* Supabase Status */}
          <div
            title={supabaseConnected ? 'Supabase Database Ativo' : 'Armazenamento Local'}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
              supabaseConnected
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{supabaseConnected ? 'SYNC ON' : 'LOCAL'}</span>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-amber-400 transition-all border border-slate-700/80 active:scale-95 shadow-md"
            aria-label="Configurações e Chaves"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
