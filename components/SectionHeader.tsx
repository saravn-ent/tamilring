'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKeys } from '@/lib/i18n';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
  translationKey?: TranslationKeys;
}

export default function SectionHeader({ title, subtitle, href, translationKey }: SectionHeaderProps) {
  const { t } = useLanguage();

  const displayTitle = translationKey ? t(translationKey) : title;

  return (
    <div className="flex items-center justify-between mb-2.5 mt-3.5">
      <div className="flex items-center gap-1.5">
        <span className="w-1 h-3.5 rounded-full bg-m3-primary shrink-0" />
        <div className="flex items-baseline gap-1.5">
          <h2 suppressHydrationWarning className="text-sm sm:text-base font-bold tracking-tight text-m3-on-surface">
            {displayTitle}
          </h2>
          {subtitle && (
            <span className="text-[11px] sm:text-xs font-medium text-m3-on-surface-variant hidden sm:inline">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      {href && (
        <Link
          suppressHydrationWarning
          href={href}
          prefetch={false}
          className="text-[11px] sm:text-xs font-semibold text-m3-primary hover:underline flex items-center gap-0.5 transition-colors shrink-0"
        >
          {t('viewAll')} <ChevronRight size={13} />
        </Link>
      )}
    </div>
  );
}
