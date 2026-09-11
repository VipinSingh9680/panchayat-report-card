'use client';

import React, { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import OtherWorkList from '@/components/admin/OtherWorkList';
import OtherWorkForm from '@/components/admin/OtherWorkForm';
import type { OtherWork } from '@/lib/types';

type ViewMode = 'list' | 'create' | 'edit';

export default function OtherWorksPage(): React.JSX.Element {
    const { addOtherWork, updateOtherWork } = useAppStore();
    const [view, setView] = useState<ViewMode>('list');
    const [editingWork, setEditingWork] = useState<OtherWork | undefined>(undefined);

    const handleEdit = (work: OtherWork): void => {
        setEditingWork(work);
        setView('edit');
    };

    const handleSave = (work: OtherWork): void => {
        if (view === 'edit' && editingWork) {
            updateOtherWork(editingWork.id, work);
        } else {
            addOtherWork(work);
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
            <OtherWorkList onEdit={handleEdit} />
        </div>
    );
}
