import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import PageTransition from './components/PageTransition';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import VolunteersPage from './pages/VolunteersPage';
import ZonesPage from './pages/ZonesPage';
import DeploymentConsole from './pages/DeploymentConsole';
import ShiftsPage from './pages/ShiftsPage';
import IncidentCenter from './pages/IncidentCenter';
import ReportsPage from './pages/ReportsPage';
import VolunteerPortal from './pages/VolunteerPortal';

function AdminLayout({ children }) {
  const location = useLocation();
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <PageTransition keyProp={location.pathname}>
          {children}
        </PageTransition>
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/register" element={<AdminRegisterPage />} />

      {/* Admin / Coordinator */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute roles={['ADMIN', 'COORDINATOR']}>
          <AdminLayout><AdminDashboard /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/volunteers" element={
        <ProtectedRoute roles={['ADMIN', 'COORDINATOR']}>
          <AdminLayout><VolunteersPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/zones" element={
        <ProtectedRoute roles={['ADMIN', 'COORDINATOR']}>
          <AdminLayout><ZonesPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/deployment" element={
        <ProtectedRoute roles={['ADMIN', 'COORDINATOR']}>
          <AdminLayout><DeploymentConsole /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/shifts" element={
        <ProtectedRoute roles={['ADMIN', 'COORDINATOR']}>
          <AdminLayout><ShiftsPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/incidents" element={
        <ProtectedRoute roles={['ADMIN', 'COORDINATOR']}>
          <AdminLayout><IncidentCenter /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute roles={['ADMIN', 'COORDINATOR']}>
          <AdminLayout><ReportsPage /></AdminLayout>
        </ProtectedRoute>
      } />

      {/* Volunteer */}
      <Route path="/volunteer/portal" element={
        <ProtectedRoute roles={['VOLUNTEER']}>
          <AdminLayout><VolunteerPortal /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/volunteer/shifts" element={
        <ProtectedRoute roles={['VOLUNTEER']}>
          <AdminLayout><ShiftsPage /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/volunteer/profile" element={
        <ProtectedRoute roles={['VOLUNTEER']}>
          <AdminLayout><VolunteerPortal /></AdminLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'white',
              color: '#1E293B',
              borderRadius: '12px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
              border: '1px solid #E2E8F0',
              padding: '14px 18px',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
