import React from 'react';
import { useCart } from '../store/CartContext';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartCount } = useCart();
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-12">
          Your <span className="text-purple-500">Archive</span> [{cartCount}]
        </h1>

        {cart.length === 0 ? (
          <div className="py-20 text-center border-t border-white/10">
            <p className="text-white/40 uppercase tracking-widest mb-8 text-sm">Your cart is empty.</p>
            <Link to="/shop" className="inline-block border border-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              Return to Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-6 border-b border-white/5 pb-10">
                <div className="w-24 h-32 bg-zinc-900 overflow-hidden">
                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold tracking-tight uppercase">{item.name}</h3>
                      <button onClick={() => removeFromCart(item.id)} className="text-[10px] uppercase text-white/30 hover:text-purple-500">Remove</button>
                    </div>
                    <p className="text-purple-500 text-sm mt-1">₩{item.price?.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 border border-white/20 flex items-center justify-center text-xs">-</button>
                    <span className="text-sm font-mono">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 border border-white/20 flex items-center justify-center text-xs">+</button>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-10 space-y-6 text-right">
              <div className="flex justify-between items-end border-t border-white/20 pt-6">
                <span className="text-xs uppercase tracking-widest text-white/40">Total Amount</span>
                <span className="text-2xl font-black italic text-purple-500">₩{totalPrice.toLocaleString()}</span>
              </div>
              <button className="w-full bg-purple-600 py-4 font-black italic uppercase tracking-widest hover:bg-purple-500 transition-colors">
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