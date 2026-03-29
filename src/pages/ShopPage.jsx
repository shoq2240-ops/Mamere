import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { useLanguage } from '../store/LanguageContext';
import LoginRequiredModal from '../components/LoginRequiredModal';
import { useProducts } from '../hooks/useProducts';
import { ProductGridSkeleton } from '../components/ProductSkeleton';
import ProductCard from '../components/ProductCard';

const SKIN_TYPES = ['건성', '지성', '복합성', '민감성'];
const SKIN_CONCERNS = ['보습', '진정', '트러블', '미백', '탄력'];
const PAGE_SIZE = 12;

const normalizeCategory = (c) => (c || '').toLowerCase().replace(/-/g, '_');
const toArray = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [v];
    } catch {
      return v ? [v] : [];
    }
  }
  return [];
};

/** 필터 칩 사이: 세로 막대 (#EEEEEE) */
const FilterDivider = () => (
  <span className="mx-2 inline-block h-[10px] w-px shrink-0 self-center bg-[#EEEEEE] sm:mx-3" aria-hidden />
);

const ShopPage = ({ category }) => {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('search') || '';
  const skinTypeParam = searchParams.get('skinType') || '';
  const skinConcernParam = searchParams.get('skinConcern') || '';

  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const { products, loading, error } = useProducts();

  const categoryNorm = normalizeCategory(category);
  const showSkinFilters = !categoryNorm || categoryNorm === 'skincare';

  const filteredProducts = useMemo(
    () =>
      products
        .filter((product) => {
          if (!categoryNorm) return true;
          return normalizeCategory(product.category) === categoryNorm;
        })
        .filter((product) => {
          if (!showSkinFilters || !skinTypeParam) return true;
          return toArray(product.skin_type || product.skinType).some((ty) => String(ty).trim() === skinTypeParam);
        })
        .filter((product) => {
          if (!showSkinFilters || !skinConcernParam) return true;
          return toArray(product.skin_concern || product.skinConcern).some((c) => String(c).trim() === skinConcernParam);
        })
        .filter((product) => product.name?.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, categoryNorm, showSkinFilters, skinTypeParam, skinConcernParam, searchTerm]
  );

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [categoryNorm, skinTypeParam, skinConcernParam, searchTerm]);

  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );
  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = useCallback(() => {
    setVisibleCount((n) => Math.min(n + PAGE_SIZE, filteredProducts.length));
  }, [filteredProducts.length]);

  useEffect(() => {
    if (!hasMore || loading) return undefined;
    const el = loadMoreRef.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, loadMore]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const toggleFilter = (key, value, current) => {
    const next = new URLSearchParams(searchParams);
    if (current === value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    const added = addToCart(product, 1);
    if (!added) {
      const stock = product?.stock_quantity ?? product?.stock ?? 0;
      toast.error(`최대 구매 가능 수량은 ${stock}개입니다.`);
      return;
    }
    toast.success(t('common.addToCartDone'));
  };

  const categoryTitle =
    categoryNorm === 'body_hair'
      ? 'BODY & HAIR'
      : categoryNorm === 'skincare'
        ? 'SKIN CARE'
        : 'SHOP ALL';

  const filterLabelClass =
    'text-[9px] font-extralight uppercase tracking-[0.14em] text-[#BBBBBB]';
  const filterBtnClass = (active) =>
    `text-[10px] font-light tracking-[0.1em] transition-colors duration-200 ${
      active ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/45 hover:text-[#1A1A1A]/70'
    }`;

  const skinTypeOptions = [{ value: '', label: t('shop.all') }, ...SKIN_TYPES.map((label) => ({ value: label, label }))];
  const skinConcernOptions = [{ value: '', label: t('shop.all') }, ...SKIN_CONCERNS.map((c) => ({ value: c, label: c }))];

  return (
    <div className="min-h-screen bg-[#FFFFFF] pt-24 pb-24 antialiased text-[#1A1A1A]">
      <div className="mx-auto max-w-[1400px] bg-[#FFFFFF] px-5 md:px-10">
        <div className="mb-10 bg-[#FFFFFF] md:mb-12">
          <input
            type="text"
            placeholder={t('shop.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => {
              const val = e.target.value.slice(0, 100);
              setSearchTerm(val);
              const next = new URLSearchParams(searchParams);
              if (val) next.set('search', val);
              else next.delete('search');
              setSearchParams(next);
            }}
            className="w-full border-0 border-b border-[#F0F0F0] bg-[#FFFFFF] py-3 text-[11px] font-light tracking-wide text-[#1A1A1A] outline-none transition-colors placeholder:text-[#CCCCCC] focus:border-[#1A1A1A]"
          />
        </div>

        <div className="flex items-baseline justify-between gap-6 border-b border-[#F0F0F0] bg-[#FFFFFF] pb-4">
          <h1 className="text-left text-[16px] font-extralight tracking-[0.2em] text-[#1a1a1a]">
            {categoryTitle}
          </h1>
          {showSkinFilters && (
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="shrink-0 text-[10px] font-extralight tracking-tighter text-[#1a1a1a]/85 transition-colors hover:text-[#1a1a1a]"
            >
              {showFilters ? '– 필터' : '+ 필터'}
            </button>
          )}
        </div>

        {showSkinFilters && (
          <div className={`overflow-hidden bg-[#FFFFFF] ${showFilters ? 'max-h-[999px]' : 'max-h-0'}`}>
            <div className="py-8 md:py-10">
              <div className="flex flex-col gap-10 md:flex-row md:flex-wrap md:items-start md:gap-x-14 md:gap-y-8">
                <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                  <span className={`shrink-0 ${filterLabelClass}`}>TYPE</span>
                  <div className="flex flex-wrap items-center">
                    {skinTypeOptions.map((opt, i) => (
                      <React.Fragment key={opt.value || 'all'}>
                        {i > 0 && <FilterDivider />}
                        <button
                          type="button"
                          onClick={() =>
                            opt.value === '' ? updateFilter('skinType', '') : toggleFilter('skinType', opt.value, skinTypeParam)
                          }
                          className={filterBtnClass(opt.value === '' ? !skinTypeParam : skinTypeParam === opt.value)}
                        >
                          {opt.label}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                  <span className={`shrink-0 ${filterLabelClass}`}>CONCERN</span>
                  <div className="flex flex-wrap items-center">
                    {skinConcernOptions.map((opt, i) => (
                      <React.Fragment key={opt.value || 'all'}>
                        {i > 0 && <FilterDivider />}
                        <button
                          type="button"
                          onClick={() =>
                            opt.value === ''
                              ? updateFilter('skinConcern', '')
                              : toggleFilter('skinConcern', opt.value, skinConcernParam)
                          }
                          className={filterBtnClass(opt.value === '' ? !skinConcernParam : skinConcernParam === opt.value)}
                        >
                          {opt.label}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {showFilters && <div className="h-[1px] w-full bg-[#F0F0F0]" />}
          </div>
        )}

        {loading && (
          <div className="mt-12 md:mt-16">
            <ProductGridSkeleton
              count={9}
              columnsClass="grid-cols-2 lg:grid-cols-3"
              gapClass="gap-x-[15px] gap-y-[80px]"
            />
          </div>
        )}

        {error && (
          <div className="py-24 text-center text-[11px] font-light tracking-wide text-[#1A1A1A]/50">
            {t('landing.dbError')}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mt-12 grid grid-cols-2 gap-x-[15px] gap-y-[80px] md:mt-16 lg:grid-cols-3">
              {filteredProducts.length > 0 ? (
                displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} variant="grid" />
                ))
              ) : (
                <div className="col-span-full py-32 text-center text-[10px] font-extralight uppercase tracking-[0.2em] text-[#CCCCCC]">
                  {t('shop.noProductsTitle')}
                </div>
              )}
            </div>
            {filteredProducts.length > 0 && hasMore && (
              <div ref={loadMoreRef} className="h-8 w-full shrink-0" aria-hidden />
            )}
          </>
        )}
      </div>

      <LoginRequiredModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default ShopPage;
