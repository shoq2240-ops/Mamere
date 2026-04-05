import React from 'react';
import { motion } from 'framer-motion';

// 단일 제품 카드 스켈레톤 (Shop: 그리드 열 폭에 맞춤, 3:4)
export const ProductCardSkeleton = ({ variant = 'default' }) => (
  <div className="group relative flex w-full min-w-0 flex-col">
    <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-[#FAFAFA]">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.04] to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
    <div
      className={
        variant === 'compact'
          ? 'mt-4 flex flex-col items-start gap-2 px-1 text-left'
          : 'mt-4 flex min-w-0 flex-col items-start gap-2 text-left'
      }
    >
      <div className="h-[11px] w-[88%] animate-pulse rounded-sm bg-black/[0.08]" />
      <div className="h-[9px] w-1/4 animate-pulse rounded-sm bg-black/[0.05]" style={{ animationDelay: '0.05s' }} />
    </div>
  </div>
);

// 그리드용 스켈레톤 (Shop — ProductCard와 1:1)
export const ProductGridSkeleton = ({
  count = 9,
  columnsClass = 'grid-cols-2 md:grid-cols-3',
  gapClass = 'gap-x-2 gap-y-14',
}) => (
  <div className={`grid ${columnsClass} ${gapClass}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i}>
        <ProductCardSkeleton />
      </div>
    ))}
  </div>
);

// 캐러셀용 스켈레톤 (Landing New Arrivals / Best Sellers)
export const ProductCarouselSkeleton = ({ count = 6, variant = 'large' }) => {
  const isLarge = variant === 'large';
  const isCompact = variant === 'compact';
  const cardClass = isLarge
    ? 'min-w-[85%] md:min-w-[calc(33.333%-32px)]'
    : isCompact
      ? 'min-w-[42%] sm:min-w-[30%] md:min-w-[calc(25%-18px)]'
      : 'min-w-[38%] sm:min-w-[28%] md:min-w-[calc(20%-16px)]';
  return (
    <div className={`flex gap-6 md:gap-8 px-8 md:px-12 overflow-hidden ${isLarge ? 'gap-12' : ''}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`flex-shrink-0 ${cardClass}`}>
          <ProductCardSkeleton variant={isLarge ? 'default' : 'compact'} />
        </div>
      ))}
    </div>
  );
};

// 로딩 메시지 (미니멀 스타일)
export const LoadingMessage = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center justify-center gap-3 py-8"
  >
    <span className="text-[10px] font-light tracking-[0.5em] uppercase text-[#999999] animate-pulse">
      Loading
    </span>
    <span className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 bg-black/20 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  </motion.div>
);
