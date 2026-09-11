'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { generateSlug } from '@/lib/utils';
import type { Project, ProjectImage } from '@/lib/types';

interface ProjectFormProps {
    project?: Project;
    onSave: (project: Project) => void;
    onCancel: () => void;
}

interface ImageFile {
    file: File;
    preview: string;
    type: 'before' | 'after' | 'additional';
}

interface FormData {
    title_hi: string;
    title_en: string;
    description_hi: string;
    description_en: string;
    category_id: string;
    ward: string;
    location_hi: string;
    location_en: string;
    completion_year: string;
    completion_date: string;
    cost_lakhs: string;
    scheme: string;
    department: string;
    is_featured: boolean;
    status: 'draft' | 'published';
    slug: string;
}

const emptyForm: FormData = {
    title_hi: '',
    title_en: '',
    description_hi: '',
    description_en: '',
    category_id: '',
    ward: '',
    location_hi: '',
    location_en: '',
    completion_year: '',
    completion_date: '',
    cost_lakhs: '',
    scheme: '',
    department: '',
    is_featured: false,
    status: 'draft',
    slug: '',
};

function buildFormFromProject(project: Project): FormData {
    return {
        title_hi: project.title_hi,
        title_en: project.title_en ?? '',
        description_hi: project.description_hi ?? '',
        description_en: project.description_en ?? '',
        category_id: project.category_id ?? '',
        ward: project.ward ?? '',
        location_hi: project.location_hi ?? '',
        location_en: project.location_en ?? '',
        completion_year: project.completion_year?.toString() ?? '',
        completion_date: project.completion_date ?? '',
        cost_lakhs: project.cost_lakhs?.toString() ?? '',
        scheme: project.scheme ?? '',
        department: project.department ?? '',
        is_featured: project.is_featured,
        status: project.status,
        slug: project.slug,
    };
}

