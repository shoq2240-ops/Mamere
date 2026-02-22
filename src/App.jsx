import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Toaster, toast } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CartProvider, useCart } from "./store/CartContext";
import { WishlistProvider } from "./store/WishlistContext";
import { AuthProvider, useAuth } from "./store/AuthContext";
import { LanguageProvider, useLanguage } from "./store/LanguageContext";
import ScrollToTop from "./components/ScrollToTop";

import Navbar from "./components/Navbar";
import Marquee from "./components/Marquee";
import Footer from './components/Footer';
import RequireAdmin from './components/RequireAdmin';
import CookieBanner from './components/CookieBanner';

// 라우트별 코드 스플리팅 (Lazy Loading) — 초기 번들 축소
const LandingPage = lazy(() => import('./pages/LandingPage'));
const BrandStoryPage = lazy(() => import('./pages/BrandStoryPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderLookupPage = lazy(() => import('./pages/OrderLookupPage'));
const AdminUploadPage = lazy(() => import('./pages/AdminUploadPage'));
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const ShippingPage = lazy(() => import('./pages/ShippingPage'));
const ReturnsPage = lazy(() => import('./pages/ReturnsPage'));

const PageLoadFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-[#F9F7F2]" aria-hidden="true">
    <div className="w-8 h-8 border-2 border-[#A8B894]/40 border-t-[#3E2F28] rounded-full animate-spin" />
  </div>
);

const WithdrawnToast = () => {
  const { withdrawnMessage, clearWithdrawnMessage } = useAuth();
  useEffect(() => {
    if (withdrawnMessage) {
      toast.error(withdrawnMessage);
      clearWithdrawnMessage();
    }
  }, [withdrawnMessage, clearWithdrawnMessage]);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { addToCart } = useCart(); // 👈 Context에서 함수를 직접 가져옵니다.

  return (
    <Suspense fallback={<PageLoadFallback />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        {/* LandingPage에 Context의 addToCart 함수를 전달합니다. */}
        <Route path="/" element={<PageWrapper><LandingPage addToCart={addToCart} /></PageWrapper>} />
        
        <Route path="/brand-story" element={<PageWrapper><BrandStoryPage /></PageWrapper>} />
        <Route path="/shop" element={<PageWrapper><ShopPage /></PageWrapper>} />
        <Route path="/product/:id" element={<PageWrapper><ProductDetailPage /></PageWrapper>} />
        <Route path="/wishlist" element={<PageWrapper><WishlistPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><SignupPage /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper><CartPage /></PageWrapper>} />
        <Route path="/checkout" element={<PageWrapper><CheckoutPage /></PageWrapper>} />
        <Route path="/orders" element={<PageWrapper><OrdersPage /></PageWrapper>} />
        <Route path="/order-lookup" element={<PageWrapper><OrderLookupPage /></PageWrapper>} />
        {/* 관리자 전용: RequireAdmin이 로그인 + profiles.is_admin 확인 후 허용, 미충족 시 /login 또는 / 리다이렉트. 데이터는 .env의 Supabase(products/orders) 및 Storage(product-images) 사용 */}
        <Route path="/admin/upload" element={<PageWrapper><RequireAdmin><AdminUploadPage /></RequireAdmin></PageWrapper>} />
        <Route path="/admin/orders" element={<PageWrapper><RequireAdmin><AdminOrdersPage /></RequireAdmin></PageWrapper>} />
        <Route path="/admin/users" element={<PageWrapper><RequireAdmin><AdminUsersPage /></RequireAdmin></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><TermsPage /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><PrivacyPage /></PageWrapper>} />
        <Route path="/faq" element={<PageWrapper><FAQPage /></PageWrapper>} />
        <Route path="/shipping" element={<PageWrapper><ShippingPage /></PageWrapper>} />
        <Route path="/returns" element={<PageWrapper><ReturnsPage /></PageWrapper>} />
        
        {/* 카테고리별 쇼핑 페이지 (화장품: Best, Skincare, Makeup, Body & Hair) */}
        <Route path="/shop/best" element={<PageWrapper><ShopPage category="best" /></PageWrapper>} />
        <Route path="/shop/skincare" element={<PageWrapper><ShopPage category="skincare" /></PageWrapper>} />
        <Route path="/shop/makeup" element={<PageWrapper><ShopPage category="makeup" /></PageWrapper>} />
        <Route path="/shop/body-hair" element={<PageWrapper><ShopPage category="body_hair" /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

// 노이즈 레이어 및 페이지 전환 애니메이션
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    className="relative"
  >
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] pointer-events-none opacity-0"
    />
    {children}
  </motion.div>
);

function AppContent() {
  const mainScrollRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { t } = useLanguage();

  const handleScroll = () => {
    const el = mainScrollRef.current;
    if (!el) return;
    setIsScrolled(el.scrollTop > 0);
  };

  useEffect(() => {
    const el = mainScrollRef.current;
    if (!el) return;
    setIsScrolled(el.scrollTop > 0);
  }, [pathname]);

  const isAdmin = pathname.startsWith('/admin');
  // 관리자 페이지: 헤더 항상 다크
  const headerBgClass = isAdmin
    ? 'bg-[#000000] border-b border-white/10'
    : 'bg-[#2D3A2D] border-b border-[#F9F7F2]/10';

  return (
    <>
      <header
        className={`sticky top-0 z-[150] flex flex-col flex-none shrink-0 transition-all duration-300 ${headerBgClass}`}
      >
        {!isAdmin && <Marquee text={t('marquee.freeShipping')} />}
        <Navbar isScrolled={isScrolled} isMobileMenuOpen={isMobileMenuOpen} onMobileMenuChange={setIsMobileMenuOpen} />
      </header>
      <main
        ref={mainScrollRef}
        onScroll={handleScroll}
        id="main-scroll"
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
      >
        <AnimatedRoutes />
        <Footer />
      </main>
    </>
  );
}

function App() {

  return (
    <AuthProvider>
      <LanguageProvider>
      <CartProvider>
        <WishlistProvider>
        <Router>
          <WithdrawnToast />
          <ScrollToTop />
          <div className="flex flex-col h-screen max-h-[100dvh] bg-[#F9F7F2] text-[#3E2F28] antialiased overflow-hidden flex font-sans">
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 2500,
                style: {
                  background: '#F9F7F2',
                  color: '#3E2F28',
                  border: '1px solid #A8B894',
                  borderRadius: 0,
                },
                success: { iconTheme: { primary: '#A8B894' } },
              }}
            />
            <AppContent />
            <CookieBanner />
          </div>
        </Router>
        </WishlistProvider>
      </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;