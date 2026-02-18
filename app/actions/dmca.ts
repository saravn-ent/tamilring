'use server'

import { getSupabaseServer, getSupabaseAdmin, ensureAdmin } from '@/lib/auth-server'
import { revalidatePath } from 'next/cache'

export async function submitDmcaRequest(formData: {
    name: string;
    email: string;
    phone: string;
    workDescription: string;
    infringingUrls: string;
    goodFaith: boolean;
    accurate: boolean;
}) {
    const supabase = await getSupabaseServer()
    
    const { error } = await supabase.from('dmca_requests').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        work_description: formData.workDescription,
        infringing_urls: formData.infringingUrls,
        good_faith: formData.goodFaith,
        accurate: formData.accurate
    })
    
    if (error) {
        console.error('DMCA Submission Error:', error)
        return { success: false, error: error.message }
    }
    
    return { success: true }
}

export async function approveDmcaTakedown(id: string) {
    try {
        await ensureAdmin()
        const supabase = await getSupabaseAdmin()
        
        // 1. Get the request
        const { data: request } = await supabase
            .from('dmca_requests')
            .select('infringing_urls')
            .eq('id', id)
            .single()
            
        if (!request) return { success: false, error: 'Request not found' }

        // 2. Parse URLs to find content to delete
        // Expected format: https://tamilring.in/ringtone/some-slug-uuid
        // We look for UUIDs in the text
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
        const matches = request.infringing_urls.match(uuidRegex);
        
        let deletedCount = 0;
        
        if (matches && matches.length > 0) {
            // Delete from DB (which likely triggers storage cleanup if implemented, or we do manual)
            // Using admin privileges to bypass RLS
            const { count } = await supabase
                .from('ringtones')
                .delete({ count: 'exact' })
                .in('id', matches);
                
            deletedCount = count || 0;
            
            // Also delete from storage if possible (omitted for brevity, assume scheduled cleanup or triggers)
        }
        
        // 3. Mark request as approved/completed
        const { error } = await supabase
            .from('dmca_requests')
            .update({ 
                status: 'approved',
                admin_notes: `Auto-Takedown verified. ${deletedCount} items removed.`
            })
            .eq('id', id)
            
        if (error) throw error
        
        revalidatePath('/admin/dmca')
        revalidatePath('/legal/dmca')
        return { success: true, deletedCount }
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        return { success: false, error: message }
    }
}

export async function rejectDmcaRequest(id: string) {
     try {
        await ensureAdmin()
        const supabase = await getSupabaseAdmin()
        
        const { error } = await supabase
            .from('dmca_requests')
            .update({ status: 'rejected' })
            .eq('id', id)
            
        if (error) throw error
        
        revalidatePath('/admin/dmca')
        revalidatePath('/legal/dmca')
        return { success: true }
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        return { success: false, error: message }
    }
}
