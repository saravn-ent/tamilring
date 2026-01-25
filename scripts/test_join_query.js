
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Use ANON key to simulate the browser's access
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testFetch() {
    console.log('Testing fetch as a simulated user...');

    // First, we need to sign in as the admin user to pass RLS
    const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
        email: 'saravn.ent@gmail.com',
        password: '...' // Wait, I don't have the password.
    });

    // I can't sign in easily.
    // Let's use service role but simulate the query.
}

// Better: Test the query with service role to see if the JOIN is valid.
const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testJoin() {
    console.log('Testing join query with Service Role...');
    const { data, error } = await adminSupabase
        .from('withdrawals')
        .select(`
            *,
            profile:profiles!user_id (
                full_name,
                avatar_url,
                points
            )
        `)
        .eq('status', 'pending');

    if (error) {
        console.error('JOIN QUERY FAILED:', error);
    } else {
        console.log(`Success! Found ${data.length} records with join.`);
        if (data.length > 0) {
            console.log('First record profile:', data[0].profile);
        }
    }
}

testJoin();

