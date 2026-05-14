'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getDaysUntilBirthday, getDaysSinceContact, getDaysAgo, formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import type { Connection } from '@/lib/types';

export default function ContactDetailClient() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [contact, setContact] = useState<Connection | null>(null);
  const [memo, setMemo] = useState('');
  const [editingMemo, setEditingMemo] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [toast, setToast] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['친구', '가족', '비즈니스']);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/onboarding');
    }
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
        setMemo(c.memo ?? '');
        setSelectedCategory(c.category);

        await supabase
          .from('connections')
          .update({ last_contact: new Date().toISOString().split('T')[0] })
          .eq('id', params.id);
      }

      const customCats = (cats ?? []).map((c: { name: string }) => c.name);
      const allCats = ['친구', '가족', '비즈니스', ...customCats.filter((c: string) => !['친구', '가족', '비즈니스'].includes(c))];
      setCategories(allCats);
      setDataLoading(false);
    };
    fetchData();
  }, [user, params?.id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleSaveMemo = async () => {
    if (!contact) return;
    await supabase.from('connections').update({ memo }).eq('id', contact.id);
    showToast('메모가 저장되었습니다.');
    setEditingMemo(false);
  };

  const handleCategoryChange = async (cat: string) => {
    if (!contact) return;
    setSelectedCategory(cat);
    await supabase.from('connections').update({ category: cat }).eq('id', contact.id);
    showToast('카테고리가 변경되었습니다.');
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

  const daysUntilBday = contact.birthday ? getDaysUntilBirthday(contact.birthday) : null;
  const daysSinceContact = contact.last_contact ? getDaysSinceContact(contact.last_contact) : null;

  return (
    <div className="flex flex-col min-h-screen bg-picks-bg page-fade">

      {/* 상단 헤더 */}
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
        <button onClick={() => showToast('편집 모드')} className="text-[14px] font-medium" style={{ color: '#D6536D' }}>
          편집
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-28" style={{ paddingTop: '56px' }}>

        <div
          className="flex flex-col items-center py-8 px-7"
          style={{ background: 'linear-gradient(180deg, white 0%, #fafaf8 100%)' }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-card-md"
            style={{ background: contact.avatar_color }}
          >
            {contact.name.charAt(0)}
          </div>
          <h2 className="text-[22px] font-bold text-picks-dark mt-4">{contact.name}</h2>
          <span
            className="mt-2 px-3 py-1 rounded-full text-[13px] font-medium"
            style={{ background: '#fdf0f2', color: '#D6536D' }}
          >
            {selectedCategory}
          </span>
        </div>

        <div className="px-7 space-y-3 pb-4">

          {contact.phone && (
            <div className="picks-card p-4">
              <p className="text-[12px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">연락처</p>
              <div className="flex items-center justify-between">
                <p className="text-[16px] font-semibold text-picks-dark">{contact.phone}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { window.location.href = `tel:${(contact.phone ?? '').replace(/-/g, '')}`; }}
                    className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: '#fdf0f2' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D6536D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.07 11.5a19.79 19.79 0 01-3.07-8.67A2 2 0 013 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => { window.location.href = `sms:${(contact.phone ?? '').replace(/-/g, '')}`; }}
                    className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: '#fdf0f2' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D6536D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {contact.birthday && daysUntilBday !== null && (
            <div className="picks-card p-4">
              <p className="text-[12px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">생일</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[16px] font-semibold text-picks-dark">{formatDate(contact.birthday)}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: daysUntilBday <= 7 ? '#D6536D' : '#9e9e9e' }}>
                    {daysUntilBday === 0 ? '🎂 오늘이에요!' : `${daysUntilBday}일 후`}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ background: daysUntilBday <= 7 ? '#fdf0f2' : '#f5f5f5' }}
                >
                  {daysUntilBday <= 7 ? '🎂' : '📅'}
                </div>
              </div>
            </div>
          )}

          <div className="picks-card p-4">
            <p className="text-[12px] font-semibold text-gray-400 mb-3 uppercase tracking-wide">관계 카테고리</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-all active:scale-95"
                  style={{
                    background: selectedCategory === cat ? '#D6536D' : '#f5f5f5',
                    color: selectedCategory === cat ? 'white' : '#666',
                  }}
                >
                  {cat}
                </button>
              ))}
              <Link
                href="/contacts/category"
                className="px-3 py-1.5 rounded-full text-[13px] font-medium flex items-center gap-1 transition-all active:scale-95"
                style={{ border: '1.5px dashed #D6536D', color: '#D6536D' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                추가하기
              </Link>
            </div>
          </div>

          <div className="picks-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">메모</p>
              <button
                onClick={() => { if (editingMemo) { handleSaveMemo(); } else { setEditingMemo(true); } }}
                className="text-[13px] font-medium"
                style={{ color: '#D6536D' }}
              >
                {editingMemo ? '저장' : '편집'}
              </button>
            </div>
            {editingMemo ? (
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full text-[14px] text-picks-dark bg-gray-50 rounded-xl p-3 resize-none border border-gray-200 focus:border-picks-rose transition-colors"
                rows={3}
                autoFocus
              />
            ) : (
              <p className="text-[14px] text-picks-dark leading-relaxed">
                {memo || <span className="text-gray-400">메모를 추가해보세요</span>}
              </p>
            )}
          </div>

          {contact.last_contact && daysSinceContact !== null && (
            <div className="picks-card p-4">
              <p className="text-[12px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">마지막 연락</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[16px] font-semibold text-picks-dark">{formatDate(contact.last_contact)}</p>
                  <p
                    className="text-[12px] mt-0.5"
                    style={{ color: daysSinceContact > 60 ? '#E43D12' : daysSinceContact > 30 ? '#EFB11D' : '#4CAF50' }}
                  >
                    {getDaysAgo(contact.last_contact)}
                    {daysSinceContact > 60 && ' — 연락이 필요해요!'}
                  </p>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-[12px] font-semibold"
                  style={{
                    background: daysSinceContact > 60 ? '#fdf0f2' : daysSinceContact > 30 ? '#fffbf0' : '#f0fdf4',
                    color: daysSinceContact > 60 ? '#E43D12' : daysSinceContact > 30 ? '#EFB11D' : '#4CAF50',
                  }}
                >
                  {daysSinceContact}일 전
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="px-7 mt-2 mb-4">
          <button
            onClick={() => router.push('/contacts/bulk-send')}
            className="w-full py-4 rounded-2xl font-semibold text-[16px] text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
          >
            메시지 보내기
          </button>
        </div>

      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[393px] z-40 flex justify-end pr-6 pointer-events-none">
        <Link
          href="/contacts/new"
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform pointer-events-auto"
          style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
          aria-label="친구 추가"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Link>
      </div>

      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 toast-enter">
          <div className="bg-picks-dark text-white px-5 py-3 rounded-2xl shadow-lg text-[14px] font-medium whitespace-nowrap">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
