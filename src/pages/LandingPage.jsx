import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../store/CartContext';
import { useProducts } from '../hooks/useProducts';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { ProductCarouselSkeleton, LoadingMessage } from '../components/ProductSkeleton';
import ProductCard from '../components/ProductCard';
import FAQ from '../components/FAQ';
import flower3 from '../asset/flower3.png';

const LandingPage = () => {
  const { addToCart } = useCart();
  const { items: recentlyViewedItems } = useRecentlyViewed();
  const [categoryTab, setCategoryTab] = useState('best');

  const { products, loading, error } = useProducts();
  const categoryMap = { best: null, skincare: 'skincare', makeup: 'makeup', body_hair: 'body_hair' };
  const currentCategory = categoryMap[categoryTab];
  const tabProducts = currentCategory
    ? products.filter((p) => (p.category || '').toLowerCase().replace('-', '_') === currentCategory)
    : products;
  const newArrivalsByTab = tabProducts.slice(0, 12);
  const bestSellers = products.slice(0, 12);

  const newRef = useRef(null);
  const bestRef = useRef(null);

  const handleAddToCart = (product, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    addToCart(product);
    toast.success('장바구니에 추가되었습니다');
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
    <div className="bg-[#F9F7F2] text-[#3E2F28] antialiased overflow-x-hidden relative font-sans">
      {/* 1. 히어로: 그라데이션 오버레이로 천연 원료 톤과 조화 */}
      <section className="relative w-[100vw] h-[85vh] min-h-[400px] m-0 overflow-hidden bg-[#EDEAE4]">
        <div className="absolute inset-0 w-full h-full">
          <img
            src={flower3}
            alt="Mamère"
            className="w-full h-full object-cover object-center block opacity-85"
            decoding="async"
            loading="eager"
          />
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          style={{
            background: 'linear-gradient(to bottom, rgba(45,58,45,0.25) 0%, rgba(249,247,242,0.4) 50%, rgba(249,247,242,0.85) 100%)',
          }}
        >
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[#3E2F28] drop-shadow-sm">
            당신의 피부에 진심을 더합니다
          </h1>
          <p className="mt-3 text-sm md:text-base font-light text-[#3E2F28]/90 max-w-md">
            검증된 성분과 투명한 제조로 건강한 아름다움을 제안합니다.
          </p>
        </div>
      </section>

      {/* 2. NEW ARRIVALS / 카테고리별 */}
      <section className="py-16 md:py-24 relative group/new bg-[#F9F7F2]">
        <div className="px-6 md:px-12 mb-6 md:mb-8">
          <p className="text-[#7A6B63] text-[8pt] md:text-[9pt] font-medium tracking-[0.2em] uppercase mb-2">Selection</p>
          <h2 className="text-lg md:text-2xl font-semibold tracking-tight leading-none text-[#3E2F28]">추천 상품</h2>
          <div className="flex items-center gap-4 md:gap-6 mt-4 flex-wrap">
            <div className="flex border-b border-[#A8B894]/40">
              {['best', 'skincare', 'makeup', 'body_hair'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategoryTab(key)}
                  className={`px-3 py-1.5 text-[8pt] font-medium tracking-[0.12em] uppercase transition-colors ${
                    categoryTab === key ? 'text-[#3E2F28] border-b-2 border-[#A8B894] -mb-[2px]' : 'text-[#7A6B63] hover:text-[#3E2F28]'
                  }`}
                >
                  {key === 'body_hair' ? 'Body & Hair' : key === 'best' ? 'Best' : key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
            <Link to={categoryTab === 'best' ? '/shop' : `/shop/${categoryTab === 'body_hair' ? 'body-hair' : categoryTab}`} className="text-[8pt] font-medium tracking-[0.12em] uppercase text-[#5C4A42] hover:text-[#3E2F28] transition-colors whitespace-nowrap">
              더 많은 상품 보기
            </Link>
          </div>
        </div>

        {loading && (
          <div className="relative">
            <LoadingMessage />
            <ProductCarouselSkeleton count={6} variant="compact" />
          </div>
        )}

        {error && (
          <div className="min-h-[40vh] flex flex-col items-center justify-center px-8 py-16 text-center border border-red-200 bg-red-50 mx-8">
            <p className="text-red-600 text-sm font-medium tracking-wide">DB 연결 실패</p>
            <p className="mt-3 text-[9pt] text-[#666666] font-mono max-w-md break-all">{error}</p>
          </div>
        )}

        {!loading && !error && newArrivalsByTab.length > 0 && (
          <>
            <button onClick={() => scroll(newRef, 'left')} className="absolute left-4 top-[55%] z-20 opacity-0 group-hover/new:opacity-100 transition-all text-[#5C4A42] hover:text-[#3E2F28]"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M15 19l-7-7 7-7" /></svg></button>
            <button onClick={() => scroll(newRef, 'right')} className="absolute right-4 top-[55%] z-20 opacity-0 group-hover/new:opacity-100 transition-all text-[#5C4A42] hover:text-[#3E2F28]"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M9 5l7 7-7 7" /></svg></button>

            <div ref={newRef} className="flex overflow-x-auto gap-4 md:gap-6 px-6 md:px-12 scrollbar-hide snap-x no-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {newArrivalsByTab.map((product) => (
                <div key={product.id} className="w-[160px] min-w-[160px] sm:w-[180px] sm:min-w-[180px] md:w-[200px] md:min-w-[200px] snap-start flex-shrink-0">
                  <ProductCard product={product} onAddToCart={handleAddToCart} variant="carousel" />
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !error && newArrivalsByTab.length === 0 && (
          <div className="px-8 py-16 text-center min-h-[20vh] flex items-center justify-center">
            <p className="text-[#7A6B63] text-[9pt] tracking-[0.15em] uppercase">
              해당 카테고리 상품이 없습니다.
            </p>
          </div>
        )}
      </section>

      {/* 3. 베스트 / 가장 주목 받는 상품 */}
      <section className="py-16 md:py-24 bg-[#F5F3EE] relative group/best">
        <div className="px-6 md:px-12 mb-6 md:mb-8">
          <h2 className="text-lg md:text-2xl font-semibold tracking-tight text-[#3E2F28]">가장 주목 받는 상품</h2>
          <p className="mt-3 text-[11px] font-light text-[#5C4A42] tracking-[0.05em] leading-relaxed max-w-2xl">
            베스트셀러와 고객이 많이 찾는 제품을 만나보세요.
          </p>
        </div>

        {loading && (
          <div className="relative">
            <ProductCarouselSkeleton count={6} variant="small" />
          </div>
        )}

        {!loading && !error && bestSellers.length > 0 && (
          <>
            <button onClick={() => scroll(bestRef, 'left')} className="absolute left-4 top-[50%] z-20 opacity-0 group-hover/best:opacity-100 transition-all text-[#5C4A42] hover:text-[#3E2F28]"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M15 19l-7-7 7-7" /></svg></button>
            <button onClick={() => scroll(bestRef, 'right')} className="absolute right-4 top-[50%] z-20 opacity-0 group-hover/best:opacity-100 transition-all text-[#5C4A42] hover:text-[#3E2F28]"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M9 5l7 7-7 7" /></svg></button>

            <div ref={bestRef} className="flex overflow-x-auto gap-4 md:gap-6 px-6 md:px-12 scrollbar-hide snap-x no-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {bestSellers.map((product) => (
                <div key={product.id} className="w-[160px] min-w-[160px] sm:w-[180px] sm:min-w-[180px] md:w-[200px] md:min-w-[200px] snap-start flex-shrink-0">
                  <ProductCard product={product} onAddToCart={handleAddToCart} variant="carousel" />
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !error && bestSellers.length === 0 && (
          <div className="px-12 py-20 text-center min-h-[20vh] flex items-center justify-center">
            <p className="text-[#7A6B63] text-sm tracking-[0.2em] uppercase">No Products</p>
          </div>
        )}
      </section>

      {/* 성분 강조 배너 */}
      <section className="py-16 md:py-20 bg-[#F9F7F2] border-t border-[#A8B894]/30">
        <div className="px-6 md:px-12 text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#7A6B63] mb-2">Key Ingredients</p>
          <h2 className="text-xl md:text-2xl font-semibold text-[#3E2F28] mb-4">시카 · 히알루론산 · 나이아신아마이드</h2>
          <p className="text-[11px] font-light text-[#5C4A42] max-w-xl mx-auto">
            검증된 성분을 바탕으로 피부에 맞는 케어를 제안합니다.
          </p>
        </div>
      </section>

      {/* 피부 타입별 추천 */}
      <section className="py-16 md:py-20 bg-[#F5F3EE] border-t border-[#A8B894]/30">
        <div className="px-6 md:px-12 text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#7A6B63] mb-2">Shop by Skin Type</p>
          <h2 className="text-xl md:text-2xl font-semibold text-[#3E2F28] mb-6">피부 타입별 추천</h2>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {['건성', '지성', '복합성', '민감성'].map((label) => (
              <Link key={label} to={`/shop?skinType=${encodeURIComponent(label)}`} className="px-5 py-2.5 border border-[#A8B894]/50 text-[11px] font-light tracking-[0.08em] text-[#3E2F28] hover:bg-[#A8B894]/30 hover:border-[#A8B894] transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {recentlyViewedItems.length > 0 && (
        <section className="py-12 md:py-16 border-t border-[#A8B894]/30 bg-[#F9F7F2]">
          <div className="px-6 md:px-12 mb-4">
            <p className="text-[9px] font-light tracking-[0.2em] uppercase text-[#7A6B63]">Recently Viewed</p>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-6 md:px-12 pb-2">
            {recentlyViewedItems.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="flex-shrink-0 w-20 md:w-24 group"
              >
                <div className="aspect-[3/4] overflow-hidden bg-[#EDEAE4] mb-1.5">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  )}
                </div>
                <p className="text-[8px] md:text-[9px] font-light tracking-widest text-[#5C4A42] group-hover:text-[#3E2F28] truncate transition-colors">
                  {p.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="py-16 md:py-24 border-t border-[#A8B894]/30 bg-[#F9F7F2]">
        <div className="px-6 md:px-12 mb-8">
          <p className="text-[#7A6B63] text-[8pt] md:text-[9pt] font-medium tracking-[0.2em] uppercase mb-2">Customer Service</p>
          <h2 className="text-lg md:text-2xl font-semibold tracking-tight leading-none text-[#3E2F28]">FAQ</h2>
        </div>
        <FAQ showTitle={false} className="pt-0 pb-0" />
        <div className="max-w-2xl mx-auto px-6 md:px-8 mt-8 text-center">
          <Link
            to="/faq"
            className="inline-block text-[10px] font-light tracking-[0.15em] uppercase text-[#5C4A42] hover:text-[#3E2F28] border-b border-[#A8B894] pb-1 transition-colors"
          >
            자주 묻는 질문 전체 보기
          </Link>
        </div>
      </section>

      <footer className="py-20 text-center bg-[#2D3A2D]">
        <p className="text-[10px] font-light tracking-[0.2em] uppercase text-[#F9F7F2]/80">Mamère © 2026</p>
      </footer>
    </div>
  );
};

export default LandingPage;
