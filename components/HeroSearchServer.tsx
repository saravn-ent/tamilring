import HeroSearch from './HeroSearch';
import { getTrendingTags } from '@/app/actions/ringtones';

export default async function HeroSearchServer() {
    // We use a static language 'tamil' here to make this part ISR-ready and ultra-fast.
    // Personalization can be layered on client-side if needed.
    const trendingTags = await getTrendingTags(8, 'tamil');

    return <HeroSearch trendingTags={trendingTags} />;
}
