import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { loginApi, registerApi, logoutApi, fetchCurrentUserApi, getStoredToken } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Initialize and restore active user session from token in Neon Postgres
  const initAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getStoredToken();
      if (!token) {
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      const activeUser = await fetchCurrentUserApi();
      if (activeUser) {
        setUser(activeUser);
        setIsAdmin(activeUser.role === 'admin');
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch (err) {
      console.warn('Erreur initialisation session auth Neon:', err);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Sign In (Connexion réelle avec Neon Postgres)
  const signIn = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await loginApi(email.trim(), password);
      setUser(res.user);
      setIsAdmin(res.user.role === 'admin');
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up (Inscription réelle - SANS choix du rôle, toujours 'user')
  const signUp = async (email: string, password: string, fullName: string): Promise<User> => {
    setIsLoading(true);
    try {
      // Le rôle est toujours fixé à 'user' côté serveur
      const res = await registerApi(email.trim(), password, fullName.trim(), 'user');
      setUser(res.user);
      setIsAdmin(false);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Out (Déconnexion réelle)
  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logoutApi();
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    setUser,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signOut,
  };
}
