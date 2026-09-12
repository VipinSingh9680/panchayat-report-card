import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const revalidate = 60;

export async function GET(): Promise<NextResponse> {
    try {
        const [settingsRes, categoriesRes, projectsRes, otherWorksRes, welfareRes] = await Promise.all([
            supabase.from('panchayat_settings').select('*').limit(1).single(),
            supabase.from('categories').select('*').order('sort_order'),
            supabase.from('projects').select('*, images:project_images(*), category:categories(name_hi, name_en, icon)').order('created_at', { ascending: false }),
            supabase.from('other_works').select('*, images:other_work_images(*)').order('created_at', { ascending: false }),
            supabase.from('welfare_stats').select('*').order('sort_order'),
        ]);

        const data = {
            settings: settingsRes.data ?? null,
            categories: categoriesRes.data ?? [],
            projects: projectsRes.data ?? [],
            otherWorks: otherWorksRes.data ?? [],
            welfareStats: welfareRes.data ?? [],
        };

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 's-maxage=60, stale-while-revalidate=120',
            },
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
