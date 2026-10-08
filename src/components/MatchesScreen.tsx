import React, { useState } from 'react';
import { Pet } from '../types';
import { Heart, Sparkles, MessageCircle, Info, Flame, AlertCircle, RefreshCw } from 'lucide-react';
import { FavoritesList } from './FavoritesList';
import { Badge, Skeleton, Button } from './ui';

interface MatchesScreenProps {
  newMatchPets: Pet[];
  favorites: Pet[];
  isLoading?: boolean;
  error?: string | null;
  onOpenNewMatch: (pet: Pet) => void;
  onStartChatWithPet: (pet: Pet) => void;
  onOpenDetails: (pet: Pet) => void;
  onRemoveFavorite: (petId: string) => void;
  onGoToDiscover: () => void;
  onRetry?: () => void;
}

export const MatchesScreen: React.FC<MatchesScreenProps> = ({
  newMatchPets,
  favorites,
  isLoading = false,
  error = null,
  onOpenNewMatch,
  onStartChatWithPet,
  onOpenDetails,
  onRemoveFavorite,
  onGoToDiscover,
  onRetry,
}) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'favorites'>('matches');

  return (
    <div className="flex flex-col w-full pb-24 text-stone-900 select-none">
      {/* Top Segmented Controls: Matchs vs Favoris */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center p-1 bg-stone-100 rounded-2xl shadow-inner">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-white text-primary shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Matchs Réels</span>
            {newMatchPets.length > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-rose-100 text-primary text-[10px] font-extrabold flex items-center justify-center">
                {newMatchPets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-white text-primary shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
            <span>Mes Favoris</span>
            {favorites.length > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-rose-100 text-primary text-[10px] font-extrabold flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Network Error Banner */}
      {error && (
        <div className="mx-4 mb-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Réessayer
            </button>
          )}
        </div>
      )}

      {/* TAB 1: MATCHS RÉELS */}
      {activeTab === 'matches' && (
        <div className="px-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-stone-900">
              Vos Matchs Mutuels
            </h2>
            <Badge variant="primary" size="sm">
              {newMatchPets.length} {newMatchPets.length > 1 ? 'partenaires' : 'partenaire'}
            </Badge>
          </div>

          {isLoading ? (
            /* Skeletons */
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 bg-white rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-2">
                  <Skeleton variant="card" height={140} className="rounded-xl" />
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="40%" />
                </div>
              ))}
            </div>
          ) : newMatchPets.length === 0 ? (
            /* Useful Empty State */
            <div className="my-8 flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-stone-100 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-primary flex items-center justify-center text-3xl mb-3 shadow-inner">
                <Heart className="w-8 h-8 text-primary fill-primary" />
              </div>
              <h3 className="text-base font-black text-stone-900">
                Aucun match pour l’instant
              </h3>
              <p className="text-xs text-stone-500 mt-1.5 max-w-[240px] leading-relaxed">
                Les matchs apparaissent uniquement quand un autre maître a aussi liké votre profil. Continuez à faire glisser !
              </p>
              <button
                onClick={onGoToDiscover}
                className="mt-4 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-[#FF5E62] text-white font-bold text-xs shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Flame className="w-4 h-4 fill-current" />
                <span>Aller dans Découvrir</span>
              </button>
            </div>
          ) : (
            /* Grid of Real Matches */
            <div className="grid grid-cols-2 gap-3">
              {newMatchPets.map((pet) => (
                <div
                  key={pet.id}
                  className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div
                    onClick={() => onOpenDetails(pet)}
                    className="relative h-40 bg-stone-100 cursor-pointer group"
                  >
                    <img
                      src={pet.photos[0]}
                      alt={pet.name}
                      width={200}
                      height={160}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold">
                      {pet.matchScore}% affinité
                    </div>
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow text-xs">
                      ♥
                    </div>
                  </div>

                  <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4
                          onClick={() => onOpenDetails(pet)}
                          className="font-extrabold text-sm text-stone-900 truncate hover:text-primary cursor-pointer"
                        >
                          {pet.name}
                        </h4>
                        <span className="text-[11px] text-stone-500 font-semibold">
                          {pet.age} ans
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">
                        {pet.breed} • {pet.ownerName}
                      </p>
                    </div>

                    <div className="flex gap-1.5 pt-1">
                      <button
                        onClick={() => onStartChatWithPet(pet)}
                        className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-primary to-[#FF5E62] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span>Discuter</span>
                      </button>
                      <button
                        onClick={() => onOpenDetails(pet)}
                        className="p-1.5 rounded-xl bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                        title="Voir le profil complet"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MES FAVORIS */}
      {activeTab === 'favorites' && (
        <FavoritesList
          favorites={favorites}
          onRemoveFavorite={onRemoveFavorite}
          onOpenDetails={onOpenDetails}
          onStartChat={onStartChatWithPet}
          onGoToDiscover={onGoToDiscover}
        />
      )}
    </div>
  );
};
