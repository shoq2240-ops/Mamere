import React, { useEffect, useState } from 'react';
import { useCart } from '../store/CartContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getShippingFee, getRemainingForFreeShipping } from '../lib/shipping';
import { useProducts } from '../hooks/useProducts';
import { getStockQuantity } from '../lib/productStock';

const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const num = parseInt(price.replace(/[^\d]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

const CartPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [qtyCooldownById, setQtyCooldownById] = useState({});
  const [isProceedingCheckout, setIsProceedingCheckout] = useState(false);
  const { cart, removeFromCart, updateQuantity } = useCart();
  const { products } = useProducts();
  const subtotal = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
  const shippingFee = getShippingFee(subtotal);
  const totalPrice = subtotal + shippingFee;
  const remainingForFree = getRemainingForFreeShipping(subtotal);

  useEffect(() => {
    if (searchParams.get('order') === 'success') {
      setShowOrderSuccess(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // 재고 초과 분은 재고 수량으로 자동 보정 (products 로드 시 1회)
  useEffect(() => {
    if (!products || products.length === 0) return;
    cart.forEach((item) => {
      const product = products.find((p) => String(p.id) === String(item.id));
      const stock = product != null ? getStockQuantity(product) : item.stock_quantity;
      if (stock != null && item.quantity > stock) {
        updateQuantity(item.cart_item_key || item.id, stock - item.quantity, stock);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clamp only when products load
  }, [products]);

  const runQuantityUpdateWithCooldown = (itemKey, delta, maxQty) => {
    const key = String(itemKey);
    if (qtyCooldownById[key]) return;
    setQtyCooldownById((prev) => ({ ...prev, [key]: true }));
    updateQuantity(itemKey, delta, maxQty);
    window.setTimeout(() => {
      setQtyCooldownById((prev) => ({ ...prev, [key]: false }));
    }, 180);
  };

  return (
    <div className="pt-24 md:pt-28 pb-12 md:pb-16 px-4 md:px-5 min-h-screen bg-white text-[#3E2F28] antialiased">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-semibold tracking-tight uppercase mb-8 md:mb-10 text-[#3E2F28]">
          장바구니
        </h1>

        {showOrderSuccess && (
          <div className="mb-8 p-4 border border-[#A8B894]/40 bg-white text-center">
            <p className="text-[#5C4A42] text-sm font-medium">주문이 완료되었습니다.</p>
            <Link to="/orders" className="mt-2 inline-block text-[10px] font-medium tracking-widest uppercase text-[#3E2F28] hover:opacity-80">
              주문 내역 보기
            </Link>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="py-20 text-center border-t border-[#A8B894]/30">
            <p className="text-[#7A6B63] uppercase tracking-widest mb-8 text-sm font-light">장바구니가 비어 있습니다.</p>
            <Link to="/shop" className="inline-block border border-[#A8B894] px-8 py-3 text-[10px] font-light uppercase tracking-widest text-[#3E2F28] hover:bg-[#A8B894] hover:text-[#2D3A2D] transition-all">
              쇼핑 계속하기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => {
              const product = products?.find((p) => String(p.id) === String(item.id));
              const stock = product != null ? getStockQuantity(product) : (item.stock_quantity ?? 99);
              const maxQty = Math.max(0, stock);
              const atMax = item.quantity >= maxQty;
              const rowKey = item.cart_item_key || item.id;
              const isQtyCooling = !!qtyCooldownById[String(rowKey)];
              return (
                <div key={rowKey} className="mb-2 flex gap-3 md:gap-4 rounded-xl bg-gray-50 p-3 md:p-4 shadow-sm">
                  <div className="w-20 h-28 overflow-hidden rounded-lg bg-white">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-heading tracking-tight uppercase">{item.name}</h3>
                        <button onClick={() => removeFromCart(rowKey)} className="text-[9px] font-light uppercase text-[#7A6B63] hover:text-[#3E2F28]">삭제</button>
                      </div>
                      <p className="text-[#3E2F28] text-sm mt-1">₩{parsePrice(item.price).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => runQuantityUpdateWithCooldown(rowKey, -1, maxQty)}
                        disabled={isQtyCooling}
                        className="w-5 h-5 border border-gray-200 flex items-center justify-center text-[11px] text-[#3E2F28] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="text-xs font-light min-w-[1.5rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => runQuantityUpdateWithCooldown(rowKey, 1, maxQty)}
                        disabled={atMax || isQtyCooling}
                        className="w-5 h-5 border border-gray-200 flex items-center justify-center text-[11px] text-[#3E2F28] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="pt-10 space-y-6 text-right">
              <div className="space-y-2 border-t border-[#A8B894]/40 pt-6">
                <div className="flex justify-between text-[10px] font-light uppercase tracking-widest text-[#7A6B63]">
                  <span>소계</span>
                  <span>₩{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-light uppercase tracking-widest text-[#7A6B63]">
                  <span>배송비</span>
                  <span>{shippingFee === 0 ? '무료' : `₩${shippingFee.toLocaleString()}`}</span>
                </div>
                {remainingForFree > 0 && (
                  <p className="text-[9px] text-[#A8B894] tracking-wide text-left">
                    {`${remainingForFree.toLocaleString()}원 더 구매 시 무료배송`}
                  </p>
                )}
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-[10px] font-light uppercase tracking-widest text-[#7A6B63]">총 결제 금액</span>
                <span className="text-2xl font-semibold text-[#3E2F28]">₩{totalPrice.toLocaleString()}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isProceedingCheckout) return;
                  setIsProceedingCheckout(true);
                  navigate('/checkout');
                }}
                disabled={isProceedingCheckout}
                className="block w-full bg-[#A8B894] text-[#2D3A2D] py-4 font-heading uppercase tracking-widest hover:opacity-90 transition-colors text-center disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isProceedingCheckout ? '처리 중...' : '결제하기'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 핵심: App.jsx에서 불러올 수 있게 기본 내보내기 설정
export default CartPage;