'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, ArrowUpDown } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
    saveWelfareStat as dbSaveWelfareStat,
    deleteWelfareStat as dbDeleteWelfareStat,
    isSupabaseConfigured,
} from '@/lib/supabase-data';
import type { WelfareStat } from '@/lib/types';

interface FormData {
    label_hi: string;
    label_en: string;
    icon: string;
    count: string;
    unit_hi: string;
    unit_en: string;
}

const emptyForm: FormData = {
    label_hi: '',
    label_en: '',
    icon: '📊',
    count: '',
    unit_hi: '',
    unit_en: '',
};

const ICON_OPTIONS = ['🏠', '🚽', '👴', '🛣️', '💧', '🪪', '⚡', '🏫', '🌾', '💡', '🏥', '🧹', '📊', '🎯'];

export default function WelfareStatsPage(): React.JSX.Element {
    const { welfareStats, addWelfareStat, updateWelfareStat, deleteWelfareStat } = useAppStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormData>(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const sorted = [...welfareStats].sort((a, b) => a.sort_order - b.sort_order);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ): void => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!form.label_hi.trim()) errs.label_hi = 'Hindi label is required';
        if (!form.count.trim() || isNaN(Number(form.count))) errs.count = 'Valid number required';
        if (!form.unit_hi.trim()) errs.unit_hi = 'Hindi unit is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const resetForm = (): void => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
        setErrors({});
    };

    const handleEdit = (stat: WelfareStat): void => {
        setForm({
            label_hi: stat.label_hi,
            label_en: stat.label_en,
            icon: stat.icon,
            count: stat.count.toString(),
            unit_hi: stat.unit_hi,
            unit_en: stat.unit_en,
        });
        setEditingId(stat.id);
        setShowForm(true);
        setErrors({});
    };

    const handleSave = (): void => {
        if (!validate()) return;

        const count = parseInt(form.count, 10);

        if (editingId) {
            const updates = {
                label_hi: form.label_hi.trim(),
                label_en: form.label_en.trim(),
                icon: form.icon,
                count,
                unit_hi: form.unit_hi.trim(),
                unit_en: form.unit_en.trim(),
            };
            updateWelfareStat(editingId, updates);
            if (isSupabaseConfigured()) {
                const existing = welfareStats.find((ws) => ws.id === editingId);
                if (existing) {
                    dbSaveWelfareStat({ ...existing, ...updates }).catch((err) =>
                        console.error('Failed to update welfare stat:', err),
                    );
                }
            }
        } else {
            const maxOrder = welfareStats.reduce((max, ws) => Math.max(max, ws.sort_order), 0);
            const newStat: WelfareStat = {
                id: `ws-${Date.now()}`,
                label_hi: form.label_hi.trim(),
                label_en: form.label_en.trim(),
                icon: form.icon,
                count,
                unit_hi: form.unit_hi.trim(),
                unit_en: form.unit_en.trim(),
                sort_order: maxOrder + 1,
            };
            addWelfareStat(newStat);
            if (isSupabaseConfigured()) {
                dbSaveWelfareStat(newStat).catch((err) =>
                    console.error('Failed to save welfare stat:', err),
                );
            }
        }
        resetForm();
    };

    const handleDelete = (stat: WelfareStat): void => {
        if (window.confirm(`Delete "${stat.label_hi}"? This cannot be undone.`)) {
            deleteWelfareStat(stat.id);
            if (isSupabaseConfigured()) {
                dbDeleteWelfareStat(stat.id).catch((err) =>
                    console.error('Failed to delete welfare stat:', err),
                );
            }
        }
    };

    const handleMoveUp = (stat: WelfareStat): void => {
        const idx = sorted.findIndex((s) => s.id === stat.id);
        if (idx <= 0) return;
        const prev = sorted[idx - 1];
        updateWelfareStat(stat.id, { sort_order: prev.sort_order });
        updateWelfareStat(prev.id, { sort_order: stat.sort_order });
    };

    const handleMoveDown = (stat: WelfareStat): void => {
        const idx = sorted.findIndex((s) => s.id === stat.id);
        if (idx >= sorted.length - 1) return;
        const next = sorted[idx + 1];
        updateWelfareStat(stat.id, { sort_order: next.sort_order });
        updateWelfareStat(next.id, { sort_order: stat.sort_order });
    };

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-bold text-slate-900'>
                        Welfare Stats / योजनाओं का वितरण
                    </h1>
                    <p className='text-sm text-slate-500 mt-1'>
                        Manage the scheme distribution & benefit counters shown on the public page.
                    </p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
                        className='inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'>
                        <Plus size={16} />
                        Add New
                    </button>
                )}
            </div>

            {/* Add / Edit Form */}
            {showForm && (
                <div className='bg-white rounded-xl border border-slate-200 p-6'>
                    <h3 className='text-lg font-semibold text-slate-900 mb-4'>
                        {editingId ? 'Edit Welfare Stat' : 'Add New Welfare Stat'}
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {/* Icon picker */}
                        <div>
                            <label className='block text-sm font-medium text-slate-700 mb-1'>
                                Icon
                            </label>
                            <div className='flex flex-wrap gap-1.5'>
                                {ICON_OPTIONS.map((ic) => (
                                    <button
                                        key={ic}
                                        type='button'
                                        onClick={() => setForm((prev) => ({ ...prev, icon: ic }))}
                                        className={`w-9 h-9 text-xl flex items-center justify-center rounded-lg border-2 transition-colors ${
                                            form.icon === ic
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}>
                                        {ic}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Label Hindi */}
                        <div>
                            <label htmlFor='ws-label_hi' className='block text-sm font-medium text-slate-700 mb-1'>
                                Label (Hindi) <span className='text-red-500'>*</span>
                            </label>
                            <input
                                id='ws-label_hi'
                                name='label_hi'
                                value={form.label_hi}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.label_hi ? 'border-red-400' : 'border-slate-300'
                                }`}
                                placeholder='e.g. आवास वितरण'
                            />
                            {errors.label_hi && <p className='text-red-500 text-xs mt-1'>{errors.label_hi}</p>}
                        </div>

                        {/* Label English */}
                        <div>
                            <label htmlFor='ws-label_en' className='block text-sm font-medium text-slate-700 mb-1'>
                                Label (English)
                            </label>
                            <input
                                id='ws-label_en'
                                name='label_en'
                                value={form.label_en}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                placeholder='e.g. Housing Distributed'
                            />
                        </div>

                        {/* Count */}
                        <div>
                            <label htmlFor='ws-count' className='block text-sm font-medium text-slate-700 mb-1'>
                                Count / Number <span className='text-red-500'>*</span>
                            </label>
                            <input
                                id='ws-count'
                                name='count'
                                type='number'
                                value={form.count}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.count ? 'border-red-400' : 'border-slate-300'
                                }`}
                                placeholder='e.g. 85'
                            />
                            {errors.count && <p className='text-red-500 text-xs mt-1'>{errors.count}</p>}
                        </div>

                        {/* Unit Hindi */}
                        <div>
                            <label htmlFor='ws-unit_hi' className='block text-sm font-medium text-slate-700 mb-1'>
                                Unit (Hindi) <span className='text-red-500'>*</span>
                            </label>
                            <input
                                id='ws-unit_hi'
                                name='unit_hi'
                                value={form.unit_hi}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.unit_hi ? 'border-red-400' : 'border-slate-300'
                                }`}
                                placeholder='e.g. आवास'
                            />
                            {errors.unit_hi && <p className='text-red-500 text-xs mt-1'>{errors.unit_hi}</p>}
                        </div>

                        {/* Unit English */}
                        <div>
                            <label htmlFor='ws-unit_en' className='block text-sm font-medium text-slate-700 mb-1'>
                                Unit (English)
                            </label>
                            <input
                                id='ws-unit_en'
                                name='unit_en'
                                value={form.unit_en}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                placeholder='e.g. Houses'
                            />
                        </div>
                    </div>

                    {/* Form actions */}
                    <div className='flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100'>
                        <button
                            type='button'
                            onClick={resetForm}
                            className='inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium'>
                            <X size={15} />
                            Cancel
                        </button>
                        <button
                            type='button'
                            onClick={handleSave}
                            className='inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'>
                            <Save size={15} />
                            {editingId ? 'Update' : 'Add'}
                        </button>
                    </div>
                </div>
            )}

            {/* Stats List */}
            <div className='bg-white rounded-xl border border-slate-200 overflow-hidden'>
                <div className='px-4 py-3 bg-slate-50 border-b border-slate-200'>
                    <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                        {sorted.length} stat{sorted.length !== 1 ? 's' : ''} configured
                    </p>
                </div>

                {sorted.length === 0 ? (
                    <div className='p-8 text-center text-sm text-slate-500'>
                        No welfare stats yet. Click &ldquo;Add New&rdquo; to create one.
                    </div>
                ) : (
                    <div className='divide-y divide-slate-100'>
                        {sorted.map((stat, idx) => (
                            <div
                                key={stat.id}
                                className='flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors'>
                                {/* Icon + Info */}
                                <span className='text-3xl w-10 text-center flex-shrink-0'>{stat.icon}</span>
                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm font-semibold text-slate-900'>
                                        {stat.label_hi}
                                        {stat.label_en && (
                                            <span className='text-slate-400 font-normal ml-2'>
                                                ({stat.label_en})
                                            </span>
                                        )}
                                    </p>
                                    <p className='text-xs text-slate-500'>
                                        {stat.count} {stat.unit_hi}
                                        {stat.unit_en && ` / ${stat.unit_en}`}
                                    </p>
                                </div>

                                {/* Count badge */}
                                <span className='text-xl font-black text-emerald-600 tabular-nums flex-shrink-0'>
                                    {stat.count}
                                </span>

                                {/* Actions */}
                                <div className='flex items-center gap-0.5 flex-shrink-0'>
                                    <button
                                        onClick={() => handleMoveUp(stat)}
                                        disabled={idx === 0}
                                        className='p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
                                        title='Move up'
                                        aria-label='Move up'>
                                        <ArrowUpDown size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(stat)}
                                        className='p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                                        title='Edit'
                                        aria-label='Edit'>
                                        <Edit2 size={15} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(stat)}
                                        className='p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                                        title='Delete'
                                        aria-label='Delete'>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
