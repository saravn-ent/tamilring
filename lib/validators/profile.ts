import { z } from 'zod';

export const profileSchema = z.object({
    fullName: z.string().min(2).max(50).optional(),
    bio: z.string().max(500).optional(),
    websiteUrl: z.string().url().optional().or(z.literal('')),
    instagramHandle: z.string().max(30).optional(),
    twitterHandle: z.string().max(30).optional(),
    upiId: z.string().optional(), // Add basic regex for UPI if needed
    btcAddress: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
