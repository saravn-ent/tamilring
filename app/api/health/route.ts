import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { apiHandler } from '@/lib/api-handler';

export async function GET() {
    return apiHandler(async () => {
        // Check DB connection
        await db.execute(sql`SELECT 1`);

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    });
}
