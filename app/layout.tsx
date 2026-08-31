import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://futureos.space'),
  title: {
    default: 'FutureOS — Make the future answerable',
    template: '%s · FutureOS',
  },
  description:
    'Turn important choices into testable decision records, update beliefs with evidence, and build judgment that compounds.',
  openGraph: {
    title: 'FutureOS — Make the future answerable',
    description:
      'A decision operating system for consequential work under uncertainty.',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'FutureOS — Make the future answerable',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FutureOS — Make the future answerable',
    description:
      'The decision operating system for teams working under uncertainty.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
