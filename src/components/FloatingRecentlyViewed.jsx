import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

const FloatingRecentlyViewed = () => {
  const { items } = useRecentlyViewed();
  const [open, setOpen] = useState(false);
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

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 z-[180]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 썸네일 전용 초미니 팝업 카드 */}
      <div
        className={`mb-2 rounded-md border border-[#EAE5DD] bg-[#FAF9F6] shadow transition-all duration-300 origin-bottom-right px-2.5 py-2 ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-1 pointer-events-none'
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
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-md overflow-hidden bg-[#EDEAE4]">
                {p.image && (
                  <img
                    src={p.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                )}
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
        className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#EAE5DD] shadow-sm flex items-center justify-center text-[#8C857B] hover:shadow-md transition-all duration-200"
      >
        <span className="relative inline-block w-4 h-3" aria-hidden>
          {/* 눈 윤곽선 */}
          <span className="absolute inset-0 rounded-full border border-[#C5BEB2]" />
          {/* 홍채 */}
          <span className="absolute inset-x-[5px] inset-y-[3px] rounded-full border border-[#8C857B]/70" />
          {/* 동공 */}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#8C857B]" />
        </span>
      </button>
    </div>
  );
};

export default FloatingRecentlyViewed;

