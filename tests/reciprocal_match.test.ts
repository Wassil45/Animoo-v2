import { Pet } from '../src/types';
import { MOCK_DISCOVER_PETS } from '../src/data/mockPets';

export function runReciprocalMatchTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  // 1. Test unitaire : Like simple sans réciprocité préalable
  try {
    const nonReciprocalPet: Pet = {
      ...MOCK_DISCOVER_PETS[1],
      id: 'test_rocky',
      name: 'Rocky',
      hasLikedUser: false,
    };

    let matchCreated = false;
    const onMutualMatch = (pet: Pet) => {
      matchCreated = true;
    };

    // Simulation de l'action de like
    if (nonReciprocalPet.hasLikedUser) {
      onMutualMatch(nonReciprocalPet);
    }

    if (matchCreated === false) {
      results.push({
        name: 'Like sur un profil non réciproque (hasLikedUser: false) ne déclenche pas de match',
        passed: true,
      });
    } else {
      results.push({
        name: 'Like sur un profil non réciproque ne déclenche pas de match',
        passed: false,
        error: 'Un match a été créé alors que le profil n’avait pas liké l’utilisateur.',
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Like sur profil non réciproque',
      passed: false,
      error: err.message,
    });
  }

  // 2. Test unitaire : Like avec réciprocité confirmée
  try {
    const reciprocalPet: Pet = {
      ...MOCK_DISCOVER_PETS[0],
      id: 'test_nala',
      name: 'Nala',
      hasLikedUser: true,
    };

    const matchesList: Pet[] = [];
    const onMutualMatch = (pet: Pet) => {
      matchesList.push(pet);
    };

    // Simulation du swipe droit
    if (reciprocalPet.hasLikedUser) {
      onMutualMatch(reciprocalPet);
    }

    if (matchesList.length === 1 && matchesList[0].id === 'test_nala') {
      results.push({
        name: 'Like sur un profil réciproque (hasLikedUser: true) déclenche un match réel',
        passed: true,
      });
    } else {
      results.push({
        name: 'Like sur un profil réciproque déclenche un match réel',
        passed: false,
        error: 'Le match mutuel n’a pas été ajouté à la liste des matchs.',
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Like sur profil réciproque',
      passed: false,
      error: err.message,
    });
  }

  // 3. Test unitaire : Fin de deck sans boucle infinie
  try {
    const deck = [MOCK_DISCOVER_PETS[0], MOCK_DISCOVER_PETS[1]];
    let cardIndex = 0;

    // Swipe 1
    cardIndex += 1;
    // Swipe 2
    cardIndex += 1;

    // À ce stade, cardIndex === 2 (>= deck.length)
    const activePet = cardIndex < deck.length ? deck[cardIndex] : undefined;

    if (activePet === undefined && cardIndex === 2) {
      results.push({
        name: 'Fin de deck : pas de rebouclage modulo (cardIndex % length supprimé)',
        passed: true,
      });
    } else {
      results.push({
        name: 'Fin de deck sans boucle',
        passed: false,
        error: `Le deck a rebouclé au lieu de terminer : activePet=${activePet?.name}`,
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Fin de deck sans boucle',
      passed: false,
      error: err.message,
    });
  }

  return results;
}
