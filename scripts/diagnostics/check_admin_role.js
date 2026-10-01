
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAdmin() {
    console.log('Checking for Admin users...');
    const { data: admins, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('role', 'admin');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${admins.length} admins:`);
    admins.forEach(a => console.log(`- ${a.email} (${a.full_name}) [${a.role}]`));

    // Also check the specific user saravn.ent@gmail.com
    const { data: specific } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('email', 'saravn.ent@gmail.com')
        .single();

    if (specific) {
        console.log('\nSpecific user check (saravn.ent@gmail.com):');
        console.log(`- Role: ${specific.role}`);
        if (specific.role !== 'admin') {
            console.log('WARNING: This user is NOT marked as admin in the DB.');
        }
    } else {
        console.log('\nUser saravn.ent@gmail.com not found in profiles.');
    }
}

checkAdmin();
