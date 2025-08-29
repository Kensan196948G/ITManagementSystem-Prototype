import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Users,
  Target,
  Calendar,
  BarChart3,
  Link,
  Settings
} from 'lucide-react';

// OLA interface
interface OLA {
  id: string;
  name: string;
  internalTeam: string;
  supportingTeam: string;
  relatedSLA: string[];
  status: 'active' | 'draft' | 'expired' | 'under-negotiation';
  responseTime: string;
  resolutionTime: string;
  escalationTime: string;
  availabilityTarget: string;
  maintenanceNotice: string;
  performanceMetrics: {
    responseTimeCompliance: number;
    resolutionTimeCompliance: number;
    availabilityCompliance: number;
  };
  reviewCycle: string;
  owner: string;
  approvedBy: string;
  lastReviewDate: string;
  nextReviewDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockOLAs: OLA[] = [
  {
    id: 'OLA-001',
    name: 'ネットワークインフラサポート合意書',
    internalTeam: 'アプリケーションサポートチーム',
    supportingTeam: 'ネットワークチーム',
    relatedSLA: ['SLA-001', 'SLA-003'],
    status: 'active',
    responseTime: '15分以内',
    resolutionTime: '2時間以内',
    escalationTime: '30分以内',
    availabilityTarget: '99.9%',
    maintenanceNotice: '24時間前',
    performanceMetrics: {
      responseTimeCompliance: 98.5,
      resolutionTimeCompliance: 95.2,
      availabilityCompliance: 99.8
    },
    reviewCycle: '四半期ごと',
    owner: '田中太郎',
    approvedBy: '佐藤部長',
    lastReviewDate: '2025-06-15',
    nextReviewDate: '2025-09-15',
    description: 'アプリケーションサポートチームが提供するサービスを支援するためのネットワークインフラに関する合意書',
    createdAt: '2025-01-15',
    updatedAt: '2025-06-15'
  },
  {
    id: 'OLA-002',
    name: 'データベース管理サポート合意書',
    internalTeam: 'アプリケーション開発チーム',
    supportingTeam: 'データベースチーム',
    relatedSLA: ['SLA-002', 'SLA-004'],
    status: 'active',
    responseTime: '30分以内',
    resolutionTime: '4時間以内',
    escalationTime: '1時間以内',
    availabilityTarget: '99.5%',
    maintenanceNotice: '48時間前',
    performanceMetrics: {
      responseTimeCompliance: 97.8,
      resolutionTimeCompliance: 93.1,
      availabilityCompliance: 99.7
    },
    reviewCycle: '半年ごと',
    owner: '山田花子',
    approvedBy: '鈴木部長',
    lastReviewDate: '2025-03-01',
    nextReviewDate: '2025-09-01',
    description: 'アプリケーション開発チームが必要とするデータベース管理およびサポートに関する合意書',
    createdAt: '2025-01-20',
    updatedAt: '2025-03-01'
  },
  {
    id: 'OLA-003',
    name: 'セキュリティ監査・対応合意書',
    internalTeam: 'インフラチーム',
    supportingTeam: 'セキュリティチーム',
    relatedSLA: ['SLA-001', 'SLA-005'],
    status: 'under-negotiation',
    responseTime: '1時間以内',
    resolutionTime: '8時間以内',
    escalationTime: '2時間以内',
    availabilityTarget: '99.9%',
    maintenanceNotice: '72時間前',
    performanceMetrics: {
      responseTimeCompliance: 89.2,
      resolutionTimeCompliance: 87.5,
      availabilityCompliance: 98.9
    },
    reviewCycle: '月次',
    owner: '高橋一郎',
    approvedBy: '交渉中',
    lastReviewDate: '2025-07-01',
    nextReviewDate: '2025-10-01',
    description: 'インフラチームが管理するシステムのセキュリティ監査および脅威対応に関する合意書',
    createdAt: '2025-02-10',
    updatedAt: '2025-08-01'
  }
];

const OLAs: React.FC = () => {
  const [olas, setOlas] = useState<OLA[]>(mockOLAs);
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'create' | 'edit'>('list');
  const [selectedOLA, setSelectedOLA] = useState<OLA | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // Get status color
  const getStatusColor = (status: OLA['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'draft':
        return 'text-blue-600 bg-blue-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      case 'under-negotiation':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status: OLA['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      case 'under-negotiation':
        return <Settings className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Get status text
  const getStatusText = (status: OLA['status']) => {
    switch (status) {
      case 'active':
        return 'アクティブ';
      case 'draft':
        return 'ドラフト';
      case 'expired':
        return '期限切れ';
      case 'under-negotiation':
        return '交渉中';
      default:
        return '不明';
    }
  };

  // Get performance color
  const getPerformanceColor = (value: number) => {
    if (value >= 95) return 'text-green-600';
    if (value >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Filter OLAs
  const filteredOLAs = olas.filter(ola => {
    const matchesSearch = ola.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ola.internalTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ola.supportingTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ola.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ola.status === statusFilter;
    const matchesTeam = teamFilter === 'all' || 
                       ola.internalTeam.includes(teamFilter) || 
                       ola.supportingTeam.includes(teamFilter);
    
    return matchesSearch && matchesStatus && matchesTeam;
  });

  // Get unique teams for filter
  const uniqueTeams = Array.from(new Set([
    ...olas.map(ola => ola.internalTeam),
    ...olas.map(ola => ola.supportingTeam)
  ]));

  // Handle view OLA
  const handleViewOLA = (ola: OLA) => {
    setSelectedOLA(ola);
    setCurrentView('detail');
  };

  // Handle edit OLA
  const handleEditOLA = (ola: OLA) => {
    setSelectedOLA(ola);
    setCurrentView('edit');
  };

  // Handle delete OLA
  const handleDeleteOLA = (id: string) => {
    setOlas(olas.filter(ola => ola.id !== id));
  };

  // Handle create new OLA
  const handleCreateOLA = () => {
    setSelectedOLA(null);
    setCurrentView('create');
  };

  // Handle back to list
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedOLA(null);
  };

  // Handle save OLA
  const handleSaveOLA = (olaData: Partial<OLA>) => {
    if (currentView === 'create') {
      const newOLA: OLA = {
        id: `OLA-${String(olas.length + 1).padStart(3, '0')}`,
        name: olaData.name || '',
        internalTeam: olaData.internalTeam || '',
        supportingTeam: olaData.supportingTeam || '',
        relatedSLA: olaData.relatedSLA || [],
        status: olaData.status || 'draft',
        responseTime: olaData.responseTime || '',
        resolutionTime: olaData.resolutionTime || '',
        escalationTime: olaData.escalationTime || '',
        availabilityTarget: olaData.availabilityTarget || '',
        maintenanceNotice: olaData.maintenanceNotice || '',
        performanceMetrics: olaData.performanceMetrics || {
          responseTimeCompliance: 0,
          resolutionTimeCompliance: 0,
          availabilityCompliance: 0
        },
        reviewCycle: olaData.reviewCycle || '',
        owner: olaData.owner || '',
        approvedBy: olaData.approvedBy || '',
        lastReviewDate: olaData.lastReviewDate || '',
        nextReviewDate: olaData.nextReviewDate || '',
        description: olaData.description || '',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setOlas([...olas, newOLA]);
    } else if (currentView === 'edit' && selectedOLA) {
      const updatedOLA = {
        ...selectedOLA,
        ...olaData,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setOlas(olas.map(ola => ola.id === selectedOLA.id ? updatedOLA : ola));
    }
    handleBackToList();
  };

  // Render OLA form
  const renderOLAForm = () => {
    const isEdit = currentView === 'edit';
    const formData = selectedOLA || {};

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToList}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>一覧に戻る</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {isEdit ? 'OLA編集' : 'OLA作成'}
            </h2>
          </div>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const olaData = {
              name: formData.get('name') as string,
              internalTeam: formData.get('internalTeam') as string,
              supportingTeam: formData.get('supportingTeam') as string,
              status: formData.get('status') as OLA['status'],
              responseTime: formData.get('responseTime') as string,
              resolutionTime: formData.get('resolutionTime') as string,
              escalationTime: formData.get('escalationTime') as string,
              availabilityTarget: formData.get('availabilityTarget') as string,
              maintenanceNotice: formData.get('maintenanceNotice') as string,
              reviewCycle: formData.get('reviewCycle') as string,
              owner: formData.get('owner') as string,
              approvedBy: formData.get('approvedBy') as string,
              description: formData.get('description') as string,
            };
            handleSaveOLA(olaData);
          }}
          className="bg-white/10 backdrop-blur-md rounded-lg p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OLA名
              </label>
              <input
                type="text"
                name="name"
                defaultValue={formData.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                name="status"
                defaultValue={formData.status}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">ドラフト</option>
                <option value="active">アクティブ</option>
                <option value="under-negotiation">交渉中</option>
                <option value="expired">期限切れ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                内部チーム（要求側）
              </label>
              <input
                type="text"
                name="internalTeam"
                defaultValue={formData.internalTeam}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                サポートチーム（提供側）
              </label>
              <input
                type="text"
                name="supportingTeam"
                defaultValue={formData.supportingTeam}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                応答時間
              </label>
              <input
                type="text"
                name="responseTime"
                defaultValue={formData.responseTime}
                placeholder="例: 30分以内"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                解決時間
              </label>
              <input
                type="text"
                name="resolutionTime"
                defaultValue={formData.resolutionTime}
                placeholder="例: 4時間以内"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                エスカレーション時間
              </label>
              <input
                type="text"
                name="escalationTime"
                defaultValue={formData.escalationTime}
                placeholder="例: 1時間以内"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                可用性目標
              </label>
              <input
                type="text"
                name="availabilityTarget"
                defaultValue={formData.availabilityTarget}
                placeholder="例: 99.5%"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メンテナンス通知期間
              </label>
              <input
                type="text"
                name="maintenanceNotice"
                defaultValue={formData.maintenanceNotice}
                placeholder="例: 24時間前"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                レビューサイクル
              </label>
              <input
                type="text"
                name="reviewCycle"
                defaultValue={formData.reviewCycle}
                placeholder="例: 四半期ごと"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                責任者
              </label>
              <input
                type="text"
                name="owner"
                defaultValue={formData.owner}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                承認者
              </label>
              <input
                type="text"
                name="approvedBy"
                defaultValue={formData.approvedBy}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明
            </label>
            <textarea
              name="description"
              defaultValue={formData.description}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleBackToList}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Render OLA detail
  const renderOLADetail = () => {
    if (!selectedOLA) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToList}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>一覧に戻る</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-800">OLA詳細</h2>
          </div>
          <button
            onClick={() => handleEditOLA(selectedOLA)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit3 className="w-4 h-4" />
            <span>編集</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 基本情報 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              基本情報
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">OLA ID:</span>
                <p className="font-medium">{selectedOLA.id}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">OLA名:</span>
                <p className="font-medium">{selectedOLA.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">ステータス:</span>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOLA.status)}`}>
                  {getStatusIcon(selectedOLA.status)}
                  <span>{getStatusText(selectedOLA.status)}</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">説明:</span>
                <p className="font-medium">{selectedOLA.description}</p>
              </div>
            </div>
          </div>

          {/* チーム情報 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              チーム情報
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">内部チーム（要求側）:</span>
                <p className="font-medium">{selectedOLA.internalTeam}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">サポートチーム（提供側）:</span>
                <p className="font-medium">{selectedOLA.supportingTeam}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">責任者:</span>
                <p className="font-medium">{selectedOLA.owner}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">承認者:</span>
                <p className="font-medium">{selectedOLA.approvedBy}</p>
              </div>
            </div>
          </div>

          {/* サービスレベル目標 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              サービスレベル目標
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">応答時間:</span>
                <p className="font-medium">{selectedOLA.responseTime}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">解決時間:</span>
                <p className="font-medium">{selectedOLA.resolutionTime}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">エスカレーション時間:</span>
                <p className="font-medium">{selectedOLA.escalationTime}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">可用性目標:</span>
                <p className="font-medium">{selectedOLA.availabilityTarget}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">メンテナンス通知期間:</span>
                <p className="font-medium">{selectedOLA.maintenanceNotice}</p>
              </div>
            </div>
          </div>

          {/* パフォーマンス指標 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              パフォーマンス指標
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">応答時間遵守率:</span>
                <p className={`font-medium ${getPerformanceColor(selectedOLA.performanceMetrics.responseTimeCompliance)}`}>
                  {selectedOLA.performanceMetrics.responseTimeCompliance}%
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">解決時間遵守率:</span>
                <p className={`font-medium ${getPerformanceColor(selectedOLA.performanceMetrics.resolutionTimeCompliance)}`}>
                  {selectedOLA.performanceMetrics.resolutionTimeCompliance}%
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">可用性遵守率:</span>
                <p className={`font-medium ${getPerformanceColor(selectedOLA.performanceMetrics.availabilityCompliance)}`}>
                  {selectedOLA.performanceMetrics.availabilityCompliance}%
                </p>
              </div>
            </div>
          </div>

          {/* レビュー情報 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              レビュー情報
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">レビューサイクル:</span>
                <p className="font-medium">{selectedOLA.reviewCycle}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">最終レビュー日:</span>
                <p className="font-medium">{selectedOLA.lastReviewDate}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">次回レビュー予定日:</span>
                <p className="font-medium">{selectedOLA.nextReviewDate}</p>
              </div>
            </div>
          </div>

          {/* 関連SLA */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Link className="w-5 h-5 mr-2" />
              関連SLA
            </h3>
            <div className="space-y-2">
              {selectedOLA.relatedSLA.map((slaId, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Link className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600 hover:underline cursor-pointer">{slaId}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    return (
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            運用レベル合意書（OLA）管理
          </h1>
          <button
            onClick={handleCreateOLA}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>新規OLA作成</span>
          </button>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="OLA名、チーム名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべてのステータス</option>
              <option value="active">アクティブ</option>
              <option value="draft">ドラフト</option>
              <option value="under-negotiation">交渉中</option>
              <option value="expired">期限切れ</option>
            </select>

            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべてのチーム</option>
              {uniqueTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
        </div>

        {/* OLAリスト */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOLAs.map((ola) => (
            <div
              key={ola.id}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition-colors cursor-pointer"
              onClick={() => handleViewOLA(ola)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{ola.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{ola.id}</p>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(ola.status)}`}>
                    {getStatusIcon(ola.status)}
                    <span>{getStatusText(ola.status)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditOLA(ola);
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white/20 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOLA(ola.id);
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-white/20 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{ola.internalTeam} ↔ {ola.supportingTeam}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">応答: {ola.responseTime}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">可用性: {ola.availabilityTarget}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="text-xs text-gray-600 mb-2">パフォーマンス指標</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className={`font-medium ${getPerformanceColor(ola.performanceMetrics.responseTimeCompliance)}`}>
                      {ola.performanceMetrics.responseTimeCompliance}%
                    </div>
                    <div className="text-gray-500">応答時間</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${getPerformanceColor(ola.performanceMetrics.resolutionTimeCompliance)}`}>
                      {ola.performanceMetrics.resolutionTimeCompliance}%
                    </div>
                    <div className="text-gray-500">解決時間</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${getPerformanceColor(ola.performanceMetrics.availabilityCompliance)}`}>
                      {ola.performanceMetrics.availabilityCompliance}%
                    </div>
                    <div className="text-gray-500">可用性</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOLAs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">該当するOLAが見つかりませんでした。</p>
          </div>
        )}
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {currentView === 'list' && renderListView()}
        {currentView === 'detail' && renderOLADetail()}
        {(currentView === 'create' || currentView === 'edit') && renderOLAForm()}
      </div>
    </div>
  );
};

export default OLAs;