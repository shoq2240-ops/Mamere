import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../store/AuthContext';
import { publicTable, supabase } from '../lib/supabase';

const REQUEST_TYPES = [
  { value: '반품', label: '반품' },
  { value: '교환', label: '교환' },
];

const REASONS = [
  { value: '', label: '사유 선택' },
  { value: '단순 변심', label: '단순 변심' },
  { value: '상품 파손', label: '상품 파손' },
  { value: '오배송', label: '오배송' },
  { value: '피부 트러블', label: '피부 트러블' },
  { value: '기타', label: '기타' },
];

const RETURNS_BUCKET = 'product-images';
const RETURNS_PREFIX = 'return-attachments';

async function uploadReturnAttachments(files, userId) {
  const urls = [];
  const ts = Date.now();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file || !(file instanceof File)) continue;
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const safeExt = ['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    const path = `${RETURNS_PREFIX}/${userId || 'anon'}_${ts}_${i}.${safeExt}`;
    const { data, error } = await supabase.storage.from(RETURNS_BUCKET).upload(path, file, { upsert: false });
    if (error) throw new Error(error.message || '파일 업로드 실패');
    const { data: urlData } = supabase.storage.from(RETURNS_BUCKET).getPublicUrl(data.path);
    if (urlData?.publicUrl) urls.push(urlData.publicUrl);
  }
  return urls;
}

