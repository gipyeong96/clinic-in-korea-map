'use strict';

import React from 'react';
import Link from 'next/link';
import { Locale, getDictionary } from '@/lib/translation';
import { mockArticles } from '@/lib/articles';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';

interface ArticlesPageProps {
  params: {
    lang: Locale;
  };
}


export async function generateMetadata({ params }: ArticlesPageProps) {
  const lang: string = 'en';
  const title = lang === 'mn' ? 'Эрүүл Мэндийн Нийтлэлүүд | Korea Clinic Map' : 'Medical Articles & Guides | Korea Clinic Map';
  const description = lang === 'mn'
    ? 'БНСУ-ын эмнэлгийн үйлчилгээ, шээс бэлгийн замын эмчилгээ болон бусад эрүүл мэндийн зөвлөгөө, мэдээлэл.'
    : 'Read professional medical guidelines, tips, and insights on visiting urology, dental, and cosmetic clinics in Korea.';

  return {
    title,
    description,
    alternates: {
      canonical: `https://koreaclinicmap.comarticles`,
    }
  };
}

export default function ArticlesPage({ params }: ArticlesPageProps) {
  const lang = "en" as any;

  const title = lang === 'mn' ? 'Эрүүл Мэндийн Зөвлөмж, Нийтлэл' : 'Medical Articles & Health Guides';
  const subtitle = lang === 'mn'
    ? 'БНСУ-д эмнэлгээр үйлчлүүлэхэд хэрэгтэй нарийн мэргэжлийн эмч нарын зөвлөгөө мэдээлэл.'
    : 'Expert insights and essential guidelines for international patients seeking medical treatment in Korea.';

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-16 px-4 shadow-sm text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,#1e293b_0%,transparent_60%)]"></div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-500">
            {lang === 'mn' ? 'ЭМНЭЛГИЙН ЗӨВЛӨГӨӨ' : 'HEALTH INSIGHTS'}
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Grid of Articles */}
      <div className="max-w-4xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockArticles.map((article) => {
            const articleTitle = lang === 'mn' ? article.title_mn : article.title_en;
            const articleSummary = lang === 'mn' 
              ? article.summary_mn || article.content_mn.substring(0, 150) + '...' 
              : article.summary_en || article.content_en.substring(0, 150) + '...';
            
            return (
              <div 
                key={article.slug}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold w-fit uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{lang === 'mn' ? 'Зөвлөгөө' : 'Guide'}</span>
                  </div>

                  <Link href={`/articles/${article.slug}`}>
                    <h2 className="text-lg font-bold text-slate-800 hover:text-amber-500 transition-colors leading-snug line-clamp-2">
                      {articleTitle}
                    </h2>
                  </Link>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {articleSummary}
                  </p>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.published_at}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      Editor
                    </span>
                  </div>

                  <Link 
                    href={`/articles/${article.slug}`}
                    className="text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 transition"
                  >
                    <span>{lang === 'mn' ? 'Унших' : 'Read More'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
