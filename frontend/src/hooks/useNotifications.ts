'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { getSocket } from '@/lib/socket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

export interface UseNotificationsOptions {
  page?: number;
  limit?: number;
}

export function useNotifications(isLoggedIn: boolean, options?: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const page = options?.page || 1;
  const limit = options?.limit || 20;

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/notifications`, {
        params: { page, limit },
        withCredentials: true,
      });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('[Notifications] fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, page, limit]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    } else {
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
      // Add the new notification to the top of the list
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Trigger hot-toast alert
      toast(`${notif.title}\n${notif.message}`, {
        icon: '🔔',
        duration: 4000,
      });
    };

    socket.on('notification', handleNewNotification);
    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [isLoggedIn]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await axios.patch(`${API_URL}/api/notifications/${id}/read`, {}, { withCredentials: true });
    } catch (err) {
      console.error('[Notifications] markRead failed', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await axios.patch(`${API_URL}/api/notifications/read-all`, {}, { withCredentials: true });
    } catch (err) {
      console.error('[Notifications] markAllRead failed', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    const notif = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (notif && !notif.isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await axios.delete(`${API_URL}/api/notifications/${id}`, { withCredentials: true });
    } catch (err) {
      console.error('[Notifications] delete failed', err);
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    pagination,
    markRead,
    markAllRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}
