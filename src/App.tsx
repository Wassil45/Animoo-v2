import React, { useState } from 'react';
import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { OnboardingScreen } from './components/OnboardingScreen';
import { AppRouter } from './components/AppRouter';
import { AppModals } from './components/AppModals';
import { useAuth } from './hooks/useAuth';
import { usePets } from './hooks/usePets';
import { useMatches } from './hooks/useMatches';
import { useChat } from './hooks/useChat';
import { useRouter } from './hooks/useRouter';
import { User, Pet } from './types';

export default function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => setToastMessage(msg);

  const { user: currentUser, setUser: setCurrentUser, signIn, signUp, signOut } = useAuth();
  const matches = useMatches();
  const chat = useChat();
  const pets = usePets(showToast, (matchedPet) => matches.addMatch(matchedPet));
  const router = useRouter('home');

  const handleBlockPet = async (petId: string) => {
    matches.removeMatch(petId);
    if (chat.activeConversation?.pet.id === petId) chat.setActiveConversationId(null);
    await pets.handleBlockPet(petId);
  };

  const handleLogout = async () => {
    await signOut();
    router.closeAdmin();
    router.openAuth();
    showToast('Déconnexion réussie.');
  };

  const handleDeleteAccount = async () => {
    await signOut();
    localStorage.clear();
    router.setHasOnboarded(false);
    showToast('✓ Votre compte et vos données ont été définitivement supprimés.');
  };

  const handleOpenFavorites = () => {
    chat.setActiveConversationId(null);
    router.navigateTo('matches');
  };

  return (
    <div className="min-h-screen bg-[#F6F3F1] flex flex-col items-center selection:bg-rose-100 selection:text-rose-600">
      <div className="w-full max-w-lg md:max-w-xl min-h-screen bg-[#FCF9F8] shadow-sm md:shadow-2xl flex flex-col relative border-x border-stone-200/60">
        {!router.hasOnboarded ? (
          <OnboardingScreen
            onComplete={async (data) => {
              pets.setUserPet(data.pet);
              pets.setCategory(data.pet.species === 'cat' ? 'cat' : 'dog');
              try {
                if (data.user.password) {
                  await signUp(data.user.email, data.user.password, data.user.name);
                }
              } catch (e) {
                console.warn('Compte créé localement:', e);
              }
              router.setHasOnboarded(true);
              router.navigateTo('home');
              showToast(`🐾 Bienvenue ${data.pet.name} & ${data.user.name} sur Animoo !`);
            }}
            onSkipToLogin={() => {
              router.setHasOnboarded(true);
              router.openAuth();
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col relative h-full overflow-hidden">
            {!chat.activeConversationId && !router.isAdminOpen && (
              <TopHeader
                onOpenFilter={() => pets.setIsFilterModalOpen(true)}
                onOpenProfile={() => router.navigateTo('profile')}
                onOpenFavorites={handleOpenFavorites}
                onOpenAdmin={router.openAdmin}
                onOpenAuth={router.openAuth}
                currentUser={currentUser}
                favoritesCount={pets.favorites.length}
                profileAvatarUrl={currentUser?.avatar || pets.userPet.photos[0]}
                isFilterActive={pets.filters.species !== 'all' || pets.filters.maxDistanceKm < 8}
                dbStatus={pets.dbStatus}
              />
            )}

            <AppRouter
              currentTab={router.currentTab}
              isAdminOpen={router.isAdminOpen}
              currentUser={currentUser}
              pets={{ ...pets, handleBlockPet, swipeHistoryLength: pets.swipeHistory.length }}
              matches={matches}
              chat={chat}
              router={router}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
              onShowToast={showToast}
            />

            {!chat.activeConversationId && !router.isAdminOpen && (
              <BottomNav
                currentTab={router.currentTab}
                onTabChange={(tab) => {
                  router.navigateTo(tab);
                  chat.setActiveConversationId(null);
                }}
                matchesCount={matches.newMatches.length}
                unreadChatsCount={chat.totalUnreadCount}
              />
            )}
          </div>
        )}

        <AppModals
          auth={{
            isOpen: router.isAuthOpen,
            onClose: router.closeAuth,
            onAuthSuccess: (u: User) => {
              setCurrentUser(u);
              showToast(u.role === 'admin' ? `👑 Admin connecté (${u.name})` : `🐾 Bienvenue ${u.name} !`);
            },
            signIn,
            signUp,
          }}
          pets={{ ...pets, handleBlockPet }}
          onStartChat={(p: Pet) => {
            chat.handleStartChatFromMatch(p);
            router.navigateTo('messages');
          }}
          onPublishPlaydate={(plan) => showToast(`🐾 Sortie publiée à ${plan.park} (${plan.date}) !`)}
          toastMessage={toastMessage}
          onCloseToast={() => setToastMessage(null)}
        />
      </div>
    </div>
  );
}
