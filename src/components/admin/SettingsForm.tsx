'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Save, Upload, X, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
    saveSettings as dbSaveSettings,
    uploadImage,
    isSupabaseConfigured,
} from '@/lib/supabase-data';
import type { PanchayatSettings, PromiseItem } from '@/lib/types';

interface FormData {
    panchayat_name_hi: string;
    panchayat_name_en: string;
    block_hi: string;
    block_en: string;
    district_hi: string;
    district_en: string;
    state_hi: string;
    state_en: string;
    representative_name_hi: string;
    representative_name_en: string;
    representative_photo_url: string;
    spouse_name_hi: string;
    spouse_name_en: string;
    spouse_photo_url: string;
    tenure_start: string;
    tenure_end: string;
    election_slogan_hi: string;
    election_slogan_en: string;
    election_year: string;
    election_symbol: string;
    campaign_message_hi: string;
    campaign_message_en: string;
    show_campaign: boolean;
}

function settingsToForm(s: PanchayatSettings): FormData {
    return {
        panchayat_name_hi: s.panchayat_name_hi,
        panchayat_name_en: s.panchayat_name_en ?? '',
        block_hi: s.block_hi ?? '',
        block_en: s.block_en ?? '',
        district_hi: s.district_hi ?? '',
        district_en: s.district_en ?? '',
        state_hi: s.state_hi,
        state_en: s.state_en,
        representative_name_hi: s.representative_name_hi ?? '',
        representative_name_en: s.representative_name_en ?? '',
        representative_photo_url: s.representative_photo_url ?? '',
        spouse_name_hi: s.spouse_name_hi ?? '',
        spouse_name_en: s.spouse_name_en ?? '',
        spouse_photo_url: s.spouse_photo_url ?? '',
        tenure_start: s.tenure_start?.toString() ?? '',
        tenure_end: s.tenure_end?.toString() ?? '',
        election_slogan_hi: s.election_slogan_hi ?? '',
        election_slogan_en: s.election_slogan_en ?? '',
        election_year: s.election_year?.toString() ?? '',
        election_symbol: s.election_symbol ?? '',
        campaign_message_hi: s.campaign_message_hi ?? '',
        campaign_message_en: s.campaign_message_en ?? '',
        show_campaign: s.show_campaign ?? false,
    };
}

function PhotoUpload({
    label,
    preview,
    onDrop,
    onRemove,
}: {
    label: string;
    preview: string | null;
    onDrop: (files: File[]) => void;
    onRemove: () => void;
}): React.JSX.Element {
    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        maxFiles: 1,
        onDrop,
    });

    return (
        <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
                {label}
            </label>
            {preview ? (
                <div className='flex items-center gap-4'>
                    <div className='relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200'>
                        <img
                            src={preview}
                            alt={label}
                            className='w-full h-full object-cover'
                        />
                        <button
                            type='button'
                            onClick={onRemove}
                            className='absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5'
                            aria-label='Remove photo'>
                            <X size={14} />
                        </button>
                    </div>
                    <p className='text-sm text-slate-500'>
                        Click × to remove
                    </p>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className='border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 transition-colors'>
                    <input {...getInputProps()} />
                    <Upload size={20} className='mx-auto mb-1 text-slate-400' />
                    <p className='text-sm text-slate-500'>
                        Drop photo or click to browse
                    </p>
                </div>
            )}
        </div>
    );
}

