'use client';

import Link from 'next/link';
import { getLocalizedField } from '@/lib/utils';
import { Project, Category, Language } from '@/lib/types';
import { CheckCircle2, MapPin, Calendar } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
    categories: Category[];
    lang: Language;
}

const ProjectCard = ({ project, categories, lang }: ProjectCardProps): React.JSX.Element => {
    const title = getLocalizedField(project, 'title', lang);
    const description = getLocalizedField(project, 'description', lang);
    const category = categories.find((c) => c.id === project.category_id);
    const categoryName = category
        ? lang === 'hi'
            ? category.name_hi
            : category.name_en
        : '';

    const primaryImage =
        project.images?.find((i) => i.image_type === 'after') ||
        project.images?.[0];

    return (
        <Link
            href={`/projects/${project.slug}`}
            className="group flex flex-col bg-white rounded-2xl md:rounded-3xl
                shadow-lg hover:shadow-2xl border border-slate-100
                overflow-hidden transform hover:scale-[1.02]
                transition-all duration-300"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                {primaryImage ? (
                    <img
                        src={primaryImage.image_url}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <span className="text-5xl opacity-40">🏗️</span>
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {lang === 'hi' ? 'पूर्ण' : 'Completed'}
                    </span>
                </div>
                {category && (
                    <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
                            {category.icon} {categoryName}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 p-4 md:p-5 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {title}
                </h3>

                {description && (
                    <p className="text-sm text-slate-500 leading-relaxed mb-3 line-clamp-2 flex-1">
                        {description}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-auto pt-3 border-t border-slate-50">
                    {project.ward && (
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {project.ward}
                        </span>
                    )}
                    {project.completion_year && (
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {project.completion_year}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;
