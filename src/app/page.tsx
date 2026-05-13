'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/home');
      } else {
        router.replace('/onboarding');
      }
    });
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-picks-bg">
      <div className="flex flex-col items-center gap-4">
        <span
          className="font-bold text-3xl tracking-tight"
          style={{ color: '#D6536D', fontFamily: "'Bricolage Grotesk', sans-serif" }}
        >
          PICKS
        </span>
        <div className="w-6 h-6 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
