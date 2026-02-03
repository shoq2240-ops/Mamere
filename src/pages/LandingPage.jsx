import React from 'react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  // 실제 이미지 링크가 준비되면 url 부분을 교체하세요.
  const products = [
    { id: 1, name: "DN RECONSTRUCTION HOODIE", price: "128,000", img: "https://via.placeholder.com/600x800/111111/555555" },
    { id: 2, name: "ARCHIVE LOGO TEE", price: "52,000", img: "https://via.placeholder.com/600x800/111111/555555" },
    { id: 3, name: "NEGATIVE LAYERED KNIT", price: "94,000", img: "https://via.placeholder.com/600x800/111111/555555" },
    { id: 4, name: "DOUBLE CARGO PANTS", price: "145,000", img: "https://via.placeholder.com/600x800/111111/555555" },
    { id: 5, name: "DISTRESSED CAP", price: "42,000", img: "https://via.placeholder.com/600x800/111111/555555" },
    { id: 6, name: "VOID OVERSIZED SHIRT", price: "112,000", img: "https://via.placeholder.com/600x800/111111/555555" },
  ];

  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-20 px-8">
      {/* 1. 메인 비주얼 (Mardi 스타일의 큰 배너) */}
      <section className="mb-24">
        <div className="relative aspect-[16/7] w-full overflow-hidden bg-neutral-900 border border-white/5">
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[12vw] font-black italic uppercase tracking-tighter leading-none mix-blend-difference"
            >
              Collection <span className="text-purple-500">01</span>
            </motion.h2>
          </div>
          {/* 배경 이미지: 실제 룩북 영상이나 고화질 사진을 넣으세요 */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
        </div>
      </section>

      {/* 2. 상품 그리드 (Mardi 스타일의 다단 배치) */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
          {products.map((product) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              {/* 상품 이미지 */}
              <div className="relative aspect-[3/4] bg-neutral-900 overflow-hidden border border-white/5">
                <img 
                  src={product.img} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* 퀵 찜하기 버튼 (오른쪽 상단) */}
                <button className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px]">SAVE</span>
                </button>
              </div>

              {/* 상품 정보 */}
              <div className="mt-6 flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-[10px] text-purple-500 font-mono italic">
                    KRW {product.price}
                  </p>
                </div>
                <span className="text-[9px] text-neutral-600 font-mono">NEW</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;