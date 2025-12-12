'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Music, Users, Settings, LogOut, ChevronLeft, Menu, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const links = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Ringtones', href: '/admin/ringtones', icon: Music },
        { name: 'Artists', href: '/admin/artists', icon: ImageIcon },
        { name: 'Users', href: '/admin/users', icon: Users },
        // { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <>
            {/* Mobile Trigger */}
            <button
                className="md:hidden fixed top-20 left-4 z-50 p-2 bg-neutral-900 rounded-lg border border-white/10"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                <Menu size={24} className="text-zinc-400" />
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen bg-neutral-950 border-r border-white/5 transition-all duration-300 z-40
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          pt-20 flex flex-col
        `}
            >
                <div className="flex items-center justify-between px-6 mb-8">
                    {!collapsed && <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">TamilRing</h2>}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden md:flex p-1 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        <ChevronLeft size={20} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                                    }
                `}
                                onClick={() => setMobileOpen(false)}
                            >
                                <Icon size={22} className={isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'} />
                                {!collapsed && <span className="font-medium text-sm">{link.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl w-full transition-all duration-200 text-red-500/70 hover:bg-red-500/10 hover:text-red-500
            `}
                    >
                        <LogOut size={22} />
                        {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Overlay for Mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </>
    );
}
