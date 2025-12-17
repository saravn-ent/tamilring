import { z } from 'zod';

export const ringtoneSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    movieName: z.string().min(1, "Movie name is required"),
    movieYear: z.string().regex(/^\d{4}$/, "Must be a valid year").optional(),
    singers: z.string().optional(),
    musicDirector: z.string().optional(),
    movieDirector: z.string().optional(),
    mood: z.string().optional(),
    tags: z.array(z.string()).max(10),
    audioUrl: z.string().url("Invalid Audio URL"),
    posterUrl: z.string().url("Invalid Poster URL").optional(),
});

export type RingtoneInput = z.infer<typeof ringtoneSchema>;

export const ringtoneUpdateSchema = ringtoneSchema.partial().extend({
    id: z.string().uuid()
});
