'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare } from 'lucide-react';

import { useChatSocket, type Conversation } from '@/hooks/useChatSocket';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const convParam = searchParams.get('conv');
  const { user, loading } = useAuth();

  const [token, setToken] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');

  /**
   * Mobile layout:
   *   'list' → show conversation list full-screen
   *   'chat' → show chat window full-screen
   * Desktop: both panels always visible.
   */
  const [mobilePanel, setMobilePanel] = useState<'list' | 'chat'>('list');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else {
        const t = Cookies.get('token') || localStorage.getItem('token') || '';
        setToken(t);
        setCurrentUserId(user.id);
      }
    }
  }, [user, loading, router]);

  const {
    connected,
    messages,
    conversations,
    onlineUsers,
    typingUsers,
    loadingMessages,
    hasMore,
    isUserConnected,
    sendMessage,
    sendTyping,
    sendStopTyping,
    markSeen,
    markSeenForConv,
    loadMoreMessages,
    deleteMessage,
  } = useChatSocket({ token, conversationId: activeConv?.id });

  // Auto-select conversation from ?conv= query param
  useEffect(() => {
    if (!convParam || !conversations.length || activeConv) return;
    const found = conversations.find((c) => c.id === convParam);
    if (found) {
      setActiveConv(found);
      setMobilePanel('chat');
      // Clear unread dot immediately when conversation is opened via URL param
      markSeenForConv(found.id);
    }
  }, [convParam, conversations, activeConv, markSeenForConv]);

  const handleSelectConv = useCallback(
    (conv: Conversation) => {
      setActiveConv(conv);
      setMessageInput('');
      setMobilePanel('chat');
      // Clear the unread dot + optimistically mark isSeen in local state
      markSeenForConv(conv.id);
    },
    [markSeenForConv]
  );

  // Mobile back: return to conversation list
  const handleBack = useCallback(() => setMobilePanel('list'), []);

  const handleSend = useCallback(
    (content: string) => sendMessage(content),
    [sendMessage]
  );

  const activeTypingNames = activeConv
    ? Array.from(typingUsers.entries())
        .filter(([uid]) => uid !== currentUserId)
        .map(([, name]) => name)
    : [];

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f4efe6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#c4821a] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-[#7d6a4f] uppercase tracking-wider">
            Establishing Connection...
          </p>
        </div>
      </div>
    );
  }

  const showList = mobilePanel === 'list' || !activeConv;
  const showChat = mobilePanel === 'chat' && !!activeConv;

  return (
    <div className="flex h-[calc(100dvh-64px)] bg-[#f4efe6] overflow-hidden">
      {/* ── Sidebar / Conversation List ────────────────────────────────── */}
      <aside
        className={[
          'flex flex-col bg-white border-r border-[#1a1410]/10',
          // Desktop: always show at fixed width
          'md:flex md:w-[360px] lg:w-[380px] md:flex-shrink-0',
          // Mobile: full-width when showing, hidden when chat is open
          showList ? 'flex w-full' : 'hidden',
        ].join(' ')}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-[#1a1410] border-b border-[#3d3222] min-h-[62px]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#e8a93c]" />
            <h2 className="text-lg font-serif tracking-wide text-[#f4efe6]">Messages</h2>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                connected
                  ? 'bg-[#3a5c3e]/20 text-[#7aab7e] border-[#3a5c3e]/40'
                  : 'bg-[#fdf3e3] text-[#c4821a] border-[#c4821a]/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  connected ? 'bg-[#7aab7e] animate-pulse' : 'bg-[#c4821a] animate-ping'
                }`}
              />
              <span>{connected ? 'Live' : 'Reconnecting'}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            currentUserId={currentUserId}
            activeConversationId={activeConv?.id ?? null}
            onlineUsers={onlineUsers}
            onSelect={handleSelectConv}
          />
        </div>
      </aside>

      {/* ── Chat Window ─────────────────────────────────────────────────── */}
      <main
        className={[
          'flex flex-col flex-1 overflow-hidden',
          // Desktop: always show
          'md:flex',
          // Mobile: show only when chat panel active
          showChat ? 'flex w-full' : 'hidden',
        ].join(' ')}
      >
        {activeConv ? (
          <ChatWindow
            messages={messages}
            currentUserId={currentUserId}
            participant={activeConv.participant}
            isOnline={
              activeConv.participant
                ? onlineUsers.has(activeConv.participant.id)
                : false
            }
            typingUserNames={activeTypingNames}
            hasMore={hasMore}
            loadingMessages={loadingMessages}
            isUserConnected={isUserConnected}
            onLoadMore={loadMoreMessages}
            onSendMessage={handleSend}
            onTyping={sendTyping}
            onStopTyping={sendStopTyping}
            onMarkSeen={markSeen}
            onDeleteMessage={deleteMessage}
            inputValue={messageInput}
            setInputValue={setMessageInput}
            onBack={handleBack}
          />
        ) : (
          /* Desktop empty state — never shown on mobile (main is hidden) */
          <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#f8f6f0] p-8 text-center">
            <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-[#1a1410]/10 shadow-xs flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#261f15] border border-[#3d3222] flex items-center justify-center text-[#e8a93c] mb-4 shadow-sm">
                <MessageSquare className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-xl font-serif text-[#1a1410] font-normal mb-2">
                Xavier Alumni Network Dialogue
              </h3>
              <p className="text-xs text-[#5c4d37] leading-relaxed mb-6">
                Connect directly with fellow alumni and students. Select a conversation from the sidebar or reach out to any member via the Alumni Directory.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#7d6a4f] bg-[#f4efe6] px-3.5 py-1.5 rounded-full border border-[#1a1410]/8">
                <span className="w-2 h-2 rounded-full bg-[#3a5c3e]" />
                <span>End-to-end verified communication</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

