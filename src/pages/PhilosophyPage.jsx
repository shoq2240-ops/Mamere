import React from 'react';
import { motion } from 'framer-motion';

const PhilosophyPage = () => {
  return (
    <div className="pt-40 pb-20 px-8 min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-20"
        >
          {/* 헤드라인 */}
          <div className="border-l-2 border-purple-500 pl-8">
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
              Double <br />
              <span className="text-purple-500">Negative</span> <br />
              Philosophy
            </h1>
          </div>

          {/* 메인 텍스트 */}
          <div className="space-y-12 text-xl md:text-2xl leading-relaxed font-light break-keep text-neutral-300">
            <p>
              <strong className="text-white font-bold">부정의 부정, 존재의 증명.</strong><br />
              더블 네거티브는 현대 패션의 정형화된 규칙을 해체하고, 
              정적의 공간 속에서 본질적인 정체성을 구축합니다.
            </p>
            
            <p>
              우리는 익숙한 실루엣을 부정함으로써 비로소 드러나는 
              가장 선명하고 날카로운 자아를 추적합니다.
            </p>

            <div className="py-10">
               <div className="h-[1px] w-full bg-gradient-to-r from-purple-500 to-transparent opacity-30"></div>
            </div>

            <p className="text-neutral-500 italic text-lg md:text-xl">
              "짙은 블랙의 정막과 그 틈새를 가로지르는 보랏빛 섬광의 긴장감. <br />
              부정의 부정을 통해 완성되는 대담한 긍정의 메시지를 정교한 아카이브로 정의합니다."
            </p>
          </div>

          {/* 하단 푸터 느낌의 문구 */}
          <div className="pt-20 text-[10px] tracking-[0.5em] uppercase text-purple-500 font-bold">
            Beyond the negation, Into the essence.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PhilosophyPage;