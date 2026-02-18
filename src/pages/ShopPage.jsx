import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import LoginRequiredModal from '../components/LoginRequiredModal';
import { useProducts } from '../hooks/useProducts';
import { ProductGridSkeleton, LoadingMessage } from '../components/ProductSkeleton';
import ProductCard from '../components/ProductCard'; 

// 데이터 소스: Supabase products 테이블만 사용. category = 'men' | 'women' 시 해당 카테고리만 필터.
const ShopPage = ({ category }) => {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('search') || "";
  const sub = searchParams.get('sub') || '';

  const [searchTerm, setSearchTerm] = useState(query);

  const { products, loading, error } = useProducts();

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  // 1) 성별 필터: category prop이 있으면 products.gender와 일치하는 것만 (men/women)
  // 2) 상품 종류 필터: sub 쿼리가 있으면 products.category와 일치 (outerwear/top/bottom)
  // 3) 검색어 필터: product.name에 searchTerm 포함
  const filteredProducts = products
    .filter(product => !category || (product.gender && product.gender.toLowerCase() === category.toLowerCase()))
    .filter(product => !sub || (product.category || '').toLowerCase() === sub.toLowerCase())
    .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    addToCart(product);
    toast.success('장바구니에 추가되었습니다');
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen pt-20 md:pt-24 pb-16 md:pb-20 antialiased relative text-[#000000]">
      
      {/* 검색 바 섹션 */}
      <div className="px-6 md:px-8 mb-8 md:mb-12">
        <input 
          type="text"
          placeholder="SEARCH YOUR ARCHIVE..."
          value={searchTerm}
          onChange={(e) => {
            const val = e.target.value.slice(0, 100);
            setSearchTerm(val);
            setSearchParams(val ? { search: val } : {});
          }}
          className="w-full bg-transparent border-b border-[#E5E5E5] py-3 md:py-4 text-[11px] md:text-[12px] font-light tracking-[0.15em] uppercase outline-none focus:border-[#000000] transition-colors placeholder:text-[#CCCCCC] placeholder:font-light text-[#000000]"
        />
      </div>
      
      {/* 헤더 섹션 */}
      <div className="px-6 md:px-8 mb-12 md:mb-16 flex justify-between items-end">
        <div>
          <h1 className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-[#666666] font-bold mb-2 md:mb-3">Selection</h1>
          <h2 className="text-lg md:text-2xl font-light uppercase tracking-tight leading-none text-[#000000]">
            {category === 'men' ? 'men' : category === 'women' ? 'women' : 'men · women'}
          </h2>
        </div>
        <span className="text-[9px] md:text-[10px] font-light text-[#999999] tracking-[0.15em] uppercase mb-2">
          {loading ? '...' : `${filteredProducts.length} 개 상품`}
        </span>
      </div>

      {/* 로딩 스켈레톤 */}
      {loading && (
        <div className="space-y-8">
          <LoadingMessage />
          <ProductGridSkeleton count={8} />
        </div>
      )}

      {/* DB 연결 실패: 제품 그리드 비우고 에러만 표시 */}
      {error && (
        <div className="min-h-[50vh] flex flex-col items-center justify-center py-24 px-8 text-center border border-red-200 bg-red-50">
          <p className="text-red-600 text-sm font-medium tracking-wide">DB 연결 실패</p>
          <p className="mt-3 text-xs text-[#666666] font-mono max-w-lg break-all">{error}</p>
          <p className="mt-4 text-[10px] text-[#999999] uppercase tracking-widest">Supabase URL · ANON KEY · RLS 정책 확인</p>
        </div>
      )}

      {/* 상품 그리드: Supabase 데이터만 표시 */}
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
            <p className="text-[12px] font-bold tracking-[0.2em] text-[#333333] uppercase">Archive Empty</p>
            <p className="text-[11px] font-light tracking-[0.15em] text-[#999999] uppercase leading-relaxed break-keep">
              {searchTerm
                ? `찾으시는 제품 "${searchTerm}"이(가) 현재 아카이브에 존재하지 않습니다.`
                : category === 'men'
                  ? 'men 카테고리에 등록된 제품이 없습니다.'
                  : category === 'women'
                    ? 'women 카테고리에 등록된 제품이 없습니다.'
                    : '등록된 제품이 없습니다.'}
            </p>
            {category ? (
              <Link to="/shop" className="mt-6 inline-block text-[10px] border-b border-[#E5E5E5] pb-1 text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-widest">
                Show All Products
              </Link>
            ) : (
              <button onClick={() => { setSearchTerm(""); setSearchParams({}); }} className="mt-6 text-[10px] border-b border-[#E5E5E5] pb-1 text-[#666666] hover:text-[#000000] transition-colors uppercase tracking-widest">
                Show All Products
              </button>
            )}
          </div>
        )}
        </div>
      )}

      <LoginRequiredModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default ShopPage;