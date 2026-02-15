import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../store/CartContext';
import { useWishlist } from '../store/WishlistContext';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { publicTable } from '../lib/supabase';
import { parseDescription } from '../lib/descriptionSections';
import { formatPrice } from '../lib/formatPrice';
import { isSoldOut } from '../lib/productStock';

// image / image_url / images 지원: 배열이면 모두, 단일이면 1장
const getImageList = (product) => {
  const img = product?.image_url ?? product?.images ?? product?.image;
  if (Array.isArray(img)) return img.filter(Boolean);
  return img ? [img] : [];
};

const DEFAULT_SIZES = ['46', '48', '50', '52'];

const AccordionItem = ({ title, content, isOpen, onToggle }) => (
  <div className="border-b border-white/10">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 text-left group"
    >
      <span className="text-[10px] font-light tracking-widest uppercase text-white/70 group-hover:text-white/90 transition-colors">
        {title}
      </span>
      <motion.span
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="text-white/50 text-xl font-light w-6 h-6 flex items-center justify-center"
      >
        +
      </motion.span>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <p className="text-[11px] font-light tracking-widest text-white/50 leading-relaxed pb-4 whitespace-pre-line">
            {content}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { items: recentlyViewedRaw, addRecentlyViewed } = useRecentlyViewed();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await publicTable('products')
          .select('*')
          .eq('id', id)
          .single();
        if (err) throw err;
        setProduct(data);
        addRecentlyViewed(data);
        const sizes = data?.sizes;
        setSelectedSize(Array.isArray(sizes) && sizes.length > 0 ? sizes[0] : DEFAULT_SIZES[0]);
      } catch (err) {
        setError(err.message || '상품을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      ...product,
      image: product.image || images[0],
      price: formatPrice(product.price),
      selectedSize: selectedSize,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuy = () => {
    handleAddToCart();
    // BUY는 장바구니 담기 후 결제 페이지로 이동할 수 있음 (선택)
  };

  // 로딩 중이거나 product가 없으면 렌더링 전에 early return (데이터 로드 전 예외 처리)
  if (loading || !product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-black px-12 py-24">
        <p className="text-[10px] tracking-[0.2em] uppercase text-white/40">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-black px-12 py-24">
        <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 text-center">
          {error || '상품을 찾을 수 없습니다.'}
        </p>
        <Link
          to="/"
          className="mt-10 text-[10px] tracking-[0.15em] uppercase text-white/60 hover:text-white border-b border-white/20 pb-1 transition-colors"
        >
          메인으로 돌아가기
        </Link>
      </div>
    );
  }

  // 이 시점에서 product가 존재함이 보장됨 (옵셔널 체이닝으로 이중 안전)
  const images = getImageList(product);
  const descSections = parseDescription(product?.description);
  const soldOut = isSoldOut(product);
  const accordionItems = [
    { key: 'shipping', title: '무료 배송 & 반품', content: descSections.freeShipping },
    { key: 'details', title: '세부 정보', content: descSections.details },
    { key: 'size', title: '사이즈 및 핏', content: descSections.sizeFit },
  ].filter((item) => item.content);
  const sizes = Array.isArray(product?.sizes) && product.sizes.length > 0
    ? product.sizes
    : DEFAULT_SIZES;
  const recentlyViewed = recentlyViewedRaw.filter((p) => p?.id !== product?.id).slice(0, 5);

  return (
    <div className="bg-black min-h-screen text-white antialiased">
      {/* 뒤로가기 */}
      <div className="px-10 md:px-16 lg:px-24 pt-10 md:pt-14 pb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] font-light tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors"
        >
          <span>←</span> Double Negative
        </Link>
      </div>

      {/* 2컬럼 레이아웃: 왼쪽 Info (35~40%), 오른쪽 Image (60~65%) */}
      <div className="grid grid-cols-1 lg:grid-cols-[36%_64%] min-h-[60vh] gap-0">
        {/* 왼쪽: 상품 정보 (Sticky 고정) */}
        <div className="order-2 lg:order-1 px-10 md:px-16 lg:px-20 xl:px-24 pb-20 lg:pb-32">
          <div className="lg:sticky lg:top-36 lg:py-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-8"
            >
              {/* 상품명 + 위시리스트 (하트: 상품명 옆 가시성 있게) */}
              <div className="flex items-start gap-2">
                <h1 className="text-[11px] font-normal tracking-widest uppercase text-white/90 leading-relaxed flex-1 min-w-0">
                  {product?.name}
                </h1>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product?.id)}
                  className="flex-shrink-0 p-2 -m-2 text-white hover:text-purple-400 transition-colors"
                  aria-label={isInWishlist(product?.id) ? '위시리스트에서 제거' : '위시리스트에 추가'}
                >
                  <svg
                    className="w-6 h-6"
                    fill={isInWishlist(product?.id) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>

              {/* 가격 */}
              <p className="text-[11px] font-light tracking-widest text-white/70">
                {formatPrice(product?.price)}
              </p>

              {/* 아코디언: 무료 배송/반품, 세부 정보, 사이즈 및 핏 */}
              {accordionItems.length > 0 && (
                <div className="space-y-0">
                  {accordionItems.map((item) => (
                    <AccordionItem
                      key={item.key}
                      title={item.title}
                      content={item.content}
                      isOpen={openAccordion === item.key}
                      onToggle={() => setOpenAccordion((prev) => (prev === item.key ? null : item.key))}
                    />
                  ))}
                </div>
              )}

              {/* 사이즈 선택 (리스트 형) */}
              <div className="space-y-4 pt-4">
                <p className="text-[10px] font-light tracking-widest uppercase text-white/40">
                  Size
                </p>
                <ul className="flex flex-wrap gap-3">
                  {sizes.map((size) => (
                    <li key={size}>
                      <button
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 flex items-center justify-center text-[11px] font-light tracking-widest uppercase transition-all border ${
                          selectedSize === size
                            ? 'border-white/60 text-white bg-white/5'
                            : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'
                        }`}
                      >
                        {size}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 버튼: ADD TO ARCHIVE, BUY (품절 시 SOLD OUT, 비활성화) */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <button
                  type="button"
                  onClick={soldOut ? undefined : handleAddToCart}
                  disabled={soldOut}
                  className={`flex-1 py-4 px-8 text-[10px] font-light tracking-[0.2em] uppercase transition-all duration-300 ${
                    soldOut
                      ? 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed opacity-60'
                      : 'bg-black border border-white/30 text-white/70 hover:bg-white/5 hover:border-white/50 hover:text-white/90'
                  }`}
                >
                  {soldOut ? 'SOLD OUT' : added ? 'ADDED' : 'ADD TO ARCHIVE'}
                </button>
                <button
                  type="button"
                  onClick={soldOut ? undefined : handleBuy}
                  disabled={soldOut}
                  className={`flex-1 py-4 px-8 text-[10px] font-light tracking-[0.2em] uppercase transition-all duration-300 ${
                    soldOut
                      ? 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed opacity-60'
                      : 'bg-black border border-white/30 text-white/70 hover:bg-white/5 hover:border-white/50 hover:text-white/90'
                  }`}
                >
                  {soldOut ? 'SOLD OUT' : 'BUY'}
                </button>
              </div>

              {added && (
                <p className="text-[9px] tracking-[0.15em] uppercase text-white/40">
                  장바구니에 추가되었습니다.
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* 오른쪽: 상품 이미지 영역 (60~65%, 세로로 크게, 스크롤) */}
        <div className="order-1 lg:order-2 w-full">
          <div className="overflow-y-auto scrollbar-hide max-h-[60vh] lg:max-h-[calc(100vh-8rem)] pr-4 lg:pr-12">
            <div className="space-y-0">
              {images.map((src, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="w-full aspect-[3/4] lg:aspect-[4/5] bg-zinc-900/80 mb-0"
                >
                  <img
                    src={src}
                    alt={`${product?.name ?? ''} ${idx + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 최근 본 상품 (은은하게) */}
      {recentlyViewed.length > 0 && (
        <div className="border-t border-white/5 mt-16 md:mt-24 pt-12 md:pt-16 px-10 md:px-16 lg:px-24 pb-24">
          <p className="text-[9px] font-light tracking-[0.2em] uppercase text-white/30 mb-6">
            Recently Viewed
          </p>
          <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-2">
            {recentlyViewed.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="flex-shrink-0 w-24 md:w-28 group"
              >
                <div className="aspect-[3/4] overflow-hidden bg-zinc-900/50 mb-2">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-500"
                    />
                  )}
                </div>
                <p className="text-[9px] font-light tracking-widest text-white/40 group-hover:text-white/60 truncate transition-colors">
                  {p.name}
                </p>
                <p className="text-[8px] font-light tracking-widest text-white/25 mt-0.5">
                  {formatPrice(p.price)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
