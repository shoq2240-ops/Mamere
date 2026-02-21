import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] pt-32 pb-24 px-6 antialiased">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-block text-[10px] tracking-[0.15em] uppercase text-[#666666] hover:text-[#000000] mb-12">
          ← Dr.care
        </Link>
        <h1 className="text-2xl font-bold tracking-tight uppercase mb-12">개인정보 처리방침</h1>
        <div className="text-[11px] text-[#333333] leading-relaxed space-y-6 whitespace-pre-line">
          {`제1조 (개인정보의 수집 및 이용 목적)
Dr.care(이하 "회사")은 다음의 목적을 위해 개인정보를 수집 및 이용합니다.
- 서비스 제공 및 계약 이행
- 회원 관리 및 본인 확인
- 주문 및 배송 처리
- 고객 상담 및 불만 처리

제2조 (수집하는 개인정보 항목)
회사는 다음과 같은 개인정보를 수집합니다.
- 필수: 이메일, 비밀번호, 이름, 주소, 전화번호
- 선택: 생년월일, 성별
- 자동 수집: 쿠키, 접속 로그, IP 주소

제3조 (개인정보의 보유 및 이용 기간)
회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.

제4조 (개인정보의 제3자 제공)
회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.

(이하 생략 - 실제 운영 시 전문을 작성하여 교체해 주세요.)`}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
