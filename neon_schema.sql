-- ==============================================================================
-- ANIMOO - SCHEMA DE BASE DE DONNÉES VERCEL POSTGRES / NEON
-- Fichier : neon_schema.sql
-- ==============================================================================

-- 1. Table des utilisateurs (profils maîtres)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Table dédiée pour les administrateurs (jamais attribuable à l'inscription)
CREATE TABLE IF NOT EXISTS admin_users (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table des animaux (profils découverte)
CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  age NUMERIC NOT NULL,
  species TEXT NOT NULL,
  breed TEXT NOT NULL,
  distance_km NUMERIC NOT NULL DEFAULT 2.5,
  location_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  sterilized BOOLEAN NOT NULL DEFAULT true,
  match_score INTEGER NOT NULL DEFAULT 95,
  temperament_title TEXT NOT NULL,
  temperament_detail TEXT NOT NULL,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  bio TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  vaccines_up_to_date BOOLEAN NOT NULL DEFAULT true,
  chipped BOOLEAN NOT NULL DEFAULT true,
  owner_name TEXT NOT NULL,
  owner_age INTEGER NOT NULL,
  owner_avatar TEXT NOT NULL,
  owner_bio TEXT NOT NULL,
  favorite_parks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);

-- 4. Table des favoris
CREATE TABLE IF NOT EXISTS favorites (
  user_id TEXT NOT NULL,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, pet_id)
);

-- 5. Table des likes & dislikes (historique swipe)
CREATE TABLE IF NOT EXISTS likes (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'superlike', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sender_id, pet_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_sender ON likes(sender_id);

-- 6. Table des conversations & matches
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

-- 7. Table des messages & invitations playdates
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  playdate_proposal JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);

-- 8. Table des blocages d'utilisateurs
CREATE TABLE IF NOT EXISTS blocks (
  id TEXT PRIMARY KEY,
  blocker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(blocker_id, blocked_id)
);

-- 9. Table des signalements
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
