import React, { useState } from 'react';
import { Pet } from '../types';
import { X, MapPin, CheckCircle2, ShieldCheck, Heart, Zap, Sparkles, Navigation, Calendar } from 'lucide-react';
import { ActionMenu } from './ActionMenu';

interface ProfileDetailModalProps {
  pet: Pet | null;
  isOpen: boolean;
  isFavorite: boolean;
  onToggleFavorite: (pet: Pet) => void;
  onClose: () => void;
  onLike: (pet: Pet) => void;
  onDislike: (pet: Pet) => void;
  onBlock?: (petId: string) => void;
  onReport?: (petId: string, reason: string, details?: string) => void;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  pet,
  isOpen,
  isFavorite,
  onToggleFavorite,
  onClose,
  onLike,
  onDislike,
  onBlock,
  onReport,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!isOpen || !pet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[92vh] bg-white rounded-t-[36px] sm:rounded-[36px] overflow-hidden flex flex-col shadow-2xl">
        {/* Top Floating Controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* Favorite Toggle Button */}
          <button
            onClick={() => onToggleFavorite(pet)}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-md border ${
              isFavorite
                ? 'bg-[#E11D48] text-white border-rose-300'
                : 'bg-black/40 hover:bg-black/60 text-white border-white/20'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Menu « ⋯ » (Bloquer, Signaler) */}
          <ActionMenu
            petName={pet.name}
            onBlock={() => {
              onBlock?.(pet.id);
              onClose();
            }}
            onReport={(reason, details) => onReport?.(pet.id, reason, details)}
            buttonClassName="w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-md"
            align="right"
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto no-scrollbar pb-24">
          {/* Main Photo Carousel */}
          <div className="relative w-full aspect-[4/4] bg-stone-900">
            <img
              src={pet.photos[activePhotoIdx] || pet.photos[0]}
              alt={pet.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

            {/* Photo Thumbnails Switcher */}
            {pet.photos.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                {pet.photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIdx(i)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      i === activePhotoIdx ? 'border-rose-500 scale-105 shadow-md' : 'border-white/50 opacity-70'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}

            {/* Basic Identity Floating Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{pet.locationName}</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-5 flex flex-col gap-5">
            {/* Header Identity */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-stone-900">{pet.name}, {pet.age} ans</h2>
                  {pet.verified && (
                    <span className="w-5 h-5 rounded-full bg-[#E11D48] flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-rose-600 mt-0.5">
                  {pet.breed} • {pet.gender} {pet.sterilized ? '(stérilisé)' : ''}
                </p>
              </div>

              {/* Match Score Badge */}
              <div className="flex flex-col items-end">
                <span className="text-xs text-stone-500 font-bold uppercase">Affinité</span>
                <span className="text-xl font-black text-primary flex items-center gap-0.5">
                  <Zap className="w-4 h-4 fill-current" />
                  {pet.matchScore}%
                </span>
              </div>
            </div>

            {/* Health & Passport Trust Badge */}
            <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-100 flex items-center justify-around text-center">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-stone-800">Vaccins</span>
                <span className="text-[10px] text-emerald-600 font-semibold">À jour ✓</span>
              </div>
              <div className="w-px h-8 bg-stone-200" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-base">🏷️</span>
                <span className="text-xs font-bold text-stone-800">Identification</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Pucé(e) ✓</span>
              </div>
              <div className="w-px h-8 bg-stone-200" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-base">✂️</span>
                <span className="text-xs font-bold text-stone-800">Stérilisation</span>
                <span className="text-[10px] text-stone-600 font-semibold">
                  {pet.sterilized ? 'Oui ✓' : 'Non'}
                </span>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                À propos de {pet.name}
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed bg-rose-50/40 p-3.5 rounded-2xl border border-rose-100/60">
                {pet.bio}
              </p>
            </div>

            {/* Passions & Traits */}
            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Centres d'intérêt & Habitudes
              </h3>
              <div className="flex flex-wrap gap-2">
                {pet.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold flex items-center gap-1"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Favorite Parks & Walk spots */}
            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Spots de balade favoris
              </h3>
              <div className="flex flex-col gap-2">
                {pet.favoriteParks.map((park, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs font-medium text-stone-700"
                  >
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-rose-500" />
                      <span>{park}</span>
                    </div>
                    <span className="text-stone-400 text-[11px]">Idéal pour courir</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Owner Section */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
                L'humain qui accompagne {pet.name}
              </h3>
              <div className="flex items-center gap-3">
                <img
                  src={pet.ownerAvatar}
                  alt={pet.ownerName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-sm font-bold text-stone-900">
                    {pet.ownerName}, {pet.ownerAge} ans
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">{pet.ownerBio}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Bottom CTA Bar */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-white/95 backdrop-blur-md border-t border-stone-200 flex items-center justify-center gap-4">
          <button
            onClick={() => {
              onDislike(pet);
              onClose();
            }}
            className="flex-1 h-12 rounded-full border border-stone-200 text-stone-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5 text-rose-500" />
            <span>Passer</span>
          </button>

          <button
            onClick={() => {
              onLike(pet);
              onClose();
            }}
            className="flex-1 h-12 rounded-full bg-gradient-to-r from-primary to-[#FF5E62] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Heart className="w-5 h-5 fill-current" />
            <span>Liker & Rencontrer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
