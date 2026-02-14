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
  const [newArrivalTab, setNewArrivalTab] = useState('men'); // 'men' | 'women'

  const { products, loading, error } = useProducts();
  const menProducts = products.filter((p) => (p.category || '').toLowerCase() === 'men');
  const womenProducts = products.filter((p) => (p.category || '').toLowerCase() === 'women');
  const newArrivalsByTab = newArrivalTab === 'men' ? menProducts.slice(0, 12) : womenProducts.slice(0, 12);
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

      {/* 2. NEW ARRIVALS (우영미 스타일: 작은 박스, 남/여 탭, 더 많은 상품보기) */}
      <section className="py-24 md:py-32 relative group/new">
        <div className="px-8 md:px-12 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-purple-500 text-[9pt] font-black tracking-widest uppercase italic mb-2">Seasonal Focus</p>
            <h2 className="text-xl md:text-2xl font-light uppercase tracking-tight leading-none">신상품</h2>
          </div>
          {/* 남성/여성 탭 + 더 많은 상품보기 (선택된 성별만 노출) */}
          <div className="flex items-center gap-6">
            <div className="flex border-b border-white/20">
              <button
                type="button"
                onClick={() => setNewArrivalTab('men')}
                className={`px-4 py-2 text-[9pt] font-medium tracking-widest uppercase transition-colors ${
                  newArrivalTab === 'men' ? 'text-white border-b-2 border-white -mb-[2px]' : 'text-white/50 hover:text-white/80'
                }`}
              >
                남성
              </button>
              <button
                type="button"
                onClick={() => setNewArrivalTab('women')}
                className={`px-4 py-2 text-[9pt] font-medium tracking-widest uppercase transition-colors ${
                  newArrivalTab === 'women' ? 'text-white border-b-2 border-white -mb-[2px]' : 'text-white/50 hover:text-white/80'
                }`}
              >
                여성
              </button>
            </div>
            {newArrivalTab === 'men' ? (
              <Link to="/shop/men" className="text-[9pt] font-medium tracking-widest uppercase text-white/70 hover:text-white border-b border-white/30 hover:border-white/60 transition-colors whitespace-nowrap">
                남성 더 많은 상품 보기
              </Link>
            ) : (
              <Link to="/shop/women" className="text-[9pt] font-medium tracking-widest uppercase text-white/70 hover:text-white border-b border-white/30 hover:border-white/60 transition-colors whitespace-nowrap">
                여성 더 많은 상품 보기
              </Link>
            )}
          </div>
        </div>

        {/* 로딩 스켈레톤 */}
        {loading && (
          <div className="relative">
            <LoadingMessage />
            <ProductCarouselSkeleton count={6} variant="compact" />
          </div>
        )}

        {/* DB 연결 실패 */}
        {error && (
          <div className="min-h-[40vh] flex flex-col items-center justify-center px-8 py-16 text-center border border-red-500/20 bg-red-950/10 mx-8">
            <p className="text-red-500 text-sm font-medium tracking-wide">DB 연결 실패</p>
            <p className="mt-3 text-[9pt] text-white/60 font-mono max-w-md break-all">{error}</p>
          </div>
        )}

        {/* 제품 목록 (우영미 스타일: 작은 박스, 4열 그리드) */}
        {!loading && !error && newArrivalsByTab.length > 0 && (
          <>
            <button onClick={() => scroll(newRef, 'left')} className="absolute left-4 top-[55%] z-20 opacity-0 group-hover/new:opacity-100 transition-all text-white/50 hover:text-white"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M15 19l-7-7 7-7" /></svg></button>
            <button onClick={() => scroll(newRef, 'right')} className="absolute right-4 top-[55%] z-20 opacity-0 group-hover/new:opacity-100 transition-all text-white/50 hover:text-white"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M9 5l7 7-7 7" /></svg></button>

            <div ref={newRef} className="flex overflow-x-auto gap-6 md:gap-8 px-8 md:px-12 scrollbar-hide snap-x no-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {newArrivalsByTab.map((product) => (
                <div key={product.id} className="min-w-[42%] sm:min-w-[30%] md:min-w-[calc(25%-18px)] snap-start group relative flex flex-col flex-shrink-0">
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-[3/4] overflow-hidden bg-zinc-900 relative border border-white/5">
                      <img src={product.image} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-500" alt={product.name} />
                      <div
                        onClick={(e) => handleAddToCart(product, e)}
                        className="absolute bottom-0 left-0 right-0 bg-white text-black py-2.5 text-center text-[9pt] font-black tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-400 z-30 cursor-pointer"
                      >
                        ADD TO CART +
                      </div>
                    </div>
                    <div className="mt-4 space-y-1 text-left">
                      <h3 className="text-[9pt] font-bold tracking-widest uppercase text-white/70 group-hover:text-white transition-colors leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-purple-500">
                        {product.price}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !error && newArrivalsByTab.length === 0 && (
          <div className="px-8 py-16 text-center min-h-[20vh] flex items-center justify-center">
            <p className="text-white/40 text-[9pt] tracking-widest uppercase">
              {newArrivalTab === 'men' ? '남성' : '여성'} 신상품이 없습니다.
            </p>
          </div>
        )}
      </section>

      {/* 3. 가장 주목 받는 상품 (우영미 스타일) */}
      <section className="py-20 md:py-28 bg-[#080808] border-y border-white/5 relative group/best">
        <div className="px-8 md:px-12 mb-8">
          <h2 className="text-xl md:text-2xl font-light uppercase tracking-tight">가장 주목 받는 상품</h2>
          {/* [매뉴얼] 아래 DESCRIPTION 수정: 작은 연한 회색 설명 문구. 브랜드 스토리/컬렉션 소개를 자유롭게 작성하세요. */}
          <p className="mt-3 text-[11px] font-light text-white/50 tracking-[0.05em] leading-relaxed max-w-2xl">
            두 번의 삭제를 통해 거부하며, 그 과정에서 본연의 형체를 드러냅니다. Double Negative는 일상 속에서 빛나는 감각적인 실루엣을 제안합니다.
          </p>
        </div>

        {loading && (
          <div className="relative">
            <ProductCarouselSkeleton count={6} variant="small" />
          </div>
        )}

        {!loading && !error && bestSellers.length > 0 && (
          <>
            <button onClick={() => scroll(bestRef, 'left')} className="absolute left-4 top-[50%] z-20 opacity-0 group-hover/best:opacity-100 transition-all text-white/30 hover:text-white"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M15 19l-7-7 7-7" /></svg></button>
            <button onClick={() => scroll(bestRef, 'right')} className="absolute right-4 top-[50%] z-20 opacity-0 group-hover/best:opacity-100 transition-all text-white/30 hover:text-white"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M9 5l7 7-7 7" /></svg></button>

            <div ref={bestRef} className="flex overflow-x-auto gap-4 md:gap-6 px-8 md:px-12 scrollbar-hide no-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {bestSellers.map((product) => (
                <div key={product.id} className="min-w-[38%] sm:min-w-[28%] md:min-w-[calc(20%-16px)] group relative flex flex-col flex-shrink-0">
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-[3/4] overflow-hidden bg-zinc-900 mb-4 relative border border-white/5">
                      <img src={product.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={product.name} />
                      <div
                        onClick={(e) => handleAddToCart(product, e)}
                        className="absolute bottom-0 left-0 right-0 bg-white text-black py-2 text-center text-[9pt] font-black tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-400 z-30 cursor-pointer"
                      >
                        ADD TO CART +
                      </div>
                    </div>
                    <div className="space-y-0.5 text-left px-0.5">
                      <h3 className="text-[9pt] font-bold tracking-widest uppercase text-white/50 group-hover:text-white transition-colors truncate">
                        {product.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-purple-500/80">
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