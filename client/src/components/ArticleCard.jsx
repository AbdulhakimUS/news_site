import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { getArticleField, formatDate, getImageUrl } from '../utils/api';

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10"/>
  </svg>
);

const NoImagePlaceholder = ({ size = 'normal' }) => (
  <div className={`w-full ${size === 'small' ? 'h-20' : 'h-48'} bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center`}>
    <div className="text-center text-navy-400">
      <svg xmlns="http://www.w3.org/2000/svg" className={`${size === 'small' ? 'w-6 h-6' : 'w-10 h-10'} mx-auto mb-1 opacity-50`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      {size !== 'small' && <p className="text-xs">No Image</p>}
    </div>
  </div>
);

// Large featured card (top slot)
export function FeaturedCard({ article }) {
  const { lang, t } = useLang();
  if (!article) return null;

  const title = getArticleField(article, 'title', lang);
  const abstract = getArticleField(article, 'abstract', lang);
  const author = getArticleField(article, 'author_info', lang);
  const imgUrl = getImageUrl(article.photo_path);

  return (
    <div className="featured-card animate-fade-in">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="md:w-2/5 relative overflow-hidden" style={{ minHeight: '260px' }}>
          {imgUrl ? (
            <img
              src={imgUrl} alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div className={`w-full h-full min-h-[260px] bg-gradient-to-br from-navy-700 to-navy-900 ${imgUrl ? 'hidden' : 'flex'} items-center justify-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-navy-900/60 to-transparent"/>
        </div>

        {/* Content */}
        <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(article.hashtags || []).slice(0, 3).map(tag => (
                <span key={tag} className="tag text-gold-300 bg-gold-500/10 border-gold-500/20">#{tag}</span>
              ))}
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-white font-bold mb-3 leading-tight">{title}</h2>
            <p className="text-navy-200 text-sm leading-relaxed line-clamp-4">{abstract}</p>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div>
              {author && <p className="text-gold-400 text-xs font-sans">{author}</p>}
              <p className="text-navy-400 text-xs mt-0.5">{formatDate(article.created_at, lang)}</p>
            </div>
            <Link to={`/article/${article.id}`} className="more-info-btn">
              {t('moreInfo')} <ArrowIcon/>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Medium card (secondary grid)
export function MediumCard({ article }) {
  const { lang, t } = useLang();
  const title = getArticleField(article, 'title', lang);
  const abstract = getArticleField(article, 'abstract', lang);
  const imgUrl = getImageUrl(article.photo_path);

  return (
    <div className="card-article animate-fade-in">
      <div className="relative overflow-hidden" style={{ height: '180px' }}>
        {imgUrl ? (
          <img src={imgUrl} alt={title} className="w-full h-full object-cover" loading="lazy"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
          />
        ) : null}
        <div className={`w-full h-full ${imgUrl ? 'hidden' : 'block'}`}>
          <NoImagePlaceholder/>
        </div>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-1 mb-2">
          {(article.hashtags || []).slice(0, 2).map(tag => (
            <span key={tag} className="tag text-xs">#{tag}</span>
          ))}
        </div>
        <h3 className="font-serif text-navy-900 font-bold text-base leading-snug line-clamp-2 mb-2">{title}</h3>
        <p className="text-navy-500 text-xs leading-relaxed line-clamp-3 mb-4">{abstract}</p>
        <Link to={`/article/${article.id}`}
          className="more-info-btn text-xs w-full justify-center">
          {t('moreInfo')} <ArrowIcon/>
        </Link>
      </div>
    </div>
  );
}

// Small horizontal card (sidebar / recommendations)
export function SmallCard({ article }) {
  const { lang, t } = useLang();
  const title = getArticleField(article, 'title', lang);
  const abstract = getArticleField(article, 'abstract', lang);
  const imgUrl = getImageUrl(article.photo_path);

  return (
    <Link to={`/article/${article.id}`}
      className="card-article flex gap-3 p-3 hover:bg-navy-50 group"
    >
      <div className="w-20 flex-shrink-0 rounded-lg overflow-hidden">
        {imgUrl ? (
          <img src={imgUrl} alt={title} className="w-full h-16 object-cover" loading="lazy"/>
        ) : (
          <div className="w-full h-16 bg-navy-100 flex items-center justify-center rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-serif text-navy-900 font-semibold text-sm leading-snug line-clamp-2 group-hover:text-navy-600 transition-colors">{title}</h4>
        <p className="text-navy-400 text-xs mt-1 line-clamp-2">{abstract}</p>
        <span className="text-gold-600 text-xs font-sans font-semibold mt-1 inline-flex items-center gap-1">
          {t('moreInfo')} <ArrowIcon/>
        </span>
      </div>
    </Link>
  );
}

// Skeleton loader
export function CardSkeleton({ variant = 'medium' }) {
  if (variant === 'small') {
    return (
      <div className="flex gap-3 p-3">
        <div className="w-20 h-16 skeleton rounded-lg"/>
        <div className="flex-1 space-y-2">
          <div className="h-3 skeleton rounded w-3/4"/>
          <div className="h-3 skeleton rounded w-full"/>
          <div className="h-3 skeleton rounded w-1/2"/>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-navy-100">
      <div className="h-44 skeleton"/>
      <div className="p-4 space-y-2">
        <div className="h-4 skeleton rounded w-3/4"/>
        <div className="h-3 skeleton rounded w-full"/>
        <div className="h-3 skeleton rounded w-2/3"/>
      </div>
    </div>
  );
}
