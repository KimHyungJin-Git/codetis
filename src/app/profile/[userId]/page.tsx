'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';

type TargetProfile = {
  id: string;
  name: string;
  phone?: string;
  birthday?: string;
};

const AVATAR_COLORS = ['#D6536D', '#E43D12', '#EFB11D', '#4CAF50', '#2196F3', '#9C27B0'];

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const { user, loading: authLoading } = useAuth();
  const [target, setTarget] = useState<TargetProfile | null>(null);
  const [iFollow, setIFollow] = useState(false);
  const [theyFollow, setTheyFollow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [toast, setToast] = useState('');

  const targetId = params?.userId;
  const isMyProfile = user?.id === targetId;

  useEffect(() => {
    if (!targetId) return;
    const fetchData = async () => {
      setLoading(true);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, phone, birthday')
        .eq('id', targetId)
        .single();
      setTarget(profileData as TargetProfile ?? null);

      if (user && !isMyProfile) {
        const [{ data: iFollowData }, { data: theyFollowData }] = await Promise.all([
          supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', targetId).single(),
          supabase.from('follows').select('id').eq('follower_id', targetId).eq('following_id', user.id).single(),
        ]);
        setIFollow(!!iFollowData);
        setTheyFollow(!!theyFollowData);
      }
      setLoading(false);
    };
    fetchData();
  }, [user, targetId, isMyProfile]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleFollow = async () => {
    if (!user) { router.push('/login'); return; }
    setFollowLoading(true);

    if (iFollow) {
      // 언팔로우
      await supabase.from('follows').delete()
        .eq('follower_id', user.id).eq('following_id', targetId);
      setIFollow(false);
      showToast('팔로우를 취소했어요');
    } else {
      // 팔로우
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId });
      setIFollow(true);

      // 맞팔로우 확인
      const { data: reverseFollow } = await supabase
        .from('follows').select('id')
        .eq('follower_id', targetId).eq('following_id', user.id).single();

      if (reverseFollow) {
        // 맞팔로우 → 서로 connections에 추가
        const myProfile = await supabase.from('profiles').select('name, phone, birthday').eq('id', user.id).single();
        const theirProfile = await supabase.from('profiles').select('name, phone, birthday').eq('id', targetId).single();

        const color = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

        await Promise.all([
          // 내 connections에 상대 추가
          supabase.from('connections').insert({
            user_id: user.id,
            name: theirProfile.data?.name ?? target?.name ?? '',
            phone: theirProfile.data?.phone ?? '',
            birthday: theirProfile.data?.birthday ?? null,
            avatar_color: color(),
          }),
          // 상대 connections에 나 추가
          supabase.from('connections').insert({
            user_id: targetId,
            name: myProfile.data?.name ?? '',
            phone: myProfile.data?.phone ?? '',
            birthday: myProfile.data?.birthday ?? null,
            avatar_color: color(),
          }),
        ]);
        setTheyFollow(true);
        showToast('맞팔로우! 서로의 연락처가 자동으로 추가됐어요 🎉');
      } else {
        showToast('팔로우했어요');
      }
    }
    setFollowLoading(false);
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/profile/${targetId}`;
    navigator.clipboard.writeText(url).then(() => showToast('프로필 링크가 복사됐어요!'));
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-picks-bg">
        <div className="w-6 h-6 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!target) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-picks-bg">
        <p className="text-gray-400 text-[15px]">존재하지 않는 프로필이에요</p>
        <button onClick={() => router.back()} className="mt-4 text-[14px] font-semibold" style={{ color: '#D6536D' }}>
          돌아가기
        </button>
      </div>
    );
  }

  const mutual = iFollow && theyFollow;

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
        <span className="text-[17px] font-bold text-picks-dark">
          {isMyProfile ? '내 프로필' : '프로필'}
        </span>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto pb-10" style={{ paddingTop: '72px' }}>
        {/* 아바타 + 이름 */}
        <div className="flex flex-col items-center pt-6 pb-8 px-7"
          style={{ background: 'linear-gradient(180deg, white 0%, #fafaf8 100%)' }}>
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg"
            style={{ background: 'linear-gradient(135deg, #D6536D, #E43D12)' }}
          >
            {target.name.charAt(0)}
          </div>
          <h2 className="text-[22px] font-bold text-picks-dark mt-4">{target.name}</h2>

          {mutual && (
            <span className="mt-2 px-3 py-1 rounded-full text-[12px] font-semibold"
              style={{ background: '#fdf0f2', color: '#D6536D' }}>
              서로 팔로우 중 ✓
            </span>
          )}
          {!isMyProfile && !mutual && theyFollow && (
            <span className="mt-2 px-3 py-1 rounded-full text-[12px] font-semibold bg-gray-100 text-gray-500">
              나를 팔로우하고 있어요
            </span>
          )}
        </div>

        <div className="px-7 space-y-3">
          {/* 맞팔 시 공유 정보 */}
          {mutual && (
            <div className="picks-card p-4">
              <p className="text-[12px] font-semibold text-gray-400 mb-3 uppercase tracking-wide">공유된 정보</p>
              <div className="space-y-2">
                {target.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-gray-500">전화번호</span>
                    <span className="text-[14px] font-semibold text-picks-dark">{target.phone}</span>
                  </div>
                )}
                {target.birthday && (
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-gray-500">생일</span>
                    <span className="text-[14px] font-semibold text-picks-dark">{target.birthday}</span>
                  </div>
                )}
                {!target.phone && !target.birthday && (
                  <p className="text-[13px] text-gray-400">상대방이 아직 정보를 입력하지 않았어요</p>
                )}
              </div>
            </div>
          )}

          {/* 팔로우 버튼 / 내 프로필 공유 */}
          {isMyProfile ? (
            <button
              onClick={handleShareLink}
              className="w-full py-4 rounded-2xl font-semibold text-[16px] text-white transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              내 프로필 링크 복사하기
            </button>
          ) : (
            <>
              {!user ? (
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-4 rounded-2xl font-semibold text-[16px] text-white transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
                >
                  로그인하고 팔로우하기
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className="w-full py-4 rounded-2xl font-semibold text-[16px] transition-all active:scale-95 disabled:opacity-60"
                  style={iFollow
                    ? { background: '#f5f5f5', color: '#666' }
                    : { background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)', color: 'white' }
                  }
                >
                  {followLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      처리 중...
                    </span>
                  ) : iFollow ? '팔로잉 ✓' : '팔로우하기'}
                </button>
              )}

              {!mutual && iFollow && (
                <p className="text-center text-[13px] text-gray-400 mt-1">
                  상대방도 팔로우하면 연락처가 자동으로 공유돼요
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 toast-enter">
          <div className="bg-picks-dark text-white px-5 py-3.5 rounded-2xl shadow-lg text-[14px] font-medium text-center whitespace-nowrap">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
