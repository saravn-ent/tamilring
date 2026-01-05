'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKeys } from '@/lib/i18n';

interface SectionHeaderProps {
  title: string;
  href?: string;
  translationKey?: TranslationKeys;
}

export default function SectionHeader({ title, href, translationKey }: SectionHeaderProps) {
  const { t } = useLanguage();

  const displayTitle = translationKey ? t(translationKey) : title;

  return (
    <div className="flex items-center justify-between mb-3 mt-6">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{displayTitle}</h2>
      {href && (
        <Link href={href} className="text-xs text-emerald-500 flex items-center hover:underline">
          {t('viewAll')} <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}
