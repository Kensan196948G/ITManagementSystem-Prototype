import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ServerIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// ステータスカードコンポーネント
function StatusCard({
  title, value, icon: Icon, color, description,
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-secondary-800">{title}</h3>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {description && <p className="text-sm text-secondary-500 mt-1">{description}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}

// システムステータスコンポーネント
function SystemStatusItem({ name, status, uptime }) {
  const getStatusColor = (status) => {
    switch (status) {
      case '正常':
        return 'bg-success-100 text-success-800';
      case '警告':
        return 'bg-warning-100 text-warning-800';
      case '異常':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-secondary-200 last:border-0">
      <div className="flex items-center">
        <ServerIcon className="h-5 w-5 text-secondary-500 mr-3" />
        <span className="font-medium">{name}</span>
      </div>
      <div className="flex items-center space-x-4">
        {uptime && (
          <div className="flex items-center text-secondary-500 text-sm">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{uptime}</span>
          </div>
        )}
        <span className={`badge ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

// 最近のインシデントコンポーネント
function RecentIncidentItem({
  title, time, severity, status,
}) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case '重大':
        return 'bg-danger-100 text-danger-800';
      case '高':
        return 'bg-warning-100 text-warning-800';
      case '中':
        return 'bg-primary-100 text-primary-800';
      case '低':
        return 'bg-secondary-100 text-secondary-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '未対応':
        return 'text-danger-600';
      case '対応中':
        return 'text-warning-600';
      case '解決済み':
        return 'text-success-600';
      default:
        return 'text-secondary-600';
    }
  };

  return (
    <div className="py-3 border-b border-secondary-200 last:border-0">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-secondary-800">{title}</h4>
          <p className="text-sm text-secondary-500">{time}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`badge ${getSeverityColor(severity)}`}>{severity}</span>
          <span className={`text-sm font-medium ${getStatusColor(status)}`}>{status}</span>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  // ステータスデータ
  const statusData = [
    {
      title: 'システム稼働率',
      value: '99.98%',
      icon: CheckCircleIcon,
      color: 'text-success-600',
      description: '過去30日間',
    },
    {
      title: 'インシデント',
      value: '3',
      icon: ExclamationTriangleIcon,
      color: 'text-warning-600',
      description: '対応中のインシデント',
    },
    {
      title: 'セキュリティアラート',
      value: '2',
      icon: ShieldCheckIcon,
      color: 'text-danger-600',
      description: '未解決のアラート',
    },
    {
      title: 'パフォーマンス',
      value: '良好',
      icon: ChartBarIcon,
      color: 'text-primary-600',
      description: 'リソース使用率は正常範囲内',
    },
  ];

  // SkySea Client Viewの状態管理
  const [skyseaStatus, setSkyseaStatus] = useState({
    name: 'SkySea Client View',
    status: '取得中...',
    uptime: '',
  });

  // SkySeaデータ取得
  useEffect(() => {
    const fetchSkyseaData = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/skysea/clients');
        if (!response.ok) throw new Error('SkySeaデータの取得に失敗しました');

        const data = await response.json();
        setSkyseaStatus({
          name: 'SkySea Client View',
          status: '正常',
          uptime: `${data.data.updated_clients}/${data.data.total_clients} クライアント更新済み`,
        });
      } catch (error) {
        console.error('SkySeaデータ取得エラー:', error);
        setSkyseaStatus({
          name: 'SkySea Client View',
          status: '異常',
          uptime: 'データ取得失敗',
        });
      }
    };

    fetchSkyseaData();
  }, []);

  // システムステータスデータ
  const systemStatusData = [
    { name: 'Microsoft 365', status: '正常', uptime: '30日間' },
    { name: 'Active Directory', status: '正常', uptime: '30日間' },
    { name: 'Microsoft Entra ID', status: '正常', uptime: '30日間' },
    { name: 'Exchange Online', status: '警告', uptime: '29日間' },
    { name: 'HENGEOINE', status: '正常', uptime: '30日間' },
    { name: 'DirectCloud', status: '正常', uptime: '30日間' },
    { name: 'ファイルサーバー', status: '正常', uptime: '30日間' },
    skyseaStatus,
  ];

  // 最近のインシデントデータ
  const recentIncidentData = [
    {
      title: 'Exchange Online同期エラー',
      time: '2025/03/12 15:23',
      severity: '中',
      status: '対応中',
    },
    {
      title: 'ユーザー認証エラーの増加',
      time: '2025/03/11 09:45',
      severity: '高',
      status: '解決済み',
    },
    {
      title: 'ファイルサーバーパフォーマンス低下',
      time: '2025/03/10 14:12',
      severity: '低',
      status: '解決済み',
    },
    {
      title: 'Entra ID同期エラー',
      time: '2025/03/08 22:36',
      severity: '中',
      status: '解決済み',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">ダッシュボード</h1>
        <div className="flex items-center text-primary-600">
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          <span className="text-sm">最終更新: 2025/03/13 18:25</span>
        </div>
      </div>

      {/* ステータスカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusData.map((item, index) => (
          <StatusCard key={index} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* システム状態 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-secondary-800">システム状態</h2>
            <Link to="/monitoring" className="text-sm text-primary-600 hover:text-primary-700">
              詳細を表示
            </Link>
          </div>
          <div className="divide-y divide-secondary-200">
            {systemStatusData.map((item, index) => (
              <SystemStatusItem key={index} {...item} />
            ))}
          </div>
        </div>

        {/* 最近のインシデント */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-secondary-800">最近のインシデント</h2>
            <Link to="/incidents" className="text-sm text-primary-600 hover:text-primary-700">
              すべて表示
            </Link>
          </div>
          <div className="divide-y divide-secondary-200">
            {recentIncidentData.map((item, index) => (
              <RecentIncidentItem key={index} {...item} />
            ))}
          </div>
        </div>
      </div>

      {/* ISO準拠状況 */}
      <div className="card">
        <h2 className="text-xl font-semibold text-secondary-800 mb-4">ISO準拠状況</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-success-200 p-4">
            <h3 className="font-medium text-secondary-900 mb-2">ISO 20000</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">ITサービス管理</span>
              <div className="flex items-center">
                <span className="text-success-600 font-medium text-sm mr-2">100%</span>
                <CheckCircleIcon className="h-5 w-5 text-success-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-success-200 p-4">
            <h3 className="font-medium text-secondary-900 mb-2">ISO 27001</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">情報セキュリティ管理</span>
              <div className="flex items-center">
                <span className="text-success-600 font-medium text-sm mr-2">98%</span>
                <CheckCircleIcon className="h-5 w-5 text-success-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-success-200 p-4">
            <h3 className="font-medium text-secondary-900 mb-2">ISO 27002</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">情報セキュリティ管理策</span>
              <div className="flex items-center">
                <span className="text-success-600 font-medium text-sm mr-2">97%</span>
                <CheckCircleIcon className="h-5 w-5 text-success-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
