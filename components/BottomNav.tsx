import React from 'react';
import { MessageSquare, Swords, Timer, ScrollText, Lock } from 'lucide-react';

export type TabType = 'chat' | 'banca' | 'apresentacao' | 'tese';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isAdmin?: boolean;
  onLockedTabClick?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  isAdmin = false,
  onLockedTabClick,
}) => {
  const tabs = [
    { id: 'chat' as TabType, label: 'Mentor', icon: MessageSquare, badge: 'TUTOR', adminOnly: false },
    { id: 'tese' as TabType, label: 'Artigo', icon: ScrollText, badge: 'ABNT', adminOnly: false },
    { id: 'apresentacao' as TabType, label: 'Defesa', icon: Timer, badge: 'AO VIVO', adminOnly: true },
    { id: 'banca' as TabType, label: 'Banca', icon: Swords, badge: 'BOSS', adminOnly: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-amber-500/30 pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.6)]">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isLocked = tab.adminOnly && !isAdmin;
          const isActive = activeTab === tab.id && !isLocked;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (isLocked) {
                  onLockedTabClick?.();
                } else {
                  onTabChange(tab.id);
                }
              }}
              title={
                isLocked
                  ? `${tab.label}: Exclusivo do Autor (Arlei Silvério)`
                  : tab.label
              }
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? 'text-amber-400 font-black bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : isLocked
                  ? 'text-slate-600 hover:text-amber-400/80'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-transform duration-200 ${
                    isActive
                      ? 'scale-115 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                      : ''
                  }`}
                />
                {isLocked && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-slate-900 border border-amber-500/40 rounded-full text-amber-400">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]" />
                )}
              </div>
              <span
                className={`text-xs sm:text-sm mt-1 tracking-wide uppercase flex items-center gap-0.5 ${
                  isActive ? 'font-black text-amber-300' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
