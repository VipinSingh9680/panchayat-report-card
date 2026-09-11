'use client';

import type { DashboardStats } from '@/lib/types';

interface ShareCardData {
    panchayatName: string;
    block: string;
    district: string;
    state: string;
    repName: string;
    tenure: string;
    stats: DashboardStats;
    lang: 'hi' | 'en';
}

function t(data: ShareCardData, hi: string, en: string): string {
    return data.lang === 'hi' ? hi : en;
}

function buildShareCardHtml(data: ShareCardData): string {
    return `
    <div style="width:600px;padding:40px;background:linear-gradient(135deg,#059669,#0d9488);font-family:'Noto Sans Devanagari','Inter',sans-serif;color:white;border-radius:24px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-60px;right:-60px;width:200px;height:200px;background:rgba(255,255,255,0.08);border-radius:50%;"></div>
        <div style="position:absolute;bottom:-40px;left:-40px;width:160px;height:160px;background:rgba(255,255,255,0.06);border-radius:50%;"></div>
        <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:14px;color:rgba(255,255,255,0.8);letter-spacing:2px;text-transform:uppercase;">
                ${t(data, 'ग्राम पंचायत विकास रिपोर्ट', 'Gram Panchayat Development Report')}
            </div>
            <div style="font-size:32px;font-weight:900;margin:8px 0;">${data.panchayatName}</div>
            <div style="font-size:14px;color:rgba(255,255,255,0.7);">
                ${t(data, 'ब्लॉक', 'Block')}: ${data.block} | ${t(data, 'जिला', 'District')}: ${data.district}
            </div>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:4px;">
                ${t(data, 'प्रधान', 'Pradhan')}: ${data.repName} ${data.tenure ? `(${data.tenure})` : ''}
            </div>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;margin-bottom:20px;">
            <div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border-radius:16px;padding:16px 28px;text-align:center;">
                <div style="font-size:36px;font-weight:900;">${data.stats.totalProjects}+</div>
                <div style="font-size:12px;color:rgba(255,255,255,0.8);">${t(data, 'पूर्ण कार्य', 'Completed Works')}</div>
            </div>
            <div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border-radius:16px;padding:16px 28px;text-align:center;">
                <div style="font-size:36px;font-weight:900;">₹${data.stats.totalCostLakhs.toFixed(1)}</div>
                <div style="font-size:12px;color:rgba(255,255,255,0.8);">${t(data, 'लाख व्यय', 'Lakhs Spent')}</div>
            </div>
        </div>
        <div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:12px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">
            ${data.stats.categoryStats.slice(0, 6).map((c) => `
                <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:6px 14px;font-size:12px;">
                    ${c.icon} ${data.lang === 'hi' ? c.name_hi : c.name_en} (${c.count})
                </div>
            `).join('')}
        </div>
        <div style="text-align:center;margin-top:20px;font-size:11px;color:rgba(255,255,255,0.5);">
            ${t(data, 'पंचायत विकास रिपोर्ट कार्ड • डिजिटल भारत', 'Panchayat Development Report Card • Digital India')}
        </div>
    </div>`;
}

export async function generateShareImage(data: ShareCardData): Promise<Blob> {
    const { default: html2canvas } = await import('html2canvas-pro');
    const container = document.createElement('div');
    container.innerHTML = buildShareCardHtml(data);
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
    });
    document.body.removeChild(container);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.95);
    });
}

export async function shareAsImage(data: ShareCardData): Promise<void> {
    const blob = await generateShareImage(data);
    const file = new File([blob], 'panchayat-report.png', { type: 'image/png' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
            title: data.panchayatName,
            text: t(data, 'विकास रिपोर्ट कार्ड', 'Development Report Card'),
            files: [file],
        });
    } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'panchayat-report.png';
        a.click();
        URL.revokeObjectURL(url);
    }
}

export async function downloadPdf(data: ShareCardData): Promise<void> {
    const blob = await generateShareImage(data);
    const imgUrl = URL.createObjectURL(blob);

    const { default: jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const img = new window.Image();
    img.src = imgUrl;
    await new Promise<void>((resolve) => { img.onload = () => resolve(); });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (img.height * pdfWidth) / img.width;
    const yOffset = 30;

    pdf.setFillColor(240, 244, 248);
    pdf.rect(0, 0, pdfWidth, pdf.internal.pageSize.getHeight(), 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(100);
    const title = t(data, 'ग्राम पंचायत विकास रिपोर्ट कार्ड', 'Gram Panchayat Development Report Card');
    pdf.text(title, pdfWidth / 2, 15, { align: 'center' });

    pdf.addImage(imgUrl, 'PNG', 10, yOffset, pdfWidth - 20, pdfHeight - 10);

    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(
        t(data, `${data.panchayatName} — डिजिटल रिपोर्ट कार्ड`, `${data.panchayatName} — Digital Report Card`),
        pdfWidth / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' },
    );

    pdf.save(`${data.panchayatName.replace(/\s+/g, '-')}-report.pdf`);
    URL.revokeObjectURL(imgUrl);
}
