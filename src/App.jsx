import React, { useState } from "react"; // 👈 useState 추가
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CartProvider, useCart } from "./store/CartContext"; // 👈 useCart 추가
import ScrollToTop from "./components/ScrollToTop"; // 👈 추가

// 컴포넌트 및 페이지 임포트
import Navbar from "./components/Navbar";
import Footer from './components/Footer';
import LandingPage from "./pages/LandingPage";
import PhilosophyPage from './pages/PhilosophyPage';
import ShopPage from "./pages/ShopPage";
import LookbookPage from "./pages/LookbookPage";
import ProductDetail from "./pages/ProductDetail";
import CollectionPage from './pages/CollectionPage';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';

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
        <Route path="/product/:id" element={<PageWrapper><ProductDetail /></PageWrapper>} />
        <Route path="/collection" element={<PageWrapper><CollectionPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper><CartPage /></PageWrapper>} />
        
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
      className="fixed inset-0 z-[9999] pointer-events-none mix-blend-screen bg-purple-900/20 noise-overlay"
    />
    {children}
  </motion.div>
);

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <div className="bg-black text-white min-h-screen antialiased">
          <Navbar />
          <AnimatedRoutes />
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;