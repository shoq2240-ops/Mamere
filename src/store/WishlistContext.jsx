import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'dn_wishlist';
const MAX_ITEMS = 100;

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      /* ignore */
    }
  }, [wishlist]);

  const toggleWishlist = (productId) => {
    if (productId == null) return;
    const id = typeof productId === 'number' ? productId : Number(productId);
    const numId = Number.isNaN(id) ? productId : id;
    setWishlist((prev) => {
      const has = prev.some((w) => w == numId || w === productId);
      return has ? prev.filter((w) => w != numId && w !== productId) : [...prev, numId];
    });
  };

  const isInWishlist = (productId) =>
    productId != null && wishlist.some((w) => w == productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
