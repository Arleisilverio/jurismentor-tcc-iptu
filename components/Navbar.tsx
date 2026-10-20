import React from 'react';
import { Scale, Settings, Sparkles, Database } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  supabaseConnected: boolean;
  activeMode: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  supabaseConnected,
  activeMode,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-700/50 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
            <Scale className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">
                JurisMentor <span className="text-amber-400 font-extrabold text-xs px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">IPTU</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[210px] sm:max-w-md">
              TCC: Imóveis Não Edificados • Curitiba
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeMode}</span>
          </div>

          <div
            title={supabaseConnected ? 'Supabase Conectado' : 'Modo Offline / LocalStorage'}
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-semibold border ${
              supabaseConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-400'
            }`}
          >
            <Database className="w-3 h-3" />
            <span className="hidden md:inline">{supabaseConnected ? 'Supabase Ativo' : 'Local'}</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-slate-300 hover:text-white transition-all border border-slate-700/50"
            aria-label="Configurações e Chaves"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
