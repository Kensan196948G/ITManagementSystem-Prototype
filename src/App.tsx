import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth, ProtectedRoute } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './components/dashboard/Dashboard';
import Layout from './components/Layout';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';

// Import actual components
import IncidentManagement from './pages/IncidentManagement';
import ProblemManagement from './pages/ProblemManagement';

// Import new incident pages
import ActiveIncidents from './pages/incidents/ActiveIncidents';
import ResolvedIncidents from './pages/incidents/ResolvedIncidents';
import CreateIncident from './pages/incidents/CreateIncident';
import SLAMonitoring from './pages/incidents/SLAMonitoring';

// Import new problem pages
import RootCauseAnalysis from './pages/problems/RootCauseAnalysis';
import Workarounds from './pages/problems/Workarounds';

// Import new change pages
import RFCManagement from './pages/changes/RFCManagement';
import CABMeetings from './pages/changes/CABMeetings';
import ChangeSchedule from './pages/changes/ChangeSchedule';
import RiskAssessment from './pages/changes/RiskAssessment';

// Import configuration pages
import CMDB from './pages/configuration/CMDB';
import AssetManagement from './pages/configuration/AssetManagement';
import CIRelationships from './pages/configuration/CIRelationships';

// Import release pages
import ReleasePlanning from './pages/release/ReleasePlanning';
import ReleaseTesting from './pages/release/ReleaseTesting';
import ReleaseDeployment from './pages/release/ReleaseDeployment';

// Import service catalog pages
import Services from './pages/catalog/Services';
import SLAs from './pages/catalog/SLAs';
import OLAs from './pages/catalog/OLAs';

// Import report pages
import PerformanceReports from './pages/reports/PerformanceReports';
import ComplianceReports from './pages/reports/ComplianceReports';
import CustomReports from './pages/reports/CustomReports';

// Import settings pages
import GeneralSettings from './pages/settings/GeneralSettings';
import SecuritySettings from './pages/settings/SecuritySettings';
import NotificationSettings from './pages/settings/NotificationSettings';
import IntegrationsSettings from './pages/settings/IntegrationsSettings';

const ChangeManagement = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-6">変更管理</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">変更管理機能をここに実装予定です。</p>
    </div>
  </div>
);

const UserManagement = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-6">ユーザー管理</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">ユーザー管理機能をここに実装予定です。</p>
    </div>
  </div>
);

// Settings component removed - using dedicated settings pages instead

