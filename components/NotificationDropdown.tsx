'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Notification } from '@/lib/api/services/notificationService';
import { useNotificationService } from '@/lib/api/hooks/useNotificationService';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

// Polling interval: 30 seconds (replaces Socket.IO when ENABLE_SOCKET=false)
const POLL_INTERVAL_MS = 30_000;

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const notificationService = useNotificationService();
  const lastPolledAt = useRef<string>(new Date(Date.now() - 60_000).toISOString());
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch all notifications (initial load)
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch {
      // Silently fail — non-critical
    } finally {
      setIsLoading(false);
    }
  }, [notificationService]);

  // Poll for new notifications (lightweight, replaces Socket.IO)
  const pollNewNotifications = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/notifications/poll?since=${encodeURIComponent(lastPolledAt.current)}`,
        { credentials: 'include' }
      );
      if (!res.ok) return;
      const data = await res.json();
      lastPolledAt.current = data.polledAt || new Date().toISOString();
      if (data.notifications?.length > 0) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n._id));
          const newOnes = data.notifications.filter((n: Notification) => !existingIds.has(n._id));
          return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
        });
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // Silently fail — polling is best-effort
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Start polling
  useEffect(() => {
    pollTimerRef.current = setInterval(pollNewNotifications, POLL_INTERVAL_MS);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [pollNewNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.seen) {
        await notificationService.markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, seen: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      if (notification.link) router.push(notification.link);
      setIsOpen(false);
    } catch {
      // Silently fail
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => {
          setIsOpen((o) => !o);
          if (!isOpen) fetchNotifications();
        }}
        aria-label="الإشعارات"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border bg-white shadow-lg dark:bg-gray-800 z-50">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-medium">الإشعارات</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={isLoading}>
                تحديد الكل كمقروء
              </Button>
            )}
          </div>

          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">لا توجد إشعارات</div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      !notification.seen ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 mt-1 p-1 rounded-full ${!notification.seen ? 'text-blue-500' : 'text-gray-400'}`}>
                        {!notification.seen ? <Clock className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-right">{notification.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 text-right">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1 text-left">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ar })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-2 border-t text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { router.push('/notifications'); setIsOpen(false); }}
            >
              عرض الكل
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
