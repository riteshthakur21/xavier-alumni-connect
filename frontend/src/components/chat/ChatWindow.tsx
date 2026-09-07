'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Message, ChatUser } from '@/hooks/useChatSocket';
import {
  ArrowLeft,
  Send,
  Lock,
  Trash2,
  Clock,
  Check,
  CheckCheck,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

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
  theme?: 'light' | 'dark';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const getDateLabel = (iso: string): string => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
};

// Group message array into date buckets
const groupByDate = (msgs: Message[]) => {
  const groups: { label: string; messages: Message[] }[] = [];
  msgs.forEach((msg) => {
    const label = getDateLabel(msg.createdAt);
    const last = groups[groups.length - 1];
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
  theme = 'light',
}: Props) {
  const isDark = theme === 'dark';
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const canSend = inputValue.trim().length > 0 && isUserConnected;

  return (
    <div
      className={`flex flex-col h-full overflow-hidden transition-colors ${
        isDark ? 'bg-[#14100c]' : 'bg-[#f4efe6]'
      }`}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1410] border-b border-[#3d3222] flex-shrink-0 min-h-[62px] shadow-sm">
        {/* Back arrow — mobile only */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden flex-shrink-0 p-1.5 -ml-1 rounded-xl text-[#f4efe6]/80 hover:text-[#f4efe6] hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
            aria-label="Back to chats"
          >
            <ArrowLeft className="w-5 h-5 text-[#e8a93c]" />
          </button>
        )}

        {/* Clickable profile area — avatar + name/status */}
        <Link
          href={participant?.id ? `/alumni/${participant.id}` : '#'}
          className="flex items-center gap-3 flex-1 min-w-0 group"
        >
          {/* Avatar with photo */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#261f15] border border-[#3d3222] flex items-center justify-center font-serif font-bold text-[#e8a93c] text-base select-none shadow-2xs">
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
              <span
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#3a5c3e] border-2 border-[#1a1410]"
                title="Online"
              />
            )}
          </div>

          {/* Name + status */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-serif text-[#f4efe6] leading-tight truncate group-hover:text-[#e8a93c] transition-colors">
              {participant?.name ?? 'Unknown'}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              {typingUserNames.length > 0 ? (
                <p className="text-[11px] text-[#e8a93c] font-mono italic animate-pulse">
                  Typing...
                </p>
              ) : isOnline ? (
                <p className="text-[10px] text-[#7aab7e] font-mono uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7aab7e] animate-pulse inline-block" />
                  Online
                </p>
              ) : (
                <p className="text-[10px] text-[#f4efe6]/50 font-mono uppercase tracking-wider">
                  Offline
                </p>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* ── Message area ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-1">
        {/* Disconnected warning banner */}
        {!isUserConnected && (
          <div
            className={`mx-1 sm:mx-4 mt-1 mb-3 flex items-center gap-2.5 border text-xs sm:text-sm px-4 py-3 rounded-xl shadow-2xs text-center justify-center ${
              isDark
                ? 'bg-[#2d2113] border-[#c4821a]/40 text-[#fdf3e3]'
                : 'bg-[#fdf3e3] border-[#c4821a]/30 text-[#5c4d37]'
            }`}
          >
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-[#c4821a]" />
            <span>
              You are no longer connected with this member.
              <br className="sm:hidden" /> Reconnect to resume correspondence.
            </span>
          </div>
        )}

        {/* Load older messages */}
        {hasMore && (
          <div className="flex justify-center py-2">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadingMessages}
              className={`flex items-center gap-1.5 border text-xs font-semibold px-4 py-1.5 rounded-full shadow-2xs transition-all disabled:opacity-60 cursor-pointer ${
                isDark
                  ? 'bg-[#261f15] hover:bg-[#3d3222] text-[#f4efe6] border-[#3d3222]'
                  : 'bg-white/95 hover:bg-[#1a1410] text-[#1a1410] hover:text-[#f4efe6] border-[#1a1410]/12'
              }`}
            >
              {loadingMessages ? (
                <>
                  <Loader2 className="animate-spin w-3.5 h-3.5 text-[#c4821a]" />
                  <span>Loading dialogue history...</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-[#c4821a]" />
                  <span>Load older messages</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && !loadingMessages && (
          <div className="flex justify-center items-center h-40">
            <div
              className={`border text-xs px-5 py-3.5 rounded-2xl shadow-xs text-center max-w-xs space-y-1 ${
                isDark
                  ? 'bg-[#261f15] border-[#3d3222] text-[#e8dfd0]'
                  : 'bg-white/95 border-[#1a1410]/10 text-[#5c4d37]'
              }`}
            >
              <div
                className={`flex items-center justify-center gap-1.5 font-serif font-semibold text-xs ${
                  isDark ? 'text-[#f4efe6]' : 'text-[#1a1410]'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-[#c4821a]" />
                <span>Confidential Correspondence</span>
              </div>
              <p
                className={`text-[11px] leading-relaxed ${
                  isDark ? 'text-[#a8977e]' : 'text-[#7d6a4f]'
                }`}
              >
                Messages are private and securely delivered within Xavier AlumniConnect.
              </p>
            </div>
          </div>
        )}

        {/* Date-grouped messages */}
        {messageGroups.map((group) => (
          <div key={group.label}>
            {/* Date separator */}
            <div className="flex justify-center my-2.5">
              <span
                className={`backdrop-blur-xs border text-[10px] font-mono uppercase tracking-wider px-3 py-0.5 rounded-full shadow-2xs select-none ${
                  isDark
                    ? 'bg-[#261f15]/90 border-[#3d3222] text-[#e8dfd0]'
                    : 'bg-[#e8dfd0]/80 border-[#1a1410]/10 text-[#5c4d37]'
                }`}
              >
                {group.label}
              </span>
            </div>

            {group.messages.map((msg, idx) => {
              const isMine = msg.senderId === currentUserId;
              const isLastInRun =
                idx === group.messages.length - 1 ||
                group.messages[idx + 1]?.senderId !== msg.senderId;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isLastInRun ? 'mb-1.5' : 'mb-0.5'} group/msg-row ${
                    isMine ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Delete button — own messages only, shows on hover */}
                  {isMine && !msg.isDeleted && (
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(msg.id)}
                      className="opacity-0 group-hover/msg-row:opacity-100 self-center mr-1 p-1 rounded-md text-[#7d6a4f] hover:text-rose-600 hover:bg-rose-50/10 transition-all flex-shrink-0 cursor-pointer"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div
                    className={`
                      relative max-w-[80%] sm:max-w-[70%] px-3 py-1.5 rounded-xl shadow-2xs
                      ${
                        isMine
                          ? msg.isDeleted
                            ? isDark
                              ? 'bg-[#1a1410]/60 text-[#7d6a4f] border border-[#3d3222]/40'
                              : 'bg-[#261f15]/40 text-[#7d6a4f] border border-[#3d3222]/30'
                            : isDark
                            ? 'bg-[#2d2419] text-[#f4efe6] border border-[#4a3a27]'
                            : 'bg-[#1a1410] text-[#f4efe6] border border-[#3d3222]'
                          : msg.isDeleted
                          ? isDark
                            ? 'bg-[#1a1410]/60 text-[#7d6a4f] border border-[#3d3222]/40'
                            : 'bg-white/60 text-[#7d6a4f] border border-[#1a1410]/10'
                          : isDark
                          ? 'bg-[#261f15] text-[#f4efe6] border border-[#3d3222]'
                          : 'bg-white text-[#1a1410] border border-[#1a1410]/10'
                      }
                      ${
                        isLastInRun && !msg.isDeleted
                          ? isMine
                            ? 'rounded-tr-xs'
                            : 'rounded-tl-xs'
                          : ''
                      }
                    `}
                  >
                    {msg.isDeleted ? (
                      /* Deleted message placeholder */
                      <p className="text-xs italic text-[#7d6a4f] flex items-center gap-1.5 py-0.5 font-sans">
                        <Trash2 className="w-3 h-3 flex-shrink-0 opacity-60" />
                        <span>This message was deleted</span>
                      </p>
                    ) : (
                      <div className="flex flex-wrap items-end justify-between gap-x-2.5 gap-y-0.5">
                        {/* Message text */}
                        <p
                          className={`text-[13px] sm:text-sm leading-5 break-words whitespace-pre-wrap font-sans ${
                            isMine
                              ? 'text-[#f4efe6]'
                              : isDark
                              ? 'text-[#f4efe6]'
                              : 'text-[#1a1410]'
                          }`}
                        >
                          {msg.content}
                        </p>

                        {/* Timestamp + seen ticks */}
                        <div className="flex items-center gap-1 self-end ml-auto shrink-0 select-none">
                          <span
                            className={`text-[10px] font-mono leading-none ${
                              isMine
                                ? 'text-[#e8a93c]/80'
                                : isDark
                                ? 'text-[#a8977e]'
                                : 'text-[#7d6a4f]'
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </span>
                          {isMine &&
                            (msg.isSeen ? (
                              <span title="Seen" className="inline-flex items-center">
                                <CheckCheck className="w-3.5 h-3.5 text-[#7aab7e] flex-shrink-0" />
                              </span>
                            ) : (
                              <span title="Delivered" className="inline-flex items-center">
                                <Check className="w-3.5 h-3.5 text-[#f4efe6]/50 flex-shrink-0" />
                              </span>
                            ))}
                        </div>
                      </div>
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
            <div
              className={`border rounded-xl rounded-tl-xs px-3 py-1.5 shadow-2xs flex items-center gap-1.5 ${
                isDark
                  ? 'bg-[#261f15] border-[#3d3222] text-[#e8dfd0]'
                  : 'bg-white border-[#1a1410]/10 text-[#5c4d37]'
              }`}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#c4821a] inline-block animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
              <span
                className={`text-[10px] font-mono ml-0.5 ${
                  isDark ? 'text-[#a8977e]' : 'text-[#7d6a4f]'
                }`}
              >
                typing...
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────── */}
      <div
        className={`flex items-center gap-2.5 px-3 sm:px-4 py-3 border-t flex-shrink-0 ${
          isDark
            ? 'bg-[#1a1410] border-[#3d3222]'
            : 'bg-[#fcfbf9] border-[#1a1410]/10'
        } ${!isUserConnected ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* Text field */}
        <div
          className={`flex-1 border rounded-xl px-4 py-2 flex items-center gap-2 shadow-2xs min-h-[46px] transition-all ${
            isDark
              ? 'bg-[#261f15] border-[#3d3222] focus-within:border-[#c4821a]/60 focus-within:ring-2 focus-within:ring-[#c4821a]/20'
              : 'bg-white border-[#1a1410]/15 focus-within:border-[#1a1410] focus-within:ring-2 focus-within:ring-[#c4821a]/20'
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isUserConnected ? 'Compose a message...' : 'You can no longer message this member'
            }
            maxLength={2000}
            disabled={!isUserConnected}
            className={`flex-1 text-sm bg-transparent outline-none font-sans disabled:cursor-not-allowed ${
              isDark
                ? 'text-[#f4efe6] placeholder-[#7d6a4f]'
                : 'text-[#1a1410] placeholder-[#7d6a4f]/70'
            }`}
          />
          {/* Character counter when approaching limit */}
          {inputValue.length > 1800 && (
            <span
              className={`text-[10px] font-mono flex-shrink-0 ${
                isDark ? 'text-[#a8977e]' : 'text-[#7d6a4f]'
              }`}
            >
              {2000 - inputValue.length}
            </span>
          )}
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={`
            w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
            transition-all duration-200 border
            ${
              canSend
                ? isDark
                  ? 'bg-[#261f15] hover:bg-[#3d3222] active:scale-95 text-[#f4efe6] border-[#4a3a27] shadow-xs cursor-pointer'
                  : 'bg-[#1a1410] hover:bg-[#3d3222] active:scale-95 text-[#f4efe6] border-[#3d3222] shadow-xs cursor-pointer'
                : isDark
                ? 'bg-[#1a1410] text-[#7d6a4f]/40 border-[#3d3222]/40 cursor-not-allowed'
                : 'bg-[#e8dfd0] text-[#7d6a4f]/50 border-[#1a1410]/10 cursor-not-allowed'
            }
          `}
        >
          <Send
            className={`w-4 h-4 ml-0.5 stroke-[2] ${
              canSend
                ? 'text-[#e8a93c]'
                : isDark
                ? 'text-[#7d6a4f]/40'
                : 'text-[#7d6a4f]/50'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

