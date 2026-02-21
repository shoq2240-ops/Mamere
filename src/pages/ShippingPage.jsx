import React from 'react';
import { Link } from 'react-router-dom';

const ShippingPage = () => {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] pt-32 pb-24 px-6 antialiased">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-block text-[10px] tracking-[0.15em] uppercase text-[#666666] hover:text-[#000000] mb-12 transition-colors">
          ← jvng.
        </Link>
        <h1 className="text-2xl font-bold tracking-tight uppercase mb-12">배송 정보</h1>
        <div className="text-[11px] text-[#333333] leading-relaxed space-y-6 whitespace-pre-line">
          {`배송 기간: 주문 후 2~5 영업일
배송 지역: 국내 전 지역 (일부 제주/산간 지역 추가 소요 가능)
배송비: 30,000원 이상 구매 시 무료 (미만 시 3,000원)
배송 추적: 주문 확인 메일의 링크를 통해 조회 가능

자세한 내용은 추후 업데이트될 예정입니다.`}
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;
