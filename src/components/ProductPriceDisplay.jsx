import React from 'react';
import { formatPrice } from '../lib/formatPrice';
import { getCompareAtNumber, getDiscountPercentRounded, isProductOnSale } from '../lib/productPrice';

const sizeStyles = {
  sm: {
    wrap: 'gap-0.5',
    strike: 'text-[11px] font-light text-[#AAAAAA] line-through',
    sale: 'text-[12px] font-medium text-[#1A1A1A]',
    badge: 'text-[10px] font-medium text-[#B91C1C]',
  },
  lg: {
    wrap: 'gap-1',
    strike: 'font-serif text-base font-normal text-[#999999] line-through tracking-[0.04em]',
    sale: 'font-serif text-2xl font-normal tracking-[0.06em] text-[#1A1A1A] md:text-[1.65rem]',
    badge: 'text-[11px] font-medium text-[#B91C1C]',
  },
};

/**
 * @param {'sm' | 'lg'} size — sm: 카드·위시리스트, lg: 상품 상세 우측
 */
export default function ProductPriceDisplay({ product, size = 'sm', className = '' }) {
  const onSale = isProductOnSale(product);
  const st = sizeStyles[size] || sizeStyles.sm;

  if (!onSale) {
    const single =
      size === 'lg'
        ? 'font-serif text-2xl font-normal tracking-[0.06em] text-[#333333] md:text-[1.65rem]'
        : 'text-[12px] font-light tabular-nums text-[#555555]';
    return <p className={`${single} ${className}`.trim()}>{formatPrice(product.price)}</p>;
  }

  const compare = getCompareAtNumber(product);
  const pct = getDiscountPercentRounded(product);

  return (
    <div className={`flex flex-col tabular-nums ${st.wrap} ${className}`.trim()}>
      <span className={st.strike}>{formatPrice(compare)}</span>
      <span className={st.sale}>{formatPrice(product.price)}</span>
      {pct != null && pct > 0 && <span className={st.badge}>-{pct}%</span>}
    </div>
  );
}
