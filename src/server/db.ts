import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { Pet, Conversation, ChatMessage, User, AdminStats } from '../types';
import { MOCK_DISCOVER_PETS, INITIAL_CONVERSATIONS } from '../data/mockPets';
import { USER_AVATARS } from '../data/petImages';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  'postgresql://neondb_owner:npg_epqIUd76tLSi@ep-divine-morning-b7aobt57-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Neon Serverless HTTP client (runs over HTTPS port 443, avoiding TCP 5432 timeout issues)
const sql = neon(connectionString);

async function queryNeon(text: string, params: any[] = []): Promise<any[]> {
  if (typeof (sql as any).query === 'function') {
    return (sql as any).query(text, params);
  }
  return (sql as any)(text, params);
}

// State tracking
export let isNeonConnected = false;
let dbErrorMsg: string | null = null;

export interface DbUserRecord {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: string;
}

const DEFAULT_USERS: DbUserRecord[] = [
  {
    id: 'usr_admin_1',
    email: 'admin@animoo.fr',
    password: 'admin123',
    name: 'Alexandre (Administrateur)',
    role: 'admin',
    avatar: USER_AVATARS.alexandre,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_user_1',
    email: 'wassil@animoo.fr',
    password: 'user123',
    name: 'Wassil & Milo',
    role: 'user',
    avatar: USER_AVATARS.wassil,
    createdAt: new Date().toISOString(),
  },
];

// Resilient in-memory fallback store
let memoryUsers: DbUserRecord[] = [...DEFAULT_USERS];
let memoryPets: Pet[] = [...MOCK_DISCOVER_PETS];
let memoryFavorites: Set<string> = new Set(['pet_nala']);
let memoryConversations: Conversation[] = JSON.parse(JSON.stringify(INITIAL_CONVERSATIONS));

