import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Startup Navigator – AI-Powered Startup Guide',
  description: 'Your AI-powered guide to building successful startups. Explore funding, legal frameworks, growth strategies, and search our curated knowledge base.',
  keywords: ['startup', 'founder', 'business guides', 'AI search', 'venture capital', 'Delaware corporation'],
  openGraph: {
    title: 'Startup Navigator – AI-Powered Startup Guide',
    description: 'Learn everything about building a startup with our AI search engine.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