const ReturnsPage = () => {
  const { user } = useAuth();
  const [loadingOrder, setLoadingOrder] = useState(!!user?.id);
  const [latestOrderNumber, setLatestOrderNumber] = useState('');
  const [orderLoadMessage, setOrderLoadMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    order_number: '',
    request_type: '반품',
    reason: '',
    detail: '',
    attachments: [],
  });

  useEffect(() => {
    if (!user?.id) {
      setLoadingOrder(false);
      setOrderLoadMessage('주문 내역을 찾을 수 없습니다. 주문 번호를 직접 입력해 주세요.');
      return;
    }
    const fetchLatest = async () => {
      setLoadingOrder(true);
      setOrderLoadMessage('');
      const { data, error } = await publicTable('orders')
        .select('order_number')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setLoadingOrder(false);
      if (error || !data?.order_number) {
        setOrderLoadMessage('주문 내역을 찾을 수 없습니다. 주문 번호를 직접 입력해 주세요.');
        return;
      }
      setLatestOrderNumber(data.order_number || '');
      setForm((prev) => ({ ...prev, order_number: data.order_number || '' }));
    };
    fetchLatest();
  }, [user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const orderNumber = (form.order_number || '').trim();
    if (!orderNumber) {
      toast.error('주문 번호를 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    try {
      let attachmentUrls = null;
      if (form.attachments?.length > 0) {
        try {
          const urls = await uploadReturnAttachments(form.attachments, user?.id);
          attachmentUrls = urls.length > 0 ? JSON.stringify(urls) : null;
        } catch (upErr) {
          if (import.meta.env.DEV) console.error('첨부 업로드 오류:', upErr);
          toast.error(upErr?.message || '첨부 파일 업로드에 실패했습니다.');
          setSubmitting(false);
          return;
        }
      }
      const payload = {
        order_number: orderNumber,
        request_type: form.request_type,
        reason: form.reason || null,
        detail: (form.detail || '').trim() || null,
        attachment_urls: attachmentUrls,
        user_id: user?.id || null,
      };
      const { error } = await publicTable('return_requests').insert(payload);
      if (error) {
        if (import.meta.env.DEV) console.error('반품/교환 신청 오류:', error);
        toast.error('신청 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        setSubmitting(false);
        return;
      }
      toast.success('반품/교환 신청이 접수되었습니다.');
      setForm({ order_number: latestOrderNumber || '', request_type: '반품', reason: '', detail: '', attachments: [] });
    } catch (err) {
      if (import.meta.env.DEV) console.error('반품/교환 신청 예외:', err);
      toast.error('신청 중 오류가 발생했습니다.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#3E2F28] pt-24 md:pt-28 pb-24 px-6 antialiased">
      <Helmet>
        <title>반품 및 교환 | 마메르(Mamère)</title>
        <meta name="description" content="반품/교환 신청을 안내합니다. 수령일로부터 7일 이내, 미사용 상품에 한해 가능합니다." />
      </Helmet>
      <div className="max-w-xl mx-auto">
        <Link
          to="/"
          className="inline-block text-[10px] tracking-[0.15em] uppercase text-[#7A6B63] hover:text-[#3E2F28] mb-10 transition-colors"
        >
          ← 마메르
        </Link>

        <h1 className="text-xl md:text-2xl font-semibold text-black tracking-tight uppercase mb-2">
          반품 및 교환
        </h1>
        <p className="text-[10px] font-light tracking-[0.08em] text-[#5C4A42] mb-12">
          수령일로부터 7일 이내, 미사용 상품에 한해 가능합니다.
        </p>

        {loadingOrder ? (
          <div className="py-8 flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-[#A8B894]/40 border-t-[#3E2F28] rounded-full animate-spin" />
            <span className="text-[10px] text-[#7A6B63] tracking-[0.08em]">주문 정보 불러오는 중</span>
          </div>
        ) : orderLoadMessage ? (
          <p className="text-[10px] font-light text-[#7A6B63] mb-6 tracking-[0.06em]">{orderLoadMessage}</p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#5C4A42] mb-2">
              주문 번호
            </label>
            <input
              type="text"
              value={form.order_number}
              onChange={(e) => setForm((prev) => ({ ...prev, order_number: e.target.value }))}
              placeholder="주문 번호를 입력하세요"
              className="w-full border border-[#E8E4DF] bg-[#F9F7F2] px-4 py-3 text-[11px] text-[#3E2F28] placeholder:text-[#7A6B63]/60 outline-none focus:border-[#A8B894] transition-colors"
            />
          </div>

          <div>
            <span className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#5C4A42] mb-3">
              신청 유형
            </span>
            <div className="flex gap-4">
              {REQUEST_TYPES.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="request_type"
                    value={value}
                    checked={form.request_type === value}
                    onChange={() => setForm((prev) => ({ ...prev, request_type: value }))}
                    className="w-3.5 h-3.5 border border-[#E8E4DF] text-[#A8B894] focus:ring-[#A8B894]"
                  />
                  <span className="text-[11px] font-light tracking-[0.08em] text-[#3E2F28]">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#5C4A42] mb-2">
              사유 선택
            </label>
            <select
              value={form.reason}
              onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
              className="w-full border border-[#E8E4DF] bg-[#F9F7F2] px-4 py-3 text-[11px] text-[#3E2F28] outline-none focus:border-[#A8B894] transition-colors"
            >
              {REASONS.map((r) => (
                <option key={r.value || 'empty'} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#5C4A42] mb-2">
              상세 사유
            </label>
            <textarea
              value={form.detail}
              onChange={(e) => setForm((prev) => ({ ...prev, detail: e.target.value }))}
              placeholder="구체적인 사유를 적어 주시면 빠른 처리에 도움이 됩니다."
              rows={5}
              className="w-full border border-[#E8E4DF] bg-[#F9F7F2] px-4 py-3 text-[11px] text-[#3E2F28] placeholder:text-[#7A6B63]/60 outline-none focus:border-[#A8B894] transition-colors resize-y min-h-[120px]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium tracking-[0.12em] uppercase text-[#5C4A42] mb-2">
              첨부 파일 (선택)
            </label>
            <p className="text-[10px] font-light text-[#7A6B63] mb-2 tracking-[0.06em]">
              파손·불량 상태 확인을 위해 사진을 첨부해 주세요.
            </p>
            <div className="border-2 border-dashed border-[#E8E4DF] bg-[#F9F7F2] rounded-sm p-6 text-center transition-colors hover:border-[#A8B894]/60">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setForm((prev) => ({ ...prev, attachments: [...(prev.attachments || []), ...files].slice(0, 5) }));
                }}
                className="sr-only"
                id="returns-attachments"
              />
              <label htmlFor="returns-attachments" className="cursor-pointer block text-[11px] text-[#5C4A42]">
                클릭하여 이미지 선택 (최대 5장)
              </label>
              {form.attachments?.length > 0 && (
                <p className="mt-2 text-[10px] text-[#7A6B63]">선택된 파일: {form.attachments.length}장</p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="w-full max-w-[280px] py-4 text-[10px] font-medium tracking-[0.16em] uppercase bg-[#3E2F28] text-[#F9F7F2] hover:bg-[#2D231E] disabled:opacity-60 disabled:cursor-not-allowed transition-colors border border-[#3E2F28]"
            >
              {submitting ? '접수 중…' : '신청하기'}
            </button>
          </div>
        </form>

        <div className="mt-16 pt-8 border-t border-[#E8E4DF]">
          <p className="text-[10px] font-light text-[#7A6B63] leading-relaxed tracking-[0.06em]">
            반품/교환 기간: 수령일로부터 7일 이내
            <br />
            반품/교환 조건: 미사용 상품에 한해 가능합니다. 단순 변심 시 왕복 배송비는 고객 부담입니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage;
