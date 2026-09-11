import { supabase } from './supabase';
import type {
    PanchayatSettings,
    Category,
    Project,
    ProjectImage,
    OtherWork,
    OtherWorkImage,
    WelfareStat,
} from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const isSupabaseConfigured = (): boolean => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return typeof url === 'string' && url.trim().length > 0;
};

// ---------------------------------------------------------------------------
// Read operations (public page)
// ---------------------------------------------------------------------------

export const fetchSettings = async (): Promise<PanchayatSettings | null> => {
    const { data, error } = await supabase
        .from('panchayat_settings')
        .select('*')
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch settings: ${error.message}`);
    }

    return (data as PanchayatSettings) ?? null;
};

export const fetchCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return (data as Category[]) ?? [];
};

export const fetchProjects = async (): Promise<Project[]> => {
    const { data, error } = await supabase
        .from('projects')
        .select('*, project_images(*)')
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return ((data ?? []) as (Project & { project_images: ProjectImage[] })[]).map((row) => ({
        ...row,
        images: row.project_images ?? [],
        project_images: undefined,
    })) as Project[];
};

export const fetchOtherWorks = async (): Promise<OtherWork[]> => {
    const { data, error } = await supabase
        .from('other_works')
        .select('*, other_work_images(*)')
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch other works: ${error.message}`);
    }

    return ((data ?? []) as (OtherWork & { other_work_images: OtherWorkImage[] })[]).map(
        (row) => ({
            ...row,
            images: row.other_work_images ?? [],
            other_work_images: undefined,
        }),
    ) as OtherWork[];
};

