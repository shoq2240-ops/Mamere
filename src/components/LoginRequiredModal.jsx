import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 비로그인 상태에서 장바구니 담기/주문 시 표시하는 모달
 */
const LoginRequiredModal = ({ show, onClose }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#FFFFFF] border border-[#F0F0F0] p-8 text-center"
          >
            <p className="text-[11px] font-light tracking-[0.15em] uppercase text-[#333333] mb-2">
              로그인이 필요합니다
            </p>
            <p className="text-[10px] text-[#999999] tracking-widest mb-8">
              이 기능을 사용하려면 로그인해 주세요.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleLogin}
                className="w-full py-3.5 bg-white text-[10px] font-medium tracking-[0.2em] uppercase hover:bg-white/90 transition-colors"
            style={{ color: '#000000' }}
              >
                로그인하기
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 border border-[#E5E5E5] text-[10px] font-light tracking-[0.2em] uppercase text-[#666666] hover:text-[#000000] hover:border-[#000000] transition-colors"
              >
                취소
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginRequiredModal;
