import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import { User } from '../types';
import { Modal, Input, Button } from './ui';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  onSignIn?: (email: string, password: string) => Promise<User>;
  onSignUp?: (email: string, password: string, name: string) => Promise<User>;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onSignIn,
  onSignUp,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!onSignIn) {
          throw new Error('Service de connexion non disponible');
        }
        const user = await onSignIn(email.trim(), password);
        onAuthSuccess(user);
        onClose();
      } else {
        if (!name.trim()) {
          throw new Error('Veuillez renseigner votre nom complet ou duo');
        }
        if (!onSignUp) {
          throw new Error("Service d'inscription non disponible");
        }
        const user = await onSignUp(email.trim(), password, name.trim());
        onAuthSuccess(user);
        onClose();
      }
    } catch (err: any) {
      console.error('Erreur authentification:', err);
      let errorMsg = err?.message || 'Une erreur est survenue lors de la connexion';
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = 'Adresse email ou mot de passe incorrect';
      } else if (errorMsg.includes('already registered')) {
        errorMsg = 'Un compte existe déjà avec cette adresse email';
      } else if (errorMsg.includes('Password should be at least')) {
        errorMsg = 'Le mot de passe doit comporter au moins 6 caractères';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <span>{mode === 'login' ? 'Connexion à Animoo' : 'Créer votre compte'}</span>
        </div>
      }
      subtitle="Rejoignez la communauté bienveillante des passionnés de chiens et chats"
      maxWidth="md"
    >
      {/* Tabs Switcher */}
      <div className="flex rounded-2xl bg-stone-100 p-1 mb-4">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            mode === 'login'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          Se connecter
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setError(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            mode === 'register'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          S'inscrire
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        {mode === 'register' && (
          <Input
            label="Nom complet / Duo"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Sophie & Pixel"
            leftIcon={<UserIcon className="w-4 h-4" />}
          />
        )}

        <Input
          label="Adresse Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre-email@exemple.com"
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Mot de passe"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          fullWidth
          isLoading={loading}
          leftIcon={mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          className="mt-2"
        >
          {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
        </Button>
      </form>
    </Modal>
  );
};
