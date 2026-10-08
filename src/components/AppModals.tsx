import React from 'react';
import { Pet, User } from '../types';
import { AuthModal } from './AuthModal';
import { AnimatchModal } from './AnimatchModal';
import { ProfileDetailModal } from './ProfileDetailModal';
import { FilterModal } from './FilterModal';
import { PlaydateModal } from './PlaydateModal';
import { Toast } from './ui';

interface AppModalsProps {
  auth: {
    isOpen: boolean;
    onClose: () => void;
    onAuthSuccess: (u: User) => void;
    signIn: (e: string, p: string) => Promise<User>;
    signUp: (e: string, p: string, n: string) => Promise<User>;
  };
  pets: {
    userPet: Pet;
    animatchPet: Pet | null;
    setAnimatchPet: (p: Pet | null) => void;
    detailPet: Pet | null;
    setDetailPet: (p: Pet | null) => void;
    favorites: Pet[];
    handleToggleFavorite: (p: Pet) => void;
    handleSwipe: (dir: 'left' | 'right' | 'superlike') => void;
    isFilterModalOpen: boolean;
    setIsFilterModalOpen: (o: boolean) => void;
    filters: any;
    setFilters: (f: any) => void;
    isPlaydateModalOpen: boolean;
    setIsPlaydateModalOpen: (o: boolean) => void;
    handleBlockPet?: (petId: string) => Promise<void>;
    handleReportPet?: (petId: string, reason: string, details?: string) => Promise<void>;
  };
  onStartChat: (p: Pet) => void;
  onPublishPlaydate: (plan: { park: string; date: string; time: string; theme: string }) => void;
  toastMessage: string | null;
  onCloseToast: () => void;
}

export const AppModals: React.FC<AppModalsProps> = ({
  auth,
  pets,
  onStartChat,
  onPublishPlaydate,
  toastMessage,
  onCloseToast,
}) => {
  return (
    <>
      <AuthModal
        isOpen={auth.isOpen}
        onClose={auth.onClose}
        onAuthSuccess={auth.onAuthSuccess}
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
      />

      {pets.animatchPet && (
        <AnimatchModal
          userPet={pets.userPet}
          matchedPet={pets.animatchPet}
          isOpen={true}
          onClose={() => pets.setAnimatchPet(null)}
          onStartChat={(p) => {
            pets.setAnimatchPet(null);
            onStartChat(p);
          }}
        />
      )}

      {pets.detailPet && (
        <ProfileDetailModal
          pet={pets.detailPet}
          isOpen={true}
          isFavorite={pets.favorites.some((f) => f.id === pets.detailPet?.id)}
          onToggleFavorite={pets.handleToggleFavorite}
          onClose={() => pets.setDetailPet(null)}
          onLike={() => {
            pets.handleSwipe('right');
            pets.setDetailPet(null);
          }}
          onDislike={() => {
            pets.handleSwipe('left');
            pets.setDetailPet(null);
          }}
          onBlock={pets.handleBlockPet}
          onReport={pets.handleReportPet}
        />
      )}

      <FilterModal
        isOpen={pets.isFilterModalOpen}
        onClose={() => pets.setIsFilterModalOpen(false)}
        filters={pets.filters}
        onChangeFilters={pets.setFilters}
      />

      <PlaydateModal
        isOpen={pets.isPlaydateModalOpen}
        onClose={() => pets.setIsPlaydateModalOpen(false)}
        onPublishPlaydate={onPublishPlaydate}
      />

      <Toast message={toastMessage} onClose={onCloseToast} type="info" />
    </>
  );
};
