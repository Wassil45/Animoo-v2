import React, { useState, useRef } from 'react';
import { Pet } from '../types';
import { MapPin, CheckCircle2, Zap, ArrowUp, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { ActionMenu } from './ActionMenu';

interface SwipeCardProps {
  pet: Pet;
  isActive: boolean;
  isFavorite: boolean;
  onToggleFavorite: (pet: Pet) => void;
  onSwipe: (direction: 'left' | 'right' | 'superlike') => void;
  onOpenDetails: (pet: Pet) => void;
  onBlock?: (petId: string) => void;
  onReport?: (petId: string, reason: string, details?: string) => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  pet,
  isActive,
  isFavorite,
  onToggleFavorite,
  onSwipe,
  onOpenDetails,
  onBlock,
  onReport,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const currentPhoto = pet.photos[photoIndex] || pet.photos[0];

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 110;
    if (dragOffset.x > threshold) {
      onSwipe('right');
    } else if (dragOffset.x < -threshold) {
      onSwipe('left');
    } else if (dragOffset.y < -threshold) {
      onSwipe('superlike');
    }
    setDragOffset({ x: 0, y: 0 });
    dragStartRef.current = null;
  };

  const nextPhoto = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (photoIndex < pet.photos.length - 1) {
      setPhotoIndex(photoIndex + 1);
    }
  };

  const prevPhoto = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (photoIndex > 0) {
      setPhotoIndex(photoIndex - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isActive) return;
    if (e.key === 'ArrowLeft' || e.key === 'x' || e.key === 'X') {
      e.preventDefault();
      onSwipe('left');
    } else if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
      e.preventDefault();
      onSwipe('right');
    } else if (e.key === 'ArrowUp' || e.key === 's' || e.key === 'S') {
      e.preventDefault();
      onSwipe('superlike');
    } else if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenDetails(pet);
    } else if (e.key === 'p' || e.key === 'P' || e.key === '[') {
      e.preventDefault();
      if (photoIndex > 0) setPhotoIndex((prev) => prev - 1);
    } else if (e.key === 'n' || e.key === 'N' || e.key === ']') {
      e.preventDefault();
      if (photoIndex < pet.photos.length - 1) setPhotoIndex((prev) => prev + 1);
    }
  };

  const rotation = dragOffset.x * 0.08;
  const likeOpacity = Math.min(1, Math.max(0, dragOffset.x / 80));
  const nopeOpacity = Math.min(1, Math.max(0, -dragOffset.x / 80));

  return (
    <div
      tabIndex={isActive ? 0 : -1}
      role="region"
      aria-label={`Fiche de ${pet.name}, ${pet.breed}, ${pet.age} ans. Raccourcis clavier : Flèche Gauche ou X pour passer, Flèche Droite ou L pour aimer, Flèche Haut ou S pour superlike, Entrée pour voir les détails, [ ou P pour photo précédente, ] ou N pour photo suivante.`}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        touchAction: 'none',
      }}
      className="relative w-full h-[540px] rounded-[30px] overflow-hidden shadow-[0_16px_40px_rgba(27,28,28,0.18)] bg-stone-900 select-none cursor-grab active:cursor-grabbing border border-black/5 focus:outline-none focus:ring-4 focus:ring-primary/40"
    >
      {/* Background Pet Image */}
      <img
        src={currentPhoto}
        alt={pet.name}
        width={400}
        height={540}
        loading="lazy"
        className="w-full h-full object-cover pointer-events-none select-none"
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Fallback if network blocked
          (e.target as HTMLElement).style.display = 'none';
        }}
      />

      {/* Top Gradient Shadow for Pill Legibility */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

      {/* Distance & Location Pill */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold shadow-sm border border-white/10">
        <MapPin className="w-3.5 h-3.5 text-rose-400" />
        <span>{pet.distanceKm} km • {pet.locationName.split('•')[0].trim()}</span>
      </div>

      {/* Photos Pagination Bars */}
      {pet.photos.length > 1 && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
          {pet.photos.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === photoIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* Heart-Shaped 'Favori' Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(pet);
        }}
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        title={isFavorite ? 'Retirer des favoris' : 'Sauvegarder dans mes favoris'}
        className={`absolute top-14 right-4 z-20 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md shadow-md border transition-all active:scale-90 cursor-pointer ${
          isFavorite
            ? 'bg-gradient-to-tr from-primary to-[#FF5E62] text-white border-rose-300 ring-2 ring-rose-400/50 shadow-rose-500/30'
            : 'bg-black/35 text-white/90 border-white/20 hover:bg-black/55 hover:text-white'
        }`}
      >
        <Heart
          className={`w-5 h-5 transition-transform duration-200 ${
            isFavorite ? 'fill-white stroke-white scale-110' : 'stroke-white'
          }`}
        />
      </button>

      {/* Menu « ⋯ » (Bloquer, Signaler) */}
      <div className="absolute top-[116px] right-4 z-20">
        <ActionMenu
          petName={pet.name}
          onBlock={() => onBlock?.(pet.id)}
          onReport={(reason, details) => onReport?.(pet.id, reason, details)}
          buttonClassName="w-11 h-11 bg-black/35 text-white/90 border border-white/20 backdrop-blur-md shadow-md hover:bg-black/55"
          align="right"
        />
      </div>

      {/* Accessible Photo Navigation Buttons (visibles au tactile et au clavier) */}
      {pet.photos.length > 1 && (
        <div className="absolute inset-y-0 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
          {photoIndex > 0 ? (
            <button
              type="button"
              onClick={prevPhoto}
              aria-label="Photo précédente"
              className="pointer-events-auto w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-md active:scale-90 hover:bg-black/65 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}

          {photoIndex < pet.photos.length - 1 ? (
            <button
              type="button"
              onClick={nextPhoto}
              aria-label="Photo suivante"
              className="pointer-events-auto w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-md active:scale-90 hover:bg-black/65 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* GLOSSY GLASS OVERLAY - WOOF / LIKE (Green / Emerald)                       */}
      {/* ========================================================================= */}
      <div
        style={{ opacity: likeOpacity }}
        className="absolute inset-0 z-25 pointer-events-none transition-opacity duration-75 overflow-hidden"
      >
        {/* Emerald glossy backdrop & tint */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/35 via-emerald-500/20 to-teal-300/15 backdrop-blur-[2px]" />
        
        {/* Glossy top specular reflection sheen */}
        <div className="absolute top-0 inset-x-0 h-2/5 bg-gradient-to-b from-white/35 via-white/10 to-transparent" />
        
        {/* Diagonal high-gloss light refraction streak */}
        <div className="absolute -top-1/2 -bottom-1/2 -left-1/2 -right-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-25 transform" />

        {/* Glossy border and inner neon radiance */}
        <div className="absolute inset-0 rounded-[30px] border-2 border-emerald-400/80 shadow-[inset_0_0_35px_rgba(16,185,129,0.5),0_0_25px_rgba(16,185,129,0.4)]" />
      </div>

      {/* ========================================================================= */}
      {/* GLOSSY GLASS OVERLAY - PASSER / DISLIKE (Red / Rose)                      */}
      {/* ========================================================================= */}
      <div
        style={{ opacity: nopeOpacity }}
        className="absolute inset-0 z-25 pointer-events-none transition-opacity duration-75 overflow-hidden"
      >
        {/* Ruby red glossy backdrop & tint */}
        <div className="absolute inset-0 bg-gradient-to-tl from-rose-700/35 via-red-600/20 to-rose-300/15 backdrop-blur-[2px]" />
        
        {/* Glossy top specular reflection sheen */}
        <div className="absolute top-0 inset-x-0 h-2/5 bg-gradient-to-b from-white/35 via-white/10 to-transparent" />
        
        {/* Diagonal high-gloss light refraction streak */}
        <div className="absolute -top-1/2 -bottom-1/2 -left-1/2 -right-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent -rotate-25 transform" />

        {/* Glossy border and inner neon radiance */}
        <div className="absolute inset-0 rounded-[30px] border-2 border-rose-500/80 shadow-[inset_0_0_35px_rgba(244,63,94,0.5),0_0_25px_rgba(244,63,94,0.4)]" />
      </div>

      {/* Interactive Drag Stamp Badges */}
      {/* WOOF / LIKE */}
      <div
        style={{
          opacity: likeOpacity,
          transform: `scale(${0.85 + likeOpacity * 0.25}) rotate(-14deg)`,
        }}
        className="absolute top-12 left-6 z-30 pointer-events-none border-4 border-emerald-300 text-emerald-300 bg-emerald-950/75 backdrop-blur-md px-5 py-2 rounded-2xl font-black text-3xl tracking-wider shadow-[0_10px_30px_rgba(16,185,129,0.55)] transition-all duration-75"
      >
        WOOF ! 🐾
      </div>

      {/* NOPE / PASSER */}
      <div
        style={{
          opacity: nopeOpacity,
          transform: `scale(${0.85 + nopeOpacity * 0.25}) rotate(14deg)`,
        }}
        className="absolute top-12 right-6 z-30 pointer-events-none border-4 border-rose-400 text-rose-300 bg-rose-950/75 backdrop-blur-md px-5 py-2 rounded-2xl font-black text-3xl tracking-wider shadow-[0_10px_30px_rgba(244,63,94,0.55)] transition-all duration-75"
      >
        PASSER
      </div>

      {/* Bottom Scrim & Pet Information */}
      <div className="absolute inset-x-0 bottom-0 pt-24 pb-5 px-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white flex flex-col justify-end pointer-events-auto">
        {/* Row 1: Name, Age, Verification & Compatibility Match */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
              {pet.name}, {pet.age} {pet.age > 1 ? 'ans' : 'an'}
            </h2>
            {pet.verified && (
              <div className="w-6 h-6 rounded-full bg-[#E11D48] flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-white fill-white" />
              </div>
            )}
          </div>

          {/* Compatibility Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/90 text-white font-bold text-xs backdrop-blur-md shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{pet.matchScore}% Match</span>
          </div>
        </div>

        {/* Breed and Info Tagline */}
        <p className="text-sm font-semibold text-rose-200 flex items-center gap-2 mb-2">
          <span>{pet.breed}</span>
          <span className="w-1 h-1 rounded-full bg-rose-200 inline-block" />
          <span className="text-white/80">{pet.gender} {pet.sterilized ? 'stérilisé' : ''}</span>
        </p>

        {/* Trait Badges Cluster */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {pet.tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bio Teaser with Expand Full Profile Button */}
        <div className="flex items-end justify-between gap-3">
          <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
            {pet.bio}
          </p>
          <div className="shrink-0 flex items-center gap-2">
            {/* Expand Full Profile Button */}
            <button
              onClick={() => onOpenDetails(pet)}
              aria-label="Voir le profil complet"
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90 border border-white/20 cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

