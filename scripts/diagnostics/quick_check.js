
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { count, error } = await supabase
        .from('withdrawals')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Total withdrawals in DB:', count);
    }

    const { data: pending, error: pError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending');

    if (pError) {
        console.error('Pending Error:', pError);
    } else {
        console.log('Pending withdrawals count:', pending.length);
        if (pending.length > 0) {
            console.log('Sample pending:', pending[0]);
        }
    }
}

check();
