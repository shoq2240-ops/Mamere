import React, { useState } from 'react';

const MARQUEE_COPIES = 40;

const MarqueeItem = ({ text, textClassName }) => (
  <span
    className={`whitespace-nowrap text-[9pt] font-medium tracking-[0.2em] uppercase text-[#7A6B63] antialiased select-none ${textClassName}`}
  >
    {text}
  </span>
);

/**
 * 끊김 없는 무한 마키 (CSS 애니메이션 + 이중 스트립)
 * 두 개의 동일한 스트립을 0 → -50% 이동 시킨 뒤 루프 → 시각적으로 끊김 없음
 */
const Marquee = ({
  text = 'FREE SHIPPING OVER 30,000KRW',
  speed = 100,
  className = '',
  textClassName = '',
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const strip = (
    <div className="flex shrink-0 items-center gap-[2em]" aria-hidden="true">
      {Array.from({ length: MARQUEE_COPIES }, (_, i) => (
        <MarqueeItem key={i} text={text} textClassName={textClassName} />
      ))}
    </div>
  );

  return (
    <section
      className={`relative w-full flex-none overflow-hidden bg-transparent py-1.5 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex w-max gap-[2em] animate-marquee"
        style={{
          animationDuration: `${speed}s`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {strip}
        {strip}
      </div>
    </section>
  );
};

export default Marquee;
