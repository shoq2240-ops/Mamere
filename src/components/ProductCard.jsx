import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  let n = String(raw).toLowerCase().replace(/-/g, '_');
  if (n === 'household_items') n = 'household';
  if (n === 'skincare') return 'SKIN CARE';
  if (n === 'body_hair') return 'BODY & HAIR';
  if (n === 'household') return 'HOUSEHOLD';
  return 'PRODUCT';
};

const ProductCard = ({ product, onAddToCart, variant = 'grid' }) => {
  const soldOut = isSoldOut(product);
  const [imgError, setImgError] = useState(false);

  const imageUrls = resolveProductImages(product);
  const hoverUrl = (product.card_hover_image || '').trim() || null;
  let primaryImage =
    (product.card_image || product.image || imageUrls[0] || '').trim() || null;
  if (hoverUrl && primaryImage === hoverUrl) {
    primaryImage =
      imageUrls.find((u) => u !== hoverUrl) || (product.image && product.image !== hoverUrl ? product.image : null) || imageUrls[0] || null;
  }
  const hoverImage =
    hoverUrl && hoverUrl !== primaryImage
      ? hoverUrl
      : imageUrls.filter((u) => u && u !== primaryImage)[0] || null;
  const showPlaceholder = !primaryImage || imgError;

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

        {!soldOut && onAddToCart && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-end justify-center p-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart(product, e);
              }}
              className="pointer-events-auto w-full rounded-[8px] border border-[#CFCFCF] bg-transparent px-5 py-3 text-[12px] font-light text-[#1A1A1A] font-sans opacity-0 transition-opacity duration-300 ease-out group-hover/card:opacity-100"
            >
              장바구니 담기
            </button>
          </div>
        )}

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
