import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#FFFFFF] text-[#666666] py-20 px-8 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* 상단 메뉴: NOTICE, GUIDE 등 */}
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-[10px] font-bold uppercase tracking-extra-wide mb-12 text-[#666666]">
          <button className="hover:text-[#000000] transition-colors">Notice</button>
          <button className="hover:text-[#000000] transition-colors">Agreement</button>
          <button className="hover:text-[#000000] transition-colors">Guide</button>
          <button className="hover:text-[#000000] transition-colors text-[#000000]">Privacy Policy</button>
          <button className="hover:text-[#000000] transition-colors">Work With Us</button>
        </div>

        {/* 기업 정보 영역 */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-mono tracking-tighter leading-relaxed">
            <span>COMPANY : jvng. STUDIO</span>
            <span className="text-[#CCCCCC]">|</span>
            <span>CEO : 박재중</span>
            <span className="text-[#CCCCCC]">|</span>
            <span>ADDRESS : SEOUL, KOREA</span>
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-mono tracking-tighter leading-relaxed">
            <span>TEL : 070-1234-5678</span>
            <span className="text-[#CCCCCC]">|</span>
            <span>BUSINESS LICENSE : 123-45-67890</span>
            <span className="text-[#CCCCCC]">|</span>
            <span>ONLINE LICENSE : 2026-SEOUL-0000</span>
          </div>

          <p className="text-[9px] font-mono mt-6 opacity-60">
            당사는 고객님이 현금 결제한 금액에 대해 토스페이먼츠와 소비자 피해 보상 보험 계약을 체결하여 안전거래를 보장하고 있습니다.
          </p>
        </div>

        {/* 카피라이트 */}
        <div className="mt-12 pt-8 border-t border-[#F0F0F0] flex justify-between items-center">
          <p className="text-[9px] font-mono tracking-ultra-wide uppercase text-[#666666]">
            © jvng. All rights reserved.
          </p>
          <div className="flex space-x-4 opacity-70">
            <span className="text-[8px] border border-[#DDDDDD] px-2 py-1 text-[#666666]">ESCROW SAFE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;