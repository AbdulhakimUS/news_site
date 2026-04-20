import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tbgj_token');
    const username = localStorage.getItem('tbgj_username');
    if (token && username) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAdmin({ username, token });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const { data } = await axios.post('/api/admin/login', { username, password });
    localStorage.setItem('tbgj_token', data.token);
    localStorage.setItem('tbgj_username', data.username);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setAdmin({ username: data.username, token: data.token });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('tbgj_token');
    localStorage.removeItem('tbgj_username');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
