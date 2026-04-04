import React, { useState } from 'react';

const MARQUEE_COPIES = 36;

const MarqueeItem = ({ text, textClassName }) => (
  <span
    className={`whitespace-nowrap text-[11px] font-medium tracking-widest uppercase antialiased select-none ${textClassName ?? 'text-white'}`}
  >
    {text}
  </span>
);

/**
 * 끊김 없는 무한 마키 (CSS linear + 이중 스트립, translateX -50% 루프)
 */
const Marquee = ({
  text = 'NATURE SOAP MAMÈRE',
  speed = 160,
  className = '',
  textClassName,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const strip = (
    <div className="flex shrink-0 items-center gap-[3rem]" aria-hidden="true">
      {Array.from({ length: MARQUEE_COPIES }, (_, i) => (
        <MarqueeItem key={i} text={text} textClassName={textClassName} />
      ))}
    </div>
  );

  return (
    <section
      className={`relative flex h-[36px] w-full max-h-10 min-h-[32px] flex-none items-center overflow-hidden bg-transparent ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="프로모션 안내: 무료배송 및 신규 가입 혜택"
    >
      <div
        className="flex w-max animate-marquee will-change-transform"
        style={{
          animationDuration: `${speed}s`,
          animationTimingFunction: 'linear',
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
