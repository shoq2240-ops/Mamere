import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Cropper from 'react-easy-crop';
import { supabase, publicTable } from '../lib/supabase';
import { useAuth } from '../store/AuthContext';
import { parseDescription, serializeDescription } from '../lib/descriptionSections';
import { isSoldOut } from '../lib/productStock';
import { resizeAndCompressImage } from '../lib/imageOptimize';

// Supabase Storage 버킷 이름 (Dashboard > Storage에서 해당 이름으로 버킷 생성 필요)
// 버킷이 없으면 업로드 시 data가 null로 반환되어 "Cannot read properties of null (reading 'path')" 발생
const STORAGE_BUCKET = 'product-images';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/** 폼 검증 한계 (관리자 상품 등록) */
const FORM_LIMITS = {
  nameMaxLength: 200,
  priceMax: 99_999_999,
  descDetailsMaxLength: 5000,
  descHowToUseMaxLength: 3000,
  volumeMaxLength: 50,
  keyIngredientsMaxLength: 500,
  categoryValues: ['skincare', 'body_hair'],
};

/** products 관련 Supabase 에러 → 사용자 안내 메시지 */
const productErrorMessage = (err) => {
  const msg = err?.message || '';
  if (/could not find the .* column|schema cache/i.test(msg)) {
    return 'products 테이블에 필요한 컬럼이 없습니다. Supabase Dashboard > SQL Editor에서 프로젝트 루트의 supabase-products-columns-sync.sql 파일 내용을 실행해 주세요. (한 번만 실행하면 됩니다.)';
  }
  if (/row-level security policy|violates row-level security/i.test(msg)) {
    // Storage(objects) RLS 실패면 Storage 안내, products 테이블이면 관리자 안내
    if (/table\s+["']?objects["']?|storage|bucket/i.test(msg)) {
      return '이미지 업로드 권한이 없습니다. Supabase Dashboard > Storage > product-images 버킷 > Policies에서 authenticated 사용자의 INSERT를 허용하는 정책을 추가하세요.';
    }
    if (/table\s+["']?products["']?/i.test(msg) || !/objects|storage|bucket/i.test(msg)) {
      return '상품 등록 권한이 없습니다. 현재 로그인한 계정 ID가 Supabase profiles의 is_admin=true인 계정과 같은지 확인하세요. (아래 "현재 로그인" ID와 profiles.id가 일치해야 합니다.) 그래도 안 되면 supabase-products-allow-authenticated.sql 을 실행해 로그인 사용자 모두 허용할 수 있습니다.';
    }
    return msg || '요청에 실패했습니다.';
  }
  return msg || '요청에 실패했습니다.';
};

const CATEGORIES = [
  { value: 'skincare', label: 'Skincare' },
  { value: 'body_hair', label: 'Body & Hair' },
];

const SKIN_TYPES = ['건성', '지성', '복합성', '민감성'];
const SKIN_CONCERNS = ['보습', '진정', '트러블', '미백', '탄력'];

/** DB에 best / makeup가 남아 있으면 폼에서는 스킨케어로 표시·저장 유도 */
const normalizeCategoryForForm = (c) => {
  if (!c || c === 'best' || c === 'makeup') return 'skincare';
  return FORM_LIMITS.categoryValues.includes(c) ? c : 'skincare';
};

const getCategoryLabel = (val) => {
  if (!val || val.trim() === '') return '—';
  if (val === 'best') return 'Best (레거시)';
  if (val === 'makeup') return 'Makeup (레거시)';
  const found = CATEGORIES.find((c) => c.value === val);
  return found ? found.label : val;
};

const createImageId = () => `img-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** react-easy-crop용: crop 영역으로 이미지 blob 생성 */
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function SortableThumb({ item, onDelete, onSetMain, onSetHover, onCrop, isMain, isHover }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative w-24 h-28 flex-shrink-0 rounded overflow-hidden border-2 bg-[#E8E8E8] ${
        isMain ? 'border-[#000000] ring-2 ring-[#000000]/20' : 'border-[#DDDDDD]'
      } ${isDragging ? 'z-10 opacity-90 shadow-lg' : ''}`}
    >
      <img
        src={item.url}
        alt={isMain ? '대표 이미지 미리보기' : '상품 이미지 미리보기'}
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
      {item.progress !== undefined && item.progress < 100 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">{item.progress}%</span>
        </div>
      )}
      {isHover && (
        <div className="absolute top-0 left-0 bg-[#000000]/80 text-[8px] text-white px-1.5 py-0.5 font-medium">
          호버
        </div>
      )}
      {isMain && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#000000] text-[9px] text-white text-center py-0.5 font-medium">
          대표
        </div>
      )}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSetHover(item.id); }}
        className="absolute bottom-6 left-0 right-0 py-0.5 bg-black/50 text-[8px] text-white text-center hover:bg-black/80"
      >
        호버로
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item.id); }}
        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
        aria-label="삭제"
      >
        ×
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSetMain(item.id); }}
        className="absolute bottom-6 left-0 right-0 py-0.5 bg-black/60 text-[8px] text-white text-center hover:bg-black/80"
      >
        대표로
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCrop(item); }}
        className="absolute left-0.5 top-0.5 px-1.5 py-0.5 bg-black/60 text-[8px] text-white hover:bg-black/80"
      >
        편집
      </button>
      <div
        {...attributes}
        {...listeners}
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded bg-white/80 flex items-center justify-center cursor-grab active:cursor-grabbing text-[10px]"
        aria-label="드래그하여 순서 변경"
      >
        ⋮⋮
      </div>
    </div>
  );
}

