import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Server,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Mock data for analytics
const mockKPIData = {
  incidents: {
    total: 342,
    resolved: 287,
    open: 55,
    avgResolutionTime: 4.2,
    trend: 12
  },
  problems: {
    total: 23,
    resolved: 18,
    open: 5,
    avgResolutionTime: 18.5,
    trend: -8
  },
  changes: {
    total: 156,
    successful: 142,
    failed: 14,
    successRate: 91.0,
    trend: 5
  },
  services: {
    available: 98.7,
    degraded: 1.2,
    unavailable: 0.1,
    mttr: 2.3,
    trend: 2
  }
};

const mockIncidentTrendData = [
  { month: '1月', incidents: 45, resolved: 42, open: 3 },
  { month: '2月', incidents: 52, resolved: 48, open: 4 },
  { month: '3月', incidents: 38, resolved: 35, open: 3 },
  { month: '4月', incidents: 41, resolved: 39, open: 2 },
  { month: '5月', incidents: 47, resolved: 44, open: 3 },
  { month: '6月', incidents: 35, resolved: 32, open: 3 },
  { month: '7月', incidents: 42, resolved: 38, open: 4 },
  { month: '8月', incidents: 48, resolved: 45, open: 3 }
];

const mockProblemPatternData = [
  { category: 'ネットワーク', count: 8, percentage: 35 },
  { category: 'サーバー', count: 6, percentage: 26 },
  { category: 'アプリケーション', count: 4, percentage: 17 },
  { category: 'データベース', count: 3, percentage: 13 },
  { category: 'セキュリティ', count: 2, percentage: 9 }
];

const mockServiceLevelData = [
  { service: 'メールサービス', sla: 99.5, actual: 99.2, incidents: 3 },
  { service: 'Webサービス', sla: 99.0, actual: 98.8, incidents: 5 },
  { service: 'データベース', sla: 99.9, actual: 99.7, incidents: 2 },
  { service: 'ファイルサーバー', sla: 99.0, actual: 99.3, incidents: 1 },
  { service: 'VPNサービス', sla: 98.0, actual: 97.5, incidents: 7 }
];

const mockChangeSuccessData = [
  { month: '1月', total: 18, successful: 16, failed: 2 },
  { month: '2月', total: 22, successful: 20, failed: 2 },
  { month: '3月', total: 15, successful: 14, failed: 1 },
  { month: '4月', total: 19, successful: 18, failed: 1 },
  { month: '5月', total: 21, successful: 19, failed: 2 },
  { month: '6月', total: 17, successful: 15, failed: 2 },
  { month: '7月', total: 20, successful: 18, failed: 2 },
  { month: '8月', total: 24, successful: 22, failed: 2 }
];

const mockUserActivityData = [
  { hour: '00', requests: 120 },
  { hour: '04', requests: 80 },
  { hour: '08', requests: 450 },
  { hour: '12', requests: 380 },
  { hour: '16', requests: 520 },
  { hour: '20', requests: 290 }
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const KPICard: React.FC<{
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
  color: string;
}> = ({ title, value, unit, icon, trend, subtitle, color }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-${color}-500/20`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <h3 className="text-gray-300 text-sm font-medium mb-1">{title}</h3>
    <div className="flex items-end gap-1">
      <span className="text-2xl font-bold text-white">{value}</span>
      {unit && <span className="text-gray-400 text-sm mb-1">{unit}</span>}
    </div>
    {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
  </div>
);

export const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('incidents');

  const kpiCards = useMemo(() => [
    {
      title: 'インシデント解決率',
      value: `${((mockKPIData.incidents.resolved / mockKPIData.incidents.total) * 100).toFixed(1)}`,
      unit: '%',
      icon: <CheckCircle className="w-6 h-6 text-green-400" />,
      trend: mockKPIData.incidents.trend,
      subtitle: `平均解決時間: ${mockKPIData.incidents.avgResolutionTime}時間`,
      color: 'green'
    },
    {
      title: '問題管理効率',
      value: `${((mockKPIData.problems.resolved / mockKPIData.problems.total) * 100).toFixed(1)}`,
      unit: '%',
      icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
      trend: mockKPIData.problems.trend,
      subtitle: `平均解決時間: ${mockKPIData.problems.avgResolutionTime}時間`,
      color: 'yellow'
    },
    {
      title: '変更成功率',
      value: mockKPIData.changes.successRate,
      unit: '%',
      icon: <Activity className="w-6 h-6 text-blue-400" />,
      trend: mockKPIData.changes.trend,
      subtitle: `成功: ${mockKPIData.changes.successful} / 失敗: ${mockKPIData.changes.failed}`,
      color: 'blue'
    },
    {
      title: 'サービス可用性',
      value: mockKPIData.services.available,
      unit: '%',
      icon: <Server className="w-6 h-6 text-purple-400" />,
      trend: mockKPIData.services.trend,
      subtitle: `MTTR: ${mockKPIData.services.mttr}時間`,
      color: 'purple'
    }
  ], []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">分析ダッシュボード</h1>
              <p className="text-gray-300">ITサービス管理の包括的な分析と洞察</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">過去7日</option>
                <option value="30d">過去30日</option>
                <option value="90d">過去90日</option>
                <option value="365d">過去1年</option>
              </select>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" />
                エクスポート
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((card, index) => (
            <KPICard key={index} {...card} />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Incident Trends */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                インシデント推移
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center text-sm text-gray-300">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  発生件数
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  解決件数
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockIncidentTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="incidents"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stackId="2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Problem Patterns */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              問題パターン分析
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={mockProblemPatternData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ category, percentage }) => `${category} ${percentage}%`}
                >
                  {mockProblemPatternData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Service Level Analytics */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              SLA達成状況
            </h2>
            <div className="space-y-4">
              {mockServiceLevelData.map((service, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{service.service}</span>
                    <span className={`text-sm ${service.actual >= service.sla ? 'text-green-400' : 'text-red-400'}`}>
                      {service.actual}% / {service.sla}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${service.actual >= service.sla ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${(service.actual / service.sla) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>インシデント: {service.incidents}件</span>
                    <span>目標: {service.sla}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Change Success Rate */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              変更成功率推移
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockChangeSuccessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="successful" fill="#10B981" name="成功" />
                <Bar dataKey="failed" fill="#EF4444" name="失敗" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Activity and System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Activity */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              ユーザー活動パターン
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockUserActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="hour" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#06B6D4"
                  strokeWidth={3}
                  dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* System Health Metrics */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Server className="w-5 h-5" />
              システム健全性メトリクス
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">CPU使用率</span>
                  <span className="text-white font-semibold">67%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">メモリ使用率</span>
                  <span className="text-white font-semibold">54%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '54%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">ディスク使用率</span>
                  <span className="text-white font-semibold">82%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">ネットワーク負荷</span>
                  <span className="text-white font-semibold">34%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '34%' }}></div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 text-blue-300">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">システム稼働時間</span>
                </div>
                <div className="text-white text-lg font-bold mt-1">99.97% (30日間)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;