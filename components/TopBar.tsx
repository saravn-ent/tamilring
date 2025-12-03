import Link from 'next/link';
import { Search } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-neutral-900/80 backdrop-blur-md z-40 border-b border-neutral-800">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter text-emerald-500">
          Tamil<span className="text-white">Ring</span>
        </Link>
        <Link href="/search" className="p-2 text-zinc-400 hover:text-white transition-colors">
          <Search size={20} />
        </Link>
      </div>
    </div>
  );
}
