'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { User } from '@supabase/supabase-js';

interface AdminShellProps {
    children: React.ReactNode;
    user: User;
}

export default function AdminShell({ children, user }: AdminShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    // Close sidebar on route change on mobile
    // usage of pathname in sidebar might handle active state, but shell handles visibility

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <AdminSidebar
                mobileOpen={sidebarOpen}
                setMobileOpen={setSidebarOpen}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'md:pl-20' : 'md:pl-64'}`}>

                {/* Header */}
                <AdminHeader
                    user={user}
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    collapsed={collapsed}
                />

                {/* Content */}
                <main className="flex-1 p-4 md:p-8 pt-24 md:pt-24 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
