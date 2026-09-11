import { Project, Category, DashboardStats } from './types';

export const getLocalizedField = <T extends object>(
    item: T,
    field: string,
    lang: 'hi' | 'en'
): string => {
    const obj = item as Record<string, unknown>;
    const hiKey = `${field}_hi`;
    const enKey = `${field}_en`;
    const hiVal = (obj[hiKey] as string) ?? '';
    const enVal = (obj[enKey] as string) ?? '';

    if (lang === 'hi') {
        return hiVal.trim() || enVal.trim() || '';
    }
    return enVal.trim() || hiVal.trim() || '';
};

export const calculateDashboardStats = (
    projects: Project[],
    categories: Category[]
): DashboardStats => {
    const published = projects.filter((p) => p.status === 'published');

    const uniqueWards = new Set(
        published.map((p) => p.ward).filter(Boolean)
    );

    const totalCost = published.reduce(
        (sum, p) => sum + (p.cost_lakhs || 0),
        0
    );

    const categoryMap = new Map<string, number>();
    published.forEach((p) => {
        if (p.category_id) {
            categoryMap.set(p.category_id, (categoryMap.get(p.category_id) || 0) + 1);
        }
    });

    const categoryStats = categories
        .filter((c) => categoryMap.has(c.id))
        .map((c) => ({
            name_hi: c.name_hi,
            name_en: c.name_en,
            icon: c.icon,
            count: categoryMap.get(c.id) || 0,
        }));

    return {
        totalProjects: published.length,
        totalCategories: categoryStats.length,
        totalWards: uniqueWards.size,
        totalCostLakhs: Math.round(totalCost * 100) / 100,
        categoryStats,
    };
};

export const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

export const formatCostLakhs = (cost: number): string => {
    if (cost >= 100) {
        return `₹${(cost / 100).toFixed(2)} करोड़`;
    }
    return `₹${cost} लाख`;
};

export const getProjectsByYear = (
    projects: Project[]
): Map<number, Project[]> => {
    const yearMap = new Map<number, Project[]>();
    projects
        .filter((p) => p.status === 'published' && p.completion_year)
        .forEach((p) => {
            const year = p.completion_year as number;
            if (!yearMap.has(year)) {
                yearMap.set(year, []);
            }
            yearMap.get(year)!.push(p);
        });
    return new Map([...yearMap.entries()].sort((a, b) => a[0] - b[0]));
};

export const getWhatsAppShareUrl = (
    text: string,
    url: string
): string => {
    const message = encodeURIComponent(`${text}\n\n${url}`);
    return `https://wa.me/?text=${message}`;
};
