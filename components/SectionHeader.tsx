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
      <h2 suppressHydrationWarning className="text-lg font-bold text-black">{displayTitle}</h2>
      {href && (
        <Link suppressHydrationWarning href={href} className="text-xs text-brand-dark hover:text-brand-accent flex items-center hover:underline transition-colors font-medium">
          {t('viewAll')} <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}
