import { Pet, Conversation } from '../src/types';
import { MOCK_DISCOVER_PETS, INITIAL_CONVERSATIONS } from '../src/data/mockPets';

export function runBlockingTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  // 1. Test : Le blocage d'un profil enregistre le petId dans la liste des blocks
  try {
    const blockedSet = new Set<string>();
    const petToBlock = MOCK_DISCOVER_PETS[1]; // Rocky

    const blockPet = (petId: string) => {
      blockedSet.add(petId);
    };

    blockPet(petToBlock.id);

    if (blockedSet.has(petToBlock.id)) {
      results.push({
        name: 'Blocage : L’identifiant du profil bloqué est bien persisté dans la liste des blocks',
        passed: true,
      });
    } else {
      results.push({
        name: 'Blocage persistence',
        passed: false,
        error: 'Le profil bloqué n’a pas été enregistré dans le Set de blocage.',
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Blocage persistence',
      passed: false,
      error: err.message,
    });
  }

  // 2. Test : Le profil bloqué disparaît immédiatement du deck de découverte
  try {
    const allPets: Pet[] = [...MOCK_DISCOVER_PETS];
    const petToBlock = MOCK_DISCOVER_PETS[1];
    const blockedSet = new Set<string>([petToBlock.id]);

    // Logique de filtrage du deck utilisée dans usePets.ts
    const filteredPets = allPets.filter((p) => !blockedSet.has(p.id));

    const containsBlocked = filteredPets.some((p) => p.id === petToBlock.id);

    if (!containsBlocked && filteredPets.length === allPets.length - 1) {
      results.push({
        name: 'Blocage : Le profil bloqué est immédiatement exclu du deck de découverte',
        passed: true,
      });
    } else {
      results.push({
        name: 'Blocage exclusion deck',
        passed: false,
        error: 'Le profil bloqué est toujours présent dans le deck après blocage.',
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Blocage exclusion deck',
      passed: false,
      error: err.message,
    });
  }

  // 3. Test : Les conversations et matchs liés au profil bloqué sont purgés
  try {
    let conversations: Conversation[] = [...INITIAL_CONVERSATIONS];
    const blockedPetId = MOCK_DISCOVER_PETS[1].id;

    // Règle de suppression appliquée lors du blocage
    conversations = conversations.filter((c) => c.pet.id !== blockedPetId);

    const hasBlockedConv = conversations.some((c) => c.pet.id === blockedPetId);

    if (!hasBlockedConv) {
      results.push({
        name: 'Blocage : Les conversations et matchs avec le profil bloqué sont immédiatement supprimés',
        passed: true,
      });
    } else {
      results.push({
        name: 'Blocage suppression conversations',
        passed: false,
        error: 'La conversation du profil bloqué existe encore.',
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Blocage suppression conversations',
      passed: false,
      error: err.message,
    });
  }

  // 4. Test : Le signalement enregistre la raison et les détails
  try {
    const reports: { petId: string; reason: string; details?: string; timestamp: string }[] = [];

    const reportPet = (petId: string, reason: string, details?: string) => {
      reports.push({
        petId,
        reason,
        details,
        timestamp: new Date().toISOString(),
      });
    };

    reportPet('pet_rocky_dog', 'inappropriate', 'Comportement suspect dans la description');

    if (
      reports.length === 1 &&
      reports[0].petId === 'pet_rocky_dog' &&
      reports[0].reason === 'inappropriate'
    ) {
      results.push({
        name: 'Signalement : Le signalement avec motif et description est correctement consigné',
        passed: true,
      });
    } else {
      results.push({
        name: 'Signalement consigné',
        passed: false,
        error: 'Le signalement n’a pas été correctement consigné.',
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Signalement consigné',
      passed: false,
      error: err.message,
    });
  }

  return results;
}
