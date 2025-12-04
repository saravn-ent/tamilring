import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function UserProfilePage({ 
  params 
}: { 
  params: Promise<{ username: string }>
}) {
  const { username } = await params;
  const decodedName = decodeURIComponent(username);

  return (
    <div className="max-w-md mx-auto p-4 pb-24 min-h-screen flex flex-col items-center justify-center text-center">
      <Link href="/" className="absolute top-4 left-4 p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
        <ArrowLeft size={20} />
      </Link>
      
      <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl font-bold text-zinc-600">{decodedName[0].toUpperCase()}</span>
      </div>

      <h1 className="text-2xl font-bold text-zinc-100 mb-2">{decodedName}</h1>
      <p className="text-zinc-400 mb-8">User profiles are coming soon!</p>
    </div>
  );
}
