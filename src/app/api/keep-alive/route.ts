import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const revalidate = 0;

export async function GET(): Promise<NextResponse> {
    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ status: 'ok', db: 'not configured' });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { error } = await supabase.from('panchayat_settings').select('id').limit(1);

        if (error) {
            return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
        }

        return NextResponse.json({ status: 'ok', db: 'alive', timestamp: new Date().toISOString() });
    } catch {
        return NextResponse.json({ status: 'error', message: 'ping failed' }, { status: 500 });
    }
}
