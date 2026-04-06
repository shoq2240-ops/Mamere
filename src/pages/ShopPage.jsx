import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../store/CartContext';
import { useProducts } from '../hooks/useProducts';
import { ProductGridSkeleton } from '../components/ProductSkeleton';
import ProductCard from '../components/ProductCard';

const SKIN_TYPES = ['건성', '지성', '복합성', '민감성'];
const SKIN_CONCERNS = ['보습', '진정', '트러블', '미백', '탄력'];
const PAGE_SIZE = 12;

const normalizeCategory = (c) => (c || '').toLowerCase().replace(/-/g, '_');

/** 레거시 DB 값 household_items → household */
const canonicalCategory = (c) => {
  const n = normalizeCategory(c);
  return n === 'household_items' ? 'household' : n;
};
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

const ShopPage = ({ category }) => {
  const { addToCart } = useCart();
  const [addingById, setAddingById] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const skinTypeParam = searchParams.get('skinType') || '';
  const skinConcernParam = searchParams.get('skinConcern') || '';

  const { products, loading, error } = useProducts();

  const categoryNorm = normalizeCategory(category);
  const showSkinFilters = !categoryNorm || categoryNorm === 'skincare';

  const filteredProducts = useMemo(
    () =>
      products
        .filter((product) => {
          if (!categoryNorm) return true;
          return canonicalCategory(product.category) === categoryNorm;
        })
        .filter((product) => {
          if (!showSkinFilters || !skinTypeParam) return true;
          return toArray(product.skin_type || product.skinType).some((ty) => String(ty).trim() === skinTypeParam);
        })
        .filter((product) => {
          if (!showSkinFilters || !skinConcernParam) return true;
          return toArray(product.skin_concern || product.skinConcern).some((c) => String(c).trim() === skinConcernParam);
        }),
    [products, categoryNorm, showSkinFilters, skinTypeParam, skinConcernParam]
  );

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [categoryNorm, skinTypeParam, skinConcernParam]);

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
    const idKey = String(product?.id ?? '');
    if (!idKey) return;
    if (addingById[idKey]) return;
    setAddingById((prev) => ({ ...prev, [idKey]: true }));

    const added = addToCart(product, 1);
    if (!added) {
      const stock = product?.stock_quantity ?? product?.stock ?? 0;
      toast.error(`최대 구매 가능 수량은 ${stock}개입니다.`);
      setTimeout(() => {
        setAddingById((prev) => ({ ...prev, [idKey]: false }));
      }, 350);
      return;
    }
    toast.success('장바구니에 담았습니다.');
    setTimeout(() => {
      setAddingById((prev) => ({ ...prev, [idKey]: false }));
    }, 500);
  };

  const categoryTitle =
    categoryNorm === 'body_hair'
      ? 'BODY & HAIR'
      : categoryNorm === 'household'
        ? 'HOUSEHOLD'
        : categoryNorm === 'skincare'
          ? 'DEEP CARE'
          : 'SHOP ALL';
  const filterSectionTitleClass = 'mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#AAAAAA]';
  const filterBtnClass = (active) =>
    `text-[11px] underline-offset-4 transition-colors ${
      active ? 'font-medium text-[#1A1A1A] underline' : 'font-light text-[#777777] hover:font-medium hover:text-[#1A1A1A] hover:underline'
    }`;

  const skinTypeOptions = [{ value: '', label: '전체' }, ...SKIN_TYPES.map((label) => ({ value: label, label }))];
  const skinConcernOptions = [{ value: '', label: '전체' }, ...SKIN_CONCERNS.map((c) => ({ value: c, label: c }))];

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 antialiased text-[#1A1A1A]">
      <div className="w-full border-b border-[#EEEEEE] bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-8 py-4">
          <h2 className="text-[13px] font-light tracking-widest text-[#1A1A1A]">{categoryTitle}</h2>
          {showSkinFilters && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className="text-[11px] font-extralight tracking-tight text-[#1A1A1A]"
              >
                {showFilters ? '- FILTER' : '+ FILTER'}
              </button>
              {showFilters && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[280px] border border-[#EEEEEE] bg-white/95 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md">
                  <div className="flex flex-col gap-6">
                    <section>
                      <p className={filterSectionTitleClass}>TYPE</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {skinTypeOptions.map((opt) => (
                          <button
                            key={opt.value || 'all'}
                            type="button"
                            onClick={() =>
                              opt.value === '' ? updateFilter('skinType', '') : toggleFilter('skinType', opt.value, skinTypeParam)
                            }
                            className={filterBtnClass(opt.value === '' ? !skinTypeParam : skinTypeParam === opt.value)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </section>
                    <section>
                      <p className={filterSectionTitleClass}>CONCERN</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {skinConcernOptions.map((opt) => (
                          <button
                            key={opt.value || 'all'}
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
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto mt-10 mb-16 w-full max-w-[1440px] px-8 md:mb-24">
        {loading && (
          <div>
            <ProductGridSkeleton count={12} columnsClass="grid-cols-2 lg:grid-cols-4" gapClass="gap-x-4 gap-y-24" />
          </div>
        )}

        {error && (
          <div className="py-24 text-center text-[11px] font-light tracking-wide text-[#1A1A1A]/50">
            데이터를 불러오지 못했습니다.
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid w-full grid-cols-2 gap-x-4 gap-y-24 lg:grid-cols-4">
              {filteredProducts.length > 0 ? (
                displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    isAdding={!!addingById[String(product.id)]}
                    variant="grid"
                  />
                ))
              ) : (
                <div className="col-span-full py-32 text-center text-[10px] font-extralight uppercase tracking-[0.2em] text-[#CCCCCC]">
                  상품이 없습니다.
                </div>
              )}
            </div>
            {filteredProducts.length > 0 && hasMore && (
              <div ref={loadMoreRef} className="h-8 w-full shrink-0" aria-hidden />
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default ShopPage;
