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
            다정한 손길로 완성하는 맑은 피부, 마메르
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="space-y-12 md:space-y-16"
        >
          <div className="border-l-2 border-[#94a3b8] pl-8 md:pl-14 py-2 md:py-4">
            <p className="text-base md:text-xl font-light leading-loose md:leading-loose text-slate-700 break-keep max-w-2xl">
              마메르는 불어로 &apos;나의 어머니&apos;를 뜻합니다. 어머니의 따뜻한 품처럼, 지치고 예민해진 당신의 피부를 가장 순수한 자연의 성분으로 어루만집니다. 불필요한 것은 비워내고, 피부가 진정으로 필요로 하는 것만 담았습니다. 자연이 주는 맑은 에너지로 피부 본연의 건강한 빛을 되찾아 드립니다.
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
