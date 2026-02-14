import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * 무한 좌측 스크롤 마키 (호버 시 일시 정지)
 *
 * 수정하기 쉬운 props:
 *   - text: 흐르는 문구
 *   - speed: 한 사이클 시간(초), 작을수록 빠름
 *   - className: 최상위 섹션 클래스
 *   - textClassName: 문구 스타일 클래스
 */
const Marquee = ({
  text = 'DOUBLE NEGATIVE',
  speed = 14,
  className = '',
  textClassName = '',
}) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <motion.section
      className={`relative w-full flex-none overflow-hidden bg-black py-[6px] border-b border-white/10 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      initial={{ opacity: 0.98 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="flex w-max gap-[2em]"
        style={{
          animation: `marquee-scroll ${speed}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        <span className={`whitespace-nowrap text-[9pt] font-medium tracking-[0.2em] uppercase text-white/90 antialiased select-none ${textClassName}`}>
          {text}
        </span>
        <span className={`whitespace-nowrap text-[9pt] font-medium tracking-[0.2em] uppercase text-white/90 antialiased select-none ${textClassName}`} aria-hidden>
          {text}
        </span>
      </div>
    </motion.section>
  );
};

export default Marquee;
