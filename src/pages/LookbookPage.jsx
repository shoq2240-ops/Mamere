import React from 'react';
import { motion } from 'framer-motion';

const lookbookItems = [
  {
    id: 1,
    title: "The First Negation",
    description: "해체된 구조 속에서 발견하는 본질적인 정체성.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80",
    size: "large"
  },
  {
    id: 2,
    title: "Shadow Layers",
    description: "어둠의 층위가 만들어내는 비대칭의 미학.",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616bc469?w=1000&q=80",
    size: "small"
  },
  {
    id: 3,
    title: "Purple Signal",
    description: "고요한 블랙 속에서 터져나오는 보랏빛 섬광.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&q=80",
    size: "medium"
  }
];

const LookbookPage = () => {
  return (
    <div className="bg-black text-white pt-32 pb-40 overflow-hidden">
      {/* 헤더 섹션 */}
      <div className="px-8 mb-24">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase"
        >
          Lookbook<span className="text-purple-500">.</span>
        </motion.h1>
        <p className="mt-4 text-neutral-500 tracking-[0.4em] uppercase text-[10px]">Archive 2026 Collection</p>
      </div>

      {/* 룩북 그리드 */}
      <div className="flex flex-col space-y-40 px-8 max-w-7xl mx-auto">
        {lookbookItems.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className={`relative flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
          >
            {/* 이미지 섹션 */}
            <div className={`relative overflow-hidden bg-neutral-900 ${
              item.size === 'large' ? 'w-full md:w-3/5' : 'w-full md:w-2/5'
            } aspect-[3/4]`}>
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 hover:scale-100"
              />
              <div className="absolute inset-0 bg-purple-500/10 mix-blend-overlay"></div>
            </div>

            {/* 텍스트 섹션 */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              <span className="text-purple-500 font-mono text-xs italic tracking-widest uppercase">0{idx + 1}</span>
              <h2 className="text-3xl font-black italic uppercase font-['Inter']">{item.title}</h2>
              <p className="text-neutral-400 font-light text-sm leading-relaxed break-keep max-w-xs mx-auto md:mx-0">
                {item.description}
              </p>
              <div className="pt-4 overflow-hidden">
                <div className="w-12 h-[1px] bg-white/20 group-hover:w-full transition-all duration-500"></div>
              </div>
            </div>
            
            {/* 배경 데코 텍스트 */}
            <div className="absolute -z-10 text-[15vw] font-black text-white/5 select-none pointer-events-none -top-20">
              {idx % 2 === 0 ? 'DOUBLE' : 'NEGATIVE'}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 푸터 문구 */}
      <div className="mt-60 text-center">
        <p className="text-[9px] text-neutral-700 tracking-[1em] uppercase">
          Reconstruction through Negation
        </p>
      </div>
    </div>
  );
};

export default LookbookPage;