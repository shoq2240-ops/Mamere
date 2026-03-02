import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '../store/CartContext';
import { useWishlist } from '../store/WishlistContext';
import { useProducts } from '../hooks/useProducts';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { formatPrice } from '../lib/formatPrice';
import { isSoldOut, getStockQuantity } from '../lib/productStock';
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

function AccordionItem({ id, title, isOpen, onToggle, children }) {
  return (
    <div className="border-t border-gray-100" role="region" aria-labelledby={`accordion-${id}-head`}>
      <button
        id={`accordion-${id}-head`}
        type="button"
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between text-left"
        aria-expanded={isOpen}
        aria-controls={`accordion-${id}-panel`}
      >
        <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#3E2F28]">{title}</span>
        <span className="flex-shrink-0 ml-3 text-gray-400" aria-hidden>
          {isOpen ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          )}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`accordion-${id}-panel`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 pr-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HowToUseContent({ text }) {
  if (!text || !text.trim()) {
    return <p className="text-left text-[11px] leading-relaxed text-gray-600">사용 방법이 곧 추가됩니다.</p>;
  }
  const tipMatch = text.match(/\b(Tip|TIP|Tip:)\s*:?\s*(.*?)(?=\n\n|$)/is);
  const mainText = tipMatch ? text.slice(0, text.indexOf(tipMatch[0])).trim() : text;
  const tipText = tipMatch ? tipMatch[2].trim() : null;
  return (
    <div className="text-left space-y-3">
      <p className="text-[11px] leading-relaxed text-gray-600 whitespace-pre-wrap">{mainText}</p>
      {tipText && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-[10px] font-medium tracking-[0.08em] uppercase text-gray-500 mb-1">Tip</p>
          <p className="text-[11px] leading-relaxed text-gray-600 whitespace-pre-wrap">{tipText}</p>
        </div>
      )}
    </div>
  );
}

const SUSTAINABILITY_ITEMS = [
  { label: 'Animal Testing Free', checked: true },
  { label: 'Vegan Formula', checked: true },
  { label: 'Eco-friendly Packaging', checked: true },
];

const SHIPPING_RETURNS_TEXT = `배송은 결제 완료 후 2–3 영업일 내 출고됩니다. 도서·산간 지역은 1–2일 추가 소요될 수 있습니다.
반품·교환은 수령일로부터 7일 이내, 미개봉 제품에 한해 가능합니다. 단순 변심 시 왕복 배송비는 고객 부담입니다.`;

