import React, { createContext, useContext, useState, useEffect } from 'react';

// 보안: 장바구니 상품 필드 화이트리스트 (prototype pollution 방지)
const isValidProductId = (id) => {
  if (id == null) return false;
  if (typeof id === 'number') return Number.isInteger(id) && id > 0;
  if (typeof id === 'string') {
    if (['__proto__', 'constructor', 'prototype'].includes(id)) return false;
    return /^\d+$/.test(id) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  }
  return false;
};

const sanitizeProduct = (product) => {
  if (!product || typeof product !== 'object' || !isValidProductId(product.id)) return null;
  return {
    id: product.id,
    name: typeof product.name === 'string' ? product.name.slice(0, 200) : String(product.name ?? '').slice(0, 200),
    price: product.price,
    image: typeof product.image === 'string' ? product.image.slice(0, 2048) : null,
    gender: typeof product.gender === 'string' ? product.gender.slice(0, 20) : null,
    category: typeof product.category === 'string' ? product.category.slice(0, 50) : null,
    selectedSize: typeof product.selectedSize === 'string' ? product.selectedSize.slice(0, 20) : null,
  };
};

const MAX_QUANTITY = 99;
const MAX_CART_ITEMS = 50;

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('dn_cart');
      if (!savedCart) return [];
      const parsed = JSON.parse(savedCart);
      if (!Array.isArray(parsed)) return [];
      // 복원 시 각 항목 검증 (손상된 데이터 방지)
      return parsed
        .map((item) => {
          const safe = sanitizeProduct(item);
          if (!safe || typeof item?.quantity !== 'number' || item.quantity < 1) return null;
          return { ...safe, quantity: Math.min(Math.max(1, Math.floor(item.quantity)), MAX_QUANTITY) };
        })
        .filter(Boolean)
        .slice(0, MAX_CART_ITEMS);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dn_cart', JSON.stringify(cart));
    } catch {
      // quota exceeded 등 localStorage 오류 시 무시 (앱 동작에는 영향 없음)
    }
  }, [cart]);

  const addToCart = (product) => {
    const safe = sanitizeProduct(product);
    if (!safe) return;

    setCart((prevCart) => {
      if (prevCart.length >= MAX_CART_ITEMS && !prevCart.find((i) => i.id === safe.id)) return prevCart;
      const isExist = prevCart.find((item) => item.id === safe.id);
      if (isExist) {
        return prevCart.map((item) =>
          item.id === safe.id
            ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
            : item
        );
      }
      return [...prevCart, { ...safe, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, amount) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, Math.min(MAX_QUANTITY, item.quantity + amount)) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('dn_cart');
    } catch {
      // ignore
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

// 2. 다른 파일에서 쓸 수 있게 내보내기
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

export { CartContext };