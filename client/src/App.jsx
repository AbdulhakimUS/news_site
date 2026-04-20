import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './contexts/LangContext';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './hooks/useSettings';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import ArticlesPage from './pages/ArticlesPage';
import AboutPage from './pages/AboutPage';
import SearchPage from './pages/SearchPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      <main className="flex-1">
        {children}
      </main>
      <Footer/>
    </div>
  );
}

function AdminLayout({ children }) {
  return <div className="min-h-screen">{children}</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LangProvider>
          <SettingsProvider>
            <Routes>
              {/* Public pages with layout */}
              <Route path="/" element={<Layout><HomePage/></Layout>}/>
              <Route path="/articles" element={<Layout><ArticlesPage/></Layout>}/>
              <Route path="/article/:id" element={<Layout><ArticlePage/></Layout>}/>
              <Route path="/about" element={<Layout><AboutPage/></Layout>}/>
              <Route path="/search" element={<Layout><SearchPage/></Layout>}/>

              {/* Admin - no public layout */}
              <Route path="/admin-login" element={<AdminLoginPage/>}/>
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPage/>
                </ProtectedRoute>
              }/>
            </Routes>
          </SettingsProvider>
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
