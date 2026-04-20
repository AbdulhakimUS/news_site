import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { FeaturedCard, MediumCard, SmallCard, CardSkeleton } from '../components/ArticleCard';

export default function HomePage() {
  const { t } = useLang();
  const [featured, setFeatured] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, artRes] = await Promise.all([
          axios.get('/api/articles/featured'),
          axios.get('/api/articles?limit=20'),
        ]);
        setFeatured(featRes.data);
        setArticles(artRes.data.articles);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Exclude featured from lists
  const rest = articles.filter(a => a.id !== featured?.id);
  const section1 = rest.slice(0, 2);   // top row medium cards
  const section2 = rest.slice(2, 5);   // grid row
  const section3 = rest.slice(5, 9);   // more articles

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ─── SECTION 1: Featured + Two Side Cards ─────────── */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-0.5 w-8 bg-gold-500 rounded"/>
          <h2 className="section-title text-navy-900">{t('featured')}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="featured-card h-64 skeleton rounded-2xl"/>
            ) : (
              <FeaturedCard article={featured}/>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {loading
              ? [1,2].map(i => <CardSkeleton key={i} variant="small"/>)
              : section1.map(a => <SmallCard key={a.id} article={a}/>)
            }
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: Latest 3 Medium Cards ─────────────── */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-0.5 w-8 bg-gold-500 rounded"/>
          <h2 className="section-title">{t('latest')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? [1,2,3].map(i => <CardSkeleton key={i}/>)
            : section2.length > 0
              ? section2.map(a => <MediumCard key={a.id} article={a}/>)
              : <p className="text-navy-400 col-span-3">{t('noArticles')}</p>
          }
        </div>
      </section>

      {/* ─── SECTION 3: Second Featured + Side Cards ──────── */}
      {!loading && rest.length > 5 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-0.5 w-8 bg-gold-500 rounded"/>
            <h2 className="section-title">{t('allArticles')}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <FeaturedCard article={rest[5]}/>
            </div>
            <div className="flex flex-col gap-4">
              {rest.slice(6, 8).map(a => <SmallCard key={a.id} article={a}/>)}
            </div>
          </div>
        </section>
      )}

      {/* ─── SECTION 4: More Articles Grid ────────────────── */}
      {!loading && section3.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-0.5 w-8 bg-gold-500 rounded"/>
            <h2 className="section-title">More Articles</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {section3.map(a => <MediumCard key={a.id} article={a}/>)}
          </div>
        </section>
      )}

      {/* ─── View All Button ───────────────────────────────── */}
      <div className="text-center mt-4">
        <Link to="/articles" className="btn-primary inline-flex items-center gap-2">
          {t('allArticles')}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}
