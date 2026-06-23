import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import LadiesPage from './pages/LadiesPage';
import LadyDetailPage from './pages/LadyDetailPage';
import WorkPage from './pages/WorkPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { Spinner } from './components/ui';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0F0A1E] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mx-auto mb-3 animate-pulse">
          <span className="text-white font-bold">LW</span>
        </div>
        <Spinner size={24} />
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/ladies" element={<ProtectedRoute><Layout><LadiesPage /></Layout></ProtectedRoute>} />
      <Route path="/ladies/:id" element={<ProtectedRoute><Layout><LadyDetailPage /></Layout></ProtectedRoute>} />
      <Route path="/work" element={<ProtectedRoute><Layout><WorkPage /></Layout></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><Layout><PaymentsPage /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Layout><ReportsPage /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(15, 10, 30, 0.95)',
              color: '#e2e8f0',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
