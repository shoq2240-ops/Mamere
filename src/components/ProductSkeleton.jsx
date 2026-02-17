import React from 'react';
import { motion } from 'framer-motion';

// 단일 제품 카드 스켈레톤
export const ProductCardSkeleton = ({ variant = 'default' }) => (
  <div className="group relative flex flex-col">
    <div className="aspect-[3/4] overflow-hidden bg-[#F5F5F5] relative">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
    <div className={variant === 'compact' ? 'mt-6 space-y-1 px-1' : 'mt-8 space-y-2 text-left'}>
      <div className="h-3 bg-black/10 rounded w-3/4 animate-pulse" />
      <div className="h-4 bg-black/5 rounded w-1/3 animate-pulse" style={{ animationDelay: '0.1s' }} />
    </div>
  </div>
);

// 그리드용 스켈레톤 (Shop 페이지)
export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-[1px] gap-y-20 border-t border-[#F0F0F0]">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="group relative flex flex-col border-r border-b border-[#F0F0F0] transition-colors duration-700">
        <div className="aspect-[3/4] overflow-hidden bg-zinc-900/80 relative border-b border-[#F0F0F0]">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
          />
        </div>
        <div className="p-8 space-y-4">
          <div className="space-y-2">
            <div className="h-3 bg-black/10 rounded w-[80%] animate-pulse" />
            <div className="h-3 bg-black/5 rounded w-1/3 animate-pulse" style={{ animationDelay: '0.1s' }} />
          </div>
          <div className="pt-4">
            <div className="h-10 bg-black/5 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
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
