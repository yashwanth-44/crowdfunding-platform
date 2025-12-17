import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/auth';
import './styles/globals.css';

// Layouts
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import HomePage from './pages/Home';
import LoginPage from './pages/auth/Login';
import SignupPage from './pages/auth/Signup';
import CampaignsPage from './pages/campaigns/Campaigns';
import CampaignDetailPage from './pages/campaigns/CampaignDetail';
import CreateCampaignPage from './pages/campaigns/CreateCampaign';
import LoansPage from './pages/loans/Loans';
import LoanDetailPage from './pages/loans/LoanDetail';
import CreateLoanPage from './pages/loans/CreateLoan';
import DashboardPage from './pages/Dashboard';
import AdminDashboardPage from './pages/admin/Dashboard';
import ProfilePage from './pages/profile/Profile';
import NotFoundPage from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasRole = useAuthStore((state) => state.hasRole);

  if (!isAuthenticated || !hasRole('ADMIN')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  useEffect(() => {
    // Try to restore user session
    fetchProfile().catch(() => {
      // User not authenticated
    });
  }, [fetchProfile]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<HomePage />} />

          {/* Protected routes with layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Campaigns */}
          <Route
            path="/campaigns"
            element={
              <AppLayout>
                <CampaignsPage />
              </AppLayout>
            }
          />
          <Route
            path="/campaigns/:id"
            element={
              <AppLayout>
                <CampaignDetailPage />
              </AppLayout>
            }
          />
          <Route
            path="/campaigns/create"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CreateCampaignPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Loans */}
          <Route
            path="/loans"
            element={
              <AppLayout>
                <LoansPage />
              </AppLayout>
            }
          />
          <Route
            path="/loans/:id"
            element={
              <AppLayout>
                <LoanDetailPage />
              </AppLayout>
            }
          />
          <Route
            path="/loans/create"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CreateLoanPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AppLayout>
                  <AdminDashboardPage />
                </AppLayout>
              </AdminRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
