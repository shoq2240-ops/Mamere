import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ContactModal from './ContactModal';
import { useLanguage } from '../store/LanguageContext';

/** 메인 랜딩: fixed bottom 전체화면 미니멀 플로팅 푸터 */
const LandingFloatingFooter = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      <footer
        className="fixed bottom-0 left-0 w-full z-[100] pointer-events-none text-white mix-blend-difference"
        aria-label="Footer"
      >
        <div className="absolute bottom-16 left-4 md:bottom-8 md:left-8 flex flex-col gap-1.5 text-[10px] md:text-[11px] lowercase leading-relaxed pointer-events-auto text-left">
          <Link to="/terms" className="hover:opacity-70 transition-opacity">
            {t('footer.terms', 'terms')}
          </Link>
          <Link to="/privacy" className="hover:opacity-70 transition-opacity">
            {t('footer.privacy', 'privacy policy')}
          </Link>
          <Link to="/faq" className="hover:opacity-70 transition-opacity">
            {t('footer.faq', 'faq')}
          </Link>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:bottom-8 md:w-auto flex flex-col items-center gap-1 text-center text-[8px] md:text-[9px] font-light tracking-[0.05em] leading-relaxed pointer-events-auto opacity-70">
          <p className="whitespace-nowrap font-medium text-[9px] md:text-[10px] mb-1">© 2026 dr.care. all rights reserved.</p>

          <div className="hidden md:flex flex-col items-center gap-0.5">
            <p>ceo : 신천영 | tel : 010-3126-6701 | email : pjk6412@naver.com</p>
            <p>address : 경기도 용인시 기흥구 흥덕중앙로 120 유타워 3208호</p>
            <p className="opacity-60 text-[7px] md:text-[8px] mt-1">
              business license : 241-14-00646 | online license : 2019-용인기흥-0330
            </p>
          </div>

          <div className="md:hidden flex flex-col items-center gap-0.5">
            <p>ceo : 신천영 | tel : 010-3126-6701</p>
            <p className="text-center break-keep">address : 경기도 용인시 기흥구 흥덕중앙로 120</p>
          </div>
        </div>

        <div className="absolute bottom-16 right-4 md:bottom-8 md:right-8 flex flex-col gap-1.5 text-[10px] md:text-[11px] lowercase leading-relaxed pointer-events-auto text-right">
          <Link to="/shipping" className="hover:opacity-70 transition-opacity">
            {t('footer.shippingInfo', 'shipping')}
          </Link>
          <Link to="/returns" className="hover:opacity-70 transition-opacity">
            {t('footer.returns', 'returns')}
          </Link>
          <button
            type="button"
            onClick={() => setIsContactOpen(true)}
            className="text-right hover:opacity-70 transition-opacity bg-transparent border-0 p-0 cursor-pointer w-full lowercase"
          >
            {t('footer.contactForm', 'contact')}
          </button>
        </div>
      </footer>
    </>
  );
};

const Footer = () => {
  const { pathname } = useLocation();

  if (pathname === '/') {
    return <LandingFloatingFooter />;
  }

  return null;
};

export default Footer;
