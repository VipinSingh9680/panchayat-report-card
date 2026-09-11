'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FolderOpen,
    Briefcase,
    Upload,
    Settings,
    Menu,
    X,
    ChevronLeft,
    HeartHandshake,
} from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Projects', href: '/admin/projects', icon: <FolderOpen size={20} /> },
    { label: 'Welfare Stats', href: '/admin/welfare-stats', icon: <HeartHandshake size={20} /> },
    { label: 'Other Works', href: '/admin/other-works', icon: <Briefcase size={20} /> },
    { label: 'Bulk Upload', href: '/admin/upload', icon: <Upload size={20} /> },
    { label: 'Settings', href: '/admin/settings', icon: <Settings size={20} /> },
];

export default function AdminSidebar(): React.JSX.Element {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string): boolean => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    const sidebarContent = (
        <div className='flex flex-col h-full'>
            <div className='flex items-center justify-between px-5 py-5 border-b border-slate-700'>
                <Link href='/admin' className='flex items-center gap-2'>
                    <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm'>
                        P
                    </div>
                    <span className='text-white font-semibold text-lg'>Admin Panel</span>
                </Link>
                <button
                    className='lg:hidden text-slate-400 hover:text-white'
                    onClick={() => setMobileOpen(false)}
                    aria-label='Close sidebar'>
                    <X size={20} />
                </button>
            </div>

            <nav className='flex-1 px-3 py-4 space-y-1'>
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                active
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}>
                            {item.icon}
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className='px-3 py-4 border-t border-slate-700'>
                <Link
                    href='/'
                    className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors'>
                    <ChevronLeft size={20} />
                    Back to Public Site
                </Link>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                className='lg:hidden fixed top-4 left-4 z-50 bg-slate-900 text-white p-2 rounded-lg shadow-lg'
                onClick={() => setMobileOpen(true)}
                aria-label='Open sidebar'>
                <Menu size={20} />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className='lg:hidden fixed inset-0 bg-black/50 z-40'
                    onClick={() => setMobileOpen(false)}
                    role='presentation'
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-200 ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {sidebarContent}
            </aside>

            {/* Desktop sidebar */}
            <aside className='hidden lg:block w-64 bg-slate-900 min-h-screen flex-shrink-0'>
                {sidebarContent}
            </aside>
        </>
    );
}
