import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { useSettings } from '../hooks/useSettings';
import ArticleForm from '../components/ArticleForm';
import { getArticleField, formatDate, getImageUrl } from '../utils/api';

const TAB = { ARTICLES: 'articles', SETTINGS: 'settings' };

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ onConfirm, onCancel, message }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <p className="text-navy-800 text-center font-sans font-medium mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white rounded-lg py-2.5 font-sans font-semibold text-sm hover:bg-red-600 transition-colors">
            O'chirish / Удалить / Delete
          </button>
          <button onClick={onCancel} className="flex-1 btn-ghost">Bekor / Отмена / Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Slide-over Panel ─────────────────────────────────────────────────────────
function SlideOver({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/40" onClick={onClose}/>
      <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 sticky top-0 bg-white z-10">
          <h2 className="font-serif text-lg font-bold text-navy-900">{title}</h2>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="px-6 py-6 flex-1">{children}</div>
      </div>
    </div>
  );
}

// ─── Settings Form ────────────────────────────────────────────────────────────
function SettingsForm() {
  const { t } = useLang();
  const { settings, setSettings } = useSettings();
  const [form, setForm] = useState({ brand_name: '', tg_link: '', insta_link: '', logo_url: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    setForm({
      brand_name: settings.brand_name || '',
      tg_link: settings.tg_link || '',
      insta_link: settings.insta_link || '',
      logo_url: settings.logo_url || '',
    });
    setLogoPreview(settings.logo_url || '');
  }, [settings]);

  const handleLogoFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const fd = new FormData();
      fd.append('brand_name', form.brand_name);
      fd.append('tg_link', form.tg_link);
      fd.append('insta_link', form.insta_link);
      fd.append('logo_url', form.logo_url);
      if (logoFile) fd.append('logo', logoFile);
      const { data } = await axios.put('/api/admin/settings', fd);
      setSettings(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-lg">
      {/* Logo */}
      <div>
        <label className="block text-sm font-sans font-semibold text-navy-700 mb-2">{t('logo')}</label>
        <div className="flex items-center gap-4">
          <div
            onClick={() => fileRef.current.click()}
            className="w-20 h-20 rounded-full border-2 border-dashed border-navy-200 hover:border-gold-500
                       cursor-pointer flex items-center justify-center overflow-hidden transition-all"
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover"/>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            )}
          </div>
          <input type="file" ref={fileRef} onChange={handleLogoFile} accept="image/*" className="hidden"/>
          <div>
            <button type="button" onClick={() => fileRef.current.click()}
              className="btn-ghost text-sm">{t('upload')}</button>
            <p className="text-xs text-navy-400 mt-1">PNG, JPG. Recommended: 200×200px</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-sans font-semibold text-navy-700 mb-2">{t('brandName')}</label>
        <input type="text" value={form.brand_name} onChange={e => setForm({...form, brand_name: e.target.value})}
          className="input-field" placeholder="The Best Generations Journal"/>
      </div>

      <div>
        <label className="block text-sm font-sans font-semibold text-navy-700 mb-2">{t('telegramLink')}</label>
        <input type="url" value={form.tg_link} onChange={e => setForm({...form, tg_link: e.target.value})}
          className="input-field" placeholder="https://t.me/yourchannel"/>
      </div>

      <div>
        <label className="block text-sm font-sans font-semibold text-navy-700 mb-2">{t('instagramLink')}</label>
        <input type="url" value={form.insta_link} onChange={e => setForm({...form, insta_link: e.target.value})}
          className="input-field" placeholder="https://instagram.com/yourprofile"/>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm animate-fade-in">
          ✓ Muvaffaqiyatli saqlandi / Успешно сохранено / Saved successfully!
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-gold w-full justify-center flex items-center gap-2">
        {loading ? (
          <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : null}
        {t('save')}
      </button>
    </form>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const { admin, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [tab, setTab] = useState(TAB.ARTICLES);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [slideOver, setSlideOver] = useState({ open: false, mode: null, article: null });
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (!admin) { navigate('/admin-login'); return; }
    fetchArticles();
  }, [admin]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/articles');
      setArticles(data);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => setSlideOver({ open: true, mode: 'create', article: null });
  const openEdit = (article) => setSlideOver({ open: true, mode: 'edit', article });
  const closeSlide = () => setSlideOver({ open: false, mode: null, article: null });

  const handleCreate = async (fd) => {
    setFormLoading(true);
    try {
      await axios.post('/api/admin/articles', fd);
      await fetchArticles();
      closeSlide();
    } catch { alert('Error creating article'); }
    finally { setFormLoading(false); }
  };

  const handleEdit = async (fd) => {
    setFormLoading(true);
    try {
      await axios.put(`/api/admin/articles/${slideOver.article.id}`, fd);
      await fetchArticles();
      closeSlide();
    } catch { alert('Error updating article'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/articles/${id}`);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch { alert('Error deleting article'); }
    finally { setConfirmDelete(null); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <div className="bg-navy-900 border-b border-navy-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <span className="text-navy-900 font-serif font-bold text-xs">TBG</span>
            </div>
            <span className="font-serif text-gold-300 font-bold text-sm hidden sm:block">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-navy-400 text-xs hidden sm:block">@{admin?.username}</span>
            <button onClick={() => navigate('/')} className="btn-ghost text-xs text-navy-300 border-navy-700">
              ← Site
            </button>
            <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 font-sans transition-colors">
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Jami maqolalar', value: articles.length, icon: '📄' },
            { label: "Bu oy qo'shilgan", value: articles.filter(a => new Date(a.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length, icon: '📅' },
            { label: "Rasmli maqolalar", value: articles.filter(a => a.photo_path).length, icon: '🖼️' },
            { label: 'Teglar', value: [...new Set(articles.flatMap(a => a.hashtags || []))].length, icon: '🏷️' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-navy-100 shadow-sm">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-serif text-2xl font-bold text-navy-900">{stat.value}</div>
              <div className="text-navy-500 text-xs font-sans">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1.5 border border-navy-100 w-fit shadow-sm">
          <button onClick={() => setTab(TAB.ARTICLES)}
            className={`px-5 py-2.5 rounded-lg text-sm font-sans font-semibold transition-all
              ${tab === TAB.ARTICLES ? 'bg-navy-900 text-gold-300' : 'text-navy-500 hover:text-navy-700'}`}>
            📄 {t('articles')}
          </button>
          <button onClick={() => setTab(TAB.SETTINGS)}
            className={`px-5 py-2.5 rounded-lg text-sm font-sans font-semibold transition-all
              ${tab === TAB.SETTINGS ? 'bg-navy-900 text-gold-300' : 'text-navy-500 hover:text-navy-700'}`}>
            ⚙️ {t('settings')}
          </button>
        </div>

        {/* ─── Articles Tab ────────────────────────────── */}
        {tab === TAB.ARTICLES && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl font-bold text-navy-900">{t('articles')}</h2>
              <button onClick={openCreate} className="btn-gold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                {t('addArticle')}
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-xl h-20 skeleton border border-navy-100"/>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-navy-100 p-16 text-center">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-navy-400 mb-4">{t('noArticles')}</p>
                <button onClick={openCreate} className="btn-gold">{t('addArticle')}</button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-navy-100 shadow-sm overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-navy-50 border-b border-navy-100 text-xs font-sans font-semibold text-navy-500 uppercase tracking-wider">
                  <div className="col-span-1">Rasm</div>
                  <div className="col-span-5">Sarlavha / Заголовок / Title</div>
                  <div className="col-span-2">Teglar</div>
                  <div className="col-span-2">Sana</div>
                  <div className="col-span-2 text-right">Amallar</div>
                </div>
                {articles.map((article, i) => {
                  const imgUrl = getImageUrl(article.photo_path);
                  const title = article.title_uz || article.title_en || article.title_ru || '—';
                  return (
                    <div key={article.id}
                      className={`grid grid-cols-12 gap-3 px-4 py-3 items-center border-b border-navy-50
                        hover:bg-gold-500/5 transition-colors last:border-0 ${i % 2 === 0 ? '' : 'bg-navy-50/30'}`}
                    >
                      <div className="col-span-1">
                        {imgUrl ? (
                          <img src={imgUrl} alt="" className="w-10 h-10 rounded-lg object-cover"/>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="21 15 16 10 5 21"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="col-span-5">
                        <p className="font-sans font-medium text-navy-800 text-sm line-clamp-1">{title}</p>
                        <p className="text-navy-400 text-xs mt-0.5 line-clamp-1">{article.author_info_uz || article.author_info_en || ''}</p>
                      </div>
                      <div className="col-span-2">
                        <div className="flex flex-wrap gap-1">
                          {(article.hashtags || []).slice(0, 2).map(tag => (
                            <span key={tag} className="tag text-xs">#{tag}</span>
                          ))}
                          {(article.hashtags || []).length > 2 && (
                            <span className="text-navy-400 text-xs">+{article.hashtags.length - 2}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-navy-400 text-xs">{formatDate(article.created_at, 'uz')}</p>
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(article)}
                          className="p-1.5 text-navy-500 hover:text-navy-800 hover:bg-navy-100 rounded transition-all"
                          title={t('editArticle')}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button onClick={() => setConfirmDelete(article.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          title={t('deleteArticle')}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── Settings Tab ────────────────────────────── */}
        {tab === TAB.SETTINGS && (
          <div>
            <h2 className="font-serif text-xl font-bold text-navy-900 mb-5">{t('settings')}</h2>
            <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6">
              <SettingsForm/>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over for article form */}
      <SlideOver
        open={slideOver.open}
        onClose={closeSlide}
        title={slideOver.mode === 'create' ? t('addArticle') : t('editArticle')}
      >
        <ArticleForm
          article={slideOver.article}
          onSubmit={slideOver.mode === 'create' ? handleCreate : handleEdit}
          onCancel={closeSlide}
          loading={formLoading}
        />
      </SlideOver>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <ConfirmModal
          message={t('deleteConfirm')}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
