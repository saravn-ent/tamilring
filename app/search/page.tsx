import { generateSearchMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import SearchPageClient from '@/components/SearchPageClient';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return generateSearchMetadata(q || '', undefined);
}

export default function SearchPage() {
  return <SearchPageClient />;
}
