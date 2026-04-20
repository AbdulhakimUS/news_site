import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-navy-400 text-sm font-sans">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) return <Navigate to="/admin-login" replace/>;
  return children;
}
