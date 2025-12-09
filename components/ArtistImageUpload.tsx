'use client';

import { useState, useRef, useEffect } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { revalidateArtistCache } from '@/app/actions';

interface ArtistImageUploadProps {
    artistName: string;
    currentImage?: string;
    onUploadSuccess?: () => void;
}

export default function ArtistImageUpload({ artistName, currentImage, onUploadSuccess }: ArtistImageUploadProps) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [debugMsg, setDebugMsg] = useState('Init...');

    useEffect(() => {
        const checkAdmin = async () => {
            setDebugMsg('Auth...');
            const { data: { user } } = await supabase.auth.getUser();
            console.log('ArtistUpload: Current User', user?.id);

            if (!user) {
                setDebugMsg('No User');
                return;
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            console.log('ArtistUpload: Profile Role', profile?.role, 'Error:', error);

            if (profile?.role === 'admin') {
                setIsAdmin(true);
            } else {
                setDebugMsg(`Role: ${profile?.role || 'None'}`);
            }
        };
        checkAdmin();
    }, [supabase]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Upload to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${artistName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('artist_images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('artist_images')
                .getPublicUrl(filePath);

            // 3. Update Database (Insert or Update)
            const { error: dbError } = await supabase
                .from('artist_images')
                .upsert({
                    artist_name: artistName,
                    image_url: publicUrl,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'artist_name' });

            if (dbError) throw dbError;

            await revalidateArtistCache();

            alert('Image updated successfully!');
            setIsOpen(false);
            router.refresh(); // Refresh server components
            if (onUploadSuccess) onUploadSuccess();

        } catch (error: any) {
            console.error('Upload failed:', error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    // DEBUG: Always show something to help debugging
    if (!isAdmin) {
        return (
            <div className="absolute bottom-0 right-0 z-50 bg-red-600 text-white text-[10px] p-1 rounded font-bold">
                {debugMsg}
            </div>
        );
    }

    /* Original Code when admin... */
    return (
        <>
            <div className="absolute bottom-0 right-0 z-50 bg-green-500 text-black text-[10px] px-1 rounded-t">Admin</div>
            {/* Edit Button (Visible only to admins) */}
            <button
                onClick={() => setIsOpen(true)}
                className="absolute bottom-2 right-2 bg-black/80 p-2 rounded-full text-white hover:bg-emerald-500 hover:text-black transition-colors shadow-lg z-20 backdrop-blur-sm border border-white/10"
                title="Change Artist Image"
            >
                <Camera size={16} />
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-sm relative shadow-2xl">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-lg font-bold text-white mb-4">Update Photo</h3>
                        <p className="text-zinc-400 text-sm mb-6">
                            Upload a new photo for <span className="text-emerald-400 font-bold">{artistName}</span>.
                            This will replace the current image globally.
                        </p>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-neutral-700 bg-neutral-900 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-neutral-800 transition-all group"
                        >
                            {uploading ? (
                                <Loader2 size={32} className="text-emerald-500 animate-spin mb-2" />
                            ) : (
                                <Upload size={32} className="text-zinc-500 group-hover:text-emerald-500 mb-2 transition-colors" />
                            )}
                            <p className="text-zinc-500 text-xs font-medium group-hover:text-zinc-300">
                                {uploading ? 'Uploading...' : 'Click to select image'}
                            </p>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                            disabled={uploading}
                        />

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-zinc-500 hover:text-white px-4 py-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
