import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../store/CartContext'; 
import { useProducts } from '../hooks/useProducts';
import { ProductCarouselSkeleton, LoadingMessage } from '../components/ProductSkeleton'; 

// 데이터 소스: Supabase products 테이블만 사용. 더미/로컬 데이터 없음.
const LandingPage = () => {
  const { addToCart } = useCart();
  const [showPopup, setShowPopup] = useState(false);
  const [popupItem, setPopupItem] = useState("");
  
  const { products, loading, error } = useProducts();
  const newArrivals = products.slice(0, 6); 
  const bestSellers = products.slice(0, 12); 

  const newRef = useRef(null);
  const bestRef = useRef(null);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setPopupItem(product.name);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);
  };

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
    <div className="bg-black text-white antialiased overflow-x-hidden relative">
      
      {/* 장바구니 알림 팝업 (Shop 페이지 디자인 동일) */}
      <AnimatePresence>
        {showPopup && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-0 right-0 z-[150] flex justify-center pointer-events-none"
          >
            <div className="bg-white text-black px-8 py-4 shadow-2xl flex items-center gap-4 border border-zinc-200">
              <span className="text-[12px] font-black uppercase tracking-widest border-r border-zinc-200 pr-4">Added</span>
              <span className="text-[12px] font-medium tracking-tighter">{popupItem} 장바구니에 담겼습니다.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO SECTION */}
      <section className="h-[90vh] flex flex-col items-center justify-center relative border-b border-white/5">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12vw] font-black italic tracking-tighter leading-none text-center"
        >
          DOUBLE <span className="font-light text-white/10 uppercase">Negative</span>
        </motion.h1>
      </section>

      {/* 2. NEW ARRIVALS (Shop 페이지 디자인 이식) */}
      <section className="py-40 relative group/new">
        <div className="px-12 mb-16">
          <p className="text-purple-500 text-[12px] font-black tracking-mega-wide uppercase italic mb-4">Seasonal Focus</p>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">New Arrivals</h2>
        </div>

        {/* 로딩 스켈레톤 */}
        {loading && (
          <div className="relative">
            <LoadingMessage />
            <ProductCarouselSkeleton count={6} variant="large" />
          </div>
        )}

        {/* DB 연결 실패: 제품 영역 비우고 에러만 표시 */}
        {error && (
          <div className="min-h-[40vh] flex flex-col items-center justify-center px-12 py-24 text-center border border-red-500/20 bg-red-950/10">
            <p className="text-red-500 text-sm font-medium tracking-wide">DB 연결 실패</p>
            <p className="mt-3 text-xs text-white/60 font-mono max-w-md break-all">{error}</p>
            <p className="mt-4 text-[10px] text-white/40 uppercase tracking-widest">Supabase URL · ANON KEY · RLS 정책 확인</p>
          </div>
        )}

        {/* 제품 목록 */}
        {!loading && !error && newArrivals.length > 0 && (
          <>
            {/* 화살표 컨트롤러 (심플 화살표 유지) */}
            <button onClick={() => scroll(newRef, 'left')} className="absolute left-6 top-[55%] z-20 opacity-0 group-hover/new:opacity-100 transition-all text-white/50 hover:text-white"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M15 19l-7-7 7-7" /></svg></button>
            <button onClick={() => scroll(newRef, 'right')} className="absolute right-6 top-[55%] z-20 opacity-0 group-hover/new:opacity-100 transition-all text-white/50 hover:text-white"><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M9 5l7 7-7 7" /></svg></button>

            <div ref={newRef} className="flex overflow-x-auto gap-12 px-12 scrollbar-hide snap-x no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {newArrivals.map((product) => (
            <div key={product.id} className="min-w-[85%] md:min-w-[calc(33.333%-32px)] snap-start group relative flex flex-col">
              <Link to={`/product/${product.id}`}>
                {/* Shop 페이지와 동일한 이미지 & 버튼 레이아웃 */}
                <div className="aspect-[3/4] overflow-hidden bg-zinc-900 relative border border-white/5">
                  <img src={product.image} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-700" alt={product.name} />
                  
                  {/* Shop 페이지 디자인: 하단에서 올라오는 흰색 버튼 바 */}
                  <div 
                    onClick={(e) => handleAddToCart(product, e)}
                    className="absolute bottom-0 left-0 right-0 bg-white text-black py-4 text-center text-[11px] font-black tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-30 cursor-pointer"
                  >
                    ADD TO CART +
                  </div>
                </div>

                {/* 정보 영역: 텍스트 위계 동일하게 조정 */}
                <div className="mt-8 space-y-2 text-left">
                  <h3 className="text-[12px] font-bold tracking-widest uppercase text-white/70 group-hover:text-white transition-colors leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-[14px] font-semibold text-purple-500">
                    {product.price}
                  </p>
                </div>
              </Link>
            </div>
          ))}
            </div>
          </>
        )}

        {/* Supabase 데이터 없음 (테이블 비어 있음) */}
        {!loading && !error && newArrivals.length === 0 && (
          <div className="px-12 py-20 text-center min-h-[30vh] flex items-center justify-center">
            <p className="text-white/40 text-sm tracking-extra-wide uppercase">No Products (Supabase products 테이블에 데이터 없음)</p>
          </div>
        )}
      </section>

      {/* 3. BEST SELLERS (Shop 페이지 디자인 이식) */}
      <section className="py-40 bg-[#080808] border-y border-white/5 relative group/best">
        <div className="px-12 mb-16"><h2 className="text-3xl font-black italic uppercase tracking-tighter">Most Loved Archive</h2></div>

        {/* Best Sellers 로딩 스켈레톤 */}
        {loading && (
          <div className="relative">
            <ProductCarouselSkeleton count={6} variant="small" />
          </div>
        )}

        {!loading && !error && bestSellers.length > 0 && (
          <>
            <button onClick={() => scroll(bestRef, 'left')} className="absolute left-6 top-[50%] z-20 opacity-0 group-hover/best:opacity-100 transition-all text-white/30 hover:text-white"><svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M15 19l-7-7 7-7" /></svg></button>
            <button onClick={() => scroll(bestRef, 'right')} className="absolute right-6 top-[50%] z-20 opacity-0 group-hover/best:opacity-100 transition-all text-white/30 hover:text-white"><svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M9 5l7 7-7 7" /></svg></button>

            <div ref={bestRef} className="flex overflow-x-auto gap-6 px-12 scrollbar-hide no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {bestSellers.map((product) => (
            <div key={product.id} className="min-w-[46%] md:min-w-[calc(16.666%-20px)] group relative flex flex-col">
              <Link to={`/product/${product.id}`}>
                <div className="aspect-[3/4] overflow-hidden bg-zinc-900 mb-6 relative border border-white/5">
                  <img src={product.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={product.name} />
                  
                  {/* Shop 페이지 동일 레이아웃 */}
                  <div 
                    onClick={(e) => handleAddToCart(product, e)}
                    className="absolute bottom-0 left-0 right-0 bg-white text-black py-4 text-center text-[10px] font-black tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-30 cursor-pointer"
                  >
                    ADD TO CART +
                  </div>
                </div>
                <div className="space-y-1 text-left px-1">
                  <h3 className="text-[10px] font-bold tracking-widest uppercase text-white/50 group-hover:text-white transition-colors truncate">
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
          </>
        )}

        {/* Best Sellers: Supabase 데이터 없음 */}
        {!loading && !error && bestSellers.length === 0 && (
          <div className="px-12 py-20 text-center min-h-[20vh] flex items-center justify-center">
            <p className="text-white/40 text-sm tracking-extra-wide uppercase">No Products</p>
          </div>
        )}
      </section>

      <footer className="py-32 text-center opacity-20"><p className="text-[10px] font-light tracking-mega-wide uppercase italic">Double Negative Archive 2026</p></footer>
    </div>
  );
};

export default LandingPage;