import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CollectionPage = () => {
  const collections = [
    {
      id: "2026-ss",
      title: "2026 S/S COLLECTION",
      subtitle: "BEYOND THE NEGATION",
      image: "https://via.placeholder.com/800x1000/111111/555555", // 실제 시즌 대표 이미지로 교체
    },
    {
      id: "2025-fw",
      title: "2025 F/W ARCHIVE",
      subtitle: "DARK MATTER",
      image: "https://via.placeholder.com/800x1000/0a0a0a/333333",
    },
    // 추가 시즌 데이터...
  ];

  return (
    <div className="bg-[#FFFFFF] text-[#000000] min-h-screen pt-32 pb-20 px-8 antialiased">
      <div className="max-w-7xl mx-auto">
        {/* 헤드라인 */}
        <header className="mb-20 border-l border-[#E5E5E5] pl-6">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Collections</h1>
          <p className="text-[10px] text-neutral-500 tracking-ultra-wide mt-2">ARCHIVE OF jvng.</p>
        </header>

        {/* 콜렉션 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {collections.map((item) => (
            <Link key={item.id} to={`/lookbook/${item.id}`} className="group relative overflow-hidden">
              <div className="aspect-[4/5] overflow-hidden bg-[#F5F5F5]">
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.7 }}
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
              
              {/* 정보 레이어 */}
              <div className="mt-6 space-y-1">
                <h3 className="text-lg font-bold tracking-tighter uppercase group-hover:opacity-80 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[10px] text-neutral-600 tracking-extra-wide uppercase font-mono">
                  {item.subtitle}
                </p>
              </div>

              {/* 호버 시 나타나는 보라색 라인 효과 */}
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#000000] group-hover:w-full transition-all duration-500" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;