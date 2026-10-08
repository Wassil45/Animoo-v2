import React, { useState } from 'react';
import { Conversation, Pet } from '../types';
import { Search, SlidersHorizontal, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton, Badge } from './ui';

interface MessagesScreenProps {
  conversations: Conversation[];
  isLoading?: boolean;
  error?: string | null;
  onOpenConversation: (conversationId: string) => void;
  onCreatePlaydate: () => void;
  onGoToMatches: () => void;
  onRetry?: () => void;
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({
  conversations,
  isLoading = false,
  error = null,
  onOpenConversation,
  onCreatePlaydate,
  onGoToMatches,
  onRetry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(
    (c) =>
      c.pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24 text-stone-900 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-black text-stone-900">Messages & Discussions</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Organisez vos sorties et échangez avec les maîtres
          </p>
        </div>
        <Badge variant="primary" size="md">
          {conversations.length} {conversations.length > 1 ? 'échanges' : 'échange'}
        </Badge>
      </div>

      {/* Network Error Banner */}
      {error && (
        <div className="mb-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Réessayer
            </button>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex items-center h-12 bg-stone-100 rounded-full px-4 gap-2.5 shadow-inner">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un animal ou un maître..."
            className="bg-transparent border-none outline-none w-full text-xs text-stone-800 placeholder:text-stone-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-stone-400 text-xs font-bold hover:text-stone-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={onCreatePlaydate}
          aria-label="Proposer une sortie"
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-stone-600 hover:text-primary transition-all shadow-sm border border-stone-200/80 active:scale-95 cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-stone-100 shadow-sm"
            >
              <Skeleton variant="circular" width={56} height={56} />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="85%" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredConversations.length === 0 ? (
        /* Empty State */
        <div className="my-8 flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-primary flex items-center justify-center text-3xl mb-3 shadow-inner">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-base font-extrabold text-stone-900">
            {searchQuery ? 'Aucun résultat trouvé' : 'Aucune discussion pour l’instant'}
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-[240px] leading-relaxed">
            {searchQuery
              ? `Aucune conversation ne correspond à "${searchQuery}".`
              : 'Dès que vous avez un match mutuel, vous pouvez initier une discussion et organiser votre première balade.'}
          </p>
          <button
            onClick={onGoToMatches}
            className="mt-4 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-[#FF5E62] text-white font-bold text-xs shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            Voir mes Matchs 🐾
          </button>
        </div>
      ) : (
        /* Conversations List */
        <div className="flex flex-col gap-2.5">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onOpenConversation(conv.id)}
              className="relative flex items-center gap-3.5 p-3.5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.99] border border-stone-100 cursor-pointer group"
            >
              {/* Pet & Owner Avatar Duo */}
              <div className="relative flex-shrink-0 w-14 h-14">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-stone-100 ring-2 ring-stone-100 shadow-inner">
                  <img
                    src={conv.pet.photos[0]}
                    alt={conv.pet.name}
                    width={56}
                    height={56}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full overflow-hidden bg-white p-0.5 shadow">
                  <img
                    src={conv.ownerAvatar}
                    alt={conv.ownerName}
                    width={24}
                    height={24}
                    loading="lazy"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>

              {/* Chat details */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm font-bold text-stone-900 truncate">
                      {conv.pet.name} & {conv.ownerName}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold ${
                      conv.unreadCount > 0 ? 'text-primary' : 'text-stone-400'
                    }`}
                  >
                    {conv.timestamp}
                  </span>
                </div>

                <p
                  className={`text-xs truncate ${
                    conv.unreadCount > 0
                      ? 'text-stone-900 font-bold'
                      : 'text-stone-500 font-normal'
                  }`}
                >
                  {conv.lastMessage}
                </p>

                {/* Optional Playdate Status Tag */}
                {conv.tag && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                      🐾 {conv.tag}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
