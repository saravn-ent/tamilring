import React from 'react';
import { getTopArtists } from '@/components/home/HomeTopArtists';
import ArtistsHubClient from './ArtistsHubClient';

interface Props {
    lang: string;
}

export default async function HomeArtistsHub({ lang }: Props) {
    const { topSingers, topMusicDirectors, topActors, topMovieDirectors } = await getTopArtists(lang);

    return (
        <ArtistsHubClient
            singers={topSingers || []}
            musicDirectors={topMusicDirectors || []}
            actors={topActors || []}
            movieDirectors={topMovieDirectors || []}
        />
    );
}
