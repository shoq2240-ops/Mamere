import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../store/CartContext'; // 👈 컨텍스트 임포트 확인

// 샘플 데이터
const products = [
  { id: 1, name: "Double Negative Archive Jacket", price: 549000, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop" },
  { id: 2, name: "Deleted Stitch Trousers", price: 320000, img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop" },
  { id: 3, name: "Void Layered Knit", price: 289000, img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop" },
  { id: 4, name: "Negation Oversized Shirt", price: 215000, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop" },
];

const ShopPage = () => {
  const { addToCart } = useCart(); // 👈 최상단에서 함수 가져오기

  return (
    <div className="font-['Noto_Sans_KR'] bg-black min-h-screen pt-24 pb-20 antialiased">
      {/* 1. 헤더 구역 (정적 디자인) */}
      <div className="px-6 mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-[10px] tracking-[0.5em] uppercase text-purple-500 font-bold mb-2">Collection</h1>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white">
            Shop <span className="font-light text-white/50">/ All</span>
          </h2>
        </div>
        <span className="text-[10px] font-light text-white/40 tracking-widest uppercase mb-2">
          {products.length} Products
        </span>
      </div>

      {/* 2. 상품 그리드 구역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-[1px] gap-y-16 border-t border-white/10">
        {products.map((product) => (
          <div 
            key={product.id}
            className="group relative flex flex-col border-r border-b border-white/10 transition-colors duration-500 hover:bg-zinc-900/30"
          >
            {/* 상품 이미지 */}
            <Link to={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
              <img 
                src={product.img} 
                alt={product.name}
                className="w-full h-full object-cover opacity-90 transition-all duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </Link>

            {/* 상품 정보 및 버튼 */}
            <div className="p-6 space-y-2">
              <h3 className="text-[11px] font-bold tracking-widest uppercase text-white/80">
                {product.name}
              </h3>
              <p className="text-[13px] font-light tracking-widest text-purple-500/80">
                ₩{product.price.toLocaleString()}
              </p>
              
              {/* [수정된 버튼 위치]: 상품 정보 바로 아래, 호버 시 나타남 */}
              <div className="pt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                <button 
                  onClick={() => addToCart(product)} // 👈 클릭 시 해당 상품 데이터 전달
                  className="w-full border border-white/10 py-3 text-[9px] font-bold tracking-[0.3em] uppercase text-white/60 hover:bg-white hover:text-black hover:border-white transition-all"
                >
                  Add to Archive
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;