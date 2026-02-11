
require('dotenv').config({ path: '.env.local' });
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { pgTable, uuid, text, integer, timestamp } = require('drizzle-orm/pg-core');

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

const withdrawals = pgTable('withdrawals', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').notNull(),
    amount: integer('amount').notNull(),
    upi_id: text('upi_id').notNull(),
    status: text('status').default('pending')
});

async function testDrizzle() {
    console.log('Inserting via Drizzle...');
    try {
        const { data: profiles } = await client`SELECT id FROM profiles LIMIT 1`;
        if (profiles.length === 0) return;
        const userId = profiles[0].id;

        await db.insert(withdrawals).values({
            user_id: userId,
            amount: 888,
            upi_id: 'drizzle@test',
            status: 'pending'
        });
        console.log('Drizzle insert finished');
    } catch (e) {
        console.error('Drizzle Error:', e);
    } finally {
        await client.end();
    }
}

testDrizzle();
