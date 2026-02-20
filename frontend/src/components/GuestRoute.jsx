import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * GuestRoute — the inverse of ProtectedRoute.
 * If the user IS authenticated, redirect them to /dashboard instead
 * of showing login/register/landing pages.
 */
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
