import React, { useState } from 'react';
import { Pet } from '../types';
import { Sparkles, MessageSquare, RefreshCw, Send, CheckCircle2, Zap, Heart } from 'lucide-react';

interface AnimatchModalProps {
  userPet: Pet;
  matchedPet: Pet;
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (pet: Pet, initialMessage?: string) => void;
}

export const AnimatchModal: React.FC<AnimatchModalProps> = ({
  userPet,
  matchedPet,
  isOpen,
  onClose,
  onStartChat,
}) => {
  const [selectedIcebreaker, setSelectedIcebreaker] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const defaultIcebreakers = [
    `Wouf ! Chauds pour un tour au parc avec ${userPet.name} ce week-end ?`,
    `${userPet.name} adore courir après les bâtons, ${matchedPet.name} est partante ?`,
    `Quel est votre spot de balade favori dans le coin ?`,
  ];

  const handleSendIcebreaker = (text: string) => {
    setSelectedIcebreaker(text);
    setSentNotice('Message envoyé avec succès ! 🐾');
    setTimeout(() => {
      onStartChat(matchedPet, text);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-stone-50 via-white to-stone-50 rounded-[32px] p-5 shadow-2xl overflow-hidden border border-rose-100 my-auto text-stone-900">
        {/* Ambient Celebration Glows */}
        <div className="absolute -top-16 -left-12 w-48 h-48 rounded-full bg-rose-200/50 blur-3xl pointer-events-none" />
        <div className="absolute top-28 -right-12 w-48 h-48 rounded-full bg-purple-200/40 blur-3xl pointer-events-none" />

        {/* Floating Sparkles */}
        <div className="absolute top-5 left-5 text-rose-500 animate-pulse">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="absolute top-6 right-5 text-purple-500 animate-bounce">
          <Heart className="w-4 h-4 fill-current" />
        </div>

        {/* Top Header Badge */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100/80 text-primary font-bold text-xs uppercase tracking-wider mb-2">
            <span>🎉</span>
            <span>Playdate Connecté</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-1.5">
            <span>C'est un</span>
            <span className="bg-gradient-to-r from-primary to-[#FF5E62] bg-clip-text text-transparent">
              Animatch !
            </span>
            <span className="text-2xl">🐾</span>
          </h1>

          <p className="text-xs text-stone-500 mt-1 max-w-[260px] leading-relaxed">
            {userPet.name} & {matchedPet.name} ont envie de se rencontrer pour une folle session de jeu !
          </p>
        </div>

        {/* Overlapping Angled Cards Canvas */}
        <div className="relative w-full h-[230px] my-4 flex items-center justify-center">
          {/* Left Card: User Pet (Milo) */}
          <div className="absolute w-[145px] h-[195px] rounded-2xl overflow-hidden shadow-xl bg-stone-900 -translate-x-10 -rotate-8 border-2 border-white transition-transform hover:scale-105">
            <img
              src={userPet.photos[0]}
              alt={userPet.name}
              className="w-full h-full object-cover select-none"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
              <div className="flex items-center gap-1">
                <span className="font-bold text-base">{userPet.name}</span>
                <span className="text-xs text-white/80">, {userPet.age} ans</span>
              </div>
              <p className="text-[10px] text-white/70 truncate">{userPet.locationName}</p>
            </div>
            {/* Verified badge */}
            <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#E11D48] fill-[#E11D48]" />
            </div>
          </div>

          {/* Right Card: Matched Pet */}
          <div className="absolute w-[145px] h-[195px] rounded-2xl overflow-hidden shadow-xl bg-stone-900 translate-x-10 rotate-8 border-2 border-white transition-transform hover:scale-105">
            <img
              src={matchedPet.photos[0]}
              alt={matchedPet.name}
              className="w-full h-full object-cover select-none"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
              <div className="flex items-center gap-1">
                <span className="font-bold text-base">{matchedPet.name}</span>
                <span className="text-xs text-white/80">, {matchedPet.age} {matchedPet.age > 1 ? 'ans' : 'an'}</span>
              </div>
              <p className="text-[10px] text-white/70 truncate">{matchedPet.distanceKm} km • {matchedPet.locationName.split('•')[0]}</p>
            </div>
            {/* Verified badge */}
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5E62] fill-[#FF5E62]" />
            </div>
          </div>

          {/* Center Pulsing Heart Badge */}
          <div className="relative z-20 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-[#FF5E62] p-0.5 shadow-lg shadow-primary/40 animate-pulse flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative">
                <Heart className="w-7 h-7 text-[#E11D48] fill-[#E11D48]" />
                <span className="absolute bottom-1 right-1 text-xs">🐾</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compatibility Gauge Box */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-stone-100 mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-stone-800">Compatibilité Tempérament</span>
                <span className="text-[11px] text-stone-500">{matchedPet.temperamentDetail}</span>
              </div>
            </div>
            <span className="text-lg font-black text-primary">{matchedPet.matchScore}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-primary-500 to-[#FF5E62] transition-all duration-700"
              style={{ width: `${matchedPet.matchScore}%` }}
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {matchedPet.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Send First Sweet Word Section */}
        <div className="flex flex-col gap-1.5 mb-4 text-left">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-1 flex items-center justify-between">
            <span>Envoyer un premier mot doux 💬</span>
          </span>

          {sentNotice ? (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{sentNotice}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {defaultIcebreakers.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => handleSendIcebreaker(msg)}
                  className="w-full p-2.5 rounded-xl bg-stone-100/80 hover:bg-rose-50 text-left text-xs font-medium text-stone-700 hover:text-stone-900 active:scale-[0.98] transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-rose-200"
                >
                  <span className="truncate pr-2">"{msg}"</span>
                  <Send className="w-3.5 h-3.5 text-stone-400 group-hover:text-rose-600 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onStartChat(matchedPet)}
            className="w-full h-12 rounded-full bg-gradient-to-r from-primary to-[#FF5E62] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>Écrire à {matchedPet.name} & son maître</span>
          </button>

          <button
            onClick={onClose}
            className="w-full h-11 rounded-full bg-white text-stone-700 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-stone-100 active:scale-[0.98] transition-all border border-stone-200 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            <span>Continuer à chercher des copains</span>
          </button>
        </div>
      </div>
    </div>
  );
};
