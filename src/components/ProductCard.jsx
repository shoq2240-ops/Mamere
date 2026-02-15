import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../store/WishlistContext';
import { formatPrice } from '../lib/formatPrice';
import { isSoldOut } from '../lib/productStock';

/**
 * @param {Object} product - { id, name, price, image }
 * @param {Function} onAddToCart - optional, 호출 시 (product, e) 전달
 * @param {'grid'|'carousel'} variant - grid: ShopPage 스타일, carousel: LandingPage 스타일
 * @param {boolean} grayscale - 이미지 그레이스케일 (호버 시 해제)
 */
const ProductCard = ({ product, onAddToCart, variant = 'grid', grayscale = false }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const soldOut = isSoldOut(product);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const cardContent = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900 border border-white/5">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            variant === 'carousel' ? 'opacity-90 group-hover:scale-105' : 'opacity-80 group-hover:scale-[1.03] group-hover:opacity-100'
          } ${grayscale ? 'grayscale group-hover:grayscale-0' : ''}`}
        />
        <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        {/* Add to Cart / SOLD OUT: 데스크톱에서만 표시, 품절 시 회색 비활성 스타일 */}
        {(onAddToCart || soldOut) && (
          <div
            onClick={(e) => {
              if (soldOut) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              e.preventDefault();
              e.stopPropagation();
              onAddToCart?.(product, e);
            }}
            className={`absolute bottom-0 left-0 right-0 text-center font-black tracking-widest transition-all duration-400 z-30 hidden md:block ${
              soldOut
                ? 'bg-white/10 text-white/50 cursor-not-allowed py-2.5 text-[9pt] opacity-80'
                : variant === 'carousel'
                  ? 'bg-white text-black py-2.5 text-[9pt] translate-y-full group-hover:translate-y-0 cursor-pointer'
                  : 'bg-white text-black py-4 text-[9px] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 cursor-pointer'
            }`}
          >
            {soldOut ? 'SOLD OUT' : 'ADD TO CART +'}
          </div>
        )}
      </div>
      <div className={variant === 'carousel' ? 'mt-3 md:mt-4 space-y-1' : 'p-5 md:p-8 space-y-3 md:space-y-4'}>
        <div className="flex items-start gap-2">
          <h3
            className={`font-bold tracking-widest uppercase text-white/70 group-hover:text-white transition-colors leading-tight flex-1 min-w-0 ${
              variant === 'carousel' ? 'text-[11px] line-clamp-2' : 'text-[11px]'
            }`}
          >
            {product.name}
          </h3>
          <button
            type="button"
            onClick={handleWishlistClick}
            className="flex-shrink-0 mt-0.5 p-1 text-white/50 hover:text-white transition-colors"
            aria-label={isInWishlist(product.id) ? '위시리스트에서 제거' : '위시리스트에 추가'}
          >
            <svg
              className="w-4 h-4"
              fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
        <p className={`font-light tracking-widest text-purple-500 ${variant === 'carousel' ? 'text-[11px] font-semibold' : 'text-[12px] md:text-[13px]'}`}>
          {formatPrice(product.price)}
        </p>
        {/* Add to Archive (grid 전용): 품절 시 SOLD OUT 비활성화 */}
        {variant === 'grid' && (onAddToCart || soldOut) && (
          <div className={`pt-4 hidden md:block ${soldOut ? '' : 'opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0'}`}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (soldOut) return;
                onAddToCart?.(product);
              }}
              disabled={soldOut}
              className={`w-full border py-4 text-[9px] font-bold tracking-ultra-wide uppercase transition-all duration-300 ${
                soldOut
                  ? 'border-white/10 text-white/40 bg-white/5 cursor-not-allowed'
                  : 'border-white/10 text-white/50 hover:bg-white hover:text-black hover:border-white'
              }`}
            >
              {soldOut ? 'SOLD OUT' : 'Add to Archive'}
            </button>
          </div>
        )}
      </div>
    </>
  );

  const baseClass =
    variant === 'grid'
      ? 'group relative flex flex-col transition-colors duration-700 hover:bg-zinc-900/40 block'
      : 'group relative flex flex-col flex-shrink-0 block';

  return (
    <Link to={`/product/${product.id}`} className={baseClass}>
      {cardContent}
    </Link>
  );
};

export default ProductCard;
