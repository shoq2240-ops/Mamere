import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ContactModal from './ContactModal';

/** 모바일: 히어로 아래 일반 흐름(스크롤 시 노출) / md+: 히어로 하단 절대배치 오버레이 */
export const LandingFloatingFooter = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      <footer
        className="relative z-auto w-full shrink-0 border-t border-[#E8E8E8] bg-white py-6 text-gray-800 pointer-events-auto md:pointer-events-none md:absolute md:bottom-0 md:left-0 md:right-0 md:z-10 md:border-t-0 md:bg-transparent md:py-0 md:backdrop-blur-none"
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

/** 쇼핑 등 서브 페이지 공통 푸터 (랜딩 `/` 제외) */
const Footer = () => {
  const { pathname } = useLocation();
  const [isContactOpen, setIsContactOpen] = useState(false);

  if (pathname === '/' || pathname.startsWith('/admin')) {
    return null;
  }

  const linkClass =
    'text-center text-[11px] font-light leading-snug text-gray-500 transition-colors hover:text-[#1A1A1A]';

  return (
    <>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      <footer
        className="w-full shrink-0 border-t border-[#EEEEEE] bg-white text-[#1A1A1A] md:px-8 md:pb-10 md:pt-10"
        aria-label="사이트 푸터"
      >
        <div className="mx-auto w-full max-w-[1440px]">
          {/* 모바일: 2×2 그리드 */}
          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 px-6 pt-10 pb-4">
              <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                <h3 className="text-[13px] font-bold text-gray-800">법적 고지</h3>
                <Link to="/terms" className={linkClass}>
                  이용약관
                </Link>
                <Link to="/privacy" className={linkClass}>
                  개인정보 방침
                </Link>
                <Link to="/faq" className={linkClass}>
                  자주 묻는 질문
                </Link>
              </div>

              <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                <h3 className="text-[13px] font-bold text-gray-800">서비스</h3>
                <Link to="/shipping" className={linkClass}>
                  배송정보
                </Link>
                <Link to="/returns" className={linkClass}>
                  반품 및 교환 요청하기
                </Link>
                <button
                  type="button"
                  onClick={() => setIsContactOpen(true)}
                  className={`${linkClass} border-0 bg-transparent p-0 text-center`}
                >
                  문의하기
                </button>
              </div>

              <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                <h3 className="text-[13px] font-bold text-gray-800">고객 센터</h3>
                <p className="text-[11px] font-light leading-snug text-gray-500">10:00 ~ 19:00</p>
                <p className="text-[11px] font-light leading-snug text-gray-500">주말 및 공휴일 휴무</p>
              </div>

              <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                <h3 className="text-[13px] font-bold text-gray-800">소셜</h3>
                <a
                  href="https://www.instagram.com/official_mamere/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Mamere 인스타그램 (새 탭)"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center transition-opacity hover:opacity-80"
                >
                  <span className="flex h-6 w-6 items-center justify-center">
                    <img
                      src="/instagram.png"
                      alt=""
                      width={24}
                      height={24}
                      className="max-h-6 max-w-6 object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                </a>
              </div>
            </div>

            <p className="mt-8 w-full text-center text-[10px] text-gray-400">
              © 2026 mamere. all rights reserved.
            </p>
            <div className="h-10 shrink-0" aria-hidden />
          </div>

          {/* 태블릿·데스크톱: 기존 다열 그리드 */}
          <div className="hidden w-full md:grid md:grid-cols-2 lg:grid-cols-4">
            <div className="px-6 py-6 lg:border-r lg:border-[#EEEEEE]">
              <h3 className="mb-2 text-[13px] font-medium text-[#1A1A1A]">고객 센터</h3>
              <p className="mt-1 text-[11px] font-light leading-[1.8] text-[#777777]">10:00 ~ 19:00</p>
              <p className="mt-1 text-[11px] font-light leading-[1.8] text-[#777777]">주말 및 공휴일 휴무</p>
            </div>
            <div className="px-6 py-6 lg:border-r lg:border-[#EEEEEE]">
              <h3 className="mb-2 text-[13px] font-medium text-[#1A1A1A]">법적 고지</h3>
              <Link to="/terms" className="mt-1 block text-[11px] font-light leading-[1.8] text-[#777777] hover:text-[#1A1A1A]">
                이용약관
              </Link>
              <Link to="/privacy" className="mt-1 block text-[11px] font-light leading-[1.8] text-[#777777] hover:text-[#1A1A1A]">
                개인정보 방침
              </Link>
              <Link to="/faq" className="mt-1 block text-[11px] font-light leading-[1.8] text-[#777777] hover:text-[#1A1A1A]">
                자주 묻는 질문
              </Link>
            </div>
            <div className="px-6 py-6 lg:border-r lg:border-[#EEEEEE]">
              <h3 className="mb-2 text-[13px] font-medium text-[#1A1A1A]">서비스</h3>
              <Link to="/shipping" className="mt-1 block text-[11px] font-light leading-[1.8] text-[#777777] hover:text-[#1A1A1A]">
                배송정보
              </Link>
              <Link to="/returns" className="mt-1 block text-[11px] font-light leading-[1.8] text-[#777777] hover:text-[#1A1A1A]">
                반품 및 교환 요청하기
              </Link>
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="mt-1 block w-full border-0 bg-transparent p-0 text-left text-[11px] font-light leading-[1.8] text-[#777777] hover:text-[#1A1A1A]"
              >
                문의하기
              </button>
            </div>
            <div className="px-6 py-6">
              <h3 className="mb-2 text-[13px] font-medium text-[#1A1A1A]">소셜</h3>
              <a
                href="https://www.instagram.com/official_mamere/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mamere on Instagram (opens in new tab)"
                className="mt-1 inline-block transition-opacity hover:opacity-80"
              >
                <img
                  src="/instagram.png"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-auto max-w-[120px] object-contain object-left"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            </div>
          </div>

          <p className="hidden text-center text-[10px] font-light text-[#888888] md:mt-8 md:block">
            © 2026 mamere. all rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
