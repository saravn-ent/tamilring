import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(_cookiesToSet) {
                    // Middleware handles session maintenance
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    let isAdmin = false;

    // Strict check for the owner email as a fail-safe
    if (user.email === 'saravn.ent@gmail.com') {
        isAdmin = true;
    } else {
        // Check role in DB
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role === 'admin') {
            isAdmin = true;
        }
    }

    if (!isAdmin) {
        redirect('/');
    }

    return (
        <AdminShell user={user}>
            {children}
        </AdminShell>
    );
}
