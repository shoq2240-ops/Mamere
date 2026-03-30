import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../store/CartContext';

const toNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value.replace(/[^\d.-]/g, '')) || 0;
  return 0;
};

const formatKrw = (value) => `krw ${Math.round(value).toLocaleString('ko-KR')}`;

const CartDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity } = useCart();

  const estimatedTotal = cart.reduce((sum, item) => sum + toNumber(item.price) * (item.quantity || 1), 0);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[220] bg-black/20 backdrop-blur-sm"
            aria-label="장바구니 닫기"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed right-0 top-0 z-[221] flex h-[100dvh] w-[320px] max-w-full flex-col bg-white sm:w-[340px]"
            aria-label="cart drawer"
          >
            <div className="flex justify-end border-b border-[#EEEEEE] px-3.5 py-3.5">
              <button type="button" onClick={onClose} className="text-[14px] font-light text-[#999999]">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {cart.length === 0 ? (
                <p className="py-10 text-[12px] font-light lowercase text-gray-500">cart is empty</p>
              ) : (
                <div className="space-y-5">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 border-b border-[#F1F1F1] pb-5">
                      <div className="h-[72px] w-[72px] shrink-0 overflow-hidden bg-[#F5F5F5]">
                        {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="line-clamp-2 text-[12px] font-light text-[#1A1A1A]">{item.name}</p>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="shrink-0 text-[10px] font-extralight lowercase text-[#999999] hover:text-[#1A1A1A]"
                          >
                            remove
                          </button>
                        </div>
                        <div className="mt-2 inline-flex items-center border border-[#E5E5E5]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="h-7 w-7 text-[11px] font-light text-[#1A1A1A]"
                          >
                            -
                          </button>
                          <span className="h-7 min-w-[28px] border-x border-[#E5E5E5] px-2 text-center text-[11px] font-light leading-7 text-[#1A1A1A]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="h-7 w-7 text-[11px] font-light text-[#1A1A1A]"
                          >
                            +
                          </button>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <p className="text-[11px] font-extralight lowercase text-[#1A1A1A]">
                          {formatKrw(toNumber(item.price) * (item.quantity || 1))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[#EEEEEE] px-4 pb-5 pt-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-light lowercase text-[#666666]">estimated total</p>
                <p className="text-[11px] font-light lowercase text-[#1A1A1A]">{formatKrw(estimatedTotal)}</p>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                className="h-12 w-full bg-black text-[12px] font-light lowercase tracking-widest text-white"
              >
                check out
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CartDrawer;
