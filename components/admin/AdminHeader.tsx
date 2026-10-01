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
        <header className={`fixed top-0 right-0 z-30 transition-all duration-300 border-b border-m3-outline-variant/30 bg-m3-surface/80 backdrop-blur-xl text-m3-on-surface
            ${collapsed ? 'left-0 md:left-20' : 'left-0 md:left-64'}
        `}>
            <div className="flex h-16 items-center justify-between px-4 md:px-8">
                {/* Left: Mobile Menu & Title/Breadcrumb */}
                <div className="flex items-center gap-3 md:gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 rounded-lg text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high md:hidden"
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
                        <span className="font-bold text-lg tracking-tight text-m3-on-surface">
                            Tamil<span className="text-brand-blue">Ring</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center text-sm font-medium text-m3-on-surface-variant">
                        <span className="text-m3-on-surface-variant">Admin</span>
                        <span className="mx-2">/</span>
                        <span className="text-m3-on-surface">Dashboard</span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Search (Desktop) */}
                    <div className="hidden md:flex items-center relative group">
                        <Search className="absolute left-3 w-4 h-4 text-m3-outline group-focus-within:text-brand-blue transition-colors" />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            className="bg-m3-surface-container border border-m3-outline-variant/30 rounded-full pl-9 pr-4 py-1.5 text-sm text-m3-on-surface focus:outline-none focus:border-brand-blue/30 focus:bg-m3-surface-container-high transition-all w-64 placeholder:text-m3-outline"
                        />
                    </div>

                    <div className="h-6 w-px bg-m3-outline-variant/30 hidden md:block" />

                    <button className="p-2 rounded-full text-m3-on-surface-variant hover:text-brand-blue hover:bg-m3-surface-container-high relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-accent rounded-full border-2 border-m3-surface" />
                    </button>

                    <div className="flex items-center gap-3 pl-2">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-m3-on-surface">Admin User</p>
                            <p className="text-[10px] text-m3-on-surface-variant font-mono truncate max-w-[120px]">{user.email}</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-linear-to-tr from-brand-blue to-cyan-500 p-px">
                            <div className="w-full h-full rounded-full bg-m3-surface flex items-center justify-center overflow-hidden">
                                <span className="font-bold text-xs text-brand-blue">{user.email?.charAt(0).toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
