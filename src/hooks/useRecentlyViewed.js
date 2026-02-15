import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dn_recently_viewed';
const MAX_ITEMS = 5;

const sanitize = (product) => {
  if (!product || typeof product !== 'object' || product.id == null) return null;
  return {
    id: product.id,
    name: typeof product.name === 'string' ? product.name.slice(0, 200) : String(product.name ?? ''),
    image: typeof product.image === 'string' ? product.image.slice(0, 2048) : null,
    price: product.price,
  };
};

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    /* ignore */
  }
};

export const useRecentlyViewed = () => {
  const [items, setItems] = useState(loadFromStorage);

  const addRecentlyViewed = useCallback((product, excludeId = null) => {
    const safe = sanitize(product);
    if (!safe) return;

    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== safe.id);
      const next = [safe, ...filtered].slice(0, MAX_ITEMS);
      saveToStorage(next);
      return next;
    });
  }, []);

  return { items, addRecentlyViewed };
};
