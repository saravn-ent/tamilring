import HeroSpotlight from './HeroSpotlight';
import { getTrendingRingtones } from '@/app/actions/ringtones';

export default async function HeroSpotlightServer({ lang = 'tamil' }: { lang?: string }) {
    // Fetch top 10 trending ringtones to power the interactive radio queue
    const tracks = await getTrendingRingtones(10, lang);

    return <HeroSpotlight tracks={tracks || []} />;
}
