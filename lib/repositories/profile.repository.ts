import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ProfileInput } from '@/lib/validators/profile';

export class ProfileRepository {
    async findById(id: string) {
        const results = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
        return results[0] || null;
    }

    async update(id: string, data: ProfileInput) {
        const results = await db.update(profiles)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(profiles.id, id))
            .returning();
        return results[0];
    }

    async createOrUpdate(id: string, email: string) {
        // Upsert logic for initial login
        return await db.insert(profiles).values({ id, email })
            .onConflictDoNothing()
            .returning();
    }
}
