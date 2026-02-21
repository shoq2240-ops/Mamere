import React from 'react';
import { Link } from 'react-router-dom';

const ReturnsPage = () => {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] pt-32 pb-24 px-6 antialiased">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-block text-[10px] tracking-[0.15em] uppercase text-[#666666] hover:text-[#000000] mb-12 transition-colors">
          ← Dr.care
        </Link>
        <h1 className="text-2xl font-bold tracking-tight uppercase mb-12">반품 및 교환</h1>
        <div className="text-[11px] text-[#333333] leading-relaxed space-y-6 whitespace-pre-line">
          {`반품/교환 기간: 수령일로부터 7일 이내
반품/교환 조건: 상품 미착용, 태그 부착 상태 유지 시 가능
신청 방법: shox2240@gmail.com으로 문의 주시면 안내드립니다.

자세한 안내는 추후 반품 양식 페이지로 확장될 예정입니다.`}
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage;
