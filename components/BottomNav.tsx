import React from 'react';
import { MessageSquare, Gavel, Mic, BookOpen } from 'lucide-react';

export type TabType = 'chat' | 'banca' | 'apresentacao' | 'tese';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'chat' as TabType, label: 'Mentor', icon: MessageSquare },
    { id: 'banca' as TabType, label: 'Banca', icon: Gavel },
    { id: 'apresentacao' as TabType, label: 'Ensaio', icon: Mic },
    { id: 'tese' as TabType, label: 'Tese & Leis', icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-800/80 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]" />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
