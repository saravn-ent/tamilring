const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
    const { data, count, error } = await supabase
        .from('ringtones')
        .select('id', { count: 'exact' })
        .is('poster_url', null)
        .eq('status', 'approved');
    
    if (error) {
        console.error(error);
    } else {
        console.log(`Remaining ringtones with missing posters: ${count}`);
    }
})();
