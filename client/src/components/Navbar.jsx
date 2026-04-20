import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useSettings } from '../hooks/useSettings';

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const MenuIcon = ({ open }) => open ? (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const { settings } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const langs = ['uz', 'ru', 'en'];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-navy-900 shadow-xl sticky top-0 z-50 border-b border-gold-600/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setMenuOpen(false)}>
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-10 w-10 rounded-full object-cover ring-2 ring-gold-500/30"/>
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center ring-2 ring-gold-500/30">
                <span className="text-navy-900 font-serif font-bold text-sm">TBG</span>
              </div>
            )}
            <span className="font-serif text-gold-300 font-bold text-sm md:text-base leading-tight hidden sm:block group-hover:text-gold-200 transition-colors">
              {settings.brand_name || 'The Best Generations Journal'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            <Link to="/" className="nav-link">{t('home')}</Link>
            <Link to="/about" className="nav-link">{t('about')}</Link>
            <Link to="/articles" className="nav-link">{t('news')}</Link>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-navy-200 hover:text-gold-300 transition-colors p-2 rounded"
            >
              <SearchIcon/>
            </button>

            {/* Lang switcher */}
            <div className="flex items-center gap-1 bg-navy-800 rounded-lg px-1 py-1 border border-navy-700">
              <GlobeIcon/>
              {langs.map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-xs font-sans font-semibold px-2 py-1 rounded transition-all
                    ${lang === l ? 'bg-gold-500 text-navy-950' : 'text-navy-200 hover:text-gold-300'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-navy-200 hover:text-gold-300 transition-colors p-2"
            >
              <MenuIcon open={menuOpen}/>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-3 animate-slide-up">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('search')}
                className="flex-1 input-field"
                autoFocus
              />
              <button type="submit" className="btn-gold">
                <SearchIcon/>
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-navy-700 pt-3 animate-slide-up">
            <div className="flex flex-col gap-3">
              <Link to="/" className="nav-link py-1" onClick={() => setMenuOpen(false)}>{t('home')}</Link>
              <Link to="/about" className="nav-link py-1" onClick={() => setMenuOpen(false)}>{t('about')}</Link>
              <Link to="/articles" className="nav-link py-1" onClick={() => setMenuOpen(false)}>{t('news')}</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
