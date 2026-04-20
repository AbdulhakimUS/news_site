import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useSettings } from '../hooks/useSettings';

const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.61c-.15.668-.543.83-1.1.516l-3-2.21-1.448 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 14.4l-2.95-.92c-.641-.2-.653-.641.136-.948l11.527-4.445c.535-.194 1.003.13.761.16z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

export default function Footer() {
  const { t } = useLang();
  const { settings } = useSettings();

  return (
    <footer className="bg-navy-950 border-t border-navy-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {settings.tg_link && (
              <a href={settings.tg_link} target="_blank" rel="noopener noreferrer"
                className="text-navy-300 hover:text-gold-400 transition-colors">
                <TelegramIcon/>
              </a>
            )}
            {settings.insta_link && (
              <a href={settings.insta_link} target="_blank" rel="noopener noreferrer"
                className="text-navy-300 hover:text-gold-400 transition-colors">
                <InstagramIcon/>
              </a>
            )}
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-navy-300 hover:text-gold-300 text-sm font-sans transition-colors">{t('home')}</Link>
            <Link to="/about" className="text-navy-300 hover:text-gold-300 text-sm font-sans transition-colors">{t('about')}</Link>
            <Link to="/articles" className="text-navy-300 hover:text-gold-300 text-sm font-sans transition-colors">{t('news')}</Link>
          </div>

          {/* Social & Globe icons */}
          <div className="flex items-center gap-3">
            <Link to="/admin-login" className="text-navy-600 hover:text-navy-400 text-xs transition-colors">
              Admin
            </Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-navy-800 text-center">
          <p className="text-navy-500 text-xs font-sans">
            © {new Date().getFullYear()} {settings.brand_name || 'The Best Generations Journal'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
