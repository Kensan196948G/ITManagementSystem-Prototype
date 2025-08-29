import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  ShieldCheckIcon,
  ServerIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  Activity,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Globe,
  Calendar,
  FileText,
  Settings
} from 'lucide-react';

// Types for data structure
interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  gradient: string;
  loading?: boolean;
}

interface ChartData {
  name: string;
  value: number;
  trend?: number;
  category?: string;
}

interface Activity {
  id: string;
  type: 'incident' | 'change' | 'problem' | 'release';
  title: string;
  status: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  user: string;
}

interface SystemHealth {
  service: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: number;
  icon: React.ReactNode;
}

// Loading skeleton component
const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded ${className}`} />
);

// Metric card component with glassmorphism
const MetricCard: React.FC<{ metric: MetricCard }> = ({ metric }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), Math.random() * 2000 + 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-xl p-6 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${metric.gradient}`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
            {metric.icon}
          </div>
          <RefreshCwIcon className="w-4 h-4 text-white/60 animate-spin" />
        </div>

        {isLoading ? (
          <>
            <LoadingSkeleton className="h-8 w-24 mb-2" />
            <LoadingSkeleton className="h-4 w-16" />
          </>
        ) : (
          <>
            <div className="text-3xl font-bold text-white mb-2 animate-fade-in">
              {metric.value}
            </div>
            <div className="flex items-center text-sm text-white/80">
              {metric.change > 0 ? (
                <TrendingUpIcon className="w-4 h-4 mr-1 text-green-300" />
              ) : (
                <TrendingDownIcon className="w-4 h-4 mr-1 text-red-300" />
              )}
              <span className={metric.change > 0 ? 'text-green-300' : 'text-red-300'}>
                {Math.abs(metric.change)}% 前月比
              </span>
            </div>
          </>
        )}
        
        <div className="text-sm text-white/70 mt-1">{metric.title}</div>
      </div>

      {/* Animated border */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

// Chart container with glassmorphism
const ChartContainer: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ 
  title, 
  children, 
  action 
}) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl overflow-hidden">
    <div className="px-6 py-4 border-b border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {action}
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// Activity row component
const ActivityRow: React.FC<{ activity: Activity }> = ({ activity }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircleIcon className="w-4 h-4" />;
      case 'warning': return <AlertTriangleIcon className="w-4 h-4" />;
      case 'error': return <XCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-200">
      <td className="px-4 py-3">
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
          {getStatusIcon(activity.status)}
          <span className="ml-1 capitalize">{activity.status}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">{activity.title}</div>
        <div className="text-sm text-gray-500 capitalize">{activity.type}</div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">{activity.user}</td>
      <td className="px-4 py-3 text-sm text-gray-500">{activity.timestamp}</td>
    </tr>
  );
};

// System health monitor component
const SystemHealthMonitor: React.FC<{ system: SystemHealth }> = ({ system }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-white/20 mr-3">
            {system.icon}
          </div>
          <div>
            <div className="font-medium text-gray-800">{system.service}</div>
            <div className="text-sm text-gray-600">{system.uptime} 稼働</div>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${getStatusColor(system.status)} animate-pulse`} />
      </div>
      <div className="text-sm text-gray-600">
        応答時間: <span className="font-medium">{system.responseTime}ms</span>
      </div>
    </div>
  );
};

// Quick action button component
const QuickActionButton: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}> = ({ icon, label, onClick, variant = 'secondary' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700';
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700';
      default:
        return 'bg-white/20 text-gray-700 hover:bg-white/30 border border-white/20';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center p-4 rounded-xl backdrop-blur-md shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${getVariantStyles()}`}
    >
      <div className="mr-2">{icon}</div>
      <span className="font-medium">{label}</span>
    </button>
  );
};

