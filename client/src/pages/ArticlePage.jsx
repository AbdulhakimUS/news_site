import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLang } from '../contexts/LangContext';
import { SmallCard, CardSkeleton } from '../components/ArticleCard';
import { getArticleField, formatDate, getImageUrl } from '../utils/api';

const SectionBlock = ({ title, content }) => {
  if (!content?.trim()) return null;
  return (
    <div className="mb-7">
      <h2 className="font-serif text-xl font-bold text-navy-900 mb-3 border-b border-gold-300/40 pb-2">{title}</h2>
      <p className="text-navy-700 text-sm leading-7 whitespace-pre-line">{content}</p>
    </div>
  );
};

export default function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const [article, setArticle] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchAll = async () => {
      try {
        const [artRes, recRes] = await Promise.all([
          axios.get(`/api/articles/${id}`),
          axios.get(`/api/articles/${id}/recommendations`),
        ]);
        setArticle(artRes.data);
        setRecommendations(recRes.data);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-8 skeleton rounded w-24 mb-8"/>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 skeleton rounded-xl"/>
            <div className="h-8 skeleton rounded w-3/4"/>
            <div className="h-4 skeleton rounded"/>
            <div className="h-4 skeleton rounded w-2/3"/>
          </div>
          <div className="space-y-4">
            {[1,2,3].map(i => <CardSkeleton key={i} variant="small"/>)}
          </div>
        </div>
      </div>
    );
  }

  if (!article) return null;

  const imgUrl = getImageUrl(article.photo_path);
  const title = getArticleField(article, 'title', lang);
  const author = getArticleField(article, 'author_info', lang);
  const abstract = getArticleField(article, 'abstract', lang);
  const keywords = getArticleField(article, 'keywords', lang);
  const intro = getArticleField(article, 'introduction', lang);
  const litReview = getArticleField(article, 'literature_review', lang);
  const methodology = getArticleField(article, 'methodology', lang);
  const analysis = getArticleField(article, 'analysis_results', lang);
  const conclusion = getArticleField(article, 'conclusion', lang);
  const references = getArticleField(article, 'references', lang);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-navy-600 hover:text-gold-600 text-sm font-sans font-medium mb-6 transition-colors group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        {t('back')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Main Content ─────────────────────────────────── */}
        <article className="lg:col-span-2">
          {/* Hero Image */}
          {imgUrl && (
            <div className="rounded-2xl overflow-hidden mb-6 shadow-lg" style={{ maxHeight: '420px' }}>
              <img src={imgUrl} alt={title} className="w-full object-cover" loading="lazy"/>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(article.hashtags || []).map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-navy-900 leading-tight mb-4">{title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-navy-100">
            {author && (
              <span className="text-sm font-sans text-navy-600">
                <span className="text-gold-600 font-semibold">{t('author')}:</span> {author}
              </span>
            )}
            <span className="text-xs text-navy-400 font-sans">
              {t('publishedAt')}: {formatDate(article.created_at, lang)}
            </span>
          </div>

          {/* Abstract */}
          {abstract && (
            <div className="bg-navy-50 border-l-4 border-gold-500 rounded-r-lg p-4 mb-7">
              <h3 className="font-serif font-bold text-navy-800 text-sm uppercase tracking-wider mb-2">{t('abstract')}</h3>
              <p className="text-navy-600 text-sm leading-relaxed">{abstract}</p>
            </div>
          )}

          {/* Keywords */}
          {keywords && (
            <div className="mb-6">
              <span className="text-gold-600 font-sans font-semibold text-sm">{t('keywords')}: </span>
              <span className="text-navy-600 text-sm">{keywords}</span>
            </div>
          )}

          {/* Article Sections */}
          <SectionBlock title={t('introduction')} content={intro}/>
          <SectionBlock title={t('literatureReview')} content={litReview}/>
          <SectionBlock title={t('methodology')} content={methodology}/>
          <SectionBlock title={t('analysisResults')} content={analysis}/>
          <SectionBlock title={t('conclusion')} content={conclusion}/>

          {references && (
            <div className="mt-8 pt-6 border-t border-navy-100">
              <h2 className="font-serif text-lg font-bold text-navy-900 mb-3">{t('references')}</h2>
              <div className="text-navy-600 text-sm leading-7 whitespace-pre-line">{references}</div>
            </div>
          )}
        </article>

        {/* ─── Recommendations Sidebar ──────────────────────── */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-0.5 w-6 bg-gold-500 rounded"/>
              <h3 className="font-serif text-lg font-bold text-navy-900">{t('recommended')}</h3>
            </div>
            <div className="space-y-3">
              {recommendations.length > 0
                ? recommendations.map(a => <SmallCard key={a.id} article={a}/>)
                : (
                  <div className="bg-white rounded-xl border border-navy-100 p-6 text-center">
                    <p className="text-navy-400 text-sm">{t('noArticles')}</p>
                  </div>
                )
              }
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
