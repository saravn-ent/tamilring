import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkTags() {
    const { data, error } = await supabase
        .from('ringtones')
        .select('title, tags, language, status')
        .limit(500)

    if (error) {
        console.error(error)
        return
    }

    const approved = data.filter(r => r.status === 'approved')
    const femaleSongs = approved.filter(r =>
        r.tags?.some((t: string) => t.toLowerCase() === 'female')
    )

    console.log(`Total songs: ${data.length}`)
    console.log(`Approved songs: ${approved.length}`)
    console.log(`Approved songs with 'Female' tag: ${femaleSongs.length}`)

    const langCounts: any = {}
    femaleSongs.forEach(r => {
        const l = r.language || 'null'
        langCounts[l] = (langCounts[l] || 0) + 1
    })

    console.log('Female songs by language:', langCounts)

    if (femaleSongs.length > 0) {
        console.log('Sample female song:', femaleSongs[0])
    } else {
        // If none found, show unique tags from first 50 approved songs
        const allTags = new Set()
        approved.slice(0, 50).forEach(r => r.tags?.forEach((t: string) => allTags.add(t)))
        console.log('Unique tags in approved songs:', Array.from(allTags))
    }
}

checkTags()
