import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../store/WishlistContext';
import { formatPrice } from '../lib/formatPrice';
import { isSoldOut } from '../lib/productStock';

const resolveProductImages = (product) => {
  if (!product) return [];
  const urls = [];
  const rawImages = product.images;
  if (rawImages) {
    let arr = [];
    if (Array.isArray(rawImages)) arr = rawImages;
    else if (typeof rawImages === 'string') {
      try {
        arr = JSON.parse(rawImages);
      } catch {
        arr = [rawImages];
      }
    }
    arr.forEach((img) => {
      if (typeof img === 'string' && img.trim()) urls.push(img.trim());
      else if (img && typeof img === 'object') {
        const u = img.url || img.src;
        if (typeof u === 'string' && u.trim()) urls.push(u.trim());
      }
    });
  }
  if (urls.length === 0 && typeof product.image === 'string' && product.image.trim()) {
    urls.push(product.image.trim());
  }
  return urls;
};

const gridCategoryLabel = (product) => {
  const raw = product?.category ?? '';
  const n = String(raw).toLowerCase().replace(/-/g, '_');
  if (n === 'skincare') return 'SKIN CARE';
  if (n === 'body_hair') return 'BODY & HAIR';
  return 'PRODUCT';
};

const ProductCard = ({ product, onAddToCart, variant = 'grid' }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
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

  return (
    <div className="group/card relative flex w-full min-w-0 flex-col bg-white">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#F9F9F9]">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          {showPlaceholder ? (
            <div className="absolute inset-0 flex items-center justify-center p-2 text-left text-[9px] font-extralight uppercase tracking-[0.15em] text-[#CCCCCC]">
              {product.name}
            </div>
          ) : (
            <>
              <img
                src={primaryImage}
                alt={product.name}
                loading="lazy"
                onError={() => setImgError(true)}
                className={`block h-full w-full object-cover ${
                  hoverImage ? '' : 'transition-transform duration-300 ease-out group-hover/card:scale-[1.02]'
                }`}
              />
              {hoverImage && (
                <img
                  src={hoverImage}
                  alt=""
                  className="absolute inset-0 block h-full w-full object-cover opacity-0 transition-opacity duration-1000 ease-in-out group-hover/card:opacity-100"
                />
              )}
            </>
          )}
        </Link>

        <div className="absolute right-3 top-3 z-30 flex items-center gap-2">
          {!soldOut && onAddToCart && (
            <div className="relative group/cart">
              <button type="button" aria-label="장바구니" className="bg-transparent p-0 text-white">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <path d="M3 6h18" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToCart(product, e);
                }}
                className="pointer-events-none absolute bottom-full left-1/2 z-40 -translate-x-1/2 translate-y-[calc(-100%_-_10px)] whitespace-nowrap border border-[#EEEEEE] bg-white/90 px-4 py-2.5 text-[11px] font-light tracking-tight text-[#1A1A1A] opacity-0 transition-opacity duration-300 ease-out group-hover/cart:pointer-events-auto group-hover/cart:opacity-100"
              >
                장바구니 담기
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label="위시리스트"
            className="bg-transparent p-0"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                fill={isInWishlist(product.id) ? '#FFFFFF' : 'none'}
                stroke="#FFFFFF"
                strokeWidth={0.5}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </button>
        </div>

        {soldOut && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
            <span className="text-[9px] font-extralight uppercase tracking-[0.2em] text-[#888888]">Sold Out</span>
          </div>
        )}
      </div>

      <Link
        to={`/product/${product.id}`}
        className="mt-3 flex w-full min-w-0 flex-col items-start text-left"
      >
        <p className="mb-1 mt-4 text-[10px] font-extralight tracking-[0.15em] text-[#AAAAAA]">
          {gridCategoryLabel(product)}
        </p>
        <h3 className="line-clamp-2 text-[13px] font-normal leading-snug tracking-tight text-[#1A1A1A]">
          {product.name}
        </h3>
        <p className="mt-1 text-[12px] font-light tabular-nums text-[#555555]">
          {formatPrice(product.price)}
        </p>
      </Link>
    </div>
  );
};

export default ProductCard;
