import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ContactModal from './ContactModal';

/** 메인 랜딩: 히어로 위 하단 고정 플로팅 푸터 + 연한 화이트 그라데이션 */
const LandingFloatingFooter = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      <footer
        className="pointer-events-none fixed bottom-0 left-0 z-10 w-full"
        aria-label="Footer"
      >
        {/* 밝은 이미지 위에서 어두운 글씨를 살짝 띄우는 연한 화이트 그라데이션 */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-[min(42vh,22rem)] w-full bg-gradient-to-t from-white/30 to-transparent md:h-[min(38vh,24rem)]"
          aria-hidden="true"
        />

        <div className="relative z-[1] m-0 mx-0 flex w-full max-w-none flex-col gap-8 px-0 pb-8 pt-12 text-[11px] font-medium leading-relaxed tracking-wider text-[#333333] md:flex-row md:items-end md:justify-between md:gap-6 md:pb-10 md:pt-16">
          <div className="pointer-events-auto flex flex-col gap-2 text-left lowercase">
            <Link to="/terms" className="text-[#333333] transition-opacity hover:opacity-70">
              terms
            </Link>
            <Link to="/privacy" className="text-[#333333] transition-opacity hover:opacity-70">
              privacy policy
            </Link>
            <Link to="/FAQ" className="text-[#333333] transition-opacity hover:opacity-70">
              FAQ
            </Link>
          </div>

          <div className="pointer-events-auto flex flex-col items-center gap-2 text-center text-[11px] font-medium leading-relaxed tracking-wider text-[#333333] md:order-none md:max-w-[50%]">
            <p className="mb-0.5 whitespace-nowrap text-[#333333]">
              © 2026 dr.care. all rights reserved.
            </p>
            <div className="hidden flex-col gap-1.5 md:flex">
              <p className="text-gray-800">
                ceo : 신천영 | 상호명 : DR케어 | tel : 010-3126-6701 | email : pjk6412@naver.com
              </p>
              <p className="text-gray-800">address : 경기도 용인시 기흥구 흥덕중앙로 120 유타워 3208호</p>
              <p className="mt-0.5 text-gray-800">
                business license : 241-14-00646 | online license : 2019-용인기흥-0330
              </p>
            </div>
            <div className="flex flex-col gap-1.5 md:hidden">
              <p className="text-gray-800">ceo : 신천영 | tel : 010-3126-6701</p>
              <p className="break-keep text-center text-gray-800">
                address : 경기도 용인시 기흥구 흥덕중앙로 120
              </p>
            </div>
          </div>

          <div className="pointer-events-auto flex flex-col gap-2 text-right lowercase md:items-end">
            <Link to="/shipping" className="text-[#333333] transition-opacity hover:opacity-70">
              shipping
            </Link>
            <Link to="/returns" className="text-[#333333] transition-opacity hover:opacity-70">
              returns
            </Link>
            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="w-full cursor-pointer border-0 bg-transparent p-0 text-right text-[#333333] transition-opacity hover:opacity-70 md:w-auto"
            >
              contact
            </button>
          </div>
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

  return (
    <footer className="mt-auto w-full border-t border-[#EEEEEE] bg-white px-6 py-4 text-center text-[10px] font-light text-[#888888]">
      © 2026 mamere. all rights reserved.
    </footer>
  );
};

export default Footer;
