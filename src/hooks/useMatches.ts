import { useState } from 'react';
import { Pet } from '../types';
import { MOCK_DISCOVER_PETS } from '../data/mockPets';

export function useMatches() {
  const [newMatches, setNewMatches] = useState<Pet[]>([
    MOCK_DISCOVER_PETS[0], // Nala (déjà matchée et réciproque)
  ]);

  const [matchesSubTab, setMatchesSubTab] = useState<'conversations' | 'favorites'>('conversations');

  const addMatch = (pet: Pet) => {
    setNewMatches((prev) => {
      if (prev.some((p) => p.id === pet.id)) return prev;
      return [pet, ...prev];
    });
  };

  const removeMatch = (petId: string) => {
    setNewMatches((prev) => prev.filter((p) => p.id !== petId));
  };

  return {
    newMatches,
    setNewMatches,
    matchesSubTab,
    setMatchesSubTab,
    addMatch,
    removeMatch,
  };
}
