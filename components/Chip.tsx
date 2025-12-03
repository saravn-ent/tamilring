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
        inline-block px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all
        ${active 
          ? 'bg-emerald-500 text-neutral-900' 
          : 'bg-neutral-800 text-zinc-300 border border-neutral-700 hover:border-emerald-500/50'}
      `}
    >
      {label}
    </Link>
  );
}
