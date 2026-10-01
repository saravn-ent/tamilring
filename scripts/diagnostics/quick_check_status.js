
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: withdrawals, error } = await supabase
        .from('withdrawals')
        .select('status');

    if (error) {
        console.error('Error:', error);
    } else {
        const statuses = {};
        withdrawals.forEach(w => {
            statuses[w.status] = (statuses[w.status] || 0) + 1;
        });
        console.log('Withdrawal Statuses:', statuses);
    }
}

check();
