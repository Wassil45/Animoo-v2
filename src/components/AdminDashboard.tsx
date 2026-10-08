import React, { useState, useEffect } from 'react';
import { Pet, User, AdminStats } from '../types';
import {
  Shield,
  Users,
  Heart,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Database,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import {
  fetchAdminStatsApi,
  fetchAdminUsersApi,
  updateAdminUserRoleApi,
  deleteAdminUserApi,
  adminCreatePetApi,
  adminDeletePetApi,
  adminToggleVerifyPetApi,
} from '../services/api';
import { Button, Input, Badge, Skeleton, Modal } from './ui';
import { PET_IMAGES, USER_AVATARS } from '../data/petImages';

interface AdminDashboardProps {
  currentUser: User;
  pets: Pet[];
  onRefreshPets: () => void;
  onClose: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  pets,
  onRefreshPets,
  onClose,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'pets' | 'users' | 'system'>('pets');
  const [stats, setStats] = useState<AdminStats>({
    totalPets: pets.length,
    totalUsers: 2,
    totalMatches: 8,
    totalFavorites: 4,
    totalConversations: 2,
  });
  const [usersList, setUsersList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);

  // New Pet Form State
  const [newPetName, setNewPetName] = useState('');
  const [newPetAge, setNewPetAge] = useState('2');
  const [newPetSpecies, setNewPetSpecies] = useState<'dog' | 'cat'>('dog');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetOwner, setNewPetOwner] = useState(currentUser.name);
  const [newPetBio, setNewPetBio] = useState('');
  const [newPetPhoto, setNewPetPhoto] = useState(PET_IMAGES.milo[0]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        fetchAdminStatsApi(),
        fetchAdminUsersApi(),
      ]);
      setStats(statsData);
      setUsersList(usersData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleVerify = async (petId: string) => {
    await adminToggleVerifyPetApi(petId);
    onRefreshPets();
  };

  const handleDeletePet = async (petId: string) => {
    if (confirm('Voulez-vous vraiment supprimer cet animal de la plateforme ?')) {
      await adminDeletePetApi(petId);
      onRefreshPets();
    }
  };

  const handleToggleUserRole = async (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await updateAdminUserRoleApi(user.id, newRole);
    loadAdminData();
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Supprimer définitivement cet utilisateur ?')) {
      await deleteAdminUserApi(userId);
      loadAdminData();
    }
  };

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName || !newPetBreed) return;

    await adminCreatePetApi({
      id: 'pet_' + Date.now(),
      name: newPetName,
      age: parseFloat(newPetAge) || 2,
      species: newPetSpecies,
      breed: newPetBreed,
      distanceKm: 2.5,
      locationName: 'Paris 14e • Parc Montsouris',
      gender: 'Mâle',
      sterilized: true,
      matchScore: 96,
      temperamentTitle: 'Sociable & Joueur',
      temperamentDetail: 'Très affectueux et adore les rencontres au parc.',
      photos: [newPetPhoto],
      tags: ['🎾 Joueur', '🐕 Sociable', '🌲 Adore le parc'],
      bio: newPetBio || 'Compagnon énergique et curieux qui cherche de nouveaux copains.',
      verified: true,
      vaccinesUpToDate: true,
      chipped: true,
      ownerName: newPetOwner,
      ownerAge: 28,
      ownerAvatar: currentUser.avatar || USER_AVATARS.alexandre,
      ownerBio: 'Passionné de balades canines.',
      favoriteParks: ['Parc Montsouris', 'Bois de Vincennes'],
    });

    setIsAddPetModalOpen(false);
    setNewPetName('');
    setNewPetBreed('');
    setNewPetBio('');
    onRefreshPets();
  };

  const filteredPets = pets.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-stone-50 min-h-full pb-20 select-none">
      {/* Top Banner */}
      <div className="bg-stone-900 text-white p-4 sticky top-0 z-30 flex items-center justify-between border-b border-stone-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
            👑
          </div>
          <div>
            <h1 className="text-sm font-extrabold flex items-center gap-2">
              <span>Portail Administrateur</span>
              <Badge variant="warning" size="sm">
                ACCÈS TOTAL
              </Badge>
            </h1>
            <p className="text-[11px] text-stone-400">
              Connecté : <span className="text-stone-200 font-semibold">{currentUser.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAdminData}
            title="Rafraîchir les données"
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
          >
            Mode Application 🐾
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? (
          <>
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </>
        ) : (
          <>
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center text-xl">
                🐾
              </div>
              <div>
                <span className="text-xl font-black text-stone-900">{stats.totalPets}</span>
                <p className="text-[11px] font-semibold text-stone-500">Compagnons</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-stone-900">{usersList.length || stats.totalUsers}</span>
                <p className="text-[11px] font-semibold text-stone-500">Utilisateurs</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-xl font-black text-stone-900">{stats.totalFavorites}</span>
                <p className="text-[11px] font-semibold text-stone-500">Favoris sauvés</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-stone-900">{stats.totalConversations}</span>
                <p className="text-[11px] font-semibold text-stone-500">Playdates</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 mb-3">
        <div className="flex bg-stone-200 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('pets')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'pets' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            🐾 Compagnons ({pets.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            👥 Utilisateurs ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'system' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            ⚙️ Système & DB
          </button>
        </div>
      </div>

      {/* TAB 1: PETS MANAGEMENT */}
      {activeTab === 'pets' && (
        <div className="px-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, race ou maître..."
                leftIcon={<Search className="w-4 h-4 text-stone-400" />}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAddPetModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nouveau
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {filteredPets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                    <img
                      src={pet.photos[0]}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-stone-900 truncate">{pet.name}</h3>
                      <span className="text-[10px] text-stone-500 font-semibold">
                        ({pet.species === 'dog' ? 'Chien' : 'Chat'}, {pet.age} ans)
                      </span>
                      {pet.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-stone-500 truncate">
                      {pet.breed} • Maître : <span className="font-semibold text-stone-700">{pet.ownerName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleVerify(pet.id)}
                    title={pet.verified ? 'Retirer la certification' : 'Certifier le profil'}
                    className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      pet.verified
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeletePet(pet.id)}
                    title="Supprimer cet animal"
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="px-4 space-y-3">
          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-800 leading-relaxed">
            🛡️ <strong>Gestion des Rôles & Accès</strong> : Vous pouvez promouvoir un utilisateur en administrateur ou le repasser en compte standard en temps réel dans Neon Postgres.
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {loading ? (
              <Skeleton className="h-16 rounded-2xl" />
            ) : (
              usersList.map((user) => (
                <div
                  key={user.id}
                  className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.avatar || USER_AVATARS.wassil}
                      alt={user.name}
                      width={44}
                      height={44}
                      loading="lazy"
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-stone-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{user.name}</h4>
                        <Badge
                          variant={user.role === 'admin' ? 'warning' : 'secondary'}
                          size="sm"
                        >
                          {user.role === 'admin' ? 'ADMIN' : 'USER'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleUserRole(user)}
                      title={user.role === 'admin' ? 'Rétrograder en utilisateur' : 'Promouvoir en Admin'}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        user.role === 'admin'
                          ? 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                          : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      {user.role === 'admin' ? 'Passer User' : '👑 Rendre Admin'}
                    </button>

                    {user.id !== currentUser.id && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        title="Supprimer ce compte"
                        className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM & DATABASE */}
      {activeTab === 'system' && (
        <div className="px-4 space-y-3 text-xs text-stone-700">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-2">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Base de données Vercel Postgres / Neon</span>
            </h3>
            <p className="text-[11px] text-stone-500">
              Cluster : <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">ep-divine-morning-b7aobt57-pooler</code>
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
              <span>Protocole : <strong>HTTPS Serverless (Port 443)</strong></span>
              <Badge variant="success" size="sm" dot>
                Opérationnel
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PET */}
      <Modal
        isOpen={isAddPetModalOpen}
        onClose={() => setIsAddPetModalOpen(false)}
        title="Ajouter un Compagnon"
        subtitle="Publiez un nouvel animal disponible pour les rencontres"
        maxWidth="md"
      >
        <form onSubmit={handleCreatePet} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Nom de l'animal"
              type="text"
              required
              value={newPetName}
              onChange={(e) => setNewPetName(e.target.value)}
              placeholder="Ex: Cookie"
            />
            <Input
              label="Âge (ans)"
              type="number"
              step="0.5"
              required
              value={newPetAge}
              onChange={(e) => setNewPetAge(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Espèce</label>
              <select
                value={newPetSpecies}
                onChange={(e) => setNewPetSpecies(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-base text-stone-900"
              >
                <option value="dog">Chien 🐕</option>
                <option value="cat">Chat 🐈</option>
              </select>
            </div>
            <Input
              label="Race"
              type="text"
              required
              value={newPetBreed}
              onChange={(e) => setNewPetBreed(e.target.value)}
              placeholder="Ex: Berger Australien"
            />
          </div>

          <Input
            label="Nom du propriétaire"
            type="text"
            required
            value={newPetOwner}
            onChange={(e) => setNewPetOwner(e.target.value)}
          />

          <Input
            label="URL de la photo"
            type="url"
            required
            value={newPetPhoto}
            onChange={(e) => setNewPetPhoto(e.target.value)}
          />

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Bio / Tempérament</label>
            <textarea
              rows={2}
              value={newPetBio}
              onChange={(e) => setNewPetBio(e.target.value)}
              placeholder="Présentation du compagnon..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <Button type="submit" variant="primary" fullWidth size="lg">
            Créer et Publier le Profil
          </Button>
        </form>
      </Modal>
    </div>
  );
};
