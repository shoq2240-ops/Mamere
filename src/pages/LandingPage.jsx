import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getAbsoluteUrl } from '../lib/getAbsoluteUrl';

const HERO_IMAGE_SRC = '/hero-landing.jpg';
const HERO_IMAGE_ALT = '마메르 메인 비주얼';

const LandingPage = () => {
  const mainOgImage = getAbsoluteUrl(HERO_IMAGE_SRC);
  const mainDescription = '매일 마주하는 자극으로부터 피부를 다정하게 지켜냅니다. 마메르와 함께 피부가 편안하게 숨 쉬는 시간을 경험해 보세요.';

  return (
    <div className="flex w-full flex-col overflow-x-hidden bg-white">
      <Helmet>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="마메르(mamère) | 다정한 위로, 순수한 자연" />
        <meta property="og:description" content={mainDescription} />
        <meta property="og:url" content={getAbsoluteUrl('/')} />
        {mainOgImage && <meta property="og:image" content={mainOgImage} />}
        <meta property="og:site_name" content="마메르(mamère)" />
      </Helmet>

      {/* 히어로: 이미지는 fixed 헤더(특히 네비 글래스) 뒤까지 깔려 backdrop-blur가 사진을 비춤. 마키는 불투명 배경으로 덮임 */}
      <section
        className="relative m-0 flex min-h-[100dvh] min-h-screen w-full shrink-0 flex-col overflow-hidden bg-neutral-900"
        aria-label="메인 비주얼"
      >
        <div className="absolute inset-0 w-full">
          <img
            src={HERO_IMAGE_SRC}
            alt={HERO_IMAGE_ALT}
            className="block h-full w-full object-cover object-[center_42%] md:object-[center_40%]"
            decoding="async"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
