'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

import { revalidateTag, revalidatePath } from 'next/cache'

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