const ProductDetailPage = () => {
  const { id } = useParams();
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addRecentlyViewed } = useRecentlyViewed();
  const [imgError, setImgError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addQty, setAddQty] = useState(1);
  const [accordionOpen, setAccordionOpen] = useState(null);

  const product = products.find((p) => String(p.id) === String(id));
  const soldOut = isSoldOut(product);
  const stockQty = getStockQuantity(product);
  const maxQty = product ? Math.min(99, Math.max(0, stockQty)) : 0;
  const images = product?.images ? toArray(product.images) : [];
  const imageList = images.length > 0
    ? images.map((img) => (typeof img === 'string' ? { url: img, isMain: false } : { url: img?.url || img?.src, isMain: !!img?.isMain })).filter((i) => i.url)
    : product?.image ? [{ url: product.image, isMain: true }] : [];
  const mainImageUrl = imageList[selectedImageIndex]?.url || product?.image;
  const showPlaceholder = product && !mainImageUrl;

  const { details, howToUse } = product?.description ? parseDescription(product.description) : { details: '', howToUse: '' };
  const keyIngredients = toArray(product?.key_ingredients || product?.keyIngredients || []);
  const keyIngredientsSet = new Set(keyIngredients.map((k) => (typeof k === 'string' ? k : k?.name ?? k?.label ?? String(k)).trim().toLowerCase()));
  const volume = product?.volume;

  const ingredientsList = (() => {
    const raw = product?.ingredients ?? product?.ingredients_text ?? '';
    if (typeof raw === 'string' && raw.trim()) {
      return raw.split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
    }
    return keyIngredients.length ? keyIngredients.map((k) => (typeof k === 'string' ? k : k?.name ?? String(k))) : [];
  })();

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
    if (qty <= 0) {
      toast.error('최대 구매 가능 수량은 0개입니다.');
      return;
    }
    const added = addToCart(product, qty);
    if (!added) {
      toast.error(`최대 구매 가능 수량은 ${stockQty}개입니다.`);
      return;
    }
    toast.success(`장바구니에 ${qty}개 추가되었습니다.`);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (product) toggleWishlist(product.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] pt-20 md:pt-24 pb-16 antialiased">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="aspect-[4/5] w-full max-w-md mx-auto bg-[#EDEAE4] animate-pulse" />
          <div className="mt-6 h-6 w-3/4 bg-[#EDEAE4] animate-pulse" />
          <div className="mt-3 h-5 w-1/4 bg-[#EDEAE4] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] pt-20 md:pt-24 pb-16 antialiased flex flex-col items-center justify-center px-6">
        <p className="text-[#7A6B63] text-[10px] tracking-widest uppercase">DB 연결 실패</p>
        <Link to="/shop" className="mt-4 text-[10px] tracking-widest uppercase text-[#3E2F28] border-b border-[#A8B894]">
          쇼핑으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] pt-20 md:pt-24 pb-16 antialiased flex flex-col items-center justify-center px-6">
        <p className="text-[#7A6B63] text-[10px] tracking-widest uppercase">상품을 찾을 수 없습니다.</p>
        <Link to="/shop" className="mt-4 text-[10px] tracking-widest uppercase text-[#3E2F28] border-b border-[#A8B894]">
          쇼핑으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] pt-20 md:pt-24 pb-16 antialiased text-[#3E2F28]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* 768px 초과: 2컬럼(좌 이미지 | 우 구매정보), 768px 이하: column 위아래 쌓임 */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-[100px] md:items-start">
          {/* 왼쪽: 상세 이미지 4개 세로 연속 배치 (image-section, 갭 없음) */}
          <div className="flex flex-col gap-4 min-w-0 md:flex-1">
            <div className="relative w-full overflow-visible">
              {showPlaceholder ? (
                <div className="flex items-center justify-center p-6 bg-[#EDEAE4] min-h-[280px]">
                  <span className="text-[10px] font-medium tracking-[0.1em] text-[#7A6B63] text-center line-clamp-4">
                    {product.name || 'No Image'}
                  </span>
                </div>
              ) : (
                <div className="image-section">
                  {(imageList.length ? imageList.slice(0, 4) : (mainImageUrl ? [{ url: mainImageUrl }] : [])).filter((i) => i?.url).map((img, idx) => (
                    <img
                      key={idx}
                      src={typeof img === 'string' ? img : img.url}
                      alt={`${product.name} ${idx + 1}`}
                      className="product-detail-image"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      onError={idx === 0 ? () => setImgError(true) : undefined}
                    />
                  ))}
                </div>
              )}
              {!showPlaceholder && imageList.length > 0 && (
                <button
                  type="button"
                  onClick={handleWishlistClick}
                  className="absolute right-3 top-3 z-10 p-2 text-[#7A6B63] hover:text-[#3E2F28] transition-colors bg-[#F9F7F2]/90 hover:bg-[#F9F7F2] rounded-full backdrop-blur-sm"
                  aria-label={isInWishlist(product.id) ? '위시리스트에서 제거' : '위시리스트에 추가'}
                >
                  <svg className="w-5 h-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              )}
            </div>
            {imageList.length > 4 && (
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

          {/* 오른쪽: 구매 정보 박스 (이미지 두 번째 조각쯤·약 200px 아래부터 시작, 스티키로 스크롤 시 따라옴) */}
          <div className="flex flex-col w-full max-w-[380px] mx-auto md:mx-0 md:pt-16 md:sticky md:top-[50px] px-5 py-5 md:px-6 md:py-6 border border-[#E8E4DF] rounded-sm shadow-[0_2px_12px_rgba(62,47,40,0.06)] bg-[#F9F7F2]">
            <h1 className="text-[11px] md:text-xs font-medium tracking-[0.1em] uppercase text-[#3E2F28] leading-tight">
              {product.name}
            </h1>
            {volume && (
              <p className="mt-1 text-[10px] font-light tracking-[0.08em] text-[#5C4A42]">{volume}</p>
            )}
            <p className="mt-2 text-[10px] md:text-xs font-light tracking-[0.08em] text-[#3E2F28]">
              {formatPrice(product.price)}
            </p>
            {!soldOut && maxQty > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[10px] font-medium tracking-widest uppercase text-[#5C4A42]">수량</span>
                <div className="flex items-center border border-[#E8E4DF]">
                  <button
                    type="button"
                    onClick={() => setAddQty((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-[#5C4A42] hover:text-[#3E2F28]"
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
                    disabled={addQty >= maxQty}
                    className={`w-9 h-9 flex items-center justify-center text-[#5C4A42] hover:text-[#3E2F28] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-[#5C4A42]`}
                    aria-label="수량 늘리기"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={soldOut}
                className={`w-full py-4 text-[10px] font-medium tracking-[0.12em] uppercase transition-colors ${
                  soldOut
                    ? 'bg-[#EDEAE4] text-[#7A6B63] cursor-not-allowed border border-[#A8B894]/40'
                    : 'bg-[#A8B894] text-[#2D3A2D] hover:opacity-90 border border-[#A8B894]'
                }`}
              >
                {soldOut ? 'SOLD OUT' : '장바구니에 담기'}
              </button>
            </div>
            <Link to="/shop" className="mt-4 block text-[10px] tracking-[0.1em] uppercase text-[#5C4A42] hover:text-[#3E2F28] transition-colors">
              ← 쇼핑으로 돌아가기
            </Link>

            {/* 아코디언: JJJJound 스타일, 얇은 구분선만 */}
            <div className="mt-10 flex flex-col">
              {(details || true) && (
                <AccordionItem
                  id="details"
                  title="DETAILS"
                  isOpen={accordionOpen === 'details'}
                  onToggle={() => setAccordionOpen(accordionOpen === 'details' ? null : 'details')}
                >
                  <p className="text-left text-[11px] leading-relaxed text-gray-600 whitespace-pre-wrap">
                    {details || '제품의 핵심 효능과 컨셉에 대한 설명이 곧 추가됩니다.'}
                  </p>
                </AccordionItem>
              )}
              <AccordionItem
                  id="ingredients"
                  title="INGREDIENTS"
                  isOpen={accordionOpen === 'ingredients'}
                  onToggle={() => setAccordionOpen(accordionOpen === 'ingredients' ? null : 'ingredients')}
                >
                  <div className="text-left text-[11px] leading-relaxed text-gray-600">
                    {ingredientsList.length > 0 ? (
                      <p className="flex flex-wrap gap-x-1 gap-y-0.5">
                        {ingredientsList.map((ing, i) => {
                          const isKey = keyIngredientsSet.has(String(ing).trim().toLowerCase());
                          return (
                            <span key={i}>
                              {i > 0 && <span className="text-gray-400">, </span>}
                              <span className={isKey ? 'font-semibold text-gray-700' : 'font-normal text-gray-500'}>{ing}</span>
                            </span>
                          );
                        })}
                      </p>
                    ) : keyIngredients.length > 0 ? (
                      <ul className="space-y-0.5">
                        {keyIngredients.map((ing, i) => (
                          <li key={i} className="font-semibold text-gray-700">
                            {typeof ing === 'string' ? ing : ing?.name || String(ing)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">전성분 정보가 등록되면 여기에 표시됩니다.</p>
                    )}
                  </div>
                </AccordionItem>
              <AccordionItem
                id="howToUse"
                title="HOW TO USE"
                isOpen={accordionOpen === 'howToUse'}
                onToggle={() => setAccordionOpen(accordionOpen === 'howToUse' ? null : 'howToUse')}
              >
                <HowToUseContent text={howToUse} />
              </AccordionItem>
              <AccordionItem
                id="sustainability"
                title="SUSTAINABILITY"
                isOpen={accordionOpen === 'sustainability'}
                onToggle={() => setAccordionOpen(accordionOpen === 'sustainability' ? null : 'sustainability')}
              >
                <ul className="text-left space-y-2">
                  {SUSTAINABILITY_ITEMS.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-[11px] leading-relaxed text-gray-600">
                      <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-500" aria-hidden>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </AccordionItem>
              <AccordionItem
                id="shipping"
                title="SHIPPING & RETURNS"
                isOpen={accordionOpen === 'shipping'}
                onToggle={() => setAccordionOpen(accordionOpen === 'shipping' ? null : 'shipping')}
              >
                <p className="text-left text-[11px] leading-relaxed text-gray-600 whitespace-pre-wrap">
                  {SHIPPING_RETURNS_TEXT}
                </p>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
