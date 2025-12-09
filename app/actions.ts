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

export async function revalidateArtistCache() {
  try {
    // @ts-expect-error - Next.js type mismatch workaround
    revalidateTag('homepage-artists')
    revalidatePath('/', 'page') // Stronger refresh for homepage
  } catch (e) {
    console.error('Revalidation failed:', e)
  }
  return { success: true }
}
