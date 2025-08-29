import React, { useState } from 'react';
import { CheckCircle, Clock, User, Search, Filter, Calendar, BarChart3 } from 'lucide-react';

interface ResolvedIncident {
  id: string;
  title: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assignee: string;
  reportedBy: string;
  createdAt: string;
  resolvedAt: string;
  resolutionTime: string;
  rootCause: string;
  resolution: string;
  customerSatisfaction: number;
}

const ResolvedIncidents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [dateRange, setDateRange] = useState('Last 30 days');

  const mockResolvedIncidents: ResolvedIncident[] = [
    {
      id: 'INC-2024-010',
      title: 'データベース接続タイムアウト',
      priority: 'Critical',
      assignee: '田中 太郎',
      reportedBy: '佐藤 花子',
      createdAt: '2024-08-25 14:30',
      resolvedAt: '2024-08-25 18:45',
      resolutionTime: '4時間15分',
      rootCause: 'データベースサーバーのメモリ不足',
      resolution: 'メモリ増設とクエリ最適化を実施',
      customerSatisfaction: 4.2
    },
    {
      id: 'INC-2024-009',
      title: 'Webサイトアクセス障害',
      priority: 'High',
      assignee: '山田 次郎',
      reportedBy: '鈴木 一郎',
      createdAt: '2024-08-24 09:15',
      resolvedAt: '2024-08-24 11:30',
      resolutionTime: '2時間15分',
      rootCause: 'ロードバランサーの設定ミス',
      resolution: 'ロードバランサー設定を修正',
      customerSatisfaction: 4.5
    },
    {
      id: 'INC-2024-008',
      title: 'メール配信遅延',
      priority: 'Medium',
      assignee: '高橋 美咲',
      reportedBy: '中村 健太',
      createdAt: '2024-08-23 16:00',
      resolvedAt: '2024-08-24 10:00',
      resolutionTime: '18時間',
      rootCause: 'メールキューの処理能力不足',
      resolution: 'メールサーバーの性能向上とキュー設定調整',
      customerSatisfaction: 3.8
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSatisfactionColor = (score: number) => {
    if (score >= 4.0) return 'text-green-600';
    if (score >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">解決済みインシデント</h1>
        </div>
        <div className="text-sm text-gray-500">
          最終更新: 2024-08-28 12:30
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今月解決済み</p>
              <p className="text-2xl font-bold text-green-600">47</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均解決時間</p>
              <p className="text-2xl font-bold text-blue-600">3.2h</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">顧客満足度</p>
              <p className="text-2xl font-bold text-purple-600">4.3</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">SLA遵守率</p>
              <p className="text-2xl font-bold text-green-600">94%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* フィルターとサーチ */}
      <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="解決済みインシデントを検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="All">すべての優先度</option>
              <option value="Critical">クリティカル</option>
              <option value="High">高</option>
              <option value="Medium">中</option>
              <option value="Low">低</option>
            </select>
            <Calendar className="h-5 w-5 text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="Last 7 days">過去7日</option>
              <option value="Last 30 days">過去30日</option>
              <option value="Last 90 days">過去90日</option>
              <option value="Last year">過去1年</option>
            </select>
          </div>
        </div>
      </div>

      {/* 解決済みインシデントテーブル */}
      <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  インシデント
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  優先度
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  担当者
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  解決時間
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  解決日時
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客満足度
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockResolvedIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-white/10 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {incident.id}
                      </div>
                      <div className="text-sm text-gray-600">
                        {incident.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        根本原因: {incident.rootCause}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        解決策: {incident.resolution}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(incident.priority)}`}>
                      {incident.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{incident.assignee}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      報告者: {incident.reportedBy}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{incident.resolutionTime}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      開始: {incident.createdAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {incident.resolvedAt}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`text-lg font-bold ${getSatisfactionColor(incident.customerSatisfaction)}`}>
                        {incident.customerSatisfaction}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">/5.0</span>
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${incident.customerSatisfaction >= 4.0 ? 'bg-green-600' : incident.customerSatisfaction >= 3.0 ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${(incident.customerSatisfaction / 5.0) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResolvedIncidents;