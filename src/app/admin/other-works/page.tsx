'use client';

import React, { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
    saveOtherWork as dbSaveOtherWork,
    uploadImage,
    isSupabaseConfigured,
    fetchOtherWorks,
} from '@/lib/supabase-data';
import OtherWorkList from '@/components/admin/OtherWorkList';
import OtherWorkForm from '@/components/admin/OtherWorkForm';
import type { OtherWork } from '@/lib/types';

type ViewMode = 'list' | 'create' | 'edit';

export default function OtherWorksPage(): React.JSX.Element {
    const { addOtherWork, updateOtherWork, setOtherWorks } = useAppStore();
    const [view, setView] = useState<ViewMode>('list');
    const [editingWork, setEditingWork] = useState<OtherWork | undefined>(undefined);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEdit = (work: OtherWork): void => {
        setEditingWork(work);
        setView('edit');
    };

    const handleSave = async (work: OtherWork): Promise<void> => {
        if (view === 'edit' && editingWork) {
            updateOtherWork(editingWork.id, work);
        } else {
            addOtherWork(work);
        }

        if (isSupabaseConfigured()) {
            setSaving(true);
            setError(null);
            try {
                const uploadedImages: typeof work.images = [];
                for (const img of work.images ?? []) {
                    try {
                        if (img.image_url.startsWith('blob:')) {
                            const resp = await fetch(img.image_url);
                            const blob = await resp.blob();
                            const file = new File(
                                [blob],
                                `work-${Date.now()}.jpg`,
                                { type: blob.type },
                            );
                            const url = await uploadImage(file, 'other-works');
                            uploadedImages.push({ ...img, image_url: url });
                        } else {
                            uploadedImages.push(img);
                        }
                    } catch (uploadErr) {
                        console.error('Image upload failed, skipping:', uploadErr);
                    }
                }

                const { images: _, ...workData } = work;
                await dbSaveOtherWork(workData, uploadedImages);

                const freshWorks = await fetchOtherWorks();
                setOtherWorks(freshWorks);
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Unknown error';
                console.error('Failed to save other work to Supabase:', msg);
                setError(`Save failed: ${msg}`);
            } finally {
                setSaving(false);
            }
        }

        setView('list');
        setEditingWork(undefined);
    };

    const handleCancel = (): void => {
        setView('list');
        setEditingWork(undefined);
    };

    if (view === 'create' || view === 'edit') {
        return (
            <div className='space-y-4'>
                <button
                    onClick={handleCancel}
                    className='inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors'>
                    <ArrowLeft size={16} />
                    Back to Other Works
                </button>
                <h1 className='text-2xl font-bold text-slate-900'>
                    {view === 'edit' ? 'Edit Work' : 'New Work'}
                </h1>
                <OtherWorkForm
                    work={editingWork}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </div>
        );
    }

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <h1 className='text-2xl font-bold text-slate-900'>Other Works</h1>
                <button
                    onClick={() => setView('create')}
                    className='inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'>
                    <Plus size={16} />
                    Add New Work
                </button>
            </div>
            {saving && (
                <div className='bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm'>
                    ⏳ Saving work and uploading photos...
                </div>
            )}
            {error && (
                <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between'>
                    <span>❌ {error}</span>
                    <button onClick={() => setError(null)} className='text-red-500 hover:text-red-700 font-bold'>✕</button>
                </div>
            )}
            <OtherWorkList onEdit={handleEdit} />
        </div>
    );
}
