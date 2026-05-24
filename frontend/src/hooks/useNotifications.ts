'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { getSocket } from '@/lib/socket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications(isLoggedIn: boolean) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/notifications?limit=20`, {
        withCredentials: true,
      });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('[Notifications] fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchNotifications();
    }
    if (!isLoggedIn) {
      fetchedRef.current = false;
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isLoggedIn, fetchNotifications]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const token = Cookies.get('token') || '';
    const socket = getSocket(token);
    if (!socket) return;
    const handleNewNotification = (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };
    socket.on('notification', handleNewNotification);
    return () => { socket.off('notification', handleNewNotification); };
  }, [isLoggedIn]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, { withCredentials: true });
    } catch (err) {
      console.error('[Notifications] markRead failed', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await axios.patch(`${API_URL}/notifications/read-all`, {}, { withCredentials: true });
    } catch (err) {
      console.error('[Notifications] markAllRead failed', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    const notif = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (notif && !notif.isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await axios.delete(`${API_URL}/notifications/${id}`, { withCredentials: true });
    } catch (err) {
      console.error('[Notifications] delete failed', err);
    }
  }, [notifications]);

  return { notifications, unreadCount, loading, markRead, markAllRead, deleteNotification, refetch: fetchNotifications };
}
