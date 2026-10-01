
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function apply() {
    console.log('Applying migration 006...');
    const sqlPath = path.join(__dirname, '../db/migrations/006_allow_withdrawal_insert.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Supabase JS client doesn't expose a direct 'query' method easily unless via RPC or specific setup.
    // Use the `rpc` if available, or just use pg-node if installed? 
    // package.json has 'postgres' package.

    const postgres = require('postgres');
    const sqlClient = postgres(process.env.DATABASE_URL);

    try {
        await sqlClient.unsafe(sql);
        console.log('Migration applied successfully.');
    } catch (e) {
        console.error('Error applying migration:', e);
    } finally {
        await sqlClient.end();
    }
}

apply();
