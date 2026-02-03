import React, { useState, useEffect } from 'react';
import { ANTWERP_COLLECTION } from '../data/productData';

const ShopPage = ({ addToCart }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // 배열을 섞을 때 데이터가 있는지 확인
    if (ANTWERP_COLLECTION && ANTWERP_COLLECTION.length > 0) {
      const shuffled = [...ANTWERP_COLLECTION].sort(() => Math.random() - 0.5);
      setProducts(shuffled);
    }
  }, []);

  return (
    <div className="pt-32 px-8 bg-black min-h-screen pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((item) => (
          <div key={item.id} className="group cursor-pointer">
            {/* 이미지 컨테이너 */}
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900 border border-white/5">
              {/* 이미지 태그 - loading="lazy" 추가로 성능 최적화 */}
              <img 
                src={item.image} 
                loading="lazy"
                className="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105" 
                alt={item.name}
                // 이미지 로드 실패 시 대체 텍스트나 효과
                onError={(e) => { e.target.src = "https://via.placeholder.com/800x1000/1a1a1a/333333?text=NO+IMAGE"; }}
              />
              
              {/* 장바구니 버튼 */}
              <button 
                onClick={() => addToCart()}
                className="absolute bottom-0 left-0 right-0 bg-white text-black py-4 opacity-0 group-hover:opacity-100 transition-all translate-y-full group-hover:translate-y-0 font-black text-[10px] uppercase tracking-widest"
              >
                Add to Cart
              </button>
            </div>

            {/* 정보 영역 */}
            <div className="mt-5 space-y-1">
              <div className="flex justify-between items-end">
                <h3 className="text-[11px] font-black tracking-tighter uppercase leading-none">{item.name}</h3>
                <span className="text-[10px] font-mono text-neutral-500">{item.price}</span>
              </div>
              <p className="text-[9px] text-neutral-600 tracking-widest uppercase italic">{item.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;