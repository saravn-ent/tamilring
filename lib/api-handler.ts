import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors/AppError';
import { z } from 'zod';

type ApiHandler = () => Promise<NextResponse>;

export async function apiHandler(handler: ApiHandler): Promise<NextResponse> {
    try {
        return await handler();
    } catch (error: any) {
        console.error('API Error:', error);

        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
