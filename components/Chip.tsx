import Link from 'next/link';

interface ChipProps {
  label: string;
  href: string;
  active?: boolean;
}

export default function Chip({ label, href, active }: ChipProps) {
  return (
    <Link 
      href={href}
      className={`
        inline-flex items-center justify-center h-8 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95
        ${active 
          ? 'bg-m3-secondary-container text-m3-on-secondary-container border border-transparent shadow-2xs' 
          : 'bg-m3-surface-container-low text-m3-on-surface-variant border border-m3-outline-variant/60 hover:bg-m3-surface-container hover:text-m3-on-surface'}
      `}
    >
      {label}
    </Link>
  );
}

