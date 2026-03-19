'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

import { useChatSocket, type Conversation } from '@/hooks/useChatSocket';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';

const decodeJwt = (token: string): { userId?: string; id?: string } | null => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

export default function ChatPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const convParam    = searchParams.get('conv');

  const [token,         setToken]         = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [activeConv,    setActiveConv]    = useState<Conversation | null>(null);
  const [messageInput,  setMessageInput]  = useState('');

  /**
   * Mobile layout:
   *   'list' → show conversation list full-screen
   *   'chat' → show chat window full-screen
   * Desktop: both panels always visible.
   */
  const [mobilePanel, setMobilePanel] = useState<'list' | 'chat'>('list');

  useEffect(() => {
    const t = Cookies.get('token');
    if (!t) { router.replace('/login'); return; }
    const decoded = decodeJwt(t);
    const uid = decoded?.userId ?? decoded?.id ?? '';
    if (!uid) { router.replace('/login'); return; }
    setToken(t);
    setCurrentUserId(uid);
  }, [router]);

  const {
    connected, messages, conversations, onlineUsers,
    typingUsers, loadingMessages, hasMore, isUserConnected,
    sendMessage, sendTyping, sendStopTyping, markSeen, markSeenForConv, loadMoreMessages, deleteMessage,
  } = useChatSocket({ token, conversationId: activeConv?.id });

  // Auto-select conversation from ?conv= query param
  useEffect(() => {
    if (!convParam || !conversations.length || activeConv) return;
    const found = conversations.find((c) => c.id === convParam);
    if (found) {
      setActiveConv(found);
      setMobilePanel('chat');
      // FIX: clear unread dot immediately when conversation is opened via URL param
      markSeenForConv(found.id);
    }
  }, [convParam, conversations, activeConv, markSeenForConv]);

  const handleSelectConv = useCallback((conv: Conversation) => {
    setActiveConv(conv);
    setMessageInput('');
    setMobilePanel('chat');
    // FIX: immediately clear the unread dot + optimistically mark isSeen in local
    // state so the sidebar updates synchronously before the server responds.
    // This also emits the messageSeen socket event so the DB is updated.
    markSeenForConv(conv.id);
  }, [markSeenForConv]);

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
      <div className="flex items-center justify-center h-screen bg-[#f0f2f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const showList = mobilePanel === 'list' || !activeConv;
  const showChat = mobilePanel === 'chat' && !!activeConv;

  return (
    <div className="flex h-[calc(100dvh-64px)] bg-[#f0f2f5] overflow-hidden">

      {/* ── Sidebar / Conversation List ────────────────────────────────── */}
      <aside
        className={[
          'flex flex-col bg-white border-r border-gray-200',
          // Desktop: always show at fixed width
          'md:flex md:w-[360px] md:flex-shrink-0',
          // Mobile: full-width when showing, hidden when chat is open
          showList ? 'flex w-full' : 'hidden',
        ].join(' ')}
      >
        {/* Sidebar header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-white/10 min-h-[60px]"
          style={{ background: 'linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%)' }}
        >
          <h2 className="text-xl font-bold text-white">Chats</h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                connected ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
              }`}
              title={connected ? 'Connected' : 'Reconnecting...'}
            />
            {!connected && (
              <span className="text-[10px] text-white/70">Reconnecting</span>
            )}
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
          <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#f0f2f5]">
            <div className="text-center">
              <div className="w-28 h-28 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-5">
                <svg className="w-14 h-14 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-500 mb-1">Xavier AlumniConnect</h3>
              <p className="text-sm text-gray-400">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
