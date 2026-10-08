import React, { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { Modal, Button } from './ui';

interface PlaydateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishPlaydate: (plan: { park: string; date: string; time: string; theme: string }) => void;
}

export const PlaydateModal: React.FC<PlaydateModalProps> = ({
  isOpen,
  onClose,
  onPublishPlaydate,
}) => {
  const [park, setPark] = useState('Parc Montsouris (Paris 14e)');
  const [date, setDate] = useState('Ce samedi');
  const [time, setTime] = useState('11h00');
  const [theme, setTheme] = useState('Session balle & jeux 🎾');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      onPublishPlaydate({ park, date, time, theme });
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🐾</span>
          <span>Proposer une Sortie Animoo</span>
        </div>
      }
      subtitle="Organisez une rencontre canine ou féline avec les maîtres du quartier"
      maxWidth="sm"
    >
      {isSuccess ? (
        <div className="py-6 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-stone-900">Sortie Publiée !</h3>
          <p className="text-xs text-stone-500 max-w-[240px]">
            Les maîtres des environs ont été notifiés de votre playdate à {park} !
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">Lieu / Parc</label>
            <select
              value={park}
              onChange={(e) => setPark(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-stone-900"
            >
              <option value="Parc Montsouris (Paris 14e)">Parc Montsouris (Paris 14e)</option>
              <option value="Parc Monceau (Paris 8e)">Parc Monceau (Paris 8e)</option>
              <option value="Bois de Boulogne (Paris 16e)">Bois de Boulogne (Paris 16e)</option>
              <option value="Buttes-Chaumont (Paris 19e)">Buttes-Chaumont (Paris 19e)</option>
              <option value="Bois de Vincennes (Paris 12e)">Bois de Vincennes (Paris 12e)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Quand</label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-primary/20 text-stone-900"
              >
                <option value="Aujourd'hui">Aujourd'hui</option>
                <option value="Ce samedi">Ce samedi</option>
                <option value="Ce dimanche">Ce dimanche</option>
                <option value="Mercredi prochain">Mercredi prochain</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Heure</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-primary/20 text-stone-900"
              >
                <option value="09h30">09h30</option>
                <option value="11h00">11h00</option>
                <option value="15h00">15h00</option>
                <option value="17h30">17h30</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">Activité prévue</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-primary/20 text-stone-900"
            >
              <option value="Session balle & jeux 🎾">Session balle & jeux 🎾</option>
              <option value="Grande balade en forêt 🌲">Grande balade en forêt 🌲</option>
              <option value="Socialisation chiots & débutants 🐾">Socialisation chiots & débutants 🐾</option>
              <option value="Rencontre calme & sieste à l'ombre 🧺">Rencontre calme & sieste à l'ombre 🧺</option>
            </select>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            fullWidth
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="mt-2"
          >
            Publier la Sortie Playdate
          </Button>
        </form>
      )}
    </Modal>
  );
};