function ImageDropzone({
    label,
    imageType,
    files,
    existingImages,
    onDrop,
    onRemoveFile,
    onRemoveExisting,
}: {
    label: string;
    imageType: 'before' | 'after' | 'additional';
    files: ImageFile[];
    existingImages: ProjectImage[];
    onDrop: (accepted: File[], type: 'before' | 'after' | 'additional') => void;
    onRemoveFile: (index: number) => void;
    onRemoveExisting: (id: string) => void;
}): React.JSX.Element {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        onDrop: (accepted) => onDrop(accepted, imageType),
    });

    const filtered = files.filter((f) => f.type === imageType);

    return (
        <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>{label}</label>
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    isDragActive
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-300 hover:border-slate-400'
                }`}>
                <input {...getInputProps()} />
                <Upload size={20} className='mx-auto mb-1 text-slate-400' />
                <p className='text-sm text-slate-500'>
                    Drop images here or click to browse
                </p>
            </div>
            {(existingImages.length > 0 || filtered.length > 0) && (
                <div className='flex flex-wrap gap-2 mt-3'>
                    {existingImages.map((img) => (
                        <div key={img.id} className='relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200'>
                            <img
                                src={img.image_url}
                                alt={img.caption ?? label}
                                className='w-full h-full object-cover'
                            />
                            <button
                                type='button'
                                onClick={() => onRemoveExisting(img.id)}
                                className='absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5'
                                aria-label='Remove image'>
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    {filtered.map((f, idx) => (
                        <div key={f.preview} className='relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200'>
                            <img
                                src={f.preview}
                                alt={`New ${label}`}
                                className='w-full h-full object-cover'
                            />
                            <button
                                type='button'
                                onClick={() => onRemoveFile(idx)}
                                className='absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5'
                                aria-label='Remove image'>
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ProjectForm({
    project,
    onSave,
    onCancel,
}: ProjectFormProps): React.JSX.Element {
    const { categories } = useAppStore();
    const [form, setForm] = useState<FormData>(
        project ? buildFormFromProject(project) : emptyForm
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [newImages, setNewImages] = useState<ImageFile[]>([]);
    const [existingImages, setExistingImages] = useState<ProjectImage[]>(
        project?.images ?? []
    );

    useEffect(() => {
        if (!project && form.title_en.trim()) {
            setForm((prev) => ({ ...prev, slug: generateSlug(prev.title_en) }));
        }
    }, [form.title_en, project]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ): void => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleImageDrop = useCallback(
        (accepted: File[], type: 'before' | 'after' | 'additional') => {
            const mapped: ImageFile[] = accepted.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
                type,
            }));
            setNewImages((prev) => [...prev, ...mapped]);
        },
        []
    );

    const removeNewImage = useCallback((index: number) => {
        setNewImages((prev) => {
            const removed = prev[index];
            if (removed) {
                URL.revokeObjectURL(removed.preview);
            }
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    const removeExistingImage = useCallback((id: string) => {
        setExistingImages((prev) => prev.filter((img) => img.id !== id));
    }, []);

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
        const imageRecords: ProjectImage[] = [
            ...existingImages,
            ...newImages.map((img, idx) => ({
                id: `img-new-${Date.now()}-${idx}`,
                project_id: project?.id ?? `p-${Date.now()}`,
                image_url: img.preview,
                image_type: img.type,
                caption: null,
                sort_order: existingImages.length + idx,
                is_primary: idx === 0 && existingImages.length === 0,
                ai_suggested_type: null,
                created_at: now,
            })),
        ];

        const savedProject: Project = {
            id: project?.id ?? `p-${Date.now()}`,
            title_hi: form.title_hi.trim(),
            title_en: form.title_en.trim() || null,
            description_hi: form.description_hi.trim() || null,
            description_en: form.description_en.trim() || null,
            category_id: form.category_id || null,
            ward: form.ward.trim() || null,
            location_hi: form.location_hi.trim() || null,
            location_en: form.location_en.trim() || null,
            completion_year: form.completion_year ? parseInt(form.completion_year, 10) : null,
            completion_date: form.completion_date || null,
            cost_lakhs: form.cost_lakhs ? parseFloat(form.cost_lakhs) : null,
            scheme: form.scheme.trim() || null,
            department: form.department.trim() || null,
            is_featured: form.is_featured,
            status: form.status,
            slug: form.slug || generateSlug(form.title_hi),
            created_at: project?.created_at ?? now,
            updated_at: now,
            images: imageRecords,
        };

        onSave(savedProject);
    };

    return (
        <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='bg-white rounded-xl border border-slate-200 p-6'>
                <h3 className='text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2'>
                    <ImageIcon size={20} />
                    Basic Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* title_hi */}
                    <div>
                        <label htmlFor='title_hi' className='block text-sm font-medium text-slate-700 mb-1'>
                            Title (Hindi) <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id='title_hi'
                            name='title_hi'
                            value={form.title_hi}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.title_hi ? 'border-red-400' : 'border-slate-300'
                            }`}
                            placeholder='परियोजना का नाम'
                        />
                        {errors.title_hi && (
                            <p className='text-red-500 text-xs mt-1'>{errors.title_hi}</p>
                        )}
                    </div>

                    {/* title_en */}
                    <div>
                        <label htmlFor='title_en' className='block text-sm font-medium text-slate-700 mb-1'>
                            Title (English)
                        </label>
                        <input
                            id='title_en'
                            name='title_en'
                            value={form.title_en}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='Project Name'
                        />
                    </div>

                    {/* description_hi */}
                    <div className='md:col-span-2'>
                        <label htmlFor='description_hi' className='block text-sm font-medium text-slate-700 mb-1'>
                            Description (Hindi)
                        </label>
                        <textarea
                            id='description_hi'
                            name='description_hi'
                            value={form.description_hi}
                            onChange={handleChange}
                            rows={3}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='विवरण हिंदी में'
                        />
                    </div>

                    {/* description_en */}
                    <div className='md:col-span-2'>
                        <label htmlFor='description_en' className='block text-sm font-medium text-slate-700 mb-1'>
                            Description (English)
                        </label>
                        <textarea
                            id='description_en'
                            name='description_en'
                            value={form.description_en}
                            onChange={handleChange}
                            rows={3}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='Description in English'
                        />
                    </div>

                    {/* category_id */}
                    <div>
                        <label htmlFor='category_id' className='block text-sm font-medium text-slate-700 mb-1'>
                            Category
                        </label>
                        <select
                            id='category_id'
                            name='category_id'
                            value={form.category_id}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                            <option value=''>— Select Category —</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name_hi} ({cat.name_en})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ward */}
                    <div>
                        <label htmlFor='ward' className='block text-sm font-medium text-slate-700 mb-1'>
                            Ward
                        </label>
                        <input
                            id='ward'
                            name='ward'
                            value={form.ward}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='वार्ड 1'
                        />
                    </div>

                    {/* location_hi */}
                    <div>
                        <label htmlFor='location_hi' className='block text-sm font-medium text-slate-700 mb-1'>
                            Location (Hindi)
                        </label>
                        <input
                            id='location_hi'
                            name='location_hi'
                            value={form.location_hi}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='स्थान'
                        />
                    </div>

                    {/* location_en */}
                    <div>
                        <label htmlFor='location_en' className='block text-sm font-medium text-slate-700 mb-1'>
                            Location (English)
                        </label>
                        <input
                            id='location_en'
                            name='location_en'
                            value={form.location_en}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='Location'
                        />
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className='bg-white rounded-xl border border-slate-200 p-6'>
                <h3 className='text-lg font-semibold text-slate-900 mb-4'>Project Details</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <div>
                        <label htmlFor='completion_year' className='block text-sm font-medium text-slate-700 mb-1'>
                            Completion Year
                        </label>
                        <input
                            id='completion_year'
                            name='completion_year'
                            type='number'
                            value={form.completion_year}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='2024'
                        />
                    </div>

                    <div>
                        <label htmlFor='completion_date' className='block text-sm font-medium text-slate-700 mb-1'>
                            Completion Date
                        </label>
                        <input
                            id='completion_date'
                            name='completion_date'
                            type='date'
                            value={form.completion_date}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>

                    <div>
                        <label htmlFor='cost_lakhs' className='block text-sm font-medium text-slate-700 mb-1'>
                            Cost (₹ Lakhs)
                        </label>
                        <input
                            id='cost_lakhs'
                            name='cost_lakhs'
                            type='number'
                            step='0.01'
                            value={form.cost_lakhs}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='12.5'
                        />
                    </div>

                    <div>
                        <label htmlFor='scheme' className='block text-sm font-medium text-slate-700 mb-1'>
                            Scheme
                        </label>
                        <input
                            id='scheme'
                            name='scheme'
                            value={form.scheme}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='MGNREGA'
                        />
                    </div>

                    <div>
                        <label htmlFor='department' className='block text-sm font-medium text-slate-700 mb-1'>
                            Department
                        </label>
                        <input
                            id='department'
                            name='department'
                            value={form.department}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='विभाग'
                        />
                    </div>

                    <div>
                        <label htmlFor='slug' className='block text-sm font-medium text-slate-700 mb-1'>
                            Slug
                        </label>
                        <input
                            id='slug'
                            name='slug'
                            value={form.slug}
                            onChange={handleChange}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono'
                            placeholder='auto-generated-slug'
                        />
                    </div>
                </div>
            </div>

            {/* Toggles */}
            <div className='bg-white rounded-xl border border-slate-200 p-6'>
                <h3 className='text-lg font-semibold text-slate-900 mb-4'>Publishing</h3>
                <div className='flex flex-wrap gap-6'>
                    <label className='flex items-center gap-3 cursor-pointer'>
                        <div className='relative'>
                            <input
                                type='checkbox'
                                name='is_featured'
                                checked={form.is_featured}
                                onChange={handleChange}
                                className='sr-only peer'
                            />
                            <div className='w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-blue-600 transition-colors' />
                            <div className='absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-4 transition-transform' />
                        </div>
                        <span className='text-sm font-medium text-slate-700'>Featured</span>
                    </label>

                    <label className='flex items-center gap-3 cursor-pointer'>
                        <div className='relative'>
                            <input
                                type='checkbox'
                                checked={form.status === 'published'}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        status: e.target.checked ? 'published' : 'draft',
                                    }))
                                }
                                className='sr-only peer'
                            />
                            <div className='w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-green-600 transition-colors' />
                            <div className='absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-4 transition-transform' />
                        </div>
                        <span className='text-sm font-medium text-slate-700'>Published</span>
                    </label>
                </div>
            </div>

            {/* Images */}
            <div className='bg-white rounded-xl border border-slate-200 p-6'>
                <h3 className='text-lg font-semibold text-slate-900 mb-4'>Photos</h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <ImageDropzone
                        label='Before Photos'
                        imageType='before'
                        files={newImages}
                        existingImages={existingImages.filter((i) => i.image_type === 'before')}
                        onDrop={handleImageDrop}
                        onRemoveFile={removeNewImage}
                        onRemoveExisting={removeExistingImage}
                    />
                    <ImageDropzone
                        label='After Photos'
                        imageType='after'
                        files={newImages}
                        existingImages={existingImages.filter((i) => i.image_type === 'after')}
                        onDrop={handleImageDrop}
                        onRemoveFile={removeNewImage}
                        onRemoveExisting={removeExistingImage}
                    />
                    <ImageDropzone
                        label='Additional Photos'
                        imageType='additional'
                        files={newImages}
                        existingImages={existingImages.filter(
                            (i) => i.image_type === 'additional'
                        )}
                        onDrop={handleImageDrop}
                        onRemoveFile={removeNewImage}
                        onRemoveExisting={removeExistingImage}
                    />
                </div>
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
                    {project ? 'Update Project' : 'Create Project'}
                </button>
            </div>
        </form>
    );
}
