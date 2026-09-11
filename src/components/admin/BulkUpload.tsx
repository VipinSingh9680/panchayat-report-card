'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { generateSlug } from '@/lib/utils';
import type { Project } from '@/lib/types';

interface ParsedRow {
    [key: string]: string;
}

interface ImportResult {
    success: number;
    errors: { row: number; message: string }[];
}

const EXPECTED_COLUMNS = [
    'Project Name',
    'Category',
    'Ward',
    'Location',
    'Year',
    'Cost',
    'Description',
    'Status',
];

const CATEGORY_NAME_MAP: Record<string, string> = {};

export default function BulkUpload(): React.JSX.Element {
    const { addProject, categories } = useAppStore();
    const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [fileName, setFileName] = useState('');
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [importing, setImporting] = useState(false);

    categories.forEach((cat) => {
        CATEGORY_NAME_MAP[cat.name_en.toLowerCase()] = cat.id;
        CATEGORY_NAME_MAP[cat.name_hi.toLowerCase()] = cat.id;
    });

    const onDrop = useCallback((accepted: File[]) => {
        const file = accepted[0];
        if (!file) return;

        setFileName(file.name);
        setImportResult(null);

        Papa.parse<ParsedRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setHeaders(results.meta.fields ?? []);
                setParsedData(results.data);
            },
            error: () => {
                setParsedData([]);
                setHeaders([]);
            },
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.csv'],
        },
        maxFiles: 1,
        onDrop,
    });

    const findCategoryId = (name: string): string | null => {
        if (!name) return null;
        return CATEGORY_NAME_MAP[name.toLowerCase()] ?? null;
    };

    const handleImport = (): void => {
        setImporting(true);
        const result: ImportResult = { success: 0, errors: [] };

        parsedData.forEach((row, idx) => {
            const projectName = row['Project Name']?.trim();
            if (!projectName) {
                result.errors.push({ row: idx + 2, message: 'Missing Project Name' });
                return;
            }

            const now = new Date().toISOString();
            const yearStr = row['Year']?.trim();
            const costStr = row['Cost']?.trim();
            const statusRaw = row['Status']?.trim().toLowerCase();

            const project: Project = {
                id: `p-import-${Date.now()}-${idx}`,
                title_hi: projectName,
                title_en: null,
                description_hi: row['Description']?.trim() || null,
                description_en: null,
                category_id: findCategoryId(row['Category']?.trim() ?? ''),
                ward: row['Ward']?.trim() || null,
                location_hi: row['Location']?.trim() || null,
                location_en: null,
                completion_year: yearStr ? parseInt(yearStr, 10) : null,
                completion_date: null,
                cost_lakhs: costStr ? parseFloat(costStr) : null,
                scheme: null,
                department: null,
                is_featured: false,
                status: statusRaw === 'published' ? 'published' : 'draft',
                slug: generateSlug(projectName),
                created_at: now,
                updated_at: now,
                images: [],
            };

            addProject(project);
            result.success++;
        });

        setImportResult(result);
        setImporting(false);
    };

    const reset = (): void => {
        setParsedData([]);
        setHeaders([]);
        setFileName('');
        setImportResult(null);
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <h1 className='text-2xl font-bold text-slate-900'>Bulk Upload</h1>
            </div>

            {/* Upload Zone */}
            {parsedData.length === 0 && (
                <div className='bg-white rounded-xl border border-slate-200 p-6'>
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                            isDragActive
                                ? 'border-blue-400 bg-blue-50'
                                : 'border-slate-300 hover:border-slate-400'
                        }`}>
                        <input {...getInputProps()} />
                        <FileSpreadsheet
                            size={40}
                            className='mx-auto mb-3 text-slate-400'
                        />
                        <p className='text-base font-medium text-slate-700 mb-1'>
                            Drop a CSV file here or click to browse
                        </p>
                        <p className='text-sm text-slate-500'>
                            Supports .csv files
                        </p>
                    </div>

                    <div className='mt-6'>
                        <h3 className='text-sm font-semibold text-slate-700 mb-2'>
                            Expected CSV Columns
                        </h3>
                        <div className='flex flex-wrap gap-2'>
                            {EXPECTED_COLUMNS.map((col) => (
                                <span
                                    key={col}
                                    className='inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-mono'>
                                    {col}
                                </span>
                            ))}
                        </div>
                        <p className='text-xs text-slate-500 mt-2'>
                            Category values should match existing categories (e.g.
                            &quot;Roads &amp; Drains&quot;, &quot;Drinking Water&quot;). Status can
                            be &quot;published&quot; or &quot;draft&quot;.
                        </p>
                    </div>
                </div>
            )}

            {/* Preview Table */}
            {parsedData.length > 0 && !importResult && (
                <div className='bg-white rounded-xl border border-slate-200 p-6'>
                    <div className='flex items-center justify-between mb-4'>
                        <div>
                            <h3 className='text-lg font-semibold text-slate-900'>
                                Preview: {fileName}
                            </h3>
                            <p className='text-sm text-slate-500'>
                                {parsedData.length} rows found
                            </p>
                        </div>
                        <div className='flex gap-2'>
                            <button
                                onClick={reset}
                                className='px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium'>
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={importing}
                                className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50'>
                                {importing ? (
                                    <Loader2 size={16} className='animate-spin' />
                                ) : (
                                    <Upload size={16} />
                                )}
                                Import {parsedData.length} Projects
                            </button>
                        </div>
                    </div>

                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='bg-slate-50 border-b border-slate-200'>
                                    <th className='text-left px-3 py-2 text-xs font-semibold text-slate-500'>
                                        #
                                    </th>
                                    {headers.map((h) => (
                                        <th
                                            key={h}
                                            className='text-left px-3 py-2 text-xs font-semibold text-slate-500'>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-slate-100'>
                                {parsedData.slice(0, 20).map((row, idx) => (
                                    <tr key={idx} className='hover:bg-slate-50'>
                                        <td className='px-3 py-2 text-slate-400'>
                                            {idx + 1}
                                        </td>
                                        {headers.map((h) => (
                                            <td
                                                key={h}
                                                className='px-3 py-2 text-slate-700 truncate max-w-[200px]'>
                                                {row[h] ?? ''}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parsedData.length > 20 && (
                            <p className='text-xs text-slate-500 p-3'>
                                Showing first 20 of {parsedData.length} rows
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Import Result */}
            {importResult && (
                <div className='bg-white rounded-xl border border-slate-200 p-6'>
                    <div className='flex items-center gap-3 mb-4'>
                        {importResult.errors.length === 0 ? (
                            <CheckCircle2 size={24} className='text-green-500' />
                        ) : (
                            <AlertCircle size={24} className='text-amber-500' />
                        )}
                        <div>
                            <h3 className='text-lg font-semibold text-slate-900'>
                                Import Complete
                            </h3>
                            <p className='text-sm text-slate-500'>
                                {importResult.success} imported successfully
                                {importResult.errors.length > 0 &&
                                    `, ${importResult.errors.length} errors`}
                            </p>
                        </div>
                    </div>

                    {importResult.errors.length > 0 && (
                        <div className='mb-4 bg-red-50 rounded-lg p-4'>
                            <h4 className='text-sm font-medium text-red-800 mb-2'>
                                Errors
                            </h4>
                            <ul className='space-y-1'>
                                {importResult.errors.map((err, idx) => (
                                    <li
                                        key={idx}
                                        className='text-xs text-red-700'>
                                        Row {err.row}: {err.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        onClick={reset}
                        className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'>
                        Upload Another File
                    </button>
                </div>
            )}
        </div>
    );
}