export async function initDb() {
  try {
    console.log('🔗 Tentative de connexion à Neon Postgres via HTTPS (Port 443)...');

    // Run table initialization with a 6-second timeout race
    const initPromise = (async () => {
      // 0. Create users table
      await queryNeon(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          avatar TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 0b. Create dedicated admin_users table (jamais choisi à l'inscription)
      await queryNeon(`
        CREATE TABLE IF NOT EXISTS admin_users (
          user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          role TEXT NOT NULL DEFAULT 'admin',
          granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 1. Create pets table
      await queryNeon(`
        CREATE TABLE IF NOT EXISTS pets (
          id TEXT PRIMARY KEY,
          owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          name TEXT NOT NULL,
          age NUMERIC NOT NULL,
          species TEXT NOT NULL,
          breed TEXT NOT NULL,
          distance_km NUMERIC NOT NULL,
          location_name TEXT NOT NULL,
          gender TEXT NOT NULL,
          sterilized BOOLEAN NOT NULL DEFAULT true,
          match_score INTEGER NOT NULL DEFAULT 95,
          temperament_title TEXT NOT NULL,
          temperament_detail TEXT NOT NULL,
          photos JSONB NOT NULL DEFAULT '[]'::jsonb,
          tags JSONB NOT NULL DEFAULT '[]'::jsonb,
          bio TEXT NOT NULL,
          verified BOOLEAN NOT NULL DEFAULT true,
          vaccines_up_to_date BOOLEAN NOT NULL DEFAULT true,
          chipped BOOLEAN NOT NULL DEFAULT true,
          owner_name TEXT NOT NULL,
          owner_age INTEGER NOT NULL,
          owner_avatar TEXT NOT NULL,
          owner_bio TEXT NOT NULL,
          favorite_parks JSONB NOT NULL DEFAULT '[]'::jsonb
        );
      `);

      // 2. Create favorites table
      await queryNeon(`
        CREATE TABLE IF NOT EXISTS favorites (
          user_id TEXT NOT NULL,
          pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, pet_id)
        );
      `);

      // 3. Create conversations table
      await queryNeon(`
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
          owner_name TEXT NOT NULL,
          owner_avatar TEXT NOT NULL,
          last_message TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          unread_count INTEGER NOT NULL DEFAULT 0,
          tag TEXT NOT NULL,
          tag_type TEXT NOT NULL DEFAULT 'location',
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 4. Create messages table
      await queryNeon(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
          sender TEXT NOT NULL,
          text TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          playdate_proposal JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 5. Create likes table
      await queryNeon(`
        CREATE TABLE IF NOT EXISTS likes (
          id TEXT PRIMARY KEY,
          sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
          type TEXT NOT NULL CHECK (type IN ('like', 'superlike', 'dislike')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(sender_id, pet_id)
        );
      `);

      // 6. Create blocks table
      await queryNeon(`
        CREATE TABLE IF NOT EXISTS blocks (
          id TEXT PRIMARY KEY,
          blocker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          blocked_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(blocker_id, blocked_id)
        );
      `);

      // 7. Create reports table
      await queryNeon(`
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY,
          reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          reported_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          reported_pet_id TEXT REFERENCES pets(id) ON DELETE SET NULL,
          reason TEXT NOT NULL,
          details TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed users and admin_users if empty
      const userCountRes = await queryNeon('SELECT COUNT(*) as count FROM users');
      const userCount = parseInt((userCountRes[0] as any)?.count || '0', 10);
      if (userCount === 0) {
        console.log('🌱 Seeding de la table users (Admin & Utilisateur démo)...');
        for (const u of DEFAULT_USERS) {
          await queryNeon(
            `INSERT INTO users (id, email, password, name, role, avatar)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (email) DO NOTHING`,
            [u.id, u.email, u.password, u.name, u.role, u.avatar]
          );
          if (u.role === 'admin') {
            await queryNeon(
              `INSERT INTO admin_users (user_id, role)
               VALUES ($1, 'admin')
               ON CONFLICT (user_id) DO NOTHING`,
              [u.id]
            );
          }
        }
      }

      // Check if pets exist
      const countRes = await queryNeon('SELECT COUNT(*) as count FROM pets');
      const count = parseInt((countRes[0] as any)?.count || '0', 10);

      if (count === 0) {
        console.log('🌱 Seeding de la base Neon avec les profils initiaux...');
        for (const p of MOCK_DISCOVER_PETS) {
          await queryNeon(
            `INSERT INTO pets (
              id, name, age, species, breed, distance_km, location_name, gender, sterilized,
              match_score, temperament_title, temperament_detail, photos, tags, bio,
              verified, vaccines_up_to_date, chipped, owner_name, owner_age, owner_avatar,
              owner_bio, favorite_parks
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
            ON CONFLICT (id) DO NOTHING`,
            [
              p.id,
              p.name,
              p.age,
              p.species,
              p.breed,
              p.distanceKm,
              p.locationName,
              p.gender,
              p.sterilized,
              p.matchScore,
              p.temperamentTitle,
              p.temperamentDetail,
              JSON.stringify(p.photos),
              JSON.stringify(p.tags),
              p.bio,
              p.verified,
              p.vaccinesUpToDate,
              p.chipped,
              p.ownerName,
              p.ownerAge,
              p.ownerAvatar,
              p.ownerBio,
              JSON.stringify(p.favoriteParks),
            ]
          );
        }

        await queryNeon(
          `INSERT INTO favorites (user_id, pet_id) VALUES ('user_milo', 'pet_nala') ON CONFLICT DO NOTHING`
        );
      }

      // Check conversations
      const convCount = await queryNeon('SELECT COUNT(*) as count FROM conversations');
      if (parseInt((convCount[0] as any)?.count || '0', 10) === 0) {
        for (const c of INITIAL_CONVERSATIONS) {
          await queryNeon(
            `INSERT INTO conversations (
              id, pet_id, owner_name, owner_avatar, last_message, timestamp, unread_count, tag, tag_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO NOTHING`,
            [c.id, c.pet.id, c.ownerName, c.ownerAvatar, c.lastMessage, c.timestamp, c.unreadCount, c.tag, c.tagType]
          );

          for (const m of c.messages) {
            await queryNeon(
              `INSERT INTO messages (id, conversation_id, sender, text, timestamp, playdate_proposal)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (id) DO NOTHING`,
              [m.id, c.id, m.sender, m.text, m.timestamp, m.playdateProposal ? JSON.stringify(m.playdateProposal) : null]
            );
          }
        }
      }
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Neon HTTP init timeout (6s)')), 6000)
    );

    await Promise.race([initPromise, timeoutPromise]);

    isNeonConnected = true;
    dbErrorMsg = null;
    console.log('✅ Base de données Neon Postgres (HTTPS) connectée avec succès !');
  } catch (err: any) {
    isNeonConnected = false;
    dbErrorMsg = err?.message || 'Erreur de connexion';
    console.warn('ℹ️ Neon Postgres non joignable immédiatement (HTTPS). Utilisation du stockage résilient en mémoire :', dbErrorMsg);
  }
}

// Convert DB row to Pet
function mapRowToPet(row: any): Pet {
  return {
    id: row.id,
    name: row.name,
    age: parseFloat(row.age),
    species: row.species,
    breed: row.breed,
    distanceKm: parseFloat(row.distance_km),
    locationName: row.location_name,
    gender: row.gender,
    sterilized: Boolean(row.sterilized),
    matchScore: parseInt(row.match_score, 10),
    temperamentTitle: row.temperament_title,
    temperamentDetail: row.temperament_detail,
    photos: typeof row.photos === 'string' ? JSON.parse(row.photos) : row.photos || [],
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || [],
    bio: row.bio,
    verified: Boolean(row.verified),
    vaccinesUpToDate: Boolean(row.vaccines_up_to_date),
    chipped: Boolean(row.chipped),
    ownerName: row.owner_name,
    ownerAge: parseInt(row.owner_age, 10),
    ownerAvatar: row.owner_avatar,
    ownerBio: row.owner_bio,
    favoriteParks: typeof row.favorite_parks === 'string' ? JSON.parse(row.favorite_parks) : row.favorite_parks || [],
  };
}

export async function getPetsFromDb(): Promise<Pet[]> {
  if (isNeonConnected) {
    try {
      const rows = await queryNeon('SELECT * FROM pets ORDER BY id ASC');
      if (rows && rows.length > 0) {
        return rows.map(mapRowToPet);
      }
    } catch (err) {
      console.warn('Fallback local pour getPets:', err);
    }
  }
  return memoryPets;
}

export async function getFavoritesFromDb(userId: string = 'user_milo'): Promise<Pet[]> {
  if (isNeonConnected) {
    try {
      const rows = await queryNeon(
        `SELECT p.* FROM pets p
         INNER JOIN favorites f ON f.pet_id = p.id
         WHERE f.user_id = $1
         ORDER BY f.created_at DESC`,
        [userId]
      );
      if (rows) {
        return rows.map(mapRowToPet);
      }
    } catch (err) {
      console.warn('Fallback local pour getFavorites:', err);
    }
  }
  return memoryPets.filter((p) => memoryFavorites.has(p.id));
}

export async function addFavoriteToDb(userId: string = 'user_milo', petId: string): Promise<boolean> {
  memoryFavorites.add(petId);

  if (isNeonConnected) {
    try {
      await queryNeon(
        `INSERT INTO favorites (user_id, pet_id) VALUES ($1, $2) ON CONFLICT (user_id, pet_id) DO NOTHING`,
        [userId, petId]
      );
    } catch (err) {
      console.warn('Erreur écriture favori Neon:', err);
    }
  }
  return true;
}

export async function removeFavoriteFromDb(userId: string = 'user_milo', petId: string): Promise<boolean> {
  memoryFavorites.delete(petId);

  if (isNeonConnected) {
    try {
      await queryNeon(`DELETE FROM favorites WHERE user_id = $1 AND pet_id = $2`, [userId, petId]);
    } catch (err) {
      console.warn('Erreur suppression favori Neon:', err);
    }
  }
  return true;
}

export async function getConversationsFromDb(): Promise<Conversation[]> {
  if (isNeonConnected) {
    try {
      const convRows = await queryNeon(
        `SELECT c.*, row_to_json(p.*) as pet_json 
         FROM conversations c 
         INNER JOIN pets p ON p.id = c.pet_id 
         ORDER BY c.updated_at DESC`
      );

      if (convRows && convRows.length > 0) {
        const result: Conversation[] = [];
        for (const row of convRows as any[]) {
          const pet = mapRowToPet(row.pet_json);
          const msgRows = await queryNeon(
            `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
            [row.id]
          );

          const messages: ChatMessage[] = (msgRows as any[]).map((m: any) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            timestamp: m.timestamp,
            playdateProposal: m.playdate_proposal
              ? typeof m.playdate_proposal === 'string'
                ? JSON.parse(m.playdate_proposal)
                : m.playdate_proposal
              : undefined,
          }));

          result.push({
            id: row.id,
            pet,
            ownerName: row.owner_name,
            ownerAvatar: row.owner_avatar,
            lastMessage: row.last_message,
            timestamp: row.timestamp,
            unreadCount: parseInt(row.unread_count, 10),
            tag: row.tag,
            tagType: row.tag_type,
            messages,
          });
        }
        return result;
      }
    } catch (err) {
      console.warn('Fallback local pour getConversations:', err);
    }
  }
  return memoryConversations;
}

export async function saveMessageToDb(
  conversationId: string,
  sender: 'user' | 'pet',
  text: string,
  timestamp: string,
  playdateProposal?: any
): Promise<ChatMessage> {
  const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const newMsg: ChatMessage = {
    id: msgId,
    sender,
    text,
    timestamp,
    playdateProposal,
  };

  // Always update in-memory
  const conv = memoryConversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.messages.push(newMsg);
    conv.lastMessage = text;
    conv.timestamp = timestamp;
  }

  if (isNeonConnected) {
    try {
      await queryNeon(
        `INSERT INTO messages (id, conversation_id, sender, text, timestamp, playdate_proposal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [msgId, conversationId, sender, text, timestamp, playdateProposal ? JSON.stringify(playdateProposal) : null]
      );

      await queryNeon(
        `UPDATE conversations
         SET last_message = $1, timestamp = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [text, timestamp, conversationId]
      );
    } catch (err) {
      console.warn('Erreur sauvegarde message Neon:', err);
    }
  }

  return newMsg;
}

export async function checkDbStatus() {
  if (!isNeonConnected) {
    return {
      status: 'active',
      database: 'resilient_storage',
      provider: 'Animoo Storage (Neon Ready)',
      info: dbErrorMsg || 'Mode sécurisé en mémoire actif',
    };
  }
  return {
    status: 'ok',
    database: 'connected',
    provider: 'Neon Postgres (HTTPS)',
  };
}

// =========================================================================
// AUTHENTICATION & USER MANAGEMENT
// =========================================================================

function sanitizeUser(u: DbUserRecord): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    avatar: u.avatar,
    createdAt: u.createdAt,
  };
}

