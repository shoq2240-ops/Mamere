import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../store/CartContext'; 
import { useProducts } from '../hooks/useProducts';
import { ProductGridSkeleton, LoadingMessage } from '../components/ProductSkeleton'; 

// 데이터 소스: Supabase products 테이블만 사용. 더미/로컬 데이터 없음.
const ShopPage = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('search') || "";

  const [showToast, setShowToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState(query);

  const { products, loading, error } = useProducts();

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 팝업을 띄우는 핵심 함수
  const handleAddToCart = (product) => {
    addToCart(product);
    setShowToast(true); // 👈 팝업 켜기
    // 3초 후 자동으로 팝업 닫기
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="bg-black min-h-screen pt-24 pb-20 antialiased relative">
      
      {/* 검색 바 섹션 */}
      <div className="px-8 mb-12">
        <input 
          type="text"
          placeholder="SEARCH YOUR ARCHIVE..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSearchParams({ search: e.target.value });
          }}
          className="w-full bg-transparent border-b border-white/10 py-4 text-[12px] font-light tracking-extra-wide uppercase outline-none focus:border-purple-500 transition-colors placeholder:text-white/5 text-white"
        />
      </div>
      
      {/* 헤더 섹션 */}
      <div className="px-8 mb-16 flex justify-between items-end">
        <div>
          <h1 className="text-[10px] tracking-mega-wide uppercase text-purple-500 font-bold mb-3 italic">Selection</h1>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
            Shop <span className="font-light text-white/40">/ {searchTerm ? 'Result' : 'All'}</span>
          </h2>
        </div>
        <span className="text-[10px] font-light text-white/30 tracking-extra-wide uppercase mb-2">
          {loading ? '...' : `${filteredProducts.length} Items Found`}
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
        <div className="min-h-[50vh] flex flex-col items-center justify-center py-24 px-8 text-center border border-red-500/20 bg-red-950/10">
          <p className="text-red-500 text-sm font-medium tracking-wide">DB 연결 실패</p>
          <p className="mt-3 text-xs text-white/60 font-mono max-w-lg break-all">{error}</p>
          <p className="mt-4 text-[10px] text-white/40 uppercase tracking-widest">Supabase URL · ANON KEY · RLS 정책 확인</p>
        </div>
      )}

      {/* 상품 그리드: Supabase 데이터만 표시 */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-[1px] gap-y-20 border-t border-white/10">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="group relative flex flex-col border-r border-b border-white/10 transition-colors duration-700 hover:bg-zinc-900/40">
              <Link to={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-80 transition-all duration-1000 group-hover:scale-[1.03] group-hover:opacity-100" />
                <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Link>

              <div className="p-8 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-[11px] font-bold tracking-widest uppercase text-white/70 group-hover:text-white transition-colors leading-tight">{product.name}</h3>
                  <p className="text-[13px] font-light tracking-widest text-purple-500/80">{product.price}</p>
                </div>
                <div className="pt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <button 
                    onClick={() => handleAddToCart(product)} // 👈 함수 연결
                    className="w-full border border-white/10 py-4 text-[9px] font-bold tracking-ultra-wide uppercase text-white/50 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                  >
                    Add to Archive
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-40 text-center space-y-4 px-6">
            <p className="text-[12px] font-bold tracking-mega-wide text-purple-500 uppercase">Archive Empty</p>
            <p className="text-[11px] font-light tracking-extra-wide text-white/30 uppercase leading-relaxed break-keep">
              찾으시는 제품 "{searchTerm}"이(가) 현재 아카이브에 존재하지 않습니다.
            </p>
            <button onClick={() => { setSearchTerm(""); setSearchParams({}); }} className="mt-6 text-[10px] border-b border-white/20 pb-1 text-white/50 hover:text-white transition-colors uppercase tracking-widest">Show All Products</button>
          </div>
        )}
        </div>
      )}

      {/* 팝업 메시지 (복구된 부분) */}
      <AnimatePresence>
        {showToast && (
          <>
            {/* 뒷배경 암전 효과 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowToast(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[290]"
            />

            {/* 정중앙 알림 박스 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-48%" }}
              className="fixed top-1/2 left-1/2 z-[300] w-[85%] max-w-[360px] bg-[#0a0a0a] border border-white/10 p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="text-center space-y-10">
                <p className="text-[10px] font-bold tracking-mega-wide uppercase text-purple-500">
                  Item added to archive
                </p>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => navigate('/cart')}
                    className="w-full bg-white text-black py-4 text-[10px] font-black tracking-ultra-wide uppercase hover:bg-purple-600 hover:text-white transition-all duration-500"
                  >
                    View Archive
                  </button>
                  <button 
                    onClick={() => setShowToast(false)}
                    className="w-full py-2 text-[9px] font-light tracking-extra-wide uppercase text-white/30 hover:text-white transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopPage;