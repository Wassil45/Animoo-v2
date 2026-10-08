import React, { useState } from 'react';
import { Pet, User } from '../types';
import {
  Camera,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  Shield,
  Download,
  Trash2,
  MapPin,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { AnimooLogo } from './AnimooLogo';
import { Button, Input, Badge, Toast, Modal } from './ui';

interface UserProfileScreenProps {
  userPet: Pet;
  currentUser?: User | null;
  onUpdatePet: (updated: Pet) => void;
  onLogout: () => void;
  onDeleteAccount?: () => void;
  onOpenAdmin?: () => void;
  onOpenAuthModal?: () => void;
  isAvailableForPlaydates: boolean;
  onToggleAvailability: (available: boolean) => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  userPet,
  currentUser,
  onUpdatePet,
  onLogout,
  onDeleteAccount,
  onOpenAdmin,
  onOpenAuthModal,
  isAvailableForPlaydates,
  onToggleAvailability,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [petBio, setPetBio] = useState(userPet.bio);
  const [petName, setPetName] = useState(userPet.name);
  const [petLocation, setPetLocation] = useState(userPet.locationName);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSave = () => {
    onUpdatePet({
      ...userPet,
      name: petName.trim() || userPet.name,
      bio: petBio.trim() || userPet.bio,
      locationName: petLocation.trim() || userPet.locationName,
    });
    setIsEditing(false);
    setToastMsg(`Profil de ${petName} mis à jour avec succès !`);
  };

  // Export RGPD compliant user data in JSON format
  const handleExportData = () => {
    const exportPayload = {
      app: 'Animoo',
      version: '1.0.0',
      rgpdNotice:
        'Conformément à l’article 20 du RGPD (Droit à la portabilité des données), ce fichier contient l’ensemble des données associées à votre profil.',
      exportDate: new Date().toISOString(),
      user: {
        id: currentUser?.id || 'usr_local',
        email: currentUser?.email || 'utilisateur@animoo.fr',
        name: currentUser?.name || userPet.ownerName,
        role: currentUser?.role || 'user',
        createdAt: currentUser?.createdAt || new Date().toISOString(),
      },
      pet: {
        id: userPet.id,
        name: userPet.name,
        species: userPet.species,
        breed: userPet.breed,
        age: userPet.age,
        approximateZone: userPet.locationName,
        gender: userPet.gender,
        sterilized: userPet.sterilized,
        tags: userPet.tags,
        bio: userPet.bio,
        favoriteParks: userPet.favoriteParks,
      },
      confidentialityGuarantees: {
        exactLocationExposed: false,
        gpsCoordinatesExposed: false,
        policy: 'Seules les zones géographiques approximatives sont partagées avec les membres.',
      },
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `animoo_export_donnees_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMsg('✓ Export de vos données personnelles (RGPD) téléchargé.');
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false);
    if (onDeleteAccount) {
      onDeleteAccount();
    } else {
      localStorage.clear();
      onLogout();
    }
  };

  return (
    <div className="flex flex-col w-full pb-24 text-stone-900 select-none">
      {/* Top Banner & Header */}
      <div className="relative w-full h-44 bg-gradient-to-tr from-primary via-primary-500 to-[#FF5E62] p-4 flex flex-col justify-between text-white">
        <div className="flex items-center justify-between">
          <AnimooLogo size="sm" variant="wordmark" className="text-white" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-white bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full border-none"
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </Button>
        </div>

        {/* Floating availability indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-xs font-semibold">
            <span
              className={`w-2 h-2 rounded-full ${
                isAvailableForPlaydates ? 'bg-emerald-400 animate-pulse' : 'bg-stone-300'
              }`}
            />
            <span>{isAvailableForPlaydates ? 'En quête de playdates' : 'En pause'}</span>
          </div>
        </div>
      </div>

      {/* Profile Main Card */}
      <div className="px-4 -mt-12">
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-stone-100 flex flex-col gap-4">
          {/* Avatar & Basic Identity */}
          <div className="flex items-start justify-between">
            <div className="relative -mt-12">
              <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl bg-stone-900">
                <img
                  src={userPet.photos[0]}
                  alt={userPet.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={96}
                  height={96}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setToastMsg("📷 Vous pouvez changer les photos de votre animal lors de l'onboarding ou via le profil.")
                }
                aria-label="Modifier la photo"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary-hover transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-end pt-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Compte Vérifié
              </span>
              <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs mt-0.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Passeport Canin Validé</span>
              </div>
            </div>
          </div>

          {/* Name & Breed */}
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <Input
                label="Nom du compagnon"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
              />

              <div>
                <Input
                  label="Zone approximative (ex: Paris 14e, Lyon Centre)"
                  value={petLocation}
                  onChange={(e) => setPetLocation(e.target.value)}
                  placeholder="Ex: Paris 14e, Boulogne..."
                />
                <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Confidentialité : aucune coordonnée exacte ni adresse n'est jamais exposée.</span>
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Bio & Habitudes de jeu
                </label>
                <textarea
                  value={petBio}
                  onChange={(e) => setPetBio(e.target.value)}
                  rows={3}
                  className="w-full text-base bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-stone-900"
                />
              </div>

              <Button onClick={handleSave} variant="primary" fullWidth>
                Sauvegarder les modifications
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-stone-900">
                  {userPet.name}, {userPet.age} ans
                </h1>
                <CheckCircle2 className="w-5 h-5 text-primary fill-primary" />
              </div>

              {/* Confidentiality-preserving location */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{userPet.locationName}</span>
                <span className="text-[10px] font-normal text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                  Zone approximative
                </span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed mt-2.5 bg-stone-50 p-3 rounded-2xl border border-stone-100">
                "{userPet.bio}"
              </p>
            </div>
          )}

          {/* Photos Reel */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Galerie de photos ({userPet.photos.length})
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {userPet.photos.map((ph, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden shadow-sm bg-stone-100"
                >
                  <img
                    src={ph}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={100}
                    height={100}
                  />
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 text-[9px] bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-md font-bold">
                      Principale
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
              Traits de caractère
            </span>
            <div className="flex flex-wrap gap-1.5">
              {userPet.tags.map((t, i) => (
                <Badge key={i} variant="primary">
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          {/* Availability Toggle Box */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-800 block">
                Disponibilité playdates
              </span>
              <span className="text-[11px] text-stone-500">
                Activez pour apparaître dans le quartier
              </span>
            </div>
            <button
              type="button"
              aria-label="Basculer la disponibilité playdates"
              onClick={() => onToggleAvailability(!isAvailableForPlaydates)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer ${
                isAvailableForPlaydates ? 'bg-primary' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  isAvailableForPlaydates ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* If Admin: Quick Admin Gateway */}
          {currentUser?.role === 'admin' && onOpenAdmin && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-700 fill-amber-700" />
                  <span className="text-xs font-extrabold text-amber-900">
                    Espace Administrateur
                  </span>
                </div>
                <Badge variant="warning" size="sm">
                  Accès Total
                </Badge>
              </div>
              <p className="text-[11px] text-amber-800 mb-2.5">
                Vous avez les permissions pour gérer tous les animaux, modérer les utilisateurs et inspecter la base Neon Postgres.
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={onOpenAdmin}
                leftIcon={<Shield className="w-3.5 h-3.5" />}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Ouvrir le portail d'administration
              </Button>
            </div>
          )}

          {/* Owner details */}
          <div className="border-t border-stone-100 pt-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
              Compte utilisateur connecté
            </span>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={currentUser?.avatar || userPet.ownerAvatar}
                  alt={currentUser?.name || userPet.ownerName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-stone-200 shrink-0"
                  loading="lazy"
                  width={48}
                  height={48}
                />
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 truncate">
                    <span>{currentUser?.name || userPet.ownerName}</span>
                    {currentUser?.role === 'admin' && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-extrabold shrink-0">
                        ADMIN
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-stone-500 truncate">
                    {currentUser?.email || 'wassil@animoo.fr'}
                  </p>
                </div>
              </div>

              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer shrink-0"
                >
                  Changer
                </button>
              )}
            </div>
          </div>

          {/* Section: Confidentialité, RGPD & Données personnelles */}
          <div className="border-t border-stone-100 pt-3 flex flex-col gap-2.5">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
              Confidentialité & Droits RGPD
            </span>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs text-stone-600 space-y-1">
              <p className="flex items-center gap-1.5 font-semibold text-stone-800">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vos données sont strictement protégées</span>
              </p>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Aucune coordonnée GPS exacte, adresse postale ou donnée privée n'est exposée sur la plateforme.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              {/* Export RGPD */}
              <button
                type="button"
                onClick={handleExportData}
                className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exporter mes données</span>
              </button>

              {/* Supprimer le compte */}
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Supprimer mon compte</span>
              </button>
            </div>
          </div>

          {/* Logout button */}
          <Button
            onClick={onLogout}
            variant="outline"
            fullWidth
            leftIcon={<LogOut className="w-4 h-4" />}
            className="border-rose-200 text-primary hover:bg-rose-50 mt-1"
          >
            Se déconnecter
          </Button>
        </div>
      </div>

      {/* Confirmation Modal for Account Deletion */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer mon compte et mes données"
      >
        <div className="flex flex-col gap-4 text-stone-800">
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="block font-bold">Action irréversible (RGPD Art. 17) :</strong>
              Toutes vos informations de compte, le profil de {userPet.name}, vos photos, favoris, conversations et matchs seront définitivement supprimés.
            </div>
          </div>

          <p className="text-xs text-stone-600">
            Êtes-vous certain de vouloir clôturer votre compte Animoo ? Vous pouvez au préalable exporter vos données si vous le souhaitez.
          </p>

          <div className="flex gap-2.5 pt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleConfirmDelete}
            >
              Confirmer la suppression
            </Button>
          </div>
        </div>
      </Modal>

      <Toast message={toastMsg} onClose={() => setToastMsg(null)} type="success" />
    </div>
  );
};
