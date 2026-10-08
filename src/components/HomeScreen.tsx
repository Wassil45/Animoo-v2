import React from 'react';
import { Pet, User } from '../types';
import {
  Compass,
  Heart,
  Calendar,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Plus,
  Flame,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from './ui';

interface HomeScreenProps {
  userPet: Pet;
  currentUser: User | null;
  newMatches: Pet[];
  onGoToDiscover: () => void;
  onGoToMatches: () => void;
  onOpenPlaydateModal: () => void;
  onOpenPetDetail: (pet: Pet) => void;
  isAvailableForPlaydates: boolean;
  onToggleAvailability: (val: boolean) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userPet,
  currentUser,
  newMatches,
  onGoToDiscover,
  onGoToMatches,
  onOpenPlaydateModal,
  onOpenPetDetail,
  isAvailableForPlaydates,
  onToggleAvailability,
}) => {
  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24 text-stone-900 select-none space-y-4">
      {/* 1. Hero Welcome Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-stone-900 via-stone-800 to-stone-900 text-white p-5 shadow-lg">
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1 pr-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-rose-300 mb-2">
              <Sparkles className="w-3 h-3 text-rose-300" />
              Animoo Communauté
            </span>
            <h1 className="text-xl font-black tracking-tight leading-snug">
              Bonjour {currentUser?.name?.split(' ')[0] || userPet.ownerName} & {userPet.name} 🐾
            </h1>
            <p className="text-xs text-stone-300 mt-1 max-w-[240px]">
              {newMatches.length > 0
                ? `Vous avez ${newMatches.length} nouveau(x) match(s) prêt(s) à jouer !`
                : 'Trouvez de nouveaux copains pour vos balades aujourd’hui.'}
            </p>
          </div>

          <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden border-2 border-white/20 shadow-md">
            <img
              src={userPet.photos[0]}
              alt={userPet.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Quick status pill */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isAvailableForPlaydates ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'
              }`}
            />
            <span className="text-[11px] text-stone-300 font-medium">
              {isAvailableForPlaydates
                ? 'Visible pour les playdates'
                : 'Mode discret (pause)'}
            </span>
          </div>
          <button
            onClick={() => onToggleAvailability(!isAvailableForPlaydates)}
            className="text-[11px] font-bold text-rose-300 hover:text-white underline cursor-pointer"
          >
            {isAvailableForPlaydates ? 'Mettre en pause' : 'Activer'}
          </button>
        </div>
      </section>

      {/* 2. Action Shortcuts */}
      <section className="grid grid-cols-2 gap-3">
        <button
          onClick={onGoToDiscover}
          className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-[#FF5E62] text-white flex items-center justify-center shadow-sm mb-3">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-stone-900 group-hover:text-primary transition-colors">
              Découvrir
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Swiper de nouveaux profils à proximité
            </p>
          </div>
        </button>

        <button
          onClick={onOpenPlaydateModal}
          className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm mb-3">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-stone-900 group-hover:text-purple-600 transition-colors">
              Sortie Playdate
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Organiser une balade dans un parc
            </p>
          </div>
        </button>
      </section>

      {/* 3. Upcoming Playdates Section */}
      <section className="rounded-2xl bg-white p-4 border border-stone-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-primary flex items-center justify-center font-bold text-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-extrabold text-stone-900">Prochaine sortie prévue</h2>
          </div>
          <Badge variant="success" size="sm">Confirmé</Badge>
        </div>

        <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-primary flex flex-col items-center justify-center shrink-0">
            <span className="text-[10px] font-bold uppercase">Sam</span>
            <span className="text-base font-black leading-none">10</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 truncate">
              <span>Balade collective • Parc Montsouris</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> 10h30
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500" /> Paris 14e
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Matchs Récents */}
      {newMatches.length > 0 && (
        <section className="rounded-2xl bg-white p-4 border border-stone-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary fill-primary" />
              <h2 className="text-sm font-extrabold text-stone-900">
                Matchs récents ({newMatches.length})
              </h2>
            </div>
            <button
              onClick={onGoToMatches}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Voir tout <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {newMatches.slice(0, 3).map((pet) => (
              <div
                key={pet.id}
                onClick={() => onOpenPetDetail(pet)}
                className="flex flex-col items-center text-center cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-stone-100 shadow-sm relative group-hover:scale-105 transition-transform">
                  <img
                    src={pet.photos[0]}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute bottom-1 right-1 px-1 rounded bg-black/60 text-white text-[9px] font-bold">
                    {pet.matchScore}%
                  </span>
                </div>
                <span className="text-xs font-bold text-stone-800 mt-1 truncate w-full">
                  {pet.name}
                </span>
                <span className="text-[10px] text-stone-400 truncate w-full">
                  {pet.breed}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Daily Care Tip */}
      <section className="rounded-2xl bg-amber-50/70 border border-amber-200/60 p-4 flex items-start gap-3">
        <span className="text-2xl shrink-0">💡</span>
        <div className="flex-1">
          <h3 className="text-xs font-extrabold text-amber-900 uppercase tracking-wide">
            Le conseil Animoo du jour
          </h3>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            Pensez à toujours apporter de l’eau fraîche lors d’une première rencontre entre chiens. Une petite pause hydratation désamorce l’excitation du jeu !
          </p>
        </div>
      </section>

      {/* 6. Trust footer */}
      <div className="flex items-center justify-center gap-1.5 text-stone-400 text-[11px] pt-1">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Profils vérifiés & chartes de bienveillance respectées</span>
      </div>
    </div>
  );
};
