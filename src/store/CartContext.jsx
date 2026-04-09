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
  const stock = Math.max(0, Math.floor(Number(product.stock_quantity ?? product.stock ?? 0)));
  const selectedOptionString = typeof product.selected_option_string === 'string'
    ? product.selected_option_string.slice(0, 200)
    : null;
  const selectedOptionAdditionalPrice = Math.max(
    0,
    Math.floor(Number(product.selected_option_additional_price ?? 0))
  );
  const optionKey = selectedOptionString || '__base__';
  return {
    id: product.id,
    cart_item_key: `${String(product.id)}::${optionKey}`,
    name: typeof product.name === 'string' ? product.name.slice(0, 200) : String(product.name ?? '').slice(0, 200),
    price: product.price,
    image: typeof product.image === 'string' ? product.image.slice(0, 2048) : null,
    category: typeof product.category === 'string' ? product.category.slice(0, 50) : null,
    volume: typeof product.volume === 'string' ? product.volume.slice(0, 30) : null,
    stock_quantity: stock,
    selected_option_string: selectedOptionString,
    selected_option_additional_price: selectedOptionAdditionalPrice,
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
          const maxQty = typeof safe.stock_quantity === 'number' && safe.stock_quantity >= 0 ? Math.min(safe.stock_quantity, MAX_QUANTITY) : MAX_QUANTITY;
          return { ...safe, quantity: Math.min(Math.max(1, Math.floor(item.quantity)), maxQty) };
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

  const addToCart = (product, quantity = 1) => {
    const safe = sanitizeProduct(product);
    if (!safe) return false;

    const stock = safe.stock_quantity ?? 0;
    const qty = Math.max(1, Math.min(Math.floor(Number(quantity) || 1), MAX_QUANTITY));

    let added = false;
    setCart((prevCart) => {
      if (prevCart.length >= MAX_CART_ITEMS && !prevCart.find((i) => i.cart_item_key === safe.cart_item_key)) return prevCart;
      const existing = prevCart.find((item) => item.cart_item_key === safe.cart_item_key);
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty + qty > stock) return prevCart;
      added = true;
      if (existing) {
        return prevCart.map((item) =>
          item.cart_item_key === safe.cart_item_key ? { ...item, quantity: item.quantity + qty, stock_quantity: stock } : item
        );
      }
      return [...prevCart, { ...safe, quantity: qty }];
    });
    return added;
  };

  const removeFromCart = (itemKeyOrProductId) => {
    setCart((prevCart) => prevCart.filter((item) => (
      item.cart_item_key !== itemKeyOrProductId && item.id !== itemKeyOrProductId
    )));
  };

  const updateQuantity = (itemKeyOrProductId, amount, maxQty = null) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.cart_item_key !== itemKeyOrProductId && item.id !== itemKeyOrProductId) return item;
        const cap = maxQty != null ? Math.min(maxQty, MAX_QUANTITY) : MAX_QUANTITY;
        const next = Math.max(1, Math.min(cap, item.quantity + amount));
        return { ...item, quantity: next };
      })
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