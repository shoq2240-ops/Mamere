import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// [이미지 교체] 브랜드 로고: public 폴더의 brand.logo2.png 사용
const brandLogo = '/brand.logo1.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../store/CartContext';
import { useWishlist } from '../store/WishlistContext';
import { useAuth } from '../store/AuthContext';
import { useLanguage } from '../store/LanguageContext';
import { supabase } from '../lib/supabase';

/** 티트리 잎사귀 SVG (placeholder). [이미지 교체] 나중에 <img src="/tealeaf-1.svg" /> 등 실제 잎 이미지로 교체 가능 */
const LeafIcon1 = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 40" className={className} fill="currentColor" aria-hidden>
    <path d="M12 2C8 8 4 18 4 28c0 6 3.5 10 8 10s8-4 8-10c0-10-4-20-8-26z" opacity="0.9" />
  </svg>
);
const LeafIcon2 = ({ className = 'w-3 h-5' }) => (
  <svg viewBox="0 0 20 32" className={className} fill="currentColor" aria-hidden>
    <path d="M10 1c-3 5-6 14-6 22 0 5 2.5 8 6 8s6-3 6-8c0-8-3-17-6-22z" opacity="0.9" />
  </svg>
);
const LeafIcon3 = ({ className = 'w-3.5 h-5' }) => (
  <svg viewBox="0 0 28 36" className={className} fill="currentColor" aria-hidden>
    <path d="M14 2c-4 6-8 14-8 24 0 5 3 8 8 8s8-3 8-8c0-10-4-18-8-24z" opacity="0.9" />
  </svg>
);
const LeafIcon4 = ({ className = 'w-2.5 h-4' }) => (
  <svg viewBox="0 0 16 28" className={className} fill="currentColor" aria-hidden>
    <path d="M8 1C5 6 3 13 3 20c0 4 2 7 5 7s5-3 5-7c0-7-2-14-5-19z" opacity="0.9" />
  </svg>
);

