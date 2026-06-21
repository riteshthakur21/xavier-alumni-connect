'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications, Notification } from '@/hooks/useNotifications';

const NotifIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'CONNECTION_REQUEST':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      );
    case 'CONNECTION_ACCEPTED':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <polyline points="16 11 18 13 22 9" />
        </svg>
      );
    case 'STORY_APPROVED':
    case 'STORY_REJECTED':
    case 'NEW_STORY':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'NEW_MESSAGE':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'EVENT_CREATED':
    case 'EVENT_UPDATED':
    case 'EVENT_CANCELLED':
    case 'EVENT_REGISTERED':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case 'JOB_POSTED':
    case 'JOB_UPDATED':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case 'SYSTEM':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
  }
};

const typeColor = (type: string) => {
  switch (type) {
    case 'CONNECTION_REQUEST':  return 'bg-blue-100 text-blue-600';
    case 'CONNECTION_ACCEPTED': return 'bg-green-100 text-green-600';
    case 'STORY_APPROVED':      return 'bg-emerald-100 text-emerald-600';
    case 'STORY_REJECTED':      return 'bg-red-100 text-red-600';
    case 'NEW_STORY':           return 'bg-indigo-100 text-indigo-600';
    case 'NEW_MESSAGE':         return 'bg-violet-100 text-violet-600';
    case 'EVENT_CREATED':
    case 'EVENT_UPDATED':
    case 'EVENT_CANCELLED':
    case 'EVENT_REGISTERED':    return 'bg-emerald-100 text-emerald-600';
    case 'JOB_POSTED':
    case 'JOB_UPDATED':         return 'bg-amber-100 text-amber-600';
    case 'SYSTEM':              return 'bg-rose-100 text-rose-600';
    default:                    return 'bg-slate-100 text-slate-500';
  }
};

const relativeTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const NotifRow: React.FC<{
  notif: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (link: string | null, id: string) => void;
}> = ({ notif, onRead, onDelete, onNavigate }) => (
  <div
    className={`group flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer relative ${!notif.isRead ? 'bg-blue-50/40' : ''}`}
    onClick={() => onNavigate(notif.link, notif.id)}
  >
    {!notif.isRead && (
      <span className="absolute left-1.5 top-4 w-1.5 h-1.5 rounded-full bg-blue-500" />
    )}
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${typeColor(notif.type)}`}>
      <NotifIcon type={notif.type} />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
        {notif.title}
      </p>
      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
      <p className="text-[11px] text-slate-400 mt-1">{relativeTime(notif.createdAt)}</p>
    </div>
    <button
      onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-400"
      title="Remove"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
);

interface NotificationBellProps {
  isLoggedIn: boolean;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ isLoggedIn }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef   = useRef<HTMLButtonElement>(null);

  const { notifications, unreadCount, loading, markRead, markAllRead, deleteNotification } =
    useNotifications(isLoggedIn, { limit: 10 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current   && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isLoggedIn) return null;

  const handleNavigate = (link: string | null, id: string) => {
    if (!notifications.find((n) => n.id === id)?.isRead) markRead(id);
    setOpen(false);
    if (link) router.push(link);
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${open ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
        title="Notifications"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="fixed left-4 right-4 top-[72px] sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-80 max-h-[420px] flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200/80 z-50 overflow-hidden"
          style={{ animation: 'notifFadeIn 0.15s ease' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <svg className="w-10 h-10 text-slate-200 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p className="text-sm font-medium text-slate-400">All caught up!</p>
                <p className="text-xs text-slate-300 mt-0.5">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <NotifRow key={n.id} notif={n} onRead={markRead} onDelete={deleteNotification} onNavigate={handleNavigate} />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-2 text-center bg-slate-50/50">
            <button
              onClick={() => {
                setOpen(false);
                router.push('/notifications');
              }}
              className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-bold py-1.5 hover:underline transition-colors"
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}

      <style suppressHydrationWarning>{`
        @keyframes notifFadeIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
