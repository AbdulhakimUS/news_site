import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLang } from '../contexts/LangContext';
import { useSettings } from '../hooks/useSettings';

export default function AboutPage() {
  const { t, lang } = useLang();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [about, setAbout] = useState(null);

  useEffect(() => {
    axios.get('/api/about').then(r => setAbout(r.data)).catch(() => {});
  }, []);

  if (!about) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="h-64 skeleton rounded-2xl"/>
    </div>
  );

  const title = about[`title_${lang}`] || about.title_en || '';
  const body = about[`body_${lang}`] || about.body_en || '';
  const contacts = about.contacts || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-navy-600 hover:text-gold-600 text-sm font-sans font-medium mb-6 transition-colors group">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        {t('back')}
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-navy-100 overflow-hidden">
        <div className="bg-navy-900 px-8 py-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500 rounded-full -translate-y-32 translate-x-32"/>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-300 rounded-full translate-y-24 -translate-x-24"/>
          </div>
          {settings.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="h-20 w-20 rounded-full object-cover mx-auto mb-4 ring-4 ring-gold-500/40"/>
          ) : (
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4 ring-4 ring-gold-500/40">
              <span className="text-navy-900 font-serif font-bold text-2xl">TBG</span>
            </div>
          )}
          <h1 className="font-serif text-3xl text-white font-bold">{settings.brand_name}</h1>
          <div className="h-0.5 w-16 bg-gold-500 mx-auto mt-4"/>
        </div>

        <div className="px-8 py-10">
          {title && <h2 className="font-serif text-2xl font-bold text-navy-900 mb-6">{title}</h2>}
          {body && <div className="text-navy-700 leading-8 whitespace-pre-line font-sans text-base mb-10">{body}</div>}

          {contacts.length > 0 && (
            <div className="mt-6 pt-8 border-t border-navy-100">
              <h3 className="font-serif text-lg font-bold text-navy-900 mb-4">Aloqa / Контакты / Contact</h3>
              <div className="flex flex-wrap gap-3">
                {contacts.map((c, i) => (
                  <a key={i} href={c.url} target="_blank" rel="noopener noreferrer"
                    className="btn-primary text-sm inline-flex items-center gap-2">
                    {c.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
