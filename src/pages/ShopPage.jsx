import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { useLanguage } from '../store/LanguageContext';
import LoginRequiredModal from '../components/LoginRequiredModal';
import { useProducts } from '../hooks/useProducts';
import { ProductGridSkeleton, LoadingMessage } from '../components/ProductSkeleton';
import ProductCard from '../components/ProductCard';

const SKIN_TYPES = ['건성', '지성', '복합성', '민감성'];
const SKIN_TYPE_TOOLTIPS = {
  건성: '세안 후 얇은 당김이 느껴지고, 피부가 쉽게 메마른다면',
  지성: '오후가 되면 자연스러운 윤기를 넘어 유분감이 맴돈다면',
  복합성: '이마와 코는 번들거리지만 볼은 건조해, 세심한 균형이 필요하다면',
  민감성: '작은 변화에도 쉽게 반응하여, 진정이 필요하다면',
};
const SKIN_CONCERNS = ['보습', '진정', '트러블', '미백', '탄력'];

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

const ShopPage = ({ category }) => {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('search') || '';
  const skinTypeParam = searchParams.get('skinType') || '';
  const skinConcernParam = searchParams.get('skinConcern') || '';

  const [searchTerm, setSearchTerm] = useState(query);
  const [skinType, setSkinType] = useState(skinTypeParam);
  const [skinConcern, setSkinConcern] = useState(skinConcernParam);
  const [hoveredSkinType, setHoveredSkinType] = useState(null);

  const { products, loading, error } = useProducts();

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);
  useEffect(() => {
    setSkinType(skinTypeParam);
  }, [skinTypeParam]);
  useEffect(() => {
    setSkinConcern(skinConcernParam);
  }, [skinConcernParam]);

  const categoryNorm = normalizeCategory(category);

  const showSkinFilters = !categoryNorm || categoryNorm === 'skincare';

  useEffect(() => {
    if (categoryNorm === 'body_hair') {
      setSkinType('');
      setSkinConcern('');
      const next = new URLSearchParams(searchParams);
      next.delete('skinType');
      next.delete('skinConcern');
      setSearchParams(next);
    }
  }, [categoryNorm]);

  const filteredProducts = products
    .filter((product) => {
      if (!categoryNorm) return true;
      const pCat = normalizeCategory(product.category);
      return pCat === categoryNorm;
    })
    .filter((product) => {
      if (!showSkinFilters || !skinType) return true;
      const types = toArray(product.skin_type || product.skinType);
      return types.some((ty) => String(ty).trim() === skinType);
    })
    .filter((product) => {
      if (!showSkinFilters || !skinConcern) return true;
      const concerns = toArray(product.skin_concern || product.skinConcern);
      return concerns.some((c) => String(c).trim() === skinConcern);
    })
    .filter((product) => product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase()));

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

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const categoryLabel =
    category === 'body_hair'
      ? t('shop.bodyHair')
      : category === 'skincare'
        ? t('shop.skincare')
        : t('shop.all');

  const categorySubCopy =
    !categoryNorm
      ? t('shop.categorySubAll')
      : categoryNorm === 'skincare'
        ? t('shop.categorySubSkincare')
        : categoryNorm === 'body_hair'
          ? t('shop.categorySubBodyHair')
          : null;

  return (
    <div className="bg-[#F9F7F2] min-h-screen pt-20 md:pt-24 pb-16 md:pb-20 antialiased relative text-[#3E2F28]">
      <div className="max-w-[1800px] mx-auto px-6 md:px-8">
        {/* 검색 바 */}
        <div className="mb-8 md:mb-10">
          <input
            type="text"
            placeholder={t('shop.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => {
              const val = e.target.value.slice(0, 100);
              setSearchTerm(val);
              setSearchParams(val ? { ...Object.fromEntries(searchParams), search: val } : {});
            }}
            className="w-full bg-[#F9F7F2] border border-[#A8B894]/40 py-3 md:py-4 px-4 text-[11px] md:text-[12px] font-light tracking-[0.08em] outline-none focus:border-[#A8B894] transition-colors placeholder:text-[#7A6B63] text-[#3E2F28]"
          />
        </div>

        {/* 필터: 피부 타입, 피부 고민 — 전체 쇼핑·스킨케어일 때만 노출 */}
        {showSkinFilters && (
          <div className="mb-10 md:mb-12 flex flex-col gap-6">
            <div className="relative">
              <p className="text-[9px] md:text-[10px] tracking-[0.15em] uppercase text-[#7A6B63] mb-2">{t('shop.skinType')}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateFilter('skinType', '')}
                  className={`px-4 py-2 text-[10px] font-light tracking-[0.08em] uppercase transition-colors ${
                    !skinType ? 'bg-[#A8B894] text-[#2D3A2D]' : 'bg-[#F9F7F2] border border-[#A8B894]/50 text-[#3E2F28] hover:border-[#A8B894]'
                  }`}
                >
                  {t('shop.all')}
                </button>
                {SKIN_TYPES.map((typeLabel) => (
                  <div
                    key={typeLabel}
                    className="relative inline-block"
                    onMouseEnter={() => setHoveredSkinType(typeLabel)}
                    onMouseLeave={() => setHoveredSkinType(null)}
                  >
                    <button
                      type="button"
                      onClick={() => updateFilter('skinType', skinType === typeLabel ? '' : typeLabel)}
                      className={`px-4 py-2 text-[10px] font-light tracking-[0.08em] uppercase transition-colors ${
                        skinType === typeLabel ? 'bg-[#A8B894] text-[#2D3A2D]' : 'bg-[#F9F7F2] border border-[#A8B894]/50 text-[#3E2F28] hover:border-[#A8B894]'
                      }`}
                    >
                      {typeLabel}
                    </button>
                    <AnimatePresence>
                      {hoveredSkinType === typeLabel && SKIN_TYPE_TOOLTIPS[typeLabel] && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                          className="absolute left-0 z-10 mt-1 min-w-[200px] max-w-[280px] rounded-sm border border-[#E8E4DF] bg-[#F5F3EE] px-3 py-2.5 text-[11px] font-light leading-relaxed text-[#5C4A42] shadow-[0_8px_20px_rgba(62,47,40,0.08)]"
                          style={{ top: '100%' }}
                        >
                          {SKIN_TYPE_TOOLTIPS[typeLabel]}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] tracking-[0.15em] uppercase text-[#7A6B63] mb-2">{t('shop.skinConcern')}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateFilter('skinConcern', '')}
                  className={`px-4 py-2 text-[10px] font-light tracking-[0.08em] uppercase transition-colors ${
                    !skinConcern ? 'bg-[#A8B894] text-[#2D3A2D]' : 'bg-[#F9F7F2] border border-[#A8B894]/50 text-[#3E2F28] hover:border-[#A8B894]'
                  }`}
                >
                  {t('shop.all')}
                </button>
                {SKIN_CONCERNS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateFilter('skinConcern', skinConcern === c ? '' : c)}
                    className={`px-4 py-2 text-[10px] font-light tracking-[0.08em] uppercase transition-colors ${
                      skinConcern === c ? 'bg-[#A8B894] text-[#2D3A2D]' : 'bg-[#F9F7F2] border border-[#A8B894]/50 text-[#3E2F28] hover:border-[#A8B894]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 헤더 */}
        <div className="mb-12 md:mb-16 flex justify-between items-end">
          <div>
            <p className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-[#7A6B63] font-medium mb-2 md:mb-3" aria-hidden="true">{t('shop.title')}</p>
            <h1 className="text-lg md:text-2xl font-semibold tracking-tight leading-none text-[#3E2F28]">{categoryLabel}</h1>
            {categorySubCopy && (
              <p className="mt-2 md:mt-3 text-[11px] md:text-[12px] font-light text-[#7A6B63] tracking-[0.04em] leading-relaxed max-w-xl">
                {categorySubCopy}
              </p>
            )}
          </div>
          <span className="text-[9px] md:text-[10px] font-light text-[#7A6B63] tracking-[0.15em] uppercase mb-2">
            {loading ? '...' : `${filteredProducts.length}${t('shop.productsCount')}`}
          </span>
        </div>

        {loading && (
          <div className="space-y-8">
            <LoadingMessage />
            <ProductGridSkeleton count={8} />
          </div>
        )}

        {error && (
          <div className="min-h-[50vh] flex flex-col items-center justify-center py-24 px-8 text-center border border-red-200 bg-red-50">
            <p className="text-red-600 text-sm font-medium tracking-wide">{t('landing.dbError')}</p>
            <p className="mt-3 text-xs text-[#666666] font-mono max-w-lg break-all">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 md:gap-y-20">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} onAddToCart={handleAddToCart} variant="grid" />
                </div>
              ))
            ) : (
              <div className="col-span-full py-40 text-center space-y-4 px-6">
                <p className="text-[12px] font-medium tracking-[0.15em] text-[#5C4A42] uppercase">{t('shop.noProductsTitle')}</p>
                <p className="text-[11px] font-light tracking-[0.08em] text-[#7A6B63]">
                  {searchTerm || skinType || skinConcern
                    ? t('shop.noProductsFilter')
                    : t('shop.noProductsCategory')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSkinType('');
                    setSkinConcern('');
                    setSearchParams({});
                  }}
                  className="mt-6 text-[10px] border-b border-[#A8B894] pb-1 text-[#5C4A42] hover:text-[#3E2F28] transition-colors uppercase tracking-widest"
                >
                  {t('shop.viewAll')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <LoginRequiredModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default ShopPage;
