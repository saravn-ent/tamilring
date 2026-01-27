'use client';

import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, Search, Upload, Trash2, Plus } from 'lucide-react';
import Image from 'next/image';
import { DEITY_CATEGORIES } from '@/lib/constants';

interface DeityImage {
    id: string;
    deity_name: string;
    image_url: string;
    created_at: string;
}

export default function DeityManagement() {
    const [deities, setDeities] = useState<DeityImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [newDeityName, setNewDeityName] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const supabase = useMemo(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), []);

    const [potentialDeities, setPotentialDeities] = useState<string[]>([]);

    useEffect(() => {
        fetchDeities();

        // Flatten and sort the hardcoded categories
        const allDeities = Object.values(DEITY_CATEGORIES).flat().sort() as string[];
        setPotentialDeities(allDeities);
    }, [supabase]);

    const fetchDeities = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('deity_images')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setDeities(data as DeityImage[]);
        setLoading(false);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !newDeityName.trim()) return;

        setIsUploading(true);
        try {
            // 1. Upload Image
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Check if 'deities' bucket exists, if not it might fail.
            const { error: uploadError } = await supabase.storage
                .from('deities')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('deities')
                .getPublicUrl(filePath);

            // 3. Save to DB
            const { data: inserted, error: dbError } = await supabase
                .from('deity_images')
                .insert({
                    deity_name: newDeityName.trim(),
                    image_url: publicUrl
                })
                .select()
                .single();

            if (dbError) throw dbError;

            if (inserted) {
                setDeities(prev => [inserted as DeityImage, ...prev]);
                setNewDeityName('');
                setFile(null);
                alert('Deity image added successfully!');
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

        const { error } = await supabase.from('deity_images').delete().eq('id', id);
        if (!error) {
            setDeities(prev => prev.filter(a => a.id !== id));
        } else {
            alert("Failed to delete.");
        }
    };

    const filteredDeities = deities.filter(a =>
        a.deity_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Deity Images</h1>
                    <p className="text-zinc-400 text-sm">Upload images for Deities/Gods.</p>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-indigo-600" /> Add New Deity Image
                </h3>
                <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:flex-1 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Deity Name (Select or Type)</label>
                        <input
                            type="text"
                            list="deity-names"
                            value={newDeityName}
                            onChange={e => setNewDeityName(e.target.value)}
                            placeholder="e.g. Lord Murugan"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500/50 outline-none"
                            required
                        />
                        <datalist id="deity-names">
                            {potentialDeities.map(name => (
                                <option key={name} value={name} />
                            ))}
                        </datalist>

                        {/* Quick Pick List */}
                        {potentialDeities.length > 0 && (
                            <div className="mt-2">
                                <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Quick Select (Deities needing images):</p>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                    {potentialDeities.map(name => {
                                        // Check if this deity already has an image uploaded
                                        const hasImage = deities.some(d => d.deity_name.toLowerCase() === name.toLowerCase());
                                        if (hasImage) return null; // Skip if already uploaded

                                        return (
                                            <button
                                                key={name}
                                                type="button"
                                                onClick={() => setNewDeityName(name)}
                                                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs rounded-md transition-colors border border-indigo-100"
                                            >
                                                {name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="w-full md:w-auto space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Image</label>
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-100 transition-colors">
                            <Upload size={18} className="text-slate-400" />
                            <span className="text-sm text-slate-600 truncate max-w-[200px]">{file ? file.name : 'Choose File'}</span>
                            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" required />
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full md:w-auto bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                        Upload
                    </button>
                </form>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search deities..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500/50 shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {loading ? (
                        <div className="col-span-full py-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
                    ) : filteredDeities.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-500">No custom deity images found.</div>
                    ) : (
                        filteredDeities.map(deity => (
                            <div key={deity.id} className="group relative bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center text-center hover:border-indigo-200 hover:shadow-md transition-all">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 bg-slate-100 border border-slate-100">
                                    <Image src={deity.image_url} alt={deity.deity_name} fill className="object-cover" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{deity.deity_name}</h4>
                                <p className="text-[10px] text-slate-500 mt-1">{new Date(deity.created_at).toLocaleDateString()}</p>

                                <button
                                    onClick={() => handleDelete(deity.id, deity.deity_name)}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
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
