'use client';

import React, { useState, useEffect } from 'react';
import type { Conversation } from '@/hooks/useChatSocket';
import { MessageSquare } from 'lucide-react';
import { formatConversationTimestamp } from '@/lib/date';

interface Props {
  conversations: Conversation[];
  currentUserId: string;
  activeConversationId: string | null;
  onlineUsers: Set<string>;
  onSelect: (conv: Conversation) => void;
  theme?: 'light' | 'dark';
}

export default function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
  onlineUsers,
  onSelect,
  theme = 'light',
}: Props) {
  const isDark = theme === 'dark';

  // Periodic ticker to automatically refresh relative timestamps as time passes
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000); // 30s interval
    return () => clearInterval(timer);
  }, []);

  if (conversations.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-full text-center px-6 py-12 ${
          isDark ? 'text-[#e8dfd0]/80' : 'text-[#5c4d37]'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3 shadow-2xs ${
            isDark
              ? 'bg-[#261f15] border-[#3d3222] text-[#e8a93c]'
              : 'bg-[#f4efe6] border-[#1a1410]/10 text-[#7d6a4f]'
          }`}
        >
          <MessageSquare className="w-6 h-6 stroke-[1.5] text-[#c4821a]" />
        </div>
        <h3
          className={`font-serif text-sm font-semibold mb-1 ${
            isDark ? 'text-[#f4efe6]' : 'text-[#1a1410]'
          }`}
        >
          No Active Dialogues
        </h3>
        <p
          className={`text-xs max-w-[210px] leading-relaxed ${
            isDark ? 'text-[#a8977e]' : 'text-[#7d6a4f]'
          }`}
        >
          Open an alumni profile and click &quot;Message&quot; to initiate a correspondence.
        </p>
      </div>
    );
  }

  return (
    <ul
      className={`divide-y overflow-y-auto ${
        isDark ? 'divide-[#3d3222]/60 bg-[#1a1410]' : 'divide-[#1a1410]/8 bg-white'
      }`}
    >
      {conversations.map((conv) => {
        const isActive = conv.id === activeConversationId;
        const isOnline = conv.participant ? onlineUsers.has(conv.participant.id) : false;
        // Never show unread badge for the currently active/open conversation
        const unread =
          conv.lastMessage &&
          conv.lastMessage.senderId !== currentUserId &&
          !conv.lastMessage.isSeen &&
          !isActive;

        return (
          <li
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all ${
              isActive
                ? isDark
                  ? 'bg-[#261f15] shadow-2xs'
                  : 'bg-[#f4efe6] shadow-2xs'
                : isDark
                ? 'bg-[#1a1410] hover:bg-[#261f15]/70'
                : 'bg-white hover:bg-[#faf7f2]'
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-11 h-11 rounded-full overflow-hidden border flex items-center justify-center font-serif font-bold text-base select-none shadow-2xs ${
                  isDark
                    ? 'bg-[#14100c] border-[#3d3222] text-[#e8a93c]'
                    : 'bg-[#261f15] border-[#3d3222] text-[#e8a93c]'
                }`}
              >
                {conv.participant?.alumniProfile?.photoUrl ? (
                  <img
                    src={conv.participant.alumniProfile.photoUrl}
                    alt={conv.participant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  conv.participant?.name?.[0]?.toUpperCase() ?? '?'
                )}
              </div>
              {isOnline && (
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#3a5c3e] border-2 ${
                    isDark ? 'border-[#1a1410]' : 'border-white'
                  }`}
                  title="Online"
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p
                  className={`text-sm truncate ${
                    unread
                      ? `font-semibold ${isDark ? 'text-[#f4efe6]' : 'text-[#1a1410]'}`
                      : `font-medium ${isDark ? 'text-[#e8dfd0]' : 'text-[#1a1410]'}`
                  }`}
                >
                  {conv.participant?.name ?? 'Unknown'}
                </p>
                {conv.lastMessage && (
                  <span
                    className={`text-[10px] font-mono flex-shrink-0 ml-1.5 ${
                      isDark ? 'text-[#a8977e]' : 'text-[#7d6a4f]'
                    }`}
                  >
                    {formatConversationTimestamp(conv.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <p
                className={`text-xs truncate ${
                  unread
                    ? `font-semibold ${isDark ? 'text-[#f4efe6]' : 'text-[#1a1410]'}`
                    : isDark
                    ? 'text-[#a8977e]'
                    : 'text-[#5c4d37]'
                }`}
              >
                {conv.lastMessage
                  ? (conv.lastMessage.senderId === currentUserId ? 'You: ' : '') +
                    conv.lastMessage.content
                  : 'No messages yet'}
              </p>
            </div>

            {/* Unread indicator */}
            {unread && (
              <span
                className="w-2.5 h-2.5 rounded-full bg-[#c4821a] flex-shrink-0 shadow-2xs"
                title="New message"
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
