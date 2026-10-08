import React from 'react';
import { Pet } from '../types';
import { Heart, MessageSquare, ArrowUp, Trash2, MapPin, Zap, CheckCircle2, Flame } from 'lucide-react';

interface FavoritesListProps {
  favorites: Pet[];
  onRemoveFavorite: (petId: string) => void;
  onOpenDetails: (pet: Pet) => void;
  onStartChat: (pet: Pet) => void;
  onGoToDiscover: () => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  favorites,
  onRemoveFavorite,
  onOpenDetails,
  onStartChat,
  onGoToDiscover,
}) => {
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center select-none animate-fadeIn">
        <div className="relative w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-4 text-rose-500 shadow-sm border border-rose-100">
          <Heart className="w-10 h-10 stroke-[1.8] fill-rose-100" />
          <span className="absolute -bottom-1 -right-1 text-xl">🐾</span>
        </div>
        <h3 className="text-lg font-black text-stone-900 mb-1">
          Aucun compagnon favori pour l'instant
        </h3>
        <p className="text-xs text-stone-500 max-w-[280px] leading-relaxed mb-6">
          Appuyez sur le bouton cœur <Heart className="w-3.5 h-3.5 inline text-rose-500 fill-rose-500 mx-0.5" /> présent sur les cartes de profil pour sauvegarder vos coups de cœur et les retrouver ici à tout moment.
        </p>
        <button
          onClick={onGoToDiscover}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-[#FF5E62] text-white font-bold text-xs shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Flame className="w-4 h-4 fill-current" />
          <span>Explorer les animaux aux alentours</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-2 animate-fadeIn select-none">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          {favorites.length} {favorites.length > 1 ? 'compagnons sauvegardés' : 'compagnon sauvegardé'}
        </span>
        <span className="text-[11px] text-stone-400">
          Prêts pour un playdate
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {favorites.map((pet) => (
          <div
            key={pet.id}
            className="bg-white rounded-2xl p-3 shadow-sm border border-stone-100 hover:shadow-md transition-all flex flex-col justify-between relative group"
          >
            {/* Top row: Photo, info & Delete */}
            <div className="flex gap-3">
              {/* Pet Photo */}
              <div
                onClick={() => onOpenDetails(pet)}
                className="relative w-20 h-24 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 cursor-pointer"
              >
                <img
                  src={pet.photos[0]}
                  alt={pet.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-1 left-1 text-xs">
                  {pet.species === 'dog' ? '🐶' : '🐱'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-1 left-1.5 right-1 text-[10px] font-bold text-white flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 text-amber-300 fill-current" />
                  <span>{pet.matchScore}%</span>
                </div>
              </div>

              {/* Pet Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 truncate">
                      <h4
                        onClick={() => onOpenDetails(pet)}
                        className="text-sm font-extrabold text-stone-900 truncate hover:text-primary cursor-pointer"
                      >
                        {pet.name}, {pet.age} {pet.age > 1 ? 'ans' : 'an'}
                      </h4>
                      {pet.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#E11D48] fill-[#E11D48] shrink-0" />
                      )}
                    </div>
                    {/* Remove from favorites */}
                    <button
                      onClick={() => onRemoveFavorite(pet.id)}
                      title="Retirer des favoris"
                      className="text-stone-300 hover:text-rose-500 p-1 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] font-medium text-stone-500 truncate mt-0.5">
                    {pet.breed}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-1">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span className="truncate">{pet.distanceKm} km • {pet.locationName.split('•')[0]}</span>
                  </div>
                </div>

                {/* Trait tags */}
                <div className="flex items-center gap-1 overflow-hidden mt-1.5">
                  {pet.tags.slice(0, 2).map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-medium truncate"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-stone-100">
              <button
                onClick={() => onOpenDetails(pet)}
                className="flex-1 py-1.5 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Voir fiche</span>
              </button>

              <button
                onClick={() => onStartChat(pet)}
                className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-primary to-[#FF5E62] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm hover:opacity-95 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
                <span>Contacter</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
