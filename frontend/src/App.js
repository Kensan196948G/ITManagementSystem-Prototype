import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// レイアウトコンポーネント
import Layout from './components/layout/Layout';

// ページコンポーネント
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SystemMonitoring from './pages/SystemMonitoring';
import IncidentManagementPage from './pages/IncidentManagementPage'; // 新しいインシデント管理ページをインポート
import SecurityEvents from './pages/SecurityEvents';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import MetricsAnalysis from './pages/MetricsAnalysis';
import UserManagement from './pages/UserManagement';
import CMDB from './pages/CMDB';
import Requests from './pages/Requests';
import Knowledge from './pages/Knowledge';
import Changes from './pages/Changes';
import ProblemManagementPage from './pages/ProblemManagementPage'; // 問題管理ページをインポート

// 認証コンテキスト
import { AuthProvider, useAuth } from './contexts/AuthContext';

// 認証済みルートのラッパーコンポーネント
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // 開発モード：一時的に認証チェックをバイパス
  const DEV_MODE = true; // 開発中の認証バイパスフラグ

  if (!isAuthenticated && !DEV_MODE) {
    return <Navigate to="/login" />;
  }

  return children;
};

// 開発モードフラグ - グローバルに定義
const DEV_MODE = true; // 開発中の認証バイパスフラグ

function AppRoutes() {
  const { isAuthenticated, currentUser } = useAuth();

  // 強制的に認証状態を確認
  useEffect(() => {
    if (DEV_MODE) {
      // 開発モードでローカルストレージをチェック
      const token = localStorage.getItem('token');
      console.log("認証状態チェック:", { token, isAuthenticated, currentUser });
    }
  }, [isAuthenticated, currentUser]);

  return (
    <Routes>
      {/* 初期ルートを認証状態に基づいてリダイレクト */}
      <Route path="/" element={
        isAuthenticated || DEV_MODE ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
      } />

      {/* ログインページは常に表示する - 内部でログアウト処理を行う */}
      <Route path="/login" element={<Login />} />

      {/* 認証が必要なルート */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="monitoring" element={<SystemMonitoring />} />
        <Route path="incidents" element={<IncidentManagementPage />} /> {/* 新しいインシデント管理ページコンポーネントを使用 */}
        <Route path="security" element={<SecurityEvents />} />
        <Route path="reports" element={<Reports />} />
        <Route path="metrics" element={<MetricsAnalysis />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<Settings />} />
        <Route path="cmdb" element={<CMDB />} />
        <Route path="requests" element={<Requests />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="changes" element={<Changes />} />
        <Route path="problems" element={<ProblemManagementPage />} /> {/* 問題管理ページへのルートを追加 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