const AdminUploadPage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    price: '',
    descDetails: '',
    descHowToUse: '',
    category: 'skincare',
    volume: '',
    skinType: [],
    skinConcern: [],
    keyIngredients: '',
    imageList: [],
    stockQuantity: 0,
    isManualSoldout: false,
    cardMainImageId: null,
    cardHoverImageId: null,
  });

  const thumbnailInputRef = useRef(null);
  const hoverInputRef = useRef(null);

  const [cropState, setCropState] = useState({
    open: false,
    index: -1,
    url: '',
    itemId: null,
  });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, err } = await publicTable('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw err;
      setProducts(data ?? []);
    } catch (err) {
      setError(productErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchProducts();
  }, [isLoggedIn]);

  const uploadImageToStorage = useCallback(async (file, onProgress) => {
    if (!file || !(file instanceof File)) {
      console.error('[AdminUpload] uploadImageToStorage: file 없음 또는 File 객체 아님', { file });
      throw new Error('유효한 파일을 선택해주세요.');
    }
    if (file.size <= 0) {
      console.error('[AdminUpload] uploadImageToStorage: 파일 크기 0', { name: file.name, size: file.size });
      throw new Error('빈 파일은 업로드할 수 없습니다.');
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('허용된 이미지 형식만 업로드 가능합니다. (JPEG, PNG, WebP, GIF)');
    }

    onProgress?.(10);
    const optimized = await resizeAndCompressImage(file);
    onProgress?.(50);
    const ext = optimized.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;

    console.log('[AdminUpload] 업로드 시도 직전', {
      bucket: STORAGE_BUCKET,
      fileName,
      fileSize: optimized?.size,
      fileType: optimized?.type,
    });

    const { data, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, optimized, { upsert: false });

    console.log('[AdminUpload] 업로드 시도 직후', {
      data,
      error: uploadError,
      hasDataPath: !!data?.path,
    });

    onProgress?.(100);

    if (uploadError) {
      const msg = uploadError.message || '';
      const isBucketMissing = /bucket|not found|does not exist/i.test(msg) || uploadError.name === 'StorageApiError';
      throw new Error(
        isBucketMissing
          ? `Storage 버킷 "${STORAGE_BUCKET}"을(를) 찾을 수 없습니다. Supabase Dashboard > Storage에서 "${STORAGE_BUCKET}" 버킷을 생성한 뒤 다시 시도해 주세요.`
          : `업로드 실패: ${msg}`
      );
    }

    if (!data || typeof data.path !== 'string') {
      console.error('[AdminUpload] 업로드 응답 data.path 없음', { data, uploadError });
      throw new Error(
        `Storage 버킷 "${STORAGE_BUCKET}"이 없거나 응답이 비어 있습니다. Supabase Dashboard > Storage에서 "${STORAGE_BUCKET}" 버킷을 생성해 주세요.`
      );
    }

    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
    return urlData?.publicUrl ?? data.path;
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    setError('');
    const newItems = acceptedFiles.map((file, i) => {
      const id = createImageId();
      const url = URL.createObjectURL(file);
      const list = form.imageList;
      const isFirst = list.length === 0 && i === 0;
      return {
        id,
        url,
        file,
        progress: undefined,
        isMain: isFirst,
        priority: list.length + i,
      };
    });
    setForm((prev) => {
      const list = [...prev.imageList];
      if (list.length === 0 && newItems.length > 0) newItems[0].isMain = true;
      const merged = [...list, ...newItems].map((item, idx) => ({ ...item, priority: idx }));
      return { ...prev, imageList: merged };
    });
  }, [form.imageList]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
    maxSize: MAX_IMAGE_BYTES,
    multiple: true,
    disabled: submitting,
  });

  const handleDeleteImage = useCallback((id) => {
    setForm((prev) => {
      const list = prev.imageList.filter((item) => item.id !== id);
      const deleted = prev.imageList.find((item) => item.id === id);
      if (deleted?.isMain && list.length > 0) list[0].isMain = true;
      return { ...prev, imageList: list.map((item, i) => ({ ...item, priority: i })) };
    });
  }, []);

  const handleSetMain = useCallback((id) => {
    setForm((prev) => ({
      ...prev,
      imageList: prev.imageList.map((item) => ({
        ...item,
        isMain: item.id === id,
        priority: item.priority,
      })),
      cardMainImageId: id,
    }));
  }, []);

  const handleSetHover = useCallback((id) => {
    setForm((prev) => ({
      ...prev,
      cardHoverImageId: id,
    }));
  }, []);

  const handleCropOpen = useCallback((item) => {
    setCropState({ open: true, index: form.imageList.findIndex((i) => i.id === item.id), url: item.url, itemId: item.id });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [form.imageList]);

  const onCropComplete = useCallback((_, croppedAreaPx) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleCropSave = useCallback(async () => {
    if (!cropState.url || !croppedAreaPixels) {
      setCropState((s) => ({ ...s, open: false }));
      return;
    }
    try {
      const blob = await getCroppedImg(cropState.url, croppedAreaPixels);
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
      const newUrl = URL.createObjectURL(blob);
      setForm((prev) => ({
        ...prev,
        imageList: prev.imageList.map((item) =>
          item.id === cropState.itemId
            ? { ...item, url: newUrl, file, progress: undefined }
            : item
        ),
      }));
    } catch (e) {
      setError(e?.message || '크롭 저장 실패');
    }
    setCropState({ open: false, index: -1, url: '', itemId: null });
  }, [cropState.url, cropState.itemId, croppedAreaPixels]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setForm((prev) => {
      const list = [...prev.imageList];
      const oldIndex = list.findIndex((i) => i.id === active.id);
      const newIndex = list.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const reordered = arrayMove(list, oldIndex, newIndex).map((item, i) => ({ ...item, priority: i }));
      return { ...prev, imageList: reordered };
    });
  }, []);

  const getMainImageUrl = useCallback(() => {
    const main = form.imageList.find((i) => i.isMain);
    return main?.url ?? form.imageList[0]?.url ?? null;
  }, [form.imageList]);

  const addOrReplaceThumbnailFromFile = useCallback((file) => {
    const newUrl = URL.createObjectURL(file);
    setForm((prev) => {
      const list = [...prev.imageList];
      const currentMainId = prev.cardMainImageId || list.find((i) => i.isMain)?.id || null;
      if (currentMainId) {
        const idx = list.findIndex((i) => i.id === currentMainId);
        if (idx !== -1) {
          list[idx] = { ...list[idx], url: newUrl, file, progress: undefined };
        }
        return {
          ...prev,
          imageList: list.map((item) => ({ ...item, isMain: item.id === currentMainId })),
          cardMainImageId: currentMainId,
        };
      }
      const id = createImageId();
      const newList = [
        { id, url: newUrl, file, progress: undefined, isMain: true, priority: 0 },
        ...list.map((item, idx) => ({ ...item, priority: idx + 1 })),
      ];
      return {
        ...prev,
        imageList: newList,
        cardMainImageId: id,
      };
    });
  }, []);

  const addOrReplaceHoverFromFile = useCallback((file) => {
    const newUrl = URL.createObjectURL(file);
    setForm((prev) => {
      const list = [...prev.imageList];
      if (prev.cardHoverImageId) {
        const idx = list.findIndex((i) => i.id === prev.cardHoverImageId);
        if (idx !== -1) {
          list[idx] = { ...list[idx], url: newUrl, file, progress: undefined };
          return { ...prev, imageList: list };
        }
      }
      const id = createImageId();
      const newList = [
        ...list,
        { id, url: newUrl, file, progress: undefined, isMain: false, priority: list.length },
      ];
      return {
        ...prev,
        imageList: newList,
        cardHoverImageId: id,
      };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const name = form.name.trim();
    const price = parseInt(String(form.price).replace(/\D/g, ''), 10);

    if (!name || !price || price <= 0) {
      setError('상품명과 가격(숫자)을 입력해주세요.');
      return;
    }
    if (name.length > FORM_LIMITS.nameMaxLength) {
      setError(`상품명은 ${FORM_LIMITS.nameMaxLength}자 이내로 입력해 주세요.`);
      return;
    }
    if (price > FORM_LIMITS.priceMax) {
      setError(`가격은 ${FORM_LIMITS.priceMax.toLocaleString()}원 이하로 입력해 주세요.`);
      return;
    }
    if (!FORM_LIMITS.categoryValues.includes(form.category)) {
      setError('유효한 카테고리를 선택해 주세요. (Skincare, Body & Hair 중 하나)');
      return;
    }
    const descDetailsLen = (form.descDetails ?? '').length;
    const descHowToUseLen = (form.descHowToUse ?? '').length;
    if (descDetailsLen > FORM_LIMITS.descDetailsMaxLength) {
      setError(`상품 상세 설명은 ${FORM_LIMITS.descDetailsMaxLength}자 이내로 입력해 주세요. (현재 ${descDetailsLen}자)`);
      return;
    }
    if (descHowToUseLen > FORM_LIMITS.descHowToUseMaxLength) {
      setError(`사용 방법은 ${FORM_LIMITS.descHowToUseMaxLength}자 이내로 입력해 주세요. (현재 ${descHowToUseLen}자)`);
      return;
    }
    const volume = (form.volume ?? '').trim();
    if (volume.length > FORM_LIMITS.volumeMaxLength) {
      setError(`용량/규격은 ${FORM_LIMITS.volumeMaxLength}자 이내로 입력해 주세요.`);
      return;
    }
    const keyIngredientsLen = (form.keyIngredients ?? '').length;
    if (keyIngredientsLen > FORM_LIMITS.keyIngredientsMaxLength) {
      setError(`주요 성분은 ${FORM_LIMITS.keyIngredientsMaxLength}자 이내로 입력해 주세요. (현재 ${keyIngredientsLen}자)`);
      return;
    }

    if (form.imageList.length === 0) {
      setError('이미지를 1장 이상 추가해주세요.');
      return;
    }

    const hasValidFileToUpload = form.imageList.some(
      (item) => item?.file && item.file instanceof File && item.file.size > 0
    );
    const hasAnyUrl = form.imageList.some((item) => item?.url);
    if (!hasAnyUrl) {
      setError('이미지 URL이 없습니다. 새 이미지를 선택하거나 기존 이미지를 유지해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const prevProduct = editingId
        ? products.find((p) => p.id === editingId) || null
        : null;
      const list = [...form.imageList];
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (item?.file && item.file instanceof File && item.file.size > 0) {
          const onProgress = (p) => {
            setForm((prev) => ({
              ...prev,
              imageList: prev.imageList.map((x) =>
                x.id === item.id ? { ...x, progress: p } : x
              ),
            }));
          };
          const url = await uploadImageToStorage(item.file, onProgress);
          list[i] = { ...item, url, file: null, progress: 100 };
          setForm((prev) => ({
            ...prev,
            imageList: prev.imageList.map((x) =>
              x.id === item.id ? { ...x, url, file: null, progress: 100 } : x
            ),
          }));
        }
      }

      const mainItem = list.find((i) => i.isMain);
      const mainUrl = mainItem?.url ?? list[0]?.url;
      const cardMainItem = form.cardMainImageId
        ? list.find((item) => item.id === form.cardMainImageId)
        : mainItem;
      const cardHoverItem = form.cardHoverImageId
        ? list.find((item) => item.id === form.cardHoverImageId)
        : null;
      const cardImageUrl = cardMainItem?.url ?? null;
      const cardHoverImageUrl = cardHoverItem?.url ?? null;
      const finalList = list
        .filter((item) => {
          // 호버 전용 이미지(대표와 다른 경우)는 상세용 images 배열에서는 제외
          if (!form.cardHoverImageId) return true;
          if (form.cardHoverImageId === form.cardMainImageId) return true;
          return item.id !== form.cardHoverImageId;
        })
        .map((item, idx) => ({
          url: item.url,
          priority: idx,
          isMain: item.isMain,
        }));
      const stockQty = Math.max(0, parseInt(String(form.stockQuantity || 0).replace(/\D/g, ''), 10) || 0);

      const row = {
        name,
        price,
        description: serializeDescription(form.descDetails, form.descHowToUse),
        category: form.category,
        volume: (form.volume || '').trim() || null,
        skin_type: Array.isArray(form.skinType) ? form.skinType : [],
        skin_concern: Array.isArray(form.skinConcern) ? form.skinConcern : [],
        key_ingredients: (form.keyIngredients || '').split(/[,，]/).map((s) => s.trim()).filter(Boolean),
        image: mainUrl ?? finalList[0]?.url,
        images: finalList,
        stock_quantity: stockQty,
        is_manual_soldout: form.isManualSoldout,
        card_image: cardImageUrl,
        card_hover_image: cardHoverImageUrl,
      };

      // insert/update 시 서버가 최신 세션으로 인식하도록 세션 갱신
      await supabase.auth.getSession();

      if (editingId) {
        const { error: err } = await publicTable('products').update(row).eq('id', editingId);
        if (err) throw err;

        // 업데이트 후 더 이상 사용하지 않는 이전 이미지 정리
        if (prevProduct) {
          try {
            const prevUrls = collectProductImageUrls(prevProduct);
            const nextUrls = collectProductImageUrls({
              image: row.image,
              card_image: row.card_image,
              card_hover_image: row.card_hover_image,
              images: row.images,
            });
            const toDelete = [...prevUrls].filter((u) => u && !nextUrls.has(u));
            const paths = toDelete
              .map((u) => extractStoragePathFromUrl(u))
              .filter((p) => p);
            if (paths.length > 0) {
              const { error: removeError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .remove(paths);
              if (removeError) {
                console.error('[AdminUpload] 업데이트 시 오래된 이미지 삭제 실패:', removeError);
              }
            }
          } catch (cleanErr) {
            console.error('[AdminUpload] 업데이트 후 이미지 정리 중 오류:', cleanErr);
          }
        }

        setSuccess('상품이 수정되었습니다.');
      } else {
        const { error: err } = await publicTable('products').insert(row);
        if (err) throw err;
        setSuccess('상품이 등록되었습니다.');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error('[AdminUpload] 등록/수정 실패', err?.message, err);
      setError(productErrorMessage(err) || '등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const toArr = (v) => (Array.isArray(v) ? v : typeof v === 'string' ? (v ? [v] : []) : []);
  const handleEdit = (p) => {
    const { details, howToUse } = parseDescription(p.description);
    let images = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : p.image ? [{ url: p.image, priority: 0, isMain: true }] : [];

    // 카드 호버 이미지가 images 배열에 없다면, 편집 시 썸네일로 보여주기 위해 추가
    if (p.card_hover_image && !images.some((img) => (typeof img === 'string' ? img === p.card_hover_image : img?.url === p.card_hover_image))) {
      images = [
        ...images,
        { url: p.card_hover_image, priority: images.length, isMain: false },
      ];
    }
    const imageList = images.map((img, i) => ({
      id: createImageId(),
      url: typeof img === 'string' ? img : img.url,
      file: null,
      progress: 100,
      isMain: img.isMain === true || (i === 0 && !images.some((x) => x.isMain)),
      priority: typeof img.priority === 'number' ? img.priority : i,
    }));
    const cardMainImageId = p.card_image
      ? (imageList.find((it) => it.url === p.card_image)?.id ?? null)
      : null;
    const cardHoverImageId = p.card_hover_image
      ? (imageList.find((it) => it.url === p.card_hover_image)?.id ?? null)
      : null;
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: p.price,
      descDetails: details,
      descHowToUse: howToUse,
      category: normalizeCategoryForForm(p.category),
      volume: p.volume || '',
      skinType: toArr(p.skin_type || p.skinType),
      skinConcern: toArr(p.skin_concern || p.skinConcern),
      keyIngredients: Array.isArray(p.key_ingredients) ? p.key_ingredients.join(', ') : (p.key_ingredients || ''),
      imageList,
      stockQuantity: p.stock_quantity ?? 0,
      isManualSoldout: p.is_manual_soldout === true,
      cardMainImageId,
      cardHoverImageId,
    });
    setSuccess('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const extractStoragePathFromUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    // 이미 경로만 있는 경우
    if (!trimmed.startsWith('http')) return trimmed;
    try {
      const u = new URL(trimmed);
      const marker = `/object/public/${STORAGE_BUCKET}/`;
      const idx = u.pathname.indexOf(marker);
      if (idx === -1) return null;
      const path = u.pathname.slice(idx + marker.length);
      return decodeURIComponent(path);
    } catch (e) {
      console.error('[AdminUpload] URL 파싱 실패:', url, e);
      return null;
    }
  };

  const collectProductImageUrls = (product) => {
    const urls = new Set();
    if (!product) return urls;
    const pushUrl = (u) => {
      if (typeof u === 'string' && u.trim()) urls.add(u.trim());
    };
    pushUrl(product.image);
    pushUrl(product.card_image);
    pushUrl(product.card_hover_image);
    const imgs = Array.isArray(product.images)
      ? product.images
      : typeof product.images === 'string'
        ? (() => {
            try {
              const parsed = JSON.parse(product.images);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })()
        : [];
    imgs.forEach((img) => {
      if (!img) return;
      if (typeof img === 'string') {
        pushUrl(img);
      } else if (typeof img === 'object' && img.url) {
        pushUrl(img.url);
      }
    });
    return urls;
  };

  const handleDelete = async (id) => {
    if (!confirm('이 상품을 삭제할까요?')) return;
    try {
      // 삭제 전 기존 이미지 URL 수집
      let prevProduct = null;
      try {
        const { data } = await publicTable('products')
          .select('image, images, card_image, card_hover_image')
          .eq('id', id)
          .maybeSingle();
        prevProduct = data || null;
      } catch (e) {
        console.error('[AdminUpload] 상품 조회 실패 (삭제 전 이미지 수집)', e);
      }

      const { error: err } = await publicTable('products').delete().eq('id', id);
      if (err) throw err;

      // Storage 이미지 정리
      if (prevProduct) {
        try {
          const urls = collectProductImageUrls(prevProduct);
          const paths = [...urls]
            .map((u) => extractStoragePathFromUrl(u))
            .filter((p) => p);
          if (paths.length > 0) {
            const { error: removeError } = await supabase.storage
              .from(STORAGE_BUCKET)
              .remove(paths);
            if (removeError) {
              console.error('[AdminUpload] Storage 이미지 삭제 실패:', removeError);
            }
          }
        } catch (e) {
          console.error('[AdminUpload] Storage 이미지 정리 중 오류:', e);
        }
      }

      setSuccess('상품이 삭제되었습니다.');
      fetchProducts();
    } catch (err) {
      setError(productErrorMessage(err));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      price: '',
      descDetails: '',
      descHowToUse: '',
      category: 'skincare',
      volume: '',
      skinType: [],
      skinConcern: [],
      keyIngredients: '',
      imageList: [],
      stockQuantity: 0,
      isManualSoldout: false,
      cardMainImageId: null,
      cardHoverImageId: null,
    });
  };

  const toggleSkinType = (t) => {
    setForm((f) => ({
      ...f,
      skinType: f.skinType.includes(t) ? f.skinType.filter((x) => x !== t) : [...f.skinType, t],
    }));
  };
  const toggleSkinConcern = (c) => {
    setForm((f) => ({
      ...f,
      skinConcern: f.skinConcern.includes(c) ? f.skinConcern.filter((x) => x !== c) : [...f.skinConcern, c],
    }));
  };

  if (authLoading || !isLoggedIn) return null;

  const inputClass = 'w-full bg-white px-4 py-3.5 text-sm text-[#000000] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#000000]/20 border border-[#E0E0E0]';

  return (
    <div className="min-h-screen pt-24 pb-24 px-8 md:px-12 lg:px-16 bg-[#F5F5F5] text-[#000000]">
      <div className="max-w-4xl mx-auto">
        <div className="pb-8 mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#E0E0E0]">
          <div>
            <h1 className="text-2xl md:text-3xl font-light uppercase tracking-tight text-[#000000]">
              관리자 · 상품 등록
            </h1>
            <p className="text-[11px] tracking-[0.1em] uppercase mt-2 text-[#666666]">
              상품을 등록·수정·삭제합니다
            </p>
            {user?.id && (
              <p className="text-[10px] text-[#999999] mt-1.5 font-mono" title="Supabase profiles.id와 일치해야 상품 등록이 됩니다">
                현재 로그인: {user.email ?? user.id} · ID: {user.id}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-6">
            <Link to="/admin/orders" className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#666666] hover:text-[#000000] transition-colors">
              주문 관리 →
            </Link>
            <Link to="/admin/returns" className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#666666] hover:text-[#000000] transition-colors">
              반품/교환
            </Link>
            <Link to="/admin/users" className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#666666] hover:text-[#000000] transition-colors">
              회원 관리
            </Link>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white border border-[#E0E0E0] p-8 md:p-10 mb-14 shadow-sm"
        >
          <h2 className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#333333] mb-8">
            {editingId ? '상품 수정' : '새 상품 등록'}
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#666666] mb-2">상품명 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="상품명 입력"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#666666] mb-2">가격 (원) *</label>
              <input
                type="text"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="예: 890000"
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-medium tracking-widest uppercase text-[#666666]">상세 설명</p>
              <div>
                <label className="block text-[10px] font-medium tracking-widest uppercase text-[#555555] mb-1.5">제품 설명 (Details)</label>
                <textarea
                  value={form.descDetails}
                  onChange={(e) => setForm((f) => ({ ...f, descDetails: e.target.value }))}
                  placeholder="제품 소개, 텍스처, 사용감 등"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium tracking-widest uppercase text-[#555555] mb-1.5">사용 방법 (How to Use)</label>
                <textarea
                  value={form.descHowToUse}
                  onChange={(e) => setForm((f) => ({ ...f, descHowToUse: e.target.value }))}
                  placeholder="예: 적당량을 덜어 얼굴에 부드럽게 펴 바릅니다."
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#E8E8E8]">
              <div>
                <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#666666] mb-2">카테고리</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className={inputClass}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-white text-[#000000]">{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#666666] mb-2">용량 (volume)</label>
                <input
                  type="text"
                  value={form.volume}
                  onChange={(e) => setForm((f) => ({ ...f, volume: e.target.value }))}
                  placeholder="예: 50ml, 30g"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8E8E8]">
              <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#666666] mb-2">피부 타입 (복수 선택)</label>
              <div className="flex flex-wrap gap-2">
                {SKIN_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleSkinType(t)}
                    className={`px-3 py-1.5 text-[10px] uppercase transition-colors ${
                      form.skinType.includes(t) ? 'bg-[#000000] text-white' : 'bg-[#F0F0F0] text-[#666666] hover:bg-[#E0E0E0]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#666666] mb-2">피부 고민 (복수 선택)</label>
              <div className="flex flex-wrap gap-2">
                {SKIN_CONCERNS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleSkinConcern(c)}
                    className={`px-3 py-1.5 text-[10px] uppercase transition-colors ${
                      form.skinConcern.includes(c) ? 'bg-[#000000] text-white' : 'bg-[#F0F0F0] text-[#666666] hover:bg-[#E0E0E0]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#666666] mb-2">주요 성분 (쉼표 구분)</label>
              <input
                type="text"
                value={form.keyIngredients}
                onChange={(e) => setForm((f) => ({ ...f, keyIngredients: e.target.value }))}
                placeholder="예: 시나몬, 히알루론산, 티트리"
                className={inputClass}
              />
            </div>

            <div className="space-y-4 pt-6 mt-6 border-t border-[#E8E8E8]">
              <p className="text-[10px] font-medium tracking-widest uppercase text-[#666666]">재고 및 품절</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-medium tracking-widest uppercase text-[#555555] mb-2">재고 개수</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.stockQuantity}
                    onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
                    placeholder="0"
                    className={inputClass}
                  />
                  <p className="text-[9px] text-[#999999] mt-1">0이면 자동 품절로 표시됩니다</p>
                </div>
                <div>
                  <label className="block text-[10px] font-medium tracking-widest uppercase text-[#555555] mb-2">판매 중단 (수동 품절)</label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isManualSoldout}
                      onChange={(e) => setForm((f) => ({ ...f, isManualSoldout: e.target.checked }))}
                      className="w-4 h-4 rounded border-[#CCC] text-[#000000]"
                    />
                    <span className="text-[11px] text-[#000000]">
                      {form.isManualSoldout ? '품절 (판매 중단)' : '판매 중'}
                    </span>
                  </label>
                  <p className="text-[9px] text-[#999999] mt-1">켜면 재고와 무관하게 품절로 표시됩니다</p>
                </div>
              </div>
            </div>

            {/* 목록용 썸네일 / 호버 이미지 간단 업로드 */}
            <div className="pt-6 mt-6 border-t border-[#E8E8E8] space-y-3">
              <p className="text-[10px] font-medium tracking-widest uppercase text-[#666666]">
                상품 썸네일 및 호버 이미지 (목록용)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 대표 이미지 */}
                <div>
                  <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#555555] mb-2">
                    대표 이미지 <span className="text-red-500">*</span>
                  </p>
                  <div
                    className="relative border border-[#E0E0E0] bg-[#FAFAFA] aspect-[3/4] flex items-center justify-center cursor-pointer group overflow-hidden"
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    {getMainImageUrl() ? (
                      <>
                        <img
                          src={getMainImageUrl()}
                          alt="대표 이미지 미리보기"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setForm((prev) => ({
                              ...prev,
                              cardMainImageId: null,
                              imageList: prev.imageList.map((item) => ({ ...item, isMain: false })),
                            }));
                          }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-[11px] flex items-center justify-center hover:bg-black/80"
                          aria-label="대표 이미지 제거"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-[#999999] tracking-[0.1em] uppercase">
                        클릭하여 선택
                      </span>
                    )}
                  </div>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) addOrReplaceThumbnailFromFile(file);
                      if (e.target) e.target.value = '';
                    }}
                  />
                </div>

                {/* 호버 이미지 */}
                <div>
                  <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#555555] mb-2">
                    호버 이미지 <span className="text-[#999999]">(선택)</span>
                  </p>
                  <div
                    className="relative border border-dashed border-[#E0E0E0] bg-[#FAFAFA] aspect-[3/4] flex items-center justify-center cursor-pointer group overflow-hidden"
                    onClick={() => hoverInputRef.current?.click()}
                  >
                    {form.cardHoverImageId &&
                    form.imageList.find((i) => i.id === form.cardHoverImageId)?.url ? (
                      <>
                        <img
                          src={form.imageList.find((i) => i.id === form.cardHoverImageId)?.url}
                          alt="호버 이미지 미리보기"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setForm((prev) => {
                              const list = prev.imageList.filter(
                                (item) => item.id !== prev.cardHoverImageId,
                              );
                              return {
                                ...prev,
                                cardHoverImageId: null,
                                imageList: list.map((item, idx) => ({ ...item, priority: idx })),
                              };
                            });
                          }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-[11px] flex items-center justify-center hover:bg-black/80"
                          aria-label="호버 이미지 제거"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-[#999999] tracking-[0.1em] uppercase">
                        클릭하여 선택 (옵션)
                      </span>
                    )}
                  </div>
                  <input
                    ref={hoverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) addOrReplaceHoverFromFile(file);
                      if (e.target) e.target.value = '';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 이미지: 드롭존 + 썸네일 리스트 + DnD + 대표 + 편집 */}
            <div>
              <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#666666] mb-2">이미지 * (멀티 업로드)</label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-[#000000] bg-[#F0F0F0]' : 'border-[#DDDDDD] bg-[#FAFAFA] hover:border-[#999999]'
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-[11px] text-[#666666]">
                  {isDragActive ? '여기에 놓으세요' : '파일을 드래그하거나 클릭하여 여러 장 선택'}
                </p>
                <p className="text-[9px] text-[#999999] mt-1">
                  JPEG, PNG, WebP, GIF · 최대 {MAX_IMAGE_SIZE_MB}MB · 업로드 전 1200px 리사이즈·압축
                </p>
              </div>

              {form.imageList.length > 0 && (
                <div className="mt-4">
                  <p className="text-[9px] uppercase tracking-widest text-[#666666] mb-1">
                    썸네일 순서 변경(드래그) · \'대표로\' 클릭 시 상세 대표 이미지 · \'호버로\' 클릭 시 카드 호버 이미지 · 편집으로 자르기
                  </p>
                  <p className="text-[9px] text-[#999999] mb-2">
                    대표 이미지는 상품 상세와 카드 기본 이미지에 사용되며, \'호버\'로 표시된 이미지는 상품 카드에서 마우스 오버 시 노출됩니다.
                  </p>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={form.imageList.map((i) => i.id)}>
                      <div className="flex flex-wrap gap-3">
                        {form.imageList.map((item) => (
                          <SortableThumb
                            key={item.id}
                            item={item}
                            onDelete={handleDeleteImage}
                            onSetMain={handleSetMain}
                            onSetHover={handleSetHover}
                            onCrop={handleCropOpen}
                            isMain={item.isMain}
                            isHover={form.cardHoverImageId === item.id}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>
          </div>

          {error && <p className="mt-4 text-red-600 text-[11px]">{error}</p>}
          {success && <p className="mt-4 text-[#000000] text-[11px]">{success}</p>}

          <div className="mt-10 flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 bg-[#000000] text-white text-[11px] font-medium tracking-[0.12em] uppercase hover:bg-[#333333] disabled:opacity-50 transition-colors"
            >
              {submitting ? '처리 중...' : editingId ? '수정' : '등록'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3.5 text-[11px] font-medium tracking-[0.12em] uppercase text-[#666666] hover:text-[#000000] transition-colors border border-[#DDDDDD]"
              >
                취소
              </button>
            )}
          </div>
        </motion.form>

        {/* 상품 목록 */}
        <section className="pt-4">
          <h2 className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#333333] mb-8">등록된 상품 목록</h2>
          {loading ? (
            <p className="text-[#666666] text-sm">로딩 중...</p>
          ) : products.length === 0 ? (
            <p className="text-[#666666] text-sm">등록된 상품이 없습니다</p>
          ) : (
            <ul className="space-y-0 bg-white border border-[#E0E0E0] divide-y divide-[#E8E8E8]">
              {products.map((p) => (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-6 py-5 px-6"
                >
                  <div className="w-14 h-18 bg-[#F0F0F0] overflow-hidden flex-shrink-0 border border-[#E0E0E0]">
                    {p.image && <img src={p.image} alt={p.name ? `${p.name} 상품 이미지` : '상품 이미지'} className="w-full h-full object-cover" loading="lazy" decoding="async" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate text-[#000000]">{p.name}</p>
                      {isSoldOut(p) && (
                        <span className="flex-shrink-0 px-2 py-0.5 text-[9px] font-medium tracking-[0.12em] uppercase bg-[#E8E8E8] text-[#666666]">
                          품절
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#666666]">
                      ₩{Number(p.price).toLocaleString()} · {getCategoryLabel(p.category)}
                      {p.volume && ` · ${p.volume}`}
                      {p.stock_quantity != null && ` · 재고 ${p.stock_quantity}개`}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(p)}
                      className="px-4 py-2.5 text-[10px] font-medium tracking-[0.12em] uppercase text-[#666666] hover:text-[#000000] transition-colors border border-[#DDDDDD]"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="px-4 py-2.5 text-[10px] font-medium tracking-[0.12em] uppercase text-red-600 hover:bg-red-50 transition-colors border border-red-200"
                    >
                      삭제
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* 크롭 모달 */}
      {cropState.open && cropState.url && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-lg h-[70vh] bg-[#1a1a1a] rounded overflow-hidden relative">
            <Cropper
              image={cropState.url}
              crop={crop}
              zoom={zoom}
              aspect={3 / 4}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={() => setCropState({ open: false, index: -1, url: '', itemId: null })}
              className="px-6 py-2.5 text-[11px] font-medium uppercase text-white border border-white/40 hover:bg-white/10"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleCropSave}
              className="px-6 py-2.5 text-[11px] font-medium uppercase bg-white text-black hover:bg-gray-200"
            >
              적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUploadPage;
