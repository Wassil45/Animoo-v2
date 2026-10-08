import React from 'react';
import { Home, Flame, Heart, MessageCircle, User } from 'lucide-react';

export type TabId = 'home' | 'discover' | 'matches' | 'messages' | 'profile';

interface BottomNavProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  matchesCount?: number;
  unreadChatsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  matchesCount = 0,
  unreadChatsCount = 0,
}) => {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-stone-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-safe"
    >
      <div className="max-w-lg md:max-w-xl mx-auto h-16 px-3 flex items-center justify-around">
        {/* 1. Accueil */}
        <button
          onClick={() => onTabChange('home')}
          aria-label="Accueil"
          aria-current={currentTab === 'home' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center gap-1 min-w-[50px] min-h-[44px] transition-all active:scale-95 cursor-pointer ${
            currentTab === 'home' ? 'text-primary font-bold' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'fill-primary/20 stroke-primary stroke-[2.2]' : ''}`} />
          <span className="text-[10px] tracking-tight">Accueil</span>
        </button>

        {/* 2. Découvrir */}
        <button
          onClick={() => onTabChange('discover')}
          aria-label="Découvrir des compagnons"
          aria-current={currentTab === 'discover' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center gap-1 min-w-[50px] min-h-[44px] transition-all active:scale-95 cursor-pointer ${
            currentTab === 'discover' ? 'text-primary font-bold' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Flame className={`w-5 h-5 ${currentTab === 'discover' ? 'fill-current' : ''}`} />
          <span className="text-[10px] tracking-tight">Découvrir</span>
        </button>

        {/* 3. Matchs */}
        <button
          onClick={() => onTabChange('matches')}
          aria-label={`Matchs mutuels (${matchesCount} nouveaux)`}
          aria-current={currentTab === 'matches' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center gap-1 min-w-[50px] min-h-[44px] transition-all active:scale-95 cursor-pointer ${
            currentTab === 'matches' ? 'text-primary font-bold' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${currentTab === 'matches' ? 'fill-current' : ''}`} />
            {matchesCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {matchesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Matchs</span>
        </button>

        {/* 4. Messages */}
        <button
          onClick={() => onTabChange('messages')}
          aria-label={`Discussions et messages (${unreadChatsCount} non lus)`}
          aria-current={currentTab === 'messages' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center gap-1 min-w-[50px] min-h-[44px] transition-all active:scale-95 cursor-pointer ${
            currentTab === 'messages' ? 'text-primary font-bold' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <div className="relative">
            <MessageCircle className={`w-5 h-5 ${currentTab === 'messages' ? 'fill-current' : ''}`} />
            {unreadChatsCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 bg-[#FF5E62] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {unreadChatsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Messages</span>
        </button>

        {/* 5. Profil */}
        <button
          onClick={() => onTabChange('profile')}
          aria-label="Mon profil"
          aria-current={currentTab === 'profile' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center gap-1 min-w-[50px] min-h-[44px] transition-all active:scale-95 cursor-pointer ${
            currentTab === 'profile' ? 'text-primary font-bold' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] tracking-tight">Profil</span>
        </button>
      </div>
    </nav>
  );
};
