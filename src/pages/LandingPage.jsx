import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useCart } from '../store/CartContext';
import { useProducts } from '../hooks/useProducts';
import { useLanguage } from '../store/LanguageContext';
import { ProductCarouselSkeleton, LoadingMessage } from '../components/ProductSkeleton';
import ProductCard from '../components/ProductCard';
import { getAbsoluteUrl } from '../lib/getAbsoluteUrl';
import flower3 from '../asset/flower3.png';

// 메인 히어로 캐러셀 이미지 목록
// 관리자: 아래 배열의 src/alt만 교체하면 배너 이미지를 손쉽게 변경할 수 있습니다.
const HERO_SLIDES = [
  {
    src: flower3,
    alt: '마메르 메인 배너, 깊은 숲에서 찾은 순수한 휴식',
  },
  {
    src: '/flower1.png',
    alt: '피부를 감싸는 자연 유래 성분의 편안한 질감',
  },
  {
    src: '/flower2.png',
    alt: '마메르의 차분한 톤온톤 패키지와 자연광',
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  // Auto-play
  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <motion.div
          className="flex w-full h-full"
          animate={{ x: `-${current * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -40) next();
            else if (info.offset.x > 40) prev();
          }}
        >
          {HERO_SLIDES.map((slide, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0">
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover object-center block opacity-85"
                decoding="async"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* 인디케이터 Dots */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrent(idx)}
            className={`w-2.5 h-2.5 rounded-full border border-white/60 transition-all ${
              current === idx ? 'bg-white' : 'bg-transparent'
            }`}
            aria-label={`배너 ${idx + 1} 보기`}
          />
        ))}
      </div>
    </>
  );
};

const LandingPage = () => {
  const { addToCart } = useCart();
  const { t } = useLanguage();
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
    const added = addToCart(product, 1);
    if (!added) {
      const stock = product?.stock_quantity ?? product?.stock ?? 0;
      toast.error(`최대 구매 가능 수량은 ${stock}개입니다.`);
      return;
    }
    toast.success(t('common.addToCartDone'));
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

  const mainOgImage = getAbsoluteUrl(flower3);
  const mainDescription = '매일 마주하는 자극으로부터 피부를 다정하게 지켜냅니다. 마메르와 함께 피부가 편안하게 숨 쉬는 시간을 경험해 보세요.';

  return (
    <div className="bg-[#F9F7F2] text-[#3E2F28] antialiased overflow-x-hidden relative font-sans pb-20 md:pb-24">
      <Helmet>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="마메르(Mamère) | 다정한 위로, 순수한 자연" />
        <meta property="og:description" content={mainDescription} />
        <meta property="og:url" content={getAbsoluteUrl('/')} />
        {mainOgImage && <meta property="og:image" content={mainOgImage} />}
        <meta property="og:site_name" content="마메르(Mamère)" />
      </Helmet>
      {/* 1. 히어로: 무한 스와이프 캐러셀 + 그라데이션 오버레이 */}
      <section className="relative w-[100vw] h-[85vh] min-h-[400px] m-0 overflow-hidden bg-[#EDEAE4]" aria-labelledby="hero-heading">
        <HeroCarousel />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          style={{
            background: 'linear-gradient(to bottom, rgba(45,58,45,0.25) 0%, rgba(249,247,242,0.4) 50%, rgba(249,247,242,0.85) 100%)',
          }}
        >
          <h1 id="hero-heading" className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[#3E2F28] drop-shadow-sm">
            {t('landing.heroTitle')}
          </h1>
          <p className="mt-3 text-sm md:text-base font-light text-[#3E2F28]/90 max-w-md">
            {t('landing.heroSub')}
          </p>
          <Link
            to="/shop"
            className="mt-6 md:mt-8 inline-block px-6 py-3 text-[10px] md:text-[11px] font-medium tracking-[0.15em] uppercase bg-[#A8B894] text-[#2D3A2D] hover:bg-[#9AAA82] transition-colors"
          >
            {t('landing.heroCta')}
          </Link>
        </div>
      </section>

      {/* 2. NEW ARRIVALS / 카테고리별 */}
      <section className="py-16 md:py-24 relative group/new bg-[#F9F7F2]">
        <div className="px-6 md:px-12 mb-6 md:mb-8">
          <p className="text-[#7A6B63] text-[8pt] md:text-[9pt] font-medium tracking-[0.2em] uppercase mb-2">{t('landing.selection')}</p>
          <h2 className="text-lg md:text-2xl font-semibold tracking-tight leading-none text-[#3E2F28]">{t('landing.recommendedProducts')}</h2>
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
                  {t(key === 'body_hair' ? 'landing.bodyHair' : `landing.${key}`)}
                </button>
              ))}
            </div>
            <Link to={categoryTab === 'best' ? '/shop' : `/shop/${categoryTab === 'body_hair' ? 'body-hair' : categoryTab}`} className="text-[8pt] font-medium tracking-[0.12em] uppercase text-[#5C4A42] hover:text-[#3E2F28] transition-colors whitespace-nowrap">
              {t('landing.moreProducts')}
            </Link>
          </div>
          <p className="mt-3 text-[11px] font-light text-[#7A6B63] tracking-[0.04em] leading-relaxed max-w-xl">
            {categoryTab === 'best' ? t('shop.categorySubBest') : categoryTab === 'skincare' ? t('shop.categorySubSkincare') : categoryTab === 'makeup' ? t('shop.categorySubMakeup') : t('shop.categorySubBodyHair')}
          </p>
        </div>

        {loading && (
          <div className="relative">
            <LoadingMessage />
            <ProductCarouselSkeleton count={6} variant="compact" />
          </div>
        )}

        {error && (
          <div className="min-h-[40vh] flex flex-col items-center justify-center px-8 py-16 text-center border border-red-200 bg-red-50 mx-8">
            <p className="text-red-600 text-sm font-medium tracking-wide">{t('landing.dbError')}</p>
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
              {t('landing.noCategoryProducts')}
            </p>
          </div>
        )}
      </section>

      {/* 3. 베스트 / 가장 주목 받는 상품 */}
      <section className="py-16 md:py-24 bg-[#F5F3EE] relative group/best">
        <div className="px-6 md:px-12 mb-6 md:mb-8">
          <h2 className="text-lg md:text-2xl font-semibold tracking-tight text-[#3E2F28]">{t('landing.bestSellers')}</h2>
          <p className="mt-3 text-[11px] font-light text-[#5C4A42] tracking-[0.05em] leading-relaxed max-w-2xl">
            {t('landing.bestSellersSub')}
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
            <p className="text-[#7A6B63] text-sm tracking-[0.2em] uppercase">{t('common.noProducts')}</p>
          </div>
        )}
      </section>

      {/* 성분 강조 배너 */}
      <section className="py-16 md:py-20 bg-[#F9F7F2] border-t border-[#A8B894]/30">
        <div className="px-6 md:px-12 text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#7A6B63] mb-2">{t('landing.keyIngredients')}</p>
          <h2 className="text-xl md:text-2xl font-semibold text-[#3E2F28] mb-4">{t('landing.keyIngredientsTitle')}</h2>
          <p className="text-[11px] font-light text-[#5C4A42] max-w-xl mx-auto">
            {t('landing.keyIngredientsSub')}
          </p>
        </div>
      </section>

      {/* 피부 타입별 추천 */}
      <section className="py-16 md:py-20 bg-[#F5F3EE] border-t border-[#A8B894]/30">
        <div className="px-6 md:px-12 text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#7A6B63] mb-2">{t('landing.shopBySkinType')}</p>
          <h2 className="text-xl md:text-2xl font-semibold text-[#3E2F28] mb-6">{t('landing.shopBySkinTypeTitle')}</h2>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {[
              { key: 'landing.skinDry', value: '건성' },
              { key: 'landing.skinOily', value: '지성' },
              { key: 'landing.skinCombination', value: '복합성' },
              { key: 'landing.skinSensitive', value: '민감성' },
            ].map(({ key: labelKey, value }) => (
              <Link key={value} to={`/shop?skinType=${encodeURIComponent(value)}`} className="px-5 py-2.5 border border-[#A8B894]/50 text-[11px] font-light tracking-[0.08em] text-[#3E2F28] hover:bg-[#A8B894]/30 hover:border-[#A8B894] transition-colors">
                {t(labelKey)}
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
