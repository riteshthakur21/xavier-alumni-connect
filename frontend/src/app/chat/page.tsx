'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare } from 'lucide-react';

import { useChatSocket, type Conversation } from '@/hooks/useChatSocket';
import { useVisualViewport } from '@/hooks/useVisualViewport';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatSettings, { type AppearancePref } from '@/components/chat/ChatSettings';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const convParam = searchParams.get('conv');
  const { user, loading } = useAuth();

  const [token, setToken] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');

  // ── Appearance / Theming State ───────────────────────────────────────────
  const [appearance, setAppearance] = useState<AppearancePref>('system');
  const [systemIsDark, setSystemIsDark] = useState<boolean>(false);

  // Initialize appearance from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('xavier_chat_appearance') as AppearancePref | null;
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
        setAppearance(saved);
      }
    } catch {
      // Ignore localStorage errors
    }

    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemIsDark(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const handleSelectAppearance = useCallback((pref: AppearancePref) => {
    setAppearance(pref);
    try {
      localStorage.setItem('xavier_chat_appearance', pref);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    appearance === 'system' ? (systemIsDark ? 'dark' : 'light') : appearance;

  // ── Fullscreen State & Logic ─────────────────────────────────────────────
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { height: vpHeight, offsetTop: vpOffsetTop, isKeyboardOpen, isMobile } = useVisualViewport();

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Prevent background page scrolling when in fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const handleToggleFullscreen = useCallback(async () => {
    const isMobileDevice =
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

    if (isMobileDevice) {
      // On mobile, native requestFullscreen() causes Android Chrome to lock the element
      // to the full physical screen height and overlay the IME keyboard over the composer.
      // An in-app viewport-driven fullscreen gives complete control over VisualViewport resizing.
      setIsFullscreen((prev) => !prev);
      return;
    }

    try {
      if (!document.fullscreenElement) {
        if (chatContainerRef.current?.requestFullscreen) {
          await chatContainerRef.current.requestFullscreen();
        } else if ((chatContainerRef.current as any)?.webkitRequestFullscreen) {
          await (chatContainerRef.current as any).webkitRequestFullscreen();
        } else {
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any)?.webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else {
          setIsFullscreen(false);
        }
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  }, []);

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
      <div
        className={`flex items-center justify-center h-screen ${
          resolvedTheme === 'dark' ? 'bg-[#14100c]' : 'bg-[#f4efe6]'
        }`}
      >
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
    <div
      ref={chatContainerRef}
      style={
        isMobile
          ? isFullscreen
            ? {
                height: vpHeight ? `${vpHeight}px` : '100dvh',
                top: `${vpOffsetTop}px`,
              }
            : isKeyboardOpen && vpHeight
            ? {
                height: `${Math.max(200, vpHeight - (window.scrollY >= 64 ? 0 : 64))}px`,
              }
            : undefined
          : undefined
      }
      className={`flex overflow-hidden transition-colors ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-[100dvh] w-[100dvw]'
          : 'h-[calc(100dvh-64px)]'
      } ${resolvedTheme === 'dark' ? 'bg-[#14100c]' : 'bg-[#f4efe6]'}`}
    >
      {/* ── Sidebar / Conversation List ────────────────────────────────── */}
      <aside
        className={[
          'flex flex-col border-r min-h-0 h-full transition-colors',
          resolvedTheme === 'dark'
            ? 'bg-[#1a1410] border-[#3d3222]'
            : 'bg-white border-[#1a1410]/10',
          // Desktop: always show at fixed width
          'md:flex md:w-[360px] lg:w-[380px] md:flex-shrink-0',
          // Mobile: full-width when showing, hidden when chat is open
          showList ? 'flex w-full' : 'hidden',
        ].join(' ')}
      >
        {/* Sidebar header */}
        <div
          className={`flex items-center justify-between px-4 ${
            isFullscreen ? 'pt-[max(0.75rem,env(safe-area-inset-top))]' : 'pt-3'
          } pb-3 bg-[#1a1410] border-b border-[#3d3222] min-h-[62px] relative flex-shrink-0`}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#e8a93c]" />
            <h2 className="text-lg font-serif tracking-wide text-[#f4efe6]">Messages</h2>
          </div>
          {/* Settings Menu Button */}
          <ChatSettings
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            appearance={appearance}
            onSelectAppearance={handleSelectAppearance}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            currentUserId={currentUserId}
            activeConversationId={activeConv?.id ?? null}
            onlineUsers={onlineUsers}
            onSelect={handleSelectConv}
            theme={resolvedTheme}
          />
        </div>
      </aside>

      {/* ── Chat Window ─────────────────────────────────────────────────── */}
      <main
        className={[
          'flex flex-col flex-1 min-h-0 h-full overflow-hidden',
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
            theme={resolvedTheme}
            isFullscreen={isFullscreen}
            isKeyboardOpen={isKeyboardOpen}
          />
        ) : (
          /* Desktop empty state — never shown on mobile (main is hidden) */
          <div
            className={`hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center transition-colors ${
              resolvedTheme === 'dark' ? 'bg-[#14100c]' : 'bg-[#f8f6f0]'
            }`}
          >
            <div
              className={`max-w-md w-full p-8 rounded-3xl border shadow-xs flex flex-col items-center ${
                resolvedTheme === 'dark'
                  ? 'bg-[#1a1410] border-[#3d3222]'
                  : 'bg-white border-[#1a1410]/10'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#261f15] border border-[#3d3222] flex items-center justify-center text-[#e8a93c] mb-4 shadow-sm">
                <MessageSquare className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3
                className={`text-xl font-serif font-normal mb-2 ${
                  resolvedTheme === 'dark' ? 'text-[#f4efe6]' : 'text-[#1a1410]'
                }`}
              >
                Xavier Alumni Network Dialogue
              </h3>
              <p
                className={`text-xs leading-relaxed mb-6 ${
                  resolvedTheme === 'dark' ? 'text-[#a8977e]' : 'text-[#5c4d37]'
                }`}
              >
                Connect directly with fellow alumni and students. Select a conversation from the sidebar or reach out to any member via the Alumni Directory.
              </p>
              <div
                className={`flex items-center gap-2 text-[11px] font-mono px-3.5 py-1.5 rounded-full border ${
                  resolvedTheme === 'dark'
                    ? 'text-[#a8977e] bg-[#261f15] border-[#3d3222]'
                    : 'text-[#7d6a4f] bg-[#f4efe6] border-[#1a1410]/8'
                }`}
              >
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

