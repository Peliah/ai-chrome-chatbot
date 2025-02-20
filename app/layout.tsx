import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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

  // creating dynamic meta tags for the api tokens
  const originTrialMetaTags = [
    process.env.NEXT_PUBLIC_SUMMARIZER_API_TOKEN,
    process.env.NEXT_PUBLIC_LANGUAGE_DETECTOR_API_TOKEN,
    process.env.NEXT_PUBLIC_TRANSLATOR_API_TOKEN,
  ].filter(token => token).map(token => ({
    httpEquiv: 'origin-trial',
    content: token,
  }));

  return (
    <html lang="en">
      <head>
        {/* Inject the dynamic meta tags */}
        {originTrialMetaTags.map((tag, index) => (
          <meta key={index} {...tag} />
        ))}
      </head>
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}