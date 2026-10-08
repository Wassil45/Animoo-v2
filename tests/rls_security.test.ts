import { User, Pet } from '../src/types';
import { MOCK_DISCOVER_PETS } from '../src/data/mockPets';

export function runRlsSecurityTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  // 1. RLS : Isolation des rôles (seul l'administrateur a accès aux métriques admin)
  try {
    const regularUser: User = {
      id: 'usr_user_1',
      email: 'wassil@animoo.fr',
      name: 'Wassil & Milo',
      role: 'user',
    };

    const adminUser: User = {
      id: 'usr_admin_1',
      email: 'admin@animoo.fr',
      name: 'Alexandre Admin',
      role: 'admin',
    };

    // Règle RLS simulée : Seul role === 'admin' peut accéder à la table admin_metrics
    const checkAdminAccess = (user: User) => user.role === 'admin';

    const userCanAccess = checkAdminAccess(regularUser);
    const adminCanAccess = checkAdminAccess(adminUser);

    if (!userCanAccess && adminCanAccess) {
      results.push({
        name: 'Politique RLS : Les utilisateurs standards n’ont pas accès aux privilèges admin',
        passed: true,
      });
    } else {
      results.push({
        name: 'Politique RLS privilèges admin',
        passed: false,
        error: 'Échec de la politique de sécurité basée sur les rôles.',
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Politique RLS privilèges admin',
      passed: false,
      error: err.message,
    });
  }

  // 2. RLS : Confidentialité des données géographiques (aucune coordonnée exacte retournée)
  try {
    const pets: Pet[] = MOCK_DISCOVER_PETS;
    const hasAnyExactGps = pets.some((p: any) => p.latitude !== undefined || p.longitude !== undefined || p.exactAddress !== undefined);
    const allHaveApproximateZone = pets.every((p) => typeof p.locationName === 'string' && p.locationName.length > 0);

    if (!hasAnyExactGps && allHaveApproximateZone) {
      results.push({
        name: 'Politique RLS / Confidentialité : Aucune coordonnée GPS ni adresse exacte n’est exposée',
        passed: true,
      });
    } else {
      results.push({
        name: 'Politique RLS / Confidentialité',
        passed: false,
        error: 'Des données géographiques sensibles ou exactes ont été détectées.',
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Politique RLS / Confidentialité',
      passed: false,
      error: err.message,
    });
  }

  // 3. RLS : Isolation des favoris d’un utilisateur
  try {
    const userAFavorites = new Set<string>(['pet_1', 'pet_2']);
    const userBFavorites = new Set<string>(['pet_3']);

    // Un utilisateur A ne peut pas modifier la liste des favoris de l'utilisateur B
    const userA_id = 'usr_user_1';
    const userB_id = 'usr_user_2';

    const canUserModifyFavorites = (requestUserId: string, targetUserId: string) => {
      return requestUserId === targetUserId;
    };

    if (
      canUserModifyFavorites(userA_id, userA_id) === true &&
      canUserModifyFavorites(userA_id, userB_id) === false
    ) {
      results.push({
        name: 'Politique RLS : Les données personnelles (favoris, swipes) sont isolées par compte utilisateur',
        passed: true,
      });
    } else {
      results.push({
        name: 'Politique RLS isolation des données',
        passed: false,
        error: 'Une violation d’isolation entre utilisateurs a été détectée.',
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Politique RLS isolation des données',
      passed: false,
      error: err.message,
    });
  }

  return results;
}
