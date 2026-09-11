'use client';

import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
    deleteOtherWork as dbDeleteOtherWork,
    isSupabaseConfigured,
} from '@/lib/supabase-data';
import type { OtherWork } from '@/lib/types';

interface OtherWorkListProps {
    onEdit: (work: OtherWork) => void;
}

export default function OtherWorkList({ onEdit }: OtherWorkListProps): React.JSX.Element {
    const { otherWorks, updateOtherWork, deleteOtherWork } = useAppStore();
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        let result = [...otherWorks];
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (w) =>
                    w.title_hi.toLowerCase().includes(q) ||
                    (w.title_en?.toLowerCase().includes(q) ?? false) ||
                    (w.category?.toLowerCase().includes(q) ?? false)
            );
        }
        return result.sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }, [otherWorks, search]);

    const handleToggle = (work: OtherWork): void => {
        updateOtherWork(work.id, {
            status: work.status === 'published' ? 'draft' : 'published',
            updated_at: new Date().toISOString(),
        });
    };

    const handleDelete = (work: OtherWork): void => {
        if (window.confirm(`Delete "${work.title_hi}"? This cannot be undone.`)) {
            deleteOtherWork(work.id);
            if (isSupabaseConfigured()) {
                dbDeleteOtherWork(work.id).catch((err) =>
                    console.error('Failed to delete work from Supabase:', err),
                );
            }
        }
    };

    return (
        <div className='space-y-4'>
            {/* Search */}
            <div className='bg-white rounded-xl border border-slate-200 p-4'>
                <div className='relative'>
                    <Search
                        size={16}
                        className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                    />
                    <input
                        type='text'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder='Search works...'
                        className='w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                </div>
                <p className='text-xs text-slate-500 mt-2'>
                    {filtered.length} of {otherWorks.length} works
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
                        {filtered.map((work) => (
                            <tr key={work.id} className='hover:bg-slate-50 transition-colors'>
                                <td className='px-4 py-3'>
                                    <p className='text-sm font-medium text-slate-900 truncate max-w-xs'>
                                        {work.title_hi}
                                    </p>
                                    {work.title_en && (
                                        <p className='text-xs text-slate-500 truncate max-w-xs'>
                                            {work.title_en}
                                        </p>
                                    )}
                                </td>
                                <td className='px-4 py-3 text-sm text-slate-600'>
                                    {work.category ?? '—'}
                                </td>
                                <td className='px-4 py-3 text-sm text-slate-600'>
                                    {work.event_year ?? '—'}
                                </td>
                                <td className='px-4 py-3'>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            work.status === 'published'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {work.status}
                                    </span>
                                </td>
                                <td className='px-4 py-3'>
                                    <div className='flex items-center justify-end gap-1'>
                                        <button
                                            onClick={() => onEdit(work)}
                                            className='p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                                            aria-label='Edit'
                                            title='Edit'>
                                            <Edit2 size={15} />
                                        </button>
                                        <button
                                            onClick={() => handleToggle(work)}
                                            className='p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors'
                                            aria-label='Toggle publish'
                                            title={
                                                work.status === 'published'
                                                    ? 'Unpublish'
                                                    : 'Publish'
                                            }>
                                            {work.status === 'published' ? (
                                                <EyeOff size={15} />
                                            ) : (
                                                <Eye size={15} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(work)}
                                            className='p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                                            aria-label='Delete'
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
                                    colSpan={5}
                                    className='px-4 py-8 text-center text-sm text-slate-500'>
                                    No works found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className='md:hidden space-y-3'>
                {filtered.map((work) => (
                    <div
                        key={work.id}
                        className='bg-white rounded-xl border border-slate-200 p-4'>
                        <div className='flex items-start justify-between mb-2'>
                            <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium text-slate-900 truncate'>
                                    {work.title_hi}
                                </p>
                                {work.title_en && (
                                    <p className='text-xs text-slate-500 truncate'>
                                        {work.title_en}
                                    </p>
                                )}
                            </div>
                            <span
                                className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    work.status === 'published'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-amber-100 text-amber-700'
                                }`}>
                                {work.status}
                            </span>
                        </div>
                        <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3'>
                            <span>{work.category ?? '—'}</span>
                            <span>{work.event_year ?? '—'}</span>
                        </div>
                        <div className='flex items-center gap-2 border-t border-slate-100 pt-3'>
                            <button
                                onClick={() => onEdit(work)}
                                className='flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors'>
                                <Edit2 size={13} /> Edit
                            </button>
                            <button
                                onClick={() => handleToggle(work)}
                                className='flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors'>
                                {work.status === 'published' ? (
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
                                onClick={() => handleDelete(work)}
                                className='px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors'>
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className='bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500'>
                        No works found.
                    </div>
                )}
            </div>
        </div>
    );
}
