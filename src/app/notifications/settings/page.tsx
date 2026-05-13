'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import type { NotificationSettings } from '@/lib/types';

interface NotifSetting {
  id: keyof Omit<NotificationSettings, 'id' | 'user_id'>;
  label: string;
  description: string;
  icon: string;
  color: string;
  enabled: boolean;
}

const defaultSettings: Omit<NotifSetting, 'enabled'>[] = [
  {
    id: 'birthday_enabled',
    label: '생일 알림',
    description: '관계의 생일 D-7, D-1, 당일 알림',
    icon: '🎂',
    color: '#D6536D',
  },
  {
    id: 'newyear_enabled',
    label: '신년 안부 알림',
    description: '새해 첫날 관계에게 안부 추천',
    icon: '🧧',
    color: '#E43D12',
  },
  {
    id: 'nocontact_enabled',
    label: '오래 연락 안 한 사람 알림',
    description: '30일 이상 연락 없을 시 알림',
    icon: '📞',
    color: '#EFB11D',
  },
  {
    id: 'season_enabled',
    label: '시즌 연락 추천 알림',
    description: '명절, 크리스마스 등 시즌 알림',
    icon: '📣',
    color: '#4CAF50',
  },
  {
    id: 'reminder_enabled',
    label: '메시지 전송 리마인드',
    description: '예약된 메시지 전송 전 리마인드',
    icon: '💬',
    color: '#2196F3',
  },
];

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<NotifSetting[]>(
    defaultSettings.map((s) => ({ ...s, enabled: true }))
  );
  const [toast, setToast] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/onboarding');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchSettings = async () => {
      setDataLoading(true);
      const { data } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        const ns = data as NotificationSettings;
        setSettings(
          defaultSettings.map((s) => ({
            ...s,
            enabled: ns[s.id] as boolean,
          }))
        );
      }
      setDataLoading(false);
    };
    fetchSettings();
  }, [user]);

  const toggleSetting = async (id: keyof Omit<NotificationSettings, 'id' | 'user_id'>) => {
    if (!user) return;
    const newValue = !settings.find((s) => s.id === id)?.enabled;
    setSettings((prev) => prev.map((s) => s.id === id ? { ...s, enabled: newValue } : s));

    await supabase
      .from('notification_settings')
      .update({ [id]: newValue })
      .eq('user_id', user.id);

    setToast('설정이 저장되었습니다.');
    setTimeout(() => setToast(''), 1500);
  };

  const toggleAll = async () => {
    if (!user) return;
    const allOn = settings.every((s) => s.enabled);
    const newVal = !allOn;
    setSettings((prev) => prev.map((s) => ({ ...s, enabled: newVal })));

    await supabase
      .from('notification_settings')
      .update({
        birthday_enabled: newVal,
        newyear_enabled: newVal,
        nocontact_enabled: newVal,
        season_enabled: newVal,
        reminder_enabled: newVal,
      })
      .eq('user_id', user.id);
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
        <span className="text-[17px] font-bold text-picks-dark">알림 설정</span>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto pb-10" style={{ paddingTop: '72px' }}>
        {/* Global toggle */}
        <div className="px-7 mb-4">
          <div className="picks-card p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#fdf0f2' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D6536D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-picks-dark">모든 알림</p>
              <p className="text-[12px] text-gray-400 mt-0.5">PICKS의 모든 알림 허용</p>
            </div>
            <label className="toggle-switch flex-shrink-0">
              <input
                type="checkbox"
                checked={settings.some((s) => s.enabled)}
                onChange={toggleAll}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Settings list */}
        <div className="px-7 space-y-3">
          <p className="text-[13px] font-medium text-gray-400 mb-2">알림 종류별 설정</p>
          {dataLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            settings.map((setting) => (
              <div key={setting.id} className="picks-card p-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: setting.color + '22' }}
                >
                  {setting.icon}
                </div>
                <div className="flex-1">
                  <p
                    className="text-[14px] font-semibold"
                    style={{ color: setting.enabled ? '#1a1a1a' : '#9e9e9e' }}
                  >
                    {setting.label}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{setting.description}</p>
                </div>
                <label className="toggle-switch flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={setting.enabled}
                    onChange={() => toggleSetting(setting.id)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))
          )}
        </div>

        {/* Info note */}
        <div className="px-7 mt-6">
          <div
            className="rounded-xl p-4 flex gap-3"
            style={{ background: '#fff9e6' }}
          >
            <span className="text-[16px] flex-shrink-0">💡</span>
            <p className="text-[12px] text-gray-600 leading-relaxed">
              기기 설정에서 PICKS 앱의 알림을 허용해야 알림을 받을 수 있습니다.
              기기 설정 → 앱 → PICKS → 알림에서 확인해주세요.
            </p>
          </div>
        </div>
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
