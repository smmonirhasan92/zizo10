import './globals.css'
import 'react-quill-new/dist/quill.snow.css'; // Global import for Quill styles
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Zizo 10 - Trusted Remittance Wallet',
    description: 'Secure, fast, and reliable digital wallet for your daily needs. Transfer with confidence.',
    metadataBase: new URL('https://zizo10.com'),
    openGraph: {
        title: 'Zizo 10 - Trusted Remittance Wallet',
        description: 'Secure, fast, and reliable digital wallet for your daily needs. Transfer with confidence.',
        url: 'https://zizo10.com',
        siteName: 'Zizo 10',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Zizo 10',
        description: 'Transfer with confidence.',
        images: ['/og-image.png'],
    },
    icons: {
        icon: '/icon.png',
        shortcut: '/icon.png',
        apple: '/icon.png',
    },
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#0f172a',
}

import { NotificationProvider } from '../context/NotificationContext';

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body className={`${inter.className} bg-gray-50 min-h-screen text-gray-900`} suppressHydrationWarning={true}>
                <NotificationProvider>
                    <div className="min-h-screen flex flex-col relative w-full mx-auto bg-white min-h-[100dvh]">
                        <main className="flex-1 overflow-y-auto no-scrollbar pb-20">
                            {children}
                        </main>
                    </div>
                </NotificationProvider>
            </body>
        </html>
    )
}
