'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getSocket } from '@/lib/socket';
import {
  Bell,
  MessageSquare,
  Calendar,
  Briefcase,
  BookOpen,
  UserPlus,
  ShieldAlert,
  Trash2,
  Search,
  CheckCheck,
  Loader2,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const ANIM_STYLES = `
  @keyframes notif-fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .notif-card-fade {
    animation: notif-fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .gradient-tab-active {
    background: linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%);
    color: white !important;
  }
  .gradient-btn {
    background: linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%);
    transition: opacity 0.2s ease, box-shadow 0.2s ease;
  }
  .gradient-btn:hover {
    opacity: 0.92;
    box-shadow: 0 4px 12px rgba(33, 33, 143, 0.25);
  }
`;

// Helper for type icons
const NotifIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'NEW_MESSAGE':
      return <MessageSquare className="w-5 h-5 text-violet-500" />;
    case 'CONNECTION_REQUEST':
    case 'CONNECTION_ACCEPTED':
      return <UserPlus className="w-5 h-5 text-blue-500" />;
    case 'EVENT_CREATED':
    case 'EVENT_UPDATED':
    case 'EVENT_CANCELLED':
    case 'EVENT_REGISTERED':
      return <Calendar className="w-5 h-5 text-emerald-500" />;
    case 'JOB_POSTED':
    case 'JOB_UPDATED':
      return <Briefcase className="w-5 h-5 text-amber-500" />;
    case 'STORY_APPROVED':
    case 'STORY_REJECTED':
    case 'NEW_STORY':
      return <BookOpen className="w-5 h-5 text-indigo-500" />;
    case 'SYSTEM':
      return <ShieldAlert className="w-5 h-5 text-rose-500" />;
    default:
      return <Bell className="w-5 h-5 text-slate-500" />;
  }
};

