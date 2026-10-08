import React from 'react';
import { SlidersHorizontal, Heart, Shield, LogIn } from 'lucide-react';
import { AnimooLogo } from './AnimooLogo';
import { User } from '../types';

interface TopHeaderProps {
  onOpenFilter: () => void;
  onOpenProfile: () => void;
  onOpenFavorites: () => void;
  onOpenAdmin?: () => void;
  onOpenAuth?: () => void;
  currentUser?: User | null;
  favoritesCount: number;
  profileAvatarUrl: string;
  isFilterActive?: boolean;
  dbStatus?: 'connected' | 'offline' | 'checking';
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenFilter,
  onOpenProfile,
  onOpenFavorites,
  onOpenAdmin,
  onOpenAuth,
  currentUser,
  favoritesCount,
  profileAvatarUrl,
  isFilterActive = false,
  dbStatus = 'connected',
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-xl border-b border-stone-200/70 px-4 py-2.5 flex items-center justify-between shadow-[0_1px_10px_rgba(0,0,0,0.03)] transition-all">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <AnimooLogo size="sm" variant="full" />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Admin Portal Shortcut if Admin */}
        {currentUser?.role === 'admin' && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            title="Ouvrir le portail d'administration"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[11px] font-black shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Portail Admin</span>
          </button>
        )}

        {/* Favorites Trigger */}
        <button
          onClick={onOpenFavorites}
          aria-label="Mes compagnons favoris"
          title="Mes compagnons favoris"
          className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 text-stone-600 hover:text-rose-600 hover:bg-rose-50 bg-stone-50 cursor-pointer"
        >
          <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'text-[#E11D48] fill-[#E11D48]' : 'text-stone-500'}`} />
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#E11D48] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-sm">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Filter Trigger */}
        <button
          onClick={onOpenFilter}
          aria-label="Filtres de recherche"
          className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
            isFilterActive
              ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-500/20'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 bg-stone-50'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          {isFilterActive && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        {/* User Pet Profile Trigger or Login Button */}
        {currentUser ? (
          <button
            onClick={onOpenProfile}
            aria-label="Mon profil"
            className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-stone-200 hover:ring-rose-400 transition-all active:scale-95 group cursor-pointer"
          >
            <img
              src={currentUser?.avatar || profileAvatarUrl}
              alt="Mon profil"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </button>
        ) : onOpenAuth ? (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Connexion</span>
          </button>
        ) : null}
      </div>
    </header>
  );
};
