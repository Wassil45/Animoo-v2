import { useState, useEffect, useCallback } from 'react';
import { Pet, FilterOptions } from '../types';
import { CURRENT_USER_PET, MOCK_DISCOVER_PETS } from '../data/mockPets';
import {
  checkDbHealth,
  fetchPets,
  fetchFavorites,
  saveFavoriteToApi,
  deleteFavoriteFromApi,
  saveLikeApi,
  blockPetApi,
  getBlockedPetsApi,
  reportPetApi,
} from '../services/api';

export function usePets(
  onShowToast?: (msg: string) => void,
  onMutualMatch?: (pet: Pet) => void
) {
  const [dbStatus, setDbStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [discoverPets, setDiscoverPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Pet[]>([]);
  const [userPet, setUserPet] = useState<Pet>(CURRENT_USER_PET);
  const [isAvailableForPlaydates, setIsAvailableForPlaydates] = useState<boolean>(true);
  const [blockedPetIds, setBlockedPetIds] = useState<Set<string>>(new Set());

  // Swiping state
  const [category, setCategory] = useState<'all' | 'dog' | 'cat'>('dog');
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [swipeHistory, setSwipeHistory] = useState<
    { pet: Pet; direction: 'left' | 'right' | 'superlike' }[]
  >([]);

  // Modals state
  const [animatchPet, setAnimatchPet] = useState<Pet | null>(null);
  const [detailPet, setDetailPet] = useState<Pet | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isPlaydateModalOpen, setIsPlaydateModalOpen] = useState<boolean>(false);

  // Filters state
  const [filters, setFilters] = useState<FilterOptions>({
    species: 'all',
    maxDistanceKm: 8,
    maxAge: 8,
    minEnergy: 'all',
    sterilizedOnly: false,
    verifiedOnly: false,
  });

  const loadPetsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [health, petsData, favoritesData, blockedData] = await Promise.all([
        checkDbHealth(),
        fetchPets(),
        fetchFavorites('user_milo'),
        getBlockedPetsApi('usr_user_1'),
      ]);
      setDbStatus(health.status);
      setDiscoverPets(petsData || []);
      if (favoritesData) {
        setFavorites(favoritesData);
      }
      if (blockedData && blockedData.length > 0) {
        setBlockedPetIds(new Set(blockedData));
      }
    } catch (err: any) {
      console.error('Erreur chargement pets:', err);
      const msg = 'Erreur réseau : impossible de récupérer les profils depuis le serveur.';
      setError(msg);
      setDbStatus('offline');
      onShowToast?.(`⚠️ ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  // Initial load from Neon Postgres
  useEffect(() => {
    loadPetsData();
  }, [loadPetsData]);

  const handleRefreshPets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await fetchPets();
      setDiscoverPets(updated || []);
      onShowToast?.('✓ Profils actualisés');
    } catch (err: any) {
      const msg = 'Échec de l’actualisation réseau des profils.';
      setError(msg);
      onShowToast?.(`⚠️ ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  const handleToggleFavorite = useCallback(
    async (pet: Pet) => {
      const isCurrentlyFav = favorites.some((p) => p.id === pet.id);
      if (isCurrentlyFav) {
        setFavorites((prev) => prev.filter((p) => p.id !== pet.id));
        onShowToast?.(`💔 ${pet.name} retiré des favoris`);
        await deleteFavoriteFromApi(pet.id, 'user_milo');
      } else {
        setFavorites((prev) => [pet, ...prev]);
        onShowToast?.(`💖 ${pet.name} sauvegardé dans vos favoris !`);
        await saveFavoriteToApi(pet.id, 'user_milo');
      }
    },
    [favorites, onShowToast]
  );

  // Block a pet / owner
  const handleBlockPet = useCallback(
    async (petId: string) => {
      const pet = discoverPets.find((p) => p.id === petId) || favorites.find((p) => p.id === petId);
      const name = pet?.name || 'Ce profil';

      setBlockedPetIds((prev) => new Set([...prev, petId]));
      setFavorites((prev) => prev.filter((p) => p.id !== petId));
      if (detailPet?.id === petId) setDetailPet(null);

      onShowToast?.(`🚫 ${name} a été bloqué`);
      await blockPetApi(petId, 'usr_user_1');
    },
    [discoverPets, favorites, detailPet, onShowToast]
  );

  // Report a pet / owner
  const handleReportPet = useCallback(
    async (petId: string, reason: string, details?: string) => {
      await reportPetApi({
        reporterId: 'usr_user_1',
        reportedPetId: petId,
        reason,
        details,
      });
      onShowToast?.('⚠️ Signalement envoyé. Merci pour votre vigilance.');
    },
    [onShowToast]
  );

  // Filtered discovery pets (excluding blocked profiles)
  const filteredPets = discoverPets.filter((pet) => {
    if (blockedPetIds.has(pet.id)) return false;
    if (category === 'dog' && pet.species !== 'dog') return false;
    if (category === 'cat' && pet.species !== 'cat') return false;
    if (pet.distanceKm > filters.maxDistanceKm) return false;
    if (pet.age > filters.maxAge) return false;
    if (filters.sterilizedOnly && !pet.sterilized) return false;
    if (filters.verifiedOnly && !pet.verified) return false;
    return true;
  });

  // FIN DE DECK SANS BOUCLE : suppression du modulo % length
  const activePet = cardIndex < filteredPets.length ? filteredPets[cardIndex] : undefined;
  const nextPet = cardIndex + 1 < filteredPets.length ? filteredPets[cardIndex + 1] : undefined;

  const handleSwipe = useCallback(
    async (direction: 'left' | 'right' | 'superlike') => {
      if (!activePet) return;
      setSwipeHistory((prev) => [...prev, { pet: activePet, direction }]);

      // Persist like to DB
      const apiType: 'like' | 'superlike' | 'dislike' =
        direction === 'right' ? 'like' : direction === 'superlike' ? 'superlike' : 'dislike';
      saveLikeApi(activePet.id, apiType, 'usr_user_1').catch((err) =>
        console.warn('Erreur like API:', err)
      );

      if (direction === 'right' || direction === 'superlike') {
        // MATCH RÉEL : Uniquement si l'autre animal / maître a aussi liké notre profil !
        const isReciprocal = activePet.hasLikedUser === true;

        if (isReciprocal) {
          // Déclenche le match et la fête Animatch
          setAnimatchPet(activePet);
          onMutualMatch?.(activePet);
          if (direction === 'superlike') {
            onShowToast?.('⭐ Super-Paw réciproque ! Animatch !');
          }
        } else {
          // Like enregistré sans match immédiat
          if (direction === 'superlike') {
            onShowToast?.(`⭐ Super-Paw envoyé à ${activePet.name} !`);
          } else {
            onShowToast?.(`🐾 Coup de cœur envoyé à ${activePet.name} !`);
          }
        }
      }

      setCardIndex((prev) => prev + 1);
    },
    [activePet, onMutualMatch, onShowToast]
  );

  const handleUndo = useCallback(() => {
    if (swipeHistory.length === 0) return;
    const last = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory((prev) => prev.slice(0, -1));
    setCardIndex((prev) => Math.max(0, prev - 1));
    onShowToast?.(`↩️ Swipe sur ${last.pet.name} annulé`);
  }, [swipeHistory, onShowToast]);

  const handleBoost = useCallback(() => {
    onShowToast?.(`⚡ Profil de ${userPet.name} boosté pour 30 min dans votre quartier !`);
  }, [userPet.name, onShowToast]);

  return {
    dbStatus,
    discoverPets,
    setDiscoverPets,
    isLoading,
    error,
    favorites,
    setFavorites,
    userPet,
    setUserPet,
    isAvailableForPlaydates,
    setIsAvailableForPlaydates,
    blockedPetIds,
    category,
    setCategory,
    cardIndex,
    setCardIndex,
    swipeHistory,
    filteredPets,
    activePet,
    nextPet,
    animatchPet,
    setAnimatchPet,
    detailPet,
    setDetailPet,
    isFilterModalOpen,
    setIsFilterModalOpen,
    isPlaydateModalOpen,
    setIsPlaydateModalOpen,
    filters,
    setFilters,
    handleRefreshPets,
    handleToggleFavorite,
    handleBlockPet,
    handleReportPet,
    handleSwipe,
    handleUndo,
    handleBoost,
  };
}
