import React from 'react';
import { Link } from 'react-router-dom';

const FAQPage = () => {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] pt-32 pb-24 px-6 antialiased">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-block text-[10px] tracking-[0.15em] uppercase text-[#666666] hover:text-[#000000] mb-12 transition-colors">
          ← jvng.
        </Link>
        <h1 className="text-2xl font-bold tracking-tight uppercase mb-12">FAQ</h1>
        <div className="text-[11px] text-[#333333] leading-relaxed space-y-8">
          <p>자주 묻는 질문 페이지입니다. 추후 문의 유형별 FAQ를 추가할 예정입니다.</p>
          <p className="text-[#666666]">문의사항이 있으시면 <a href="mailto:shox2240@gmail.com" className="underline hover:opacity-70 transition-opacity">shox2240@gmail.com</a>으로 연락해 주세요.</p>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
