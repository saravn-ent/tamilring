import { NextRequest, NextResponse } from 'next/server';
import { searchTamilRing, getQuickSuggestions, getSearchDefaults } from '@/lib/searchEngine';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const suggest = searchParams.get('suggest') === 'true';
        const defaults = searchParams.get('defaults') === 'true';

        // 1. Fast suggestions for desktop menu bar search / typeahead
        if (suggest) {
            const suggestions = await getQuickSuggestions(query);
            return NextResponse.json({ success: true, suggestions });
        }

        // 2. Browse mode defaults (empty query)
        if (defaults) {
            const defaultData = await getSearchDefaults();
            return NextResponse.json({ success: true, ...defaultData });
        }

        // 3. Full Search Engine
        const tab = (searchParams.get('tab') || 'all') as 'all' | 'ringtones' | 'movies' | 'artists' | 'actors';
        const sort = (searchParams.get('sort') || 'downloads') as 'downloads' | 'recent' | 'likes' | 'year_desc' | 'year_asc';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 50);

        const results = await searchTamilRing({ query, tab, sort, page, limit });
        return NextResponse.json({ success: true, ...results });
    } catch (error) {
        console.error('API /api/search error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Search Engine Error' },
            { status: 500 }
        );
    }
}
