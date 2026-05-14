'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { formatPhone } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import type { Connection } from '@/lib/types';

const BASE_CATEGORIES = ['친구', '가족', '비즈니스'];

export default function ContactDetailClient() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [contact, setContact] = useState<Connection | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', birthday: '', category: '친구', memo: '' });
  const [categories, setCategories] = useState<string[]>(BASE_CATEGORIES);
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/onboarding');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !params?.id || params.id === 'placeholder') return;
    const fetchData = async () => {
      setDataLoading(true);
      const [{ data: contactData }, { data: cats }] = await Promise.all([
        supabase.from('connections').select('*').eq('id', params.id).single(),
        supabase.from('user_categories').select('*').eq('user_id', user.id),
      ]);

      if (contactData) {
        const c = contactData as Connection;
        setContact(c);
        setForm({
          name: c.name ?? '',
          phone: c.phone ?? '',
          birthday: c.birthday ?? '',
          category: c.category ?? '친구',
          memo: c.memo ?? '',
        });
      }

      const customCats = (cats ?? []).map((c: { name: string }) => c.name);
      const allCats = [...BASE_CATEGORIES, ...customCats.filter((c: string) => !BASE_CATEGORIES.includes(c))];
      setCategories(allCats);
      setDataLoading(false);
    };
    fetchData();
  }, [user, params?.id]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  const confirmNewCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    if (!categories.includes(name)) setCategories((prev) => [...prev, name]);
    setForm((p) => ({ ...p, category: name }));
    setNewCatName('');
    setShowNewCatInput(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact || !form.name || !form.phone) return;
    setSaving(true);

    await supabase.from('connections').update({
      name: form.name,
      phone: form.phone,
      birthday: form.birthday || null,
      category: form.category,
      memo: form.memo,
    }).eq('id', contact.id);

    await supabase
      .from('user_categories')
      .upsert({ user_id: user!.id, name: form.category }, { onConflict: 'user_id,name' });

    setSaving(false);
    showToast('저장되었습니다!');
    setTimeout(() => router.back(), 1000);
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-picks-bg">
        <div className="w-6 h-6 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-picks-bg">
        <p className="text-gray-400">연락처를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-picks-bg page-fade">

      {/* 헤더 */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] z-40 flex items-center justify-between px-7 bg-picks-bg"
        style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
      >
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="text-[17px] font-bold text-picks-dark">{contact.name}</span>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto pb-10" style={{ paddingTop: '72px' }}>

        {/* 아바타 */}
        <div className="flex flex-col items-center pt-2 pb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-card-md"
            style={{ background: contact.avatar_color }}
          >
            {contact.name.charAt(0)}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-7 flex flex-col gap-5">

          {/* 이름 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">이름 <span className="text-picks-red">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">연락처 <span className="text-picks-red">*</span></label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: formatPhone(e.target.value) }))}
              placeholder="010-0000-0000"
              maxLength={13}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors"
            />
          </div>

          {/* 생일 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">생일</label>
            <div className="flex gap-2">
              <select
                value={form.birthday ? form.birthday.split('-')[0] : ''}
                onChange={(e) => {
                  const parts = form.birthday ? form.birthday.split('-') : ['', '01', '01'];
                  const val = e.target.value ? `${e.target.value}-${parts[1] || '01'}-${parts[2] || '01'}` : '';
                  setForm((p) => ({ ...p, birthday: val }));
                }}
                className="flex-1 px-3 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors appearance-none"
              >
                <option value="">년</option>
                {Array.from({ length: 80 }, (_, i) => 2010 - i).map((y) => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
              <select
                value={form.birthday ? form.birthday.split('-')[1] : ''}
                onChange={(e) => {
                  const parts = form.birthday ? form.birthday.split('-') : ['2000', '', '01'];
                  setForm((p) => ({ ...p, birthday: `${parts[0] || '2000'}-${e.target.value}-${parts[2] || '01'}` }));
                }}
                className="w-[78px] px-3 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors appearance-none"
              >
                <option value="">월</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={String(m).padStart(2, '0')}>{m}월</option>
                ))}
              </select>
              <select
                value={form.birthday ? form.birthday.split('-')[2] : ''}
                onChange={(e) => {
                  const parts = form.birthday ? form.birthday.split('-') : ['2000', '01', ''];
                  setForm((p) => ({ ...p, birthday: `${parts[0] || '2000'}-${parts[1] || '01'}-${e.target.value}` }));
                }}
                className="w-[78px] px-3 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors appearance-none"
              >
                <option value="">일</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={String(d).padStart(2, '0')}>{d}일</option>
                ))}
              </select>
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-2">카테고리</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setForm((p) => ({ ...p, category: cat })); setShowNewCatInput(false); }}
                  className="px-4 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95"
                  style={{
                    background: form.category === cat ? '#D6536D' : 'white',
                    color: form.category === cat ? 'white' : '#666',
                    border: form.category === cat ? 'none' : '1.5px solid #e5e5e5',
                  }}
                >
                  {cat}
                </button>
              ))}
              {!showNewCatInput && (
                <button
                  type="button"
                  onClick={() => setShowNewCatInput(true)}
                  className="px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1 transition-all active:scale-95"
                  style={{ border: '1.5px dashed #D6536D', color: '#D6536D' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  새 카테고리
                </button>
              )}
            </div>
            {showNewCatInput && (
              <div className="flex gap-2 items-center mt-1">
                <input
                  autoFocus
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), confirmNewCategory())}
                  placeholder="카테고리 이름 (예: 동호회)"
                  maxLength={12}
                  className="flex-1 px-4 py-2.5 rounded-xl text-[14px] text-picks-dark bg-white"
                  style={{ border: '1.5px solid #D6536D', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={confirmNewCategory}
                  disabled={!newCatName.trim()}
                  className="px-4 py-2.5 rounded-xl font-semibold text-[13px] text-white disabled:opacity-40"
                  style={{ background: '#D6536D' }}
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewCatInput(false); setNewCatName(''); }}
                  className="px-3 py-2.5 rounded-xl text-[13px] text-gray-400 bg-gray-100"
                >
                  취소
                </button>
              </div>
            )}
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">메모</label>
            <textarea
              value={form.memo}
              onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
              placeholder="이 사람에 대해 기억하고 싶은 것을 메모하세요"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors resize-none"
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={saving || !form.name || !form.phone}
            className="w-full py-4 rounded-2xl font-semibold text-[16px] text-white transition-all active:scale-95 disabled:opacity-50 mt-2"
            style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                저장 중...
              </span>
            ) : '저장하기'}
          </button>
        </form>
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 toast-enter">
          <div className="bg-picks-dark text-white px-5 py-3 rounded-2xl shadow-lg text-[14px] font-medium">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
