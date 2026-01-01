import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

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
                setAll(cookiesToSet) {
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
        <div className="min-h-screen bg-[#050505]">
            <AdminSidebar />
            <div className="md:ml-64 min-h-screen p-4 md:p-8 pt-24 md:pt-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
