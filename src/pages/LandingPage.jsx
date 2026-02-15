import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import LoginRequiredModal from '../components/LoginRequiredModal';
import { useProducts } from '../hooks/useProducts';
import { ProductCarouselSkeleton, LoadingMessage } from '../components/ProductSkeleton';
import ProductCard from '../components/ProductCard';
import LookbookSection from '../components/LookbookSection';

// 데이터 소스: Supabase products 테이블만 사용. 더미/로컬 데이터 없음.
const LandingPage = () => {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newArrivalTab, setNewArrivalTab] = useState('men'); // 'men' | 'women'

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
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    addToCart(product);
    toast.success('ARCHIVE에 추가되었습니다');
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
      <LoginRequiredModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* 1. HERO SECTION - 우영미 스타일 카드 배너 (가로 +6cm, 세로 +3cm) */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center relative border-b border-white/5 py-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-[calc(42rem+11cm)] mx-auto border border-[#eeeeee]/30 bg-transparent"
        >
          <div className="hero-banner-inner py-[calc(3.5rem+3cm)] px-10 md:py-[calc(4rem+3cm)] md:px-14 flex flex-col items-center justify-center text-center">
            {/* [매뉴얼] 로고 대신 이미지를 넣으려면 아래 블록 전체를 <img src="..." alt="..." className="w-full h-auto object-cover" /> 등으로 교체 */}
            <div className="hero-banner-content">
              <h1 className="text-[8.4vw] md:text-[6.5vw] font-bold italic tracking-tight leading-none uppercase whitespace-nowrap">
                DOUBLE <span className="font-light text-white/90">Negative</span>
              </h1>
              <p className="mt-6 text-[10px] font-light tracking-[0.2em] uppercase text-white/40">
                어둠 속에서 정의되는 새로운 미학
              </p>
            </div>
            {/* [매뉴얼] 배너 하단에 이미지 추가 시: <div className="mt-8 w-full"><img src="..." className="w-full h-auto" alt="" /></div> */}
          </div>
        </motion.div>
      </section>

      {/* 2. NEW ARRIVALS (우영미 스타일: 작은 박스, 남/여 탭, 더 많은 상품보기) */}
      <section className="py-16 md:py-32 relative group/new">
        <div className="px-6 md:px-12 mb-6 md:mb-8">
          <p className="text-purple-500 text-[8pt] md:text-[9pt] font-black tracking-widest uppercase italic mb-1.5 md:mb-2">Seasonal Focus</p>
          <h2 className="text-lg md:text-2xl font-light uppercase tracking-tight leading-none">신상품</h2>
          {/* 남성/여성 탭 + 더 많은 상품보기 (신상품 밑, 1단계 작은 크기) */}
          <div className="flex items-center gap-4 md:gap-6 mt-3 md:mt-4">
            <div className="flex border-b border-white/20">
              <button
                type="button"
                onClick={() => setNewArrivalTab('men')}
                className={`px-3 py-1.5 text-[8pt] font-medium tracking-widest uppercase transition-colors ${
                  newArrivalTab === 'men' ? 'text-white border-b-2 border-white -mb-[2px]' : 'text-white/50 hover:text-white/80'
                }`}
              >
                남성
              </button>
              <button
                type="button"
                onClick={() => setNewArrivalTab('women')}
                className={`px-3 py-1.5 text-[8pt] font-medium tracking-widest uppercase transition-colors ${
                  newArrivalTab === 'women' ? 'text-white border-b-2 border-white -mb-[2px]' : 'text-white/50 hover:text-white/80'
                }`}
              >
                여성
              </button>
            </div>
            {newArrivalTab === 'men' ? (
              <Link to="/shop/men" className="text-[8pt] font-medium tracking-widest uppercase text-white/70 hover:text-white border-b border-white/30 hover:border-white/60 transition-colors whitespace-nowrap">
                더 많은 상품 보기
              </Link>
            ) : (
              <Link to="/shop/women" className="text-[8pt] font-medium tracking-widest uppercase text-white/70 hover:text-white border-b border-white/30 hover:border-white/60 transition-colors whitespace-nowrap">
                더 많은 상품 보기
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

            <div ref={newRef} className="flex overflow-x-auto gap-4 md:gap-8 px-6 md:px-12 scrollbar-hide snap-x no-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {newArrivalsByTab.map((product) => (
                <div key={product.id} className="w-[calc(50%-8px)] min-w-[calc(50%-8px)] sm:w-[calc(33.333%-12px)] sm:min-w-[calc(33.333%-12px)] md:min-w-[calc(25%-18px)] md:w-auto snap-start flex-shrink-0">
                  <ProductCard product={product} onAddToCart={handleAddToCart} variant="carousel" />
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
      <section className="py-16 md:py-28 bg-[#080808] border-y border-white/5 relative group/best">
        <div className="px-6 md:px-12 mb-6 md:mb-8">
          <h2 className="text-lg md:text-2xl font-light uppercase tracking-tight">가장 주목 받는 상품</h2>
          {/* [매뉴얼] 아래 DESCRIPTION 수정: 작은 연한 회색 설명 문구. 브랜드 스토리/컬렉션 소개를 자유롭게 작성하세요. */}
          <p className="mt-2 md:mt-3 text-[11px] font-light text-white/50 tracking-[0.05em] leading-relaxed max-w-2xl">
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

            <div ref={bestRef} className="flex overflow-x-auto gap-4 md:gap-6 px-6 md:px-12 scrollbar-hide snap-x no-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {bestSellers.map((product) => (
                <div key={product.id} className="w-[calc(50%-8px)] min-w-[calc(50%-8px)] sm:w-[calc(33.333%-12px)] sm:min-w-[calc(33.333%-12px)] md:min-w-[calc(20%-16px)] md:w-auto snap-start flex-shrink-0">
                  <ProductCard product={product} onAddToCart={handleAddToCart} variant="carousel" grayscale />
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

      {/* 4. LOOKBOOK SECTION - 브랜드 감성 갤러리 */}
      <LookbookSection />

      <footer className="py-32 text-center opacity-20"><p className="text-[10px] font-light tracking-mega-wide uppercase italic">Double Negative Archive 2026</p></footer>
    </div>
  );
};

export default LandingPage;