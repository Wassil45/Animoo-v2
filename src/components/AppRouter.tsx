import React from 'react';
import { Pet, Conversation, User } from '../types';
import { TabId } from './BottomNav';
import { HomeScreen } from './HomeScreen';
import { DiscoverScreen } from './DiscoverScreen';
import { MatchesScreen } from './MatchesScreen';
import { MessagesScreen } from './MessagesScreen';
import { ChatView } from './ChatView';
import { UserProfileScreen } from './UserProfileScreen';
import { AdminDashboard } from './AdminDashboard';

interface AppRouterProps {
  currentTab: TabId;
  isAdminOpen: boolean;
  currentUser: User | null;
  // Pets state & actions
  pets: {
    category: 'all' | 'dog' | 'cat';
    setCategory: (c: 'dog' | 'cat') => void;
    filters: { maxDistanceKm: number };
    activePet?: Pet;
    nextPet?: Pet;
    favorites: Pet[];
    discoverPets: Pet[];
    userPet: Pet;
    isLoading?: boolean;
    error?: string | null;
    isAvailableForPlaydates: boolean;
    setIsAvailableForPlaydates: (v: boolean) => void;
    setUserPet: (p: Pet) => void;
    setFilters: React.Dispatch<React.SetStateAction<any>>;
    setCardIndex: React.Dispatch<React.SetStateAction<number>>;
    handleToggleFavorite: (pet: Pet) => void;
    handleSwipe: (dir: 'left' | 'right' | 'superlike') => void;
    handleUndo: () => void;
    handleRefreshPets: () => Promise<void>;
    handleBlockPet: (petId: string) => Promise<void>;
    handleReportPet: (petId: string, reason: string, details?: string) => Promise<void>;
    setDetailPet: (p: Pet | null) => void;
    setIsFilterModalOpen: (open: boolean) => void;
    setIsPlaydateModalOpen: (open: boolean) => void;
    swipeHistoryLength: number;
  };
  // Matches state & actions
  matches: {
    newMatches: Pet[];
    addMatch: (pet: Pet) => void;
    removeMatch: (petId: string) => void;
  };
  // Chat state & actions
  chat: {
    conversations: Conversation[];
    isLoading?: boolean;
    error?: string | null;
    loadConversations?: () => Promise<void>;
    activeConversation?: Conversation;
    activeConversationId: string | null;
    setActiveConversationId: (id: string | null) => void;
    handleStartChatFromMatch: (pet: Pet) => string;
    handleSendMessage: (id: string, text: string, proposal?: any) => Promise<void>;
  };
  // Router actions
  router: {
    navigateTo: (tab: TabId) => void;
    openAdmin: () => void;
    closeAdmin: () => void;
    openAuth: () => void;
  };
  onLogout: () => void;
  onDeleteAccount?: () => void;
  onShowToast: (msg: string) => void;
}

export const AppRouter: React.FC<AppRouterProps> = ({
  currentTab,
  isAdminOpen,
  currentUser,
  pets,
  matches,
  chat,
  router,
  onLogout,
  onDeleteAccount,
  onShowToast,
}) => {
  if (isAdminOpen && currentUser?.role === 'admin') {
    return (
      <main className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
        <AdminDashboard
          currentUser={currentUser}
          pets={pets.discoverPets}
          onRefreshPets={pets.handleRefreshPets}
          onClose={router.closeAdmin}
          onLogout={onLogout}
        />
      </main>
    );
  }

  // Active full-screen chat conversation
  if (chat.activeConversation && !isAdminOpen) {
    return (
      <main className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
        <ChatView
          conversation={chat.activeConversation}
          onBack={() => chat.setActiveConversationId(null)}
          onSendMessage={chat.handleSendMessage}
          onBlock={pets.handleBlockPet}
          onReport={pets.handleReportPet}
        />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
      {/* 1. ONGLET ACCUEIL */}
      {currentTab === 'home' && (
        <HomeScreen
          userPet={pets.userPet}
          currentUser={currentUser}
          newMatches={matches.newMatches}
          onGoToDiscover={() => router.navigateTo('discover')}
          onGoToMatches={() => router.navigateTo('matches')}
          onOpenPlaydateModal={() => pets.setIsPlaydateModalOpen(true)}
          onOpenPetDetail={(p) => pets.setDetailPet(p)}
          isAvailableForPlaydates={pets.isAvailableForPlaydates}
          onToggleAvailability={(val) => {
            pets.setIsAvailableForPlaydates(val);
            onShowToast(val ? '✓ Vous êtes visible pour les playdates' : 'Compte en pause');
          }}
        />
      )}

      {/* 2. ONGLET DÉCOUVRIR */}
      {currentTab === 'discover' && (
        <DiscoverScreen
          category={pets.category}
          onCategoryChange={pets.setCategory}
          maxDistanceKm={pets.filters.maxDistanceKm}
          onOpenFilters={() => pets.setIsFilterModalOpen(true)}
          activePet={pets.activePet}
          nextPet={pets.nextPet}
          favorites={pets.favorites}
          isLoading={pets.isLoading}
          error={pets.error}
          onToggleFavorite={pets.handleToggleFavorite}
          onSwipe={pets.handleSwipe}
          onOpenDetails={(p) => pets.setDetailPet(p)}
          onResetDistance={() => {
            pets.setFilters((f: any) => ({ ...f, maxDistanceKm: 25 }));
            pets.setCardIndex(0);
          }}
          onUndo={pets.handleUndo}
          canUndo={pets.swipeHistoryLength > 0}
          onBlock={pets.handleBlockPet}
          onReport={pets.handleReportPet}
          onRetry={pets.handleRefreshPets}
        />
      )}

      {/* 3. ONGLET MATCHS (DÉDIÉ) */}
      {currentTab === 'matches' && (
        <MatchesScreen
          newMatchPets={matches.newMatches}
          favorites={pets.favorites}
          isLoading={pets.isLoading}
          error={pets.error}
          onOpenNewMatch={(pet) => {
            chat.handleStartChatFromMatch(pet);
            router.navigateTo('messages');
          }}
          onStartChatWithPet={(pet) => {
            chat.handleStartChatFromMatch(pet);
            router.navigateTo('messages');
          }}
          onOpenDetails={(pet) => pets.setDetailPet(pet)}
          onRemoveFavorite={(petId) => {
            const pet = pets.favorites.find((p) => p.id === petId);
            if (pet) pets.handleToggleFavorite(pet);
          }}
          onGoToDiscover={() => router.navigateTo('discover')}
          onRetry={pets.handleRefreshPets}
        />
      )}

      {/* 4. ONGLET MESSAGES (DÉDIÉ) */}
      {currentTab === 'messages' && (
        <MessagesScreen
          conversations={chat.conversations}
          isLoading={chat.isLoading}
          error={chat.error}
          onOpenConversation={(id) => chat.setActiveConversationId(id)}
          onCreatePlaydate={() => pets.setIsPlaydateModalOpen(true)}
          onGoToMatches={() => router.navigateTo('matches')}
          onRetry={chat.loadConversations}
        />
      )}

      {/* 5. ONGLET PROFIL */}
      {currentTab === 'profile' && (
        <UserProfileScreen
          userPet={pets.userPet}
          currentUser={currentUser}
          onUpdatePet={pets.setUserPet}
          onLogout={onLogout}
          onDeleteAccount={onDeleteAccount}
          onOpenAdmin={router.openAdmin}
          onOpenAuthModal={router.openAuth}
          isAvailableForPlaydates={pets.isAvailableForPlaydates}
          onToggleAvailability={pets.setIsAvailableForPlaydates}
        />
      )}
    </main>
  );
};
