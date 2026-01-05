'use server'

import { revalidatePath } from 'next/cache';
import { getSupabaseServer, ensureAuthenticated, ensureAdmin } from '@/lib/auth-server';

export async function createRingtoneRequest(formData: {
    movie_name: string;
    song_name: string;
    description?: string;
}) {
    try {
        const { user } = await ensureAuthenticated();
        const supabase = await getSupabaseServer();

        const { error } = await supabase
            .from('ringtone_requests')
            .insert({
                user_id: user.id,
                movie_name: formData.movie_name,
                song_name: formData.song_name,
                description: formData.description || null,
                status: 'pending'
            });

        if (error) throw error;

        revalidatePath('/requests');
        return { success: true };
    } catch (e: any) {
        console.error('Request creation failed:', e);
        return { success: false, error: e.message || 'Failed to create request' };
    }
}

export async function fulfillRequest(requestId: string) {
    try {
        await ensureAdmin();
        const { getSupabaseAdmin } = await import('@/lib/auth-server');
        const supabase = await getSupabaseAdmin();

        const { error } = await supabase
            .from('ringtone_requests')
            .update({ status: 'fulfilled' })
            .eq('id', requestId);

        if (error) throw error;

        revalidatePath('/requests');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteRequest(requestId: string) {
    try {
        const { user } = await ensureAuthenticated();
        const supabase = await getSupabaseServer();

        // RLS will handle permission (only own pending or admin)
        const { error } = await supabase
            .from('ringtone_requests')
            .delete()
            .eq('id', requestId)
            .eq('user_id', user.id); // Simple safety check for users

        if (error) throw error;

        revalidatePath('/requests');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
