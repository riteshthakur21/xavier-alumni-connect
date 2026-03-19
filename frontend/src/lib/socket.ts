/**
 * socket.ts — Singleton Socket.io client
 *
 * Usage:
 *   import { getSocket, disconnectSocket } from '@/lib/socket';
 *
 *   const socket = getSocket(token);   // connect / reuse
 *   disconnectSocket();                // logout cleanup
 *
 * The token must be the raw JWT string (without "Bearer " prefix).
 * Pass it during login and remove it on logout.
 */

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Returns the existing connected socket or creates a new one.
 * Calling this multiple times with the same token is safe (singleton).
 */
export const getSocket = (token: string): Socket => {
  if (socket && socket.connected) return socket;

  // Disconnect any stale socket before creating a fresh one
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(API_URL, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('[socket] connected:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.error('[socket] connect error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[socket] disconnected:', reason);
  });

  return socket;
};

/**
 * Disconnects and destroys the socket instance.
 * Call on logout.
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[socket] manually disconnected');
  }
};

/**
 * Returns the socket if it exists (may be null before first getSocket call).
 */
export const getExistingSocket = (): Socket | null => socket;
