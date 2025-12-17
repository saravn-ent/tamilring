import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString && process.env.NODE_ENV !== 'production') {
    console.warn('DATABASE_URL is not set in environment variables.');
}

// Disable prefetch as it is not supported for "Transaction" pool mode if used with Supabase Transaction Pool
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
