import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContactModal from './ContactModal';
import { useLanguage } from '../store/LanguageContext';

const FOOTER_LINK_CLASS = "text-[11px] font-light tracking-[0.06em] text-[#F9F7F2]/90 hover:text-[#F9F7F2] transition-colors duration-200";

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
    <h3 className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#F9F7F2]/70 mb-3">{title}</h3>
    <ul className="space-y-2">
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
  const { t } = useLanguage();
  const customerService = [
    { label: t('footer.faq'), to: '/faq' },
    { label: t('footer.contactForm'), onClick: () => setIsContactOpen(true) },
  ];
  const shoppingGuide = [
    { label: t('footer.shippingInfo'), to: '/shipping' },
    { label: t('footer.returns'), to: '/returns' },
  ];
  const legal = [
    { label: t('footer.terms'), to: '/terms' },
    { label: t('footer.privacy'), to: '/privacy' },
  ];

  return (
    <>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <footer className="bg-[#2D3A2D] text-[#F9F7F2] py-12 md:py-14 px-6 md:px-8 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 mb-10">
          <FooterSection title={t('footer.customerService')} items={customerService} />
          <FooterSection title={t('footer.shoppingGuide')} items={shoppingGuide} />
          <FooterSection title={t('footer.legal')} items={legal} />
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] font-light tracking-[0.08em] leading-relaxed text-[#F9F7F2]/80">
            <span>COMPANY : Dr.Care</span>
            <span className="text-[#F9F7F2]/30">|</span>
            <span>CEO : 신천영</span>
            <span className="text-[#F9F7F2]/30">|</span>
            <span>ADDRESS : 경기도 용인시 기흥구 흥덕중앙로 120 유타워 3208호</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] font-light tracking-[0.08em] leading-relaxed text-[#F9F7F2]/90">
            <span>EMAIL : pjk6412@naver.com</span>
            <span className="text-[#F9F7F2]/30">|</span>
            <span>TEL : 010-3126-6701</span>
            <span className="text-[#F9F7F2]/30">|</span>
            <span>BUSINESS LICENSE : 241-14-00646</span>
            <span className="text-[#F9F7F2]/30">|</span>
            <span>ONLINE LICENSE : 2019-용인기흥-0330</span>
          </div>
          <p className="text-[9px] font-light tracking-[0.06em] mt-4 text-[#F9F7F2]/60 leading-relaxed">
            {t('footer.escrowNotice')}
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-[#F9F7F2]/15 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[9px] font-light tracking-[0.1em] uppercase text-[#F9F7F2]/60">
            {t('footer.allRightsReserved')}
          </p>
          <span className="text-[8px] font-light tracking-[0.08em] text-[#F9F7F2]/50">{t('footer.escrowSafe')}</span>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;
