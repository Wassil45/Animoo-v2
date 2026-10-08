export type Species = 'dog' | 'cat';

export interface Pet {
  id: string;
  name: string;
  age: number;
  species: Species;
  breed: string;
  distanceKm: number;
  locationName: string; // Zone approximative (ex: 'Paris 14e', 'Lyon Ouest') - Confidentialité : aucune coordonnée exacte ni adresse de domicile
  approximateArea?: string; // Libellé de zone floutée pour la protection de la vie privée
  gender: 'Mâle' | 'Femelle';
  sterilized: boolean;
  matchScore: number;
  temperamentTitle: string;
  temperamentDetail: string;
  photos: string[];
  tags: string[];
  bio: string;
  verified: boolean;
  vaccinesUpToDate: boolean;
  chipped: boolean;
  ownerName: string;
  ownerAge: number;
  ownerAvatar: string;
  ownerBio: string;
  favoriteParks: string[];
  hasLikedUser?: boolean;
}

export interface PlaydatePlan {
  id: string;
  parkName: string;
  dateStr: string;
  timeStr: string;
  activity: string;
  status: 'pending' | 'confirmed';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'pet';
  text: string;
  timestamp: string;
  playdateProposal?: PlaydatePlan;
}

export interface Conversation {
  id: string;
  pet: Pet;
  ownerName: string;
  ownerAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  tag: string;
  tagType: 'location' | 'energy' | 'indoor';
  messages: ChatMessage[];
}

export interface FilterOptions {
  species: 'all' | 'dog' | 'cat';
  maxDistanceKm: number;
  maxAge: number;
  minEnergy: 'all' | 'calm' | 'medium' | 'high';
  sterilizedOnly: boolean;
  verifiedOnly: boolean;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
  petName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AdminStats {
  totalPets: number;
  totalUsers: number;
  totalMatches: number;
  totalFavorites: number;
  totalConversations: number;
}

