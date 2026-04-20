import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { MediumCard, CardSkeleton } from '../components/ArticleCard';

export default function ArticlesPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/articles?page=${page}&limit=12`)
      .then(r => { setArticles(r.data.articles); setPages(r.data.pages); })
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-navy-600 hover:text-gold-600 text-sm font-sans font-medium mb-6 transition-colors group">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        {t('back')}
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-0.5 w-8 bg-gold-500 rounded"/>
        <h1 className="section-title">{t('allArticles')}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {loading
          ? [1,2,3,4,5,6,8,9,10,11,12].map(i => <CardSkeleton key={i}/>)
          : articles.length > 0
            ? articles.map(a => <MediumCard key={a.id} article={a}/>)
            : <p className="text-navy-400 col-span-4 text-center py-16">{t('noArticles')}</p>
        }
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-sans font-medium transition-all ${
                page === p
                  ? 'bg-navy-900 text-gold-300 border border-gold-600'
                  : 'bg-white text-navy-600 border border-navy-200 hover:border-gold-400'
              }`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
