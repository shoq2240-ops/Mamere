import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-sm font-semibold tracking-tight text-black">{title}</h2>
    <div className="space-y-3 text-[11px] leading-relaxed text-[#333333] break-keep">{children}</div>
  </section>
);

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-[#FFFFFF] px-6 pb-24 pt-32 text-[#000000] antialiased">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="mb-12 inline-block text-[10px] uppercase tracking-[0.15em] text-[#666666] hover:text-[#000000]"
        >
          ← home
        </Link>
        <h1 className="mb-12 text-2xl font-semibold uppercase tracking-tight text-black">이용약관</h1>
        <article className="space-y-10 break-keep text-[11px] leading-relaxed text-[#333333]">
          <Section title="제1조 (목적)">
            <p>
              본 약관은 DR케어(이하 &quot;회사&quot;)가 운영하는 마메르 온라인 쇼핑몰(이하 &quot;몰&quot;)에서 제공하는
              인터넷 관련 서비스(이하 &quot;서비스&quot;)를 이용함에 있어 사이버 몰과 이용자의 권리·의무 및 책임사항을
              규정함을 목적으로 합니다.
            </p>
          </Section>

          <Section title="제2조 (정의)">
            <p>
              &quot;몰&quot;이란 회사가 재화 또는 용역(이하 &quot;재화 등&quot;)을 이용자에게 제공하기 위하여 컴퓨터 등
              정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말하며, 아울러 사이버몰을 운영하는
              사업자의 의미로도 사용합니다.
            </p>
            <p>
              &quot;이용자&quot;란 &quot;몰&quot;에 접속하여 본 약관에 따라 &quot;몰&quot;이 제공하는 서비스를 받는 회원
              및 비회원을 말합니다.
            </p>
            <p>
              &quot;회원&quot;이라 함은 &quot;몰&quot;에 개인정보를 제공하여 회원등록을 한 자로서, &quot;몰&quot;의 정보를
              지속적으로 제공받으며, &quot;몰&quot;이 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.
            </p>
            <p>
              &quot;비회원&quot;이라 함은 회원에 가입하지 않고 &quot;몰&quot;이 제공하는 서비스를 이용하는 자를 말합니다.
            </p>
          </Section>

          <Section title="제3조 (약관 등의 명시와 설명 및 개정)">
            <p>
              &quot;몰&quot;은 본 약관의 내용과 상호 및 대표자 성명, 영업소 소재지 주소, 전화번호, 전자우편주소,
              사업자등록번호, 통신판매업 신고번호, 개인정보관리책임자 등을 이용자가 쉽게 알 수 있도록 &quot;몰&quot;의 초기
              서비스화면(전면)에 게시합니다.
            </p>
            <p>
              &quot;몰&quot;은 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」, 「전자문서 및
              전자거래기본법」, 「전자금융거래법」, 「전자서명법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」,
              「방문판매 등에 관한 법률」, 「소비자기본법」 등 관련 법을 위배하지 않는 범위에서 본 약관을 개정할 수
              있습니다.
            </p>
            <p>
              &quot;몰&quot;이 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 몰의 초기화면에 그
              적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
            </p>
          </Section>

          <Section title="제4조 (서비스의 제공 및 변경)">
            <p>&quot;몰&quot;은 다음과 같은 업무를 수행합니다.</p>
            <ul className="list-none space-y-1 pl-0">
              <li>① 재화 또는 용역에 대한 정보 제공 및 구매계약의 체결</li>
              <li>② 구매계약이 체결된 재화 또는 용역의 배송</li>
              <li>③ 기타 &quot;몰&quot;이 정하는 업무</li>
            </ul>
            <p>
              &quot;몰&quot;은 재화 또는 용역의 품절 또는 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해
              제공할 재화 또는 용역의 내용을 변경할 수 있습니다.
            </p>
          </Section>

          <Section title="제5조 (서비스의 중단)">
            <p>
              &quot;몰&quot;은 컴퓨터 등 정보통신설비의 보수점검·교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는
              서비스의 제공을 일시적으로 중단할 수 있습니다.
            </p>
          </Section>

          <Section title="제6조 (회원가입)">
            <p>
              이용자는 &quot;몰&quot;이 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써
              회원가입을 신청합니다.
            </p>
            <p>
              &quot;몰&quot;은 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로
              등록합니다.
            </p>
            <ul className="list-none space-y-1 pl-0">
              <li>① 가입신청자가 본 약관 제7조 제3항에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
              <li>② 등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
            </ul>
          </Section>

          <Section title="제7조 (회원 탈퇴 및 자격 상실 등)">
            <p>
              회원은 &quot;몰&quot;에 언제든지 탈퇴를 요청할 수 있으며 &quot;몰&quot;은 즉시 회원탈퇴를 처리합니다.
            </p>
            <p>
              회원이 다음 각 호의 사유에 해당하는 경우, &quot;몰&quot;은 회원자격을 제한 및 정지시킬 수 있습니다.
            </p>
            <ul className="list-none space-y-1 pl-0">
              <li>① 가입 신청 시에 허위 내용을 등록한 경우</li>
              <li>
                ② &quot;몰&quot;을 이용하여 구입한 재화 등의 대금, 기타 &quot;몰&quot; 이용에 관련하여 회원이 부담하는
                채무를 기일에 지급하지 않는 경우
              </li>
              <li>
                ③ 다른 사람의 &quot;몰&quot; 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우
              </li>
            </ul>
          </Section>

          <Section title="제8조 (구매신청)">
            <p>
              &quot;몰&quot; 이용자는 &quot;몰&quot;상에서 다음 또는 이와 유사한 방법에 의하여 구매를 신청하며,
              &quot;몰&quot;은 이용자가 구매신청을 함에 있어서 다음의 각 내용을 알기 쉽게 제공하여야 합니다.
            </p>
            <ul className="list-none space-y-1 pl-0">
              <li>재화 등의 검색 및 선택</li>
              <li>받는 사람의 성명, 주소, 전화번호, 전자우편주소 등의 입력</li>
              <li>
                약관내용, 청약철회권이 제한되는 서비스, 배송료 등의 비용부담과 관련한 내용에 대한 확인
              </li>
              <li>결제방법의 선택</li>
            </ul>
          </Section>

          <Section title="제9조 (계약의 성립)">
            <p>
              &quot;몰&quot;은 제8조와 같은 구매신청에 대하여 다음 각 호에 해당하면 승낙하지 않을 수 있습니다.
            </p>
            <ul className="list-none space-y-1 pl-0">
              <li>① 신청 내용에 허위, 기재누락, 오기가 있는 경우</li>
              <li>② 기타 구매신청에 승낙하는 것이 &quot;몰&quot; 기술상 현저히 지장이 있다고 판단하는 경우</li>
            </ul>
          </Section>

          <Section title="제10조 (지급방법)">
            <p>
              &quot;몰&quot;에서 구매한 재화 또는 용역에 대한 대금지급방법은 다음 각 호의 방법 중 가용한 방법으로 할 수
              있습니다.
            </p>
            <ul className="list-none space-y-1 pl-0">
              <li>폰뱅킹, 인터넷뱅킹, 메일 뱅킹 등의 각종 계좌이체</li>
              <li>선불카드, 직불카드, 신용카드 등의 각종 카드 결제</li>
              <li>온라인무통장입금</li>
              <li>간편결제 등에 의한 결제</li>
            </ul>
          </Section>

          <Section title="제11조 (재화 등의 공급)">
            <p>
              &quot;몰&quot;은 이용자와 재화 등의 공급시기에 관하여 별도의 약정이 없는 이상, 이용자가 청약을 한 날부터
              7일 이내에 재화 등을 배송할 수 있도록 주문제작, 포장 등 기타의 필요한 조치를 취합니다.
            </p>
            <p>
              &quot;몰&quot;은 이용자가 구매한 재화에 대해 배송수단, 수단별 배송비용 부담자, 수단별 배송기간 등을
              명시합니다.
            </p>
          </Section>

          <Section title="제12조 (환급)">
            <p>
              &quot;몰&quot;은 이용자가 구매신청한 재화 등이 품절 등의 사유로 인도 또는 제공을 할 수 없을 때에는 지체
              없이 그 사유를 이용자에게 통지하고 사전에 재화 등의 대금을 받은 경우에는 대금을 받은 날부터 3영업일 이내에
              환급하거나 환급에 필요한 조치를 취합니다.
            </p>
          </Section>

          <Section title="제13조 (청약철회 등)">
            <p>
              &quot;몰&quot;과 재화 등의 구매에 관한 계약을 체결한 이용자는 「전자상거래 등에서의 소비자보호에 관한 법률」
              제13조 제2항에 따른 계약내용에 관한 서면을 받은 날(그 서면을 받은 때보다 재화 등의 공급이 늦게 이루어진
              경우에는 재화 등을 공급받거나 재화 등의 공급이 시작된 날을 말합니다)부터 7일 이내에는 청약의 철회를 할 수
              있습니다.
            </p>
            <p>이용자는 재화 등을 배송받은 경우 다음 각 호에 해당하는 경우에는 반품 및 교환을 할 수 없습니다.</p>
            <ul className="list-none space-y-1 pl-0">
              <li>
                ① 이용자에게 책임 있는 사유로 재화 등이 멸실 또는 훼손된 경우 (다만, 내용 확인을 위해 포장 등을 훼손한
                경우는 제외)
              </li>
              <li>② 이용자의 사용 또는 일부 소비에 의하여 재화 등의 가치가 현저히 감소한 경우</li>
              <li>③ 시간의 경과에 의하여 재판매가 곤란할 정도로 재화 등의 가치가 현저히 감소한 경우</li>
              <li>
                ④ 같은 성능을 지닌 재화 등으로 복제가 가능한 경우 그 원본인 재화 등의 포장을 훼손한 경우
              </li>
            </ul>
          </Section>

          <Section title="제14조 (청약철회 등의 효과)">
            <p>
              &quot;몰&quot;은 이용자로부터 재화 등을 반환받은 경우 3영업일 이내에 이미 지급받은 재화 등의 대금을
              환급합니다.
            </p>
            <p>
              청약철회 등의 경우 공급받은 재화 등의 반환에 필요한 비용은 이용자가 부담합니다. 다만 재화 등의 내용이
              표시·광고 내용과 다르거나 계약내용과 다르게 이행되어 청약철회 등을 하는 경우 재화 등의 반환에 필요한 비용은
              &quot;몰&quot;이 부담합니다.
            </p>
          </Section>

          <Section title="제15조 (개인정보보호)">
            <p>
              &quot;몰&quot;은 이용자의 개인정보 수집시 서비스제공을 위하여 필요한 범위에서 최소한의 개인정보를 수집합니다.
              개인정보보호에 관한 자세한 사항은 &quot;몰&quot;이 제공하는 &apos;개인정보처리방침&apos;에 따릅니다.
            </p>
          </Section>

          <Section title="제16조 (분쟁해결)">
            <p>
              &quot;몰&quot;은 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여
              피해보상처리기구를 설치·운영합니다.
            </p>
            <p>
              &quot;몰&quot;은 이용자로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다. 다만, 신속한
              처리가 곤란한 경우에는 이용자에게 그 사유와 처리일정을 즉시 통보해 드립니다.
            </p>
          </Section>

          <Section title="제17조 (재판권 및 준거법)">
            <p>
              &quot;몰&quot;과 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가
              없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다.
            </p>
            <p>&quot;몰&quot;과 이용자 간에 제기된 전자상거래 소송에는 한국법을 적용합니다.</p>
          </Section>

          <section className="space-y-3 border-t border-[#EEEEEE] pt-8">
            <h2 className="text-sm font-semibold tracking-tight text-black">부칙</h2>
            <p className="text-[11px] leading-relaxed text-[#333333] break-keep">
              본 약관은 2026년 04월 01일부터 시행합니다.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default TermsPage;
