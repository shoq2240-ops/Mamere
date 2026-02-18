import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] pt-32 pb-24 px-6 antialiased">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-block text-[10px] tracking-[0.15em] uppercase text-[#666666] hover:text-[#000000] mb-12">
          ← jvng.
        </Link>
        <h1 className="text-2xl font-bold tracking-tight uppercase mb-12">이용약관</h1>
        <div className="text-[11px] text-[#333333] leading-relaxed space-y-6 whitespace-pre-line">
          {`제1조 (목적)
본 약관은 jvng.(이하 "회사")이 제공하는 서비스의 이용 조건 및 절차, 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "서비스"란 회사가 제공하는 온라인 쇼핑몰 및 관련 서비스를 의미합니다.
2. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원을 말합니다.

제3조 (약관의 효력 및 변경)
1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.
2. 회사는 필요한 경우 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수 있습니다.

제4조 (서비스의 제공)
회사는 다음과 같은 서비스를 제공합니다.
- 의류 및 패션 관련 상품의 판매
- 주문 및 결제 처리
- 배송 및 배송 추적
- 기타 회사가 정하는 서비스

(이하 생략 - 실제 운영 시 전문을 작성하여 교체해 주세요.)`}
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