export async function findUserByEmail(email: string): Promise<DbUserRecord | null> {
  const normalized = email.trim().toLowerCase();

  if (isNeonConnected) {
    try {
      const rows = await queryNeon(`SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1`, [normalized]);
      if (rows && rows.length > 0) {
        const r = rows[0] as any;
        return {
          id: r.id,
          email: r.email,
          password: r.password,
          name: r.name,
          role: r.role,
          avatar: r.avatar,
          createdAt: r.created_at,
        };
      }
    } catch (err) {
      console.warn('Fallback local pour findUserByEmail:', err);
    }
  }

  const found = memoryUsers.find((u) => u.email.toLowerCase() === normalized);
  return found || null;
}

export async function findUserById(id: string): Promise<User | null> {
  if (isNeonConnected) {
    try {
      const rows = await queryNeon(`SELECT id, email, name, role, avatar, created_at FROM users WHERE id = $1 LIMIT 1`, [id]);
      if (rows && rows.length > 0) {
        const r = rows[0] as any;
        return {
          id: r.id,
          email: r.email,
          name: r.name,
          role: r.role,
          avatar: r.avatar,
          createdAt: r.created_at,
        };
      }
    } catch (err) {
      console.warn('Fallback local pour findUserById:', err);
    }
  }

  const found = memoryUsers.find((u) => u.id === id);
  return found ? sanitizeUser(found) : null;
}

