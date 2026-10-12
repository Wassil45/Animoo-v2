import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  initDb,
  getPetsFromDb,
  getFavoritesFromDb,
  addFavoriteToDb,
  removeFavoriteFromDb,
  getConversationsFromDb,
  saveMessageToDb,
  checkDbStatus,
  isNeonConnected,
  findUserByEmail,
  findUserById,
  createUserInDb,
  getAllUsersFromDb,
  deleteUserFromDb,
  updateUserRoleInDb,
  addPetToDb,
  updatePetInDb,
  deletePetFromDb,
  togglePetVerificationInDb,
  getAdminStatsFromDb,
  saveLikeToDb,
  saveBlockToDb,
  getBlockedIdsFromDb,
  saveReportToDb,
} from './src/server/db';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('--port');
  const portFromArgs = portIndex !== -1 && args[portIndex + 1] ? Number(args[portIndex + 1]) : null;
  const PORT = portFromArgs || (process.env.PORT && process.env.PORT !== '8080' ? Number(process.env.PORT) : 3000);
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Initialize Neon Database schema asynchronously without blocking startup
  initDb().catch((e) => console.warn('Background init warning:', e));

  // API Routes
  // 1. Health & Database connection status
  app.get('/api/health', async (req: Request, res: Response) => {
    try {
      const status = await checkDbStatus();
      res.json(status);
    } catch (err: any) {
      res.json({
        status: 'active',
        database: 'resilient_storage',
        provider: 'Animoo Storage',
        error: err.message,
      });
    }
  });

  // =========================================================================
  // AUTHENTICATION ROUTES
  // =========================================================================

  // Login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
      }

      const userRecord = await findUserByEmail(email);
      if (!userRecord || userRecord.password !== password) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      const token = `animoo_token_${userRecord.id}_${Date.now()}`;
      const user = {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        role: userRecord.role,
        avatar: userRecord.avatar,
        createdAt: userRecord.createdAt,
      };

      res.json({ success: true, user, token });
    } catch (err: any) {
      console.error('Error logging in:', err);
      res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
  });

  // Register (Le rôle est toujours fixé à 'user', jamais choisi à l'inscription)
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, name, avatar } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, mot de passe et nom requis' });
      }

      const existing = await findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse email' });
      }

      const user = await createUserInDb(email, password, name, 'user', avatar);
      const token = `animoo_token_${user.id}_${Date.now()}`;

      res.status(201).json({ success: true, user, token });
    } catch (err: any) {
      console.error('Error registering:', err);
      res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
  });

  // Get current authenticated user
  app.get('/api/auth/me', async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (token && token.startsWith('animoo_token_')) {
        const parts = token.split('_');
        const userId = parts.slice(2, parts.length - 1).join('_');
        const user = await findUserById(userId);
        if (user) {
          return res.json({ user });
        }
      }

      const defaultUser = await findUserById('usr_user_1');
      res.json({ user: defaultUser });
    } catch (err: any) {
      res.status(500).json({ error: 'Erreur récupération profil' });
    }
  });

  // Logout
  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    res.json({ success: true });
  });

  // =========================================================================
  // ADMIN ROUTES
  // =========================================================================

  // Admin stats
  app.get('/api/admin/stats', async (_req: Request, res: Response) => {
    try {
      const stats = await getAdminStatsFromDb();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: 'Erreur récupération statistiques' });
    }
  });

  // Admin users list
  app.get('/api/admin/users', async (_req: Request, res: Response) => {
    try {
      const users = await getAllUsersFromDb();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: 'Erreur récupération utilisateurs' });
    }
  });

  // Admin update user role
  app.put('/api/admin/users/:id/role', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (role !== 'admin' && role !== 'user') {
        return res.status(400).json({ error: 'Rôle invalide' });
      }
      await updateUserRoleInDb(id, role);
      res.json({ success: true, role });
    } catch (err: any) {
      res.status(500).json({ error: 'Erreur modification rôle' });
    }
  });

  // Admin delete user
  app.delete('/api/admin/users/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await deleteUserFromDb(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Erreur suppression utilisateur' });
    }
  });

  // Admin create pet
  app.post('/api/admin/pets', async (req: Request, res: Response) => {
    try {
      const newPet = await addPetToDb(req.body);
      res.status(201).json({ success: true, pet: newPet });
    } catch (err: any) {
      res.status(500).json({ error: 'Erreur création animal' });
    }
  });

  // Admin update pet
  app.put('/api/admin/pets/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await updatePetInDb(id, req.body);
      res.json({ success: true, pet: updated });
    } catch (err: any) {
      res.status(500).json({ error: 'Erreur mise à jour animal' });
    }
  });

  // Admin toggle pet verification
  app.put('/api/admin/pets/:id/verify', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const verified = await togglePetVerificationInDb(id);
      res.json({ success: true, verified });
    } catch (err: any) {
      res.status(500).json({ error: 'Erreur bascule certification' });
    }
  });

  // Admin delete pet
  app.delete('/api/admin/pets/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await deletePetFromDb(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Erreur suppression animal' });
    }
  });

  // 2. Get all pets for discovery
  app.get('/api/pets', async (req: Request, res: Response) => {
    try {
      const pets = await getPetsFromDb();
      res.json(pets);
    } catch (err: any) {
      console.error('Error fetching pets:', err);
      res.status(500).json({ error: 'Failed to fetch pets' });
    }
  });

  // 3. Get favorites
  app.get('/api/favorites', async (req: Request, res: Response) => {
    try {
      const userId = (req.query.userId as string) || 'user_milo';
      const favorites = await getFavoritesFromDb(userId);
      res.json(favorites);
    } catch (err: any) {
      console.error('Error fetching favorites:', err);
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
  });

  // 4. Add a favorite
  app.post('/api/favorites/:petId', async (req: Request, res: Response) => {
    try {
      const { petId } = req.params;
      const userId = req.body.userId || 'user_milo';
      await addFavoriteToDb(userId, petId);
      const updatedFavorites = await getFavoritesFromDb(userId);
      res.json({ success: true, favorites: updatedFavorites });
    } catch (err: any) {
      console.error('Error adding favorite:', err);
      res.status(500).json({ error: 'Failed to add favorite' });
    }
  });

  // 5. Remove a favorite
  app.delete('/api/favorites/:petId', async (req: Request, res: Response) => {
    try {
      const { petId } = req.params;
      const userId = (req.query.userId as string) || 'user_milo';
      await removeFavoriteFromDb(userId, petId);
      const updatedFavorites = await getFavoritesFromDb(userId);
      res.json({ success: true, favorites: updatedFavorites });
    } catch (err: any) {
      console.error('Error removing favorite:', err);
      res.status(500).json({ error: 'Failed to remove favorite' });
    }
  });

  // 6. Get conversations & messages
  app.get('/api/conversations', async (req: Request, res: Response) => {
    try {
      const conversations = await getConversationsFromDb();
      res.json(conversations);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  // 7. Send message & save in Postgres
  app.post('/api/conversations/:id/messages', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { text, proposal } = req.body;
      const timestamp = 'À l\'instant';

      const userMsg = await saveMessageToDb(id, 'user', text, timestamp, proposal);
      res.json({ success: true, message: userMsg });
    } catch (err: any) {
      console.error('Error saving message:', err);
      res.status(500).json({ error: 'Failed to save message' });
    }
  });

  // 8. Likes route (match seulement si réciproque)
  app.post('/api/likes', async (req: Request, res: Response) => {
    try {
      const { petId, type = 'like', userId = 'usr_user_1' } = req.body;
      if (!petId) return res.status(400).json({ error: 'petId requis' });
      const result = await saveLikeToDb(userId, petId, type);
      res.json(result);
    } catch (err: any) {
      console.error('Error saving like:', err);
      res.status(500).json({ error: 'Failed to save like' });
    }
  });

  // 9. Blocks route
  app.post('/api/blocks', async (req: Request, res: Response) => {
    try {
      const { blockerId = 'usr_user_1', blockedId } = req.body;
      if (!blockedId) return res.status(400).json({ error: 'blockedId requis' });
      await saveBlockToDb(blockerId, blockedId);
      res.json({ success: true, blockedId });
    } catch (err: any) {
      console.error('Error blocking user/pet:', err);
      res.status(500).json({ error: 'Failed to block' });
    }
  });

  app.get('/api/blocks', async (req: Request, res: Response) => {
    try {
      const blockerId = (req.query.userId as string) || 'usr_user_1';
      const blockedIds = await getBlockedIdsFromDb(blockerId);
      res.json({ blockedIds });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch blocks' });
    }
  });

  // 10. Reports route
  app.post('/api/reports', async (req: Request, res: Response) => {
    try {
      const { reporterId = 'usr_user_1', reportedPetId, reportedUserId, reason, details } = req.body;
      if (!reason) return res.status(400).json({ error: 'reason requise' });
      await saveReportToDb(reporterId, reportedPetId, reportedUserId, reason, details);
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error saving report:', err);
      res.status(500).json({ error: 'Failed to save report' });
    }
  });

  // Mount Vite middleware in development
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static build in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Animoo en écoute sur http://0.0.0.0:${PORT}`);
    console.log(`📦 Base Neon Postgres active.`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
