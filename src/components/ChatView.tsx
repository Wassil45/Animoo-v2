import React, { useState, useRef, useEffect } from 'react';
import { Conversation, ChatMessage, PlaydatePlan } from '../types';
import { ArrowLeft, Send, MapPin, Calendar, Clock, CheckCheck, Sparkles, Smile } from 'lucide-react';
import { ActionMenu } from './ActionMenu';

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  onSendMessage: (conversationId: string, text: string, proposal?: PlaydatePlan) => void;
  onBlock?: (petId: string) => void;
  onReport?: (petId: string, reason: string, details?: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  onBack,
  onSendMessage,
  onBlock,
  onReport,
}) => {
  const [inputText, setInputText] = useState('');
  const [showPlaydatePicker, setShowPlaydatePicker] = useState(false);
  const [selectedPark, setSelectedPark] = useState(conversation.pet.favoriteParks[0] || 'Parc Monceau');
  const [selectedDay, setSelectedDay] = useState('Samedi prochain');
  const [selectedTime, setSelectedTime] = useState('11h00');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(conversation.id, inputText.trim());
    setInputText('');
  };

  const handleProposePlaydate = () => {
    const proposal: PlaydatePlan = {
      id: 'plan_' + Date.now(),
      parkName: selectedPark,
      dateStr: selectedDay,
      timeStr: selectedTime,
      activity: 'Rencontre & Balade en plein air',
      status: 'pending',
    };

    const text = `Wouf ! Que dis-tu d'un playdate à ${selectedPark} (${selectedDay} à ${selectedTime}) ? 🐾`;
    onSendMessage(conversation.id, text, proposal);
    setShowPlaydatePicker(false);
  };

  const quickPaws = ['🐾', '🎾', '🐕', '🦴', '❤️', '⚡'];

  return (
    <div className="flex flex-col h-full bg-stone-50 select-text">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Dual Avatar */}
          <div className="relative w-11 h-11 flex-shrink-0">
            <img
              src={conversation.pet.photos[0]}
              alt={conversation.pet.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-rose-100"
              referrerPolicy="no-referrer"
            />
            <img
              src={conversation.ownerAvatar}
              alt={conversation.ownerName}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full object-cover border-2 border-white"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-stone-900 leading-tight">
                {conversation.pet.name} & {conversation.ownerName}
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-stone-500 font-medium">
              {conversation.pet.breed} • {conversation.pet.distanceKm} km
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Action button: Plan playdate */}
          <button
            onClick={() => setShowPlaydatePicker(!showPlaydatePicker)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              showPlaydatePicker
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Proposer</span> Sortie
          </button>

          {/* Menu « ⋯ » (Bloquer, Signaler) */}
          <ActionMenu
            petName={conversation.pet.name}
            onBlock={() => {
              onBlock?.(conversation.pet.id);
              onBack();
            }}
            onReport={(reason, details) => onReport?.(conversation.pet.id, reason, details)}
            buttonClassName="w-9 h-9 bg-stone-100 hover:bg-stone-200 text-stone-700"
            iconColor="text-stone-700"
            align="right"
          />
        </div>
      </header>

      {/* Playdate Quick Proposal Sheet */}
      {showPlaydatePicker && (
        <div className="bg-rose-50/90 border-b border-rose-200 p-4 animate-fadeIn flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              Organiser un Playdate
            </span>
            <button
              onClick={() => setShowPlaydatePicker(false)}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              Annuler
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-stone-500 block mb-1">Spot / Parc</label>
              <select
                value={selectedPark}
                onChange={(e) => setSelectedPark(e.target.value)}
                className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2 font-medium"
              >
                {conversation.pet.favoriteParks.map((p, idx) => (
                  <option key={idx} value={p}>{p}</option>
                ))}
                <option value="Parc Montsouris">Parc Montsouris</option>
                <option value="Bois de Boulogne">Bois de Boulogne</option>
                <option value="Bois de Vincennes">Bois de Vincennes</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-500 block mb-1">Jour</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2 font-medium"
              >
                <option value="Ce samedi matin">Ce samedi matin</option>
                <option value="Ce dimanche aprem">Ce dimanche aprem</option>
                <option value="Mercredi prochain">Mercredi prochain</option>
                <option value="Week-end prochain">Week-end prochain</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-500 block mb-1">Heure</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2 font-medium"
              >
                <option value="10h00">10h00</option>
                <option value="11h30">11h30</option>
                <option value="15h00">15h00</option>
                <option value="17h30">17h30</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleProposePlaydate}
            className="w-full py-2 bg-gradient-to-r from-primary to-[#FF5E62] text-white rounded-xl font-bold text-xs shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
          >
            Envoyer l'invitation Playdate 🐾
          </button>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-24">
        {/* Match Header Announcement in Thread */}
        <div className="flex flex-col items-center justify-center my-3 text-center">
          <div className="w-16 h-16 rounded-full overflow-hidden mb-2 ring-4 ring-rose-100 shadow-md">
            <img
              src={conversation.pet.photos[0]}
              alt={conversation.pet.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-xs font-bold text-stone-800">
            Vous avez matché avec {conversation.pet.name} !
          </span>
          <span className="text-[11px] text-stone-500 max-w-[240px] mt-0.5">
            {conversation.pet.temperamentDetail}
          </span>
        </div>

        {conversation.messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] ${
                isUser ? 'self-end' : 'self-start'
              }`}
            >
              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-primary to-[#E11D48] text-white rounded-br-xs'
                    : 'bg-white text-stone-800 rounded-bl-xs border border-stone-200/70'
                }`}
              >
                <p>{msg.text}</p>

                {/* Optional Playdate Proposal Card */}
                {msg.playdateProposal && (
                  <div className="mt-2.5 p-3 rounded-xl bg-white/95 text-stone-900 border border-rose-200 shadow-sm flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-primary">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Invitation Playdate Animoo</span>
                    </div>
                    <div className="text-[11px] text-stone-600 flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span className="font-semibold">{msg.playdateProposal.parkName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{msg.playdateProposal.dateStr} à {msg.playdateProposal.timeStr}</span>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between pt-1 border-t border-stone-100">
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        ✓ En attente de confirmation
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Timestamp & status */}
              <div className="flex items-center gap-1 mt-1 px-1">
                <span className="text-[10px] text-stone-400">{msg.timestamp}</span>
                {isUser && <CheckCheck className="w-3 h-3 text-rose-400" />}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar pinned to bottom */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 p-2.5 flex flex-col gap-1.5 max-w-md mx-auto">
        {/* Quick Emoji Paws Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 py-0.5">
          {quickPaws.map((emoji, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInputText((prev) => prev + emoji)}
              className="text-sm px-2 py-0.5 rounded-full bg-stone-100 hover:bg-rose-100 active:scale-90 transition-all cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Form Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Écrire à ${conversation.pet.name} & ${conversation.ownerName}...`}
            className="flex-1 bg-stone-100 border border-stone-200 rounded-full px-4 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-rose-400/40"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              inputText.trim()
                ? 'bg-gradient-to-r from-primary to-[#FF5E62] text-white shadow-md active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
