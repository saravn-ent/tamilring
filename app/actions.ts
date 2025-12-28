'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidateTag, revalidatePath, unstable_cache } from 'next/cache'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}

export async function incrementLikes(ringtoneId: string) {
  const supabase = await getSupabase()

  // Try RPC first (atomic)
  const { error: rpcError } = await supabase.rpc('increment_likes', { row_id: ringtoneId })

  if (!rpcError) return { success: true }

  // Fallback: Fetch and Update (non-atomic)
  const { data: ringtone, error: fetchError } = await supabase
    .from('ringtones')
    .select('likes')
    .eq('id', ringtoneId)
    .single()

  if (fetchError || !ringtone) return { success: false, error: fetchError }

  const { error: updateError } = await supabase
    .from('ringtones')
    .update({ likes: (ringtone.likes || 0) + 1 })
    .eq('id', ringtoneId)

  if (updateError) return { success: false, error: updateError }

  return { success: true }
}

export async function incrementDownloads(ringtoneId: string) {
  const supabase = await getSupabase()

  // Try RPC first (atomic)
  const { error: rpcError } = await supabase.rpc('increment_downloads', { row_id: ringtoneId })

  if (!rpcError) return { success: true }

  // Fallback: Fetch and Update (non-atomic)
  const { data: ringtone, error: fetchError } = await supabase
    .from('ringtones')
    .select('downloads')
    .eq('id', ringtoneId)
    .single()

  if (fetchError || !ringtone) return { success: false, error: fetchError }

  const { error: updateError } = await supabase
    .from('ringtones')
    .update({ downloads: (ringtone.downloads || 0) + 1 })
    .eq('id', ringtoneId)

  if (updateError) return { success: false, error: updateError }

  return { success: true }
}


// ... imports

export async function revalidateArtistCache() {
  try {
    // Current Next.js types for server actions can be strict about void/return types
    // @ts-expect-error - revalidateTag returns void, but we wrap it for safety
    revalidateTag('homepage-artists')
    revalidatePath('/', 'page') // Stronger refresh for homepage
  } catch (e) {
    console.error('Revalidation failed:', e)
  }
  return { success: true, timestamp: Date.now() }
}

export async function notifyAdminOnUpload(ringtoneData: {
  title: string;
  movie_name: string;
  user_id: string;
  tags?: string[];
  slug?: string;
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return { success: false, error: 'No webhook URL configured' };

  try {
    const embed = {
      title: "🎵 New Ringtone Uploaded (Auto-Approved)",
      url: `https://tamilring.in/ringtone/${ringtoneData.slug}`, // Link to live ringtone
      color: 5090150, // #4DAC66
      fields: [
        { name: "Title", value: ringtoneData.title, inline: true },
        { name: "Movie", value: ringtoneData.movie_name, inline: true },
        { name: "User", value: ringtoneData.user_id, inline: false },
        { name: "Tags", value: Array.isArray(ringtoneData.tags) ? ringtoneData.tags.join(', ') : "None", inline: false }
      ],
      timestamp: new Date().toISOString(),
      footer: { text: "TamilRing Admin Bot" }
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: "New upload live on site!",
        embeds: [embed]
      })
    });

    if (!res.ok) throw new Error(`Discord API Status: ${res.status}`);

    return { success: true };
  } catch (e) {
    console.error('Notification failed:', e);
    return { success: false }; // Fail silently for user
  }
}

export async function handleUploadReward(userId: string) {
  const supabase = await getSupabase();

  // 1. Check if first upload reward already given
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_first_upload_rewarded, points')
    .eq('id', userId)
    .single();

  if (profile && !profile.is_first_upload_rewarded) {
    // 2. Give 15 Rep bonus immediately
    const { error } = await supabase
      .from('profiles')
      .update({
        is_first_upload_rewarded: true,
        points: (profile.points || 0) + 15
      })
      .eq('id', userId);

    if (error) return { success: false, error };
    return { success: true, bonusGiven: true };
  }

  return { success: true, bonusGiven: false };
}

