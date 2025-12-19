
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
            },
        }
    )

    try {
        const { data: { user } } = await supabase.auth.getUser()

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user?.id || '')
            .single()

        const results: any = {
            authenticated: !!user,
            userId: user?.id,
            role: profile?.role,
            counts: {}
        }

        if (profile?.role === 'admin') {
            const tables = ['profiles', 'ringtones', 'withdrawals']
            for (const table of tables) {
                const { count, error } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true })

                results.counts[table] = error ? { error: error.message } : count
            }

            // Check if withdrawals has ANY data bypassing status filter
            const { data: anyWithdrawals, error: wError } = await supabase
                .from('withdrawals')
                .select('*')
                .limit(1)

            results.anyWithdrawals = wError ? { error: wError.message } : anyWithdrawals
        }

        return NextResponse.json(results)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
