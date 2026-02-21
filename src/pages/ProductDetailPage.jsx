import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../store/CartContext';
import { useWishlist } from '../store/WishlistContext';
import { useProducts } from '../hooks/useProducts';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { formatPrice } from '../lib/formatPrice';
import { isSoldOut } from '../lib/productStock';
import { parseDescription } from '../lib/descriptionSections';

const toArray = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') {
    try {
      const p = JSON.parse(v);
      return Array.isArray(p) ? p : [v];
    } catch {
      return v ? [v] : [];
    }
  }
  return [];
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addRecentlyViewed } = useRecentlyViewed();
  const [imgError, setImgError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addQty, setAddQty] = useState(1);

  const product = products.find((p) => String(p.id) === String(id));
  const soldOut = isSoldOut(product);
  const maxQty = product
    ? Math.min(99, Math.max(1, Number(product.stock_quantity) ?? 99))
    : 1;
  const images = product?.images ? toArray(product.images) : [];
  const imageList = images.length > 0
    ? images.map((img) => (typeof img === 'string' ? { url: img, isMain: false } : { url: img?.url || img?.src, isMain: !!img?.isMain })).filter((i) => i.url)
    : product?.image ? [{ url: product.image, isMain: true }] : [];
  const mainImageUrl = imageList[selectedImageIndex]?.url || product?.image;
  const showPlaceholder = product && !mainImageUrl;

  const { details, howToUse } = product?.description ? parseDescription(product.description) : { details: '', howToUse: '' };
  const keyIngredients = toArray(product?.key_ingredients || product?.keyIngredients || []);
  const volume = product?.volume;

  useEffect(() => {
    if (product) addRecentlyViewed(product);
  }, [product?.id, addRecentlyViewed]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!product) return;
    if (soldOut) {
      toast.error('품절된 상품입니다.');
      return;
    }
    const qty = Math.max(1, Math.min(maxQty, Math.floor(addQty) || 1));
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`장바구니에 ${qty}개 추가되었습니다.`);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (product) toggleWishlist(product.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] pt-20 md:pt-24 pb-16 antialiased">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="aspect-[4/5] w-full max-w-md mx-auto bg-[#E8E4DF] animate-pulse" />
          <div className="mt-6 h-6 w-3/4 bg-[#E8E4DF] animate-pulse" />
          <div className="mt-3 h-5 w-1/4 bg-[#E8E4DF] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] pt-20 md:pt-24 pb-16 antialiased flex flex-col items-center justify-center px-6">
        <p className="text-[#8B8B8B] text-[10px] tracking-widest uppercase">DB 연결 실패</p>
        <Link to="/shop" className="mt-4 text-[10px] tracking-widest uppercase text-[#1a1a1a] border-b border-[#1a1a1a]">
          쇼핑으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] pt-20 md:pt-24 pb-16 antialiased flex flex-col items-center justify-center px-6">
        <p className="text-[#8B8B8B] text-[10px] tracking-widest uppercase">상품을 찾을 수 없습니다.</p>
        <Link to="/shop" className="mt-4 text-[10px] tracking-widest uppercase text-[#1a1a1a] border-b border-[#1a1a1a]">
          쇼핑으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] pt-20 md:pt-24 pb-16 antialiased text-[#2C2C2C]">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          {/* 이미지 갤러리: 4:5 비율, 썸네일 */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#F5F3F0]">
              {showPlaceholder ? (
                <div className="absolute inset-0 flex items-center justify-center p-6 bg-[#F5F3F0]">
                  <span className="text-[10px] font-medium tracking-[0.1em] text-[#8B8B8B] text-center line-clamp-4">
                    {product.name || 'No Image'}
                  </span>
                </div>
              ) : (
                <img
                  src={mainImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                  decoding="async"
                  onError={() => setImgError(true)}
                />
              )}
              <button
                type="button"
                onClick={handleWishlistClick}
                className="absolute right-3 top-3 z-10 p-2 text-[#8B8B8B] hover:text-[#1a1a1a] transition-colors bg-white/90 hover:bg-white rounded-full backdrop-blur-sm"
                aria-label={isInWishlist(product.id) ? '위시리스트에서 제거' : '위시리스트에 추가'}
              >
                <svg className="w-5 h-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>
            {imageList.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-20 md:w-20 md:h-24 overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === idx ? 'border-[#1a1a1a]' : 'border-[#E8E4DF] hover:border-[#8B8B8B]'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상품명 · 가격 · 용량 · 담기 */}
          <div className="flex flex-col mt-3 lg:mt-0">
            <h1 className="text-[11px] md:text-xs font-medium tracking-[0.1em] uppercase text-[#1a1a1a] leading-tight">
              {product.name}
            </h1>
            {volume && (
              <p className="mt-1 text-[10px] font-light tracking-[0.08em] text-[#5C5C5C]">{volume}</p>
            )}
            <p className="mt-2 text-[10px] md:text-xs font-light tracking-[0.08em] text-[#2C2C2C]">
              {formatPrice(product.price)}
            </p>
            {!soldOut && maxQty > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[10px] font-medium tracking-widest uppercase text-[#666666]">수량</span>
                <div className="flex items-center border border-[#E8E4DF]">
                  <button
                    type="button"
                    onClick={() => setAddQty((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-[#666666] hover:text-[#1a1a1a]"
                    aria-label="수량 줄이기"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={maxQty}
                    value={addQty}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!Number.isNaN(v)) setAddQty(Math.max(1, Math.min(maxQty, v)));
                    }}
                    className="w-12 h-9 text-center text-[11px] bg-transparent border-x border-[#E8E4DF] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setAddQty((q) => Math.min(maxQty, q + 1))}
                    className="w-9 h-9 flex items-center justify-center text-[#666666] hover:text-[#1a1a1a]"
                    aria-label="수량 늘리기"
                  >
                    +
                  </button>
                </div>
                {maxQty < 99 && (
                  <span className="text-[10px] text-[#8B8B8B]">(재고 {maxQty}개)</span>
                )}
              </div>
            )}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={soldOut}
                className={`w-full py-4 text-[10px] font-medium tracking-[0.12em] uppercase transition-colors ${
                  soldOut
                    ? 'bg-[#E8E4DF] text-[#8B8B8B] cursor-not-allowed border border-[#E8E4DF]'
                    : 'bg-[#1a1a1a] text-[#FFFFFF] hover:bg-[#2C2C2C] border border-[#1a1a1a]'
                }`}
              >
                {soldOut ? 'SOLD OUT' : '장바구니에 담기'}
              </button>
            </div>
            <Link to="/shop" className="mt-4 text-[10px] tracking-[0.1em] uppercase text-[#5C5C5C] hover:text-[#1a1a1a] transition-colors">
              ← 쇼핑으로 돌아가기
            </Link>
          </div>
        </div>

        {/* 상품 설명 */}
        {details && (
          <section className="mt-14 md:mt-20 pt-10 border-t border-[#E8E4DF]">
            <h2 className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#8B8B8B] mb-4">Description</h2>
            <div className="text-[11px] md:text-sm font-light leading-relaxed text-[#2C2C2C] whitespace-pre-wrap">
              {details}
            </div>
          </section>
        )}

        {/* 주요 성분 (Key Ingredients) */}
        {keyIngredients.length > 0 && (
          <section className="mt-10 md:mt-14 pt-10 border-t border-[#E8E4DF]">
            <h2 className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#8B8B8B] mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#8B8B8B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              주요 성분 (Key Ingredients)
            </h2>
            <ul className="flex flex-wrap gap-2">
              {keyIngredients.map((ing, i) => (
                <li key={i} className="px-3 py-1.5 bg-[#F5F3F0] text-[11px] font-light text-[#2C2C2C]">
                  {typeof ing === 'string' ? ing : ing?.name || ing?.label || String(ing)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 사용 방법 (How to Use) */}
        {howToUse && (
          <section className="mt-10 md:mt-14 pt-10 border-t border-[#E8E4DF]">
            <h2 className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#8B8B8B] mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#8B8B8B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a7.5 7.5 0 0115 0v1m-15 0a1.5 1.5 0 013 0m0 0a1.5 1.5 0 013 0M3 20.25v-1.5a7.5 7.5 0 0115 0v1.5m-15 0h15" /></svg>
              사용 방법 (How to Use)
            </h2>
            <div className="text-[11px] md:text-sm font-light leading-relaxed text-[#2C2C2C] whitespace-pre-wrap">
              {howToUse}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
