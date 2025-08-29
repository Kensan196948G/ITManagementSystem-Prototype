import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Zap,
  Server,
  AlertCircle,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

// インターフェース定義
interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  target?: number;
  status: 'good' | 'warning' | 'critical';
}

interface SystemMetrics {
  uptime: number;
  responseTime: number;
  throughput: number;
  cpuUtilization: number;
  memoryUtilization: number;
  diskUtilization: number;
  networkUtilization: number;
}

interface SLAMetrics {
  availability: number;
  responseTime: number;
  resolution: number;
  satisfaction: number;
}

interface DepartmentPerformance {
  id: string;
  name: string;
  score: number;
  incidents: number;
  resolved: number;
  avgResolutionTime: number;
  satisfaction: number;
}

interface TimeSeriesData {
  timestamp: string;
  value: number;
  label: string;
}

const PerformanceReports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('monthly');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [activeView, setActiveView] = useState<string>('overview');

  // CSV export function with Japanese text support
  const downloadPerformanceReport = () => {
    try {
      // Prepare CSV data with performance metrics
      const csvHeader = 'メトリクス名,値,単位,トレンド,変化量,目標値,ステータス\n';
      
      let csvData = performanceKPIs.map(kpi => {
        const trendText = kpi.trend === 'up' ? '上昇' : kpi.trend === 'down' ? '下降' : '安定';
        const statusText = kpi.status === 'good' ? '良好' : kpi.status === 'warning' ? '注意' : '重要';
        return `"${kpi.name}",${kpi.value},"${kpi.unit}","${trendText}",${kpi.change},"${kpi.target || 'N/A'}","${statusText}"`;
      }).join('\n');

      // Add department performance data
      csvData += '\n\n部門名,総合スコア,インシデント数,解決済み,平均解決時間,満足度\n';
      csvData += departmentPerformance.map(dept => 
        `"${dept.name}",${dept.score},${dept.incidents},${dept.resolved},${dept.avgResolutionTime}h,${dept.satisfaction}/5.0`
      ).join('\n');

      // Add system metrics
      csvData += '\n\nシステムリソース,使用率\n';
      csvData += `"CPU使用率",${systemMetrics.cpuUtilization}%\n`;
      csvData += `"メモリ使用率",${systemMetrics.memoryUtilization}%\n`;
      csvData += `"ディスク使用率",${systemMetrics.diskUtilization}%\n`;
      csvData += `"ネットワーク使用率",${systemMetrics.networkUtilization}%\n`;

      // Create and download file
      const BOM = '\uFEFF'; // UTF-8 BOM for Japanese text
      const fullCsvData = csvHeader + csvData;
      const blob = new Blob([BOM + fullCsvData], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `パフォーマンスレポート_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      alert('パフォーマンスレポートのCSVファイルをダウンロードしました。');
    } catch (error) {
      console.error('CSV export error:', error);
      alert('CSVエクスポートでエラーが発生しました。');
    }
  };

  // モックデータ
  const systemMetrics: SystemMetrics = {
    uptime: 99.95,
    responseTime: 245,
    throughput: 1250,
    cpuUtilization: 65,
    memoryUtilization: 72,
    diskUtilization: 45,
    networkUtilization: 38
  };

  const slaMetrics: SLAMetrics = {
    availability: 99.87,
    responseTime: 98.5,
    resolution: 95.2,
    satisfaction: 4.3
  };

  const performanceKPIs: PerformanceMetric[] = [
    {
      id: 'uptime',
      name: 'システム稼働率',
      value: 99.95,
      unit: '%',
      trend: 'up',
      change: 0.15,
      target: 99.9,
      status: 'good'
    },
    {
      id: 'response_time',
      name: '平均応答時間',
      value: 245,
      unit: 'ms',
      trend: 'down',
      change: -12,
      target: 300,
      status: 'good'
    },
    {
      id: 'throughput',
      name: 'スループット',
      value: 1250,
      unit: 'req/sec',
      trend: 'up',
      change: 8.5,
      target: 1000,
      status: 'good'
    },
    {
      id: 'incident_resolution',
      name: 'インシデント解決時間',
      value: 4.2,
      unit: '時間',
      trend: 'down',
      change: -0.8,
      target: 6,
      status: 'good'
    },
    {
      id: 'sla_compliance',
      name: 'SLA準拠率',
      value: 98.5,
      unit: '%',
      trend: 'up',
      change: 2.1,
      target: 95,
      status: 'good'
    },
    {
      id: 'user_satisfaction',
      name: 'ユーザー満足度',
      value: 4.3,
      unit: '/5.0',
      trend: 'up',
      change: 0.2,
      target: 4.0,
      status: 'good'
    }
  ];

  const departmentPerformance: DepartmentPerformance[] = [
    {
      id: 'infrastructure',
      name: 'インフラストラクチャ',
      score: 95,
      incidents: 12,
      resolved: 11,
      avgResolutionTime: 3.5,
      satisfaction: 4.5
    },
    {
      id: 'applications',
      name: 'アプリケーション',
      score: 88,
      incidents: 25,
      resolved: 23,
      avgResolutionTime: 5.2,
      satisfaction: 4.1
    },
    {
      id: 'security',
      name: 'セキュリティ',
      score: 92,
      incidents: 8,
      resolved: 8,
      avgResolutionTime: 2.8,
      satisfaction: 4.4
    },
    {
      id: 'network',
      name: 'ネットワーク',
      score: 85,
      incidents: 18,
      resolved: 16,
      avgResolutionTime: 6.1,
      satisfaction: 3.8
    },
    {
      id: 'database',
      name: 'データベース',
      score: 91,
      incidents: 15,
      resolved: 14,
      avgResolutionTime: 4.8,
      satisfaction: 4.2
    }
  ];

  const timeSeriesData: TimeSeriesData[] = [
    { timestamp: '2025-01', value: 97.5, label: '1月' },
    { timestamp: '2025-02', value: 98.2, label: '2月' },
    { timestamp: '2025-03', value: 99.1, label: '3月' },
    { timestamp: '2025-04', value: 98.8, label: '4月' },
    { timestamp: '2025-05', value: 99.3, label: '5月' },
    { timestamp: '2025-06', value: 99.7, label: '6月' },
    { timestamp: '2025-07', value: 99.5, label: '7月' },
    { timestamp: '2025-08', value: 99.9, label: '8月' }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'warning':
        return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'critical':
        return 'text-red-400 border-red-400/30 bg-red-400/10';
      default:
        return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const MockChart: React.FC<{ type: string; height?: string }> = ({ type, height = "h-64" }) => (
    <div className={`${height} bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center border border-white/10`}>
      <div className="text-center text-gray-400">
        {type === 'line' && <LineChart className="w-12 h-12 mx-auto mb-2" />}
        {type === 'bar' && <BarChart3 className="w-12 h-12 mx-auto mb-2" />}
        {type === 'pie' && <PieChart className="w-12 h-12 mx-auto mb-2" />}
        <p className="text-sm">{type}チャート</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-400" />
                パフォーマンスレポート
              </h1>
              <p className="text-gray-300 mt-2">ITサービスの包括的なパフォーマンス分析</p>
            </div>
            <button 
              onClick={downloadPerformanceReport}
              className="bg-blue-600/80 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all backdrop-blur-sm"
            >
              <Download className="w-5 h-5" />
              レポート出力
            </button>
          </div>

          {/* フィルターとコントロール */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                期間
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="daily">日次</option>
                <option value="weekly">週次</option>
                <option value="monthly">月次</option>
                <option value="quarterly">四半期</option>
                <option value="yearly">年次</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                部門
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">全部門</option>
                <option value="infrastructure">インフラストラクチャ</option>
                <option value="applications">アプリケーション</option>
                <option value="security">セキュリティ</option>
                <option value="network">ネットワーク</option>
                <option value="database">データベース</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex items-center gap-2">
                <Server className="w-4 h-4" />
                サービス
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">全サービス</option>
                <option value="web">Webサービス</option>
                <option value="database">データベース</option>
                <option value="api">API</option>
                <option value="mail">メールサービス</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                ビュー
              </label>
              <select
                value={activeView}
                onChange={(e) => setActiveView(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="overview">概要</option>
                <option value="detailed">詳細</option>
                <option value="trends">トレンド</option>
                <option value="comparison">比較</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPIダッシュボード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {performanceKPIs.map((kpi) => (
            <div key={kpi.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{kpi.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-bold text-white">
                      {kpi.value}{kpi.unit}
                    </span>
                    {getTrendIcon(kpi.trend)}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(kpi.status)}`}>
                  {kpi.status === 'good' ? '良好' : kpi.status === 'warning' ? '注意' : '重要'}
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">
                  変化: {kpi.change > 0 ? '+' : ''}{kpi.change}{kpi.unit}
                </span>
                {kpi.target && (
                  <span className="text-gray-300">
                    目標: {kpi.target}{kpi.unit}
                  </span>
                )}
              </div>

              <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    kpi.status === 'good' ? 'bg-green-400' :
                    kpi.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.min(100, (kpi.value / (kpi.target || kpi.value)) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* システムメトリクス */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Server className="w-6 h-6 text-green-400" />
            システムリソース使用率
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{systemMetrics.cpuUtilization}%</div>
              <div className="text-gray-300 mb-3">CPU使用率</div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${systemMetrics.cpuUtilization}%` }} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{systemMetrics.memoryUtilization}%</div>
              <div className="text-gray-300 mb-3">メモリ使用率</div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 transition-all duration-500" style={{ width: `${systemMetrics.memoryUtilization}%` }} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{systemMetrics.diskUtilization}%</div>
              <div className="text-gray-300 mb-3">ディスク使用率</div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 transition-all duration-500" style={{ width: `${systemMetrics.diskUtilization}%` }} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{systemMetrics.networkUtilization}%</div>
              <div className="text-gray-300 mb-3">ネットワーク使用率</div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 transition-all duration-500" style={{ width: `${systemMetrics.networkUtilization}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* チャートセクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-blue-400" />
              応答時間トレンド
            </h3>
            <MockChart type="line" />
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              スループット分析
            </h3>
            <MockChart type="bar" />
          </div>
        </div>

        {/* 部門別パフォーマンス */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Target className="w-6 h-6 text-orange-400" />
            部門別パフォーマンス
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {departmentPerformance.map((dept) => (
              <div key={dept.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                <div className="text-center">
                  <h4 className="text-white font-semibold mb-3">{dept.name}</h4>
                  <div className="text-2xl font-bold text-white mb-2">{dept.score}</div>
                  <div className="text-sm text-gray-300 mb-3">総合スコア</div>
                  
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>インシデント</span>
                      <span>{dept.incidents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>解決済み</span>
                      <span className="text-green-400">{dept.resolved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>平均解決時間</span>
                      <span>{dept.avgResolutionTime}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>満足度</span>
                      <span className="text-yellow-400">{dept.satisfaction}/5.0</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA準拠状況 */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-blue-400" />
            SLA準拠状況
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{slaMetrics.availability}%</div>
              <div className="text-gray-300">可用性</div>
              <div className="mt-3 text-xs text-gray-400">目標: 99.5%</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{slaMetrics.responseTime}%</div>
              <div className="text-gray-300">応答時間</div>
              <div className="mt-3 text-xs text-gray-400">目標: 95%</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">{slaMetrics.resolution}%</div>
              <div className="text-gray-300">解決時間</div>
              <div className="mt-3 text-xs text-gray-400">目標: 90%</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{slaMetrics.satisfaction}/5.0</div>
              <div className="text-gray-300">顧客満足度</div>
              <div className="mt-3 text-xs text-gray-400">目標: 4.0</div>
            </div>
          </div>
        </div>

        {/* トップパフォーマーと改善領域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              トップパフォーマー
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-400/10 rounded-lg border border-green-400/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">インフラストラクチャ部門</span>
                </div>
                <span className="text-green-400 font-bold">95点</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-400/10 rounded-lg border border-green-400/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">セキュリティ部門</span>
                </div>
                <span className="text-green-400 font-bold">92点</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-400/10 rounded-lg border border-green-400/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">データベース部門</span>
                </div>
                <span className="text-green-400 font-bold">91点</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              改善が必要な領域
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">ネットワーク部門</span>
                </div>
                <span className="text-yellow-400 font-bold">85点</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">インシデント解決時間</span>
                </div>
                <span className="text-yellow-400 font-bold">6.1時間</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">ユーザー満足度</span>
                </div>
                <span className="text-yellow-400 font-bold">3.8/5.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* 詳細メトリクス */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <PieChart className="w-6 h-6 text-purple-400" />
            詳細パフォーマンス分析
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">インシデント分布</h4>
              <MockChart type="pie" height="h-48" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">解決時間分析</h4>
              <MockChart type="bar" height="h-48" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">満足度トレンド</h4>
              <MockChart type="line" height="h-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReports;