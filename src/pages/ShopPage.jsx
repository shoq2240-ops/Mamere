import React, { useState } from 'react'; // React 선언은 이 한 줄이면 충분합니다.
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext'; 

// 그 아래 products 데이터와 ShopPage 컴포넌트 코드가 이어지면 됩니다.

const products = [
  { id: 1, name: "Double Negative Archive Jacket", price: 549000, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop" },
  { id: 2, name: "Deleted Stitch Trousers", price: 320000, img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop" },
  { id: 3, name: "Void Layered Knit", price: 289000, img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop" },
  { id: 4, name: "Negation Oversized Shirt", price: 215000, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop" },
];

const ShopPage = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (product) => {
    addToCart(product);
    setShowToast(true);
    // 5초 후 자동으로 알림 숨김 (사용자가 버튼을 누르기 전까지 대기 가능)
    setTimeout(() => setShowToast(false), 5000);
  };

  return (
    <div className="font-['Noto_Sans_KR'] bg-black min-h-screen pt-24 pb-20 antialiased relative">
      {/* 검색 바 (우영미 스타일의 미니멀한 검색창) */}
      <div className="px-8 mb-12">
        <input 
          type="text"
          placeholder="SEARCH ARCHIVE..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-b border-white/10 py-4 text-[12px] font-light tracking-[0.2em] uppercase outline-none focus:border-purple-500 transition-colors placeholder:text-white/10"
        />
      </div>
      
      {/* 1. 헤더 */}
      <div className="px-8 mb-16 flex justify-between items-end">
        <div>
          <h1 className="text-[10px] tracking-[0.5em] uppercase text-purple-500 font-bold mb-3">Collection / Archive</h1>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
            Shop <span className="font-light text-white/40">/ All</span>
          </h2>
        </div>
        <span className="text-[10px] font-light text-white/30 tracking-[0.2em] uppercase mb-2">Total {products.length} Items</span>
      </div>

      {/* 2. 상품 그리드 */}
{/* 2. 상품 그리드 (우영미 스타일 & Noto Sans 위계) */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-[1px] gap-y-20 border-t border-white/10 font-['Noto_Sans_KR']">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="group relative flex flex-col border-r border-b border-white/10 transition-colors duration-700 hover:bg-zinc-900/40"
          >
            {/* 상품 이미지 구역: aspect-ratio 3/4 고정 */}
            <Link to={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
              <img 
                src={product.img} 
                alt={product.name} 
                className="w-full h-full object-cover opacity-80 transition-all duration-1000 group-hover:scale-[1.03] group-hover:opacity-100" 
              />
              {/* 호버 시 나타나는 얕은 회색 오버레이 */}
              <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </Link>

            {/* 상품 정보 및 버튼 구역 */}
            <div className="p-8 space-y-4">
              <div className="space-y-1">
                {/* 상품명: Bold(700) / 11px */}
                <h3 className="text-[11px] font-bold tracking-widest uppercase text-white/70 group-hover:text-white transition-colors">
                  {product.name}
                </h3>
                {/* 가격: Light(300) / 13px */}
                <p className="text-[13px] font-light tracking-widest text-purple-500/80 group-hover:text-purple-500 transition-colors">
                  ₩{product.price.toLocaleString()}
                </p>
              </div>

              {/* Add to Archive 버튼: 호버 시 아래에서 위로 등장 */}
              <div className="pt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full border border-white/10 py-4 text-[9px] font-bold tracking-[0.3em] uppercase text-white/50 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                >
                  Add to Archive
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. 정갈한 알림 (Toast) UI */}
      <AnimatePresence>
        {showToast && (
          <>
            {/* 뒷배경 어둡게 (딤 처리를 해야 중앙 팝업이 돋보입니다) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowToast(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[290]"
            />

            {/* 정중앙 박스 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-48%" }}
              className="fixed top-1/2 left-1/2 z-[300] w-[85%] max-w-[360px] bg-[#0a0a0a] border border-white/10 p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="text-center space-y-10">
                {/* 문구: 작고 정갈하게 */}
                <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-purple-500">
                  Item added to archive
                </p>
                
                {/* 버튼 섹션: Noto Sans 위계 적용 */}
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => navigate('/cart')}
                    className="w-full bg-white text-black py-4 text-[10px] font-black tracking-[0.3em] uppercase hover:bg-purple-600 hover:text-white transition-all duration-500"
                  >
                    View Archive
                  </button>
                  <button 
                    onClick={() => setShowToast(false)}
                    className="w-full py-2 text-[9px] font-light tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors"
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