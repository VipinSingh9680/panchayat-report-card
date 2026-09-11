import { create } from 'zustand';
import {
    PanchayatSettings,
    Category,
    Project,
    OtherWork,
    WelfareStat,
} from './types';
import {
    sampleSettings,
    sampleCategories,
    sampleProjects,
    sampleOtherWorks,
    sampleWelfareStats,
} from './sample-data';

interface AppState {
    settings: PanchayatSettings;
    categories: Category[];
    projects: Project[];
    otherWorks: OtherWork[];
    welfareStats: WelfareStat[];
    isLoading: boolean;

    setSettings: (settings: PanchayatSettings) => void;
    setCategories: (categories: Category[]) => void;
    setProjects: (projects: Project[]) => void;
    addProject: (project: Project) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    setOtherWorks: (works: OtherWork[]) => void;
    addOtherWork: (work: OtherWork) => void;
    updateOtherWork: (id: string, updates: Partial<OtherWork>) => void;
    deleteOtherWork: (id: string) => void;
    setWelfareStats: (stats: WelfareStat[]) => void;
    addWelfareStat: (stat: WelfareStat) => void;
    updateWelfareStat: (id: string, updates: Partial<WelfareStat>) => void;
    deleteWelfareStat: (id: string) => void;
    getPublishedProjects: () => Project[];
    getFeaturedProjects: () => Project[];
    getProjectBySlug: (slug: string) => Project | undefined;
    getProjectsByCategory: (categoryId: string) => Project[];
}

export const useAppStore = create<AppState>((set, get) => ({
    settings: sampleSettings,
    categories: sampleCategories,
    projects: sampleProjects,
    otherWorks: sampleOtherWorks,
    welfareStats: sampleWelfareStats,
    isLoading: false,

    setSettings: (settings) => set({ settings }),
    setCategories: (categories) => set({ categories }),
    setProjects: (projects) => set({ projects }),

    addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),

    updateProject: (id, updates) =>
        set((state) => ({
            projects: state.projects.map((p) =>
                p.id === id ? { ...p, ...updates } : p
            ),
        })),

    deleteProject: (id) =>
        set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
        })),

    setOtherWorks: (works) => set({ otherWorks: works }),

    addOtherWork: (work) =>
        set((state) => ({ otherWorks: [...state.otherWorks, work] })),

    updateOtherWork: (id, updates) =>
        set((state) => ({
            otherWorks: state.otherWorks.map((w) =>
                w.id === id ? { ...w, ...updates } : w
            ),
        })),

    deleteOtherWork: (id) =>
        set((state) => ({
            otherWorks: state.otherWorks.filter((w) => w.id !== id),
        })),

    setWelfareStats: (stats) => set({ welfareStats: stats }),

    addWelfareStat: (stat) =>
        set((state) => ({ welfareStats: [...state.welfareStats, stat] })),

    updateWelfareStat: (id, updates) =>
        set((state) => ({
            welfareStats: state.welfareStats.map((ws) =>
                ws.id === id ? { ...ws, ...updates } : ws
            ),
        })),

    deleteWelfareStat: (id) =>
        set((state) => ({
            welfareStats: state.welfareStats.filter((ws) => ws.id !== id),
        })),

    getPublishedProjects: () =>
        get().projects.filter((p) => p.status === 'published'),

    getFeaturedProjects: () =>
        get().projects.filter(
            (p) => p.status === 'published' && p.is_featured
        ),

    getProjectBySlug: (slug) =>
        get().projects.find((p) => p.slug === slug),

    getProjectsByCategory: (categoryId) =>
        get().projects.filter(
            (p) => p.status === 'published' && p.category_id === categoryId
        ),
}));
