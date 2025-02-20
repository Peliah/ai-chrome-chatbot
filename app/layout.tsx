// import './globals.css';
// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import Head from 'next/head';
// import { Toaster } from 'sonner';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'AI Chat Assistant',
//   description: 'An accessible AI chat assistant with language detection, translation, and summarization capabilities',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <Head>
//         <meta httpEquiv="origin-trial" content={process.env.NEXT_PUBLIC_SUMMARIZER_API_TOKEN} />
//         <meta httpEquiv="origin-trial" content={process.env.NEXT_PUBLIC_LANGUAGE_DETECTOR_API_TOKEN} />
//         <meta httpEquiv="origin-trial" content={process.env.NEXT_PUBLIC_TRANSLATOR_API_TOKEN} />
//       </Head>
//       <body className={inter.className}>
//         {children}
//         <Toaster richColors position="top-right" />
//       </body>
//     </html>
//   );
// }

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Chat Assistant',
  description: 'An accessible AI chat assistant with language detection, translation, and summarization capabilities',
  // You can put the origin-trial meta tags directly in the metadata object
  //  However, it's generally better to set these dynamically if they are environment variables.
  //  See the improved version below.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // Dynamically set the origin trial tokens (RECOMMENDED):
  const originTrialMetaTags = [
    process.env.NEXT_PUBLIC_SUMMARIZER_API_TOKEN,
    process.env.NEXT_PUBLIC_LANGUAGE_DETECTOR_API_TOKEN,
    process.env.NEXT_PUBLIC_TRANSLATOR_API_TOKEN,
  ].filter(token => token).map(token => ({ // Filter out undefined tokens
    httpEquiv: 'origin-trial',
    content: token,
  }));

  return (
    <html lang="en">
      <head> {/* Use the standard <head> element */}
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