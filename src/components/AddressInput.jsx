import React, { useCallback } from 'react';

const SCRIPT_URL = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

/**
 * Daum 스크립트 로드 후 실행
 */
const loadDaumScript = () => {
  return new Promise((resolve) => {
    if (window.daum?.Postcode) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

/**
 * Daum 우편번호 검색 결과를 전체 주소 문자열로 변환
 */
const formatAddress = (data) => {
  let fullAddress = data.address;
  let extraAddress = '';

  if (data.addressType === 'R') {
    if (data.bname !== '') extraAddress += data.bname;
    if (data.buildingName !== '') {
      extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
    }
    fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
  }

  return fullAddress;
};

/**
 * 기본 주소 + 상세 주소를 하나의 문자열로 결합
 */
export const combineAddress = (base, detail) => {
  const b = (base || '').trim();
  const d = (detail || '').trim();
  return d ? `${b} ${d}`.trim() : b;
};

/**
 * 저장된 주소 분리 (기존 단일 필드 데이터 호환)
 * 새로 저장 시 combineAddress로 합쳐지므로, 로드 시엔 전체를 기본 주소에 넣고 상세는 비움
 */
export const splitAddress = (full) => {
  if (!full || typeof full !== 'string') return { base: '', detail: '' };
  return { base: full.trim(), detail: '' };
};

/**
 * 대한민국 주소 찾기 (Daum 우편번호 API) 연동 + 상세 주소 입력
 */
const AddressInput = ({
  addressValue,
  onAddressChange,
  detailValue,
  onDetailChange,
  addressPlaceholder = '기본 주소 (주소 찾기)',
  detailPlaceholder = '상세 주소 (동, 호수 등)',
  className = '',
  inputClassName = '',
}) => {
  const handleComplete = useCallback(
    (data) => {
      const fullAddress = formatAddress(data);
      onAddressChange(fullAddress);
    },
    [onAddressChange]
  );

  const handleClick = useCallback(async () => {
    await loadDaumScript();
    if (!window.daum?.Postcode) return;
    new window.daum.Postcode({
      oncomplete: handleComplete,
    }).open();
  }, [handleComplete]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <input
          type="text"
          value={addressValue}
          onChange={(e) => onAddressChange(e.target.value.slice(0, 400))}
          placeholder={addressPlaceholder}
          className={`flex-1 bg-[#F9F9F9] px-4 py-3 text-[11px] text-[#000000] outline-none focus:bg-[#F5F5F5] placeholder:text-[#999999] ${inputClassName}`}
        />
        <button
          type="button"
          onClick={handleClick}
          className="shrink-0 px-4 py-3 text-[10px] font-bold tracking-widest uppercase border border-[#E5E5E5] text-[#000000] hover:bg-[#F5F5F5] transition-colors whitespace-nowrap"
        >
          주소 찾기
        </button>
      </div>
      <input
        type="text"
        value={detailValue}
        onChange={(e) => onDetailChange(e.target.value.slice(0, 100))}
        placeholder={detailPlaceholder}
        className={`w-full bg-[#F9F9F9] px-4 py-3 text-[11px] text-[#000000] outline-none focus:bg-[#F5F5F5] placeholder:text-[#999999] ${inputClassName}`}
      />
    </div>
  );
};

export default AddressInput;
