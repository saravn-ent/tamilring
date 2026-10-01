import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const KNOWN_FEMALE_SINGERS = [
    'Shreya Ghoshal', 'Chinmayi Sripaada', 'Shashaa Tirupati', 'KS Chithra', 'S. Janaki',
    'Jonita Gandhi', 'Swetha Mohan', 'Dhee', 'Andrea Jeremiah', 'Shilpa Rao',
    'Sunitha Sarathy', 'Saindhavi', 'Shakti Shree Gopalan', 'Anuradha Sriram',
    'P. Susheela', 'Bombay Jayashri', 'Sujatha', 'Neeti Mohan', 'Ramya NSK', 'Nithyashree Mahadevan',
    'Dua Lipa', 'Ariana Grande', 'Taylor Swift', 'Billie Eilish', 'Selena Gomez'
]

async function findTopFemaleArtists() {
    // 1. Get all singers from Female tagged ringtones
    const { data, error } = await supabase
        .from('ringtones')
        .select('singers')
        .eq('status', 'approved')
        .contains('tags', ['Female'])

    if (error) {
        console.error(error)
        return
    }

    const singerCounts: Record<string, number> = {}
    data.forEach(r => {
        if (!r.singers) return
        const names = r.singers.split(',').map((n: string) => n.trim()).filter(Boolean)
        names.forEach((name: string) => {
            // Basic check: is it in our known female list OR does it sound female?
            // For now, let's just count all and we will manually pick the top ones that are female.
            singerCounts[name] = (singerCounts[name] || 0) + 1
        })
    })

    const results = Object.entries(singerCounts)
        .sort((a, b) => b[1] - a[1])

    console.log('Singers in Female-tagged ringtones:')
    console.log(JSON.stringify(results, null, 2))
}

findTopFemaleArtists()
