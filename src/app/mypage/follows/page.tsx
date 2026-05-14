'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';

type FollowUser = {
  id: string;
  name: string;
};

export default function FollowsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/onboarding');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const [{ data: followerRows }, { data: followingRows }] = await Promise.all([
        supabase.from('follows').select('follower_id').eq('following_id', user.id),
        supabase.from('follows').select('following_id').eq('follower_id', user.id),
      ]);

      const followerIds = (followerRows ?? []).map((r: any) => r.follower_id);
      const followingIds = (followingRows ?? []).map((r: any) => r.following_id);

      const [{ data: followerProfiles }, { data: followingProfiles }] = await Promise.all([
        followerIds.length > 0
          ? supabase.from('profiles').select('id, name').in('id', followerIds)
          : Promise.resolve({ data: [] }),
        followingIds.length > 0
          ? supabase.from('profiles').select('id, name').in('id', followingIds)
          : Promise.resolve({ data: [] }),
      ]);

      setFollowers((followerProfiles ?? []) as FollowUser[]);
      setFollowing((followingProfiles ?? []) as FollowUser[]);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  const handleUnfollow = async (targetId: string) => {
    if (!user) return;
    await supabase.from('follows').delete()
      .eq('follower_id', user.id).eq('following_id', targetId);
    setFollowing((prev) => prev.filter((u) => u.id !== targetId));
    showToast('팔로우를 취소했어요');
  };

  const list = tab === 'followers' ? followers : following;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-picks-bg">
        <div className="w-6 h-6 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
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
        <span className="text-[17px] font-bold text-picks-dark">팔로우 관리</span>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto" style={{ paddingTop: '56px' }}>
        {/* 탭 */}
        <div className="flex border-b border-gray-100 bg-white">
          {(['followers', 'following'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-3.5 text-[14px] font-semibold transition-colors relative"
              style={{ color: tab === t ? '#D6536D' : '#9e9e9e' }}
            >
              {t === 'followers' ? `팔로워 ${followers.length}` : `팔로잉 ${following.length}`}
              {tab === t && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: '#D6536D' }} />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-7">
            <span className="text-5xl mb-4">{tab === 'followers' ? '👥' : '🔍'}</span>
            <p className="text-[15px] font-semibold text-picks-dark mb-1">
              {tab === 'followers' ? '아직 팔로워가 없어요' : '팔로잉 중인 사람이 없어요'}
            </p>
            <p className="text-[13px] text-gray-400 text-center">
              {tab === 'followers'
                ? '내 프로필 링크를 공유해서 팔로워를 늘려보세요'
                : '다른 사람의 프로필 링크로 팔로우해보세요'}
            </p>
          </div>
        ) : (
          <div className="px-7 py-4 space-y-3">
            {list.map((u) => (
              <div key={u.id} className="picks-card p-4 flex items-center gap-3">
                <Link href={`/profile/${u.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #D6536D, #E43D12)' }}
                  >
                    {u.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-picks-dark truncate">{u.name}</p>
                    {tab === 'followers' && following.some((f) => f.id === u.id) && (
                      <p className="text-[12px]" style={{ color: '#D6536D' }}>서로 팔로우 중</p>
                    )}
                  </div>
                </Link>
                {tab === 'following' && (
                  <button
                    onClick={() => handleUnfollow(u.id)}
                    className="px-4 py-1.5 rounded-full text-[13px] font-semibold bg-gray-100 text-gray-500 active:scale-95 transition-transform flex-shrink-0"
                  >
                    언팔로우
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 toast-enter">
          <div className="bg-picks-dark text-white px-5 py-3 rounded-2xl shadow-lg text-[14px] font-medium whitespace-nowrap">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
