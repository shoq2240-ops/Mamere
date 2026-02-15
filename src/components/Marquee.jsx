import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const MARQUEE_COPIES = 10;

/**
 * 무한 좌→우 스크롤 마키 (호버 시 일시 정지)
 * 화면 전체 너비를 가득 채우며 끊김 없이 무한 루프
 *
 * props:
 *   - text: 흐르는 문구
 *   - speed: 한 사이클 시간(초), 작을수록 빠름
 *   - className: 최상위 섹션 클래스
 *   - textClassName: 문구 스타일 클래스
 */
const Marquee = ({
  text = 'DOUBLE NEGATIVE',
  speed = 8,
  className = '',
  textClassName = '',
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const controls = useAnimation();

  // 한 복제본 너비만큼 이동 시 뒤의 복제본이 이어지도록 (-100% / 복제 수)
  const translateAmount = -100 / MARQUEE_COPIES;

  useEffect(() => {
    if (!isPaused) {
      controls.start({
        x: [0, `${translateAmount}%`],
        transition: {
          duration: speed,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'linear',
        },
      });
    } else {
      controls.stop();
    }
  }, [isPaused, speed, controls, translateAmount]);

  return (
    <motion.section
      className={`relative w-full flex-none overflow-hidden bg-black py-[6px] border-b border-white/10 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      initial={{ opacity: 0.98 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex w-max gap-[2em] shrink-0"
        initial={{ x: 0 }}
        animate={controls}
      >
        {Array.from({ length: MARQUEE_COPIES }, (_, i) => (
          <span
            key={i}
            className={`whitespace-nowrap text-[9pt] font-medium italic tracking-[0.2em] uppercase text-white/40 antialiased select-none ${textClassName}`}
            aria-hidden={i > 0}
          >
            {text}
          </span>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default Marquee;
