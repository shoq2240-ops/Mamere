import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../store/WishlistContext';
import { useLanguage } from '../store/LanguageContext';
import { formatPrice } from '../lib/formatPrice';
import { isSoldOut } from '../lib/productStock';

// 대표님의 기존 이미지 로직 (보존)
const resolveProductImages = (product) => {
  if (!product) return [];
  const urls = [];
  const rawImages = product.images;
  if (rawImages) {
    let arr = [];
    if (Array.isArray(rawImages)) arr = rawImages;
    else if (typeof rawImages === 'string') {
      try { arr = JSON.parse(rawImages); } catch { arr = [rawImages]; }
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

  return (
    <div className="group/card relative flex w-full flex-col bg-[#FFFFFF]">
      <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          {showPlaceholder ? (
            <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-[10px] font-extralight uppercase tracking-[0.2em] text-[#CCCCCC]">
              {product.name}
            </div>
          ) : (
            <>
              <img
                src={primaryImage}
                alt={product.name}
                loading="lazy"
                onError={() => setImgError(true)}
                className={`h-full w-full object-cover ${hoverImage ? '' : 'transition-transform duration-300 ease-out group-hover/card:scale-[1.02]'}`}
              />
              {hoverImage && (
                <img
                  src={hoverImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-1000 ease-in-out group-hover/card:opacity-100"
                />
              )}
            </>
          )}
        </Link>

        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label="위시리스트"
          className={`absolute right-[10px] top-[10px] z-30 bg-transparent p-0 text-[#1a1a1a] transition-opacity duration-200 ${
            isInWishlist(product.id) ? 'opacity-100' : 'opacity-40 group-hover/card:opacity-100'
          }`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth={0.5}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </button>

        {!soldOut && onAddToCart && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(product, e);
            }}
            className="absolute bottom-[10px] left-1/2 z-30 w-[92%] -translate-x-1/2 border border-[#EEEEEE] bg-white/95 py-3 text-center text-[10px] font-extralight tracking-widest text-[#1A1A1A] backdrop-blur-[1px] transition-opacity duration-200 md:pointer-events-none md:opacity-0 md:group-hover/card:pointer-events-auto md:group-hover/card:opacity-100"
          >
            {t('shop.cardAddToCart')}
          </button>
        )}

        {soldOut && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
            <span className="text-[10px] font-extralight uppercase tracking-[0.2em] text-[#888888]">Sold Out</span>
          </div>
        )}
      </div>

      <Link
        to={`/product/${product.id}`}
        className="mt-4 flex flex-col items-center text-center sm:mt-5"
      >
        <p className="mb-1 text-[9px] font-extralight tracking-[0.2em] text-[#B0B0B0]">
          {gridCategoryLabel(product)}
        </p>
        <h3 className="text-[13px] font-medium tracking-tight text-[#1A1A1A]">{product.name}</h3>
        <p className="mt-1 text-[12px] font-light text-[#777777]">{formatPrice(product.price)}</p>
      </Link>
    </div>
  );
};

export default ProductCard;
