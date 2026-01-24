'use client';

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
        <Link href="/" className="p-2 bg-zinc-100 rounded-full text-zinc-600 hover:text-brand-accent transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-zinc-900">Upload Ringtone</h1>
      </header>
      <UploadForm />
    </div>
  );
}
