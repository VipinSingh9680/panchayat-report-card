export interface PanchayatSettings {
    id: string;
    panchayat_name_hi: string;
    panchayat_name_en: string | null;
    block_hi: string | null;
    block_en: string | null;
    district_hi: string | null;
    district_en: string | null;
    state_hi: string;
    state_en: string;
    representative_name_hi: string | null;
    representative_name_en: string | null;
    representative_photo_url: string | null;
    spouse_name_hi: string | null;
    spouse_name_en: string | null;
    spouse_photo_url: string | null;
    village_photo_url: string | null;
    tenure_start: number | null;
    tenure_end: number | null;
    election_slogan_hi: string | null;
    election_slogan_en: string | null;
    election_year: number | null;
    election_symbol: string | null;
    campaign_message_hi: string | null;
    campaign_message_en: string | null;
    promises: PromiseItem[];
    comparisons: ComparisonItem[];
    show_campaign: boolean;
    created_at: string;
    updated_at: string;
}

export interface PromiseItem {
    text_hi: string;
    text_en: string;
    icon: string;
}

export interface ComparisonItem {
    icon: string;
    label_hi: string;
    label_en: string;
    before_value: string;
    after_value: string;
    max_value: string;
}

export interface Category {
    id: string;
    name_hi: string;
    name_en: string;
    icon: string;
    sort_order: number;
    created_at: string;
    project_count?: number;
}

export interface Project {
    id: string;
    title_hi: string;
    title_en: string | null;
    description_hi: string | null;
    description_en: string | null;
    category_id: string | null;
    category?: Category;
    ward: string | null;
    location_hi: string | null;
    location_en: string | null;
    completion_year: number | null;
    completion_date: string | null;
    cost_lakhs: number | null;
    scheme: string | null;
    department: string | null;
    status: 'draft' | 'published';
    is_featured: boolean;
    slug: string;
    created_at: string;
    updated_at: string;
    images?: ProjectImage[];
}

export interface ProjectImage {
    id: string;
    project_id: string;
    image_url: string;
    image_type: 'before' | 'after' | 'additional';
    caption: string | null;
    sort_order: number;
    is_primary: boolean;
    ai_suggested_type: string | null;
    created_at: string;
}

export interface OtherWork {
    id: string;
    title_hi: string;
    title_en: string | null;
    description_hi: string | null;
    description_en: string | null;
    category: string | null;
    location_hi: string | null;
    location_en: string | null;
    event_date: string | null;
    event_year: number | null;
    status: 'draft' | 'published';
    created_at: string;
    updated_at: string;
    images?: OtherWorkImage[];
}

export interface OtherWorkImage {
    id: string;
    other_work_id: string;
    image_url: string;
    caption: string | null;
    sort_order: number;
    created_at: string;
}

export interface DashboardStats {
    totalProjects: number;
    totalCategories: number;
    totalWards: number;
    totalCostLakhs: number;
    categoryStats: CategoryStat[];
}

export interface CategoryStat {
    name_hi: string;
    name_en: string;
    icon: string;
    count: number;
}

export type Language = 'hi' | 'en';

export interface WelfareStat {
    id: string;
    label_hi: string;
    label_en: string;
    icon: string;
    count: number;
    unit_hi: string;
    unit_en: string;
    sort_order: number;
}
