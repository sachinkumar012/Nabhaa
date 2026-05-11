import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Package, CreditCard, AlertCircle, ShoppingBag, X } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const EVENT_CONFIG = {
  order_update:    { icon: Package,      color: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-100' },
  new_order:       { icon: ShoppingBag,  color: 'text-teal-500',   bg: 'bg-teal-50',   border: 'border-teal-100' },
  payment_success: { icon: CreditCard,   color: 'text-green-500',  bg: 'bg-green-50',  border: 'border-green-100' },
  cod_reminder:    { icon: AlertCircle,  color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-100' },
  order_cancelled: { icon: X,            color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-100' },
};

const timeAgo = (ts) => {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useSocket();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(prev => !prev);
    if (!open) markAllRead();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={handleOpen}
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
        aria-label="Notifications"
      >
        <Bell size={20} className={unreadCount > 0 ? 'animate-[bell-ring_0.5s_ease-in-out]' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-blue-50">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-teal-600" />
              <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-teal-600 font-semibold hover:text-teal-700 transition-colors"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Bell size={32} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs mt-1 opacity-70">Order updates will appear here</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const cfg = EVENT_CONFIG[notif.event] || EVENT_CONFIG.order_update;
                const Icon = cfg.icon;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${notif.read ? 'opacity-60' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.border} border`}>
                      <Icon size={16} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 leading-tight truncate">{notif.message}</p>
                      {notif.orderId && (
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">
                          #{String(notif.orderId).slice(-8).toUpperCase()}
                          {notif.status && notif.status !== 'cod' && (
                            <span className="ml-2 font-sans text-teal-600 font-semibold not-italic">{notif.status}</span>
                          )}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.timestamp)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 bg-gray-50 text-center border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium">Real-time updates via Socket.IO</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
