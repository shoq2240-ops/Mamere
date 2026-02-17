import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import brandLogo from '../asset/brand.logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWomenOpen, setIsWomenOpen] = useState(false);
  const [isMenOpen, setIsMenOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const { cartCount } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false);
    navigate('/', { replace: true });
  };

  const handleMenuClick = (path) => {
    setIsMobileMenuOpen(false);
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

  // 메뉴 데이터 구조: 여성, 남성 (아웃웨어/상의/하의), 컬렉션, 스토리
  const navLinks = [
    { 
      name: '여성', 
      path: '/shop/women',
      sub: [
        { name: '아웃웨어', path: '/shop/women?sub=outerwear' },
        { name: '상의', path: '/shop/women?sub=top' },
        { name: '하의', path: '/shop/women?sub=bottom' },
      ]
    },
    { 
      name: '남성', 
      path: '/shop/men',
      sub: [
        { name: '아웃웨어', path: '/shop/men?sub=outerwear' },
        { name: '상의', path: '/shop/men?sub=top' },
        { name: '하의', path: '/shop/men?sub=bottom' },
      ]
    },
    { name: '컬렉션', path: '/collection', mobileLabel: 'Collection' },
    { name: '스토리', path: '/philosophy', mobileLabel: 'Story' },
  ];

  return (
    <div className="antialiased" onMouseLeave={() => setHoveredMenu(null)}>
      <nav className="relative w-full z-[110] bg-[#FFFFFF] text-[#000000]">
        <div className="max-w-[1800px] mx-auto h-14 flex items-center justify-between px-6 relative">
          
          {/* 왼쪽: 메뉴 (오른쪽으로 3cm 이동) */}
          <div className="hidden md:flex items-center gap-8 text-[9pt] font-light tracking-widest uppercase h-14 flex-1 ml-[3cm]">
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
                            className="relative py-3 text-[11px] font-light uppercase transition-all duration-200 text-[#333333] hover:text-[#000000] group/row"
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

          {/* 가운데: 공식 브랜드 로고 (투명 배경 느낌: invert로 어두운 헤더에 맞춤) */}
          <Link
            to="/"
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-auto cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
            style={{ height: '28px' }}
          >
            <img src={brandLogo} alt="jvng." className="h-full w-auto object-contain" />
          </Link>

          {/* 모바일: 햄버거 메뉴 (작은 크기) */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden w-8 h-8 -ml-1 flex flex-col justify-center items-center gap-[4px] z-[210]">
            <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 5, backgroundColor: "#000000" } : { rotate: 0, y: 0, backgroundColor: "#000000" }} className="w-4 h-[1px] block" />
            <motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-4 h-[1px] bg-[#000000] block" />
            <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -5, backgroundColor: "#000000" } : { rotate: 0, y: 0, backgroundColor: "#000000" }} className="w-4 h-[1px] block" />
          </button>

          <Link to="/" className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-auto z-[210] opacity-90 hover:opacity-100 transition-opacity" style={{ height: '26px' }}>
            <img src={brandLogo} alt="jvng." className="h-full w-auto object-contain" />
          </Link>

          <div className="ml-auto flex items-center gap-2 md:gap-2 z-[210] pr-1 md:pr-0">
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
                          <Link to="/orders" onClick={() => setAccountOpen(false)} className="text-[10px] font-light text-[#666666] hover:text-[#000000] transition-colors tracking-[0.15em] uppercase">ORDERS</Link>
                          <Link to="/profile" onClick={() => setAccountOpen(false)} className="text-[10px] font-light text-[#666666] hover:text-[#000000] transition-colors tracking-[0.15em] uppercase">PROFILE</Link>
                          <button type="button" onClick={() => { handleLogout(); setAccountOpen(false); }} className="text-[10px] font-light text-white/70 hover:text-white transition-colors tracking-[0.15em] uppercase text-left">LOGOUT</button>
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
            <button onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center hover:opacity-70 transition-colors text-[#000000]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            </button>
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

      {/* 모바일 메뉴 (기존 백 기능 완벽 유지) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-0 bg-[#FFFFFF] z-[200] flex flex-col pt-20 pb-12 px-8 text-[#000000] md:hidden">
            <div className="mb-8 text-left">
              <button onClick={() => (isWomenOpen || isMenOpen) ? (setIsWomenOpen(false), setIsMenOpen(false)) : setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-[12px] font-light tracking-ultra-wide uppercase text-[#666666]">
                <span className="text-xl">←</span> {(isWomenOpen || isMenOpen) ? 'Back to Menu' : 'Back'}
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-between min-h-0">
              <div className="flex flex-col space-y-2 overflow-y-auto">
                {navLinks.map((item) => (
                  <div key={item.name}>
                    {item.sub ? (
                      <>
                        <button onClick={() => { setIsWomenOpen(item.name === '여성' ? !isWomenOpen : false); setIsMenOpen(item.name === '남성' ? !isMenOpen : false); }} className="text-xl font-bold tracking-tighter uppercase text-left flex items-center justify-between w-full hover:opacity-70 py-2">
                          {item.name} <span className="text-lg font-light opacity-20">{(item.name === '여성' ? isWomenOpen : isMenOpen) ? '−' : '+'}</span>
                        </button>
                        <AnimatePresence>
                          {(item.name === '여성' ? isWomenOpen : isMenOpen) && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col space-y-4 mt-4 ml-4 border-l border-[#E5E5E5] pl-5 text-left text-sm font-light uppercase text-[#333333]">
                              {item.sub.map((sub) => (
                                <button key={sub.name} onClick={() => handleMenuClick(sub.path)}>{sub.name}</button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <button onClick={() => handleMenuClick(item.path)} className="text-xl font-bold tracking-tighter uppercase text-left hover:opacity-70 py-2">{item.mobileLabel || item.name}</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex-shrink-0 pt-8 mt-6 border-t border-[#F0F0F0] flex flex-col space-y-4 text-[12px]">
                <button onClick={() => handleMenuClick('/cart')} className="font-bold tracking-[0.12em] uppercase text-[#000000] flex justify-between py-1">Shopping Bag <span>[{cartCount}]</span></button>
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 검색 모달 (기존 로직 유지) */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#FFFFFF] z-[300] flex flex-col items-center pt-40 px-6">
            <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
              <input autoFocus type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="SEARCH" className="w-full bg-transparent border-b border-[#000000] py-4 text-3xl md:text-5xl font-bold italic uppercase outline-none text-[#000000] placeholder-[#CCCCCC]" />
              <button type="submit" className="hidden">Search</button>
              <button onClick={() => setIsSearchOpen(false)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#000000] font-bold text-[10px] uppercase tracking-widest">Close</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;