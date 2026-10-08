import { useState, useCallback } from 'react';
import { TabId } from '../components/BottomNav';

export interface RouterState {
  currentTab: TabId;
  hasOnboarded: boolean;
  isAdminOpen: boolean;
  isAuthOpen: boolean;
}

export function useRouter(initialTab: TabId = 'discover') {
  const [currentTab, setCurrentTab] = useState<TabId>(initialTab);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(true);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const navigateTo = useCallback((tab: TabId) => {
    setCurrentTab(tab);
    setIsAdminOpen(false);
  }, []);

  const openAdmin = useCallback(() => setIsAdminOpen(true), []);
  const closeAdmin = useCallback(() => setIsAdminOpen(false), []);
  const openAuth = useCallback(() => setIsAuthOpen(true), []);
  const closeAuth = useCallback(() => setIsAuthOpen(false), []);

  return {
    currentTab,
    setCurrentTab,
    hasOnboarded,
    setHasOnboarded,
    isAdminOpen,
    setIsAdminOpen,
    isAuthOpen,
    setIsAuthOpen,
    navigateTo,
    openAdmin,
    closeAdmin,
    openAuth,
    closeAuth,
  };
}
