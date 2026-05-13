'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import type { CalendarEvent, Connection } from '@/lib/types';

const colorOptions = ['#E43D12', '#D6536D', '#FFA2B6', '#EFB11D', '#4CAF50', '#2196F3'];

export default function CalendarEventDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [linked, setLinked] = useState<Connection | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [color, setColor] = useState('#D6536D');
  const [date, setDate] = useState('');
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/onboarding');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setDataLoading(true);
      const { data: eventData } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', params.id)
        .single();

      if (eventData) {
        const ev = eventData as CalendarEvent;
        setEvent(ev);
        setTitle(ev.title);
        setMemo(ev.memo ?? '');
        setColor(ev.color);
        setDate(ev.date);

        // Find linked connection by name match
        const { data: conns } = await supabase
          .from('connections')
          .select('*')
          .eq('user_id', user.id);
        if (conns) {
          const match = (conns as Connection[]).find((c) => ev.title.includes(c.name));
          setLinked(match ?? null);
        }
      }
      setDataLoading(false);
    };
    fetchData();
  }, [user, params.id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleSave = async () => {
    if (!event) return;
    const { error } = await supabase
      .from('calendar_events')
      .update({ title, memo, color, date })
      .eq('id', event.id);

    if (error) {
      showToast('저장 중 오류가 발생했습니다.');
      return;
    }
    setEvent({ ...event, title, memo, color, date });
    showToast('일정이 수정되었습니다.');
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!event) return;
    await supabase.from('calendar_events').delete().eq('id', event.id);
    showToast('일정이 삭제되었습니다.');
    setTimeout(() => router.push('/calendar'), 1200);
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-picks-bg">
        <div className="w-6 h-6 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-picks-bg">
        <div className="text-center">
          <p className="text-gray-400 text-[15px]">일정을 찾을 수 없습니다.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-[13px] font-semibold"
            style={{ color: '#D6536D' }}
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const evDate = new Date(event.date);
  const today = new Date();
  const diff = Math.ceil((evDate.getTime() - new Date(today.toDateString()).getTime()) / 86400000);

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
        <span className="text-[17px] font-bold text-picks-dark">일정 상세</span>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="text-[14px] font-semibold"
          style={{ color: '#D6536D' }}
        >
          {editing ? '저장' : '편집'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-32" style={{ paddingTop: '56px' }}>

        {/* 컬러 헤더 배너 */}
        <div
          className="flex flex-col justify-end px-7 pb-6"
          style={{ background: `linear-gradient(135deg, ${color} 0%, #1a1a1a 100%)`, minHeight: '140px', paddingTop: '24px' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <span className="text-xl">📅</span>
          </div>
          <p className="text-white/70 text-[12px] font-medium mb-1">
            {diff < 0 ? `${Math.abs(diff)}일 전` : diff === 0 ? '오늘' : `D-${diff}`}
          </p>
          <h2 className="text-white text-[22px] font-bold">{editing ? title : event.title}</h2>
          <p className="text-white/70 text-[13px] mt-1">{event.date.replace(/-/g, '.')}</p>
        </div>

        <div className="px-7 mt-5 space-y-3">

          {editing ? (
            <>
              {/* 제목 편집 */}
              <div className="picks-card p-4">
                <p className="text-[12px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">일정 제목</p>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-[16px] font-semibold text-picks-dark bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus:border-picks-rose transition-colors"
                />
              </div>

              {/* 날짜 편집 */}
              <div className="picks-card p-4">
                <p className="text-[12px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">날짜</p>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-[15px] text-picks-dark bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus:border-picks-rose transition-colors"
                />
              </div>

              {/* 메모 편집 */}
              <div className="picks-card p-4">
                <p className="text-[12px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">메모</p>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={3}
                  className="w-full text-[14px] text-picks-dark bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus:border-picks-rose transition-colors resize-none"
                />
              </div>

              {/* 색상 편집 */}
              <div className="picks-card p-4">
                <p className="text-[12px] font-semibold text-gray-400 mb-3 uppercase tracking-wide">색상</p>
                <div className="flex gap-3">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="w-9 h-9 rounded-full transition-transform active:scale-90 flex items-center justify-center"
                      style={{ background: c, border: color === c ? '3px solid #1a1a1a' : '3px solid transparent' }}
                    >
                      {color === c && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 날짜 */}
              <div className="picks-card p-4">
                <p className="text-[12px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">날짜</p>
                <div className="flex items-center justify-between">
                  <p className="text-[16px] font-semibold text-picks-dark">{event.date.replace(/-/g, '.')}</p>
                  <span
                    className="px-3 py-1 rounded-full text-[12px] font-semibold"
                    style={{
                      background: diff < 0 ? '#f5f5f5' : diff === 0 ? '#fdf0f2' : '#f0f8ff',
                      color: diff < 0 ? '#9e9e9e' : diff === 0 ? '#D6536D' : '#2196F3',
                    }}
                  >
                    {diff < 0 ? `${Math.abs(diff)}일 전` : diff === 0 ? '오늘' : `D-${diff}`}
                  </span>
                </div>
              </div>

              {/* 메모 */}
              <div className="picks-card p-4">
                <p className="text-[12px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">메모</p>
                <p className="text-[14px] text-picks-dark leading-relaxed">
                  {event.memo || <span className="text-gray-400">메모 없음</span>}
                </p>
              </div>

              {/* 색상 */}
              <div className="picks-card p-4">
                <p className="text-[12px] font-semibold text-gray-400 mb-3 uppercase tracking-wide">색상 라벨</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full" style={{ background: event.color }} />
                  <span className="text-[14px] text-picks-dark font-medium">이 색상으로 캘린더에 표시됩니다</span>
                </div>
              </div>

              {/* 연결된 연락처 */}
              {linked && (
                <div className="picks-card p-4">
                  <p className="text-[12px] font-semibold text-gray-400 mb-3 uppercase tracking-wide">연결된 연락처</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: linked.avatar_color }}
                    >
                      {linked.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-semibold text-picks-dark">{linked.name}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">{linked.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { window.location.href = `tel:${(linked.phone ?? '').replace(/-/g, '')}`; }}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: '#fdf0f2' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D6536D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.07 11.5a19.79 19.79 0 01-3.07-8.67A2 2 0 013 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => { window.location.href = `sms:${(linked.phone ?? '').replace(/-/g, '')}`; }}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: '#fdf0f2' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D6536D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 삭제 */}
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-3.5 rounded-2xl font-semibold text-[15px] border-2 transition-all active:scale-95 mt-2"
            style={{ borderColor: '#E43D12', color: '#E43D12' }}
          >
            일정 삭제
          </button>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-[393px] bg-white rounded-t-3xl p-6 bottom-sheet">
            <h3 className="text-[18px] font-bold text-picks-dark text-center mb-2">일정을 삭제할까요?</h3>
            <p className="text-[14px] text-gray-400 text-center mb-6">삭제된 일정은 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-3.5 rounded-2xl font-semibold text-[15px] bg-gray-100 text-gray-600"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3.5 rounded-2xl font-semibold text-[15px] text-white"
                style={{ background: '#E43D12' }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 toast-enter">
          <div className="bg-picks-dark text-white px-5 py-3 rounded-2xl shadow-lg text-[14px] font-medium whitespace-nowrap">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
