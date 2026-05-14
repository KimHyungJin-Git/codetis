'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { padZero } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';

const colorOptions = [
  '#E43D12',
  '#D6536D',
  '#FFA2B6',
  '#EFB11D',
  '#4CAF50',
  '#2196F3',
];

export default function NewEventPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${padZero(today.getMonth() + 1)}-${padZero(today.getDate())}`;

  const [form, setForm] = useState({
    date: todayStr,
    title: '',
    memo: '',
    color: '#D6536D',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date');
    if (dateParam) setForm((p) => ({ ...p, date: dateParam }));
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/onboarding');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !user) return;
    setLoading(true);

    const { error } = await supabase.from('calendar_events').insert({
      user_id: user.id,
      title: form.title,
      date: form.date,
      color: form.color,
      memo: form.memo,
    });

    setLoading(false);

    if (error) {
      setToast(`오류: ${error.message}`);
      return;
    }

    setToast('일정이 저장되었습니다!');
    setTimeout(() => router.push('/calendar'), 1200);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-picks-bg">
        <div className="w-6 h-6 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-picks-bg page-fade">
      {/* Header */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] z-40 flex items-center justify-between px-7 bg-picks-bg"
        style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)' }}
      >
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="text-[17px] font-bold text-picks-dark">일정 추가</span>
        <div className="w-8" />
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pb-10" style={{ paddingTop: '72px' }}>
        <div className="px-7 flex flex-col gap-5">
          {/* Color preview */}
          <div
            className="w-full h-2 rounded-full"
            style={{ background: form.color }}
          />

          {/* 날짜 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">날짜 <span className="text-picks-red">*</span></label>
            <div className="flex gap-2">
              <select
                value={form.date ? form.date.split('-')[0] : ''}
                onChange={(e) => {
                  const parts = form.date ? form.date.split('-') : ['', '01', '01'];
                  setForm((p) => ({ ...p, date: `${e.target.value}-${parts[1] || '01'}-${parts[2] || '01'}` }));
                }}
                className="flex-1 px-3 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors appearance-none"
              >
                <option value="">년</option>
                {Array.from({ length: 16 }, (_, i) => 2020 + i).map((y) => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
              <select
                value={form.date ? form.date.split('-')[1] : ''}
                onChange={(e) => {
                  const parts = form.date ? form.date.split('-') : [String(new Date().getFullYear()), '', '01'];
                  setForm((p) => ({ ...p, date: `${parts[0]}-${e.target.value}-${parts[2] || '01'}` }));
                }}
                className="w-[78px] px-3 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors appearance-none"
              >
                <option value="">월</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={String(m).padStart(2, '0')}>{m}월</option>
                ))}
              </select>
              <select
                value={form.date ? form.date.split('-')[2] : ''}
                onChange={(e) => {
                  const parts = form.date ? form.date.split('-') : [String(new Date().getFullYear()), '01', ''];
                  setForm((p) => ({ ...p, date: `${parts[0]}-${parts[1] || '01'}-${e.target.value}` }));
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

          {/* 제목 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">일정 제목 <span className="text-picks-red">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="일정 제목을 입력하세요"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors"
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">메모/내용</label>
            <textarea
              value={form.memo}
              onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
              placeholder="메모를 입력하세요"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[15px] text-picks-dark focus:border-picks-rose transition-colors resize-none"
              rows={4}
            />
          </div>

          {/* 색상 선택 */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-3">색상 선택</label>
            <div className="flex gap-3 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, color }))}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90"
                  style={{
                    background: color,
                    border: form.color === color ? '3px solid #1a1a1a' : '3px solid transparent',
                    outline: form.color === color ? `2px solid ${color}` : 'none',
                    outlineOffset: '2px',
                  }}
                >
                  {form.color === color && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5">
                      <polyline points="3,8 6,11 13,4" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {form.title && (
            <div className="picks-card p-4">
              <p className="text-[12px] text-gray-400 mb-2">미리보기</p>
              <div className="flex items-center gap-3">
                <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: form.color }} />
                <div>
                  <p className="text-[15px] font-semibold text-picks-dark">{form.title}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{form.date} {form.memo && `· ${form.memo}`}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !form.title || !form.date}
            className="w-full py-4 rounded-2xl font-semibold text-[16px] text-white transition-all active:scale-95 disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${form.color} 0%, #E43D12 100%)` }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                저장 중...
              </span>
            ) : '저장하기'}
          </button>
        </div>
      </form>

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
