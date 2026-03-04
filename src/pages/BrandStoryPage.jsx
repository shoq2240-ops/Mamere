import React from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const BrandStoryPage = () => {
  return (
    <div className="bg-[#FAF9F6] text-[#333333] min-h-screen pt-24 md:pt-28 pb-24 px-6 md:px-10 antialiased">
      <div className="max-w-5xl mx-auto">
        {/* Hero 섹션 */}
        <section className="mb-24 md:mb-32">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-sm bg-[#111827]"
          >
            <img
              src="https://erutbhfuuhnxqndzcvix.supabase.co/storage/v1/object/public/product-images/mamere%20image.png"
              alt="마메르 브랜드 무드 – 고요한 자연과 부드러운 빛"
              className="w-full h-[260px] md:h-[420px] object-cover object-center opacity-80"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a12]/70 via-transparent to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <p className="text-[10px] tracking-[0.24em] uppercase text-[#F5F3EE]/80 mb-4">
                Brand Story
              </p>
              <h1 className="text-2xl md:text-4xl lg:text-[40px] font-light tracking-[0.06em] leading-tight text-[#FDFBF5]">
                자연이 건네는 다정한 위로,
                <br className="hidden md:block" /> 마메르
              </h1>
              <p className="mt-4 max-w-xl text-[11px] md:text-sm font-light tracking-[0.08em] leading-relaxed text-[#F5F3EE]/80">
                깊은 숲과 깨끗한 물, 고요한 공기에서 영감을 받은 마메르는
                <br className="hidden md:block" /> 피부가 숨 쉬는 시간을 위한 작은 여백을 만듭니다.
              </p>
            </div>
          </motion.div>
        </section>

        {/* 브랜드 철학 – 지그재그 레이아웃 */}
        <section className="space-y-24 md:space-y-32">
          {/* 블럭 1 */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="flex flex-col md:flex-row md:items-center gap-10 md:gap-20"
          >
            <div className="md:w-1/2">
              <div className="overflow-hidden rounded-sm bg-[#E7E1D8]">
                <img
                  src="https://erutbhfuuhnxqndzcvix.supabase.co/storage/v1/object/public/product-images/essense.png"
                  alt="잔잔한 물결과 빛"
                  className="w-full h-64 md:h-80 object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <p className="text-[10px] tracking-[0.24em] uppercase text-[#9B8F82] mb-3">
                Philosophy
              </p>
              <h2 className="text-xl md:text-2xl font-medium tracking-[0.04em] mb-4 text-[#2F2924]">
                불필요한 것들을 비워내고,
                <br /> 피부가 진짜로 원하는 것만.
              </h2>
              <p className="text-[13px] md:text-[14px] leading-relaxed tracking-[0.03em] text-[#4B453F]">
                마메르는 가장 단순한 루틴 안에서 가장 깊은 위로가 시작된다고 믿습니다.
                기능과 성분을 끝없이 쌓기보다, 피부가 편안함을 느끼는 최소한의 조합만을 남깁니다.
                세안 후에도 당기지 않는 촉감, 자극 없이 하루를 마무리할 수 있는 평온함.
                그 조용한 안심을 위해 마메르는 오늘도 성분 하나, 제형 하나를 다시 들여다봅니다.
              </p>
            </div>
          </motion.div>

          {/* 블럭 2 */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            className="flex flex-col md:flex-row-reverse md:items-center gap-10 md:gap-20"
          >
            <div className="md:w-1/2">
              <div className="overflow-hidden rounded-sm bg-[#E4E8E1]">
                <img
                  src="https://erutbhfuuhnxqndzcvix.supabase.co/storage/v1/object/public/product-images/shelves.png"
                  alt="초록 식물과 부드러운 빛"
                  className="w-full h-64 md:h-80 object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <p className="text-[10px] tracking-[0.24em] uppercase text-[#9B8F82] mb-3">
                Calm Rituals
              </p>
              <h2 className="text-xl md:text-2xl font-medium tracking-[0.04em] mb-4 text-[#2F2924]">
                바쁜 하루와 하루 사이,
                <br /> 잠깐의 숲을 건너는 시간.
              </h2>
              <p className="text-[13px] md:text-[14px] leading-relaxed tracking-[0.03em] text-[#4B453F]">
                마메르의 제품들은 욕실의 작은 선반 위에 놓인 한 장의 풍경처럼,
                하루의 시작과 끝을 부드럽게 이어주는 의식을 위해 탄생했습니다.
                향이 지나치게 과하지 않도록, 제형이 과하게 화려하지 않도록
                피부가 먼저 숨을 고를 수 있는 리듬에 맞춰 농도와 질감을 설계합니다.
              </p>
            </div>
          </motion.div>
        </section>

        {/* 3가지 핵심 가치 */}
        <section className="mt-28 md:mt-36">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="text-center mb-12 md:mb-16"
          >
            <p className="text-[10px] tracking-[0.24em] uppercase text-[#9B8F82] mb-3">
              Our Values
            </p>
            <h3 className="text-lg md:text-xl font-medium tracking-[0.08em] text-[#2F2924]">
              마메르가 지켜가는 세 가지 약속
            </h3>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.18 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12"
          >
            {/* 가치 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden mb-4 bg-[#E7F0EA]">
                <img
                  src="https://erutbhfuuhnxqndzcvix.supabase.co/storage/v1/object/public/product-images/innocent.png"
                  alt="맑은 잎사귀 위 물방울"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h4 className="text-[13px] md:text-sm font-medium tracking-[0.1em] uppercase text-[#3E382F] mb-2">
                순한 성분
              </h4>
              <p className="text-[12px] leading-relaxed tracking-[0.03em] text-[#5B5249] max-w-xs">
                예민한 피부도 안심하고 쓸 수 있도록, 꼭 필요한 최소한의 성분만 조합합니다.
              </p>
            </div>

            {/* 가치 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden mb-4 bg-[#EDE3D8]">
                <img
                  src="https://erutbhfuuhnxqndzcvix.supabase.co/storage/v1/object/public/product-images/lotion.png"
                  alt="부드러운 텍스처의 피부 표현"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h4 className="text-[13px] md:text-sm font-medium tracking-[0.1em] uppercase text-[#3E382F] mb-2">
                깊은 보습
              </h4>
              <p className="text-[12px] leading-relaxed tracking-[0.03em] text-[#5B5249] max-w-xs">
                피부 안쪽까지 천천히 스며드는 보습감을 연구하여, 하루 종일 촉촉한 상태를 유지합니다.
              </p>
            </div>

            {/* 가치 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden mb-4 bg-[#E3E6E0]">
                <img
                  src="https://erutbhfuuhnxqndzcvix.supabase.co/storage/v1/object/public/product-images/recycle.png"
                  alt="자연과 조화를 이루는 라이프스타일"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h4 className="text-[13px] md:text-sm font-medium tracking-[0.1em] uppercase text-[#3E382F] mb-2">
                지속 가능성
              </h4>
              <p className="text-[12px] leading-relaxed tracking-[0.03em] text-[#5B5249] max-w-xs">
                불필요한 포장을 줄이고, 재활용 가능한 소재를 우선 사용해 오래도록 지구와 함께합니다.
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default BrandStoryPage;
