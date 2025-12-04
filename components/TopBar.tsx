import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white/70 dark:bg-black/30 backdrop-blur-md z-40 border-b border-zinc-200 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter text-emerald-500">
          Tamil<span className="text-zinc-900 dark:text-white">Ring</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
