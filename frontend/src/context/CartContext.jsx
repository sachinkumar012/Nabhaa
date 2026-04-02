import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const API = `${import.meta.env.VITE_API_URL}/api/cart`;
const LS_KEY = 'nabha_cart';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const readLS = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
};
const writeLS = (items) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch {}
};

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState(readLS);   // instant from localStorage
  const syncTimerRef = useRef(null);
  const previousUserRef = useRef(null);

  /* ── Auth headers ─────────────────────────────────────────────────────── */
  const authHeaders = useCallback(() => {
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }, [token]);

  const userId = user?._id || user?.id;

  /* ── Fetch cart from backend ─────────────────────────────────────────── */
  const fetchFromBackend = useCallback(async () => {
    if (!userId) return null;
    try {
      const res = await fetch(`${API}?userId=${userId}`, { headers: authHeaders() });
      if (!res.ok) return null;
      const data = await res.json();
      return data.items || [];
    } catch { return null; }
  }, [userId, authHeaders]);

  /* ── Sync LOCAL cart → backend (merge) ──────────────────────────────── */
  const syncToBackend = useCallback(async (items) => {
    if (!userId) return;
    try {
      await fetch(`${API}/sync`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId, items }),
      });
    } catch {}
  }, [userId, authHeaders]);

  /* ── On login: merge localStorage cart → backend, restore full cart ─── */
  useEffect(() => {
    if (!userId) {
      // Logged out — keep local state in localStorage only
      previousUserRef.current = null;
      return;
    }
    if (previousUserRef.current === userId) return; // same user, already synced
    previousUserRef.current = userId;

    const merge = async () => {
      const localItems = readLS();

      if (localItems.length > 0) {
        // Push local items to backend first (merge into DB)
        await syncToBackend(localItems);
      }

      // Fetch the authoritative cart from backend
      const backendItems = await fetchFromBackend();

      if (backendItems !== null && backendItems.length > 0) {
        // Backend has items — use it as source of truth
        setCart(backendItems);
        writeLS(backendItems);
      } else if (localItems.length > 0 && (backendItems === null || backendItems.length === 0)) {
        // Backend is empty / failed but we have local items — keep local
        // (they were already synced above; if sync failed, retry on next add)
        setCart(localItems);
      }
      // If both empty, nothing to do — cart stays empty
    };
    merge();
  }, [userId]);

  /* ── Keep localStorage in sync with state ────────────────────────────── */
  useEffect(() => {
    writeLS(cart);
  }, [cart]);

  /* ── Debounced backend write (500ms after state change) ──────────────── */
  const scheduleBackendSync = useCallback(() => {
    if (!userId) return;
    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        const currentCart = JSON.parse(localStorage.getItem(LS_KEY)) || [];
        await fetch(`${API}/sync`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ userId, items: currentCart }),
        });
      } catch {}
    }, 600);
  }, [userId, authHeaders]);

  /* ── Cart operations ─────────────────────────────────────────────────── */
  const addToCart = useCallback((medicine, qty = 1, source = 'normal') => {
    const productId = medicine.id || medicine._id || String(medicine.productId);
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      let next;
      if (existing) {
        next = prev.map(i =>
          i.productId === productId
            ? { ...i, quantity: Math.min(99, i.quantity + qty) }
            : i
        );
      } else {
        next = [...prev, {
          productId,
          name: medicine.name,
          price: medicine.price,
          quantity: Math.min(99, qty),
          packSize: medicine.packSize || '',
          type: medicine.type || 'Medicine',
          image: medicine.image || '',
          source,
        }];
      }
      return next;
    });
    scheduleBackendSync();
  }, [scheduleBackendSync]);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(i => i.productId !== String(productId)));
    if (userId) {
      fetch(`${API}/remove/${productId}?userId=${userId}`, {
        method: 'DELETE', headers: authHeaders(),
      }).catch(() => {});
    }
  }, [userId, authHeaders]);

  const updateQty = useCallback((productId, newQty) => {
    if (newQty <= 0) { removeFromCart(productId); return; }
    setCart(prev =>
      prev.map(i => i.productId === String(productId) ? { ...i, quantity: Math.min(99, newQty) } : i)
    );
    if (userId) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        fetch(`${API}/update`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ userId, productId: String(productId), quantity: newQty }),
        }).catch(() => {});
      }, 400);
    }
  }, [userId, authHeaders, removeFromCart]);

  const clearCart = useCallback(async () => {
    setCart([]);
    writeLS([]);
    if (userId) {
      try {
        await fetch(`${API}/clear?userId=${userId}`, {
          method: 'DELETE', headers: authHeaders(),
        });
      } catch {}
    }
  }, [userId, authHeaders]);

  const getCartQty = useCallback((productId) => {
    const item = cart.find(i => i.productId === String(productId));
    return item ? item.quantity : 0;
  }, [cart]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      getCartQty,
      cartCount,
      cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