export const fetchWelfareStats = async (): Promise<WelfareStat[]> => {
    const { data, error } = await supabase
        .from('welfare_stats')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch welfare stats: ${error.message}`);
    }

    return (data as WelfareStat[]) ?? [];
};

export interface AllData {
    settings: PanchayatSettings | null;
    categories: Category[];
    projects: Project[];
    otherWorks: OtherWork[];
    welfareStats: WelfareStat[];
}

export const fetchAllData = async (): Promise<AllData> => {
    const [settings, categories, projects, otherWorks, welfareStats] = await Promise.all([
        fetchSettings(),
        fetchCategories(),
        fetchProjects(),
        fetchOtherWorks(),
        fetchWelfareStats(),
    ]);

    return { settings, categories, projects, otherWorks, welfareStats };
};

// ---------------------------------------------------------------------------
// Write operations (admin)
// ---------------------------------------------------------------------------

export const saveSettings = async (
    settings: Partial<PanchayatSettings>,
): Promise<PanchayatSettings> => {
    const { id: _id, created_at: _created, ...payload } = settings as Record<string, unknown>;
    const updatePayload = { ...payload, updated_at: new Date().toISOString() };

    const { data: existing } = await supabase
        .from('panchayat_settings')
        .select('id')
        .limit(1)
        .single();

    if (existing?.id) {
        const { data, error } = await supabase
            .from('panchayat_settings')
            .update(updatePayload)
            .eq('id', existing.id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update settings: ${error.message}`);
        }
        return data as PanchayatSettings;
    }

    const { data, error } = await supabase
        .from('panchayat_settings')
        .insert(updatePayload)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to insert settings: ${error.message}`);
    }
    return data as PanchayatSettings;
};

export const saveProject = async (
    project: Omit<Project, 'images'>,
    images: ProjectImage[],
): Promise<Project> => {
    const isExisting = !project.id.startsWith('p-');

    let saved: Project;

    if (isExisting) {
        const { data, error } = await supabase
            .from('projects')
            .update({ ...project, updated_at: new Date().toISOString() })
            .eq('id', project.id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update project: ${error.message}`);
        }
        saved = data as Project;
    } else {
        const { id: _id, ...projectWithoutId } = project;
        const { data, error } = await supabase
            .from('projects')
            .insert({ ...projectWithoutId, updated_at: new Date().toISOString() })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to insert project: ${error.message}`);
        }
        saved = data as Project;
    }

    const { error: deleteError } = await supabase
        .from('project_images')
        .delete()
        .eq('project_id', saved.id);

    if (deleteError) {
        throw new Error(`Failed to clear project images: ${deleteError.message}`);
    }

    if (images.length > 0) {
        const rows = images.map((img) => {
            const { id: _imgId, ...imgWithoutId } = img;
            return { ...imgWithoutId, project_id: saved.id };
        });
        const { error: insertError } = await supabase
            .from('project_images')
            .insert(rows);

        if (insertError) {
            throw new Error(`Failed to insert project images: ${insertError.message}`);
        }
    }

    return saved;
};

export const deleteProject = async (id: string): Promise<void> => {
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
        throw new Error(`Failed to delete project: ${error.message}`);
    }
};

export const saveOtherWork = async (
    work: Omit<OtherWork, 'images'>,
    images: OtherWorkImage[],
): Promise<OtherWork> => {
    const isExisting = !work.id.startsWith('ow-');

    let saved: OtherWork;

    if (isExisting) {
        const { data, error } = await supabase
            .from('other_works')
            .update({ ...work, updated_at: new Date().toISOString() })
            .eq('id', work.id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update other work: ${error.message}`);
        }
        saved = data as OtherWork;
    } else {
        const { id: _id, ...workWithoutId } = work;
        const { data, error } = await supabase
            .from('other_works')
            .insert({ ...workWithoutId, updated_at: new Date().toISOString() })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to insert other work: ${error.message}`);
        }
        saved = data as OtherWork;
    }

    const { error: deleteError } = await supabase
        .from('other_work_images')
        .delete()
        .eq('other_work_id', saved.id);

    if (deleteError) {
        throw new Error(`Failed to clear other work images: ${deleteError.message}`);
    }

    if (images.length > 0) {
        const rows = images.map((img) => {
            const { id: _imgId, ...imgWithoutId } = img;
            return { ...imgWithoutId, other_work_id: saved.id };
        });
        const { error: insertError } = await supabase
            .from('other_work_images')
            .insert(rows);

        if (insertError) {
            throw new Error(`Failed to insert other work images: ${insertError.message}`);
        }
    }

    return saved;
};

export const deleteOtherWork = async (id: string): Promise<void> => {
    const { error } = await supabase.from('other_works').delete().eq('id', id);

    if (error) {
        throw new Error(`Failed to delete other work: ${error.message}`);
    }
};

export const saveWelfareStat = async (stat: WelfareStat): Promise<WelfareStat> => {
    const isExisting = !stat.id.startsWith('ws-');

    if (isExisting) {
        const { data, error } = await supabase
            .from('welfare_stats')
            .update(stat)
            .eq('id', stat.id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update welfare stat: ${error.message}`);
        }
        return data as WelfareStat;
    }

    const { id: _id, ...statWithoutId } = stat;
    const { data, error } = await supabase
        .from('welfare_stats')
        .insert(statWithoutId)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to insert welfare stat: ${error.message}`);
    }

    return data as WelfareStat;
};

export const deleteWelfareStat = async (id: string): Promise<void> => {
    const { error } = await supabase.from('welfare_stats').delete().eq('id', id);

    if (error) {
        throw new Error(`Failed to delete welfare stat: ${error.message}`);
    }
};

export const saveCategory = async (cat: Category): Promise<Category> => {
    const { data, error } = await supabase
        .from('categories')
        .upsert(cat, { onConflict: 'id' })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to save category: ${error.message}`);
    }

    return data as Category;
};

export const deleteCategory = async (id: string): Promise<void> => {
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
        throw new Error(`Failed to delete category: ${error.message}`);
    }
};

// ---------------------------------------------------------------------------
// Image upload
// ---------------------------------------------------------------------------

export const uploadImage = async (file: File, folder: string): Promise<string> => {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folder}/${timestamp}_${safeName}`;

    const { error } = await supabase.storage.from('images').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
    });

    if (error) {
        throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: urlData } = supabase.storage.from('images').getPublicUrl(path);

    return urlData.publicUrl;
};
