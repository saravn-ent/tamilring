import UploadForm from '@/components/UploadForm';
import FavoritesList from '@/components/FavoritesList';
import { User, Settings, LogOut, Heart } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="max-w-md mx-auto p-4 pb-24">
      <header className="flex items-center gap-4 py-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-neutral-900">
          <User size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Guest User</h1>
          <p className="text-sm text-zinc-400">Sign in to sync your likes</p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Favorites Section */}
        <section>
          <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <Heart size={20} className="text-emerald-500" />
            My Favorites
          </h2>
          <FavoritesList />
        </section>

        {/* Upload Section */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
            Upload Ringtone
          </h2>
          <UploadForm />
        </section>

        {/* Settings Section */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between hover:bg-neutral-800/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-zinc-400" />
              <span className="text-zinc-200">Settings</span>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors cursor-pointer text-red-400">
            <div className="flex items-center gap-3">
              <LogOut size={20} />
              <span>Sign Out</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
