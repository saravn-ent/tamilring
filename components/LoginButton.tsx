'use client';

import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { LogIn } from 'lucide-react';

export default function LoginButton() {
  const [user, setUser] = useState<any>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  if (user) {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-700">
        {user.user_metadata?.avatar_url ? (
          <Image 
            src={user.user_metadata.avatar_url} 
            alt="User" 
            width={32} 
            height={32} 
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-black font-bold text-xs">
            {user.email?.[0].toUpperCase()}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded-full text-xs font-bold hover:bg-zinc-200 transition-colors"
    >
      <LogIn size={14} />
      Sign In
    </button>
  );
}
