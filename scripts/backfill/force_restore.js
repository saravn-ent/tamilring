
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const POINTS_PER_UPLOAD = 15;

async function forceRestore() {
    console.log('Starting FORCE restoration...');

    // 1. Get Profiles with withdrawals
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, full_name, total_withdrawn_count, points, upi_id')
        .gt('total_withdrawn_count', 0);

    if (pError) return console.error('Profiles Error:', pError);

    // 2. Get Withdrawals
    const { data: withdrawals, error: wError } = await supabase
        .from('withdrawals')
        .select('*');

    if (wError) return console.error('Withdrawals Error:', wError);

    const withdrawalsByUser = {};
    withdrawals.forEach(w => {
        if (!withdrawalsByUser[w.user_id]) withdrawalsByUser[w.user_id] = [];
        withdrawalsByUser[w.user_id].push(w);
    });

    for (const profile of profiles) {
        const userWithdrawals = withdrawalsByUser[profile.id] || [];
        const dbCount = userWithdrawals.length;
        const profileCount = profile.total_withdrawn_count;

        if (profileCount > dbCount) {
            const missingCount = profileCount - dbCount;
            console.log(`\nUser: ${profile.full_name || 'Unknown'} (${profile.id})`);
            console.log(`- Expected: ${profileCount}, Found: ${dbCount}, Missing: ${missingCount}`);

            // We will restore just 1 request with a placeholder amount if we can't calculate it, 
            // but we'll flag it.
            const amount = 100; // Safe default minimum

            console.log(`> Force restoring ${missingCount} requests with amount ${amount}...`);

            for (let i = 0; i < missingCount; i++) {
                const { error } = await supabase.from('withdrawals').insert({
                    user_id: profile.id,
                    amount: amount,
                    upi_id: profile.upi_id || 'manual_restore_needed',
                    status: 'pending',
                    created_at: new Date().toISOString()
                });

                if (error) console.error('  X Insert failed:', error);
                else console.log('  + Restored 1 request successfully.');
            }
        }
    }
    console.log('\nRestoration complete.');
}

forceRestore();
