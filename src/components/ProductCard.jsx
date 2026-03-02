import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../store/WishlistContext';
import { useLanguage } from '../store/LanguageContext';
import { formatPrice } from '../lib/formatPrice';
import { isSoldOut } from '../lib/productStock';
import TiltCard from './TiltCard';

const resolveProductImages = (product) => {
  if (!product) return [];
  const urls = [];

  const rawImages = product.images;
  if (rawImages) {
    let arr = [];
    if (Array.isArray(rawImages)) {
      arr = rawImages;
    } else if (typeof rawImages === 'string') {
      try {
        const parsed = JSON.parse(rawImages);
        arr = Array.isArray(parsed) ? parsed : [rawImages];
      } catch {
        arr = [rawImages];
      }
    }
    arr.forEach((img) => {
      if (typeof img === 'string' && img.trim()) {
        urls.push(img.trim());
      } else if (img && typeof img === 'object') {
        const u = img.url || img.src;
        if (typeof u === 'string' && u.trim()) {
          urls.push(u.trim());
        }
      }
    });
  }

  if (urls.length === 0 && typeof product.image === 'string' && product.image.trim()) {
    urls.push(product.image.trim());
  }

  return urls;
};

/**
 * @param {Object} product - { id, name, price, image }
 * @param {Function} onAddToCart - optional, 호출 시 (product, e) 전달
 * @param {'grid'|'carousel'} variant - grid: ShopPage 스타일, carousel: LandingPage 스타일
 * @param {boolean} grayscale - 이미지 그레이스케일 (호버 시 해제)
 */
const ProductCard = ({ product, onAddToCart, variant = 'grid', grayscale = false }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t } = useLanguage();
  const soldOut = isSoldOut(product);
  const [imgError, setImgError] = useState(false);
  const imageUrls = resolveProductImages(product);
  const primaryImage = product.card_image || imageUrls[0] || product.image;
  const hoverImage = product.card_hover_image || (imageUrls.length > 1 ? imageUrls[1] : null);
  const showPlaceholder = !primaryImage || imgError;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const cardContent = (
    <div className="flex flex-col w-full">
      {/* 이미지: 카드 너비 꽉 채움, 3:4 비율 고정. 로드 실패 시 placeholder */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#EDEAE4] flex-shrink-0">
        {showPlaceholder ? (
          <div className="absolute inset-0 flex items-center justify-center p-3 bg-[#EDEAE4]">
            <span className="text-[10px] font-medium tracking-widest uppercase text-[#7A6B63] text-center line-clamp-3">
              {product.name || t('common.noImage')}
            </span>
          </div>
        ) : (
          <>
            <img
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-all duration-500 ${
                variant === 'carousel'
                  ? 'opacity-90 group-hover:scale-105'
                  : 'opacity-80 group-hover:scale-[1.03] group-hover:opacity-100'
              } ${grayscale ? 'grayscale group-hover:grayscale-0' : ''}`}
            />
            {hoverImage && (
              <img
                src={hoverImage}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
              />
            )}
          </>
        )}
        {!showPlaceholder && (
          <div className="absolute inset-0 bg-[#2D3A2D]/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}
        {/* 위시리스트: 이미지 우측 상단 절대 위치 */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className="absolute right-2 top-2 z-20 p-1.5 text-[#7A6B63] hover:text-[#3E2F28] transition-colors bg-[#F9F7F2]/90 hover:bg-[#F9F7F2] rounded-full backdrop-blur-sm"
          aria-label={isInWishlist(product.id) ? t('product.wishlistRemove') : t('product.wishlistAdd')}
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
        {/* Add to Cart / SOLD OUT: 데스크톱에서만 표시 */}
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
            className={`absolute bottom-0 left-0 right-0 text-center font-medium tracking-widest transition-all duration-400 z-30 hidden md:block ${
              soldOut
                ? 'bg-[#EDEAE4] text-[#7A6B63] cursor-not-allowed py-2.5 text-[9pt] opacity-80'
                : variant === 'carousel'
                  ? 'bg-[#A8B894] text-[#2D3A2D] py-2.5 text-[9pt] translate-y-full group-hover:translate-y-0 cursor-pointer'
                  : 'bg-[#A8B894] text-[#2D3A2D] py-4 text-[9px] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 cursor-pointer'
            }`}
          >
            {soldOut ? t('product.soldOut') : `${t('product.addToCart')} +`}
          </div>
        )}
      </div>
      {/* 텍스트: 이미지 바로 아래, mt-3 미니멀 여백 (Dr.care 무드: 작고 미니멀) */}
      <div className="mt-3 flex flex-col gap-0.5 min-w-0">
        <h3
          className={`font-bold tracking-widest uppercase text-[#3E2F28] group-hover:opacity-80 transition-colors leading-tight ${
            variant === 'carousel' ? 'text-[10px] line-clamp-2' : 'text-[10px]'
          }`}
        >
          {product.name}
        </h3>
        <p className={`font-light tracking-widest text-[#5C4A42] ${variant === 'carousel' ? 'text-[10px] font-medium' : 'text-[10px] md:text-xs'}`}>
          {formatPrice(product.price)}
        </p>
        {/* Add to Archive (grid 전용) */}
        {variant === 'grid' && (onAddToCart || soldOut) && (
          <div className={`pt-3 hidden md:block ${soldOut ? '' : 'opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0'}`}>
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
                  ? 'border-[#A8B894]/40 text-[#7A6B63] bg-[#EDEAE4] cursor-not-allowed'
                  : 'border-[#A8B894] text-[#3E2F28] hover:bg-[#A8B894] hover:text-[#2D3A2D] hover:border-[#A8B894]'
              }`}
            >
              {soldOut ? t('product.soldOut') : t('product.addToArchive')}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const baseClass =
    variant === 'grid'
      ? 'group relative flex flex-col transition-colors duration-700 hover:bg-[#F5F3EE] block'
      : 'group relative flex flex-col flex-shrink-0 block';

  return (
    <Link to={`/product/${product.id}`} className={baseClass}>
      <TiltCard
        className="flex flex-col flex-1 min-w-0"
        maxTilt={10}
        shadowOffset={14}
        enableTouchAnimation={true}
      >
        {cardContent}
      </TiltCard>
    </Link>
  );
};

export default ProductCard;
