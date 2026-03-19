'use client';

import type { Conversation } from '@/hooks/useChatSocket';

interface Props {
  conversations: Conversation[];
  currentUserId: string;
  activeConversationId: string | null;
  onlineUsers: Set<string>;
  onSelect: (conv: Conversation) => void;
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
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
      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm px-4 text-center">
        <p>No conversations yet.</p>
        <p className="mt-1">Open an alumni profile and click &quot;Message&quot; to start.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 overflow-y-auto">
      {conversations.map((conv) => {
        const isActive  = conv.id === activeConversationId;
        const isOnline  = conv.participant ? onlineUsers.has(conv.participant.id) : false;
        // FIX: added `&& !isActive` — never show the blue dot for the conversation
        // that is currently open, even if the server-side isSeen hasn't updated yet
        // (race between markSeen socket emit and the fetchConversations REST call).
        const unread    = conv.lastMessage &&
          conv.lastMessage.senderId !== currentUserId &&
          !conv.lastMessage.isSeen &&
          !isActive;

        return (
          <li
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
              isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-base select-none">
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
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm truncate ${unread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                  {conv.participant?.name ?? 'Unknown'}
                </p>
                {conv.lastMessage && (
                  <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                    {timeAgo(conv.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <p className={`text-xs truncate ${unread ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                {conv.lastMessage
                  ? (conv.lastMessage.senderId === currentUserId ? 'You: ' : '') +
                    conv.lastMessage.content
                  : 'No messages yet'}
              </p>
            </div>

            {/* Unread dot */}
            {unread && (
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
            )}
          </li>
        );
      })}
    </ul>
  );
}
