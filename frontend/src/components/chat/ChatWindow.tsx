'use client';

import { useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Message, ChatUser } from '@/hooks/useChatSocket';

interface Props {
  messages: Message[];
  currentUserId: string;
  participant: ChatUser | null;
  isOnline: boolean;
  typingUserNames: string[];
  hasMore: boolean;
  loadingMessages: boolean;
  isUserConnected?: boolean;
  onLoadMore: () => void;
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  onMarkSeen: () => void;
  onDeleteMessage: (messageId: string) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  onBack?: () => void; // Mobile back button
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const getDateLabel = (iso: string): string => {
  const d         = new Date(iso);
  const today     = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
};

// Group message array into date buckets
const groupByDate = (msgs: Message[]) => {
  const groups: { label: string; messages: Message[] }[] = [];
  msgs.forEach((msg) => {
    const label = getDateLabel(msg.createdAt);
    const last  = groups[groups.length - 1];
    if (last && last.label === label) {
      last.messages.push(msg);
    } else {
      groups.push({ label, messages: [msg] });
    }
  });
  return groups;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatWindow({
  messages,
  currentUserId,
  participant,
  isOnline,
  typingUserNames,
  hasMore,
  loadingMessages,
  isUserConnected = true,
  onLoadMore,
  onSendMessage,
  onTyping,
  onStopTyping,
  onMarkSeen,
  onDeleteMessage,
  inputValue,
  setInputValue,
  onBack,
}: Props) {
  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const messageGroups = useMemo(() => groupByDate(messages), [messages]);

  // Scroll to latest + mark seen whenever new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    onMarkSeen();
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onTyping();
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => onStopTyping(), 1500);
  };

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputValue('');
    onStopTyping();
    if (typingTimer.current) clearTimeout(typingTimer.current);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const headerStatus = typingUserNames.length > 0
    ? 'typing...'
    : isOnline ? 'online' : 'offline';

  const canSend = inputValue.trim().length > 0 && isUserConnected;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-3 py-2 flex-shrink-0 min-h-[60px] shadow-md"
        style={{ background: 'linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%)' }}
      >

        {/* Back arrow — mobile only */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden flex-shrink-0 p-1.5 -ml-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors"
            aria-label="Back to chats"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Clickable profile area — avatar + name/status */}
        <Link
          href={participant?.id ? `/alumni/${participant.id}` : '#'}
          className="flex items-center gap-3 flex-1 min-w-0 group"
        >
          {/* Avatar with photo */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-200 flex items-center justify-center font-bold text-blue-800 text-base select-none shadow-inner">
              {participant?.alumniProfile?.photoUrl ? (
                <img
                  src={participant.alumniProfile.photoUrl}
                  alt={participant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                participant?.name?.[0]?.toUpperCase() ?? '?'
              )}
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#21218F]" />
            )}
          </div>

