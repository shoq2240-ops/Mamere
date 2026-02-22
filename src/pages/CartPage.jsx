import React, { useEffect, useState } from 'react';
import { useCart } from '../store/CartContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

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
  const { cart, removeFromCart, updateQuantity, cartCount } = useCart();
  const totalPrice = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);

  useEffect(() => {
    if (searchParams.get('order') === 'success') {
      setShowOrderSuccess(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-[#F9F7F2] text-[#3E2F28] antialiased">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-display tracking-tighter uppercase mb-12 text-[#3E2F28]">
          장바구니
        </h1>

        {showOrderSuccess && (
          <div className="mb-8 p-4 border border-[#A8B894]/40 bg-[#F5F3EE] text-center">
            <p className="text-[#5C4A42] text-sm font-medium">결제가 완료되었습니다.</p>
            <Link to="/orders" className="mt-2 inline-block text-[10px] font-medium tracking-widest uppercase text-[#3E2F28] hover:opacity-80">
              주문 내역 확인 →
            </Link>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="py-20 text-center border-t border-[#A8B894]/30">
            <p className="text-[#7A6B63] uppercase tracking-widest mb-8 text-sm font-light">Your cart is empty.</p>
            <Link to="/shop" className="inline-block border border-[#A8B894] px-8 py-3 text-[10px] font-light uppercase tracking-widest text-[#3E2F28] hover:bg-[#A8B894] hover:text-[#2D3A2D] transition-all">
              Return to Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-6 border-b border-[#F0F0F0] pb-10">
                <div className="w-24 h-32 bg-[#EDEAE4] overflow-hidden">
                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" loading="lazy" decoding="async" />}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-heading tracking-tight uppercase">{item.name}</h3>
                      <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-light uppercase text-[#7A6B63] hover:text-[#3E2F28]">Remove</button>
                    </div>
                    <p className="text-[#3E2F28] text-sm mt-1">₩{parsePrice(item.price).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 border border-[#A8B894]/50 flex items-center justify-center text-xs text-[#3E2F28]">-</button>
                    <span className="text-sm font-light">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 border border-[#A8B894]/50 flex items-center justify-center text-xs text-[#3E2F28]">+</button>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-10 space-y-6 text-right">
              <div className="flex justify-between items-end border-t border-[#A8B894]/40 pt-6">
                <span className="text-[10px] font-light uppercase tracking-widest text-[#7A6B63]">Total Amount</span>
                <span className="text-2xl font-display text-[#3E2F28]">₩{totalPrice.toLocaleString()}</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="block w-full bg-[#A8B894] text-[#2D3A2D] py-4 font-heading uppercase tracking-widest hover:opacity-90 transition-colors text-center"
              >
                Proceed to Checkout
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