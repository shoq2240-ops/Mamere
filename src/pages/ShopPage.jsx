import React, { useState, useEffect } from 'react';
import { ANTWERP_COLLECTION } from '../data/productData';

const ShopPage = ({ addToCart }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // 피셔-예이츠 셔플 알고리즘으로 랜덤하게 섞기
    const shuffled = [...ANTWERP_COLLECTION].sort(() => Math.random() - 0.5);
    setProducts(shuffled);
  }, []);

  return (
    <div className="pt-32 px-8 bg-black min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((item) => (
          <div key={item.id} className="group cursor-pointer">
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900 border border-white/5">
              <img 
                src={item.image} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={item.name} 
              />
              <button 
                onClick={() => addToCart()}
                className="absolute bottom-4 left-4 right-4 bg-white text-black py-3 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[10px] uppercase"
              >
                Add to Cart
              </button>
            </div>
            <div className="mt-4 flex justify-between items-start">
              <h3 className="text-[11px] font-bold tracking-tighter uppercase">{item.name}</h3>
              <span className="text-[11px] font-mono text-neutral-500">{item.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;