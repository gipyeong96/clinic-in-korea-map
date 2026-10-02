'use strict';

import React from 'react';
import Link from 'next/link';
import { Locale, getDictionary } from '@/lib/translation';
import { notFound } from 'next/navigation';
import { Calendar, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { mockArticles } from '@/lib/articles';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const paramsList = [];
  for (const art of mockArticles) {
    paramsList.push({ slug: art.slug });
  }
  return paramsList;
}

export async function generateMetadata({ params: { slug } }: ArticlePageProps) {
  const lang = 'en';
  const article = mockArticles.find(a => a.slug === slug);
  if (!article) return {};

  const title = lang === 'mn' ? article.title_mn : article.title_en;
  const description = `Read expert medical guidance about ${title} for international patients visiting Korea.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://koreaclinicmap.comarticles/${slug}`,
    }
  };
}

export default function ArticlePage({ params: { slug } }: ArticlePageProps) {
  const lang = "en" as const;

  const dict = getDictionary(lang);
  const article = mockArticles.find(a => a.slug === slug);
  
  if (!article) {
    notFound();
  }

  const title = lang === 'mn' ? article.title_mn : article.title_en;
  const content = lang === 'mn' ? article.content_mn : article.content_en;

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        
        {/* Back Link */}
        <Link 
          href={`/ `}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{lang === 'mn' ? 'Нүүр хуудас руу буцах' : 'Back to Home'}</span>
        </Link>

        {/* Article Headers */}
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
            {title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{article.published_at}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>{dict.title} Editor</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <article className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-slate-200 shadow-sm leading-relaxed text-slate-600 text-sm whitespace-pre-line">
          {content}
        </article>

        {/* Hard / Soft Conversion Funnel for Goldman (Gangnam/Seoul Station/etc) */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-8 rounded-2xl shadow-lg space-y-6 mt-8">
          <div className="space-y-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
              💡 {lang === 'mn' ? 'Онцлох эмнэлэг' : 'Featured Partner'}
            </span>
            <h2 className="text-xl md:text-2xl font-black">
              {lang === 'mn' 
                ? 'Сөүлийн хамгийн итгэмжлэгдсэн бөөрний эмнэлгийг сонгох' 
                : 'Choose Korea\'s Leading Urology Specialist'}
            </h2>
            <p className="text-xs text-amber-50/90 max-w-xl leading-relaxed">
              {lang === 'mn'
                ? 'Голдман бөөрний эмнэлэг нь Гангнам, Сөүл өртөө, Инчон, Донтан, Жамшил салбартаа гадаад хэлтэй өвчтөнүүдэд зориулсан тусгай үйлчилгээ үзүүлдэг.'
                : 'Goldman Urology Clinic operates 5 state-of-the-art clinics in Gangnam, Seoul Station, Incheon, Dongtan, and Jamsil, staffed with English-speaking specialists.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2 bg-white/10 p-3 rounded-lg">
              <CheckCircle className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{lang === 'mn' ? 'Бүх салбарт англи хэлний дэмжлэгтэй' : 'English consultation in all locations'}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 p-3 rounded-lg">
              <CheckCircle className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{lang === 'mn' ? 'Түрүү булчирхайн дэвшилтэт эмчилгээ' : 'Advanced Prostate treatments (Holep)'}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/clinics/detail/goldman-gangnam`}
              className="bg-white text-amber-600 hover:bg-slate-50 transition text-center px-6 py-3 rounded-xl font-bold text-xs shadow-sm"
            >
              🏢 {lang === 'mn' ? 'Гангнам салбар харах' : 'View Gangnam Branch'}
            </Link>
            <Link
              href={`/clinics/detail/goldman-seoulyeok`}
              className="bg-amber-600 text-white border border-amber-400 hover:bg-amber-700 transition text-center px-6 py-3 rounded-xl font-bold text-xs shadow-sm"
            >
              🏢 {lang === 'mn' ? 'Сөүл өртөө салбар харах' : 'View Seoul Station Branch'}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
