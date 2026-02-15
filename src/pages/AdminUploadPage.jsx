import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, publicTable } from '../lib/supabase';
import { useAuth } from '../store/AuthContext';
import { parseDescription, serializeDescription } from '../lib/descriptionSections';

const STORAGE_BUCKET = 'product-images';

const GENDERS = [
  { value: 'men', label: '남성' },
  { value: 'women', label: '여성' },
];

const CATEGORIES = [
  { value: 'outerwear', label: '아웃웨어' },
  { value: 'top', label: '상의' },
  { value: 'bottom', label: '하의' },
];

const getCategoryLabel = (val) => {
  if (!val || val.trim() === '') return 'unclassified';
  const found = CATEGORIES.find((c) => c.value === val);
  return found ? found.label : val;
};

const AdminUploadPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    price: '',
    descFreeShipping: '',
    descDetails: '',
    descSizeFit: '',
    gender: 'men',
    category: 'outerwear',
    imageFile: null,
    imagePreview: null,
  });

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await publicTable('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchProducts();
  }, [isLoggedIn]);

  const uploadImage = async (file) => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, { upsert: false });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const name = form.name.trim();
    const price = parseInt(String(form.price).replace(/\D/g, ''), 10);
    if (!name || !price || price <= 0) {
      setError('상품명과 가격(숫자)을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = form.imagePreview;
      if (form.imageFile) {
        imageUrl = await uploadImage(form.imageFile);
      }
      if (!imageUrl) {
        setError('이미지를 선택해주세요.');
        setSubmitting(false);
        return;
      }

      const row = {
        name,
        price,
        description: serializeDescription(form.descFreeShipping, form.descDetails, form.descSizeFit),
        gender: form.gender,
        category: form.category,
        image: imageUrl,
      };

      if (editingId) {
        const { error } = await publicTable('products').update(row).eq('id', editingId);
        if (error) throw error;
        setSuccess('상품이 수정되었습니다.');
      } else {
        const { error } = await publicTable('products').insert(row);
        if (error) throw error;
        setSuccess('상품이 등록되었습니다.');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.message || '등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p) => {
    const { freeShipping, details, sizeFit } = parseDescription(p.description);
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: p.price,
      descFreeShipping: freeShipping,
      descDetails: details,
      descSizeFit: sizeFit,
      gender: p.gender || 'men',
      category: p.category || 'outerwear',
      imageFile: null,
      imagePreview: p.image,
    });
    setSuccess('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('이 상품을 삭제할까요?')) return;
    try {
      const { error } = await publicTable('products').delete().eq('id', id);
      if (error) throw error;
      setSuccess('상품이 삭제되었습니다.');
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      price: '',
      descFreeShipping: '',
      descDetails: '',
      descSizeFit: '',
      gender: 'men',
      category: 'outerwear',
      imageFile: null,
      imagePreview: null,
    });
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  if (authLoading || !isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="border-b border-white/10 pb-6 mb-10">
          <h1 className="text-2xl md:text-3xl font-light uppercase tracking-tight">관리자 · 상품 등록</h1>
          <p className="text-[11px] text-white/50 tracking-[0.1em] uppercase mt-2">상품을 등록·수정·삭제합니다</p>
        </div>

        {/* 등록 폼 */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="border border-white/10 p-6 md:p-8 mb-12"
        >
          <h2 className="text-[11px] font-medium tracking-[0.15em] uppercase text-white/70 mb-6">
            {editingId ? '상품 수정' : '새 상품 등록'}
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-medium tracking-widest uppercase text-white/50 mb-2">상품명 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="상품명 입력"
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium tracking-widest uppercase text-white/50 mb-2">가격 (원) *</label>
              <input
                type="text"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="예: 890000"
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
                required
              />
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-medium tracking-widest uppercase text-white/50">상세 설명 (우영미 스타일)</p>
              <div>
                <label className="block text-[10px] font-medium tracking-widest uppercase text-white/40 mb-1.5">무료 배송 & 반품</label>
                <textarea
                  value={form.descFreeShipping}
                  onChange={(e) => setForm((f) => ({ ...f, descFreeShipping: e.target.value }))}
                  placeholder="예: 영업일 기준 1~3일 내 배송, 배송비 무료, 무료 반품"
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium tracking-widest uppercase text-white/40 mb-1.5">세부 정보</label>
                <textarea
                  value={form.descDetails}
                  onChange={(e) => setForm((f) => ({ ...f, descDetails: e.target.value }))}
                  placeholder="예: OUTSHELL: POLYESTER 100%, MADE IN KOREA, DRY CLEAN ONLY"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium tracking-widest uppercase text-white/40 mb-1.5">사이즈 및 핏</label>
                <textarea
                  value={form.descSizeFit}
                  onChange={(e) => setForm((f) => ({ ...f, descSizeFit: e.target.value }))}
                  placeholder="예: Model is 185cm tall and wearing size 48. Sleeve measured by center back."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 resize-none"
                />
              </div>
              <p className="text-[9px] text-white/30">비워두면 상세 페이지에서 해당 메뉴가 표시되지 않습니다</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-medium tracking-widest uppercase text-white/50 mb-2">성별</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                >
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value} className="bg-zinc-900 text-white">{g.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium tracking-widest uppercase text-white/50 mb-2">카테고리 (상품 종류)</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-zinc-900 text-white">{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-medium tracking-widest uppercase text-white/50 mb-2">이미지 *</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <label className="flex-shrink-0 px-6 py-3 border border-white/20 text-[11px] font-medium tracking-widest uppercase cursor-pointer hover:bg-white/5 transition-colors">
                  파일 선택
                  <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                </label>
                {form.imagePreview && (
                  <div className="w-24 h-32 bg-white/5 overflow-hidden border border-white/10">
                    <img src={form.imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-white/40 mt-2">이미지는 Supabase Storage에 자동 업로드됩니다</p>
            </div>
          </div>

          {error && <p className="mt-4 text-red-400 text-[11px]">{error}</p>}
          {success && <p className="mt-4 text-emerald-400 text-[11px]">{success}</p>}

          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-white text-black text-[11px] font-medium tracking-widest uppercase hover:bg-white/90 disabled:opacity-50"
            >
              {submitting ? '처리 중...' : editingId ? '수정' : '등록'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-white/20 text-[11px] font-medium tracking-widest uppercase hover:bg-white/5"
              >
                취소
              </button>
            )}
          </div>
        </motion.form>

        {/* 상품 목록 */}
        <section>
          <h2 className="text-[11px] font-medium tracking-[0.15em] uppercase text-white/70 mb-6">등록된 상품 목록</h2>
          {loading ? (
            <p className="text-white/40 text-sm">로딩 중...</p>
          ) : products.length === 0 ? (
            <p className="text-white/40 text-sm">등록된 상품이 없습니다</p>
          ) : (
            <ul className="space-y-4">
              {products.map((p) => (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 py-4 border-b border-white/10"
                >
                  <div className="w-14 h-18 bg-white/5 overflow-hidden flex-shrink-0">
                    {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-[11px] text-white/50">
                      ₩{Number(p.price).toLocaleString()} · {p.gender === 'men' ? '남성' : p.gender === 'women' ? '여성' : '—'} · {getCategoryLabel(p.category)}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(p)}
                      className="px-4 py-2 text-[10px] font-medium tracking-widest uppercase border border-white/20 hover:bg-white/5"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="px-4 py-2 text-[10px] font-medium tracking-widest uppercase border border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      삭제
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminUploadPage;