const Navbar = ({ isScrolled = false, isMobileMenuOpen = false, onMobileMenuChange }) => {
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  // App에서 isMobileMenuOpen을 넘기므로 그 값 사용, 없으면 internalMenuOpen 사용
  const activeMenuOpen = onMobileMenuChange ? isMobileMenuOpen : internalMenuOpen;

  const handleMenuToggle = (open) => {
    if (onMobileMenuChange) {
      onMobileMenuChange(open);
    } else {
      setInternalMenuOpen(open);
    }
  };

  const toggleMenu = () => {
    const nextOpen = !activeMenuOpen;
    console.log('Menu Clicked!', nextOpen);
    handleMenuToggle(nextOpen);
  };
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(null);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountDropdownRect, setAccountDropdownRect] = useState(null);
  const accountButtonRef = useRef(null);
  const [searchInput, setSearchInput] = useState("");
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;
  const { isLoggedIn } = useAuth();
  const { locale, toggleLocale, t } = useLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogoClick = (e) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo(0, 0);
      const main = document.getElementById('main-scroll');
      if (main) main.scrollTo(0, 0);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    handleMenuToggle(false);
    navigate('/', { replace: true });
  };

  const handleMenuClick = (path) => {
    handleMenuToggle(false);
    setIsCategoryOpen(null);
    setHoveredMenu(null);
    navigate(path);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/shop?search=${searchInput}`);
      setIsSearchOpen(false);
      setSearchInput("");
    }
  };

  // 마이페이지 드롭다운 위치 (포털용) — 열릴 때 버튼 기준으로 계산, 스크롤/리사이즈 시 갱신
  const updateAccountDropdownRect = () => {
    if (accountButtonRef.current) {
      setAccountDropdownRect(accountButtonRef.current.getBoundingClientRect());
    }
  };
  useEffect(() => {
    if (!accountOpen) {
      setAccountDropdownRect(null);
      return;
    }
    updateAccountDropdownRect();
    window.addEventListener('scroll', updateAccountDropdownRect, true);
    window.addEventListener('resize', updateAccountDropdownRect);
    return () => {
      window.removeEventListener('scroll', updateAccountDropdownRect, true);
      window.removeEventListener('resize', updateAccountDropdownRect);
    };
  }, [accountOpen]);

  // GNB: Best, Skincare, Makeup, Body & Hair, Brand Story (Mamère 화장품)
  const isAdmin = pathname.startsWith('/admin');

  /** 관리자 페이지 전용 헤더: Mamère 로고 + 다크 테마 */
  if (isAdmin) {
    return (
      <div className="antialiased">
        <nav className="relative w-full z-[150] bg-[#000000] text-[#FDFDFB] border-b border-white/10 transition-all duration-300">
          <div className="max-w-[1800px] mx-auto h-20 flex items-center justify-between px-6 md:px-10">
            {/* [이미지 교체] 관리자용 로고: 상단 import brandLogo 경로를 실제 로고 파일로 변경 */}
            <Link to="/" className="flex items-center opacity-90 hover:opacity-100 transition-opacity" style={{ height: '76px' }}>
              <img src={brandLogo} alt="마메르 로고" className="h-full w-auto object-contain invert" decoding="async" />
            </Link>
            <div className="flex items-center gap-6 md:gap-8 text-[10px] font-light tracking-[0.12em] uppercase">
              <Link to="/admin/orders" className="text-white/70 hover:text-white transition-colors">주문 관리</Link>
              <Link to="/admin/upload" className="text-white/70 hover:text-white transition-colors">상품 등록</Link>
              <Link to="/admin/returns" className="text-white/70 hover:text-white transition-colors">반품/교환</Link>
              <Link to="/admin/users" className="text-white/70 hover:text-white transition-colors">회원 관리</Link>
              <span className="text-white/30">|</span>
              <Link to="/" className="text-white/70 hover:text-white transition-colors">메인으로</Link>
            </div>
          </div>
        </nav>
      </div>
    );
  }

  const navLinks = [
    { key: 'nav.best', path: '/shop/best' },
    { key: 'nav.skincare', path: '/shop/skincare' },
    { key: 'nav.makeup', path: '/shop/makeup' },
    { key: 'nav.bodyHair', path: '/shop/body-hair' },
    { key: 'nav.brandStory', path: '/brand-story' },
  ];

  return (
    <div className="antialiased" onMouseLeave={() => setHoveredMenu(null)}>
      <nav className="relative w-full z-[150] bg-[#2D3A2D] text-[#F9F7F2] transition-all duration-300 overflow-x-hidden">
        <div className="max-w-[1800px] mx-auto h-12 md:h-16 flex items-center justify-between px-5 md:px-6 py-0 relative w-full">

          <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
            <div className="absolute left-[8%] top-1/2 -translate-y-1/2 text-[#F9F7F2]/15 animate-leaf-float">
              <LeafIcon1 className="w-5 h-8 md:w-4 md:h-7" />
            </div>
            <div className="absolute left-[15%] top-2/3 text-[#A8B894]/20 animate-leaf-sway-slow" style={{ animationDelay: '0.8s' }}>
              <LeafIcon2 className="w-3 h-5 md:w-2.5 md:h-4" />
            </div>
            <div className="absolute right-[12%] top-1/3 text-[#F9F7F2]/15 animate-leaf-float-slow" style={{ animationDelay: '1.2s' }}>
              <LeafIcon3 className="w-4 h-6 md:w-3.5 md:h-5" />
            </div>
            <div className="absolute right-[6%] top-1/2 -translate-y-1/2 text-[#A8B894]/20 animate-leaf-sway" style={{ animationDelay: '0.3s' }}>
              <LeafIcon4 className="w-3 h-5 md:w-2.5 md:h-4" />
            </div>
          </div>

          {/* 좌측: 햄버거 + 데스크톱 GNB (flex-1, 좌측 정렬) */}
          <div className="flex-1 flex items-center justify-start min-w-0 z-10 mt-1">
            <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium tracking-[0.12em] uppercase h-full">
              {navLinks.map((link) => (
                <Link key={link.key} to={link.path} className="hover:opacity-80 transition-all text-[#F9F7F2] whitespace-nowrap">
                  {t(link.key)}
                </Link>
              ))}
            </div>
            <button type="button" onClick={toggleMenu} className="md:hidden w-9 h-9 flex flex-col justify-center items-center gap-[5px] shrink-0" aria-label={t(activeMenuOpen ? 'nav.menuClose' : 'nav.menuOpen')}>
              <motion.span animate={activeMenuOpen ? { rotate: 45, y: 5.5, backgroundColor: '#F9F7F2' } : { rotate: 0, y: 0, backgroundColor: '#F9F7F2' }} className="w-4 h-[1px] block" />
              <motion.span animate={activeMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-4 h-[1px] bg-[#F9F7F2] block" />
              <motion.span animate={activeMenuOpen ? { rotate: -45, y: -5.5, backgroundColor: '#F9F7F2' } : { rotate: 0, y: 0, backgroundColor: '#F9F7F2' }} className="w-4 h-[1px] block" />
            </button>
          </div>

          <Link
            to="/"
            onClick={handleLogoClick}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-auto cursor-pointer opacity-95 hover:opacity-100 transition-opacity z-20 flex items-center justify-center border-0 outline-none shadow-none ring-0 focus:ring-0 focus:outline-none bg-transparent"
        style={{ height: '72px' }}
          >
            <img
              src={brandLogo}
              alt="마메르 로고"
              className="h-full w-auto object-contain max-h-[88px] md:max-h-[96px] block bg-transparent mix-blend-multiply"
              decoding="async"
            />
          </Link>

          {/* 우측: 언어/계정/검색/장바구니 (flex-1, 우측 정렬, 여유 있는 간격) */}
          <div className="flex-1 flex items-center justify-end gap-4 md:gap-4 min-w-0 z-10 mt-1">
            <button
              type="button"
              onClick={toggleLocale}
              className="hidden md:flex items-center gap-1 text-[9px] font-light tracking-[0.15em] uppercase hover:opacity-80 transition-all text-[#F9F7F2]"
              aria-label={locale === 'ko' ? 'Switch to English' : 'Switch to Korean'}
            >
              <span className={locale === 'ko' ? 'opacity-50' : 'font-medium'}>EN</span>
              <span className="text-[#F9F7F2]/50">/</span>
              <span className={locale === 'en' ? 'opacity-50' : 'font-medium'}>KO</span>
            </button>
            <div className="hidden md:block relative">
              {isLoggedIn ? (
                <>
                  <button
                    ref={accountButtonRef}
                    type="button"
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="text-[10px] font-light tracking-[0.15em] uppercase hover:opacity-80 transition-all text-[#F9F7F2]"
                  >
                    {t('nav.myPage')}
                  </button>
                  {/* 마이페이지 드롭다운: 포털로 body에 렌더링해 히어로/스크롤 영역에 가리지 않도록 함 */}
                  {typeof document !== 'undefined' && accountOpen && accountDropdownRect && createPortal(
                    <>
                      <div className="fixed inset-0 z-[9996]" onClick={() => setAccountOpen(false)} aria-hidden="true" />
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed py-4 px-6 bg-[#F9F7F2] border border-[#A8B894]/30 min-w-[160px] z-[9997] flex flex-col gap-3 shadow-lg text-[#3E2F28]"
                        style={{
                          top: accountDropdownRect.bottom + 8,
                          right: typeof window !== 'undefined' ? window.innerWidth - accountDropdownRect.right : 0,
                        }}
                      >
                        <Link to="/wishlist" onClick={() => setAccountOpen(false)} className="text-[10px] font-light text-[#5C4A42] hover:text-[#3E2F28] transition-colors tracking-[0.15em] uppercase">{t('nav.wishlist')}</Link>
                        <Link to="/orders" onClick={() => setAccountOpen(false)} className="text-[10px] font-light text-[#5C4A42] hover:text-[#3E2F28] transition-colors tracking-[0.15em] uppercase">{t('nav.orders')}</Link>
                        <Link to="/profile" onClick={() => setAccountOpen(false)} className="text-[10px] font-light text-[#5C4A42] hover:text-[#3E2F28] transition-colors tracking-[0.15em] uppercase">{t('nav.profile')}</Link>
                        <button type="button" onClick={() => { handleLogout(); setAccountOpen(false); }} className="text-[10px] font-light text-[#5C4A42] hover:text-[#3E2F28] transition-colors tracking-[0.15em] uppercase text-left">{t('nav.logout')}</button>
                      </motion.div>
                    </>,
                    document.body
                  )}
                </>
              ) : (
                <Link to="/login" className="flex items-center justify-center w-10 h-10 hover:opacity-80 transition-colors text-[#F9F7F2]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="3.5" stroke="currentColor" />
                    <path d="M6 21c0-4 2.5-7 6-7s6 3 6 7" stroke="currentColor" strokeLinecap="round" />
                  </svg>
                </Link>
              )}
            </div>
            <button onClick={() => { setIsSearchOpen(true); handleMenuToggle(false); }} className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center hover:opacity-80 transition-colors text-[#F9F7F2]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            </button>
            <Link to="/cart" className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center relative hover:opacity-80 transition-colors text-[#F9F7F2]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              <AnimatePresence mode="popLayout">
                {cartCount > 0 && (
                  <motion.span 
                    key={cartCount} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }}
                    className="absolute -top-1 -right-1 bg-[#A8B894] text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold text-[#2D3A2D]"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 (Portal: 배경 #FFFFFF 불투명, z-index 9999) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 md:hidden"
                style={{ zIndex: 9998, backgroundColor: 'rgba(0,0,0,0.25)' }}
                onClick={() => handleMenuToggle(false)}
                aria-hidden="true"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-0 flex flex-col pt-16 pb-12 px-8 text-[#3E2F28] md:hidden"
                style={{ zIndex: 9999, backgroundColor: '#F9F7F2' }}
              >
                <div className="mb-8 text-left">
                  <button onClick={() => handleMenuToggle(false)} className="flex items-center gap-2 text-[12px] font-light tracking-[0.15em] uppercase text-[#7A6B63]">
                    <span className="text-xl">←</span> {t('common.back')}
                  </button>
                </div>
                <div className="flex-1 flex flex-col justify-between min-h-0">
                  <div className="flex flex-col space-y-2 overflow-y-auto">
                    {navLinks.map((item) => (
                      <button key={item.key} onClick={() => handleMenuClick(item.path)} className="text-xl font-medium tracking-tight text-left hover:opacity-70 py-2 text-[#3E2F28]">
                        {t(item.key)}
                      </button>
                    ))}
                  </div>
                  <div className="flex-shrink-0 pt-8 mt-6 border-t border-[#A8B894]/30 flex flex-col space-y-4 text-[12px]">
                    <button onClick={() => handleMenuClick('/cart')} className="font-bold tracking-[0.12em] uppercase text-[#3E2F28] flex justify-between py-1">{t('nav.shoppingBag')} <span>[{cartCount}]</span></button>
                    <button onClick={() => handleMenuClick('/wishlist')} className="font-light tracking-[0.12em] uppercase text-[#5C4A42] text-left py-1 flex justify-between">{t('nav.wishlist')} {wishlistCount > 0 ? <span>[{wishlistCount}]</span> : null}</button>
                    {isLoggedIn ? (
                      <>
                        <button onClick={() => handleMenuClick('/orders')} className="font-light tracking-[0.12em] uppercase text-[#5C4A42] text-left py-1">{t('nav.orders')}</button>
                        <button onClick={() => handleMenuClick('/profile')} className="font-light tracking-[0.12em] uppercase text-[#5C4A42] text-left py-1">{t('nav.profile')}</button>
                        <button onClick={handleLogout} className="font-light tracking-[0.12em] uppercase text-[#7A6B63] text-left py-1">{t('nav.logout')}</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleMenuClick('/login')} className="font-light tracking-[0.12em] uppercase text-[#7A6B63] text-left py-1">{t('nav.login')}</button>
                        <button onClick={() => handleMenuClick('/signup')} className="font-light tracking-[0.12em] uppercase text-[#7A6B63] text-left py-1">{t('nav.joinNow')}</button>
                      </>
                    )}
                    <button type="button" onClick={toggleLocale} className="mt-4 pt-4 border-t border-[#A8B894]/20 font-light tracking-[0.1em] uppercase text-[#7A6B63] text-[9px] text-left py-0.5 flex items-center gap-1.5">
                      <span className={locale === 'ko' ? 'opacity-50' : 'font-medium text-[#5C4A42]'}>EN</span>
                      <span className="text-[#A8B894]/60">/</span>
                      <span className={locale === 'en' ? 'opacity-50' : 'font-medium text-[#5C4A42]'}>KO</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 검색 모달 (기존 로직 유지) */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#F9F7F2] z-[300] flex flex-col items-center pt-40 px-6">
            <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
              <input autoFocus type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="SEARCH" className="w-full bg-transparent border-b border-[#3E2F28] py-4 text-3xl md:text-5xl font-medium uppercase outline-none text-[#3E2F28] placeholder:text-[#A8B894]/70" />
              <button type="submit" className="hidden">Search</button>
              <button onClick={() => setIsSearchOpen(false)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#3E2F28] font-medium text-[10px] uppercase tracking-widest">{t('common.close')}</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;