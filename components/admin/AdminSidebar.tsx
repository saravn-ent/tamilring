'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Music, Users, Settings, LogOut, ChevronLeft, Menu, Image as ImageIcon, TrendingUp, Radio, Star, Brain } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface AdminSidebarProps {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export default function AdminSidebar({ mobileOpen, setMobileOpen, collapsed, setCollapsed }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const links = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'AI Operations', href: '/admin/ai-agent', icon: Brain },
        { name: 'Deities', href: '/admin/deities', icon: Star },
        { name: 'Ringtones', href: '/admin/ringtones', icon: Music },
        { name: 'Artists', href: '/admin/artists', icon: ImageIcon },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Payments', href: '/admin/withdrawals', icon: TrendingUp },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <aside
            className={`fixed top-0 left-0 h-screen bg-m3-surface-container-low border-r border-m3-outline-variant/30 text-m3-on-surface transition-all duration-300 z-50
                ${collapsed ? 'w-20' : 'w-64'}
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                flex flex-col shadow-xl
            `}
        >
            {/* Logo Area */}
            <div className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-6'} border-b border-m3-outline-variant/20`}>
                {!collapsed ? (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                            <Radio size={18} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-m3-on-surface">
                            Tamil<span className="text-indigo-600">Ring</span>
                        </span>
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                        <Radio size={22} strokeWidth={2.5} />
                    </div>
                )}

                {!collapsed && (
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden md:flex p-1.5 hover:bg-m3-surface-container-high rounded-lg text-m3-on-surface-variant hover:text-m3-on-surface transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}
            </div>

            {collapsed && (
                <div className="hidden md:flex justify-center py-4 border-b border-m3-outline-variant/20">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 hover:bg-m3-surface-container-high rounded-lg text-m3-on-surface-variant hover:text-m3-on-surface transition-colors"
                    >
                        <ChevronLeft size={16} className="rotate-180" />
                    </button>
                </div>
            )}


            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-hide">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group
                                ${isActive
                                    ? 'bg-indigo-500/10 text-indigo-500 font-bold'
                                    : 'text-m3-on-surface-variant hover:bg-m3-surface-container-high hover:text-m3-on-surface hover:pl-4'
                                }
                                ${collapsed ? 'justify-center px-0' : ''}
                            `}
                            title={collapsed ? link.name : undefined}
                        >
                            <Icon size={22} className={`shrink-0 transition-colors ${isActive ? 'text-indigo-500' : 'text-m3-outline group-hover:text-m3-on-surface'}`} />
                            {!collapsed && (
                                <span className="font-medium text-sm truncate">{link.name}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-3 border-t border-m3-outline-variant/20 bg-m3-surface-container/50">
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl w-full transition-all duration-200 text-red-500/80 hover:bg-red-500/10 hover:text-red-500
                        ${collapsed ? 'justify-center' : ''}
                    `}
                    title="Sign Out"
                >
                    <LogOut size={22} className="shrink-0" />
                    {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
