import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ContactModal from './ContactModal';

/** 모바일: 히어로 블록 하단 글래스 오버레이(LandingPage 내부) / md+: 뷰포트 하단 플로팅 */
export const LandingFloatingFooter = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      <footer
        className="pointer-events-none absolute bottom-0 left-0 z-20 w-full border-t border-white/30 bg-white/40 py-6 backdrop-blur-md md:fixed md:bottom-0 md:left-0 md:z-10 md:w-full md:border-t-0 md:bg-transparent md:p-0 md:backdrop-blur-none"
        aria-label="Footer"
      >
        <div
          className="pointer-events-none hidden h-[min(42vh,22rem)] w-full bg-gradient-to-t from-white/30 to-transparent md:absolute md:bottom-0 md:left-0 md:block md:h-[min(38vh,24rem)]"
          aria-hidden="true"
        />

        {/* 모바일: 2열 메뉴 + 하단 사업자/카피 (normal flow, z-index 없음) */}
        <div className="pointer-events-auto w-full md:hidden">
          <div className="mb-5 grid w-full grid-cols-2 gap-4 px-6 text-[10px] font-medium tracking-wide text-gray-800 lowercase">
            <div className="flex min-w-0 flex-col gap-1 text-left">
              <Link to="/terms" className="text-gray-800 transition-opacity hover:opacity-70">
                terms
              </Link>
              <Link to="/privacy" className="text-gray-800 transition-opacity hover:opacity-70">
                privacy policy
              </Link>
              <Link to="/FAQ" className="text-gray-800 transition-opacity hover:opacity-70">
                FAQ
              </Link>
            </div>
            <div className="flex min-w-0 flex-col gap-1 text-right">
              <Link to="/shipping" className="text-gray-800 transition-opacity hover:opacity-70">
                shipping
              </Link>
              <Link to="/returns" className="text-gray-800 transition-opacity hover:opacity-70">
                returns
              </Link>
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="block w-full cursor-pointer border-0 bg-transparent p-0 text-right text-gray-800 transition-opacity hover:opacity-70"
              >
                contact
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1 px-6 text-center text-[9px] leading-tight text-gray-800">
            <p>© 2026 dr.care. all rights reserved.</p>
            <p className="break-words">
              ceo : 신천영 | 상호명 : DR케어 | tel : 010-3126-6701 | email : pjk6412@naver.com
            </p>
            <p className="break-words">address : 경기도 용인시 기흥구 흥덕중앙로 120 유타워 3208호</p>
            <p className="break-words">
              business license : 241-14-00646 | online license : 2019-용인기흥-0330
            </p>
          </div>
        </div>

        {/* 데스크톱: 기존 3단 플로팅 */}
        <div className="relative z-[1] m-0 hidden w-full max-w-none grid-cols-3 items-end justify-items-stretch gap-x-6 text-[11px] font-medium leading-relaxed tracking-wider text-[#333333] md:grid md:px-6 md:pb-4 md:pt-10">
          <div className="pointer-events-auto flex min-w-0 flex-col gap-1 items-start text-left lowercase">
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

          <div className="pointer-events-auto flex w-full min-w-0 max-w-none flex-col items-center gap-1 self-end text-center">
            <p className="whitespace-nowrap text-center text-[#333333]">
              © 2026 dr.care. all rights reserved.
            </p>
            <p className="break-keep text-center text-gray-800">
              ceo : 신천영 | 상호명 : DR케어 | tel : 010-3126-6701 | email : pjk6412@naver.com
            </p>
            <p className="break-keep text-center text-gray-800">
              address : 경기도 용인시 기흥구 흥덕중앙로 120 유타워 3208호
            </p>
            <p className="break-keep text-center text-gray-800">
              business license : 241-14-00646 | online license : 2019-용인기흥-0330
            </p>
          </div>

          <div className="pointer-events-auto flex min-w-0 flex-col gap-1 items-end lowercase">
            <Link to="/shipping" className="text-right text-[#333333] transition-opacity hover:opacity-70">
              shipping
            </Link>
            <Link to="/returns" className="text-right text-[#333333] transition-opacity hover:opacity-70">
              returns
            </Link>
            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="block w-full cursor-pointer border-0 bg-transparent p-0 text-right text-[#333333] transition-opacity hover:opacity-70"
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
    return null;
  }

  return (
    <footer className="mt-auto w-full border-t border-[#EEEEEE] bg-white px-6 py-4 text-center text-[10px] font-light text-[#888888]">
      © 2026 mamere. all rights reserved.
    </footer>
  );
};

export default Footer;
