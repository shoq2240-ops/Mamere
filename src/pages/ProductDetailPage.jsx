import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../store/CartContext';
import { useWishlist } from '../store/WishlistContext';
import { useProducts } from '../hooks/useProducts';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { formatPrice } from '../lib/formatPrice';
import { isSoldOut } from '../lib/productStock';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addRecentlyViewed } = useRecentlyViewed();
  const [imgError, setImgError] = useState(false);

  const product = products.find((p) => String(p.id) === String(id));
  const soldOut = isSoldOut(product);
  const showPlaceholder = product && (!product.image || imgError);

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
    addToCart(product);
    toast.success('장바구니에 추가되었습니다.');
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (product) toggleWishlist(product.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] pt-20 md:pt-24 pb-16 antialiased">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="aspect-[3/4] w-full max-w-lg mx-auto bg-[#F5F5F5] animate-pulse rounded-none" />
          <div className="mt-6 h-6 w-3/4 bg-[#F0F0F0] animate-pulse" />
          <div className="mt-3 h-5 w-1/4 bg-[#F0F0F0] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] pt-20 md:pt-24 pb-16 antialiased flex flex-col items-center justify-center px-6">
        <p className="text-[#666666] text-[10px] tracking-widest uppercase">DB 연결 실패</p>
        <Link to="/shop" className="mt-4 text-[10px] tracking-widest uppercase text-[#000000] border-b border-[#000000]">
          쇼핑으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] pt-20 md:pt-24 pb-16 antialiased flex flex-col items-center justify-center px-6">
        <p className="text-[#666666] text-[10px] tracking-widest uppercase">상품을 찾을 수 없습니다.</p>
        <Link to="/shop" className="mt-4 text-[10px] tracking-widest uppercase text-[#000000] border-b border-[#000000]">
          쇼핑으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] pt-20 md:pt-24 pb-16 antialiased text-[#000000]">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* 이미지: 3:4 비율, 로드 실패 시 placeholder */}
          <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F0F0F0]">
            {showPlaceholder ? (
              <div className="absolute inset-0 flex items-center justify-center p-6 bg-[#F0F0F0]">
                <span className="text-[10px] font-medium tracking-widest uppercase text-[#999999] text-center line-clamp-4">
                  {product.name || 'No Image'}
                </span>
              </div>
            ) : (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                loading="eager"
                decoding="async"
                onError={() => setImgError(true)}
              />
            )}
            {/* 위시리스트: 우측 상단 */}
            <button
              type="button"
              onClick={handleWishlistClick}
              className="absolute right-3 top-3 z-10 p-2 text-[#999999] hover:text-[#000000] transition-colors bg-white/80 hover:bg-white rounded-full backdrop-blur-sm"
              aria-label={isInWishlist(product.id) ? '위시리스트에서 제거' : '위시리스트에 추가'}
            >
              <svg className="w-5 h-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>

          {/* 상품명 · 가격 · 담기 (이미지 아래/옆, 미니멀) */}
          <div className="flex flex-col mt-3 lg:mt-0">
            <h1 className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#000000] leading-tight">
              {product.name}
            </h1>
            <p className="mt-2 text-[10px] md:text-xs font-light tracking-widest text-[#333333]">
              {formatPrice(product.price)}
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={soldOut}
                className={`w-full py-4 text-[10px] font-bold tracking-widest uppercase transition-colors ${
                  soldOut
                    ? 'bg-[#F5F5F5] text-[#999999] cursor-not-allowed border border-[#E5E5E5]'
                    : 'bg-[#000000] text-[#FFFFFF] hover:bg-[#333333] border border-[#000000]'
                }`}
              >
                {soldOut ? 'SOLD OUT' : 'ADD TO CART +'}
              </button>
            </div>
            <Link to="/shop" className="mt-4 text-[10px] tracking-widest uppercase text-[#666666] hover:text-[#000000] transition-colors">
              ← 쇼핑으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
