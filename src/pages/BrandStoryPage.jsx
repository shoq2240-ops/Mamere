import React from 'react';
import { motion } from 'framer-motion';

const BrandStoryPage = () => {
  return (
    <div className="bg-[#FAFAF9] text-[#2C2C2C] min-h-screen pt-32 pb-20 px-6 antialiased">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 md:mb-32"
        >
          <h1 className="text-[10px] tracking-[0.2em] uppercase text-[#8B8B8B] font-medium mb-4">
            Brand Story
          </h1>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-tight text-[#1a1a1a]">
            Mamère
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="space-y-12 md:space-y-16"
        >
          <div className="border-l-2 border-[#1A1A1A] pl-6 md:pl-12">
            <p className="text-lg md:text-2xl font-light leading-relaxed md:leading-loose text-[#2C2C2C] break-keep">
              당신의 피부에 진심을 더합니다.
              <br className="hidden md:block" />
              <span className="font-medium text-[#1a1a1a]">
                믿을 수 있는 성분과 투명한 제조로, 건강한 아름다움을 제안합니다.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
            <p className="text-sm md:text-base font-light leading-7 text-[#5C5C5C] break-keep">
              시카, 히알루론산, 나이아신아마이드 등 검증된 성분을 바탕으로
              피부 타입과 고민에 맞는 제품을 선별합니다.
              불필요한 첨가를 줄이고, 피부가 숨 쉬는 케어를 지향합니다.
            </p>
            <p className="text-sm md:text-base font-light leading-7 text-[#5C5C5C] break-keep">
              우리의 모든 제품은 민감한 피부도 고려한 포뮬레이션으로,
              일상에서 꾸준히 쓰일 수 있는 신뢰감 있는 뷰티를 목표로 합니다.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 1.5 }}
          className="mt-32 h-px bg-gradient-to-r from-[#E8E4DF] to-transparent origin-left"
        />
      </div>
    </div>
  );
};

export default BrandStoryPage;
