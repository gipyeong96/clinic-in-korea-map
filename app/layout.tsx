import '@/app/globals.css';
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Korea Clinic Map',
  description: 'Find English-speaking clinics near you in Korea',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Korea Clinic Map",
    "url": "https://koreaclinicmap.com",
    "description": "Find medical clinics and hospitals near you in Korea based on public healthcare data.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://koreaclinicmap.com/clinics/all/all?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased text-slate-800 bg-slate-50 min-h-screen">
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 px-4 py-3 shadow-md">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-xl font-black bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent group-hover:opacity-90">
                  KOREA CLINIC MAP
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block">
                  EN
                </span>
              </Link>
              
              <div className="flex items-center gap-4 text-xs font-semibold">
                {/* Quick Consultation CTA */}
                <Link 
                  href="/clinics/detail/goldman-gangnam"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition"
                >
                  Consultation
                </Link>
              </div>
            </div>
          </header>

          {/* Main Page Area */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-slate-900 text-slate-500 text-xs py-8 px-4 border-t border-slate-800 text-center space-y-4">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <p>© {new Date().getFullYear()} Korea Clinic Map. All rights reserved.</p>
              <div className="flex gap-4">
                <Link href="/clinics/urology/gangnam" className="hover:text-slate-300">Urology Gangnam</Link>
                <Link href="/clinics/urology/seoul-station" className="hover:text-slate-300">Urology Seoul Station</Link>
                <Link href="/clinics/urology/jamsil" className="hover:text-slate-300">Urology Jamsil</Link>
              </div>
            </div>
            <p className="text-[10px] text-slate-600 max-w-2xl mx-auto">
              Information on this site is aggregated from public databases (HIRA). We recommend calling the clinics directly to confirm service details before visiting.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
