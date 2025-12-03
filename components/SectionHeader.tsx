import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  href?: string;
}

export default function SectionHeader({ title, href }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 mb-3 mt-6">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {href && (
        <Link href={href} className="text-xs text-emerald-500 flex items-center hover:underline">
          See All <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}
