'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import type { OtherWork, OtherWorkImage } from '@/lib/types';

interface OtherWorkFormProps {
    work?: OtherWork;
    onSave: (work: OtherWork) => void;
    onCancel: () => void;
}

interface FormData {
    title_hi: string;
    title_en: string;
    description_hi: string;
    description_en: string;
    category: string;
    location_hi: string;
    location_en: string;
    event_date: string;
    event_year: string;
    status: 'draft' | 'published';
}

const emptyForm: FormData = {
    title_hi: '',
    title_en: '',
    description_hi: '',
    description_en: '',
    category: '',
    location_hi: '',
    location_en: '',
    event_date: '',
    event_year: '',
    status: 'draft',
};

export default function OtherWorkForm({
    work,
    onSave,
    onCancel,
}: OtherWorkFormProps): React.JSX.Element {
    const [form, setForm] = useState<FormData>(
        work
            ? {
                  title_hi: work.title_hi,
                  title_en: work.title_en ?? '',
                  description_hi: work.description_hi ?? '',
                  description_en: work.description_en ?? '',
                  category: work.category ?? '',
                  location_hi: work.location_hi ?? '',
                  location_en: work.location_en ?? '',
                  event_date: work.event_date ?? '',
                  event_year: work.event_year?.toString() ?? '',
                  status: work.status,
              }
            : emptyForm
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([]);
    const [existingImages, setExistingImages] = useState<OtherWorkImage[]>(
        work?.images ?? []
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        onDrop: useCallback((accepted: File[]) => {
            const mapped = accepted.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }));
            setNewImages((prev) => [...prev, ...mapped]);
        }, []),
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
        if (!form.title_hi.trim()) {
            errs.title_hi = 'Hindi title is required';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        if (!validate()) return;

        const now = new Date().toISOString();
        const workId = work?.id ?? `ow-${Date.now()}`;

        const imageRecords: OtherWorkImage[] = [
            ...existingImages,
            ...newImages.map((img, idx) => ({
                id: `owi-new-${Date.now()}-${idx}`,
                other_work_id: workId,
                image_url: img.preview,
                caption: null,
                sort_order: existingImages.length + idx,
                created_at: now,
            })),
        ];

        const saved: OtherWork = {
            id: workId,
            title_hi: form.title_hi.trim(),
            title_en: form.title_en.trim() || null,
            description_hi: form.description_hi.trim() || null,
            description_en: form.description_en.trim() || null,
            category: form.category.trim() || null,
            location_hi: form.location_hi.trim() || null,
            location_en: form.location_en.trim() || null,
            event_date: form.event_date || null,
            event_year: form.event_year ? parseInt(form.event_year, 10) : null,
            status: form.status,
            created_at: work?.created_at ?? now,
            updated_at: now,
            images: imageRecords,
        };

        onSave(saved);
    };

    return (
        <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='bg-white rounded-xl border border-slate-200 p-6'>
                <h3 className='text-lg font-semibold text-slate-900 mb-4'>
                    Work Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                        <label htmlFor='ow-title_hi' className='block text-sm font-medium text-slate-700 mb-1'>
                            Title (Hindi) <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id='ow-title_hi'
                            name='title_hi'
                            value={form.title_hi}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.title_hi ? 'border-red-400' : 'border-slate-300'
                            }`}
                            placeholder='कार्य का नाम'
                        />
                        {errors.title_hi && (
                            <p className='text-red-500 text-xs mt-1'>{errors.title_hi}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor='ow-title_en' className='block text-sm font-medium text-slate-700 mb-1'>
                            Title (English)
                        </label>
                        <input
                            id='ow-title_en'
                            name='title_en'
                            value={form.title_en}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='Work Name'
                        />
                    </div>
                    <div className='md:col-span-2'>
                        <label htmlFor='ow-desc_hi' className='block text-sm font-medium text-slate-700 mb-1'>
                            Description (Hindi)
                        </label>
                        <textarea
                            id='ow-desc_hi'
                            name='description_hi'
                            value={form.description_hi}
                            onChange={handleChange}
                            rows={3}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>
                    <div className='md:col-span-2'>
                        <label htmlFor='ow-desc_en' className='block text-sm font-medium text-slate-700 mb-1'>
                            Description (English)
                        </label>
                        <textarea
                            id='ow-desc_en'
                            name='description_en'
                            value={form.description_en}
                            onChange={handleChange}
                            rows={3}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>
                    <div>
                        <label htmlFor='ow-category' className='block text-sm font-medium text-slate-700 mb-1'>
                            Category
                        </label>
                        <input
                            id='ow-category'
                            name='category'
                            value={form.category}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='e.g. पर्यावरण'
                        />
                    </div>
                    <div>
                        <label htmlFor='ow-location_hi' className='block text-sm font-medium text-slate-700 mb-1'>
                            Location (Hindi)
                        </label>
                        <input
                            id='ow-location_hi'
                            name='location_hi'
                            value={form.location_hi}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>
                    <div>
                        <label htmlFor='ow-location_en' className='block text-sm font-medium text-slate-700 mb-1'>
                            Location (English)
                        </label>
                        <input
                            id='ow-location_en'
                            name='location_en'
                            value={form.location_en}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>
                    <div>
                        <label htmlFor='ow-event_date' className='block text-sm font-medium text-slate-700 mb-1'>
                            Event Date
                        </label>
                        <input
                            id='ow-event_date'
                            name='event_date'
                            type='date'
                            value={form.event_date}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>
                    <div>
                        <label htmlFor='ow-event_year' className='block text-sm font-medium text-slate-700 mb-1'>
                            Event Year
                        </label>
                        <input
                            id='ow-event_year'
                            name='event_year'
                            type='number'
                            value={form.event_year}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='2024'
                        />
                    </div>
                    <div>
                        <label htmlFor='ow-status' className='block text-sm font-medium text-slate-700 mb-1'>
                            Status
                        </label>
                        <select
                            id='ow-status'
                            name='status'
                            value={form.status}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                            <option value='draft'>Draft</option>
                            <option value='published'>Published</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Images */}
            <div className='bg-white rounded-xl border border-slate-200 p-6'>
                <h3 className='text-lg font-semibold text-slate-900 mb-4'>Photos</h3>
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-slate-300 hover:border-slate-400'
                    }`}>
                    <input {...getInputProps()} />
                    <Upload size={24} className='mx-auto mb-2 text-slate-400' />
                    <p className='text-sm text-slate-500'>
                        Drop images here or click to browse
                    </p>
                </div>
                {(existingImages.length > 0 || newImages.length > 0) && (
                    <div className='flex flex-wrap gap-2 mt-4'>
                        {existingImages.map((img) => (
                            <div
                                key={img.id}
                                className='relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200'>
                                <img
                                    src={img.image_url}
                                    alt={img.caption ?? 'Work image'}
                                    className='w-full h-full object-cover'
                                />
                                <button
                                    type='button'
                                    onClick={() =>
                                        setExistingImages((prev) =>
                                            prev.filter((i) => i.id !== img.id)
                                        )
                                    }
                                    className='absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5'
                                    aria-label='Remove image'>
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {newImages.map((img, idx) => (
                            <div
                                key={img.preview}
                                className='relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200'>
                                <img
                                    src={img.preview}
                                    alt='New upload'
                                    className='w-full h-full object-cover'
                                />
                                <button
                                    type='button'
                                    onClick={() => {
                                        URL.revokeObjectURL(img.preview);
                                        setNewImages((prev) =>
                                            prev.filter((_, i) => i !== idx)
                                        );
                                    }}
                                    className='absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5'
                                    aria-label='Remove image'>
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className='flex items-center justify-end gap-3'>
                <button
                    type='button'
                    onClick={onCancel}
                    className='px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium'>
                    Cancel
                </button>
                <button
                    type='submit'
                    className='px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'>
                    {work ? 'Update Work' : 'Create Work'}
                </button>
            </div>
        </form>
    );
}
