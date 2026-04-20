import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useSettings } from '../hooks/useSettings';

export default function AboutPage() {
  const { t, lang } = useLang();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const content = {
    uz: {
      title: 'Jurnal Haqida',
      body: `"The Best Generations Journal" — ilmiy va ta'limiy maqolalar uchun zamonaviy platforma. Biz o'zbek, rus va ingliz tillarida yuqori sifatli ilmiy tadqiqotlarni nashr etamiz.\n\nJurnalimiz maqsadi — yosh olimlar va mutaxassislarga o'z ilmiy ishlarini dunyo jamoatchiligiga taqdim etish imkoniyatini berish.\n\nBiz quyidagi yo'nalishlar bo'yicha maqolalar qabul qilamiz:\n• Huquq va yuridik fanlar\n• Iqtisodiyot va biznes\n• Ta'lim va pedagogika\n• Ijtimoiy fanlar\n• Gumanitar fanlar`,
    },
    ru: {
      title: 'О журнале',
      body: `"The Best Generations Journal" — современная платформа для научных и образовательных статей. Мы публикуем высококачественные научные исследования на узбекском, русском и английском языках.\n\nЦель нашего журнала — предоставить молодым учёным и специалистам возможность представить свои научные работы мировому сообществу.\n\nМы принимаем статьи по следующим направлениям:\n• Право и юридические науки\n• Экономика и бизнес\n• Образование и педагогика\n• Социальные науки\n• Гуманитарные науки`,
    },
    en: {
      title: 'About the Journal',
      body: `"The Best Generations Journal" is a modern platform for scientific and educational articles. We publish high-quality scientific research in Uzbek, Russian, and English.\n\nOur journal's goal is to give young scientists and professionals the opportunity to present their scientific work to the global community.\n\nWe accept articles in the following areas:\n• Law and Legal Sciences\n• Economics and Business\n• Education and Pedagogy\n• Social Sciences\n• Humanities`,
    },
  };

  const c = content[lang] || content.en;

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
        {/* Header */}
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

        {/* Content */}
        <div className="px-8 py-10">
          <h2 className="font-serif text-2xl font-bold text-navy-900 mb-6">{c.title}</h2>
          <div className="text-navy-700 leading-8 whitespace-pre-line font-sans text-base">{c.body}</div>

          {/* Contact */}
          <div className="mt-10 pt-8 border-t border-navy-100">
            <h3 className="font-serif text-lg font-bold text-navy-900 mb-4">Aloqa / Контакты / Contact</h3>
            <div className="flex flex-wrap gap-4">
              {settings.tg_link && (
                <a href={settings.tg_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 btn-primary text-sm">
                  Telegram
                </a>
              )}
              {settings.insta_link && (
                <a href={settings.insta_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 btn-ghost text-sm">
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
