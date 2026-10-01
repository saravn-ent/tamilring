
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('Checking withdrawals table...');

    const { data: withdrawals, error } = await supabase
        .from('withdrawals')
        .select('*');

    if (error) {
        console.error('Error fetching withdrawals:', error);
        return;
    }

    console.log(`Found ${withdrawals.length} withdrawals.`);
    if (withdrawals.length > 0) {
        console.log('First 5:', withdrawals.slice(0, 5));
    } else {
        console.log('Table is empty.');
    }

    // Also check profiles with mismatch
    console.log('\nChecking for potential mismatches (users with withdrawals but no records)...');
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, total_withdrawn_count, points')
        .gt('total_withdrawn_count', 0);

    if (profiles && profiles.length > 0) {
        console.log(`Found ${profiles.length} profiles with withdrawal count > 0.`);
        profiles.forEach(p => {
            const count = withdrawals.filter(w => w.user_id === p.id).length;
            if (count !== p.total_withdrawn_count) {
                console.log(`MISMATCH: User ${p.full_name} (${p.id}) has count ${p.total_withdrawn_count} but found ${count} records.`);
            }
        });
    }
}

check();
