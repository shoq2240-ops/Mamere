import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../store/CartContext';
import { useWishlist } from '../store/WishlistContext';
import { publicTable } from '../lib/supabase';
import { parseDescription } from '../lib/descriptionSections';

const formatPrice = (price) => {
  if (typeof price === 'number') return `₩${price.toLocaleString()}`;
  if (typeof price === 'string' && price.replace(/\D/g, '').length > 0) {
    return `₩${parseInt(price.replace(/\D/g, ''), 10).toLocaleString()}`;
  }
  return price;
};

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

  const images = product ? getImageList(product) : [];
  const descSections = product ? parseDescription(product.description) : { freeShipping: '', details: '', sizeFit: '' };
  const accordionItems = [
    { key: 'shipping', title: '무료 배송 & 반품', content: descSections.freeShipping },
    { key: 'details', title: '세부 정보', content: descSections.details },
    { key: 'size', title: '사이즈 및 핏', content: descSections.sizeFit },
  ].filter((item) => item.content);
  const sizes = Array.isArray(product?.sizes) && product.sizes.length > 0
    ? product.sizes
    : DEFAULT_SIZES;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-black px-12 py-24">
        <p className="text-[10px] tracking-[0.2em] uppercase text-white/40">Loading...</p>
      </div>
    );
  }

  if (error || !product) {
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
              {/* 북마크(위시리스트) */}
              <div className="flex justify-end -mt-2">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="p-2 text-white/50 hover:text-white transition-colors"
                  aria-label={isInWishlist(product.id) ? '위시리스트에서 제거' : '위시리스트에 추가'}
                >
                  <svg
                    className="w-5 h-5"
                    fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>

              {/* 상품명 (미니멀, font-bold 없음) */}
              <h1 className="text-[11px] font-normal tracking-widest uppercase text-white/90 leading-relaxed pr-8">
                {product.name}
              </h1>

              {/* 가격 */}
              <p className="text-[11px] font-light tracking-widest text-white/70">
                {formatPrice(product.price)}
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

              {/* 버튼: ADD TO ARCHIVE, BUY (검정 배경, 회색 테두리/폰트) */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 px-8 bg-black border border-white/30 text-white/70 text-[10px] font-light tracking-[0.2em] uppercase hover:bg-white/5 hover:border-white/50 hover:text-white/90 transition-all duration-300"
                >
                  {added ? 'ADDED' : 'ADD TO ARCHIVE'}
                </button>
                <button
                  onClick={handleBuy}
                  className="flex-1 py-4 px-8 bg-black border border-white/30 text-white/70 text-[10px] font-light tracking-[0.2em] uppercase hover:bg-white/5 hover:border-white/50 hover:text-white/90 transition-all duration-300"
                >
                  BUY
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
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
