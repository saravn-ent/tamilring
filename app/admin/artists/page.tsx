'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Search, Upload, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ArtistImage {
    id: string;
    artist_name: string;
    image_url: string;
    created_at: string;
}

export default function ArtistManagement() {
    const [artists, setArtists] = useState<ArtistImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [newArtistName, setNewArtistName] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetchArtists();
    }, []);

    const fetchArtists = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('artist_images')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setArtists(data as any);
        setLoading(false);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !newArtistName.trim()) return;

        setIsUploading(true);
        try {
            // 1. Upload Image
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('artists')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('artists')
                .getPublicUrl(filePath);

            // 3. Save to DB
            const { data: inserted, error: dbError } = await supabase
                .from('artist_images')
                .insert({
                    artist_name: newArtistName.trim(),
                    image_url: publicUrl
                })
                .select()
                .single();

            if (dbError) throw dbError;

            if (inserted) {
                setArtists(prev => [inserted as any, ...prev]);
                setNewArtistName('');
                setFile(null);
                alert('Artist image added successfully!');
            }

        } catch (error: any) {
            console.error("Upload error:", error);
            alert(`Failed to upload: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete image for ${name}?`)) return;

        const { error } = await supabase.from('artist_images').delete().eq('id', id);
        if (!error) {
            setArtists(prev => prev.filter(a => a.id !== id));
        } else {
            alert("Failed to delete.");
        }
    };

    const filteredArtists = artists.filter(a =>
        a.artist_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Artist Images</h1>
                    <p className="text-zinc-400 text-sm">Upload images for artists missing from TMDB.</p>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-emerald-500" /> Add New Artist Image
                </h3>
                <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:flex-1 space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Artist Name (Exact Match)</label>
                        <input
                            type="text"
                            value={newArtistName}
                            onChange={e => setNewArtistName(e.target.value)}
                            placeholder="e.g. Santhosh Narayanan"
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none"
                            required
                        />
                    </div>
                    <div className="w-full md:w-auto space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Profile Image</label>
                        <label className="flex items-center gap-2 cursor-pointer bg-black/50 border border-white/10 rounded-lg px-4 py-2 hover:bg-white/5 transition-colors">
                            <Upload size={18} className="text-zinc-400" />
                            <span className="text-sm text-zinc-300 truncate max-w-[200px]">{file ? file.name : 'Choose File'}</span>
                            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" required />
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full md:w-auto bg-emerald-500 text-black font-bold px-6 py-2.5 rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                        Upload
                    </button>
                </form>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search artists..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {loading ? (
                        <div className="col-span-full py-12 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>
                    ) : filteredArtists.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-zinc-500">No custom artist images found.</div>
                    ) : (
                        filteredArtists.map(artist => (
                            <div key={artist.id} className="group relative bg-neutral-900 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center hover:border-white/10 transition-all">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 bg-black">
                                    <Image src={artist.image_url} alt={artist.artist_name} fill className="object-cover" />
                                </div>
                                <h4 className="text-sm font-bold text-zinc-200 line-clamp-2">{artist.artist_name}</h4>
                                <p className="text-[10px] text-zinc-500 mt-1">{new Date(artist.created_at).toLocaleDateString()}</p>

                                <button
                                    onClick={() => handleDelete(artist.id, artist.artist_name)}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
