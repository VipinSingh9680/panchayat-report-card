'use client';

import React, { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
    saveProject as dbSaveProject,
    uploadImage,
    isSupabaseConfigured,
    fetchProjects,
} from '@/lib/supabase-data';
import ProjectList from '@/components/admin/ProjectList';
import ProjectForm from '@/components/admin/ProjectForm';
import type { Project } from '@/lib/types';

type ViewMode = 'list' | 'create' | 'edit';

export default function ProjectsPage(): React.JSX.Element {
    const { addProject, updateProject, setProjects } = useAppStore();
    const [view, setView] = useState<ViewMode>('list');
    const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEdit = (project: Project): void => {
        setEditingProject(project);
        setView('edit');
    };

    const handleSave = async (project: Project): Promise<void> => {
        if (view === 'edit' && editingProject) {
            updateProject(editingProject.id, project);
        } else {
            addProject(project);
        }

        if (isSupabaseConfigured()) {
            setSaving(true);
            setError(null);
            try {
                const uploadedImages: typeof project.images = [];
                for (const img of project.images ?? []) {
                    try {
                        if (img.image_url.startsWith('blob:')) {
                            const resp = await fetch(img.image_url);
                            const blob = await resp.blob();
                            const file = new File(
                                [blob],
                                `${img.image_type}-${Date.now()}.jpg`,
                                { type: blob.type },
                            );
                            const url = await uploadImage(file, 'projects');
                            uploadedImages.push({ ...img, image_url: url });
                        } else {
                            uploadedImages.push(img);
                        }
                    } catch (uploadErr) {
                        console.error('Image upload failed, skipping:', uploadErr);
                    }
                }

                const { images: _, ...projectData } = project;
                await dbSaveProject(projectData, uploadedImages);

                const freshProjects = await fetchProjects();
                setProjects(freshProjects);
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Unknown error';
                console.error('Failed to save project to Supabase:', msg);
                setError(`Save failed: ${msg}`);
            } finally {
                setSaving(false);
            }
        }

        setView('list');
        setEditingProject(undefined);
    };

    const handleCancel = (): void => {
        setView('list');
        setEditingProject(undefined);
    };

    if (view === 'create' || view === 'edit') {
        return (
            <div className='space-y-4'>
                <button
                    onClick={handleCancel}
                    className='inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors'>
                    <ArrowLeft size={16} />
                    Back to Projects
                </button>
                <h1 className='text-2xl font-bold text-slate-900'>
                    {view === 'edit' ? 'Edit Project' : 'New Project'}
                </h1>
                <ProjectForm
                    project={editingProject}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </div>
        );
    }

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <h1 className='text-2xl font-bold text-slate-900'>Projects</h1>
                <button
                    onClick={() => setView('create')}
                    className='inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'>
                    <Plus size={16} />
                    Add New Project
                </button>
            </div>
            {saving && (
                <div className='bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm'>
                    ⏳ Saving project and uploading photos...
                </div>
            )}
            {error && (
                <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between'>
                    <span>❌ {error}</span>
                    <button onClick={() => setError(null)} className='text-red-500 hover:text-red-700 font-bold'>✕</button>
                </div>
            )}
            <ProjectList onEdit={handleEdit} />
        </div>
    );
}
