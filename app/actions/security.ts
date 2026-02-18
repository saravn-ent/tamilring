
'use server'

import { verifyTurnstileToken } from '@/lib/security';

export async function validateCaptcha(token: string) {
    if (!token) return { success: false, error: 'CAPTCHA token is missing' };
    
    const isValid = await verifyTurnstileToken(token);
    
    if (!isValid) {
        return { success: false, error: 'Security challenge failed. Please try again.' };
    }
    
    return { success: true };
}
