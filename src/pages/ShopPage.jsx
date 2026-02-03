import React from 'react';

const ShopPage = () => {
  return (
    <div className="pt-40 pb-20 px-8 min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <h1 className="text-6xl font-black italic uppercase tracking-tighter">
            Shop <span className="text-purple-500">Archive</span>
          </h1>
          <p className="text-neutral-500 mt-4 tracking-[0.3em] uppercase text-xs">
            Double Negative : Season 01 Reconstruction
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* 상품 카드 예시 */}
          {[1, 2, 3].map((item) => (
            <div key={item} className="group cursor-pointer">
              <div className="aspect-[3/4] bg-neutral-900 border border-white/5 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-neutral-700 font-black italic text-4xl group-hover:text-purple-500/20 transition-colors">
                    LOADING
                  </span>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-end">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest">Archive Item #0{item}</h3>
                  <p className="text-purple-500 text-xs mt-2">COMING SOON</p>
                </div>
                <span className="text-[10px] text-neutral-600 font-mono">2026.02.02</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopPage; // 이 줄이 반드시 있어야 합니다!