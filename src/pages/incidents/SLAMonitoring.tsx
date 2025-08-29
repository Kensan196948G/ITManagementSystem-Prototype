import React, { useState } from 'react';
import { Timer, TrendingUp, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';

interface SLAMetric {
  id: string;
  name: string;
  target: number;
  current: number;
  status: 'On Track' | 'At Risk' | 'Breached';
  trend: 'up' | 'down' | 'stable';
  incidents: number;
  avgResolutionTime: string;
}

interface SLAAlert {
  id: string;
  incidentId: string;
  title: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  timeRemaining: string;
  status: 'Warning' | 'Critical';
  assignee: string;
}

const SLAMonitoring: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const slaMetrics: SLAMetric[] = [
    {
      id: '1',
      name: 'クリティカル インシデント解決時間',
      target: 2.0,
      current: 1.8,
      status: 'On Track',
      trend: 'down',
      incidents: 15,
      avgResolutionTime: '1時間48分'
    },
    {
      id: '2',
      name: '高優先度 インシデント解決時間',
      target: 4.0,
      current: 4.2,
      status: 'At Risk',
      trend: 'up',
      incidents: 42,
      avgResolutionTime: '4時間12分'
    },
    {
      id: '3',
      name: '中優先度 インシデント解決時間',
      target: 24.0,
      current: 18.5,
      status: 'On Track',
      trend: 'down',
      incidents: 89,
      avgResolutionTime: '18時間30分'
    },
    {
      id: '4',
      name: '低優先度 インシデント解決時間',
      target: 72.0,
      current: 68.2,
      status: 'On Track',
      trend: 'stable',
      incidents: 156,
      avgResolutionTime: '68時間12分'
    }
  ];

  const slaAlerts: SLAAlert[] = [
    {
      id: '1',
      incidentId: 'INC-2024-001',
      title: 'メールサーバーの応答遅延',
      priority: 'Critical',
      timeRemaining: '15分',
      status: 'Critical',
      assignee: '田中 太郎'
    },
    {
      id: '2',
      incidentId: 'INC-2024-002',
      title: 'VPNログイン問題',
      priority: 'High',
      timeRemaining: '1時間30分',
      status: 'Warning',
      assignee: '山田 次郎'
    },
    {
      id: '3',
      incidentId: 'INC-2024-005',
      title: 'Webアプリケーションの応答遅延',
      priority: 'High',
      timeRemaining: '45分',
      status: 'Warning',
      assignee: '高橋 美咲'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'text-green-600 bg-green-100';
      case 'At Risk': return 'text-yellow-600 bg-yellow-100';
      case 'Breached': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-green-500 transform rotate-180" />;
      case 'stable': return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
      default: return null;
    }
  };

  const getAlertColor = (status: string) => {
    switch (status) {
      case 'Critical': return 'border-red-500 bg-red-50';
      case 'Warning': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Timer className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">SLAモニタリング</h1>
        </div>
        <div className="flex items-center space-x-4">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="Today">今日</option>
            <option value="This Week">今週</option>
            <option value="This Month">今月</option>
            <option value="This Quarter">今四半期</option>
          </select>
        </div>
      </div>

      {/* SLA概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">全体SLA達成率</p>
              <p className="text-2xl font-bold text-green-600">94.2%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">SLA違反件数</p>
              <p className="text-2xl font-bold text-red-600">8</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">リスクレベル</p>
              <p className="text-2xl font-bold text-yellow-600">3</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均解決時間</p>
              <p className="text-2xl font-bold text-blue-600">6.4h</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Timer className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* SLAメトリクス */}
        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 text-blue-600 mr-2" />
            SLA達成状況
          </h2>
          
          <div className="space-y-4">
            {slaMetrics.map((metric) => (
              <div key={metric.id} className="border border-gray-200 rounded-lg p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 text-sm">{metric.name}</h3>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(metric.trend)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>目標: {metric.target}時間</span>
                  <span>現在: {metric.current}時間</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metric.current <= metric.target ? 'bg-green-600' : 
                      metric.current <= metric.target * 1.1 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ 
                      width: `${Math.min((metric.target / metric.current) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{metric.incidents}件のインシデント</span>
                  <span>平均: {metric.avgResolutionTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLAアラート */}
        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            SLAアラート
          </h2>
          
          <div className="space-y-4">
            {slaAlerts.map((alert) => (
              <div key={alert.id} className={`border-2 rounded-lg p-4 ${getAlertColor(alert.status)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">
                        {alert.incidentId}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                        {alert.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{alert.title}</p>
                  </div>
                  <div className={`text-right ${alert.status === 'Critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                    <div className="text-sm font-bold">
                      {alert.timeRemaining}
                    </div>
                    <div className="text-xs">残り時間</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-600">
                    <span>担当: {alert.assignee}</span>
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    alert.status === 'Critical' ? 'text-red-700 bg-red-200' : 'text-yellow-700 bg-yellow-200'
                  }`}>
                    {alert.status === 'Critical' ? 'SLA違反リスク' : 'SLA注意'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SLAパフォーマンス履歴 */}
      <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
          SLAパフォーマンス履歴
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">96.5%</div>
            <div className="text-sm text-gray-600">先月</div>
            <div className="text-xs text-gray-500">目標: 95%</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">94.2%</div>
            <div className="text-sm text-gray-600">今月</div>
            <div className="text-xs text-gray-500">目標: 95%</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">95.8%</div>
            <div className="text-sm text-gray-600">3ヶ月平均</div>
            <div className="text-xs text-gray-500">目標: 95%</div>
          </div>
        </div>
        
        {/* 簡易グラフエリア */}
        <div className="mt-6 h-32 bg-gray-100/50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">パフォーマンスグラフ（実装予定）</p>
        </div>
      </div>
    </div>
  );
};

export default SLAMonitoring;