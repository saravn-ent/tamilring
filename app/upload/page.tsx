import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const UploadForm = dynamic(() => import('@/components/UploadForm'), {
  ssr: false,
  loading: () => <div className="p-12 text-center animate-pulse text-zinc-500">Loading Form...</div>
});

export default function UploadPage() {
  return (
    <div className="max-w-md mx-auto p-4">
      <header className="flex items-center gap-4 py-4 mb-6">
        <Link href="/" className="p-2 bg-neutral-800 rounded-full text-zinc-400 hover:text-zinc-100">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-zinc-100">Upload Ringtone</h1>
      </header>
      <UploadForm />
    </div>
  );
}
