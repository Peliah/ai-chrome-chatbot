import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Chat Assistant',
  description: 'An accessible AI chat assistant with language detection, translation, and summarization capabilities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <meta httpEquiv="origin-trial" content={process.env.NEXT_PUBLIC_SUMMARIZER_API_TOKEN} />
        <meta httpEquiv="origin-trial" content={process.env.NEXT_PUBLIC_LANGUAGE_DETECTOR_API_TOKEN} />
        <meta httpEquiv="origin-trial" content={process.env.NEXT_PUBLIC_TRANSLATOR_API_TOKEN} />
      </Head>
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}