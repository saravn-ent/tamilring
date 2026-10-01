
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const POINTS_PER_UPLOAD = 15; // From gamification.ts

async function restore() {
    console.log('Starting restoration...');

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
            console.log(`\nUser: ${profile.full_name} (${profile.id})`);
            console.log(`- Profile says: ${profileCount} withdrawals`);
            console.log(`- Table has: ${dbCount} withdrawals`);
            console.log(`- Missing: ${profileCount - dbCount}`);

            // Calculate missing amount
            // Get approved uploads to calculate Total Lifetime Points
            const { count: approvedCount, error: uError } = await supabase
                .from('ringtones')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id)
                .eq('status', 'approved');

            if (uError) {
                console.error('Error counting uploads:', uError);
                continue;
            }

            const lifetimePoints = (approvedCount || 0) * POINTS_PER_UPLOAD;
            // Bonus: +15 for first upload (handled in create-profile usually, but checking `is_first_upload_rewarded`)
            // We'll ignore the bonus 15 complexity for now or check the profile flag
            // Let's rely on simple math: Refunded = Lifetime - Current.

            // Actually, easier: We know "Points" = Current Balance.
            // We assume Total Earned is roughly correct. 
            // Total Deducted = Lifetime - Current.
            // But we don't know Lifetime perfectly if there are other sources (referrals/bonuses).
            // Let's assume ONLY uploads give points for now.

            // Actually, better approach: 
            // If we insert a placeholder, the Admin can cross-check.
            // But let's try to be smart.

            const knownWithdrawnAmount = userWithdrawals.reduce((sum, w) => sum + w.amount, 0);

            // Let's try to fetch `is_first_upload_rewarded` to be more accurate
            const { data: richProfile } = await supabase.from('profiles').select('is_first_upload_rewarded').eq('id', profile.id).single();
            let bonus = richProfile?.is_first_upload_rewarded ? 15 : 0;

            const estimatedLifetime = (approvedCount * POINTS_PER_UPLOAD) + bonus;
            const calculatedDeduction = estimatedLifetime - profile.points;

            const missingAmountTotal = calculatedDeduction - knownWithdrawnAmount;
            const countMissing = profileCount - dbCount;
            const amountPerRequest = Math.floor(missingAmountTotal / countMissing);

            console.log(`- Est. Lifetime: ${estimatedLifetime}, Current: ${profile.points}`);
            console.log(`- Est. Total Withdrawn: ${calculatedDeduction}`);
            console.log(`- Known Withdrawn: ${knownWithdrawnAmount}`);
            console.log(`- Missing Amount: ${missingAmountTotal}`);
            console.log(`- Amount per missing request: ${amountPerRequest}`);

            if (amountPerRequest > 0) {
                console.log(`> Restoring ${countMissing} requests of ${amountPerRequest}...`);

                for (let i = 0; i < countMissing; i++) {
                    const { error: iError } = await supabase.from('withdrawals').insert({
                        user_id: profile.id,
                        amount: amountPerRequest,
                        upi_id: profile.upi_id || 'manual_restore@admin',
                        status: 'pending',
                        created_at: new Date().toISOString() // Now
                    });
                    if (iError) console.error('Insert Error:', iError);
                    else console.log('  + Restored 1 request.');
                }
            } else {
                console.warn('  ! Calculated amount is <= 0. Skipping to identify manually.');
            }
        }
    }
    console.log('\nDone.');
}

restore();
