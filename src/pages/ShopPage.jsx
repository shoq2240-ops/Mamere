import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import LoginRequiredModal from '../components/LoginRequiredModal';
import { useProducts } from '../hooks/useProducts';
import { ProductGridSkeleton, LoadingMessage } from '../components/ProductSkeleton';
import ProductCard from '../components/ProductCard';

const SKIN_TYPES = ['건성', '지성', '복합성', '민감성'];
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
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('search') || '';
  const skinTypeParam = searchParams.get('skinType') || '';
  const skinConcernParam = searchParams.get('skinConcern') || '';

  const [searchTerm, setSearchTerm] = useState(query);
  const [skinType, setSkinType] = useState(skinTypeParam);
  const [skinConcern, setSkinConcern] = useState(skinConcernParam);

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
  const filteredProducts = products
    .filter((product) => {
      if (!categoryNorm) return true;
      const pCat = normalizeCategory(product.category);
      if (categoryNorm === 'best') return true;
      return pCat === categoryNorm;
    })
    .filter((product) => {
      if (!skinType) return true;
      const types = toArray(product.skin_type || product.skinType);
      return types.some((t) => String(t).trim() === skinType);
    })
    .filter((product) => {
      if (!skinConcern) return true;
      const concerns = toArray(product.skin_concern || product.skinConcern);
      return concerns.some((c) => String(c).trim() === skinConcern);
    })
    .filter((product) => product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    addToCart(product);
    toast.success('장바구니에 추가되었습니다');
  };

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const categoryLabel =
    category === 'best'
      ? 'Best'
      : category === 'body_hair'
        ? 'Body & Hair'
        : category
          ? (category[0] || '').toUpperCase() + (category.slice(1) || '').replace(/_/g, ' ')
          : 'All';

  return (
    <div className="bg-[#F9F7F2] min-h-screen pt-20 md:pt-24 pb-16 md:pb-20 antialiased relative text-[#3E2F28]">
      <div className="max-w-[1800px] mx-auto px-6 md:px-8">
        {/* 검색 바 */}
        <div className="mb-8 md:mb-10">
          <input
            type="text"
            placeholder="제품 검색..."
            value={searchTerm}
            onChange={(e) => {
              const val = e.target.value.slice(0, 100);
              setSearchTerm(val);
              setSearchParams(val ? { ...Object.fromEntries(searchParams), search: val } : {});
            }}
            className="w-full bg-[#F9F7F2] border border-[#A8B894]/40 py-3 md:py-4 px-4 text-[11px] md:text-[12px] font-light tracking-[0.08em] outline-none focus:border-[#A8B894] transition-colors placeholder:text-[#7A6B63] text-[#3E2F28]"
          />
        </div>

        {/* 필터: 피부 타입, 피부 고민 */}
        <div className="mb-10 md:mb-12 flex flex-col gap-6">
          <div>
            <p className="text-[9px] md:text-[10px] tracking-[0.15em] uppercase text-[#7A6B63] mb-2">피부 타입</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateFilter('skinType', '')}
                className={`px-4 py-2 text-[10px] font-light tracking-[0.08em] uppercase transition-colors ${
                  !skinType ? 'bg-[#A8B894] text-[#2D3A2D]' : 'bg-[#F9F7F2] border border-[#A8B894]/50 text-[#3E2F28] hover:border-[#A8B894]'
                }`}
              >
                전체
              </button>
              {SKIN_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateFilter('skinType', skinType === t ? '' : t)}
                  className={`px-4 py-2 text-[10px] font-light tracking-[0.08em] uppercase transition-colors ${
                    skinType === t ? 'bg-[#A8B894] text-[#2D3A2D]' : 'bg-[#F9F7F2] border border-[#A8B894]/50 text-[#3E2F28] hover:border-[#A8B894]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] tracking-[0.15em] uppercase text-[#7A6B63] mb-2">피부 고민</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateFilter('skinConcern', '')}
                className={`px-4 py-2 text-[10px] font-light tracking-[0.08em] uppercase transition-colors ${
                  !skinConcern ? 'bg-[#A8B894] text-[#2D3A2D]' : 'bg-[#F9F7F2] border border-[#A8B894]/50 text-[#3E2F28] hover:border-[#A8B894]'
                }`}
              >
                전체
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

        {/* 헤더 */}
        <div className="mb-12 md:mb-16 flex justify-between items-end">
          <div>
            <h1 className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-[#7A6B63] font-medium mb-2 md:mb-3">Shop</h1>
            <h2 className="text-lg md:text-2xl font-semibold tracking-tight leading-none text-[#3E2F28]">{categoryLabel}</h2>
          </div>
          <span className="text-[9px] md:text-[10px] font-light text-[#7A6B63] tracking-[0.15em] uppercase mb-2">
            {loading ? '...' : `${filteredProducts.length}개 상품`}
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
            <p className="text-red-600 text-sm font-medium tracking-wide">DB 연결 실패</p>
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
                <p className="text-[12px] font-medium tracking-[0.15em] text-[#5C4A42] uppercase">등록된 제품이 없습니다</p>
                <p className="text-[11px] font-light tracking-[0.08em] text-[#7A6B63]">
                  {searchTerm || skinType || skinConcern
                    ? '필터를 바꿔 보시거나 검색어를 수정해 보세요.'
                    : '해당 카테고리에 등록된 제품이 없습니다.'}
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
                  전체 보기
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
