import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { notificationService } from "../services/api";
import { useToast } from "./useToast";

let socket = null;

function getSocket() {
  if (!socket) {
    socket = io("/", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });
  }
  return socket;
}

export function useNotifications(user) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const userIdRef = useRef(null);

  // Fetch from API
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await notificationService.getAll();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();
  }, [fetchNotifications]);

  // Socket.io real-time
  useEffect(() => {
    if (!user?.id) return;
    userIdRef.current = user.id;

    const s = getSocket();

    const handleConnect = () => {
      s.emit("joinUserRoom", { userId: user.id });
    };

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.success(notification.title, { title: notification.message });
    };

    s.on("connect", handleConnect);
    s.on("new_notification", handleNewNotification);
    if (s.connected) handleConnect();

    return () => {
      s.off("connect", handleConnect);
      s.off("new_notification", handleNewNotification);
    };
  }, [user?.id]);

  const markRead = useCallback(async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  return { notifications, unreadCount, loading, markRead, markAllRead, refetch: fetchNotifications };
}
