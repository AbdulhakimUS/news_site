import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLang } from '../contexts/LangContext';
import { MediumCard, CardSkeleton } from '../components/ArticleCard';

export default function SearchPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    axios.get(`/api/search?q=${encodeURIComponent(q)}&lang=${lang}`)
      .then(r => setResults(r.data))
      .finally(() => setLoading(false));
  }, [q, lang]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-navy-600 hover:text-gold-600 text-sm font-sans font-medium mb-6 transition-colors group">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        {t('back')}
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="h-0.5 w-8 bg-gold-500 rounded"/>
        <h1 className="section-title">{t('searchResults')}</h1>
      </div>
      <p className="text-navy-500 text-sm mb-8 ml-11">"{q}" — {results.length} natija</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {loading
          ? [1,2,3,4].map(i => <CardSkeleton key={i}/>)
          : results.length > 0
            ? results.map(a => <MediumCard key={a.id} article={a}/>)
            : (
              <div className="col-span-4 text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-navy-400 text-lg">{t('noArticles')}</p>
              </div>
            )
        }
      </div>
    </div>
  );
}
