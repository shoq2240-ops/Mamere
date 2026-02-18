import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CartProvider, useCart } from "./store/CartContext";
import { WishlistProvider } from "./store/WishlistContext";
import { AuthProvider, useAuth } from "./store/AuthContext";
import ScrollToTop from "./components/ScrollToTop";

import Navbar from "./components/Navbar";
import Marquee from "./components/Marquee";
import Footer from './components/Footer';
import LandingPage from "./pages/LandingPage";
import PhilosophyPage from './pages/PhilosophyPage';
import ShopPage from "./pages/ShopPage";
import LookbookPage from "./pages/LookbookPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import CollectionPage from './pages/CollectionPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import AdminUploadPage from './pages/AdminUploadPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminUsersPage from './pages/AdminUsersPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import RequireAdmin from './components/RequireAdmin';
import CookieBanner from './components/CookieBanner';

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
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* LandingPage에 Context의 addToCart 함수를 전달합니다. */}
        <Route path="/" element={<PageWrapper><LandingPage addToCart={addToCart} /></PageWrapper>} />
        
        <Route path="/philosophy" element={<PageWrapper><PhilosophyPage /></PageWrapper>} />
        <Route path="/shop" element={<PageWrapper><ShopPage /></PageWrapper>} />
        <Route path="/lookbook" element={<PageWrapper><LookbookPage /></PageWrapper>} />
        <Route path="/product/:id" element={<PageWrapper><ProductDetailPage /></PageWrapper>} />
        <Route path="/wishlist" element={<PageWrapper><WishlistPage /></PageWrapper>} />
        <Route path="/collection" element={<PageWrapper><CollectionPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><SignupPage /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper><CartPage /></PageWrapper>} />
        <Route path="/checkout" element={<PageWrapper><CheckoutPage /></PageWrapper>} />
        <Route path="/orders" element={<PageWrapper><OrdersPage /></PageWrapper>} />
        <Route path="/admin/upload" element={<PageWrapper><RequireAdmin><AdminUploadPage /></RequireAdmin></PageWrapper>} />
        <Route path="/admin/orders" element={<PageWrapper><RequireAdmin><AdminOrdersPage /></RequireAdmin></PageWrapper>} />
        <Route path="/admin/users" element={<PageWrapper><RequireAdmin><AdminUsersPage /></RequireAdmin></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><TermsPage /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><PrivacyPage /></PageWrapper>} />
        
        {/* 카테고리별 쇼핑 페이지 */}
        <Route path="/shop/men" element={<PageWrapper><ShopPage category="men" /></PageWrapper>} />
        <Route path="/shop/women" element={<PageWrapper><ShopPage category="women" /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
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

  return (
    <>
      <header
        className={`sticky top-0 z-[150] flex flex-col flex-none shrink-0 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-[10px] border-b border-black/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <Marquee />
        <Navbar isScrolled={isScrolled} />
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
      <CartProvider>
        <WishlistProvider>
        <Router>
          <WithdrawnToast />
          <ScrollToTop />
          <div className="flex flex-col h-screen max-h-[100dvh] bg-[#FFFFFF] text-[#000000] antialiased overflow-hidden flex">
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 2500,
                style: {
                  background: '#FFFFFF',
                  color: '#000000',
                  border: '1px solid #F0F0F0',
                  borderRadius: 0,
                },
                success: { iconTheme: { primary: '#000000' } },
              }}
            />
            <AppContent />
            <CookieBanner />
          </div>
        </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;