const Dashboard: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Sample data
  const metrics: MetricCard[] = [
    {
      id: '1',
      title: 'アクティブユーザー',
      value: '2,847',
      change: 12.5,
      icon: <UsersIcon className="w-6 h-6 text-white" />,
      gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700'
    },
    {
      id: '2',
      title: 'システム稼働率',
      value: '99.9%',
      change: 0.2,
      icon: <ShieldCheckIcon className="w-6 h-6 text-white" />,
      gradient: 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-700'
    },
    {
      id: '3',
      title: '未解決インシデント',
      value: '23',
      change: -15.8,
      icon: <AlertTriangleIcon className="w-6 h-6 text-white" />,
      gradient: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-700'
    },
    {
      id: '4',
      title: 'サーバー負荷',
      value: '67%',
      change: 8.3,
      icon: <ServerIcon className="w-6 h-6 text-white" />,
      gradient: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700'
    }
  ];

  const trendData: ChartData[] = [
    { name: '01/01', value: 2400, trend: 2200 },
    { name: '01/02', value: 1398, trend: 1800 },
    { name: '01/03', value: 9800, trend: 2800 },
    { name: '01/04', value: 3908, trend: 3200 },
    { name: '01/05', value: 4800, trend: 4100 },
    { name: '01/06', value: 3800, trend: 3900 },
    { name: '01/07', value: 4300, trend: 4200 }
  ];

  const categoryData: ChartData[] = [
    { name: 'インシデント', value: 45 },
    { name: '変更要求', value: 32 },
    { name: '問題管理', value: 18 },
    { name: 'リリース', value: 12 }
  ];

  const recentActivities: Activity[] = [
    {
      id: '1',
      type: 'incident',
      title: 'メールサーバー障害 - 復旧完了',
      status: 'success',
      timestamp: '10分前',
      user: '田中 太郎'
    },
    {
      id: '2',
      type: 'change',
      title: 'セキュリティパッチ適用承認待ち',
      status: 'warning',
      timestamp: '25分前',
      user: '佐藤 花子'
    },
    {
      id: '3',
      type: 'problem',
      title: 'データベース接続エラー調査中',
      status: 'error',
      timestamp: '1時間前',
      user: '山田 次郎'
    },
    {
      id: '4',
      type: 'release',
      title: 'アプリケーション v2.1.0 デプロイ',
      status: 'info',
      timestamp: '2時間前',
      user: '鈴木 一郎'
    }
  ];

  const systemHealth: SystemHealth[] = [
    {
      service: 'Webサーバー',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: 45,
      icon: <Globe className="w-5 h-5 text-green-600" />
    },
    {
      service: 'データベース',
      status: 'healthy',
      uptime: '99.8%',
      responseTime: 12,
      icon: <Database className="w-5 h-5 text-green-600" />
    },
    {
      service: 'API Gateway',
      status: 'warning',
      uptime: '98.5%',
      responseTime: 89,
      icon: <Wifi className="w-5 h-5 text-yellow-600" />
    },
    {
      service: 'ストレージ',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: 8,
      icon: <HardDrive className="w-5 h-5 text-green-600" />
    }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    // Implement quick actions
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              ITサービス管理ダッシュボード
            </h1>
            <p className="text-gray-600 mt-2">
              最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCwIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            更新
          </button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <ChartContainer 
          title="システム利用状況トレンド"
          action={
            <div className="flex items-center text-sm text-gray-500">
              <Activity className="w-4 h-4 mr-1" />
              リアルタイム
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" fillOpacity={1} fill="url(#colorValue)" />
              <Area type="monotone" dataKey="trend" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorTrend)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="カテゴリ別処理状況">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {categoryData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={[
                      '#3B82F6', // Blue
                      '#8B5CF6', // Purple
                      '#10B981', // Green
                      '#F59E0B'  // Orange
                    ][index % 4]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Activities and Quick Actions Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <ChartContainer title="最近のアクティビティ">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      詳細
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      担当者
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      時刻
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentActivities.map((activity) => (
                    <ActivityRow key={activity.id} activity={activity} />
                  ))}
                </tbody>
              </table>
            </div>
          </ChartContainer>
        </div>

        <ChartContainer title="クイックアクション">
          <div className="grid grid-cols-1 gap-3">
            <QuickActionButton
              icon={<FileText className="w-5 h-5" />}
              label="インシデント作成"
              onClick={() => handleQuickAction('create-incident')}
              variant="primary"
            />
            <QuickActionButton
              icon={<Calendar className="w-5 h-5" />}
              label="変更要求"
              onClick={() => handleQuickAction('change-request')}
            />
            <QuickActionButton
              icon={<Settings className="w-5 h-5" />}
              label="システム設定"
              onClick={() => handleQuickAction('system-config')}
            />
            <QuickActionButton
              icon={<AlertTriangleIcon className="w-5 h-5" />}
              label="緊急対応"
              onClick={() => handleQuickAction('emergency')}
              variant="danger"
            />
          </div>
        </ChartContainer>
      </div>

      {/* System Health Row */}
      <ChartContainer title="システムヘルスモニター">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {systemHealth.map((system, index) => (
            <SystemHealthMonitor key={index} system={system} />
          ))}
        </div>
      </ChartContainer>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .bg-grid-pattern {
          background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0);
          background-size: 20px 20px;
        }

        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;