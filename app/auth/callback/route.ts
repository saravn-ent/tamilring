import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Priority: 1. Query Param, 2. Cookie Fallback, 3. Default '/'
      let next = searchParams.get('next');

      if (!next || next === '/') {
        const cookieNext = cookieStore.get('auth-redirect-url')?.value;
        if (cookieNext) {
          next = cookieNext;
          // Clean up the cookie
          cookieStore.delete('auth-redirect-url');
        }
      }

      next = next || '/';

      if (next.startsWith('http')) {
        return NextResponse.redirect(next);
      }
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('Auth Exchange Error:', error);
      return NextResponse.redirect(`${origin}/?error=auth_failed`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
