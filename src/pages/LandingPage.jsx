import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getAbsoluteUrl } from '../lib/getAbsoluteUrl';
import flower3 from '../asset/flower3.png';

// 메인 히어로 캐러셀 이미지 목록
// 관리자: 아래 배열의 src/alt만 교체하면 배너 이미지를 손쉽게 변경할 수 있습니다.
const HERO_SLIDES = [
  {
    src: flower3,
    alt: '마메르 메인 배너, 깊은 숲에서 찾은 순수한 휴식',
  },
  {
    src: '/flower1.png',
    alt: '피부를 감싸는 자연 유래 성분의 편안한 질감',
  },
  {
    src: '/flower2.png',
    alt: '마메르의 차분한 톤온톤 패키지와 자연광',
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <motion.div
        className="flex w-full h-full"
        animate={{ x: `-${current * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -40) next();
          else if (info.offset.x > 40) prev();
        }}
      >
        {HERO_SLIDES.map((slide, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0">
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover object-center block"
              decoding="async"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const LandingPage = () => {
  const mainOgImage = getAbsoluteUrl(flower3);
  const mainDescription = '매일 마주하는 자극으로부터 피부를 다정하게 지켜냅니다. 마메르와 함께 피부가 편안하게 숨 쉬는 시간을 경험해 보세요.';

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-x-hidden bg-white">
      <Helmet>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="마메르(mamère) | 다정한 위로, 순수한 자연" />
        <meta property="og:description" content={mainDescription} />
        <meta property="og:url" content={getAbsoluteUrl('/')} />
        {mainOgImage && <meta property="og:image" content={mainOgImage} />}
        <meta property="og:site_name" content="마메르(mamère)" />
      </Helmet>

      {/* #main-scroll 가용 높이(헤더 제외)를 flex-1로 전부 채움 */}
      <section
        className="relative m-0 flex min-h-[400px] w-full flex-1 flex-col overflow-hidden bg-white"
        aria-label="메인 비주얼"
      >
        <HeroCarousel />
      </section>
    </div>
  );
};

export default LandingPage;