          {/* Name + status */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight truncate group-hover:underline">
              {participant?.name ?? 'Unknown'}
            </p>
            <p
              className={`text-[11px] leading-tight ${
                typingUserNames.length > 0
                  ? 'text-blue-200 font-medium'
                  : isOnline
                  ? 'text-blue-200'
                  : 'text-white/50'
              }`}
            >
              {headerStatus}
            </p>
          </div>
        </Link>
      </div>

      {/* ── Message area ───────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 space-y-0.5"
        style={{
          // WhatsApp-style subtle pattern background
          backgroundColor: '#e8f0fe',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b8cce4' fill-opacity='0.25'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Disconnected warning banner */}
        {!isUserConnected && (
          <div className="mx-2 sm:mx-4 mt-2 mb-1 flex items-center gap-2.5 bg-[#fef9c3] border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl shadow-sm text-center justify-center">
            <svg className="w-5 h-5 flex-shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-8.5 14.14A1.5 1.5 0 003.07 20h17.86a1.5 1.5 0 001.28-2l-8.5-14.14a1.5 1.5 0 00-2.56 0z" />
            </svg>
            <span>
              You are no longer connected with this user.
              <br className="sm:hidden" />{' '}
              Reconnect to continue messaging.
            </span>
          </div>
        )}

        {/* Load older messages */}
        {hasMore && (
          <div className="flex justify-center py-2">
            <button
              onClick={onLoadMore}
              disabled={loadingMessages}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-blue-700 text-xs font-medium px-4 py-1.5 rounded-full shadow-sm hover:bg-white disabled:opacity-60 transition"
            >
              {loadingMessages ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Load older messages
                </>
              )}
            </button>
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && !loadingMessages && (
          <div className="flex justify-center items-center h-32">
            <div className="bg-[#fef9c3] text-amber-700 text-xs font-medium px-5 py-2.5 rounded-xl shadow-sm text-center max-w-[200px]">
              🔐 Messages are end-to-end secured.
              <br />Say hi!
            </div>
          </div>
        )}

        {/* Date-grouped messages */}
        {messageGroups.map((group) => (
          <div key={group.label}>

            {/* Date separator */}
            <div className="flex justify-center my-3">
              <span className="bg-[#e1f3fb]/90 text-[#54656f] text-[11px] font-medium px-3 py-1 rounded-full shadow-sm select-none">
                {group.label}
              </span>
            </div>

            {group.messages.map((msg, idx) => {
              const isMine     = msg.senderId === currentUserId;
              const isLastInRun =
                idx === group.messages.length - 1 ||
                group.messages[idx + 1]?.senderId !== msg.senderId;

              return (
                <div
                  key={msg.id}
                  className={`flex mb-0.5 group/msg-row ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Delete button — own messages only, shows on hover */}
                  {isMine && !msg.isDeleted && (
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      className="opacity-0 group-hover/msg-row:opacity-100 self-center mr-1.5 p-1.5 rounded-full text-[#8696a0] hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                      title="Delete message"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}

                  <div
                    className={`
                      relative max-w-[78%] sm:max-w-[65%] px-3 pt-2 pb-1.5 rounded-xl shadow-sm
                      ${isMine
                        ? msg.isDeleted ? 'bg-[#dbeafe]/60 text-gray-500' : 'bg-[#dbeafe] text-gray-800'
                        : msg.isDeleted ? 'bg-white/60 text-gray-500' : 'bg-white text-gray-800'
                      }
                      ${isLastInRun && !msg.isDeleted
                        ? isMine
                          ? 'rounded-tr-none'
                          : 'rounded-tl-none'
                        : ''
                      }
                    `}
                  >
                    {/* Bubble tail — only on last message in a run, not for deleted */}
                    {isLastInRun && !msg.isDeleted && (
                      <div
                        className={`absolute top-0 w-0 h-0 ${
                          isMine
                            ? '-right-[8px] border-l-[8px] border-l-[#dbeafe] border-b-[8px] border-b-transparent'
                            : '-left-[8px] border-r-[8px] border-r-white border-b-[8px] border-b-transparent'
                        }`}
                      />
                    )}

                    {msg.isDeleted ? (
                      /* Deleted message placeholder */
                      <p className="text-[13px] italic text-[#8696a0] flex items-center gap-1.5 py-0.5">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" strokeWidth={2} />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l-6 6M9 9l6 6" />
                        </svg>
                        This message was deleted
                      </p>
                    ) : (
                      <>
                        {/* Message text */}
                        <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap pr-10">
                          {msg.content}
                        </p>

                        {/* Timestamp + seen ticks — bottom right */}
                        <div className="flex items-center justify-end gap-1 -mt-1">
                          <span className="text-[10px] text-[#8696a0]">
                            {formatTime(msg.createdAt)}
                          </span>
                          {isMine && (
                            <svg
                              viewBox="0 0 16 11"
                              className={`w-4 h-3 flex-shrink-0 ${
                                msg.isSeen ? 'text-blue-500' : 'text-[#8696a0]'
                              }`}
                              fill="currentColor"
                            >
                              {/* Double tick SVG */}
                              <path d="M11.071.653a.75.75 0 0 1 .206 1.04l-5.5 8a.75.75 0 0 1-1.197.046L1.08 5.645a.75.75 0 0 1 1.09-1.032l2.94 3.107 4.92-7.16a.75.75 0 0 1 1.04-.207z"/>
                              <path d="M15.071.653a.75.75 0 0 1 .206 1.04l-5.5 8a.75.75 0 0 1-1.154.09l-.046-.044a.75.75 0 0 1 .996-1.122l.57.504 4.887-7.11a.75.75 0 0 1 1.04-.208z"/>
                            </svg>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUserNames.length > 0 && (
          <div className="flex justify-start mb-1">
            <div className="bg-white rounded-xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-gray-400 inline-block animate-bounce"
                  style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.9s' }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────── */}
      <div className={`flex items-center gap-2 px-2 py-2 bg-[#f0f2f5] flex-shrink-0 ${!isUserConnected ? 'opacity-50 pointer-events-none' : ''}`}>

        {/* Text field */}
        <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-sm min-h-[46px]">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isUserConnected ? 'Type a message' : 'You can no longer message this user'}
            maxLength={2000}
            disabled={!isUserConnected}
            className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400 disabled:cursor-not-allowed"
          />
          {/* Character counter when approaching limit */}
          {inputValue.length > 1800 && (
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              {2000 - inputValue.length}
            </span>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          style={canSend ? { background: 'linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%)' } : undefined}
          className={`
            w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0
            transition-all duration-200 shadow-md
            ${canSend
              ? 'active:scale-95 text-white'
              : 'bg-[#c8c8c8] text-white cursor-not-allowed'
            }
          `}
        >
          {/* Paper plane icon */}
          <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>

      </div>
    </div>
  );
}
