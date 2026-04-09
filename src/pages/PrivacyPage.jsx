import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-sm font-semibold tracking-tight text-black">{title}</h2>
    <div className="space-y-3 text-[11px] leading-relaxed text-[#333333] break-keep">{children}</div>
  </section>
);

const Subheading = ({ children }) => (
  <h3 className="mt-4 text-xs font-semibold text-black first:mt-0">{children}</h3>
);

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-[#FFFFFF] px-6 pb-24 pt-32 text-[#000000] antialiased">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="mb-12 inline-block text-[10px] uppercase tracking-[0.15em] text-[#666666] hover:text-[#000000]"
        >
          ← home
        </Link>
        <h1 className="mb-12 text-2xl font-semibold uppercase tracking-tight text-black">개인정보 처리방침</h1>
        <article className="space-y-10 break-keep text-[11px] leading-relaxed text-[#333333]">
          <p className="text-[11px] leading-relaxed text-[#333333]">
            DR케어(이하 &quot;회사&quot;)는 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 관련 법령상의
            개인정보보호 규정을 준수하며, 이용자의 개인정보 보호에 최선을 다하고 있습니다. 회사는 본 개인정보 처리방침을
            통하여 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가
            취해지고 있는지 알려드립니다.
          </p>

          <Section title="제1조 (개인정보의 수집 및 이용 목적)">
            <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
            <Subheading>서비스 제공 및 계약 이행</Subheading>
            <p>
              물품 배송, 청구서 발송, 콘텐츠 제공, 본인인증, 구매 및 요금 결제, 요금 추심
            </p>
            <Subheading>회원 관리</Subheading>
            <p>
              회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사
              확인, 연령확인, 불만 처리 등 민원처리, 고지사항 전달
            </p>
            <Subheading>마케팅 및 광고에의 활용</Subheading>
            <p>
              신규 서비스(제품) 개발 및 특화, 이벤트 등 광고성 정보 전달, 인구통계학적 특성에 따른 서비스 제공 및 광고
              게재, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계
            </p>
          </Section>

          <Section title="제2조 (수집하는 개인정보의 항목 및 수집 방법)">
            <Subheading>수집하는 개인정보 항목</Subheading>
            <ul className="list-none space-y-2 pl-0">
              <li>
                <span className="font-medium text-[#111111]">회원가입 시 (필수):</span> 이메일, 비밀번호, 이름, 주소,
                휴대전화번호
              </li>
              <li>
                <span className="font-medium text-[#111111]">구매 및 결제 시:</span> 결제 수단에 따른 결제 기록(신용카드
                정보, 은행계좌 정보 등), 수취인 정보(이름, 주소, 연락처)
              </li>
              <li>
                <span className="font-medium text-[#111111]">서비스 이용 과정에서 자동 수집:</span> IP Address, 쿠키, 방문
                일시, 서비스 이용 기록, 불량 이용 기록
              </li>
            </ul>
            <Subheading>개인정보 수집 방법</Subheading>
            <p>홈페이지(회원가입, 게시판, 주문), 서면양식, 전화, 팩스, 이메일</p>
          </Section>

          <Section title="제3조 (개인정보의 보유 및 이용 기간)">
            <p>
              회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의
              정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.
            </p>
            <Subheading>관련 법령에 의한 정보 보유 사유 (전자상거래 등에서의 소비자보호에 관한 법률 등)</Subheading>
            <ul className="list-none space-y-1 pl-0">
              <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
              <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
              <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
              <li>웹사이트 방문 기록 (통신비밀보호법): 3개월</li>
            </ul>
          </Section>

          <Section title="제4조 (개인정보의 파기절차 및 방법)">
            <p>
              회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 파기절차 및
              방법은 다음과 같습니다.
            </p>
            <Subheading>파기절차</Subheading>
            <p>
              이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련
              법령에 따라 일정 기간 저장된 후 혹은 즉시 파기됩니다.
            </p>
            <Subheading>파기방법</Subheading>
            <p>
              전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다. 종이에 출력된
              개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.
            </p>
          </Section>

          <Section title="제5조 (개인정보의 제3자 제공)">
            <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.</p>
            <ul className="list-none space-y-1 pl-0">
              <li>이용자들이 사전에 동의한 경우</li>
              <li>
                법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우
              </li>
            </ul>
          </Section>

          <Section title="제6조 (개인정보 처리의 위탁)">
            <p>
              회사는 원활하고 향상된 서비스 제공을 위하여 다음과 같이 개인정보를 위탁하고 있으며, 관계 법령에 따라
              위탁계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다.
            </p>
            <ul className="list-none space-y-2 pl-0">
              <li>
                <span className="font-medium text-[#111111]">배송 업무:</span> CJ대한통운 (위탁내용: 상품 배송 업무)
              </li>
              <li>
                <span className="font-medium text-[#111111]">결제 처리:</span> 주)KG이니시스 (위탁내용: 상품 구매에 따른
                신용카드, 가상계좌 등 결제 처리)
              </li>
              <li>
                <span className="font-medium text-[#111111]">본인인증:</span> 이용하시는 인증기관 입력 (예:
                NICE평가정보(주)) (위탁내용: 회원가입 및 결제 시 본인확인)
              </li>
            </ul>
          </Section>

          <Section title="제7조 (이용자 및 법정대리인의 권리와 그 행사방법)">
            <p>
              이용자 및 법정대리인은 언제든지 등록되어 있는 자신 혹은 당해 만 14세 미만 아동의 개인정보를 조회하거나 수정할
              수 있으며 가입 해지를 요청할 수도 있습니다.
            </p>
            <p>
              개인정보 조회, 수정을 위해서는 &apos;개인정보변경&apos;(또는 &apos;회원정보수정&apos; 등)을, 가입
              해지(동의철회)를 위해서는 &apos;회원탈퇴&apos;를 클릭하여 본인 확인 절차를 거치신 후 직접 열람, 정정 또는
              탈퇴가 가능합니다.
            </p>
            <p>
              혹은 개인정보보호책임자에게 서면, 전화 또는 이메일로 연락하시면 지체 없이 조치하겠습니다.
            </p>
          </Section>

          <Section title="제8조 (개인정보 자동 수집 장치의 설치, 운영 및 그 거부에 관한 사항)">
            <p>회사는 이용자의 정보를 수시로 저장하고 찾아내는 &apos;쿠키(cookie)&apos; 등을 운용합니다.</p>
            <Subheading>쿠키의 사용 목적</Subheading>
            <p>
              회원과 비회원의 접속 빈도나 방문 시간 파악, 이용자의 취향과 관심분야 파악 및 자취 추적, 각종 이벤트 참여
              정도 및 방문 회수 파악 등을 통한 타겟 마케팅 및 맞춤 서비스 제공
            </p>
            <Subheading>쿠키의 설치/운영 및 거부</Subheading>
            <p>
              이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서 웹브라우저에서 옵션을 설정함으로써 모든 쿠키를
              허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다. 단, 쿠키
              설치를 거부하였을 경우 로그인이 필요한 일부 서비스 이용에 어려움이 있을 수 있습니다.
            </p>
          </Section>

          <Section title="제9조 (개인정보 보호책임자 및 담당자)">
            <p>
              회사는 고객의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 개인정보 보호책임자를
              지정하고 있습니다.
            </p>
            <ul className="list-none space-y-1 pl-0">
              <li>
                <span className="font-medium text-[#111111]">개인정보 보호책임자 성명:</span> 박재희
              </li>
              <li>
                <span className="font-medium text-[#111111]">전화번호:</span> 010-9187-2250
              </li>
              <li>
                <span className="font-medium text-[#111111]">이메일:</span> shox2240@gmail.com
              </li>
            </ul>
            <p className="pt-2">
              이용자는 회사의 서비스를 이용하시며 발생하는 모든 개인정보보호 관련 민원을 개인정보 보호책임자 혹은
              담당부서로 신고하실 수 있습니다. 회사는 이용자들의 신고사항에 대해 신속하게 충분한 답변을 드릴 것입니다.
            </p>
          </Section>
        </article>
      </div>
    </div>
  );
};

export default PrivacyPage;
