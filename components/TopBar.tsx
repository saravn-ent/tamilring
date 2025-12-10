import Link from 'next/link';
import { Scissors } from 'lucide-react';


export default function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-neutral-900/80 backdrop-blur-md z-40 border-b border-neutral-800 transition-colors duration-300">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter text-emerald-500">
          Tamil<span className="text-zinc-900 dark:text-white">Ring</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/trim" className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 transition-colors" aria-label="Ringtone Cutter">
            <Scissors size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
