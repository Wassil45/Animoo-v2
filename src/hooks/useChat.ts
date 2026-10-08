import { useState, useEffect, useCallback } from 'react';
import { Conversation, Pet, PlaydatePlan } from '../types';
import { INITIAL_CONVERSATIONS } from '../data/mockPets';
import { fetchConversations, sendMessageToApi } from '../services/api';

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const convsData = await fetchConversations();
      if (convsData && convsData.length > 0) {
        setConversations(convsData);
      }
    } catch (err: any) {
      console.warn('Erreur chargement conversations:', err);
      setError('Impossible de synchroniser les messages.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load conversations from Neon Postgres database
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const totalUnreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const handleStartChatFromMatch = useCallback(
    (pet: Pet, initialMessage?: string) => {
      let existingConv = conversations.find((c) => c.pet.id === pet.id);
      if (!existingConv) {
        existingConv = {
          id: 'conv_' + pet.id,
          pet,
          ownerName: pet.ownerName,
          ownerAvatar: pet.ownerAvatar,
          lastMessage: initialMessage || 'Wouf ! Nouveau Animatch 🐾',
          timestamp: "À l'instant",
          unreadCount: 0,
          tag: `${pet.favoriteParks[0] || pet.locationName} • ${pet.distanceKm} km`,
          tagType: 'location',
          messages: [
            {
              id: 'm_' + Date.now(),
              sender: 'user',
              text: initialMessage || `Wouf ! Ravi de faire la connaissance de ${pet.name} 🐾 !`,
              timestamp: "À l'instant",
            },
          ],
        };
        setConversations((prev) => [existingConv!, ...prev]);
      } else if (initialMessage) {
        existingConv.messages.push({
          id: 'm_' + Date.now(),
          sender: 'user',
          text: initialMessage,
          timestamp: "À l'instant",
        });
        existingConv.lastMessage = initialMessage;
      }

      setActiveConversationId(existingConv.id);
      return existingConv.id;
    },
    [conversations]
  );

  const handleSendMessage = useCallback(
    async (conversationId: string, text: string, proposal?: PlaydatePlan) => {
      // 1. Optimistic update
      const optimisticMsg = {
        id: 'msg_' + Date.now(),
        sender: 'user' as const,
        text,
        timestamp: "À l'instant",
        playdateProposal: proposal,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              lastMessage: text,
              timestamp: "À l'instant",
              messages: [...c.messages, optimisticMsg],
            };
          }
          return c;
        })
      );

      // 2. Persist to Neon Postgres backend
      await sendMessageToApi(conversationId, text, proposal);
    },
    []
  );

  return {
    conversations,
    setConversations,
    isLoading,
    error,
    loadConversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    totalUnreadCount,
    handleStartChatFromMatch,
    handleSendMessage,
  };
}
