import { db } from '@/lib/db';
import { ringtones } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { RingtoneInput } from '@/lib/validators/ringtone';

export class RingtoneRepository {
    async findAll({ limit = 20, offset = 0, status = 'approved' }: { limit?: number; offset?: number; status?: 'approved' | 'pending' | 'rejected' } = {}) {
        return await db.select()
            .from(ringtones)
            .where(eq(ringtones.status, status))
            .limit(limit)
            .offset(offset)
            .orderBy(desc(ringtones.createdAt));
    }

    async findBySlug(slug: string) {
        const results = await db.select().from(ringtones).where(eq(ringtones.slug, slug)).limit(1);
        return results[0] || null;
    }

    async create(data: RingtoneInput & { userId: string; slug: string }) {
        const results = await db.insert(ringtones).values({
            ...data,
            tags: data.tags || [], // Ensure tags is array
        }).returning();
        return results[0];
    }

    async update(id: string, data: Partial<RingtoneInput>) {
        const results = await db.update(ringtones)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(ringtones.id, id))
            .returning();
        return results[0];
    }

    async incrementDownloads(id: string) {
        return await db.update(ringtones)
            .set({ downloads: sql`${ringtones.downloads} + 1` })
            .where(eq(ringtones.id, id));
    }
}
