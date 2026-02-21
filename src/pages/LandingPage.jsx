import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../store/CartContext';
import { useProducts } from '../hooks/useProducts';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { ProductCarouselSkeleton, LoadingMessage } from '../components/ProductSkeleton';
import ProductCard from '../components/ProductCard';
import LookbookSection from '../components/LookbookSection';
import FAQ from '../components/FAQ';
import flower3 from '../asset/flower3.png';

const LandingPage = () => {
  const { addToCart } = useCart();
  const { items: recentlyViewedItems } = useRecentlyViewed();
  const [newArrivalTab, setNewArrivalTab] = useState('men');

  const { products, loading, error } = useProducts();
  const menProducts = products.filter((p) => (p.gender || '').toLowerCase() === 'men');
  const womenProducts = products.filter((p) => (p.gender || '').toLowerCase() === 'women');
  const newArrivalsByTab = newArrivalTab === 'men' ? menProducts.slice(0, 12) : womenProducts.slice(0, 12);
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
    <div className="bg-[#FFFFFF] text-[#000000] antialiased overflow-x-hidden relative">
      {/* 1. 메인 히어로: flower3.png 전체 화면 */}
      <section className="relative w-[100vw] h-[100vh] min-h-[100dvh] m-0 overflow-hidden bg-[#000000]">
        <div className="absolute inset-0 w-full h-full">
          <img
            src={flower3}
            alt="히어로 이미지"
            className="w-full h-full object-cover object-center block"
            decoding="async"
            loading="eager"
          />
        </div>
      </section>

      {/* 2. NEW ARRIVALS */}
      <section className="py-16 md:py-24 relative group/new">
        <div className="px-6 md:px-12 mb-6 md:mb-8">
          <p className="text-[#999999] text-[8pt] md:text-[9pt] font-bold tracking-[0.2em] uppercase mb-2">Seasonal Focus</p>
          <h2 className="text-lg md:text-2xl font-light uppercase tracking-tight leading-none">신상품</h2>
          <div className="flex items-center gap-4 md:gap-6 mt-4">
            <div className="flex border-b border-[#F0F0F0]">
              <button
                type="button"
                onClick={() => setNewArrivalTab('men')}
                className={`px-3 py-1.5 text-[8pt] font-medium tracking-[0.15em] uppercase transition-colors ${
                  newArrivalTab === 'men' ? 'text-[#000000] border-b-2 border-[#000000] -mb-[2px]' : 'text-[#999999] hover:text-[#333333]'
                }`}
              >
                men
              </button>
              <button
                type="button"
                onClick={() => setNewArrivalTab('women')}
                className={`px-3 py-1.5 text-[8pt] font-medium tracking-[0.15em] uppercase transition-colors ${
                  newArrivalTab === 'women' ? 'text-[#000000] border-b-2 border-[#000000] -mb-[2px]' : 'text-[#999999] hover:text-[#333333]'
                }`}
              >
                women
              </button>
            </div>
            {newArrivalTab === 'men' ? (
              <Link to="/shop/men" className="text-[8pt] font-medium tracking-[0.15em] uppercase text-[#666666] hover:text-[#000000] transition-colors whitespace-nowrap">
                더 많은 상품 보기
              </Link>
            ) : (
              <Link to="/shop/women" className="text-[8pt] font-medium tracking-[0.15em] uppercase text-[#666666] hover:text-[#000000] transition-colors whitespace-nowrap">
                더 많은 상품 보기
              </Link>
            )}
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
            <button onClick={() => scroll(newRef, 'left')} className="absolute left-4 top-[55%] z-20 opacity-0 group-hover/new:opacity-100 transition-all text-[#666666] hover:text-[#000000]"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M15 19l-7-7 7-7" /></svg></button>
            <button onClick={() => scroll(newRef, 'right')} className="absolute right-4 top-[55%] z-20 opacity-0 group-hover/new:opacity-100 transition-all text-[#666666] hover:text-[#000000]"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M9 5l7 7-7 7" /></svg></button>

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
            <p className="text-[#999999] text-[9pt] tracking-[0.15em] uppercase">
              {newArrivalTab === 'men' ? 'men' : 'women'} 신상품이 없습니다.
            </p>
          </div>
        )}
      </section>

      {/* 3. 가장 주목 받는 상품 */}
      <section className="py-16 md:py-24 bg-[#F9F9F9] relative group/best">
        <div className="px-6 md:px-12 mb-6 md:mb-8">
          <h2 className="text-lg md:text-2xl font-light uppercase tracking-tight">가장 주목 받는 상품</h2>
          <p className="mt-3 text-[11px] font-light text-[#666666] tracking-[0.05em] leading-relaxed max-w-2xl">
            두 번의 삭제를 통해 거부하며, 그 과정에서 본연의 형체를 드러냅니다. jvng.은 일상 속에서 빛나는 감각적인 실루엣을 제안합니다.
          </p>
        </div>

        {loading && (
          <div className="relative">
            <ProductCarouselSkeleton count={6} variant="small" />
          </div>
        )}

        {!loading && !error && bestSellers.length > 0 && (
          <>
            <button onClick={() => scroll(bestRef, 'left')} className="absolute left-4 top-[50%] z-20 opacity-0 group-hover/best:opacity-100 transition-all text-[#999999] hover:text-[#000000]"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M15 19l-7-7 7-7" /></svg></button>
            <button onClick={() => scroll(bestRef, 'right')} className="absolute right-4 top-[50%] z-20 opacity-0 group-hover/best:opacity-100 transition-all text-[#999999] hover:text-[#000000]"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M9 5l7 7-7 7" /></svg></button>

            <div ref={bestRef} className="flex overflow-x-auto gap-4 md:gap-6 px-6 md:px-12 scrollbar-hide snap-x no-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {bestSellers.map((product) => (
                <div key={product.id} className="w-[160px] min-w-[160px] sm:w-[180px] sm:min-w-[180px] md:w-[200px] md:min-w-[200px] snap-start flex-shrink-0">
                  <ProductCard product={product} onAddToCart={handleAddToCart} variant="carousel" grayscale />
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !error && bestSellers.length === 0 && (
          <div className="px-12 py-20 text-center min-h-[20vh] flex items-center justify-center">
            <p className="text-[#999999] text-sm tracking-[0.2em] uppercase">No Products</p>
          </div>
        )}
      </section>

      {/* Recently Viewed (localStorage, 최대 5개) */}
      {recentlyViewedItems.length > 0 && (
        <section className="py-12 md:py-16 border-t border-[#F0F0F0]">
          <div className="px-6 md:px-12 mb-4">
            <p className="text-[9px] font-light tracking-[0.2em] uppercase text-[#999999]">Recently Viewed</p>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-6 md:px-12 pb-2">
            {recentlyViewedItems.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="flex-shrink-0 w-20 md:w-24 group"
              >
                <div className="aspect-[3/4] overflow-hidden bg-[#F5F5F5] mb-1.5">
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
                <p className="text-[8px] md:text-[9px] font-light tracking-widest text-[#666666] group-hover:text-[#000000] truncate transition-colors">
                  {p.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <LookbookSection />

      {/* FAQ: 메인에서 미리보기 + 전체는 /faq 페이지에서 */}
      <section className="py-16 md:py-24 border-t border-[#F0F0F0]">
        <div className="px-6 md:px-12 mb-8">
          <p className="text-[#999999] text-[8pt] md:text-[9pt] font-bold tracking-[0.2em] uppercase mb-2">Customer Service</p>
          <h2 className="text-lg md:text-2xl font-light uppercase tracking-tight leading-none">FAQ</h2>
        </div>
        <FAQ showTitle={false} className="pt-0 pb-0" />
        <div className="max-w-2xl mx-auto px-6 md:px-8 mt-8 text-center">
          <Link
            to="/faq"
            className="inline-block text-[10px] font-light tracking-[0.15em] uppercase text-[#666666] hover:text-[#000000] border-b border-[#000000] pb-1 transition-colors"
          >
            자주 묻는 질문 전체 보기
          </Link>
        </div>
      </section>

      <footer className="py-20 text-center">
        <p className="text-[10px] font-light tracking-[0.2em] uppercase text-[#999999]">Archive 2026</p>
      </footer>
    </div>
  );
};

export default LandingPage;