const typeBg = (type: string) => {
  switch (type) {
    case 'NEW_MESSAGE': return 'bg-violet-50';
    case 'CONNECTION_REQUEST':
    case 'CONNECTION_ACCEPTED': return 'bg-blue-50';
    case 'EVENT_CREATED':
    case 'EVENT_UPDATED':
    case 'EVENT_CANCELLED':
    case 'EVENT_REGISTERED': return 'bg-emerald-50';
    case 'JOB_POSTED':
    case 'JOB_UPDATED': return 'bg-amber-50';
    case 'STORY_APPROVED':
    case 'STORY_REJECTED':
    case 'NEW_STORY': return 'bg-indigo-50';
    case 'SYSTEM': return 'bg-rose-50';
    default: return 'bg-slate-50';
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

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isLoggedIn = !!user;

  // ── States ────────────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ── Filters & Search ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<string>('all'); // all, messages, events, jobs, stories, connections, system, unread
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [readStatusFilter, setReadStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Auth Redirect Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Fetch Core function
  const fetchNotifications = useCallback(async (pageNum: number, category: string, searchStr: string, status: string, order: string, append = false) => {
    if (!isLoggedIn) return;
    try {
      if (append) {
        setLoadMoreLoading(true);
      } else {
        setLoading(true);
      }

      let unreadQuery = undefined;
      if (status === 'unread' || category === 'unread') {
        unreadQuery = 'true';
      } else if (status === 'read') {
        unreadQuery = 'false';
      }

      const categoryFilter = category === 'unread' ? 'all' : category;

      const res = await axios.get(`${API_URL}/api/notifications`, {
        params: {
          page: pageNum,
          limit: 15,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          search: searchStr ? searchStr : undefined,
          unread: unreadQuery
        },
        withCredentials: true,
      });

      const newNotifs = res.data.notifications || [];
      setUnreadCount(res.data.unreadCount || 0);
      setTotalPages(res.data.pagination?.pages || 1);

      // Sort dynamically on client if needed, backend defaults to desc
      const sortedNotifs = [...newNotifs].sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return order === 'asc' ? timeA - timeB : timeB - timeA;
      });

      if (append) {
        setNotifications((prev) => [...prev, ...sortedNotifs]);
      } else {
        setNotifications(sortedNotifs);
      }
    } catch (err) {
      console.error('[Notifications] load failed:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setLoadMoreLoading(false);
    }
  }, [isLoggedIn]);

  // Reset page and refetch when filters change
  useEffect(() => {
    if (isLoggedIn) {
      setPage(1);
      fetchNotifications(1, activeTab, debouncedSearch, readStatusFilter, sortOrder, false);
    }
  }, [activeTab, debouncedSearch, readStatusFilter, sortOrder, isLoggedIn, fetchNotifications]);

  // Handle pagination load more
  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, activeTab, debouncedSearch, readStatusFilter, sortOrder, true);
    }
  };

  // Socket Live connection listener
  useEffect(() => {
    if (!isLoggedIn) return;
    const token = Cookies.get('token') || '';
    const socket = getSocket(token);
    if (!socket) return;

    const handleNewNotification = (notif: Notification) => {
      // Check if it fits the current filters
      let matchesCategory = true;
      if (activeTab === 'unread' && notif.isRead) {
        matchesCategory = false;
      } else if (activeTab !== 'all' && activeTab !== 'unread') {
        const cat = activeTab.toLowerCase();
        if (cat === 'messages' && notif.type !== 'NEW_MESSAGE') matchesCategory = false;
        else if (cat === 'events' && !['EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_CANCELLED', 'EVENT_REGISTERED'].includes(notif.type)) matchesCategory = false;
        else if (cat === 'jobs' && !['JOB_POSTED', 'JOB_UPDATED'].includes(notif.type)) matchesCategory = false;
        else if (cat === 'stories' && !['STORY_APPROVED', 'STORY_REJECTED', 'NEW_STORY'].includes(notif.type)) matchesCategory = false;
        else if (cat === 'connections' && !['CONNECTION_REQUEST', 'CONNECTION_ACCEPTED'].includes(notif.type)) matchesCategory = false;
        else if (cat === 'system' && !['GENERAL', 'SYSTEM'].includes(notif.type)) matchesCategory = false;
      }

      let matchesSearch = true;
      if (debouncedSearch) {
        const searchVal = debouncedSearch.toLowerCase();
        if (
          !notif.title.toLowerCase().includes(searchVal) &&
          !notif.message.toLowerCase().includes(searchVal) &&
          !notif.type.toLowerCase().includes(searchVal)
        ) {
          matchesSearch = false;
        }
      }

      if (matchesCategory && matchesSearch) {
        setNotifications((prev) => {
          // Prevent duplicates
          if (prev.find((n) => n.id === notif.id)) return prev;
          return sortOrder === 'desc' ? [notif, ...prev] : [...prev, notif];
        });
      }

      // Always increment unread badge count
      setUnreadCount((prev) => prev + 1);

      // Trigger toaster pop
      toast(`${notif.title}\n${notif.message}`, {
        icon: '🔔',
        duration: 4000,
      });
    };

    socket.on('notification', handleNewNotification);
    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [isLoggedIn, activeTab, debouncedSearch, sortOrder]);

  // Actions
  const handleMarkRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await axios.patch(`${API_URL}/api/notifications/${id}/read`, {}, { withCredentials: true });
    } catch (err) {
      console.error('[Notifications] Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    // Optimistic UI
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await axios.patch(`${API_URL}/api/notifications/read-all`, {}, { withCredentials: true });
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('[Notifications] Failed to mark all read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    const originalNotifs = [...notifications];
    const notif = notifications.find((n) => n.id === id);

    // Optimistic remove
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (notif && !notif.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await axios.delete(`${API_URL}/api/notifications/${id}`, { withCredentials: true });
      toast.success('Notification deleted');
    } catch (err) {
      setNotifications(originalNotifs);
      console.error('[Notifications] Delete failed:', err);
      toast.error('Failed to delete notification');
    }
  };

  const handleRowClick = (notif: Notification) => {
    if (!notif.isRead) {
      handleMarkRead(notif.id);
    }
    if (notif.link) {
      router.push(notif.link);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Sidebar item list
  const sidebarItems = [
    { id: 'all', label: 'All', icon: <Bell className="w-4 h-4" /> },
    { id: 'unread', label: 'Unread', icon: <CheckCheck className="w-4 h-4" />, badge: unreadCount },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'stories', label: 'Stories', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'connections', label: 'Connections', icon: <UserPlus className="w-4 h-4" /> },
    { id: 'system', label: 'System', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <>
      <style suppressHydrationWarning>{`
        ${ANIM_STYLES}
      `}</style>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* ── SIDEBAR TABS ── */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 px-2">Categories</h2>
                <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 pb-3 lg:pb-0 scrollbar-none">
                  {sidebarItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap lg:w-full select-none ${
                          isActive
                            ? 'gradient-tab-active shadow-md'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-transparent'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isActive ? 'bg-white text-blue-900' : 'bg-red-500 text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* ── MAIN CONTENT HUB ── */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Header block */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Notification Center</h1>
                  <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage your system updates, invitations, and alerts.</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="gradient-btn flex items-center justify-center gap-1.5 px-5 py-3 text-sm font-bold text-white rounded-2xl shadow-sm self-start md:self-auto select-none"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* ── SEARCH & FILTER CONTROLS ── */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                
                {/* Search Box */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search notifications by title, message, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-50/50 focus:bg-white focus:border-blue-500 transition-all font-medium placeholder:text-slate-400 text-slate-700"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    <span>Filters:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Read Status Dropdown (hidden if unread tab active) */}
                    {activeTab !== 'unread' && (
                      <div className="relative">
                        <select
                          value={readStatusFilter}
                          onChange={(e) => setReadStatusFilter(e.target.value as any)}
                          className="appearance-none pr-8 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:border-slate-400 cursor-pointer select-none"
                        >
                          <option value="all">All Status</option>
                          <option value="unread">Only Unread</option>
                          <option value="read">Only Read</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    )}

                    {/* Date Sort Dropdown */}
                    <div className="relative">
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="appearance-none pr-8 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:border-slate-400 cursor-pointer select-none"
                      >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

              </div>

              {/* ── NOTIFICATION FEED LIST ── */}
              {loading ? (
                /* Primary skeleton loader */
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse flex items-start gap-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                        <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                /* Empty state container */
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-lg text-slate-500 font-bold">No notifications found</p>
                  <p className="text-sm text-slate-400 mt-1">Try resetting filters or adjusting search keyword.</p>
                </div>
              ) : (
                /* Actual feed card list */
                <div className="space-y-3">
                  {notifications.map((notif) => {
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleRowClick(notif)}
                        className={`group relative notif-card-fade flex items-start gap-4 p-5 rounded-3xl bg-white border cursor-pointer hover:shadow-md transition-all duration-200 ${
                          !notif.isRead
                            ? 'border-l-4 border-l-blue-600 border-t border-r border-b border-slate-200'
                            : 'border-slate-200 hover:border-slate-300 opacity-70'
                        }`}
                      >
                        {/* Unread Indicator dot */}
                        {!notif.isRead && (
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600" />
                        )}

                        {/* Category Circle Icon */}
                        <div className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ${typeBg(notif.type)}`}>
                          <NotifIcon type={notif.type} />
                        </div>

                        {/* Text Content Block */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2">
                            <h4 className={`text-base leading-tight capitalize ${!notif.isRead ? 'font-extrabold text-slate-800' : 'font-semibold text-slate-700'}`}>
                              {notif.title}
                            </h4>
                          </div>
                          <p className="text-slate-500 text-sm mt-1 leading-relaxed">{notif.message}</p>
                          
                          <div className="flex items-center gap-2 mt-2 text-slate-400 text-xs font-bold">
                            <span>{relativeTime(notif.createdAt)}</span>
                            <span>•</span>
                            <span className="uppercase text-[10px] tracking-wider text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                              {notif.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        {/* Delete Trash Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notif.id);
                          }}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── PAGINATION LOAD MORE ── */}
              {!loading && page < totalPages && (
                <div className="text-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadMoreLoading}
                    className="gradient-btn inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-sm select-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadMoreLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Notifications'
                    )}
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
