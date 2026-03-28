import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

const FloatingRecentlyViewed = () => {
  const { items } = useRecentlyViewed();
  const [open, setOpen] = useState(false);
  const [brokenThumb, setBrokenThumb] = useState({});
  const containerRef = useRef(null);
  const { pathname } = useLocation();

  // 관리자 페이지에서는 표시하지 않음
  if (pathname.startsWith('/admin')) return null;
  if (!items || items.length === 0) return null;

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* 썸네일 전용 초미니 팝업 카드 (버튼 왼쪽으로 열림) */}
      <div
        className={`absolute bottom-0 right-[calc(100%+16px)] w-max origin-bottom-right rounded-md border border-[#EAE5DD] bg-[#FAF9F6] px-2.5 py-2 shadow transition-all duration-300 ease-out ${
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0'
        }`}
      >
        <div className="grid grid-cols-3 gap-1.5">
          {items.slice(0, 9).map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              className="block"
              onClick={() => setOpen(false)}
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                {typeof p.image === 'string' && p.image.trim() && !brokenThumb[p.id] ? (
                  <img
                    src={p.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                    onError={() => setBrokenThumb((prev) => ({ ...prev, [p.id]: true }))}
                  />
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 초미니멀 아이보리 플로팅 버튼 */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="최근 본 상품 열기"
        className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#EAE5DD] shadow-sm flex items-center justify-center hover:shadow-md transition-all duration-200 p-2"
      >
        <img
          src="/recently-viewed-mark.png"
          alt=""
          width={20}
          height={20}
          className="w-5 h-5 block object-contain [image-rendering:-webkit-optimize-contrast] [image-rendering:crisp-edges]"
          aria-hidden
        />
      </button>
    </div>
  );
};

export default FloatingRecentlyViewed;

