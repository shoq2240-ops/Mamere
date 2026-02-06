import React from 'react';
import { motion } from 'framer-motion';

const PhilosophyPage = () => {
  return (
    <div className="font-['Noto_Sans_KR'] bg-black text-white min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* 제목 섹션 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 md:mb-32"
        >
          <h1 className="text-[10px] tracking-[0.5em] uppercase text-purple-500 font-bold mb-4">
            Philosophy
          </h1>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-tight">
            Double <br className="md:hidden" /> Negative
          </h2>
        </motion.div>

        {/* 본문 섹션: 삭제의 미학 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="space-y-12 md:space-y-16"
        >
          {/* 함축된 철학 메시지 */}
          <div className="border-l border-white/10 pl-6 md:pl-12">
            <p className="text-lg md:text-2xl font-light leading-relaxed md:leading-loose text-white/90 break-keep">
              더블 네거티브는 익숙한 관습과 정형화된 스타일을 <br className="hidden md:block" />
              <span className="font-bold text-white">두 번의 삭제를 통해 거부하며, 그 과정에서 본연의 형체를 드러냅니다.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
            <p className="text-sm md:text-base font-light leading-7 text-white/60 break-keep">
              규범을 지워낸 뒤 남겨진 불완전한 라인과 여백은 허무가 아닌, 
              필터링을 거쳐 살아남은 가장 솔직한 기록입니다. 
              우리는 완성된 결과물보다 의심하고 삭제해 나가는 태도 자체를 옷의 본질로 정의합니다.
            </p>
            <p className="text-sm md:text-base font-light leading-7 text-white/60 break-keep">
              이러한 흔적들을 미학으로 승화시켜, 장식적 요소가 아닌 
              진실된 자세만을 제안하고자 합니다. 삭제의 흔적은 곧 
              더블 네거티브가 지향하는 가장 순수한 형태의 우아함입니다.
            </p>
          </div>
        </motion.div>

        {/* 하단 여백의 미를 위한 장식 요소 */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 1.5 }}
          className="mt-32 h-[1px] bg-gradient-to-r from-purple-500/50 to-transparent origin-left"
        />
      </div>
    </div>
  );
};

export default PhilosophyPage;