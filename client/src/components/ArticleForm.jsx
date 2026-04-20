import { useState, useEffect, useRef } from 'react';
import { useLang } from '../contexts/LangContext';

const LANGS = ['uz', 'ru', 'en'];
const LANG_LABELS = { uz: 'O\'zbek', ru: 'Русский', en: 'English' };

const FIELDS = [
  { key: 'title', label: { uz: 'Sarlavha', ru: 'Заголовок', en: 'Title' }, type: 'input' },
  { key: 'author_info', label: { uz: 'Muallif ma\'lumoti', ru: 'Информация об авторе', en: 'Author Info' }, type: 'input' },
  { key: 'keywords', label: { uz: 'Kalit so\'zlar', ru: 'Ключевые слова', en: 'Keywords' }, type: 'input' },
  { key: 'abstract', label: { uz: 'Annotatsiya', ru: 'Аннотация', en: 'Abstract' }, type: 'textarea', rows: 3 },
  { key: 'introduction', label: { uz: 'Kirish', ru: 'Введение', en: 'Introduction' }, type: 'textarea', rows: 4 },
  { key: 'literature_review', label: { uz: 'Adabiyotlar tahlili', ru: 'Обзор литературы', en: 'Literature Review' }, type: 'textarea', rows: 4 },
  { key: 'methodology', label: { uz: 'Metodologiya', ru: 'Методология', en: 'Methodology' }, type: 'textarea', rows: 4 },
  { key: 'analysis_results', label: { uz: 'Tahlil natijalari', ru: 'Результаты анализа', en: 'Analysis Results' }, type: 'textarea', rows: 4 },
  { key: 'conclusion', label: { uz: 'Xulosa', ru: 'Заключение', en: 'Conclusion' }, type: 'textarea', rows: 4 },
  { key: 'references', label: { uz: 'Adabiyotlar ro\'yxati', ru: 'Список литературы', en: 'References' }, type: 'textarea', rows: 3 },
];

const initFormData = (article) => {
  const data = { hashtags: '', photo: null };
  LANGS.forEach(l => {
    FIELDS.forEach(f => {
      data[`${f.key}_${l}`] = article?.[`${f.key}_${l}`] || '';
    });
  });
  if (article?.hashtags) {
    data.hashtags = Array.isArray(article.hashtags)
      ? article.hashtags.join(', ')
      : article.hashtags;
  }
  return data;
};

export default function ArticleForm({ article, onSubmit, onCancel, loading }) {
  const { t } = useLang();
  const [activeLang, setActiveLang] = useState('uz');
  const [formData, setFormData] = useState(() => initFormData(article));
  const [previewUrl, setPreviewUrl] = useState(article?.photo_path || '');
  const fileRef = useRef();

  useEffect(() => {
    setFormData(initFormData(article));
    setPreviewUrl(article?.photo_path || '');
  }, [article]);

  const handleChange = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleChange('photo', file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('hashtags', formData.hashtags);
    if (formData.photo) fd.append('photo', formData.photo);
    LANGS.forEach(l => {
      FIELDS.forEach(f => {
        fd.append(`${f.key}_${l}`, formData[`${f.key}_${l}`] || '');
      });
    });
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-sans font-semibold text-navy-700 mb-2">{t('photo')}</label>
        <div className="flex items-start gap-4">
          <div
            onClick={() => fileRef.current.click()}
            className="w-36 h-28 rounded-xl border-2 border-dashed border-navy-200 hover:border-gold-500
                       cursor-pointer flex items-center justify-center overflow-hidden transition-all group"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover"/>
            ) : (
              <div className="text-center text-navy-400 group-hover:text-gold-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span className="text-xs">{t('upload')}</span>
              </div>
            )}
          </div>
          <input type="file" ref={fileRef} onChange={handleFile} accept="image/*" className="hidden"/>
          <div className="flex-1">
            <p className="text-xs text-navy-400 mb-2">JPG, PNG, WebP. Max 5MB.</p>
            {previewUrl && (
              <button type="button" onClick={() => { setPreviewUrl(''); handleChange('photo', null); }}
                className="text-xs text-red-500 hover:text-red-700 transition-colors">
                Rasmni o'chirish / Удалить фото / Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hashtags */}
      <div>
        <label className="block text-sm font-sans font-semibold text-navy-700 mb-2">{t('hashtags')}</label>
        <input
          type="text"
          value={formData.hashtags}
          onChange={e => handleChange('hashtags', e.target.value)}
          className="input-field"
          placeholder="ilm, tadqiqot, huquq, iqtisod"
        />
        <p className="text-xs text-navy-400 mt-1">Vergul bilan ajrating / Через запятую / Comma separated</p>
      </div>

      {/* Language Tabs */}
      <div>
        <div className="flex gap-1 mb-5 bg-navy-50 p-1 rounded-xl w-fit border border-navy-200">
          {LANGS.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setActiveLang(l)}
              className={`px-5 py-2 rounded-lg text-sm font-sans font-semibold transition-all
                ${activeLang === l
                  ? 'bg-navy-900 text-gold-300 shadow-sm'
                  : 'text-navy-500 hover:text-navy-700'}`}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>

        {/* Fields for active language */}
        <div className="space-y-4">
          {FIELDS.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-sans font-semibold text-navy-700 mb-1.5">
                {field.label[activeLang]}
              </label>
              {field.type === 'input' ? (
                <input
                  type="text"
                  value={formData[`${field.key}_${activeLang}`] || ''}
                  onChange={e => handleChange(`${field.key}_${activeLang}`, e.target.value)}
                  className="input-field"
                />
              ) : (
                <textarea
                  rows={field.rows || 3}
                  value={formData[`${field.key}_${activeLang}`] || ''}
                  onChange={e => handleChange(`${field.key}_${activeLang}`, e.target.value)}
                  className="textarea-field"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-navy-100 sticky bottom-0 bg-white pb-2">
        <button type="submit" disabled={loading}
          className="btn-gold flex items-center gap-2 flex-1 justify-center">
          {loading ? (
            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
          )}
          {t('save')}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">{t('cancel')}</button>
      </div>
    </form>
  );
}
