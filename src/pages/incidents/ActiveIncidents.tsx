import React, { useState } from 'react';
import { AlertTriangle, Clock, User, Search, Filter, MoreHorizontal } from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
  assignee: string;
  reportedBy: string;
  createdAt: string;
  affectedServices: string[];
  estimatedResolution: string;
}

const ActiveIncidents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');

  const mockIncidents: Incident[] = [
    {
      id: 'INC-2024-001',
      title: 'メールサーバーの応答遅延',
      priority: 'Critical',
      status: 'In Progress',
      assignee: '田中 太郎',
      reportedBy: '佐藤 花子',
      createdAt: '2024-08-28 09:15',
      affectedServices: ['Email Service', 'Outlook Web Access'],
      estimatedResolution: '2024-08-28 15:00'
    },
    {
      id: 'INC-2024-002',
      title: 'VPNログイン問題',
      priority: 'High',
      status: 'Assigned',
      assignee: '山田 次郎',
      reportedBy: '鈴木 一郎',
      createdAt: '2024-08-28 10:30',
      affectedServices: ['VPN Service'],
      estimatedResolution: '2024-08-28 16:30'
    },
    {
      id: 'INC-2024-003',
      title: 'プリンター接続エラー',
      priority: 'Medium',
      status: 'New',
      assignee: '未割り当て',
      reportedBy: '高橋 美咲',
      createdAt: '2024-08-28 11:45',
      affectedServices: ['Print Service'],
      estimatedResolution: '2024-08-29 10:00'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'Assigned': return 'text-purple-600 bg-purple-100';
      case 'New': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-8 w-8 text-orange-600" />
          <h1 className="text-3xl font-bold text-gray-900">アクティブインシデント</h1>
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
              <p className="text-sm text-gray-600">クリティカル</p>
              <p className="text-2xl font-bold text-red-600">1</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">高優先度</p>
              <p className="text-2xl font-bold text-orange-600">1</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">中優先度</p>
              <p className="text-2xl font-bold text-yellow-600">1</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均解決時間</p>
              <p className="text-2xl font-bold text-blue-600">4.2h</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
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
              placeholder="インシデントを検索..."
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
          </div>
        </div>
      </div>

      {/* インシデントテーブル */}
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
                  ステータス
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  担当者
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日時
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  予想解決時刻
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockIncidents.map((incident) => (
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
                        影響サービス: {incident.affectedServices.join(', ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(incident.priority)}`}>
                      {incident.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status}
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
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {incident.createdAt}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {incident.estimatedResolution}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
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

export default ActiveIncidents;