import React from 'react';
import { MessageSquare, Swords, Timer, ScrollText } from 'lucide-react';

export type TabType = 'chat' | 'banca' | 'apresentacao' | 'tese';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'chat' as TabType, label: 'Mentor', icon: MessageSquare, badge: 'TUTOR' },
    { id: 'banca' as TabType, label: 'Banca', icon: Swords, badge: 'BOSS' },
    { id: 'apresentacao' as TabType, label: 'Ensaio', icon: Timer, badge: 'RUN' },
    { id: 'tese' as TabType, label: 'Artigo', icon: ScrollText, badge: 'ABNT' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-amber-500/30 pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.6)]">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? 'text-amber-400 font-black bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'scale-115 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]" />
                )}
              </div>
              <span className={`text-xs sm:text-sm mt-1 tracking-wide uppercase ${isActive ? 'font-black text-amber-300' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