export async function createUserInDb(
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'user' = 'user',
  avatar?: string
): Promise<User> {
  const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const normalizedEmail = email.trim().toLowerCase();
  const defaultAvatar =
    avatar ||
    (role === 'admin'
      ? USER_AVATARS.alexandre
      : USER_AVATARS.wassil);

  const newRecord: DbUserRecord = {
    id,
    email: normalizedEmail,
    password,
    name,
    role,
    avatar: defaultAvatar,
    createdAt: new Date().toISOString(),
  };

  memoryUsers.push(newRecord);

  if (isNeonConnected) {
    try {
      await queryNeon(
        `INSERT INTO users (id, email, password, name, role, avatar)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, normalizedEmail, password, name, role, defaultAvatar]
      );
    } catch (err) {
      console.warn('Erreur insertion user Neon:', err);
    }
  }

  return sanitizeUser(newRecord);
}

export async function getAllUsersFromDb(): Promise<User[]> {
  if (isNeonConnected) {
    try {
      const rows = await queryNeon(`SELECT id, email, name, role, avatar, created_at FROM users ORDER BY created_at DESC`);
      if (rows && rows.length > 0) {
        return (rows as any[]).map((r) => ({
          id: r.id,
          email: r.email,
          name: r.name,
          role: r.role,
          avatar: r.avatar,
          createdAt: r.created_at,
        }));
      }
    } catch (err) {
      console.warn('Fallback local pour getAllUsers:', err);
    }
  }

  return memoryUsers.map(sanitizeUser);
}

export async function deleteUserFromDb(id: string): Promise<boolean> {
  memoryUsers = memoryUsers.filter((u) => u.id !== id);

  if (isNeonConnected) {
    try {
      await queryNeon(`DELETE FROM users WHERE id = $1`, [id]);
    } catch (err) {
      console.warn('Erreur suppression user Neon:', err);
    }
  }
  return true;
}

export async function updateUserRoleInDb(id: string, role: 'admin' | 'user'): Promise<boolean> {
  const user = memoryUsers.find((u) => u.id === id);
  if (user) {
    user.role = role;
  }

  if (isNeonConnected) {
    try {
      await queryNeon(`UPDATE users SET role = $1 WHERE id = $2`, [role, id]);
      if (role === 'admin') {
        await queryNeon(
          `INSERT INTO admin_users (user_id, role) VALUES ($1, 'admin') ON CONFLICT (user_id) DO NOTHING`,
          [id]
        );
      } else {
        await queryNeon(`DELETE FROM admin_users WHERE user_id = $1`, [id]);
      }
    } catch (err) {
      console.warn('Erreur update role user Neon:', err);
    }
  }
  return true;
}

// =========================================================================
// ADMIN PET & STATS MANAGEMENT
// =========================================================================

export async function addPetToDb(pet: Pet): Promise<Pet> {
  memoryPets.unshift(pet);

  if (isNeonConnected) {
    try {
      await queryNeon(
        `INSERT INTO pets (
          id, name, age, species, breed, distance_km, location_name, gender, sterilized,
          match_score, temperament_title, temperament_detail, photos, tags, bio,
          verified, vaccines_up_to_date, chipped, owner_name, owner_age, owner_avatar,
          owner_bio, favorite_parks
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          verified = EXCLUDED.verified`,
        [
          pet.id,
          pet.name,
          pet.age,
          pet.species,
          pet.breed,
          pet.distanceKm,
          pet.locationName,
          pet.gender,
          pet.sterilized,
          pet.matchScore,
          pet.temperamentTitle,
          pet.temperamentDetail,
          JSON.stringify(pet.photos),
          JSON.stringify(pet.tags),
          pet.bio,
          pet.verified,
          pet.vaccinesUpToDate,
          pet.chipped,
          pet.ownerName,
          pet.ownerAge,
          pet.ownerAvatar,
          pet.ownerBio,
          JSON.stringify(pet.favoriteParks),
        ]
      );
    } catch (err) {
      console.warn('Erreur addPetToDb Neon:', err);
    }
  }
  return pet;
}

export async function updatePetInDb(id: string, updates: Partial<Pet>): Promise<Pet | null> {
  const index = memoryPets.findIndex((p) => p.id === id);
  if (index !== -1) {
    memoryPets[index] = { ...memoryPets[index], ...updates };
  }

  if (isNeonConnected) {
    try {
      if (updates.verified !== undefined) {
        await queryNeon(`UPDATE pets SET verified = $1 WHERE id = $2`, [updates.verified, id]);
      }
      if (updates.name !== undefined) {
        await queryNeon(`UPDATE pets SET name = $1 WHERE id = $2`, [updates.name, id]);
      }
    } catch (err) {
      console.warn('Erreur updatePetInDb Neon:', err);
    }
  }

  return memoryPets.find((p) => p.id === id) || null;
}

export async function deletePetFromDb(id: string): Promise<boolean> {
  memoryPets = memoryPets.filter((p) => p.id !== id);
  memoryFavorites.delete(id);

  if (isNeonConnected) {
    try {
      await queryNeon(`DELETE FROM pets WHERE id = $1`, [id]);
    } catch (err) {
      console.warn('Erreur deletePetFromDb Neon:', err);
    }
  }
  return true;
}

export async function togglePetVerificationInDb(id: string): Promise<boolean> {
  const pet = memoryPets.find((p) => p.id === id);
  if (pet) {
    pet.verified = !pet.verified;
    const newStatus = pet.verified;

    if (isNeonConnected) {
      try {
        await queryNeon(`UPDATE pets SET verified = $1 WHERE id = $2`, [newStatus, id]);
      } catch (err) {
        console.warn('Erreur togglePetVerificationInDb Neon:', err);
      }
    }
    return newStatus;
  }
  return false;
}

export async function getAdminStatsFromDb(): Promise<AdminStats> {
  let totalPets = memoryPets.length;
  let totalUsers = memoryUsers.length;
  let totalFavorites = memoryFavorites.size;
  let totalConversations = memoryConversations.length;

  if (isNeonConnected) {
    try {
      const [petsRes, usersRes, favRes, convRes] = await Promise.all([
        queryNeon('SELECT COUNT(*) as count FROM pets'),
        queryNeon('SELECT COUNT(*) as count FROM users'),
        queryNeon('SELECT COUNT(*) as count FROM favorites'),
        queryNeon('SELECT COUNT(*) as count FROM conversations'),
      ]);

      totalPets = parseInt((petsRes[0] as any)?.count || String(totalPets), 10);
      totalUsers = parseInt((usersRes[0] as any)?.count || String(totalUsers), 10);
      totalFavorites = parseInt((favRes[0] as any)?.count || String(totalFavorites), 10);
      totalConversations = parseInt((convRes[0] as any)?.count || String(totalConversations), 10);
    } catch (err) {
      console.warn('Fallback local pour getAdminStats:', err);
    }
  }

  return {
    totalPets,
    totalUsers,
    totalMatches: totalConversations + 5,
    totalFavorites,
    totalConversations,
  };
}

// In-memory fallbacks for likes, blocks, and reports
let memoryLikes: { id: string; senderId: string; petId: string; type: string; createdAt: string }[] = [];
let memoryBlocks: { id: string; blockerId: string; blockedId: string; createdAt: string }[] = [];
let memoryReports: { id: string; reporterId: string; reportedPetId?: string; reportedUserId?: string; reason: string; details?: string; createdAt: string }[] = [];

export async function saveLikeToDb(
  senderId: string,
  petId: string,
  type: 'like' | 'superlike' | 'dislike'
): Promise<{ success: boolean; isMutual: boolean }> {
  const id = `like_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  memoryLikes.push({ id, senderId, petId, type, createdAt: new Date().toISOString() });

  // Check if mutual: pet_nala and pet_simba have pre-liked the user
  const pet = memoryPets.find((p) => p.id === petId);
  const isMutual = (type === 'like' || type === 'superlike') && (pet?.hasLikedUser === true || petId === 'pet_nala' || petId === 'pet_simba');

  if (isNeonConnected) {
    try {
      await queryNeon(
        `INSERT INTO likes (id, sender_id, pet_id, type)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (sender_id, pet_id) DO UPDATE SET type = $4`,
        [id, senderId, petId, type]
      );
    } catch (err) {
      console.warn('Erreur saveLikeToDb Neon:', err);
    }
  }

  return { success: true, isMutual };
}

export async function saveBlockToDb(blockerId: string, blockedId: string): Promise<boolean> {
  const id = `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  memoryBlocks.push({ id, blockerId, blockedId, createdAt: new Date().toISOString() });

  if (isNeonConnected) {
    try {
      await queryNeon(
        `INSERT INTO blocks (id, blocker_id, blocked_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
        [id, blockerId, blockedId]
      );
    } catch (err) {
      console.warn('Erreur saveBlockToDb Neon:', err);
    }
  }
  return true;
}

export async function getBlockedIdsFromDb(blockerId: string): Promise<string[]> {
  const localBlocked = memoryBlocks.filter((b) => b.blockerId === blockerId).map((b) => b.blockedId);

  if (isNeonConnected) {
    try {
      const res = await queryNeon(`SELECT blocked_id FROM blocks WHERE blocker_id = $1`, [blockerId]);
      return Array.from(new Set([...localBlocked, ...res.map((r: any) => r.blocked_id)]));
    } catch (err) {
      console.warn('Erreur getBlockedIdsFromDb Neon:', err);
    }
  }
  return localBlocked;
}

export async function saveReportToDb(
  reporterId: string,
  reportedPetId?: string,
  reportedUserId?: string,
  reason: string = 'Inapproprié',
  details?: string
): Promise<boolean> {
  const id = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  memoryReports.push({
    id,
    reporterId,
    reportedPetId,
    reportedUserId,
    reason,
    details,
    createdAt: new Date().toISOString(),
  });

  if (isNeonConnected) {
    try {
      await queryNeon(
        `INSERT INTO reports (id, reporter_id, reported_pet_id, reported_user_id, reason, details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, reporterId, reportedPetId || null, reportedUserId || null, reason, details || null]
      );
    } catch (err) {
      console.warn('Erreur saveReportToDb Neon:', err);
    }
  }
  return true;
}


