import { getSupabaseAdmin } from '@/lib/auth-server';

export async function getDmcaStats() {
    try {
        const supabase = await getSupabaseAdmin();
        const { count: total } = await supabase.from('dmca_requests').select('*', { count: 'exact', head: true });
        const { count: approved } = await supabase.from('dmca_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved');
        
        return {
            total: total || 0,
            approved: approved || 0
        };
    } catch (e) {
        console.error('Failed to fetch DMCA stats:', e);
        return { total: 0, approved: 0 };
    }
}
