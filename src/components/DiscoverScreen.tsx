import React from 'react';
import { Pet } from '../types';
import { SwipeCard } from './SwipeCard';
import { ActionBar } from './ActionBar';
import { MapPin, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from './ui';

interface DiscoverScreenProps {
  category: 'all' | 'dog' | 'cat';
  onCategoryChange: (category: 'dog' | 'cat') => void;
  maxDistanceKm: number;
  onOpenFilters: () => void;
  activePet?: Pet;
  nextPet?: Pet;
  favorites: Pet[];
  isLoading?: boolean;
  error?: string | null;
  onToggleFavorite: (pet: Pet) => void;
  onSwipe: (direction: 'left' | 'right' | 'superlike') => void;
  onOpenDetails: (pet: Pet) => void;
  onResetDistance: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onBlock?: (petId: string) => void;
  onReport?: (petId: string, reason: string, details?: string) => void;
  onRetry?: () => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  category,
  onCategoryChange,
  maxDistanceKm,
  onOpenFilters,
  activePet,
  nextPet,
  favorites,
  isLoading = false,
  error = null,
  onToggleFavorite,
  onSwipe,
  onOpenDetails,
  onResetDistance,
  onUndo,
  canUndo,
  onBlock,
  onReport,
  onRetry,
}) => {
  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24 text-stone-900 select-none">
      {/* Category Switcher & Distance Location Row */}
      <div className="flex items-center justify-between mb-3">
        {/* Dog / Cat Pills */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-full shadow-inner">
          <button
            onClick={() => onCategoryChange('dog')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              category === 'dog'
                ? 'bg-white text-primary shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>🐕</span>
            <span>Chiens</span>
            {category === 'dog' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
          </button>

          <button
            onClick={() => onCategoryChange('cat')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              category === 'cat'
                ? 'bg-white text-primary shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>🐈</span>
            <span>Chats</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 font-bold">
              12
            </span>
          </button>
        </div>

        {/* Quick Location Badge */}
        <button
          onClick={onOpenFilters}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>Paris 14e</span>
          <span className="text-stone-400 font-normal">(&lt;{maxDistanceKm}km)</span>
        </button>
      </div>

      {/* Swipe Deck Canvas */}
      <div className="relative w-full min-h-[500px] h-[540px] flex items-center justify-center my-1">
        {isLoading ? (
          /* Loading Skeleton Card */
          <div className="w-full h-full rounded-[30px] overflow-hidden bg-white border border-stone-100 shadow-md p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <Skeleton variant="text" width={120} height={28} className="rounded-full" />
              <Skeleton variant="text" width={60} height={28} className="rounded-full" />
            </div>
            <div className="flex flex-col items-center justify-center gap-3">
              <Skeleton variant="circular" width={120} height={120} />
              <Skeleton variant="text" width={180} height={24} />
            </div>
            <div className="space-y-2">
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="text" width="60%" height={16} />
            </div>
          </div>
        ) : error ? (
          /* Network Error State */
          <div className="w-full h-full rounded-[28px] bg-white border border-rose-200 flex flex-col items-center justify-center p-6 text-center shadow-md">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-8 h-8 text-rose-600" />
            </div>
            <h3 className="text-lg font-black text-stone-900">Erreur de chargement</h3>
            <p className="text-xs text-rose-600 mt-1 max-w-[240px]">
              {error}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 px-5 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Réessayer la connexion</span>
              </button>
            )}
          </div>
        ) : activePet ? (
          <>
            {/* Background Peek Card 2 */}
            <div className="absolute inset-x-2 top-4 bottom-0 rounded-[28px] bg-stone-300 opacity-40 scale-[0.92] transition-transform pointer-events-none shadow-sm" />

            {/* Background Peek Card 1 */}
            {nextPet && (
              <div className="absolute inset-x-1 top-2 bottom-1 rounded-[28px] bg-stone-900 overflow-hidden shadow-md scale-[0.96] opacity-90 transition-transform pointer-events-none">
                <img
                  src={nextPet.photos[0]}
                  alt={nextPet.name}
                  width={400}
                  height={540}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute bottom-5 left-4 right-4 text-white">
                  <h3 className="text-2xl font-black">
                    {nextPet.name}, {nextPet.age} ans
                  </h3>
                  <p className="text-xs text-stone-300">
                    {nextPet.breed} • {nextPet.distanceKm} km
                  </p>
                </div>
              </div>
            )}

            {/* Active Swipe Card */}
            <SwipeCard
              pet={activePet}
              isActive={true}
              isFavorite={favorites.some((f) => f.id === activePet.id)}
              onToggleFavorite={onToggleFavorite}
              onSwipe={onSwipe}
              onOpenDetails={onOpenDetails}
              onBlock={onBlock}
              onReport={onReport}
            />
          </>
        ) : (
          /* Useful Empty State */
          <div className="w-full h-full rounded-[28px] bg-white border border-stone-200 flex flex-col items-center justify-center p-6 text-center shadow-md">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-primary flex items-center justify-center text-3xl mb-3 shadow-inner">
              🐾
            </div>
            <h3 className="text-lg font-black text-stone-900">Plus de profils aux alentours !</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-[240px]">
              Vous avez vu tous les animaux dans votre rayon actuel. Élargissez le rayon pour découvrir d'autres compagnons de balade.
            </p>
            <button
              onClick={onResetDistance}
              className="mt-4 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-[#FF5E62] text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Élargir le rayon à 25 km
            </button>
          </div>
        )}
      </div>

      {/* Floating Swipe Action Bar (Undo, Dislike, Superlike, Like) */}
      {!isLoading && !error && activePet && (
        <ActionBar
          onUndo={onUndo}
          onDislike={() => onSwipe('left')}
          onSuperlike={() => onSwipe('superlike')}
          onLike={() => onSwipe('right')}
          canUndo={canUndo}
        />
      )}

      {/* Trust Banner */}
      <div className="mt-2 flex items-center justify-center gap-1.5 text-stone-500 text-[11px] font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
        <span>Charte de bienveillance canine Animoo respectée</span>
      </div>
    </div>
  );
};
