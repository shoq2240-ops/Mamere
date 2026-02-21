import React from 'react';

/** 주문 상태 → 5단계 스테퍼 인덱스 (0~4) */
const STATUS_TO_STEP = {
  결제완료: 0,
  배송준비중: 1,
  배송중: 2,   // '배송 시작' 또는 API 기반으로 2/3 구분 가능
  배송완료: 4,
};

const STEPS = [
  { key: 'pay', label: '결제 완료' },
  { key: 'prep', label: '상품 준비 중' },
  { key: 'start', label: '배송 시작' },
  { key: 'transit', label: '배송 중' },
  { key: 'done', label: '배송 완료' },
];

/**
 * 주문 추적 5단계 스테퍼 (Dr.care 미니멀 블랙&화이트)
 * @param {string} status - 주문 상태 (결제완료 | 배송준비중 | 배송중 | 배송완료)
 * @param {number} [transitStep] - 배송중일 때 2(배송 시작) vs 3(배송 중) 구분. API 있으면 3
 * @param {string} [className]
 */
const OrderTrackingStepper = ({ status, transitStep = 2, className = '' }) => {
  let currentIndex = STATUS_TO_STEP[status] ?? 0;
  if (status === '배송중' && transitStep === 3) currentIndex = 3;

  return (
    <div className={`w-full ${className}`} role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={5} aria-label="배송 단계">
      <div className="flex items-start w-full">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === STEPS.length - 1;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors ${
                    isCurrent ? 'bg-[#000000] ring-4 ring-[#000000]/10' : isCompleted ? 'bg-[#000000]' : 'bg-[#E5E5E5]'
                  }`}
                />
                <span
                  className={`mt-2 text-[9px] md:text-[10px] font-medium tracking-wider text-center leading-tight max-w-[3.5rem] md:max-w-[4rem] ${
                    isCurrent ? 'text-[#000000]' : isCompleted ? 'text-[#333333]' : 'text-[#CCCCCC]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`flex-1 min-w-[4px] h-px mt-1.5 self-start ${
                    index < currentIndex ? 'bg-[#000000]' : 'bg-[#E5E5E5]'
                  }`}
                  aria-hidden
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTrackingStepper;
export { STEPS, STATUS_TO_STEP };
