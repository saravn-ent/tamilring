
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    const migrationPath = path.join(__dirname, '../db/migrations/007_secure_withdrawals.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration: 007_secure_withdrawals.sql');

    // Note: Standard Supabase client doesn't support raw SQL easily unless enabled via RPC or direct connection.
    // Assuming the user has a way to run migrations, or we use a "pg" client.
    // But let's try via a known RPC if available, or just inform the user.
    // Wait, the project uses `postgres` library in `lib/db/index.ts`.
    // I can use that!

    try {
        const postgres = require('postgres');
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            console.error('DATABASE_URL missing. Cannot run migration.');
            return;
        }

        const sqlClient = postgres(connectionString);

        await sqlClient.unsafe(sql);

        console.log('Migration applied successfully!');
        await sqlClient.end();
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            console.warn('postgres module not found in script context. Please run migration manually.');
        } else {
            console.error('Migration failed:', err);
        }
    }
}

runMigration();
