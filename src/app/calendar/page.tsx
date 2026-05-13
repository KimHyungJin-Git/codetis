'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { getCalendarDays, padZero } from '@/lib/utils';
import { getKoreanHolidays } from '@/lib/koreanHolidays';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import type { CalendarEvent, Connection } from '@/lib/types';

const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];

type AnyEvent = {
  id: string;
  title: string;
  date: string;
  color: string;
  memo?: string;
};

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(
    `${today.getFullYear()}-${padZero(today.getMonth() + 1)}-${padZero(today.getDate())}`
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
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
      const [{ data: evs }, { data: conns }] = await Promise.all([
        supabase.from('calendar_events').select('*').eq('user_id', user.id),
        supabase.from('connections').select('id,name,birthday,avatar_color').eq('user_id', user.id),
      ]);
      setEvents((evs as CalendarEvent[]) ?? []);
      setConnections((conns as Connection[]) ?? []);
      setDataLoading(false);
    };
    fetchData();
  }, [user]);

  // Build birthday events from contacts
  const birthdayEvents: AnyEvent[] = connections
    .filter((c) => c.birthday)
    .map((c) => {
      const bday = new Date(c.birthday!);
      const dateStr = `${year}-${padZero(bday.getMonth() + 1)}-${padZero(bday.getDate())}`;
      return {
        id: `bday-${c.id}`,
        title: `${c.name} 생일`,
        date: dateStr,
        color: c.avatar_color,
        memo: '생일 축하 메시지 보내기',
      };
    });

  const holidays = getKoreanHolidays(year);

  const holidayEvents: AnyEvent[] = Object.entries(holidays).map(([date, name]) => ({
    id: `holiday-${date}`,
    title: name,
    date,
    color: '#E43D12',
  }));

  const allEvents: AnyEvent[] = [...events, ...birthdayEvents, ...holidayEvents];

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const days = getCalendarDays(year, month);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${padZero(month + 1)}-${padZero(day)}`;
    return allEvents.filter((ev) => ev.date === dateStr);
  };

  const selectedEvents = allEvents.filter((ev) => ev.date === selectedDate);

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    const dateStr = `${year}-${padZero(month + 1)}-${padZero(day)}`;
    return dateStr === selectedDate;
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
      <TopBar />

      <div className="flex-1 overflow-y-auto pb-24" style={{ paddingTop: '64px' }}>
        {/* Month navigation */}
        <div className="px-7 pt-4 flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-card"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2 className="text-[18px] font-bold text-picks-dark">
            {year}년 {month + 1}월
          </h2>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-card"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Calendar grid */}
        <div className="px-4">
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-50">
              {dayLabels.map((label, idx) => (
                <div
                  key={label}
                  className="flex items-center justify-center py-3 text-[12px] font-semibold"
                  style={{
                    color: idx === 0 ? '#E43D12' : idx === 6 ? '#2196F3' : '#9e9e9e',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Days grid */}
            {dataLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-5 h-5 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {days.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="aspect-square" />;
                  }
                  const dateStr = `${year}-${padZero(month + 1)}-${padZero(day)}`;
                  const dayEvents = getEventsForDay(day);
                  const nonHolidayEvents = dayEvents.filter((ev) => !ev.id.startsWith('holiday-'));
                  const dayOfWeek = idx % 7;
                  const selected = isSelected(day);
                  const todayMark = isToday(day);
                  const holidayName = holidays[dateStr];
                  const isHoliday = !!holidayName;
                  const isRed = dayOfWeek === 0 || isHoliday;

                  return (
                    <button
                      key={`day-${day}`}
                      onClick={() => setSelectedDate(dateStr)}
                      className="flex flex-col items-center py-1 px-0.5"
                      style={{ minHeight: '56px' }}
                    >
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full mb-0.5 text-[13px] font-semibold transition-colors"
                        style={{
                          background: selected ? '#D6536D' : todayMark ? '#fdf0f2' : 'transparent',
                          color: selected
                            ? 'white'
                            : todayMark
                            ? '#D6536D'
                            : isRed
                            ? '#E43D12'
                            : dayOfWeek === 6
                            ? '#2196F3'
                            : '#1a1a1a',
                          fontWeight: todayMark || selected ? 700 : 500,
                        }}
                      >
                        {day}
                      </div>
                      {/* 공휴일 이름 */}
                      {isHoliday && !selected && (
                        <span
                          className="text-[8px] leading-tight text-center w-full px-0.5 truncate"
                          style={{ color: '#E43D12' }}
                        >
                          {holidayName.split(' · ')[0]}
                        </span>
                      )}
                      {/* Event dots */}
                      <div className="flex gap-0.5 flex-wrap justify-center max-w-[28px] mt-0.5">
                        {nonHolidayEvents.slice(0, 3).map((ev, evIdx) => (
                          <div
                            key={evIdx}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: ev.color }}
                          />
                        ))}
                        {nonHolidayEvents.length > 3 && (
                          <span className="text-[8px] text-gray-400">+{nonHolidayEvents.length - 3}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected date events */}
        <div className="px-7 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-picks-dark">
              {selectedDate.replace(/-/g, '.')} 일정
              {holidays[selectedDate] && (
                <span className="ml-2 text-[12px] font-medium" style={{ color: '#E43D12' }}>
                  🎌 {holidays[selectedDate]}
                </span>
              )}
            </h3>
            <span className="text-[13px] text-gray-400">
              {selectedEvents.filter((e) => !e.id.startsWith('holiday-')).length}개
            </span>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="picks-card p-8 flex flex-col items-center justify-center text-center">
              <span className="text-4xl mb-3">📅</span>
              <p className="text-[14px] text-gray-400">이날의 일정이 없습니다</p>
              <Link
                href="/calendar/new"
                className="mt-3 text-[13px] font-semibold"
                style={{ color: '#D6536D' }}
              >
                + 일정 추가하기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((ev) => {
                const isHolidayEv = ev.id.startsWith('holiday-');
                const isBdayEv = ev.id.startsWith('bday-');

                if (isHolidayEv) {
                  return (
                    <div
                      key={ev.id}
                      className="picks-card p-4 flex items-center gap-3"
                      style={{ borderLeft: '3px solid #E43D12' }}
                    >
                      <div className="text-2xl">🎌</div>
                      <div className="flex-1">
                        <p className="text-[15px] font-semibold" style={{ color: '#E43D12' }}>{ev.title}</p>
                        <p className="text-[12px] text-gray-400 mt-0.5">대한민국 공휴일</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={ev.id}
                    href={isBdayEv ? `/contacts/${ev.id.replace('bday-', '')}` : `/calendar/${ev.id}`}
                    className="picks-card p-4 flex items-center gap-3 block active:scale-95 transition-transform"
                  >
                    <div
                      className="w-1 h-12 rounded-full flex-shrink-0"
                      style={{ background: ev.color }}
                    />
                    <div className="flex-1">
                      <p className="text-[15px] font-semibold text-picks-dark">{ev.title}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">{ev.memo}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <Link
        href="/calendar/new"
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-30 active:scale-95 transition-transform"
        style={{ background: '#D6536D' }}
        aria-label="일정 추가"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>

      <BottomNav />
    </div>
  );
}
