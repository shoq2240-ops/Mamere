import React, { useState } from "react"; // useState 추가
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Footer from './components/Footer';
import CollectionPage from './pages/CollectionPage';
import LoginPage from './pages/LoginPage';

// 페이지 임포트
import PhilosophyPage from './pages/PhilosophyPage';
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import ShopPage from "./pages/ShopPage";
import LookbookPage from "./pages/LookbookPage";
import ProductDetail from "./pages/ProductDetail";

// 1. 페이지 전환 효과를 관리하는 컴포넌트
// addToCart 함수를 props로 받아 각 페이지에 전달합니다.
const AnimatedRoutes = ({ addToCart }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><LandingPage addToCart={addToCart} /></PageWrapper>} />
        <Route path="/philosophy" element={<PageWrapper><PhilosophyPage /></PageWrapper>} />
        {/* ShopPage나 ProductDetail에서 버튼을 눌러 수량을 올릴 수 있도록 함수 전달 */}
        <Route path="/shop" element={<PageWrapper><ShopPage addToCart={addToCart} /></PageWrapper>} />
        <Route path="/lookbook" element={<PageWrapper><LookbookPage /></PageWrapper>} />
        <Route path="/product/:id" element={<PageWrapper><ProductDetail addToCart={addToCart} /></PageWrapper>} />
        <Route path="/collection" element={<PageWrapper><CollectionPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

// 2. 보랏빛 노이즈 레이어 (효과 설정 유지)
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

// 3. 메인 App 컴포넌트
function App() {
  // 장바구니 수량 상태 정의
  const [cartCount, setCartCount] = useState(0);

  // 수량을 1씩 증가시키는 함수
  const addToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  return (
    <Router>
      <div className="bg-black text-white min-h-screen selection:bg-purple-500">
        {/* Navbar에 현재 수량을 전달합니다 */}
        <Navbar cartCount={cartCount} />
        
        {/* 페이지 컴포넌트들에 addToCart 함수를 전달합니다 */}
        <AnimatedRoutes addToCart={addToCart} />
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;