export async function handleWithdrawal(userId: string, amount: number, upiId: string) {
  const supabase = await getSupabase();

  // 1. Get current profile stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('points, total_withdrawn_count')
    .eq('id', userId)
    .single();

  if (!profile) return { success: false, error: 'User not found' };

  // 2. Validate withdrawal logic
  const isFirstTime = (profile.total_withdrawn_count || 0) === 0;
  const minThreshold = isFirstTime ? 15 : 200;

  if (amount < minThreshold) {
    return { success: false, error: `Minimum withdrawal is ${minThreshold} Rep` };
  }

  // Force first withdrawal to be exactly 15 Rep for safety/test
  const withdrawAmount = isFirstTime ? 15 : amount;

  if (profile.points < withdrawAmount) {
    return { success: false, error: `Insufficient Reputation Points. Need ${withdrawAmount} Rep.` };
  }

  // 3. Process withdrawal (Atomic update)
  const { error } = await supabase
    .from('profiles')
    .update({
      points: profile.points - withdrawAmount,
      total_withdrawn_count: (profile.total_withdrawn_count || 0) + 1,
      upi_id: upiId // Ensure UPI ID is saved
    })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };

  // 4. Log withdrawal in the database for admin to see
  const { error: logError } = await supabase
    .from('withdrawals')
    .insert({
      user_id: userId,
      amount: withdrawAmount,
      upi_id: upiId,
      status: 'pending'
    });

  if (logError) {
    console.error('Failed to log withdrawal to DB:', logError);
    return { success: false, error: 'Failed to record withdrawal request. Please contact support.' };
  }

  // 5. Revalidate
  try {
    revalidatePath('/profile');
    revalidatePath('/admin/withdrawals');
  } catch (e) {
    console.warn('Revalidation failed, data might be stale:', e);
  }

  // 6. Log withdrawal (Optionally notify admin via Discord)
  await notifyAdminOnWithdrawal(userId, withdrawAmount, upiId);

  return { success: true };
}

async function notifyAdminOnWithdrawal(userId: string, amount: number, upiId: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `💰 **Withdrawal Request**\nUser: ${userId}\nAmount: ${amount} Rep\nUPI ID: ${upiId}`,
      })
    });
  } catch (e) {
    console.error('Withdrawal notification failed', e);
  }
}


export const getTrendingRingtones = unstable_cache(
  async (limit: number = 10) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.rpc('get_trending_ringtones', { limit_count: limit });
    if (error) {
      console.warn('Trending RPC failed, falling back to recent', error);
      const { data: fallback } = await supabase
        .from('ringtones')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit);
      return fallback || [];
    }
    return data || [];
  },
  ['trending-ringtones'],
  { revalidate: 3600, tags: ['trending'] }
);

export const getTopAlbums = unstable_cache(
  async (limit: number = 10) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.rpc('get_top_albums_v2', { limit_count: limit });
    if (error) {
      console.warn('Top Albums RPC failed', error);
      return [];
    }
    return data || [];
  },
  ['top-albums'],
  { revalidate: 3600, tags: ['top-albums'] }
);

export async function updateWithdrawalStatus(withdrawalId: string, status: 'completed' | 'rejected') {
  const supabase = await getSupabase();

  // 1. Get the withdrawal record to find the user and amount
  const { data: withdrawal, error: fetchError } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('id', withdrawalId)
    .single();

  if (fetchError || !withdrawal) {
    return { success: false, error: 'Withdrawal request not found' };
  }

  // 2. If rejecting, we must refund the points
  if (status === 'rejected' && withdrawal.status === 'pending') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', withdrawal.user_id)
      .single();

    if (profile) {
      const { error: refundError } = await supabase
        .from('profiles')
        .update({ points: (profile.points || 0) + withdrawal.amount })
        .eq('id', withdrawal.user_id);

      if (refundError) {
        console.error('Failed to refund points for rejected withdrawal:', refundError);
        return { success: false, error: 'Failed to refund points' };
      }
    }
  }

  // 3. Update the withdrawal status
  const { error: updateError } = await supabase
    .from('withdrawals')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', withdrawalId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  try {
    revalidatePath('/admin/withdrawals');
    revalidatePath('/profile');
  } catch (e) {
    console.warn('Revalidation failed:', e);
  }

  return { success: true };
}
export async function approveRingtone(id: string, userId?: string) {
  const supabase = await getSupabase();

  // 1. Update status to approved
  const { error } = await supabase
    .from('ringtones')
    .update({ status: 'approved' })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  // 2. Award points if userId provided
  if (userId) {
    try {
      const { awardPoints, checkUploadBadges, POINTS_PER_UPLOAD } = await import('@/lib/gamification');
      await awardPoints(supabase, userId, POINTS_PER_UPLOAD);
      await checkUploadBadges(supabase, userId);
    } catch (e) {
      console.warn('Gamification failed during approval:', e);
    }
  }

  // 3. Revalidate paths to update site immediately
  try {
    revalidatePath('/', 'layout'); // Force clear all
    revalidatePath('/admin/ringtones');

    // @ts-expect-error - revalidateTag has type issues in Next.js 16
    revalidateTag('homepage-artists'); // In case it affects stats
  } catch (e) {
    console.warn('Ringtone revalidation failed:', e);
  }

  return { success: true };
}

export async function rejectRingtone(id: string, reason?: string) {
  const supabase = await getSupabase();

  // 1. Update status to rejected
  const { error } = await supabase
    .from('ringtones')
    .update({
      status: 'rejected',
      rejection_reason: reason || null
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  // 2. Revalidate paths
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/admin/ringtones');
  } catch (e) {
    console.warn('Rejection revalidation failed:', e);
  }

  return { success: true };
}
