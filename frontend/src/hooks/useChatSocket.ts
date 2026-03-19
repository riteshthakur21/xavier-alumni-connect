'use client';

/**
 * useChatSocket.ts
 *
 * Custom hook that manages the full Socket.io lifecycle for one-to-one chat.
 *
 * Features:
 *  - Connect / disconnect socket with JWT
 *  - Join / leave conversation rooms
 *  - Send & receive messages
 *  - Typing indicators
 *  - Online presence (userOnline / userOffline)
 *  - messageSeen acknowledgment
 *  - Loading messages with infinite scroll (cursor-based pagination)
 *
 * Usage:
 *   const {
 *     messages, conversations, onlineUsers,
 *     typingUsers, connected,
 *     sendMessage, joinConversation, sendTyping, sendStopTyping, markSeen,
 *     loadMoreMessages, hasMore, loadingMessages,
 *   } = useChatSocket({ token, conversationId });
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getSocket, disconnectSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  alumniProfile?: { photoUrl?: string | null } | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isSeen: boolean;
  isDeleted?: boolean;
  createdAt: string;
  sender: ChatUser;
}

export interface Conversation {
  id: string;
  updatedAt: string;
  participant: ChatUser | null;
  lastMessage: {
    id: string;
    content: string;
    isSeen: boolean;
    createdAt: string;
    senderId: string;
  } | null;
}

interface UseChatSocketOptions {
  token: string;
  conversationId?: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const PAGE_SIZE = 20;

export const useChatSocket = ({
  token,
  conversationId,
}: UseChatSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  // FIX: keeps a ref to the currently-active conversationId so that the
  // socket event handler (which captures its closure once on mount) can still
  // read the *current* value without going stale.
  const activeConvIdRef = useRef<string | null | undefined>(conversationId);

  // ── State ──────────────────────────────────────────────────────────────────
  const [connected, setConnected]           = useState(false);
  const [messages, setMessages]             = useState<Message[]>([]);
  const [conversations, setConversations]   = useState<Conversation[]>([]);
  const [onlineUsers, setOnlineUsers]       = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers]       = useState<Map<string, string>>(new Map()); // userId -> name
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMore, setHasMore]               = useState(true);
  const [isUserConnected, setIsUserConnected] = useState(true);
  const isUserConnectedRef                  = useRef(true);
  const cursorRef                           = useRef<string | null>(null);

  // FIX: sync the ref every time the active conversation changes so the socket
  // handler (closed over on mount) always sees the current conversation id.
  useEffect(() => {
    activeConvIdRef.current = conversationId;
  }, [conversationId]);

  // Keep the ref in sync with isUserConnected state so callbacks always read
  // the latest value without needing to re-create closures.
  useEffect(() => {
    isUserConnectedRef.current = isUserConnected;
  }, [isUserConnected]);

  // ── Auth header helper ─────────────────────────────────────────────────────
  const authHeader = useCallback(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  // ── Fetch conversations (REST) ─────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/chat/conversations`, authHeader());
      setConversations(data.data ?? []);
    } catch (err) {
      console.error('[useChatSocket] fetchConversations:', err);
    }
  }, [authHeader]);

  // ── Load initial messages (REST) ───────────────────────────────────────────
  const loadInitialMessages = useCallback(
    async (convId: string) => {
      setLoadingMessages(true);
      cursorRef.current = null;
      try {
        const { data } = await axios.get(
          `${API_URL}/api/chat/messages/${convId}?limit=${PAGE_SIZE}`,
          authHeader()
        );
        const result = data.data;
        setMessages(result.messages ?? []);
        cursorRef.current = result.nextCursor;
        setHasMore(!!result.nextCursor);
        if (typeof result.connected === 'boolean') {
          setIsUserConnected(result.connected);
        }
      } catch (err) {
        console.error('[useChatSocket] loadInitialMessages:', err);
      } finally {
        setLoadingMessages(false);
      }
    },
    [authHeader]
  );

  // ── Load more (infinite scroll) ────────────────────────────────────────────
  const loadMoreMessages = useCallback(async () => {
    if (!conversationId || loadingMessages || !hasMore || !cursorRef.current) return;

    setLoadingMessages(true);
    try {
      const { data } = await axios.get(
        `${API_URL}/api/chat/messages/${conversationId}?limit=${PAGE_SIZE}&cursor=${cursorRef.current}`,
        authHeader()
      );
      const result = data.data;
      setMessages((prev) => [...(result.messages ?? []), ...prev]); // prepend older messages
      cursorRef.current = result.nextCursor;
      setHasMore(!!result.nextCursor);
    } catch (err) {
      console.error('[useChatSocket] loadMoreMessages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [conversationId, loadingMessages, hasMore, authHeader]);

  // ── Socket setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const s = getSocket(token);
    socketRef.current = s;

    const onConnect    = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onReceiveMessage = (msg: Message) => {
      setMessages((prev) => {
        // Deduplicate by id
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // FIX: if the new message is for the conversation the user is currently
      // viewing, immediately emit messageSeen. This ensures the server marks
      // the message as read BEFORE fetchConversations() re-fetches the list,
      // so the blue dot never flickers on for the active conversation.
      if (msg.conversationId === activeConvIdRef.current) {
        socketRef.current?.emit('messageSeen', { conversationId: msg.conversationId });
      }
      // Refresh conversation list so last-message preview updates
      fetchConversations();
    };

    const onUserOnline  = ({ userId }: { userId: string }) =>
      setOnlineUsers((prev) => { const s = new Set(prev); s.add(userId); return s; });

    const onUserOffline = ({ userId }: { userId: string }) =>
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });

    const onTyping = ({ userId, userName }: { userId: string; userName: string }) =>
      setTypingUsers((prev) => { const m = new Map(prev); m.set(userId, userName); return m; });

    const onStopTyping = ({ userId }: { userId: string }) =>
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });

    const onMessagesSeen = ({ conversationId: cId }: { conversationId: string; seenBy: string }) => {
      if (cId === conversationId) {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, isSeen: true }))
        );
      }
    };

    const onMessageDeleted = ({ messageId }: { messageId: string; conversationId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, isDeleted: true, content: '' } : m
        )
      );
    };

    const onError = (err: { event: string; message: string; code?: string }) => {
      console.error(`[socket] server error on ${err.event}:`, err.message);
      // Catch connection-related errors from sendMessage or joinConversation
      if (
        err.code === 'CHAT_NOT_CONNECTED' ||
        (err.event === 'sendMessage' && /no longer connected/i.test(err.message))
      ) {
        setIsUserConnected(false);
        toast.error('You cannot message this user because you are no longer connected.');
      }
    };

    s.on('connect',        onConnect);
    s.on('disconnect',     onDisconnect);
    s.on('receiveMessage', onReceiveMessage);
    s.on('userOnline',     onUserOnline);
    s.on('userOffline',    onUserOffline);
    s.on('typing',         onTyping);
    s.on('stopTyping',     onStopTyping);
    s.on('messagesSeen',   onMessagesSeen);
    s.on('messageDeleted', onMessageDeleted);
    s.on('error',          onError);

    // Fetch conversations on mount
    fetchConversations();

    return () => {
      s.off('connect',        onConnect);
      s.off('disconnect',     onDisconnect);
      s.off('receiveMessage', onReceiveMessage);
      s.off('userOnline',     onUserOnline);
      s.off('userOffline',    onUserOffline);
      s.off('typing',         onTyping);
      s.off('stopTyping',     onStopTyping);
      s.off('messagesSeen',   onMessagesSeen);
      s.off('messageDeleted', onMessageDeleted);
      s.off('error',          onError);
    };
  }, [token, fetchConversations]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Join conversation room when conversationId changes ────────────────────
  useEffect(() => {
    if (!conversationId || !socketRef.current) return;

    socketRef.current.emit('joinConversation', { conversationId });
    loadInitialMessages(conversationId);

    return () => {
      // No explicit leave needed — room is cleaned up on disconnect
      // But reset message state when switching conversations
      setMessages([]);
      cursorRef.current = null;
      setHasMore(true);
      setIsUserConnected(true);
      isUserConnectedRef.current = true;
    };
  }, [conversationId, loadInitialMessages]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (content: string) => {
      if (!conversationId || !socketRef.current || !content.trim()) return;
      if (!isUserConnectedRef.current) {
        toast.error('You cannot message this user because you are no longer connected.');
        return;
      }
      socketRef.current.emit('sendMessage', { conversationId, content: content.trim() });
    },
    [conversationId]
  );

  const joinConversation = useCallback((convId: string) => {
    socketRef.current?.emit('joinConversation', { conversationId: convId });
  }, []);

  const sendTyping = useCallback(() => {
    if (!conversationId) return;
    socketRef.current?.emit('typing', { conversationId });
  }, [conversationId]);

  const sendStopTyping = useCallback(() => {
    if (!conversationId) return;
    socketRef.current?.emit('stopTyping', { conversationId });
  }, [conversationId]);

  const markSeen = useCallback(() => {
    if (!conversationId) return;
    socketRef.current?.emit('messageSeen', { conversationId });
  }, [conversationId]);

  // FIX: new action — mark a specific conversation as read by id.
  // Called immediately when the user clicks a conversation so the blue dot
  // disappears at once, before the server round-trip from fetchConversations().
  //  - Emits the messageSeen socket event (backend updates isSeen in the DB)
  //  - Optimistically flips lastMessage.isSeen in local `conversations` state
  //    so the sidebar re-renders synchronously without waiting for REST data.
  const markSeenForConv = useCallback((convId: string) => {
    socketRef.current?.emit('messageSeen', { conversationId: convId });
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId && c.lastMessage
          ? { ...c, lastMessage: { ...c.lastMessage, isSeen: true } }
          : c
      )
    );
  }, []);

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!conversationId || !socketRef.current) return;
      socketRef.current.emit('deleteMessage', { messageId, conversationId });
    },
    [conversationId]
  );

  const createConversation = useCallback(
    async (targetUserId: string): Promise<Conversation | null> => {
      try {
        const { data } = await axios.post(
          `${API_URL}/api/chat/create-conversation`,
          { targetUserId },
          authHeader()
        );
        await fetchConversations();
        return data.data;
      } catch (err) {
        console.error('[useChatSocket] createConversation:', err);
        return null;
      }
    },
    [authHeader, fetchConversations]
  );

  return {
    // State
    connected,
    messages,
    conversations,
    onlineUsers,
    typingUsers,
    loadingMessages,
    hasMore,
    isUserConnected,
    // Actions
    sendMessage,
    joinConversation,
    sendTyping,
    sendStopTyping,
    markSeen,
    markSeenForConv,      // FIX: exported for use in page.tsx handleSelectConv
    deleteMessage,
    createConversation,
    loadMoreMessages,
    fetchConversations,
  };
};
