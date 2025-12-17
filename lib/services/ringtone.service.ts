import { RingtoneRepository } from '@/lib/repositories/ringtone.repository';
import { cache, getCached, setCached } from '@/lib/cache/redis';
import { AppError } from '@/lib/errors/AppError';

export class RingtoneService {
    constructor(private repository: RingtoneRepository) { }

    async getTrendingRingtones(limit: number = 10) {
        const cacheKey = `trending:${limit}`;
        const cached = await getCached(cacheKey);
        if (cached) return cached;

        // Logic for trending (mocked as latest approved for now, typically sort by downloads)
        const ringtones = await this.repository.findAll({ limit, status: 'approved' });

        await setCached(cacheKey, ringtones, 300); // 5 min cache
        return ringtones;
    }

    async getRingtoneBySlug(slug: string) {
        const cacheKey = `ringtone:${slug}`;
        const cached = await getCached(cacheKey);
        if (cached) return cached;

        const ringtone = await this.repository.findBySlug(slug);
        if (!ringtone) throw new AppError('Ringtone not found', 404);

        await setCached(cacheKey, ringtone, 3600); // 1 hour cache
        return ringtone;
    }
}

export const ringtoneService = new RingtoneService(new RingtoneRepository());
