'use client';

import { Bell, Search, ChevronDown, Monitor, Moon, Sun, Radio } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';

interface AdminHeaderProps {
    user: User;
    onMenuClick: () => void;
    collapsed: boolean;
}

export default function AdminHeader({ user, onMenuClick, collapsed }: AdminHeaderProps) {
    return (
        <header className={`fixed top-0 right-0 z-30 transition-all duration-300 border-b border-brand-gray bg-white/80 backdrop-blur-xl
            ${collapsed ? 'left-0 md:left-20' : 'left-0 md:left-64'}
        `}>
            <div className="flex h-16 items-center justify-between px-4 md:px-8">
                {/* Left: Mobile Menu & Title/Breadcrumb */}
                {/* Left: Mobile Menu & Title/Breadcrumb */}
                <div className="flex items-center gap-3 md:gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 rounded-lg text-zinc-500 hover:text-brand-dark hover:bg-brand-wash md:hidden"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Mobile Logo */}
                    <div className="flex items-center gap-2 md:hidden">
                        <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white">
                            <Radio size={18} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-brand-dark">
                            Tamil<span className="text-brand-blue">Ring</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center text-sm font-medium text-zinc-500">
                        <span className="text-zinc-500">Admin</span>
                        <span className="mx-2">/</span>
                        <span className="text-zinc-900">Dashboard</span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Search (Desktop) */}
                    <div className="hidden md:flex items-center relative group">
                        <Search className="absolute left-3 w-4 h-4 text-zinc-400 group-focus-within:text-brand-blue transition-colors" />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            className="bg-brand-wash border border-brand-gray rounded-full pl-9 pr-4 py-1.5 text-sm text-brand-dark focus:outline-none focus:border-brand-blue/30 focus:bg-white transition-all w-64"
                        />
                    </div>

                    <div className="h-6 w-px bg-brand-gray hidden md:block" />

                    <button className="p-2 rounded-full text-zinc-500 hover:text-brand-blue hover:bg-brand-wash relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-accent rounded-full border-2 border-white" />
                    </button>

                    <div className="flex items-center gap-3 pl-2">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-brand-dark">Admin User</p>
                            <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[120px]">{user.email}</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-blue to-cyan-500 p-[1px]">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                <span className="font-bold text-xs text-brand-blue">{user.email?.charAt(0).toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
