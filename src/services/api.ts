import { Pet, Conversation, ChatMessage, PlaydatePlan, User, AdminStats, AuthResponse } from '../types';
import { MOCK_DISCOVER_PETS, INITIAL_CONVERSATIONS } from '../data/mockPets';

export interface DbStatus {
  status: 'connected' | 'offline' | 'checking';
  provider?: string;
  dbName?: string;
}

// Token helper
export function getStoredToken(): string | null {
  return localStorage.getItem('animoo_auth_token');
}

export function setStoredToken(token: string) {
  localStorage.setItem('animoo_auth_token', token);
}

export function clearStoredToken() {
  localStorage.removeItem('animoo_auth_token');
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function checkDbHealth(): Promise<DbStatus> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('API unreachable');
    const data = await res.json();
    return {
      status: data.database === 'connected' ? 'connected' : 'offline',
      provider: data.provider,
      dbName: data.dbName,
    };
  } catch {
    return { status: 'offline' };
  }
}

// =========================================================================
// AUTH API
// =========================================================================

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erreur lors de la connexion');
  }
  setStoredToken(data.token);
  return data;
}

export async function registerApi(
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'user' = 'user',
  avatar?: string
): Promise<AuthResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role, avatar }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erreur lors de l\'inscription');
  }
  setStoredToken(data.token);
  return data;
}

export async function fetchCurrentUserApi(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function logoutApi(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } finally {
    clearStoredToken();
  }
}

// =========================================================================
// ADMIN API
// =========================================================================

export async function fetchAdminStatsApi(): Promise<AdminStats> {
  try {
    const res = await fetch('/api/admin/stats', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return await res.json();
  } catch {
    return {
      totalPets: 8,
      totalUsers: 2,
      totalMatches: 7,
      totalFavorites: 4,
      totalConversations: 2,
    };
  }
}

export async function fetchAdminUsersApi(): Promise<User[]> {
  try {
    const res = await fetch('/api/admin/users', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  } catch {
    return [];
  }
}

export async function updateAdminUserRoleApi(id: string, role: 'admin' | 'user'): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ role }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteAdminUserApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminCreatePetApi(petData: Partial<Pet>): Promise<Pet | null> {
  try {
    const res = await fetch('/api/admin/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(petData),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.pet;
  } catch {
    return null;
  }
}

export async function adminUpdatePetApi(id: string, petData: Partial<Pet>): Promise<Pet | null> {
  try {
    const res = await fetch(`/api/admin/pets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(petData),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.pet;
  } catch {
    return null;
  }
}

export async function adminToggleVerifyPetApi(id: string): Promise<boolean | null> {
  try {
    const res = await fetch(`/api/admin/pets/${id}/verify`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.verified;
  } catch {
    return null;
  }
}

export async function adminDeletePetApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/pets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}


export async function fetchPets(): Promise<Pet[]> {
  try {
    const res = await fetch('/api/pets');
    if (!res.ok) throw new Error('Failed to fetch pets');
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : MOCK_DISCOVER_PETS;
  } catch (err) {
    console.warn('API /api/pets unavailable, using local data:', err);
    return MOCK_DISCOVER_PETS;
  }
}

export async function fetchFavorites(userId: string = 'user_milo'): Promise<Pet[]> {
  try {
    const res = await fetch(`/api/favorites?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch favorites');
    return await res.json();
  } catch (err) {
    console.warn('API /api/favorites unavailable, using local favorites:', err);
    return [MOCK_DISCOVER_PETS[0]];
  }
}

export async function saveFavoriteToApi(petId: string, userId: string = 'user_milo'): Promise<Pet[] | null> {
  try {
    const res = await fetch(`/api/favorites/${petId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to save favorite');
    const data = await res.json();
    return data.favorites;
  } catch (err) {
    console.warn('Failed to persist favorite to DB:', err);
    return null;
  }
}

export async function deleteFavoriteFromApi(petId: string, userId: string = 'user_milo'): Promise<Pet[] | null> {
  try {
    const res = await fetch(`/api/favorites/${petId}?userId=${userId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove favorite');
    const data = await res.json();
    return data.favorites;
  } catch (err) {
    console.warn('Failed to delete favorite from DB:', err);
    return null;
  }
}

export async function fetchConversations(): Promise<Conversation[]> {
  try {
    const res = await fetch('/api/conversations');
    if (!res.ok) throw new Error('Failed to fetch conversations');
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : INITIAL_CONVERSATIONS;
  } catch (err) {
    console.warn('API /api/conversations unavailable, using local conversations:', err);
    return INITIAL_CONVERSATIONS;
  }
}

export async function sendMessageToApi(
  conversationId: string,
  text: string,
  proposal?: PlaydatePlan
): Promise<ChatMessage | null> {
  try {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, proposal }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    const data = await res.json();
    return data.message;
  } catch (err) {
    console.warn('Failed to persist message to DB:', err);
    return null;
  }
}

export async function saveLikeApi(
  petId: string,
  type: 'like' | 'superlike' | 'dislike',
  userId: string = 'usr_user_1'
): Promise<{ success: boolean; isMutual: boolean }> {
  try {
    const res = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ petId, type, userId }),
    });
    if (!res.ok) throw new Error('Failed to save like');
    return await res.json();
  } catch (err) {
    console.warn('API /api/likes fallback:', err);
    return { success: true, isMutual: false };
  }
}

export async function blockPetApi(
  blockedId: string,
  blockerId: string = 'usr_user_1'
): Promise<boolean> {
  try {
    const res = await fetch('/api/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockerId, blockedId }),
    });
    return res.ok;
  } catch (err) {
    console.warn('API /api/blocks fallback:', err);
    return true;
  }
}

export async function getBlockedPetsApi(blockerId: string = 'usr_user_1'): Promise<string[]> {
  try {
    const res = await fetch(`/api/blocks?userId=${blockerId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.blockedIds) ? data.blockedIds : [];
  } catch (err) {
    console.warn('API /api/blocks get fallback:', err);
    return [];
  }
}

export async function reportPetApi(payload: {
  reporterId?: string;
  reportedPetId?: string;
  reportedUserId?: string;
  reason: string;
  details?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reporterId: payload.reporterId || 'usr_user_1',
        reportedPetId: payload.reportedPetId,
        reportedUserId: payload.reportedUserId,
        reason: payload.reason,
        details: payload.details,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('API /api/reports fallback:', err);
    return true;
  }
}