// Route guard component that handles authentication redirects
const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted location for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } 
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <RouteGuard>
            <Dashboard />
          </RouteGuard>
        }
      />

      <Route
        path="/analytics"
        element={
          <RouteGuard>
            <Analytics />
          </RouteGuard>
        }
      />

      <Route
        path="/reports"
        element={
          <RouteGuard>
            <Reports />
          </RouteGuard>
        }
      />

      <Route
        path="/incidents/*"
        element={
          <RouteGuard>
            <IncidentManagement />
          </RouteGuard>
        }
      />

      <Route
        path="/problems/*"
        element={
          <RouteGuard>
            <ProblemManagement />
          </RouteGuard>
        }
      />

      <Route
        path="/changes"
        element={
          <RouteGuard>
            <ProtectedRoute requiredPermissions={['changes.view']}>
              <ChangeManagement />
            </ProtectedRoute>
          </RouteGuard>
        }
      />

      {/* New incident routes */}
      <Route
        path="/incidents/active"
        element={
          <RouteGuard>
            <ActiveIncidents />
          </RouteGuard>
        }
      />

      <Route
        path="/incidents/resolved"
        element={
          <RouteGuard>
            <ResolvedIncidents />
          </RouteGuard>
        }
      />

      <Route
        path="/incidents/create"
        element={
          <RouteGuard>
            <CreateIncident />
          </RouteGuard>
        }
      />

      <Route
        path="/incidents/sla"
        element={
          <RouteGuard>
            <SLAMonitoring />
          </RouteGuard>
        }
      />

      {/* New problem routes */}
      <Route
        path="/problems/rca"
        element={
          <RouteGuard>
            <RootCauseAnalysis />
          </RouteGuard>
        }
      />

      <Route
        path="/problems/workarounds"
        element={
          <RouteGuard>
            <Workarounds />
          </RouteGuard>
        }
      />

      {/* New change routes */}
      <Route
        path="/changes/rfc"
        element={
          <RouteGuard>
            <RFCManagement />
          </RouteGuard>
        }
      />

      <Route
        path="/changes/cab"
        element={
          <RouteGuard>
            <CABMeetings />
          </RouteGuard>
        }
      />

      <Route
        path="/changes/schedule"
        element={
          <RouteGuard>
            <ChangeSchedule />
          </RouteGuard>
        }
      />

      <Route
        path="/changes/risk"
        element={
          <RouteGuard>
            <RiskAssessment />
          </RouteGuard>
        }
      />

      {/* Configuration Management routes */}
      <Route
        path="/configuration/cmdb"
        element={
          <RouteGuard>
            <CMDB />
          </RouteGuard>
        }
      />

      <Route
        path="/configuration/assets"
        element={
          <RouteGuard>
            <AssetManagement />
          </RouteGuard>
        }
      />

      <Route
        path="/configuration/relationships"
        element={
          <RouteGuard>
            <CIRelationships />
          </RouteGuard>
        }
      />

      {/* Release Management routes */}
      <Route
        path="/release/planning"
        element={
          <RouteGuard>
            <ReleasePlanning />
          </RouteGuard>
        }
      />

      <Route
        path="/release/testing"
        element={
          <RouteGuard>
            <ReleaseTesting />
          </RouteGuard>
        }
      />

      <Route
        path="/release/deployment"
        element={
          <RouteGuard>
            <ReleaseDeployment />
          </RouteGuard>
        }
      />

      {/* Service Catalog routes */}
      <Route
        path="/catalog/services"
        element={
          <RouteGuard>
            <Services />
          </RouteGuard>
        }
      />

      <Route
        path="/catalog/slas"
        element={
          <RouteGuard>
            <SLAs />
          </RouteGuard>
        }
      />

      <Route
        path="/catalog/olas"
        element={
          <RouteGuard>
            <OLAs />
          </RouteGuard>
        }
      />

      {/* Report routes */}
      <Route
        path="/reports/performance"
        element={
          <RouteGuard>
            <PerformanceReports />
          </RouteGuard>
        }
      />

      <Route
        path="/reports/compliance"
        element={
          <RouteGuard>
            <ComplianceReports />
          </RouteGuard>
        }
      />

      <Route
        path="/reports/custom"
        element={
          <RouteGuard>
            <CustomReports />
          </RouteGuard>
        }
      />

      {/* Settings routes */}
      <Route
        path="/settings"
        element={
          <RouteGuard>
            <GeneralSettings />
          </RouteGuard>
        }
      />

      <Route
        path="/settings/general"
        element={
          <RouteGuard>
            <GeneralSettings />
          </RouteGuard>
        }
      />

      <Route
        path="/settings/security"
        element={
          <RouteGuard>
            <SecuritySettings />
          </RouteGuard>
        }
      />

      <Route
        path="/settings/notifications"
        element={
          <RouteGuard>
            <NotificationSettings />
          </RouteGuard>
        }
      />

      <Route
        path="/settings/integrations"
        element={
          <RouteGuard>
            <IntegrationsSettings />
          </RouteGuard>
        }
      />

      <Route
        path="/users"
        element={
          <RouteGuard>
            <ProtectedRoute requiredPermissions={['users.view']}>
              <UserManagement />
            </ProtectedRoute>
          </RouteGuard>
        }
      />

      {/* Root route redirect - 認証状態に応じて適切にリダイレクト */}
      <Route
        path="/"
        element={
          (() => {
            console.log('[App] Root route - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
            if (isLoading) {
              console.log('[App] Loading state, showing spinner');
              return (
                <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-300">認証状態を確認中...</p>
                  </div>
                </div>
              );
            } else if (isAuthenticated) {
              console.log('[App] User authenticated, redirecting to dashboard');
              return <Navigate to="/dashboard" replace />;
            } else {
              console.log('[App] User not authenticated, redirecting to login');
              return <Navigate to="/login" replace />;
            }
          })()
        }
      />

      {/* Catch all route - 404 */}
      <Route
        path="*"
        element={
          <RouteGuard>
            <div className="p-6">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">ページが見つかりません</p>
                <a
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ダッシュボードへ戻る
                </a>
              </div>
            </div>
          </RouteGuard>
        }
      />
    </Routes>
  );
}

export default App;