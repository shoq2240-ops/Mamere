import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContactModal from './ContactModal';

const FOOTER_LINK_CLASS = "text-[12px] font-light tracking-[0.08em] text-[#000000] hover:underline hover:opacity-80 transition-all duration-200";

const FooterLink = ({ to, href, onClick, children }) => {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${FOOTER_LINK_CLASS} text-left bg-transparent border-0 p-0 cursor-pointer`}>
        {children}
      </button>
    );
  }
  if (href) {
    return (
      <a href={href} className={FOOTER_LINK_CLASS}>
        {children}
      </a>
    );
  }
  return <Link to={to} className={FOOTER_LINK_CLASS}>{children}</Link>;
};

const FooterSection = ({ title, items }) => (
  <div>
    <h3 className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#000000] mb-4">{title}</h3>
    <ul className="space-y-3">
      {items.map(({ label, to, href, onClick }) => (
        <li key={label}>
          <FooterLink to={to} href={href} onClick={onClick}>{label}</FooterLink>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const customerService = [
    { label: '문의 양식 작성하기', onClick: () => setIsContactOpen(true) },
    { label: 'FAQ', to: '/faq' },
  ];
  const shoppingGuide = [
    { label: '배송 정보', to: '/shipping' },
    { label: '반품 및 교환 요청하기', to: '/returns' },
  ];
  const legal = [
    { label: '이용약관', to: '/terms' },
    { label: '개인정보 처리방침', to: '/privacy' },
  ];

  return (
    <>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <footer className="bg-[#F9F9F9] text-[#000000] py-16 md:py-20 px-6 md:px-8 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* 고객 서비스 / 쇼핑 가이드 / 법적 고지 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-16 mb-14">
          <FooterSection title="고객 서비스" items={customerService} />
          <FooterSection title="쇼핑 가이드" items={shoppingGuide} />
          <FooterSection title="법적 고지" items={legal} />
        </div>

        {/* 기업 정보 */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-light tracking-[0.12em] leading-relaxed text-[#000000]">
            <span>COMPANY : Double Negative STUDIO</span>
            <span className="text-[#CCCCCC]">|</span>
            <span>CEO : 박재중</span>
            <span className="text-[#CCCCCC]">|</span>
            <span>ADDRESS : SEOUL, KOREA</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-light tracking-[0.12em] leading-relaxed text-[#000000]">
            <span>EMAIL : shox2240@gmail.com</span>
            <span className="text-[#CCCCCC]">|</span>
            <span>TEL : 070-1234-5678</span>
            <span className="text-[#CCCCCC]">|</span>
            <span>BUSINESS LICENSE : 123-45-67890</span>
            <span className="text-[#CCCCCC]">|</span>
            <span>ONLINE LICENSE : 2026-SEOUL-0000</span>
          </div>
          <p className="text-[10px] font-light tracking-[0.1em] mt-6 text-[#666666] leading-relaxed">
            당사는 고객님이 현금 결제한 금액에 대해 토스페이먼츠와 소비자 피해 보상 보험 계약을 체결하여 안전거래를 보장하고 있습니다.
          </p>
        </div>

        {/* 카피라이트 */}
        <div className="mt-12 pt-8 border-t border-[#E8E8E8] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-light tracking-[0.15em] uppercase text-[#666666]">
            © jvng. All rights reserved.
          </p>
          <div className="flex items-center opacity-70">
            <span className="text-[9px] font-light tracking-[0.1em] border border-[#DDDDDD] px-2 py-1 text-[#666666]">ESCROW SAFE</span>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;
