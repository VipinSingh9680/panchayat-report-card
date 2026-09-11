import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'पंचायत विकास रिपोर्ट कार्ड | Panchayat Development Report Card',
    description:
        'हमारे पंचायत में पूरे हुए विकास कार्यों की डिजिटल रिपोर्ट — पहले और अब की तस्वीरों के साथ।',
    openGraph: {
        title: 'पंचायत विकास रिपोर्ट कार्ड',
        description:
            'पूरे हुए विकास कार्यों की एक झलक — पहले और अब की तस्वीरों के साथ।',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}): React.JSX.Element {
    return (
        <html lang='hi' className='scroll-smooth'>
            <head>
                <link
                    href='https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap'
                    rel='stylesheet'
                />
            </head>
            <body className='font-hindi antialiased text-slate-800 bg-white'>
                {children}
            </body>
        </html>
    );
}
