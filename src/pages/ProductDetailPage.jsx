import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '../store/CartContext';
import { useWishlist } from '../store/WishlistContext';
import { useProducts } from '../hooks/useProducts';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { formatPrice } from '../lib/formatPrice';
import { isSoldOut, getStockQuantity } from '../lib/productStock';
import { parseDescription } from '../lib/descriptionSections';
import { getAbsoluteUrl } from '../lib/getAbsoluteUrl';
import { publicTable, supabase } from '../lib/supabase';
import { useAuth } from '../store/AuthContext';

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
    <div
      className="border-b border-[#EAE5DD] bg-[#FAF9F6]/50 first:border-t first:border-[#EAE5DD]"
      role="region"
      aria-labelledby={`accordion-${id}-head`}
    >
      <button
        id={`accordion-${id}-head`}
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={isOpen}
        aria-controls={`accordion-${id}-panel`}
      >
        <span className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#333333]">{title}</span>
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
            <div className="pb-5 pr-2">
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

const SKIN_TYPES = ['건성', '지성', '복합성', '수부지', '민감성'];
const SKIN_CONCERNS = ['보습', '진정', '트러블', '미백', '탄력', '항산화', '세안'];
const REVIEW_SORT_OPTIONS = [
  { key: 'recommended', label: '추천순' },
  { key: 'latest', label: '최신순' },
  { key: 'ratingHigh', label: '별점 높은순' },
];

const REVIEW_PHOTOS_BUCKET = 'product-images';
const REVIEW_PHOTOS_PREFIX = 'review-photos';

async function uploadReviewPhotos(files, userId) {
  const urls = [];
  const ts = Date.now();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file || !(file instanceof File)) continue;
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const safeExt = ['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    const path = `${REVIEW_PHOTOS_PREFIX}/${userId}_${ts}_${i}.${safeExt}`;
    const { data, error } = await supabase.storage.from(REVIEW_PHOTOS_BUCKET).upload(path, file, { upsert: false });
    if (error) throw new Error(error.message || '사진 업로드 실패');
    const { data: urlData } = supabase.storage.from(REVIEW_PHOTOS_BUCKET).getPublicUrl(data.path);
    if (urlData?.publicUrl) urls.push(urlData.publicUrl);
  }
  return urls;
}

const formatDateDot = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

const formatDateShort = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

