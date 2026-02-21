import React, { useState, useEffect } from 'react';
import { fetchTrackingInfo } from '../lib/trackingApi';

const formatTrackingTime = (str) => {
  if (!str) return '-';
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 주문 1건에 대한 실시간 택배 조회 블록
 * - 운송장 등록 후 택배사 전산 미반영 시 "배송 정보 등록 중" 표시
 */
const OrderTrackingBlock = ({ order, className = '' }) => {
  const carrierId = order?.carrier_id || order?.carrierId || '';
  const trackingNumber = order?.tracking_number || order?.trackingNumber || '';
  const [result, setResult] = useState({ loading: true });
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (!trackingNumber?.trim()) {
      setResult({ loading: false });
      return;
    }
    setResult({ loading: true });
    fetchTrackingInfo(carrierId, trackingNumber).then((res) => {
      if (mounted) setResult(res);
    });
    return () => { setMounted(false); };
  }, [carrierId, trackingNumber, mounted]);

  if (!trackingNumber?.trim()) return null;

  const { loading, ok, message, pending, currentLocation, status, updatedAt, details } = result;

  return (
    <div className={`border-t border-[#F0F0F0] pt-4 mt-4 ${className}`}>
      <p className="text-[10px] font-medium tracking-widest uppercase text-[#999999] mb-3">배송 추적</p>
      {loading ? (
        <p className="text-[11px] text-[#999999]">조회 중...</p>
      ) : pending || message === '배송 정보 등록 중' ? (
        <p className="text-[11px] text-[#666666]">배송 정보 등록 중 — 택배사 전산에 반영되면 실시간 현황이 표시됩니다.</p>
      ) : ok ? (
        <div className="space-y-3">
          {(currentLocation || status || updatedAt) ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#333333]">
              {currentLocation && <span>현재 위치: {currentLocation}</span>}
              {status && <span>상태: {status}</span>}
              {updatedAt && <span className="text-[#999999]">업데이트: {formatTrackingTime(updatedAt)}</span>}
            </div>
          ) : (
            <p className="text-[11px] text-[#666666]">배송 정보 등록 중 — 택배사 전산에 반영되면 실시간 현황이 표시됩니다.</p>
          )}
          {Array.isArray(details) && details.length > 0 && (
            <ul className="space-y-2 max-h-32 overflow-y-auto">
              {details.slice(0, 5).map((d, i) => (
                <li key={i} className="text-[10px] text-[#666666] border-l-2 border-[#E5E5E5] pl-2">
                  <span className="text-[#999999]">{formatTrackingTime(d.time)}</span>
                  {d.status && ` · ${d.status}`}
                  {d.location && ` · ${d.location}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-[#666666]">{message || '배송 정보 등록 중'}</p>
      )}
    </div>
  );
};

export default OrderTrackingBlock;