export default function SettingsForm(): React.JSX.Element {
    const { settings, setSettings } = useAppStore();
    const [form, setForm] = useState<FormData>(settingsToForm(settings));
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [spousePhotoFile, setSpousePhotoFile] = useState<File | null>(null);
    const [promises, setPromises] = useState<PromiseItem[]>(settings.promises ?? []);
    const [photoPreview, setPhotoPreview] = useState<string | null>(
        settings.representative_photo_url,
    );
    const [spousePhotoPreview, setSpousePhotoPreview] = useState<string | null>(
        settings.spouse_photo_url,
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setSaved(false);
    };

    const onRepPhotoDrop = useCallback((accepted: File[]) => {
        const file = accepted[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPhotoPreview(url);
        setPhotoFile(file);
        setForm((prev) => ({ ...prev, representative_photo_url: url }));
        setSaved(false);
    }, []);

    const onSpousePhotoDrop = useCallback((accepted: File[]) => {
        const file = accepted[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setSpousePhotoPreview(url);
        setSpousePhotoFile(file);
        setForm((prev) => ({ ...prev, spouse_photo_url: url }));
        setSaved(false);
    }, []);

    const removeRepPhoto = (): void => {
        if (photoPreview && photoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(photoPreview);
        }
        setPhotoPreview(null);
        setPhotoFile(null);
        setForm((prev) => ({ ...prev, representative_photo_url: '' }));
        setSaved(false);
    };

    const removeSpousePhoto = (): void => {
        if (spousePhotoPreview && spousePhotoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(spousePhotoPreview);
        }
        setSpousePhotoPreview(null);
        setSpousePhotoFile(null);
        setForm((prev) => ({ ...prev, spouse_photo_url: '' }));
        setSaved(false);
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setSaving(true);

        let repPhotoUrl = form.representative_photo_url || null;
        let spousePhotoUrl = form.spouse_photo_url || null;
        let uploadError = '';

        if (isSupabaseConfigured()) {
            if (photoFile) {
                try {
                    repPhotoUrl = await uploadImage(photoFile, 'settings');
                } catch (err) {
                    uploadError += `Pradhan photo upload failed. `;
                    console.error('Pradhan photo upload failed:', err);
                }
            }
            if (spousePhotoFile) {
                try {
                    spousePhotoUrl = await uploadImage(spousePhotoFile, 'settings');
                } catch (err) {
                    uploadError += `Spouse photo upload failed. `;
                    console.error('Spouse photo upload failed:', err);
                }
            }
        }

        const updated: PanchayatSettings = {
            ...settings,
            panchayat_name_hi: form.panchayat_name_hi,
            panchayat_name_en: form.panchayat_name_en || null,
            block_hi: form.block_hi || null,
            block_en: form.block_en || null,
            district_hi: form.district_hi || null,
            district_en: form.district_en || null,
            state_hi: form.state_hi,
            state_en: form.state_en,
            representative_name_hi: form.representative_name_hi || null,
            representative_name_en: form.representative_name_en || null,
            representative_photo_url: repPhotoUrl,
            spouse_name_hi: form.spouse_name_hi || null,
            spouse_name_en: form.spouse_name_en || null,
            spouse_photo_url: spousePhotoUrl,
            tenure_start: form.tenure_start ? parseInt(form.tenure_start, 10) : null,
            tenure_end: form.tenure_end ? parseInt(form.tenure_end, 10) : null,
            election_slogan_hi: form.election_slogan_hi || null,
            election_slogan_en: form.election_slogan_en || null,
            election_year: form.election_year ? parseInt(form.election_year, 10) : null,
            election_symbol: form.election_symbol || null,
            campaign_message_hi: form.campaign_message_hi || null,
            campaign_message_en: form.campaign_message_en || null,
            promises,
            show_campaign: form.show_campaign,
            updated_at: new Date().toISOString(),
        };
        setSettings(updated);

        if (isSupabaseConfigured()) {
            try {
                await dbSaveSettings(updated);
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Unknown error';
                uploadError += `Settings save failed: ${msg}`;
                console.error('Failed to save settings to Supabase:', msg);
            }
        }

        setSaving(false);
        if (uploadError) {
            setSaveError(uploadError);
            setTimeout(() => setSaveError(null), 8000);
        } else {
            setSaveError(null);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
        setPhotoFile(null);
        setSpousePhotoFile(null);
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <h1 className='text-2xl font-bold text-slate-900'>Settings</h1>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Panchayat Info */}
                <div className='bg-white rounded-xl border border-slate-200 p-6'>
                    <h3 className='text-lg font-semibold text-slate-900 mb-4'>
                        Panchayat Information
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label htmlFor='panchayat_name_hi' className='block text-sm font-medium text-slate-700 mb-1'>
                                Panchayat Name (Hindi)
                            </label>
                            <input id='panchayat_name_hi' name='panchayat_name_hi' value={form.panchayat_name_hi} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500' />
                        </div>
                        <div>
                            <label htmlFor='panchayat_name_en' className='block text-sm font-medium text-slate-700 mb-1'>
                                Panchayat Name (English)
                            </label>
                            <input id='panchayat_name_en' name='panchayat_name_en' value={form.panchayat_name_en} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500' />
                        </div>
                        <div>
                            <label htmlFor='block_hi' className='block text-sm font-medium text-slate-700 mb-1'>Block (Hindi)</label>
                            <input id='block_hi' name='block_hi' value={form.block_hi} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500' />
                        </div>
                        <div>
                            <label htmlFor='block_en' className='block text-sm font-medium text-slate-700 mb-1'>Block (English)</label>
                            <input id='block_en' name='block_en' value={form.block_en} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500' />
                        </div>
                        <div>
                            <label htmlFor='district_hi' className='block text-sm font-medium text-slate-700 mb-1'>District (Hindi)</label>
                            <input id='district_hi' name='district_hi' value={form.district_hi} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500' />
                        </div>
                        <div>
                            <label htmlFor='district_en' className='block text-sm font-medium text-slate-700 mb-1'>District (English)</label>
                            <input id='district_en' name='district_en' value={form.district_en} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500' />
                        </div>
                        <div>
                            <label htmlFor='state_hi' className='block text-sm font-medium text-slate-700 mb-1'>State (Hindi)</label>
                            <input id='state_hi' name='state_hi' value={form.state_hi} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500' />
                        </div>
                        <div>
                            <label htmlFor='state_en' className='block text-sm font-medium text-slate-700 mb-1'>State (English)</label>
                            <input id='state_en' name='state_en' value={form.state_en} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500' />
                        </div>
                    </div>
                </div>

                {/* Gram Pradhan */}
                <div className='bg-white rounded-xl border border-slate-200 p-6'>
                    <h3 className='text-lg font-semibold text-slate-900 mb-4'>
                        👤 Gram Pradhan (ग्राम प्रधान)
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label htmlFor='representative_name_hi' className='block text-sm font-medium text-slate-700 mb-1'>
                                Name (Hindi)
                            </label>
                            <input id='representative_name_hi' name='representative_name_hi' value={form.representative_name_hi} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                placeholder='श्रीमती सीता देवी पटेल' />
                        </div>
                        <div>
                            <label htmlFor='representative_name_en' className='block text-sm font-medium text-slate-700 mb-1'>
                                Name (English)
                            </label>
                            <input id='representative_name_en' name='representative_name_en' value={form.representative_name_en} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                placeholder='Smt. Sita Devi Patel' />
                        </div>
                        <div className='md:col-span-2'>
                            <PhotoUpload
                                label='Pradhan Photo'
                                preview={photoPreview}
                                onDrop={onRepPhotoDrop}
                                onRemove={removeRepPhoto}
                            />
                        </div>
                    </div>
                </div>

                {/* Husband / Spouse */}
                <div className='bg-white rounded-xl border border-slate-200 p-6'>
                    <h3 className='text-lg font-semibold text-slate-900 mb-4'>
                        👤 Husband / Spouse (पति)
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label htmlFor='spouse_name_hi' className='block text-sm font-medium text-slate-700 mb-1'>
                                Name (Hindi)
                            </label>
                            <input id='spouse_name_hi' name='spouse_name_hi' value={form.spouse_name_hi} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                placeholder='श्री रामप्रसाद पटेल' />
                        </div>
                        <div>
                            <label htmlFor='spouse_name_en' className='block text-sm font-medium text-slate-700 mb-1'>
                                Name (English)
                            </label>
                            <input id='spouse_name_en' name='spouse_name_en' value={form.spouse_name_en} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                placeholder='Shri Ramprasad Patel' />
                        </div>
                        <div className='md:col-span-2'>
                            <PhotoUpload
                                label='Spouse Photo'
                                preview={spousePhotoPreview}
                                onDrop={onSpousePhotoDrop}
                                onRemove={removeSpousePhoto}
                            />
                        </div>
                    </div>
                </div>

                {/* Tenure */}
                <div className='bg-white rounded-xl border border-slate-200 p-6'>
                    <h3 className='text-lg font-semibold text-slate-900 mb-4'>
                        Tenure / कार्यकाल
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label htmlFor='tenure_start' className='block text-sm font-medium text-slate-700 mb-1'>Start Year</label>
                            <input id='tenure_start' name='tenure_start' type='number' value={form.tenure_start} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                placeholder='2020' />
                        </div>
                        <div>
                            <label htmlFor='tenure_end' className='block text-sm font-medium text-slate-700 mb-1'>End Year</label>
                            <input id='tenure_end' name='tenure_end' type='number' value={form.tenure_end} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                placeholder='2025' />
                        </div>
                    </div>
                </div>

                {/* Election Campaign */}
                <div className='bg-white rounded-xl border-2 border-orange-200 p-6'>
                    <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-slate-900'>
                            🗳️ Election Campaign / चुनाव प्रचार
                        </h3>
                        <label className='flex items-center gap-2 cursor-pointer'>
                            <input
                                type='checkbox'
                                checked={form.show_campaign}
                                onChange={(e) => { setForm((prev) => ({ ...prev, show_campaign: e.target.checked })); setSaved(false); }}
                                className='w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500' />
                            <span className='text-sm font-medium text-orange-600'>Show on page</span>
                        </label>
                    </div>
                    <p className='text-xs text-slate-500 mb-4'>Toggle ON to show campaign section on the public page. Fill details below.</p>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                        <div>
                            <label htmlFor='election_slogan_hi' className='block text-sm font-medium text-slate-700 mb-1'>Slogan (Hindi)</label>
                            <input id='election_slogan_hi' name='election_slogan_hi' value={form.election_slogan_hi} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                                placeholder='विकास की राह पर फिर से चलें' />
                        </div>
                        <div>
                            <label htmlFor='election_slogan_en' className='block text-sm font-medium text-slate-700 mb-1'>Slogan (English)</label>
                            <input id='election_slogan_en' name='election_slogan_en' value={form.election_slogan_en} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                                placeholder='Walk the path of development again' />
                        </div>
                        <div>
                            <label htmlFor='election_year' className='block text-sm font-medium text-slate-700 mb-1'>Election Year</label>
                            <input id='election_year' name='election_year' type='number' value={form.election_year} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                                placeholder='2025' />
                        </div>
                        <div>
                            <label htmlFor='election_symbol' className='block text-sm font-medium text-slate-700 mb-1'>Election Symbol (emoji)</label>
                            <input id='election_symbol' name='election_symbol' value={form.election_symbol} onChange={handleChange}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                                placeholder='🌾 or 🏠 or any emoji' />
                        </div>
                        <div className='md:col-span-2'>
                            <label htmlFor='campaign_message_hi' className='block text-sm font-medium text-slate-700 mb-1'>Appeal Message (Hindi)</label>
                            <textarea id='campaign_message_hi' name='campaign_message_hi' value={form.campaign_message_hi}
                                onChange={(e) => { setForm((prev) => ({ ...prev, campaign_message_hi: e.target.value })); setSaved(false); }}
                                rows={3}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                                placeholder='गाँव के विकास के लिए मैंने जो काम किए हैं वो आपके सामने हैं। आगे भी गाँव की सेवा करने का मौका दीजिए।' />
                        </div>
                        <div className='md:col-span-2'>
                            <label htmlFor='campaign_message_en' className='block text-sm font-medium text-slate-700 mb-1'>Appeal Message (English)</label>
                            <textarea id='campaign_message_en' name='campaign_message_en' value={form.campaign_message_en}
                                onChange={(e) => { setForm((prev) => ({ ...prev, campaign_message_en: e.target.value })); setSaved(false); }}
                                rows={3}
                                className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                                placeholder='The works I have done for village development are in front of you. Give me a chance to serve the village again.' />
                        </div>
                    </div>

                    {/* Promises List */}
                    <div className='border-t border-slate-200 pt-4'>
                        <h4 className='text-sm font-semibold text-slate-700 mb-3'>📋 Promises / वादे (Next Term)</h4>
                        {promises.map((p, i) => (
                            <div key={i} className='flex gap-2 mb-2 items-start'>
                                <input value={p.icon} onChange={(e) => { const next = [...promises]; next[i] = { ...next[i], icon: e.target.value }; setPromises(next); setSaved(false); }}
                                    className='w-12 px-2 py-2 border border-slate-300 rounded-lg text-sm text-center' placeholder='🛣️' />
                                <input value={p.text_hi} onChange={(e) => { const next = [...promises]; next[i] = { ...next[i], text_hi: e.target.value }; setPromises(next); setSaved(false); }}
                                    className='flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm' placeholder='Hindi text' />
                                <input value={p.text_en} onChange={(e) => { const next = [...promises]; next[i] = { ...next[i], text_en: e.target.value }; setPromises(next); setSaved(false); }}
                                    className='flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm' placeholder='English text' />
                                <button type='button' onClick={() => { setPromises(promises.filter((_, j) => j !== i)); setSaved(false); }}
                                    className='px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm'>✕</button>
                            </div>
                        ))}
                        <button type='button'
                            onClick={() => { setPromises([...promises, { icon: '✅', text_hi: '', text_en: '' }]); setSaved(false); }}
                            className='text-sm text-orange-600 hover:text-orange-700 font-medium mt-1'>
                            + Add Promise
                        </button>
                    </div>
                </div>

                {/* Save */}
                {saveError && (
                    <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm'>
                        ❌ {saveError}
                    </div>
                )}
                <div className='flex items-center justify-end gap-3'>
                    {saved && (
                        <span className='text-sm text-green-600 font-medium'>
                            ✓ Settings saved
                        </span>
                    )}
                    <button
                        type='submit'
                        disabled={saving}
                        className='inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50'>
                        {saving ? (
                            <>
                                <Loader2 size={16} className='animate-spin' />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
