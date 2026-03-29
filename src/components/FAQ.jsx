import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_ITEMS = [
  {
    id: 'shipping',
    question: '배송은 얼마나 걸리나요?',
    answer: '주문 결제 완료 후 영업일 기준 1~3일 내 출고됩니다. 지역에 따라 2~5일 소요될 수 있습니다. 배송 추적은 주문 내역에서 확인하실 수 있습니다.',
  },
  {
    id: 'return',
    question: '반품 및 교환이 가능한가요?',
    answer: '수령일로부터 7일 이내, 미착용·미사용 상태인 경우 반품·교환이 가능합니다. 단순 변심 시 왕복 배송비는 고객 부담이며, 제품 하자 시 무료 교환·반품을 진행합니다. 자세한 절차는 반품/교환 페이지를 참고해 주세요.',
  },
  {
    id: 'payment',
    question: '결제 수단은 무엇이 있나요?',
    answer: '신용카드, 체크카드, 계좌이체, 간편결제(카카오페이, 네이버페이 등)를 이용하실 수 있습니다. 모든 결제는 토스페이먼츠를 통해 안전하게 처리됩니다.',
  },
  {
    id: 'usage',
    question: '제품 사용법은 어디서 확인하나요?',
    answer: '각 상품 상세 페이지의 「사용 방법 (How to Use)」 및 「주요 성분」 섹션에서 확인하실 수 있습니다. 문의가 있으시면 문의 양식을 통해 연락 주시면 안내해 드립니다.',
  },
  {
    id: 'contact',
    question: '문의는 어떻게 하나요?',
    answer: '페이지 하단 고객 서비스의 「문의 양식 작성하기」를 이용하시거나, shox2240@gmail.com으로 이메일을 보내 주시면 됩니다. 영업일 기준 1~2일 내 답변 드리겠습니다.',
  },
];

const FAQItem = ({ item, isOpen, onToggle }) => (
  <div className="border-b border-[#A8B894]/30 last:border-b-0">
    <button
      type="button"
      onClick={() => onToggle(item.id)}
      className="w-full py-5 md:py-6 flex items-center justify-between text-left gap-4 group"
      aria-expanded={isOpen}
    >
      <span className="text-[11px] md:text-[12px] font-light tracking-[0.08em] text-[#3E2F28] group-hover:text-[#5C4A42] transition-colors pr-4">
        {item.question}
      </span>
      <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-[#A8B894] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <p className="text-[11px] font-light tracking-[0.06em] text-[#5C4A42] leading-relaxed pb-5 md:pb-6 pl-0 pr-8">
            {item.answer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/**
 * Dr.care 미니멀 블랙&화이트 FAQ 컴포넌트
 * @param {Object} props
 * @param {Array<{ id: string, question: string, answer: string }>} [props.items] - FAQ 항목 (없으면 기본 목록 사용)
 * @param {string} [props.title] - 섹션 제목 (없으면 "FAQ" 또는 비표시)
 * @param {boolean} [props.showTitle] - 제목 표시 여부 (기본 true)
 * @param {string} [props.className] - 루트 wrapper 클래스
 */
const FAQ = ({ items = DEFAULT_ITEMS, title = 'FAQ', showTitle = true, className = '' }) => {
  const [openId, setOpenId] = useState(null);

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className={`bg-[#FFFFFF] text-[#000000] antialiased ${className}`} aria-label="자주 묻는 질문">
      <div className="max-w-2xl mx-auto px-6 md:px-8">
        {showTitle && (
          <h2 className="text-lg md:text-xl font-semibold text-black uppercase tracking-tight mb-8 md:mb-10">
            {title}
          </h2>
        )}
        <div className="border-t border-[#E8E8E8]">
          {items.map((item) => (
            <FAQItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
export { DEFAULT_ITEMS };
