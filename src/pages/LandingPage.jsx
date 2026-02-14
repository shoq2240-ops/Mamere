import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ANTWERP_COLLECTION } from '../data/productData'; 

const LandingPage = () => {
  const newArrivals = ANTWERP_COLLECTION.slice(0, 6); 
  const bestSellers = ANTWERP_COLLECTION.slice(0, 12); 

  const newRef = useRef(null);
  const bestRef = useRef(null);

  const scroll = (ref, direction) => {
    const { current } = ref;
    const scrollAmount = window.innerWidth * 0.5;
    if (direction === 'left') {
      current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-black text-white font-['Noto_Sans_KR'] antialiased overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="h-[90vh] flex flex-col items-center justify-center relative border-b border-white/5">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12vw] font-black italic tracking-tighter leading-none text-center"
        >
          DOUBLE <span className="font-light text-white/10 uppercase font-['Noto_Sans_KR']">Negative</span>
        </motion.h1>
      </section>

      {/* 2. NEW ARRIVALS (큰 3구 박스) */}
      <section className="py-40 relative group/new">
        <div className="px-12 mb-16">
          <p className="text-purple-500 text-[12px] font-black tracking-[0.5em] uppercase italic mb-4">SEASONAL FOCUS</p>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">New Arrivals</h2>
        </div>

        {/* 화살표 컨트롤러 */}
        <button onClick={() => scroll(newRef, 'left')} className="absolute left-6 top-[55%] z-20 opacity-0 group-hover/new:opacity-100 transition-all duration-500 hover:scale-125 text-white/50 hover:text-white">
          <svg className="w-12 h-12 md:w-20 md:h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => scroll(newRef, 'right')} className="absolute right-6 top-[55%] z-20 opacity-0 group-hover/new:opacity-100 transition-all duration-500 hover:scale-125 text-white/50 hover:text-white">
          <svg className="w-12 h-12 md:w-20 md:h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M9 5l7 7-7 7" /></svg>
        </button>

        <div ref={newRef} className="flex overflow-x-auto gap-12 px-12 scrollbar-hide snap-x no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {newArrivals.map((product) => (
            <div key={product.id} className="min-w-[85%] md:min-w-[calc(33.333%-32px)] snap-start group">
              <Link to={`/product/${product.id}`}>
                <div className="aspect-[3/4] overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
                  <img src={product.image} className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-[1.2s] ease-out" alt={product.name} />
                </div>
                {/* 정보 가시성 강화 */}
                <div className="mt-8 space-y-3">
                  <h3 className="text-[14px] font-black tracking-widest uppercase text-white leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-[16px] font-medium text-purple-500 tracking-wider">
                    {product.price}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BEST SELLERS (6구 박스) */}
      <section className="py-40 bg-[#080808] border-y border-white/5 relative group/best text-left">
        <div className="px-12 mb-16">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Most Loved Archive</h2>
        </div>

        <button onClick={() => scroll(bestRef, 'left')} className="absolute left-6 top-[50%] z-20 opacity-0 group-hover/best:opacity-100 transition-all duration-500 hover:scale-125 text-white/30 hover:text-white">
          <svg className="w-10 h-10 md:w-14 md:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => scroll(bestRef, 'right')} className="absolute right-6 top-[50%] z-20 opacity-0 group-hover/best:opacity-100 transition-all duration-500 hover:scale-125 text-white/30 hover:text-white">
          <svg className="w-10 h-10 md:w-14 md:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M9 5l7 7-7 7" /></svg>
        </button>

        <div ref={bestRef} className="flex overflow-x-auto gap-6 px-12 scrollbar-hide no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {bestSellers.map((product) => (
            <div key={product.id} className="min-w-[46%] md:min-w-[calc(16.666%-20px)] flex flex-col group">
              <Link to={`/product/${product.id}`}>
                <div className="aspect-[3/4] overflow-hidden bg-zinc-900 mb-6 border border-white/5">
                  <img src={product.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1s]" alt={product.name} />
                </div>
                {/* 인기 상품 가시성 강화 */}
                <div className="space-y-1 px-1">
                  <h3 className="text-[11px] font-bold tracking-widest uppercase text-white/50 group-hover:text-white transition-colors truncate">
                    {product.name}
                  </h3>
                  <p className="text-[13px] font-semibold text-purple-500/80">
                    {product.price}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-32 text-center opacity-20">
        <p className="text-[10px] font-light tracking-[1em] uppercase italic">Double Negative Archive 2026</p>
      </footer>
    </div>
  );
};

export default LandingPage;