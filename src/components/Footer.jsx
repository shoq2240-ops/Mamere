import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black text-neutral-500 py-20 px-8 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* 상단 메뉴: NOTICE, GUIDE 등 */}
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-[10px] font-bold uppercase tracking-[0.2em] mb-12 text-neutral-300">
          <button className="hover:text-purple-500 transition-colors">Notice</button>
          <button className="hover:text-purple-500 transition-colors">Agreement</button>
          <button className="hover:text-purple-500 transition-colors">Guide</button>
          <button className="hover:text-purple-500 transition-colors text-white">Privacy Policy</button>
          <button className="hover:text-purple-500 transition-colors">Work With Us</button>
        </div>

        {/* 기업 정보 영역 */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-mono tracking-tighter leading-relaxed">
            <span>COMPANY : DOUBLE NEGATIVE STUDIO</span>
            <span className="text-neutral-800">|</span>
            <span>CEO : 박재중</span>
            <span className="text-neutral-800">|</span>
            <span>ADDRESS : SEOUL, KOREA</span>
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-mono tracking-tighter leading-relaxed">
            <span>TEL : 070-1234-5678</span>
            <span className="text-neutral-800">|</span>
            <span>BUSINESS LICENSE : 123-45-67890</span>
            <span className="text-neutral-800">|</span>
            <span>ONLINE LICENSE : 2026-SEOUL-0000</span>
          </div>

          <p className="text-[9px] font-mono mt-6 opacity-60">
            당사는 고객님이 현금 결제한 금액에 대해 토스페이먼츠와 소비자 피해 보상 보험 계약을 체결하여 안전거래를 보장하고 있습니다.
          </p>
        </div>

        {/* 카피라이트 */}
        <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
          <p className="text-[9px] font-mono tracking-[0.3em] uppercase">
            © DOUBLE NEGATIVE All rights reserved.
          </p>
          <div className="flex space-x-4 opacity-50">
            <span className="text-[8px] border border-neutral-700 px-2 py-1">ESCROW SAFE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;