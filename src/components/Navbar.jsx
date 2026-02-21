import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import brandLogo from '../asset/brand.logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../store/CartContext';
import { useWishlist } from '../store/WishlistContext';
import { useAuth } from '../store/AuthContext';
import { useLanguage } from '../store/LanguageContext';
import { supabase } from '../lib/supabase';

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
  const [isWomenOpen, setIsWomenOpen] = useState(false);
  const [isMenOpen, setIsMenOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
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
    setIsWomenOpen(false);
    setIsMenOpen(false);
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

  // 메뉴 데이터 구조: women, men (아웃웨어/상의/하의), 컬렉션, 스토리
  const isAdmin = pathname.startsWith('/admin');

  /** 관리자 페이지 전용 헤더: jvng. 로고 + 다크 테마 */
  if (isAdmin) {
    return (
      <div className="antialiased">
        <nav className="relative w-full z-[150] bg-[#000000] text-[#FDFDFB] border-b border-white/10 transition-all duration-300">
          <div className="max-w-[1800px] mx-auto h-14 flex items-center justify-between px-6 md:px-10">
            <Link to="/" className="flex items-center opacity-90 hover:opacity-100 transition-opacity" style={{ height: '38px' }}>
              <img src={brandLogo} alt="jvng." className="h-full w-auto object-contain invert" decoding="async" />
            </Link>
            <div className="flex items-center gap-6 md:gap-8 text-[10px] font-light tracking-[0.12em] uppercase">
              <Link to="/admin/orders" className="text-white/70 hover:text-white transition-colors">주문 관리</Link>
              <Link to="/admin/upload" className="text-white/70 hover:text-white transition-colors">상품 등록</Link>
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
    { 
      name: 'women', 
      path: '/shop/women',
      sub: [
        { name: t('nav.outerwear'), path: '/shop/women?sub=outerwear' },
        { name: t('nav.top'), path: '/shop/women?sub=top' },
        { name: t('nav.bottom'), path: '/shop/women?sub=bottom' },
      ]
    },
    { 
      name: 'men', 
      path: '/shop/men',
      sub: [
        { name: t('nav.outerwear'), path: '/shop/men?sub=outerwear' },
        { name: t('nav.top'), path: '/shop/men?sub=top' },
        { name: t('nav.bottom'), path: '/shop/men?sub=bottom' },
      ]
    },
    { name: 'COLLECTION', path: '/collection', mobileLabel: 'Collection' },
    { name: 'ABOUT', path: '/philosophy', mobileLabel: 'ABOUT' },
  ];

  return (
    <div className="antialiased" onMouseLeave={() => setHoveredMenu(null)}>
      <nav className="relative w-full z-[150] bg-transparent text-[#000000] transition-all duration-300">
        <div className="max-w-[1800px] mx-auto h-14 flex items-center justify-between px-6 relative">
          
          {/* 왼쪽: 메뉴 (오른쪽으로 3cm 이동) */}
          <div className="hidden md:flex items-center gap-8 text-[9pt] font-medium tracking-widest uppercase h-14 flex-1 ml-[3cm]">
            {navLinks.map((link) => (
                <div 
                  key={link.name}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setHoveredMenu(link.name)}
                >
                  <Link to={link.path} className="hover:opacity-70 transition-all">{link.name}</Link>
                  
                  {/* 데스크톱 하위 메뉴 드롭다운 (Dark Aesthetic) */}
                  <AnimatePresence>
                    {hoveredMenu === link.name && link.sub && (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute top-full left-0 mt-1 py-5 px-6 flex flex-col gap-0 min-w-[160px]"
                        style={{ 
                          background: '#FFFFFF',
                          border: '1px solid #F0F0F0',
                        }}
                      >
                        {link.sub.map((sub) => (
                          <Link 
                            key={sub.name} 
                            to={sub.path} 
                            className="relative py-3 text-[11px] font-medium uppercase transition-all duration-200 text-[#333333] hover:text-[#000000] group/row"
                            style={{ letterSpacing: '0.1em' }}
                          >
                            {sub.name}
                            <span className="absolute bottom-1 left-0 w-0 h-px bg-[#000000] transition-all duration-200 group-hover/row:w-full" />
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
          </div>

          {/* 가운데: 공식 브랜드 로고 */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-auto cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
            style={{ height: '46px' }}
          >
            <img src={brandLogo} alt="jvng." className="h-full w-auto object-contain" decoding="async" />
          </Link>

          {/* 모바일: 햄버거 메뉴 (작은 크기) */}
          <button type="button" onClick={toggleMenu} className="md:hidden w-8 h-8 -ml-1 flex flex-col justify-center items-center gap-[4px] z-[400] relative" aria-label={activeMenuOpen ? '메뉴 닫기' : '메뉴 열기'}>
            <motion.span animate={activeMenuOpen ? { rotate: 45, y: 5, backgroundColor: "#000000" } : { rotate: 0, y: 0, backgroundColor: "#000000" }} className="w-4 h-[1px] block" />
            <motion.span animate={activeMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-4 h-[1px] bg-[#000000] block" />
            <motion.span animate={activeMenuOpen ? { rotate: -45, y: -5, backgroundColor: "#000000" } : { rotate: 0, y: 0, backgroundColor: "#000000" }} className="w-4 h-[1px] block" />
          </button>

          <Link to="/" onClick={handleLogoClick} className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-auto z-[210] opacity-90 hover:opacity-100 transition-opacity" style={{ height: '38px' }}>
            <img src={brandLogo} alt="jvng." className="h-full w-auto object-contain" decoding="async" />
          </Link>

          <div className="ml-auto flex items-center gap-2 md:gap-2 z-[210] pr-1 md:pr-0">
            {/* 언어 전환: EN / KO */}
            <button
              type="button"
              onClick={toggleLocale}
              className="hidden md:flex items-center gap-1 text-[9px] font-light tracking-[0.15em] uppercase hover:opacity-70 transition-all text-[#000000]"
              aria-label={locale === 'ko' ? 'Switch to English' : '한국어로 전환'}
            >
              <span className={locale === 'ko' ? 'opacity-40' : 'font-medium'}>EN</span>
              <span className="text-[#CCCCCC]">/</span>
              <span className={locale === 'en' ? 'opacity-40' : 'font-medium'}>KO</span>
            </button>
            {/* 계정 영역: 로그인 시 MY PAGE, 비로그인 시 사람 아이콘 */}
            <div className="hidden md:block relative">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="text-[10px] font-light tracking-[0.15em] uppercase hover:opacity-70 transition-all"
                  >
                    MY PAGE
                  </button>
                  <AnimatePresence>
                    {accountOpen && (
                      <>
                        <div className="fixed inset-0 z-[105]" onClick={() => setAccountOpen(false)} aria-hidden="true" />
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute right-0 top-full mt-2 py-4 px-6 bg-[#FFFFFF] border border-[#F0F0F0] min-w-[160px] z-[120] flex flex-col gap-3 shadow-sm"
                        >
                          <Link to="/wishlist" onClick={() => setAccountOpen(false)} className="text-[10px] font-light text-[#666666] hover:text-[#000000] transition-colors tracking-[0.15em] uppercase">WISHLIST</Link>
                          <Link to="/orders" onClick={() => setAccountOpen(false)} className="text-[10px] font-light text-[#666666] hover:text-[#000000] transition-colors tracking-[0.15em] uppercase">ORDERS</Link>
                          <Link to="/profile" onClick={() => setAccountOpen(false)} className="text-[10px] font-light text-[#666666] hover:text-[#000000] transition-colors tracking-[0.15em] uppercase">PROFILE</Link>
                          <button type="button" onClick={() => { handleLogout(); setAccountOpen(false); }} className="text-[10px] font-light text-[#666666] hover:text-[#000000] transition-colors tracking-[0.15em] uppercase text-left">LOGOUT</button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link to="/login" className="flex items-center justify-center w-10 h-10 hover:opacity-70 transition-colors text-[#000000]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="3.5" stroke="currentColor" />
                    <path d="M6 21c0-4 2.5-7 6-7s6 3 6 7" stroke="currentColor" strokeLinecap="round" />
                  </svg>
                </Link>
              )}
            </div>
            <button onClick={() => { setIsSearchOpen(true); handleMenuToggle(false); }} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center hover:opacity-70 transition-colors text-[#000000]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            </button>
            <Link to="/wishlist" className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center relative hover:opacity-70 transition-colors text-[#000000]" aria-label="위시리스트">
              <svg className="w-5 h-5" fill={wishlistCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute top-2 right-1.5 bg-[#000000] text-[8px] min-w-[14px] h-3.5 px-1 rounded-full flex items-center justify-center font-bold text-[#FFFFFF]">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center relative hover:opacity-70 transition-colors text-[#000000]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              <AnimatePresence mode="popLayout">
                {cartCount > 0 && (
                  <motion.span 
                    key={cartCount} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }}
                    className="absolute top-2 right-1.5 bg-[#000000] text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold text-[#FFFFFF]"
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
                className="fixed inset-0 flex flex-col pt-20 pb-12 px-8 text-[#000000] md:hidden"
                style={{ zIndex: 9999, backgroundColor: '#FFFFFF' }}
              >
                <div className="mb-8 text-left">
                  <button onClick={() => (isWomenOpen || isMenOpen) ? (setIsWomenOpen(false), setIsMenOpen(false)) : handleMenuToggle(false)} className="flex items-center gap-2 text-[12px] font-light tracking-ultra-wide uppercase text-[#666666]">
                    <span className="text-xl">←</span> {(isWomenOpen || isMenOpen) ? t('common.backToMenu') : t('common.back')}
                  </button>
                </div>
                <div className="flex-1 flex flex-col justify-between min-h-0">
                  <div className="flex flex-col space-y-2 overflow-y-auto">
                    {navLinks.map((item) => (
                      <div key={item.name}>
                        {item.sub ? (
                          <>
                            <button onClick={() => { setIsWomenOpen(item.name === 'women' ? !isWomenOpen : false); setIsMenOpen(item.name === 'men' ? !isMenOpen : false); }} className="text-xl font-medium tracking-tighter uppercase text-left flex items-center justify-between w-full hover:opacity-70 py-2">
                              {item.name} <span className="text-lg font-light opacity-20">{(item.name === 'women' ? isWomenOpen : isMenOpen) ? '−' : '+'}</span>
                            </button>
                            <AnimatePresence>
                              {(item.name === 'women' ? isWomenOpen : isMenOpen) && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col space-y-4 mt-4 ml-4 border-l border-[#E5E5E5] pl-5 text-left text-sm font-medium uppercase text-[#333333]">
                                  {item.sub.map((sub) => (
                                    <button key={sub.name} onClick={() => handleMenuClick(sub.path)}>{sub.name}</button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        ) : (
                          <button onClick={() => handleMenuClick(item.path)} className="text-xl font-medium tracking-tighter uppercase text-left hover:opacity-70 py-2">{item.mobileLabel || item.name}</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex-shrink-0 pt-8 mt-6 border-t border-[#F0F0F0] flex flex-col space-y-4 text-[12px]">
                    <button onClick={() => handleMenuClick('/cart')} className="font-bold tracking-[0.12em] uppercase text-[#000000] flex justify-between py-1">Shopping Bag <span>[{cartCount}]</span></button>
                    <button onClick={() => handleMenuClick('/wishlist')} className="font-light tracking-[0.12em] uppercase text-[#666666] text-left py-1 flex justify-between">WISHLIST {wishlistCount > 0 ? <span>[{wishlistCount}]</span> : null}</button>
                    {isLoggedIn ? (
                      <>
                        <button onClick={() => handleMenuClick('/orders')} className="font-light tracking-[0.12em] uppercase text-[#666666] text-left py-1">ORDERS</button>
                        <button onClick={() => handleMenuClick('/profile')} className="font-light tracking-[0.12em] uppercase text-[#666666] text-left py-1">PROFILE</button>
                        <button onClick={handleLogout} className="font-light tracking-[0.12em] uppercase text-[#999999] text-left py-1">LOGOUT</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleMenuClick('/login')} className="font-light tracking-[0.12em] uppercase text-[#999999] text-left py-1">Login</button>
                        <button onClick={() => handleMenuClick('/signup')} className="font-light tracking-[0.12em] uppercase text-[#999999] text-left py-1">Join Now</button>
                      </>
                    )}
                    <button type="button" onClick={toggleLocale} className="mt-4 pt-4 border-t border-[#F5F5F5] font-light tracking-[0.1em] uppercase text-[#999999] text-[9px] text-left py-0.5 flex items-center gap-1.5">
                      <span className={locale === 'ko' ? 'opacity-50' : 'font-medium text-[#666666]'}>EN</span>
                      <span className="text-[#DDDDDD]">/</span>
                      <span className={locale === 'en' ? 'opacity-50' : 'font-medium text-[#666666]'}>KO</span>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#FFFFFF] z-[300] flex flex-col items-center pt-40 px-6">
            <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
              <input autoFocus type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="SEARCH" className="w-full bg-transparent border-b border-[#000000] py-4 text-3xl md:text-5xl font-medium uppercase outline-none text-[#000000] placeholder:text-[#CCCCCC]" />
              <button type="submit" className="hidden">Search</button>
              <button onClick={() => setIsSearchOpen(false)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#000000] font-medium text-[10px] uppercase tracking-widest">{t('common.close')}</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;