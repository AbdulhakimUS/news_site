import axios from 'axios';

const BASE_URL = import.meta.env.PROD 
  ? 'https://news-site-s8i0.onrender.com' 
  : '';

export const api = axios.create({ baseURL: BASE_URL });

axios.defaults.baseURL = BASE_URL;

export const getArticleField = (article, field, lang) => {
  return article?.[`${field}_${lang}`] || article?.[`${field}_en`] || article?.[`${field}_uz`] || '';
};

export const formatDate = (dateStr, lang = 'uz') => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const localeMap = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };
  try {
    return date.toLocaleDateString(localeMap[lang] || 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch {
    return date.toLocaleDateString();
  }
};

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `https://news-site-s8i0.onrender.com${path}`;
};