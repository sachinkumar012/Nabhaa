/**
 * Real-time Toast Notification System
 * Usage: import useToast from './Toast'; const { showToast, ToastContainer } = useToast();
 */
import { useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, Truck, CreditCard } from 'lucide-react';

const TOAST_ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
  warning: AlertCircle,
  delivery: Truck,
  payment: CreditCard,
};

const TOAST_STYLES = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  delivery:'bg-purple-50 border-purple-200 text-purple-800',
  payment: 'bg-teal-50 border-teal-200 text-teal-800',
};

const ICON_COLORS = {
  success: 'text-green-500',
  error:   'text-red-500',
  info:    'text-blue-500',
  warning: 'text-amber-500',
  delivery:'text-purple-500',
  payment: 'text-teal-500',
};

// Single Toast Item
function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const Icon = TOAST_ICONS[toast.type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 min-w-64 max-w-sm p-4 rounded-2xl border shadow-xl transition-all duration-300
        ${TOAST_STYLES[toast.type] || TOAST_STYLES.info}
        ${exiting ? 'opacity-0 translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'}
      `}
    >
      <Icon size={20} className={`shrink-0 mt-0.5 ${ICON_COLORS[toast.type] || 'text-blue-500'}`} />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-bold text-sm mb-0.5">{toast.title}</p>}
        <p className="text-sm leading-snug opacity-90">{toast.message}</p>
      </div>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onRemove(toast.id), 300); }}
        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Toast Container (rendered at app level)
export function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}

// Hook
let _globalShowToast = null;
export const showGlobalToast = (toast) => {
  if (_globalShowToast) _globalShowToast(toast);
};

export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, ...toast }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    _globalShowToast = showToast;
    return () => { _globalShowToast = null; };
  }, [showToast]);

  return { toasts, showToast, removeToast, ToastContainer: (props) => <ToastContainer toasts={toasts} removeToast={removeToast} {...props} /> };
}
