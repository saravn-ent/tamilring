
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data } = await supabase.from('withdrawals').select('status').limit(1);
    if (data && data.length > 0) {
        console.log(`STATUS_VALUE: "${data[0].status}"`);
    } else {
        console.log('NO_RECORDS');
    }
}
check();
