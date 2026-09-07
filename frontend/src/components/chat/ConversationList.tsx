'use client';

import React from 'react';
import type { Conversation } from '@/hooks/useChatSocket';
import { MessageSquare } from 'lucide-react';

interface Props {
  conversations: Conversation[];
  currentUserId: string;
  activeConversationId: string | null;
  onlineUsers: Set<string>;
  onSelect: (conv: Conversation) => void;
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
  onlineUsers,
  onSelect,
}: Props) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12 text-[#5c4d37]">
        <div className="w-12 h-12 rounded-2xl bg-[#f4efe6] border border-[#1a1410]/10 flex items-center justify-center text-[#7d6a4f] mb-3 shadow-2xs">
          <MessageSquare className="w-6 h-6 stroke-[1.5] text-[#c4821a]" />
        </div>
        <h3 className="font-serif text-sm font-semibold text-[#1a1410] mb-1">No Active Dialogues</h3>
        <p className="text-xs text-[#7d6a4f] max-w-[210px] leading-relaxed">
          Open an alumni profile and click &quot;Message&quot; to initiate a correspondence.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[#1a1410]/8 overflow-y-auto">
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
                ? 'bg-[#f4efe6] shadow-2xs'
                : 'bg-white hover:bg-[#faf7f2]'
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-[#261f15] border border-[#3d3222] text-[#e8a93c] flex items-center justify-center font-serif font-bold text-base select-none shadow-2xs">
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
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#3a5c3e] border-2 border-white"
                  title="Online"
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p
                  className={`text-sm truncate ${
                    unread ? 'font-semibold text-[#1a1410]' : 'font-medium text-[#1a1410]'
                  }`}
                >
                  {conv.participant?.name ?? 'Unknown'}
                </p>
                {conv.lastMessage && (
                  <span className="text-[10px] font-mono text-[#7d6a4f] flex-shrink-0 ml-1.5">
                    {timeAgo(conv.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <p
                className={`text-xs truncate ${
                  unread ? 'text-[#1a1410] font-semibold' : 'text-[#5c4d37]'
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