function ReviewItem({ review, currentUserId, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const rating = review.rating || 0;
  const content = review.content || '';
  const photoUrls = (() => {
    const raw = review?.photo_url;
    if (raw == null || raw === '') return [];
    if (Array.isArray(raw)) {
      return raw
        .filter((u) => u != null && typeof u === 'string' && u.trim().length > 0)
        .map((u) => u.trim());
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((u) => u != null && typeof u === 'string' && u.trim().length > 0)
            .map((u) => u.trim());
        }
        return trimmed.startsWith('http') ? [trimmed] : [];
      } catch {
        return trimmed.startsWith('http') ? [trimmed] : [];
      }
    }
    return [];
  })();
  const hasMorePhotos = photoUrls.length > 4;
  const displayPhotos = photoUrls.slice(0, 4);
  const overflowCount = Math.max(0, photoUrls.length - 4);
  const isOwner = currentUserId && String(review.user_id) === String(currentUserId);

  return (
    <article className="border border-[#E8E4DF] bg-white/40 p-4 md:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6">
      {/* 좌측: 프로필, 이름, 작성일 */}
      <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1.5 flex-shrink-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#EDEAE4] flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#7A6B63]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className="flex flex-col items-start min-w-0">
          <span className="text-[11px] font-medium text-[#3E2F28]">***</span>
          <span className="text-[10px] text-[#999999]">{formatDateShort(review.created_at)} 작성</span>
        </div>
      </div>

      {/* 우측: 별점, 본문, 사진 갤러리 */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <span className="flex text-[14px] text-[#A8B894]" aria-label={`별점 ${rating}점`}>
            {'★'.repeat(rating)}
            <span className="text-[#E0D8C4]">{'☆'.repeat(Math.max(0, 5 - rating))}</span>
          </span>
          {isOwner && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button type="button" onClick={() => onEdit(review)} className="text-[10px] tracking-[0.08em] uppercase text-[#5C4A42] hover:text-[#3E2F28] border-b border-transparent hover:border-[#A8B894]">
                수정
              </button>
              <button type="button" onClick={() => onDelete(review)} className="text-[10px] tracking-[0.08em] uppercase text-[#7A6B63] hover:text-[#3E2F28] border-b border-transparent hover:border-[#A8B894]">
                삭제
              </button>
            </div>
          )}
        </div>

        {content && (
          <div className="mt-0.5">
            <div
              className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
                expanded ? 'max-h-[2000px]' : 'max-h-[4.5rem]'
              }`}
            >
              <p
                className={`text-[11px] leading-relaxed text-[#5C4A42] whitespace-pre-wrap ${
                  expanded ? '' : 'line-clamp-3'
                }`}
              >
                {content}
              </p>
            </div>
            {!expanded && (content.split(/\n/).length > 3 || content.length > 120) ? (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="mt-1 text-[10px] text-[#5C4A42] hover:text-[#3E2F28] tracking-[0.06em] flex items-center gap-0.5"
              >
                더보기 <span className="text-[8px]">∨</span>
              </button>
            ) : null}
          </div>
        )}

        {photoUrls != null && photoUrls.length > 0 && displayPhotos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {displayPhotos.map((url, idx) => {
              const src = typeof url === 'string' && url.trim().length > 0 ? url.trim() : null;
              if (!src) return null;
              return (
                <div key={`${idx}-${src.slice(-20)}`} className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0 bg-[#EDEAE4]">
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                  {hasMorePhotos && idx === 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-[12px] font-medium">+{overflowCount}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}

const ProductDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addRecentlyViewed } = useRecentlyViewed();
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addQty, setAddQty] = useState(1);
  const [accordionOpen, setAccordionOpen] = useState(null);
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'qa'
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    skinType: '',
    content: '',
    photos: [],
  });
  const [reviewPhotoPreviewUrls, setReviewPhotoPreviewUrls] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [qaItems, setQaItems] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingQa, setLoadingQa] = useState(false);
  const [reviewSort, setReviewSort] = useState('recommended');
  const [filterRating, setFilterRating] = useState('');
  const [filterSkinType, setFilterSkinType] = useState('');
  const [filterSkinConcern, setFilterSkinConcern] = useState('');
  const reviewsSectionRef = useRef(null);

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

  // Supabase에서 리뷰 / Q&A 불러오기
  useEffect(() => {
    if (!product?.id) return;
    const productId = String(product.id);

    const fetchData = async () => {
      try {
        setLoadingReviews(true);
        setLoadingQa(true);
        const [{ data: revData }, { data: qaData }] = await Promise.all([
          publicTable('product_reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false }),
          publicTable('product_questions')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false }),
        ]);
        setReviews(revData || []);
        setQaItems(qaData || []);
      } catch (e) {
        if (import.meta.env.DEV) console.error('리뷰/Q&A 불러오기 오류:', e);
      } finally {
        setLoadingReviews(false);
        setLoadingQa(false);
      }
    };

    fetchData();
  }, [product?.id]);

  useEffect(() => {
    const files = reviewForm.photos || [];
    const urls = files.map((f) => URL.createObjectURL(f));
    setReviewPhotoPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [reviewForm.photos]);

  const reviewStats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { average: 0, total: 0 };
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return { average: Math.round((sum / total) * 10) / 10, total };
  }, [reviews]);

  const filteredAndSortedReviews = useMemo(() => {
    let list = [...reviews];
    if (filterRating) {
      const r = Number(filterRating);
      list = list.filter((rev) => (rev.rating || 0) === r);
    }
    if (filterSkinType) {
      list = list.filter((rev) => (rev.skin_type || '') === filterSkinType);
    }
    if (filterSkinConcern && list.some((r) => r.skin_concern)) {
      list = list.filter((rev) => (rev.skin_concern || '') === filterSkinConcern);
    }
    if (reviewSort === 'latest') {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (reviewSort === 'ratingHigh') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return list;
  }, [reviews, reviewSort, filterRating, filterSkinType, filterSkinConcern]);

  const scrollToReviews = () => {
    reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  const productName = product.name || '상품';
  const metaDescSource = (details && details.trim().slice(0, 155)) || keyIngredients.map((k) => (typeof k === 'string' ? k : k?.name ?? String(k)).trim()).filter(Boolean).join(', ') || productName;
  const metaDescription = (metaDescSource.length > 155 ? metaDescSource.slice(0, 152) + '...' : metaDescSource) || `${productName}. 마메르(Mamère)`;
  const mainImageForMeta = imageList[0]?.url || product.image;
  const absoluteImageUrl = mainImageForMeta ? getAbsoluteUrl(mainImageForMeta) : '';
  const canonicalUrl = getAbsoluteUrl(location.pathname);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    description: metaDescription,
    brand: { '@type': 'Brand', name: 'Mamère' },
    image: (imageList.length ? imageList.map((i) => getAbsoluteUrl(i.url)).filter(Boolean) : absoluteImageUrl ? [absoluteImageUrl] : []),
    offers: {
      '@type': 'Offer',
      price: product.price ?? 0,
      priceCurrency: 'KRW',
      availability: soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: canonicalUrl,
    },
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] pt-20 md:pt-24 pb-16 antialiased text-[#3E2F28]">
      <Helmet>
        <title>{productName}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${productName} | 마메르(Mamère)`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {absoluteImageUrl && <meta property="og:image" content={absoluteImageUrl} />}
        <meta property="og:site_name" content="마메르(Mamère)" />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      </Helmet>
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
                      alt={idx === 0 ? `${product.name} 정면 패키지` : `${product.name} 상세 이미지 ${idx + 1}`}
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
                    <img src={img.url} alt={`${product.name} 상세 이미지 ${idx + 1} 썸네일`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 구매 정보 박스 (이미지 두 번째 조각쯤·약 200px 아래부터 시작, 스티키로 스크롤 시 따라옴) */}
          <div className="flex flex-col w-full max-w-[380px] mx-auto md:mx-0 md:pt-16 md:sticky md:top-[50px] md:h-fit md:max-h-[calc(100vh-100px)] md:overflow-y-auto md:overscroll-contain md:pb-20 md:scrollbar-hide px-5 py-5 md:px-6 md:py-6 border border-[#E8E4DF] rounded-sm shadow-[0_2px_12px_rgba(62,47,40,0.06)] bg-[#FAF9F6]">
            <h1 className="font-serif text-2xl font-normal leading-snug tracking-[0.06em] text-[#333333] md:text-[1.65rem]">
              {product.name}
            </h1>
            {volume && (
              <p className="mt-2 text-[10px] font-light tracking-[0.1em] text-[#5C4A42]">{volume}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
              <p className="font-serif text-2xl font-normal tracking-[0.06em] text-[#333333]">
                {formatPrice(product.price)}
              </p>
              {reviewStats.total > 0 && (
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="flex items-center gap-1.5 text-[10px] font-light tracking-[0.08em] text-[#5C4A42] hover:text-[#3E2F28] transition-colors"
                >
                  <span className="text-[#D9B26C]" aria-hidden>★</span>
                  <span>{reviewStats.average}</span>
                  <span className="text-[#7A6B63]">리뷰 {reviewStats.total.toLocaleString()}</span>
                </button>
              )}
            </div>
            {!soldOut && maxQty > 0 && (
              <div className="mt-8 flex items-center gap-3">
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
            <div className="mt-10">
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

        {/* 상품 후기 / Q&A 탭 섹션 */}
        <section ref={reviewsSectionRef} className="mt-16 md:mt-20 border-t border-[#E8E4DF] pt-10 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex border-b border-[#E8E4DF]">
              {[
                { key: 'reviews', label: '상품 후기' },
                { key: 'qa', label: 'Q&A' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-[10px] font-medium tracking-[0.16em] uppercase transition-colors ${
                    activeTab === tab.key
                      ? 'text-[#3E2F28] border-b-2 border-[#A8B894] -mb-[2px]'
                      : 'text-[#7A6B63] hover:text-[#3E2F28]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingReviewId(null);
                setReviewForm({ rating: 0, skinType: '', content: '', photos: [] });
                setIsReviewModalOpen(true);
              }}
              className="px-4 py-2 text-[10px] font-medium tracking-[0.16em] uppercase bg-[#3E2F28] text-[#F9F7F2] hover:bg-black transition-colors"
            >
              리뷰 작성하기
            </button>
          </div>

          {/* 리뷰 탭: 헤더(총 개수 + 정렬) + 필터 + 목록 */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-sm md:text-base font-semibold tracking-[0.08em] text-[#3E2F28]">
                  리뷰 {reviewStats.total.toLocaleString()}
                </h2>
                <div className="flex items-center gap-2">
                  {REVIEW_SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setReviewSort(opt.key)}
                      className={`px-3 py-1.5 text-[10px] font-medium tracking-[0.12em] uppercase transition-colors ${
                        reviewSort === opt.key
                          ? 'text-[#3E2F28] border-b border-[#A8B894]'
                          : 'text-[#7A6B63] hover:text-[#3E2F28]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="border border-[#E8E4DF] bg-[#F9F7F2] px-3 py-2 text-[11px] text-[#3E2F28] outline-none focus:border-[#A8B894] min-w-[100px]"
                >
                  <option value="">별점</option>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={String(n)}>{n}점</option>
                  ))}
                </select>
                <select
                  value={filterSkinType}
                  onChange={(e) => setFilterSkinType(e.target.value)}
                  className="border border-[#E8E4DF] bg-[#F9F7F2] px-3 py-2 text-[11px] text-[#3E2F28] outline-none focus:border-[#A8B894] min-w-[100px]"
                >
                  <option value="">피부 타입</option>
                  {SKIN_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select
                  value={filterSkinConcern}
                  onChange={(e) => setFilterSkinConcern(e.target.value)}
                  className="border border-[#E8E4DF] bg-[#F9F7F2] px-3 py-2 text-[11px] text-[#3E2F28] outline-none focus:border-[#A8B894] min-w-[100px]"
                >
                  <option value="">피부고민</option>
                  {SKIN_CONCERNS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {loadingReviews && (
                <p className="text-[11px] text-[#7A6B63]">후기를 불러오는 중입니다…</p>
              )}
              {!loadingReviews && filteredAndSortedReviews.length === 0 && (
                <p className="text-[11px] text-[#7A6B63]">
                  {reviews.length === 0 ? '아직 등록된 후기가 없습니다.' : '조건에 맞는 후기가 없습니다.'}
                </p>
              )}
              {!loadingReviews &&
                filteredAndSortedReviews.map((rev) => (
                  <ReviewItem
                    key={rev.id}
                    review={rev}
                    currentUserId={user?.id}
                    onEdit={(r) => {
                      setReviewForm({
                        rating: r.rating || 0,
                        skinType: r.skin_type || '',
                        content: r.content || '',
                        photos: [],
                      });
                      setEditingReviewId(r.id);
                      setIsReviewModalOpen(true);
                    }}
                    onDelete={async (r) => {
                      if (!window.confirm('이 리뷰를 삭제할까요?')) return;
                      const deletedId = r.id;
                      const prevReviews = reviews;
                      setReviews((prev) => prev.filter((item) => String(item.id) !== String(deletedId)));
                      try {
                        const { data: deletedRows, error: delError } = await publicTable('product_reviews')
                          .delete()
                          .eq('id', deletedId)
                          .select('id');
                        if (delError) {
                          if (import.meta.env.DEV) console.error('리뷰 삭제 오류:', delError);
                          toast.error('리뷰 삭제에 실패했습니다. 로그인 상태를 확인해 주세요.');
                          setReviews(prevReviews);
                          return;
                        }
                        if (!deletedRows || deletedRows.length === 0) {
                          toast.error('삭제할 수 없습니다. 권한이 없거나 이미 삭제된 리뷰일 수 있습니다.');
                          setReviews(prevReviews);
                          return;
                        }
                        const { data: revData } = await publicTable('product_reviews')
                          .select('*')
                          .eq('product_id', String(product.id))
                          .order('created_at', { ascending: false });
                        setReviews(revData ?? []);
                        toast.success('리뷰가 삭제되었습니다.');
                      } catch (err) {
                        if (import.meta.env.DEV) console.error('리뷰 삭제 예외:', err);
                        toast.error('리뷰 삭제 중 오류가 발생했습니다.');
                        setReviews(prevReviews);
                      }
                    }}
                  />
                ))}
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="space-y-4">
              {loadingQa && (
                <p className="text-[11px] text-[#7A6B63]">Q&A를 불러오는 중입니다…</p>
              )}
              {!loadingQa && qaItems.length === 0 && (
                <p className="text-[11px] text-[#7A6B63]">등록된 Q&A가 없습니다.</p>
              )}
              {!loadingQa &&
                qaItems.map((qa) => (
                  <div
                    key={qa.id}
                    className="border border-[#E8E4DF] bg-white/40 p-4 md:p-5 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#3E2F28]">
                        {qa.title || '문의'}
                      </span>
                      <span className="text-[10px] text-[#999999]">
                        {formatDateDot(qa.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C4A42] whitespace-pre-wrap">
                      {qa.content}
                    </p>
                    {qa.answer && (
                      <div className="mt-2 border-t border-dashed border-[#E8E4DF] pt-2">
                        <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#5C4A42] mb-1">
                          Answer
                        </p>
                        <p className="text-[11px] text-[#5C4A42] whitespace-pre-wrap">
                          {qa.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* 페이지 맨 하단: 쇼핑으로 돌아가기 */}
        <div className="mt-16 md:mt-20 flex justify-center">
          <Link
            to="/shop"
            className="text-[10px] tracking-[0.12em] uppercase text-[#5C4A42] border-b border-[#A8B894] hover:text-[#3E2F28] transition-colors"
          >
            쇼핑으로 돌아가기
          </Link>
        </div>
      </div>

      {/* 리뷰 작성 모달 */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md bg-[#F9F7F2] border border-[#E8E4DF] shadow-xl p-6 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-medium tracking-[0.16em] uppercase text-[#3E2F28]">
                  {editingReviewId ? '리뷰 수정' : '상품 후기 작성'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setEditingReviewId(null);
                    setReviewForm({ rating: 0, skinType: '', content: '', photos: [] });
                  }}
                  className="w-8 h-8 flex items-center justify-center text-[#7A6B63] hover:text-[#3E2F28]"
                  aria-label="닫기"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user?.id) {
                    toast.error('리뷰 작성은 로그인 후 이용해 주세요.');
                    return;
                  }
                  try {
                    let photoUrlValue = null;
                    const photos = reviewForm.photos || [];
                    if (photos.length > 0) {
                      try {
                        const uploadedUrls = await uploadReviewPhotos(photos, user.id);
                        photoUrlValue = uploadedUrls.length > 0 ? JSON.stringify(uploadedUrls) : null;
                      } catch (upErr) {
                        if (import.meta.env.DEV) console.error('리뷰 사진 업로드 오류:', upErr);
                        toast.error(upErr?.message || '사진 업로드에 실패했습니다. Storage 정책을 확인해 주세요.');
                        return;
                      }
                    } else if (editingReviewId) {
                      const existing = reviews.find((r) => String(r.id) === String(editingReviewId));
                      if (existing?.photo_url != null) photoUrlValue = existing.photo_url;
                    }
                    const payload = {
                      rating: reviewForm.rating,
                      skin_type: reviewForm.skinType,
                      content: reviewForm.content.trim(),
                      photo_url: photoUrlValue,
                    };
                    if (editingReviewId) {
                      const { error: updateError } = await publicTable('product_reviews')
                        .update(payload)
                        .eq('id', editingReviewId);
                      if (updateError) {
                        if (import.meta.env.DEV) console.error('리뷰 수정 오류:', updateError);
                        toast.error('리뷰 수정에 실패했습니다.');
                        return;
                      }
                      setReviews((prev) =>
                        prev.map((r) =>
                          r.id === editingReviewId
                            ? { ...r, ...payload }
                            : r
                        )
                      );
                      toast.success('리뷰가 수정되었습니다.');
                    } else {
                      const { error: insertError } = await publicTable('product_reviews').insert({
                        ...payload,
                        product_id: String(product.id),
                        user_id: user.id,
                      });
                      if (insertError) {
                        if (import.meta.env.DEV) console.error('리뷰 저장 오류:', insertError);
                        toast.error('리뷰 저장 중 오류가 발생했습니다.');
                        return;
                      }
                      const { data: revData } = await publicTable('product_reviews')
                        .select('*')
                        .eq('product_id', String(product.id))
                        .order('created_at', { ascending: false });
                      setReviews(revData || []);
                      toast.success('리뷰가 저장되었습니다.');
                    }
                    setIsReviewModalOpen(false);
                    setEditingReviewId(null);
                    setReviewForm({ rating: 0, skinType: '', content: '', photos: [] });
                  } catch (err) {
                    if (import.meta.env.DEV) console.error('리뷰 저장/수정 예외:', err);
                    toast.error(editingReviewId ? '리뷰 수정 중 오류가 발생했습니다.' : '리뷰 저장 중 알 수 없는 오류가 발생했습니다.');
                  }
                }}
              >
                {/* 별점 입력 */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#5C4A42] mb-2">
                    별점
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                        className="text-2xl"
                        aria-label={`${star}점`}
                      >
                        <span className={reviewForm.rating >= star ? 'text-[#D9B26C]' : 'text-[#E0D8C4]'}>
                          ★
                        </span>
                      </button>
                    ))}
                    {reviewForm.rating > 0 && (
                      <span className="ml-2 text-[11px] text-[#5C4A42]">
                        {reviewForm.rating} / 5
                      </span>
                    )}
                  </div>
                </div>

                {/* 피부 타입 선택 */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#5C4A42] mb-2">
                    피부 타입
                  </label>
                  <select
                    className="w-full border border-[#E8E4DF] bg-white px-3 py-2 text-[11px] text-[#3E2F28] outline-none focus:border-[#A8B894]"
                    value={reviewForm.skinType}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, skinType: e.target.value }))}
                    required
                  >
                    <option value="">선택해 주세요</option>
                    {SKIN_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 리뷰 텍스트 */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#5C4A42] mb-2">
                    리뷰 내용
                  </label>
                  <textarea
                    className="w-full border border-[#E8E4DF] bg-white px-3 py-2 text-[11px] text-[#3E2F28] outline-none focus:border-[#A8B894] min-h-[120px] resize-y"
                    value={reviewForm.content}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="제품을 사용해 보신 후 느낌을 자유롭게 남겨 주세요."
                    required
                  />
                </div>

                {/* 사진 첨부 (드래그 앤 드롭, 최대 10장) */}
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#5C4A42] mb-2">
                    사진 첨부 (선택, 최대 10장)
                  </label>
                  <div
                    className="border-2 border-dashed border-[#E8E4DF] bg-[#F9F7F2] rounded-sm p-6 text-center transition-colors hover:border-[#A8B894]/60"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
                      setReviewForm((prev) => {
                        const next = [...(prev.photos || []), ...files].slice(0, 10);
                        return { ...prev, photos: next };
                      });
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []).slice(0, 10);
                        setReviewForm((prev) => {
                          const next = [...(prev.photos || []), ...files].slice(0, 10);
                          return { ...prev, photos: next };
                        });
                      }}
                      className="sr-only"
                      id="review-photos"
                    />
                    <label htmlFor="review-photos" className="cursor-pointer block">
                      <span className="text-[11px] text-[#5C4A42]">
                        클릭하거나 사진을 여기에 드래그해 주세요 (최대 10장)
                      </span>
                    </label>
                  </div>
                  {reviewPhotoPreviewUrls.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {reviewPhotoPreviewUrls.map((url, idx) => (
                        <div key={url} className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-[#EDEAE4] border border-[#E8E4DF]">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setReviewForm((prev) => ({
                                ...prev,
                                photos: (prev.photos || []).filter((_, i) => i !== idx),
                              }));
                            }}
                            className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-black/50 text-white text-[10px] hover:bg-black/70"
                            aria-label="이 사진 제거"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <p className="self-center text-[10px] text-[#7A6B63]">
                        {reviewForm.photos?.length}장
                        {reviewForm.photos?.length >= 10 && ' (최대)'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReviewModalOpen(false);
                      setEditingReviewId(null);
                      setReviewForm({ rating: 0, skinType: '', content: '', photos: [] });
                    }}
                    className="px-4 py-2 text-[10px] tracking-[0.12em] uppercase border border-[#E8E4DF] text-[#5C4A42] hover:bg-[#F1EFEB]"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-[10px] font-medium tracking-[0.16em] uppercase bg-[#3E2F28] text-[#F9F7F2] hover:bg-black transition-colors"
                  >
                    제출하기
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;
