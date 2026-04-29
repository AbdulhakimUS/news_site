import { useState, useEffect } from 'react';
import axios from 'axios';

const LANGS = ['uz', 'ru', 'en'];
const LANG_LABELS = { uz: "O'zbek", ru: 'Русский', en: 'English' };

export default function AboutEditor() {
  const [activeLang, setActiveLang] = useState('uz');
  const [form, setForm] = useState({
    title_uz: '', title_ru: '', title_en: '',
    body_uz: '', body_ru: '', body_en: '',
    contacts: []
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    axios.get('/api/about').then(r => {
      setForm({ ...r.data, contacts: r.data.contacts || [] });
    }).catch(() => {});
  }, []);

  const addContact = () => {
    setForm(prev => ({ ...prev, contacts: [...prev.contacts, { name: '', url: '' }] }));
  };

  const removeContact = (i) => {
    setForm(prev => ({ ...prev, contacts: prev.contacts.filter((_, idx) => idx !== i) }));
  };

  const updateContact = (i, field, value) => {
    setForm(prev => {
      const contacts = [...prev.contacts];
      contacts[i] = { ...contacts[i], [field]: value };
      return { ...prev, contacts };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      await axios.put('/api/admin/about', form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch { alert('Xato!'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Language Tabs */}
      <div className="flex gap-1 bg-navy-50 p-1 rounded-xl w-fit border border-navy-200">
        {LANGS.map(l => (
          <button key={l} type="button" onClick={() => setActiveLang(l)}
            className={`px-5 py-2 rounded-lg text-sm font-sans font-semibold transition-all
              ${activeLang === l ? 'bg-navy-900 text-gold-300 shadow-sm' : 'text-navy-500 hover:text-navy-700'}`}>
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-sans font-semibold text-navy-700 mb-2">Sarlavha / Заголовок / Title</label>
        <input type="text" value={form[`title_${activeLang}`] || ''}
          onChange={e => setForm(prev => ({ ...prev, [`title_${activeLang}`]: e.target.value }))}
          className="input-field" placeholder="Jurnal Haqida"/>
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-sans font-semibold text-navy-700 mb-2">Matn / Текст / Body</label>
        <textarea rows={10} value={form[`body_${activeLang}`] || ''}
          onChange={e => setForm(prev => ({ ...prev, [`body_${activeLang}`]: e.target.value }))}
          className="textarea-field" placeholder="Jurnal haqida ma'lumot..."/>
      </div>

      {/* Contacts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-sans font-semibold text-navy-700">
            Kontaktlar / Контакты / Contacts
          </label>
          <button onClick={addContact} type="button"
            className="btn-gold text-xs flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Qo'shish
          </button>
        </div>
        <div className="space-y-3">
          {form.contacts.map((c, i) => (
            <div key={i} className="flex gap-3 items-center bg-navy-50 rounded-xl p-3 border border-navy-100">
              <input type="text" value={c.name} onChange={e => updateContact(i, 'name', e.target.value)}
                className="input-field flex-1" placeholder="Telegram, Instagram, Email..."/>
              <input type="url" value={c.url} onChange={e => updateContact(i, 'url', e.target.value)}
                className="input-field flex-1" placeholder="https://..."/>
              <button onClick={() => removeContact(i)} type="button"
                className="text-red-400 hover:text-red-600 transition-colors p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          ))}
          {form.contacts.length === 0 && (
            <p className="text-navy-400 text-sm text-center py-4 bg-navy-50 rounded-xl border border-dashed border-navy-200">
              Hech qanday kontakt yo'q. "Qo'shish" tugmasini bosing.
            </p>
          )}
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm animate-fade-in">
          ✓ Muvaffaqiyatli saqlandi!
        </div>
      )}

      <button onClick={handleSave} disabled={loading}
        className="btn-gold w-full justify-center flex items-center gap-2">
        {loading ? (
          <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : null}
        Saqlash
      </button>
    </div>
  );
}
