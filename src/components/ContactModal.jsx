import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../store/AuthContext';
import { toast } from 'react-hot-toast';

const SUBJECT_OPTIONS = [
  { value: '', label: '주제 선택' },
  { value: 'general', label: '일반 문의' },
  { value: 'order', label: '주문 관련' },
  { value: 'product', label: '상품 관련' },
  { value: 'return', label: '반품/교환' },
  { value: 'shipping', label: '배송 문의' },
  { value: 'other', label: '기타' },
];

const ContactModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (!form.firstName?.trim()) next.firstName = '이름을 입력해 주세요.';
    if (!form.lastName?.trim()) next.lastName = '성을 입력해 주세요.';
    if (!form.email?.trim()) next.email = '이메일 주소를 입력해 주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = '올바른 이메일 형식이 아닙니다.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        phone: form.phone?.trim() || null,
        email: form.email.trim(),
        subject: form.subject || null,
        message: form.message?.trim() || null,
      };
      if (user?.id) payload.user_id = user.id;

      const { error } = await supabase.from('inquiries').insert(payload);

      if (error) throw error;
      toast.success('문의가 접수되었습니다. 곧 답변 드리겠습니다.');
      setForm({ firstName: '', lastName: '', phone: '', email: '', subject: '', message: '' });
      onClose();
    } catch (err) {
      toast.error(err?.message || '문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      setErrors({ submit: err?.message || '문의 접수에 실패했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/30"
        onClick={handleBackdropClick}
        aria-modal="true"
        role="dialog"
        aria-labelledby="contact-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#F9F9F9] rounded-none shadow-xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E8E8E8]">
            <h2 id="contact-modal-title" className="text-[14px] font-light tracking-[0.12em] text-[#000000]">
              문의
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-light tracking-[0.1em] text-[#999999]">*필수</span>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-[#666666] hover:text-[#000000] transition-colors -mr-1"
                aria-label="닫기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Underline Inputs */}
            <div>
              <label className="block text-[11px] font-light tracking-[0.06em] text-[#000000] mb-1">이름*</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#E0E0E0] py-2 text-[13px] text-[#000000] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#000000] transition-colors"
                placeholder=""
              />
              {errors.firstName && <p className="mt-1 text-[11px] text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-light tracking-[0.06em] text-[#000000] mb-1">성*</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#E0E0E0] py-2 text-[13px] text-[#000000] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#000000] transition-colors"
                placeholder=""
              />
              {errors.lastName && <p className="mt-1 text-[11px] text-red-600">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-light tracking-[0.06em] text-[#000000] mb-1">전화번호</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#E0E0E0] py-2 text-[13px] text-[#000000] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#000000] transition-colors"
                placeholder=""
              />
            </div>

            <div>
              <label className="block text-[11px] font-light tracking-[0.06em] text-[#000000] mb-1">이메일 주소*</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#E0E0E0] py-2 text-[13px] text-[#000000] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#000000] transition-colors"
                placeholder=""
              />
              {errors.email && <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-light tracking-[0.06em] text-[#000000] mb-1">주제 선택</label>
              <select
                value={form.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#E0E0E0] py-2 pr-8 text-[13px] text-[#000000] focus:outline-none focus:border-[#000000] transition-colors appearance-none bg-no-repeat bg-right bg-[length:12px] cursor-pointer"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")" }}
              >
                {SUBJECT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-light tracking-[0.06em] text-[#000000] mb-1">고객님의 메시지</label>
              <textarea
                value={form.message}
                onChange={(e) => handleChange('message', e.target.value)}
                rows={5}
                className="w-full resize-y min-h-[100px] bg-transparent border border-[#E0E0E0] py-3 px-3 text-[13px] text-[#000000] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#000000] transition-colors"
                placeholder=""
              />
            </div>

            {errors.submit && <p className="text-[11px] text-red-600">{errors.submit}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-[12px] font-light tracking-[0.1em] uppercase text-[#000000] border border-[#000000] bg-transparent hover:bg-[#000000] hover:text-[#FFFFFF] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '전송 중...' : '보내기'}
            </button>
          </form>

        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default ContactModal;
