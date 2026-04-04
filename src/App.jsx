import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Toaster, toast } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { CartProvider } from "./store/CartContext";
import { WishlistProvider } from "./store/WishlistContext";
import { AuthProvider, useAuth } from "./store/AuthContext";
import ScrollToTop from "./components/ScrollToTop";

import Navbar from "./components/Navbar";
import Marquee from "./components/Marquee";
import Footer from './components/Footer';
import FloatingRecentlyViewed from './components/FloatingRecentlyViewed';
import ScrollToTopButton from './components/ScrollToTopButton';
import RequireAdmin from './components/RequireAdmin';
import RequireAuth from './components/RequireAuth';
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
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderLookupPage = lazy(() => import('./pages/OrderLookupPage'));
const AdminUploadPage = lazy(() => import('./pages/AdminUploadPage'));
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminReturnsPage = lazy(() => import('./pages/AdminReturnsPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const ShippingPage = lazy(() => import('./pages/ShippingPage'));
const ReturnsPage = lazy(() => import('./pages/ReturnsPage'));

const PageLoadFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-white text-[#333333]" aria-hidden="true">
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

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <Suspense fallback={<PageLoadFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        
        <Route path="/brand-story" element={<PageWrapper><BrandStoryPage /></PageWrapper>} />
        <Route path="/shop" element={<PageWrapper><ShopPage /></PageWrapper>} />
        <Route path="/product/:id" element={<PageWrapper><ProductDetailPage /></PageWrapper>} />
        <Route path="/wishlist" element={<PageWrapper><WishlistPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><SignupPage /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><RequireAuth><ProfilePage /></RequireAuth></PageWrapper>} />
        <Route path="/checkout" element={<PageWrapper><CheckoutPage /></PageWrapper>} />
        <Route path="/orders" element={<PageWrapper><RequireAuth><OrdersPage /></RequireAuth></PageWrapper>} />
        <Route path="/order-lookup" element={<PageWrapper><OrderLookupPage /></PageWrapper>} />
        {/* 관리자 전용: RequireAdmin이 로그인 + profiles.is_admin 확인 후 허용, 미충족 시 /login 또는 / 리다이렉트. 데이터는 .env의 Supabase(products/orders) 및 Storage(product-images) 사용 */}
        <Route path="/admin/upload" element={<PageWrapper><RequireAdmin><AdminUploadPage /></RequireAdmin></PageWrapper>} />
        <Route path="/admin/orders" element={<PageWrapper><RequireAdmin><AdminOrdersPage /></RequireAdmin></PageWrapper>} />
        <Route path="/admin/users" element={<PageWrapper><RequireAdmin><AdminUsersPage /></RequireAdmin></PageWrapper>} />
        <Route path="/admin/returns" element={<PageWrapper><RequireAdmin><AdminReturnsPage /></RequireAdmin></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><TermsPage /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><PrivacyPage /></PageWrapper>} />
        <Route path="/faq" element={<PageWrapper><FAQPage /></PageWrapper>} />
        <Route path="/shipping" element={<PageWrapper><ShippingPage /></PageWrapper>} />
        <Route path="/returns" element={<PageWrapper><ReturnsPage /></PageWrapper>} />
        
        {/* 카테고리별 쇼핑: 스킨케어, 바디 & 헤어 (구 URL은 /shop 으로 리다이렉트) */}
        <Route path="/shop/best" element={<Navigate to="/shop" replace />} />
        <Route path="/shop/makeup" element={<Navigate to="/shop" replace />} />
        <Route path="/shop/skincare" element={<PageWrapper><ShopPage category="skincare" /></PageWrapper>} />
        <Route path="/shop/body-hair" element={<PageWrapper><ShopPage category="body_hair" /></PageWrapper>} />
        <Route path="/shop/household" element={<PageWrapper><ShopPage category="household_items" /></PageWrapper>} />
        <Route path="/shop/household-items" element={<Navigate to="/shop/household" replace />} />
        </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  );
};

// 페이지 전환 애니메이션 (미니멀 페이드인)
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0.4 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0.4 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
    className="relative flex min-h-0 w-full flex-1 flex-col"
  >
    {children}
  </motion.div>
);

function AppContent() {
  const mainScrollRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();

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

  const headerBgClass = isAdmin ? 'bg-[#000000] border-b border-white/10' : '';

  const customerHeaderClass =
    'fixed top-0 left-0 w-full z-[210] flex flex-col transition-all duration-300';

  /** 고객 페이지: 홈과 동일하게 본문을 상단부터 깔아 fixed 헤더(마키+글래스 네비)가 항상 같은 오버레이로 동작 */
  const mainPaddingTop = isAdmin ? 'pt-20' : 'pt-0';

  return (
    <>
      <Helmet
        titleTemplate="%s | 마메르(Mamère)"
        defaultTitle={DEFAULT_META.title}
      >
        <meta name="description" content={DEFAULT_META.description} />
      </Helmet>
      {isAdmin ? (
        <header className={`sticky top-0 z-[150] flex w-full flex-none shrink-0 flex-col ${headerBgClass}`}>
          <Navbar
            isScrolled={isScrolled}
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuChange={setIsMobileMenuOpen}
          />
        </header>
      ) : (
        <header className={customerHeaderClass}>
          <div className="border-b border-white/10 bg-[#2A1B38]">
            <Marquee
              text="🌿 30,000원 이상 구매 시 무료배송 + NATURE SOAP MAMÈRE 🌿"
              speed={168}
              textClassName="text-white"
            />
          </div>
          <div className="border-b border-white/10 bg-black/20 backdrop-blur-md supports-[backdrop-filter]:bg-gray-900/30 supports-[backdrop-filter]:backdrop-blur-[8px]">
            <Navbar
              isScrolled={isScrolled}
              isMobileMenuOpen={isMobileMenuOpen}
              onMobileMenuChange={setIsMobileMenuOpen}
            />
          </div>
        </header>
      )}
      <main
        ref={mainScrollRef}
        onScroll={handleScroll}
        id="main-scroll"
        className={`relative flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-white text-[#333333] ${mainPaddingTop}`}
      >
        <AnimatedRoutes />
        <Footer />
        {!isAdmin && (
          <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3">
            <ScrollToTopButton />
            {pathname !== '/' && <FloatingRecentlyViewed />}
          </div>
        )}
      </main>
    </>
  );
}

const DEFAULT_META = {
  title: '마메르(mamère) | 다정한 위로, 순수한 자연',
  description: '깊은 숲에서 찾은 순수한 휴식. 마메르와 함께 피부가 편안하게 숨 쉬는 시간을 경험해 보세요.',
};

function App() {

  return (
    <HelmetProvider>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
        <Router>
          <WithdrawnToast />
          <ScrollToTop />
          <div className="flex flex-col h-screen max-h-[100dvh] bg-white text-[#333333] antialiased overflow-hidden flex font-sans tracking-wide leading-loose">
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 2500,
                style: {
                  background: '#FFFFFF',
                  color: '#333333',
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
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;