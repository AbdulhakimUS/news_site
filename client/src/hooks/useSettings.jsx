import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const SettingsContext = createContext({});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    brand_name: 'The Best Generations Journal',
    logo_url: '',
    tg_link: '',
    insta_link: '',
  });

  useEffect(() => {
    axios.get('/api/settings').then(r => setSettings(r.data)).catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
