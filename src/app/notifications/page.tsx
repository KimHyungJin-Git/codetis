'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type FilterType = '전체' | '생일' | '신년' | '미연락' | '시즌' | '리마인드';
type NotifType = 'birthday' | 'newyear' | 'nocontact' | 'season' | 'reminder';

const filterTypes: FilterType[] = ['전체', '생일', '신년', '미연락', '시즌', '리마인드'];

const typeMap: Record<FilterType, NotifType | null> = {
  '전체': null,
  '생일': 'birthday',
  '신년': 'newyear',
  '미연락': 'nocontact',
  '시즌': 'season',
  '리마인드': 'reminder',
};

const typeIcons: Record<NotifType, string> = {
  birthday: '🎂',
  newyear: '🧧',
  nocontact: '📞',
  season: '📣',
  reminder: '💬',
};

const typeColors: Record<NotifType, string> = {
  birthday: '#D6536D',
  newyear: '#E43D12',
  nocontact: '#EFB11D',
  season: '#4CAF50',
  reminder: '#2196F3',
};

function formatNotifDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    const hours = Math.floor(diff / 3600000);
    if (hours === 0) return '방금 전';
    return `${hours}시간 전`;
  }
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('전체');
  const [notifications, setNotifications] = useState<Array<{ id: string; type: NotifType; title: string; body: string; date: string; read: boolean }>>([]);

  const filteredType = typeMap[filter];
  const filtered = filteredType
    ? notifications.filter((n) => n.type === filteredType)
    : notifications;

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
        <span className="text-[17px] font-bold text-picks-dark">
          알림
          {unreadCount > 0 && (
            <span
              className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold text-white"
              style={{ background: '#D6536D' }}
            >
              {unreadCount}
            </span>
          )}
        </span>
        {unreadCount > 0 ? (
          <button
            onClick={markAllRead}
            className="text-[12px] font-medium"
            style={{ color: '#D6536D' }}
          >
            모두 읽음
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-8" style={{ paddingTop: '72px' }}>
        {/* Filter chips */}
        <div className="px-7 mb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {filterTypes.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all"
                style={{
                  background: filter === f ? '#D6536D' : 'white',
                  color: filter === f ? 'white' : '#666',
                  border: filter === f ? 'none' : '1.5px solid #e5e5e5',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Notification list */}
        <div className="px-7 space-y-3">
          {filtered.length === 0 ? (
            <div className="picks-card p-10 flex flex-col items-center text-center">
              <span className="text-4xl mb-3">🔔</span>
              <p className="text-[14px] text-gray-400">알림이 없습니다</p>
            </div>
          ) : (
            filtered.map((notif) => (
              <button
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className="picks-card p-4 flex items-start gap-3 w-full text-left transition-all"
                style={{ opacity: notif.read ? 0.8 : 1 }}
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: typeColors[notif.type] + '22' }}
                >
                  {typeIcons[notif.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-[14px] leading-snug"
                      style={{ fontWeight: notif.read ? 400 : 600, color: notif.read ? '#666' : '#1a1a1a' }}
                    >
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#D6536D' }} />
                    )}
                  </div>
                  <p className="text-[12px] text-gray-400 mt-1 leading-relaxed">{notif.body}</p>
                  <p className="text-[11px] text-gray-300 mt-1.5">{formatNotifDate(notif.date)}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
