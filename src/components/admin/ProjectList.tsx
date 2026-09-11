'use client';

import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
    deleteProject as dbDeleteProject,
    isSupabaseConfigured,
} from '@/lib/supabase-data';
import type { Project } from '@/lib/types';

interface ProjectListProps {
    onEdit: (project: Project) => void;
}

export default function ProjectList({ onEdit }: ProjectListProps): React.JSX.Element {
    const { projects, categories, updateProject, deleteProject } = useAppStore();
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const filtered = useMemo(() => {
        let result = [...projects];
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.title_hi.toLowerCase().includes(q) ||
                    (p.title_en?.toLowerCase().includes(q) ?? false) ||
                    (p.ward?.toLowerCase().includes(q) ?? false)
            );
        }
        if (filterCategory) {
            result = result.filter((p) => p.category_id === filterCategory);
        }
        if (filterStatus) {
            result = result.filter((p) => p.status === filterStatus);
        }
        return result.sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }, [projects, search, filterCategory, filterStatus]);

    const getCategoryName = (categoryId: string | null): string => {
        if (!categoryId) return '—';
        const cat = categories.find((c) => c.id === categoryId);
        return cat ? cat.name_en : '—';
    };

    const handleTogglePublish = (project: Project): void => {
        updateProject(project.id, {
            status: project.status === 'published' ? 'draft' : 'published',
            updated_at: new Date().toISOString(),
        });
    };

    const handleDelete = (project: Project): void => {
        if (window.confirm(`Delete "${project.title_hi}"? This cannot be undone.`)) {
            deleteProject(project.id);
            if (isSupabaseConfigured()) {
                dbDeleteProject(project.id).catch((err) =>
                    console.error('Failed to delete project from Supabase:', err),
                );
            }
        }
    };

    return (
        <div className='space-y-4'>
            {/* Filters */}
            <div className='bg-white rounded-xl border border-slate-200 p-4'>
                <div className='flex flex-col sm:flex-row gap-3'>
                    <div className='relative flex-1'>
                        <Search
                            size={16}
                            className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                        />
                        <input
                            type='text'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Search projects...'
                            className='w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className='px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                        <option value=''>All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name_en}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className='px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                        <option value=''>All Status</option>
                        <option value='published'>Published</option>
                        <option value='draft'>Draft</option>
                    </select>
                </div>
                <p className='text-xs text-slate-500 mt-2'>
                    {filtered.length} of {projects.length} projects
                </p>
            </div>

            {/* Desktop Table */}
            <div className='hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden'>
                <table className='w-full'>
                    <thead>
                        <tr className='bg-slate-50 border-b border-slate-200'>
                            <th className='text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                                Title
                            </th>
                            <th className='text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                                Category
                            </th>
                            <th className='text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                                Ward
                            </th>
                            <th className='text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                                Year
                            </th>
                            <th className='text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                                Status
                            </th>
                            <th className='text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-100'>
                        {filtered.map((project) => (
                            <tr key={project.id} className='hover:bg-slate-50 transition-colors'>
                                <td className='px-4 py-3'>
                                    <p className='text-sm font-medium text-slate-900 truncate max-w-xs'>
                                        {project.title_hi}
                                    </p>
                                    {project.title_en && (
                                        <p className='text-xs text-slate-500 truncate max-w-xs'>
                                            {project.title_en}
                                        </p>
                                    )}
                                </td>
                                <td className='px-4 py-3 text-sm text-slate-600'>
                                    {getCategoryName(project.category_id)}
                                </td>
                                <td className='px-4 py-3 text-sm text-slate-600'>
                                    {project.ward ?? '—'}
                                </td>
                                <td className='px-4 py-3 text-sm text-slate-600'>
                                    {project.completion_year ?? '—'}
                                </td>
                                <td className='px-4 py-3'>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            project.status === 'published'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {project.status}
                                    </span>
                                </td>
                                <td className='px-4 py-3'>
                                    <div className='flex items-center justify-end gap-1'>
                                        <button
                                            onClick={() => onEdit(project)}
                                            className='p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                                            aria-label='Edit project'
                                            title='Edit'>
                                            <Edit2 size={15} />
                                        </button>
                                        <button
                                            onClick={() => handleTogglePublish(project)}
                                            className='p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors'
                                            aria-label='Toggle publish'
                                            title={
                                                project.status === 'published'
                                                    ? 'Unpublish'
                                                    : 'Publish'
                                            }>
                                            {project.status === 'published' ? (
                                                <EyeOff size={15} />
                                            ) : (
                                                <Eye size={15} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project)}
                                            className='p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                                            aria-label='Delete project'
                                            title='Delete'>
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className='px-4 py-8 text-center text-sm text-slate-500'>
                                    No projects found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className='md:hidden space-y-3'>
                {filtered.map((project) => (
                    <div
                        key={project.id}
                        className='bg-white rounded-xl border border-slate-200 p-4'>
                        <div className='flex items-start justify-between mb-2'>
                            <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium text-slate-900 truncate'>
                                    {project.title_hi}
                                </p>
                                {project.title_en && (
                                    <p className='text-xs text-slate-500 truncate'>
                                        {project.title_en}
                                    </p>
                                )}
                            </div>
                            <span
                                className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    project.status === 'published'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-amber-100 text-amber-700'
                                }`}>
                                {project.status}
                            </span>
                        </div>
                        <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3'>
                            <span>{getCategoryName(project.category_id)}</span>
                            <span>{project.ward ?? '—'}</span>
                            <span>{project.completion_year ?? '—'}</span>
                        </div>
                        <div className='flex items-center gap-2 border-t border-slate-100 pt-3'>
                            <button
                                onClick={() => onEdit(project)}
                                className='flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors'>
                                <Edit2 size={13} /> Edit
                            </button>
                            <button
                                onClick={() => handleTogglePublish(project)}
                                className='flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors'>
                                {project.status === 'published' ? (
                                    <>
                                        <EyeOff size={13} /> Unpublish
                                    </>
                                ) : (
                                    <>
                                        <Eye size={13} /> Publish
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleDelete(project)}
                                className='px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors'>
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className='bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500'>
                        No projects found.
                    </div>
                )}
            </div>
        </div>
    );
}
