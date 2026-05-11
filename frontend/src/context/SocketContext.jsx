import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { registerSocketHandlers } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Notification i18n labels
const NOTIF_LABELS = {
  en: {
    order_update: 'Order Update',
    new_order: 'New Order',
    payment_success: 'Payment Confirmed',
    cod_reminder: 'Pay Online',
    order_cancelled: 'Order Cancelled',
  },
  hi: {
    order_update: 'ऑर्डर अपडेट',
    new_order: 'नया ऑर्डर',
    payment_success: 'भुगतान सफल',
    cod_reminder: 'ऑनलाइन भुगतान करें',
    order_cancelled: 'ऑर्डर रद्द',
  },
  pa: {
    order_update: 'ਆਰਡਰ ਅਪਡੇਟ',
    new_order: 'ਨਵਾਂ ਆਰਡਰ',
    payment_success: 'ਭੁਗਤਾਨ ਸਫਲ',
    cod_reminder: 'ਔਨਲਾਈਨ ਭੁਗਤਾਨ ਕਰੋ',
    order_cancelled: 'ਆਰਡਰ ਰੱਦ',
  }
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // Store event callbacks registered by pages
  const orderUpdateCallbacksRef = useRef([]);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => {
      // Deduplicate by orderId + status combo
      const exists = prev.some(n => n.orderId === notif.orderId && n.status === notif.status && n.event === notif.event);
      if (exists) return prev;
      return [notif, ...prev].slice(0, 50); // keep last 50
    });
    setUnreadCount(c => c + 1);
  }, []);

  const markAllRead = useCallback(() => setUnreadCount(0), []);

  const onOrderUpdate = useCallback((cb) => {
    orderUpdateCallbacksRef.current.push(cb);
    return () => {
      orderUpdateCallbacksRef.current = orderUpdateCallbacksRef.current.filter(fn => fn !== cb);
    };
  }, []);

  /**
   * Connect socket and join room(s).
   * Called by AuthContext on login.
   */
  const connect = useCallback(({ userId, pharmacistId, adminId } = {}) => {
    if (socketRef.current?.connected) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('[SOCKET] Connected:', socket.id);
      setConnected(true);
      if (userId) socket.emit('join_user_room', userId);
      if (pharmacistId) socket.emit('join_pharmacist_room', pharmacistId);
      if (adminId) socket.emit('join_admin_room');
    });

    socket.on('disconnect', () => {
      console.log('[SOCKET] Disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[SOCKET] Connection error:', err.message);
    });

    // ── Customer: Order Status Update ─────────────────────────────────────────
    socket.on('order_update', (data) => {
      const lang = localStorage.getItem('i18nextLng')?.slice(0, 2) || 'en';
      addNotification({
        id: Date.now(),
        event: 'order_update',
        orderId: data.orderId,
        status: data.status,
        message: data.message || NOTIF_LABELS[lang]?.order_update,
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
        type: 'info',
      });
      orderUpdateCallbacksRef.current.forEach(cb => cb(data));
    });

    // ── Customer: COD Payment Reminder ────────────────────────────────────────
    socket.on('cod_reminder', (data) => {
      const lang = localStorage.getItem('i18nextLng')?.slice(0, 2) || 'en';
      addNotification({
        id: Date.now(),
        event: 'cod_reminder',
        orderId: data.orderId,
        status: 'cod',
        message: data.message || NOTIF_LABELS[lang]?.cod_reminder,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'warning',
      });
      orderUpdateCallbacksRef.current.forEach(cb => cb({ ...data, event: 'cod_reminder' }));
    });

    // ── Customer/Pharmacist: Payment Success ─────────────────────────────────
    socket.on('payment_success', (data) => {
      const lang = localStorage.getItem('i18nextLng')?.slice(0, 2) || 'en';
      addNotification({
        id: Date.now(),
        event: 'payment_success',
        orderId: data.orderId,
        status: data.status,
        message: data.message || NOTIF_LABELS[lang]?.payment_success,
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
        type: 'success',
      });
      orderUpdateCallbacksRef.current.forEach(cb => cb({ ...data, event: 'payment_success' }));
    });

    // ── Pharmacist/Admin: New Order ───────────────────────────────────────────
    socket.on('new_order', (data) => {
      const lang = localStorage.getItem('i18nextLng')?.slice(0, 2) || 'en';
      addNotification({
        id: Date.now(),
        event: 'new_order',
        orderId: data.orderId,
        status: 'Pending',
        message: data.message || NOTIF_LABELS[lang]?.new_order,
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
        type: 'info',
      });
      orderUpdateCallbacksRef.current.forEach(cb => cb({ ...data, event: 'new_order' }));
    });

    socketRef.current = socket;
  }, [addNotification]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  // Bridge to AuthContext so login/logout auto-connects socket
  useEffect(() => {
    registerSocketHandlers(connect, disconnect);
  }, [connect, disconnect]);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      connected,
      notifications,
      unreadCount,
      markAllRead,
      onOrderUpdate,
      connect,
      disconnect,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
