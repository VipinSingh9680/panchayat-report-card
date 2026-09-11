'use client';

import React, { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import ProjectList from '@/components/admin/ProjectList';
import ProjectForm from '@/components/admin/ProjectForm';
import type { Project } from '@/lib/types';

type ViewMode = 'list' | 'create' | 'edit';

export default function ProjectsPage(): React.JSX.Element {
    const { addProject, updateProject } = useAppStore();
    const [view, setView] = useState<ViewMode>('list');
    const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

    const handleEdit = (project: Project): void => {
        setEditingProject(project);
        setView('edit');
    };

    const handleSave = (project: Project): void => {
        if (view === 'edit' && editingProject) {
            updateProject(editingProject.id, project);
        } else {
            addProject(project);
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
            <ProjectList onEdit={handleEdit} />
        </div>
    );
}
