'use client';

import React from 'react';
import Link from 'next/link';
import {
    FolderOpen,
    Upload,
    FileText,
    Eye,
    PenLine,
    Layers,
    ImageIcon,
    Plus,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface StatCard {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
}

export default function AdminDashboard(): React.JSX.Element {
    const { projects, categories, otherWorks } = useAppStore();

    const publishedCount = projects.filter((p) => p.status === 'published').length;
    const draftCount = projects.filter((p) => p.status === 'draft').length;
    const totalPhotos = projects.reduce((sum, p) => sum + (p.images?.length ?? 0), 0);

    const statCards: StatCard[] = [
        {
            label: 'Total Projects',
            value: projects.length,
            icon: <FolderOpen size={24} />,
            color: 'bg-blue-50 text-blue-600 border-blue-200',
        },
        {
            label: 'Published',
            value: publishedCount,
            icon: <Eye size={24} />,
            color: 'bg-green-50 text-green-600 border-green-200',
        },
        {
            label: 'Draft',
            value: draftCount,
            icon: <PenLine size={24} />,
            color: 'bg-amber-50 text-amber-600 border-amber-200',
        },
        {
            label: 'Categories',
            value: categories.length,
            icon: <Layers size={24} />,
            color: 'bg-purple-50 text-purple-600 border-purple-200',
        },
        {
            label: 'Photos',
            value: totalPhotos,
            icon: <ImageIcon size={24} />,
            color: 'bg-rose-50 text-rose-600 border-rose-200',
        },
    ];

    const recentProjects = [...projects]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <h1 className='text-2xl font-bold text-slate-900'>Dashboard</h1>
            </div>

            {/* Stat Cards */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className={`rounded-xl border p-4 ${card.color}`}>
                        <div className='flex items-center justify-between mb-2'>
                            {card.icon}
                        </div>
                        <p className='text-2xl font-bold'>{card.value}</p>
                        <p className='text-sm opacity-80'>{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className='bg-white rounded-xl border border-slate-200 p-5'>
                <h2 className='text-lg font-semibold text-slate-900 mb-4'>Quick Actions</h2>
                <div className='flex flex-wrap gap-3'>
                    <Link
                        href='/admin/projects?action=new'
                        className='inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'>
                        <Plus size={16} />
                        Add New Project
                    </Link>
                    <Link
                        href='/admin/upload'
                        className='inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium'>
                        <Upload size={16} />
                        Bulk Upload
                    </Link>
                    <Link
                        href='/'
                        target='_blank'
                        className='inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium'>
                        <FileText size={16} />
                        View Public Report
                    </Link>
                </div>
            </div>

            {/* Recent Projects */}
            <div className='bg-white rounded-xl border border-slate-200 p-5'>
                <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-lg font-semibold text-slate-900'>Recent Projects</h2>
                    <Link
                        href='/admin/projects'
                        className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
                        View All →
                    </Link>
                </div>
                <div className='divide-y divide-slate-100'>
                    {recentProjects.map((project) => {
                        const category = categories.find((c) => c.id === project.category_id);
                        return (
                            <div
                                key={project.id}
                                className='flex items-center justify-between py-3'>
                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm font-medium text-slate-900 truncate'>
                                        {project.title_hi}
                                    </p>
                                    <p className='text-xs text-slate-500'>
                                        {category?.name_en ?? 'Uncategorized'} •{' '}
                                        {project.ward ?? '—'} •{' '}
                                        {project.completion_year ?? '—'}
                                    </p>
                                </div>
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                        project.status === 'published'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {project.status}
                                </span>
                            </div>
                        );
                    })}
                    {recentProjects.length === 0 && (
                        <p className='text-sm text-slate-500 py-4 text-center'>
                            No projects yet.
                        </p>
                    )}
                </div>
            </div>

            {/* Other Works summary */}
            <div className='bg-white rounded-xl border border-slate-200 p-5'>
                <div className='flex items-center justify-between mb-2'>
                    <h2 className='text-lg font-semibold text-slate-900'>Other Works</h2>
                    <Link
                        href='/admin/other-works'
                        className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
                        View All →
                    </Link>
                </div>
                <p className='text-sm text-slate-500'>
                    {otherWorks.length} total works •{' '}
                    {otherWorks.filter((w) => w.status === 'published').length} published
                </p>
            </div>
        </div>
    );
}
