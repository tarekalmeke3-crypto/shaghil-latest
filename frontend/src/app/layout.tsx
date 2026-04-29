import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'شغّل',
    description: 'منصة المهام للشباب والشركات - ابدأ، أنجز، ابني سيرتك',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl" className="dark">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="min-h-screen bg-glossy-black text-off-white font-sans antialiased">
                {children}
            </body>
        </html>
    );
}