import React, { useState, useEffect } from 'react';
import {
  AlertTriangleIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  RefreshCwIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  category: string;
  assignedTo?: string;
  reportedBy: string;
  affectedServices: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  impact: 'Low' | 'Medium' | 'High';
  urgency: 'Low' | 'Medium' | 'High';
}

interface NewIncidentForm {
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
  affectedServices: string[];
  impact: 'Low' | 'Medium' | 'High';
  urgency: 'Low' | 'Medium' | 'High';
}

const IncidentManagement: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [showNewIncidentForm, setShowNewIncidentForm] = useState(false);
  const [newIncident, setNewIncident] = useState<NewIncidentForm>({
    title: '',
    description: '',
    priority: 'Medium',
    category: '',
    affectedServices: [],
    impact: 'Medium',
    urgency: 'Medium'
  });

  // Sample data
  const sampleIncidents: Incident[] = [
    {
      id: 'INC-001',
      title: 'メールサーバーの応答遅延',
      description: '社内メールシステムにおいて、メール送受信の遅延が発生しています。',
      priority: 'High',
      status: 'In Progress',
      category: 'インフラストラクチャ',
      assignedTo: '田中 太郎',
      reportedBy: '佐藤 花子',
      affectedServices: ['Exchange Server', 'Outlook Web App'],
      createdAt: '2024-01-15 09:30:00',
      updatedAt: '2024-01-15 11:45:00',
      impact: 'High',
      urgency: 'High'
    },
    {
      id: 'INC-002',
      title: 'VPNアクセスの断続的な障害',
      description: 'リモートワーカーのVPN接続が不安定になっています。',
      priority: 'Medium',
      status: 'Open',
      category: 'ネットワーク',
      reportedBy: '山田 次郎',
      affectedServices: ['FortiGate VPN', 'Remote Desktop'],
      createdAt: '2024-01-15 14:20:00',
      updatedAt: '2024-01-15 14:20:00',
      impact: 'Medium',
      urgency: 'Medium'
    },
    {
      id: 'INC-003',
      title: 'Webサイトの表示エラー',
      description: '企業サイトの特定ページで404エラーが発生しています。',
      priority: 'Low',
      status: 'Resolved',
      category: 'アプリケーション',
      assignedTo: '鈴木 一郎',
      reportedBy: '高橋 美咲',
      affectedServices: ['Corporate Website', 'CDN'],
      createdAt: '2024-01-14 16:15:00',
      updatedAt: '2024-01-15 10:30:00',
      resolvedAt: '2024-01-15 10:30:00',
      impact: 'Low',
      urgency: 'Low'
    },
    {
      id: 'INC-004',
      title: 'データベース接続エラー',
      description: 'CRMシステムでデータベース接続の問題が発生しています。',
      priority: 'Critical',
      status: 'Open',
      category: 'データベース',
      reportedBy: '伊藤 健太',
      affectedServices: ['CRM Database', 'Sales Portal'],
      createdAt: '2024-01-15 08:00:00',
      updatedAt: '2024-01-15 08:15:00',
      impact: 'High',
      urgency: 'High'
    }
  ];

  useEffect(() => {
    setIncidents(sampleIncidents);
    setFilteredIncidents(sampleIncidents);
  }, []);

  useEffect(() => {
    let filtered = incidents.filter(incident => {
      const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          incident.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || incident.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || incident.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    setFilteredIncidents(filtered);
  }, [incidents, searchTerm, statusFilter, priorityFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertCircleIcon className="w-4 h-4" />;
      case 'In Progress': return <ClockIcon className="w-4 h-4" />;
      case 'Resolved': return <CheckCircleIcon className="w-4 h-4" />;
      case 'Closed': return <XCircleIcon className="w-4 h-4" />;
      default: return <AlertCircleIcon className="w-4 h-4" />;
    }
  };

  const handleCreateIncident = () => {
    const incident: Incident = {
      id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
      ...newIncident,
      status: 'Open',
      reportedBy: 'Current User',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setIncidents([...incidents, incident]);
    setNewIncident({
      title: '',
      description: '',
      priority: 'Medium',
      category: '',
      affectedServices: [],
      impact: 'Medium',
      urgency: 'Medium'
    });
    setShowNewIncidentForm(false);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const renderIncidentForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">新規インシデント作成</h3>
          <button
            onClick={() => setShowNewIncidentForm(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">タイトル *</label>
            <input
              type="text"
              value={newIncident.title}
              onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="インシデントのタイトルを入力してください"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">説明 *</label>
            <textarea
              value={newIncident.description}
              onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="インシデントの詳細な説明を入力してください"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">優先度</label>
              <select
                value={newIncident.priority}
                onChange={(e) => setNewIncident({...newIncident, priority: e.target.value as any})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">影響度</label>
              <select
                value={newIncident.impact}
                onChange={(e) => setNewIncident({...newIncident, impact: e.target.value as any})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">緊急度</label>
              <select
                value={newIncident.urgency}
                onChange={(e) => setNewIncident({...newIncident, urgency: e.target.value as any})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリー</label>
            <select
              value={newIncident.category}
              onChange={(e) => setNewIncident({...newIncident, category: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">カテゴリーを選択</option>
              <option value="ハードウェア">ハードウェア</option>
              <option value="ソフトウェア">ソフトウェア</option>
              <option value="ネットワーク">ネットワーク</option>
              <option value="インフラストラクチャ">インフラストラクチャ</option>
              <option value="アプリケーション">アプリケーション</option>
              <option value="データベース">データベース</option>
              <option value="セキュリティ">セキュリティ</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={() => setShowNewIncidentForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleCreateIncident}
              disabled={!newIncident.title || !newIncident.description}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              作成
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center">
              <AlertTriangleIcon className="w-8 h-8 mr-3 text-orange-500" />
              インシデント管理
            </h1>
            <p className="text-gray-600 mt-2">
              ITサービスの中断や品質低下を管理・追跡
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-md border border-white/20 rounded-lg shadow-lg hover:bg-white/30 transition-all duration-300"
            >
              <RefreshCwIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              更新
            </button>
            <button
              onClick={() => setShowNewIncidentForm(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              新規作成
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="インシデントを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">全てのステータス</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">全ての優先度</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <button className="w-full flex items-center justify-center px-4 py-2 bg-white/20 border border-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <DownloadIcon className="w-4 h-4 mr-2" />
              エクスポート
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {filteredIncidents.filter(i => i.status === 'Open').length}
              </div>
              <div className="text-red-100">未対応</div>
            </div>
            <AlertCircleIcon className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {filteredIncidents.filter(i => i.status === 'In Progress').length}
              </div>
              <div className="text-yellow-100">対応中</div>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {filteredIncidents.filter(i => i.status === 'Resolved').length}
              </div>
              <div className="text-green-100">解決済み</div>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {filteredIncidents.length}
              </div>
              <div className="text-blue-100">合計</div>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-gray-800">
            インシデント一覧 ({filteredIncidents.length}件)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タイトル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  優先度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  担当者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリー
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50">
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-white/10 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{incident.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{incident.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{incident.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(incident.priority)}`}>
                      {incident.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(incident.status)}`}>
                      {getStatusIcon(incident.status)}
                      <span className="ml-1">{incident.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{incident.assignedTo || '未割り当て'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {new Date(incident.createdAt).toLocaleDateString('ja-JP')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <TagIcon className="w-4 h-4 mr-1" />
                      {incident.category}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredIncidents.length === 0 && (
          <div className="px-6 py-12 text-center">
            <AlertTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">インシデントが見つかりません</h3>
            <p className="text-gray-500">検索条件を変更するか、新しいインシデントを作成してください。</p>
          </div>
        )}
      </div>

      {/* New Incident Form Modal */}
      {showNewIncidentForm && renderIncidentForm()}
    </div>
  );
};

export default IncidentManagement;