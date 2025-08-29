import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Shield,
  TrendingUp,
  FileText,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';

interface SLA {
  id: string;
  name: string;
  serviceId: string;
  serviceName: string;
  status: 'active' | 'draft' | 'expired' | 'under_review';
  targetAvailability: number;
  targetResponseTime: {
    urgent: number; // minutes
    high: number;
    medium: number;
    low: number;
  };
  targetResolutionTime: {
    urgent: number; // hours
    high: number;
    medium: number;
    low: number;
  };
  maintenanceWindow: {
    day: string;
    startTime: string;
    endTime: string;
  };
  escalationPolicy: {
    level1: number; // minutes
    level2: number;
    level3: number;
  };
  penalties: {
    availabilityBelow95: number; // percentage
    responseTimeExceeded: number;
    resolutionTimeExceeded: number;
  };
  reviewDate: string;
  owner: string;
  approvedBy: string;
  createdDate: string;
  lastUpdated: string;
  currentMetrics: {
    uptimePercentage: number;
    averageResponseTime: {
      urgent: number;
      high: number;
      medium: number;
      low: number;
    };
    complianceScore: number;
  };
}

const mockSLAs: SLA[] = [
  {
    id: '1',
    name: 'Eメールサービス SLA',
    serviceId: 'email-001',
    serviceName: 'Eメールサービス',
    status: 'active',
    targetAvailability: 99.9,
    targetResponseTime: {
      urgent: 15,
      high: 30,
      medium: 60,
      low: 120
    },
    targetResolutionTime: {
      urgent: 4,
      high: 8,
      medium: 24,
      low: 72
    },
    maintenanceWindow: {
      day: '日曜日',
      startTime: '02:00',
      endTime: '06:00'
    },
    escalationPolicy: {
      level1: 30,
      level2: 60,
      level3: 120
    },
    penalties: {
      availabilityBelow95: 10,
      responseTimeExceeded: 5,
      resolutionTimeExceeded: 15
    },
    reviewDate: '2024-06-30',
    owner: '田中 太郎',
    approvedBy: '佐藤 花子',
    createdDate: '2024-01-15',
    lastUpdated: '2024-02-20',
    currentMetrics: {
      uptimePercentage: 99.95,
      averageResponseTime: {
        urgent: 12,
        high: 25,
        medium: 45,
        low: 90
      },
      complianceScore: 98.5
    }
  },
  {
    id: '2',
    name: 'ネットワークインフラ SLA',
    serviceId: 'network-001',
    serviceName: 'ネットワークインフラ',
    status: 'active',
    targetAvailability: 99.95,
    targetResponseTime: {
      urgent: 10,
      high: 20,
      medium: 45,
      low: 90
    },
    targetResolutionTime: {
      urgent: 2,
      high: 4,
      medium: 12,
      low: 48
    },
    maintenanceWindow: {
      day: '土曜日',
      startTime: '01:00',
      endTime: '05:00'
    },
    escalationPolicy: {
      level1: 15,
      level2: 30,
      level3: 60
    },
    penalties: {
      availabilityBelow95: 20,
      responseTimeExceeded: 10,
      resolutionTimeExceeded: 25
    },
    reviewDate: '2024-12-31',
    owner: '山田 次郎',
    approvedBy: '田中 太郎',
    createdDate: '2024-01-01',
    lastUpdated: '2024-03-15',
    currentMetrics: {
      uptimePercentage: 99.98,
      averageResponseTime: {
        urgent: 8,
        high: 18,
        medium: 35,
        low: 75
      },
      complianceScore: 99.2
    }
  },
  {
    id: '3',
    name: 'データベースサービス SLA',
    serviceId: 'database-001',
    serviceName: 'データベースサービス',
    status: 'under_review',
    targetAvailability: 99.99,
    targetResponseTime: {
      urgent: 5,
      high: 15,
      medium: 30,
      low: 60
    },
    targetResolutionTime: {
      urgent: 1,
      high: 2,
      medium: 8,
      low: 24
    },
    maintenanceWindow: {
      day: '日曜日',
      startTime: '03:00',
      endTime: '06:00'
    },
    escalationPolicy: {
      level1: 10,
      level2: 20,
      level3: 40
    },
    penalties: {
      availabilityBelow95: 30,
      responseTimeExceeded: 15,
      resolutionTimeExceeded: 35
    },
    reviewDate: '2024-09-30',
    owner: '鈴木 三郎',
    approvedBy: '佐藤 花子',
    createdDate: '2024-02-01',
    lastUpdated: '2024-08-15',
    currentMetrics: {
      uptimePercentage: 99.92,
      averageResponseTime: {
        urgent: 6,
        high: 14,
        medium: 28,
        low: 55
      },
      complianceScore: 97.8
    }
  }
];

const statusConfig = {
  active: { label: 'アクティブ', color: 'text-green-400', bg: 'bg-green-500/20' },
  draft: { label: 'ドラフト', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  expired: { label: '期限切れ', color: 'text-red-400', bg: 'bg-red-500/20' },
  under_review: { label: 'レビュー中', color: 'text-blue-400', bg: 'bg-blue-500/20' }
};

const priorityLabels = {
  urgent: '緊急',
  high: '高',
  medium: '中',
  low: '低'
};

export default function SLAs() {
  const [slas, setSLAs] = useState<SLA[]>(mockSLAs);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create' | 'edit'>('list');
  const [selectedSLA, setSelectedSLA] = useState<SLA | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [editingSLA, setEditingSLA] = useState<Partial<SLA>>({});

  const filteredSLAs = useMemo(() => {
    return slas.filter(sla => {
      const matchesSearch = sla.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sla.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sla.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || sla.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [slas, searchTerm, statusFilter]);

  const handleViewDetail = (sla: SLA) => {
    setSelectedSLA(sla);
    setViewMode('detail');
  };

  const handleEdit = (sla: SLA) => {
    setSelectedSLA(sla);
    setEditingSLA(sla);
    setViewMode('edit');
  };

  const handleCreate = () => {
    setEditingSLA({
      name: '',
      serviceId: '',
      serviceName: '',
      status: 'draft',
      targetAvailability: 99.9,
      targetResponseTime: { urgent: 15, high: 30, medium: 60, low: 120 },
      targetResolutionTime: { urgent: 4, high: 8, medium: 24, low: 72 },
      maintenanceWindow: { day: '日曜日', startTime: '02:00', endTime: '06:00' },
      escalationPolicy: { level1: 30, level2: 60, level3: 120 },
      penalties: { availabilityBelow95: 10, responseTimeExceeded: 5, resolutionTimeExceeded: 15 },
      owner: '',
      approvedBy: ''
    });
    setViewMode('create');
  };

  const handleSave = () => {
    if (viewMode === 'create') {
      const newSLA: SLA = {
        ...editingSLA as SLA,
        id: Date.now().toString(),
        createdDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currentMetrics: {
          uptimePercentage: 0,
          averageResponseTime: { urgent: 0, high: 0, medium: 0, low: 0 },
          complianceScore: 0
        }
      };
      setSLAs([...slas, newSLA]);
    } else if (viewMode === 'edit' && selectedSLA) {
      setSLAs(slas.map(sla => 
        sla.id === selectedSLA.id 
          ? { ...editingSLA as SLA, id: selectedSLA.id, lastUpdated: new Date().toISOString().split('T')[0] }
          : sla
      ));
    }
    setViewMode('list');
    setEditingSLA({});
    setSelectedSLA(null);
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingSLA({});
    setSelectedSLA(null);
  };

  const renderListView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">SLA管理</h1>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>新規SLA</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="SLA名、サービス名、オーナーで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Filter className="h-5 w-5" />
            <span>フィルター</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ステータス</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="active">アクティブ</option>
                <option value="draft">ドラフト</option>
                <option value="expired">期限切れ</option>
                <option value="under_review">レビュー中</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* SLAs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSLAs.map((sla) => (
          <div key={sla.id} className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{sla.name}</h3>
                <p className="text-gray-300 text-sm mb-2">サービス: {sla.serviceName}</p>
                <div className="flex items-center space-x-4">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[sla.status].bg} ${statusConfig[sla.status].color}`}>
                    {statusConfig[sla.status].label}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-300">
                    <Target className="h-4 w-4" />
                    <span>{sla.targetAvailability}%</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetail(sla)}
                  className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(sla)}
                  className="p-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">稼働率</span>
                <span className={`text-sm font-medium ${sla.currentMetrics.uptimePercentage >= sla.targetAvailability ? 'text-green-400' : 'text-red-400'}`}>
                  {sla.currentMetrics.uptimePercentage}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">コンプライアンススコア</span>
                <span className={`text-sm font-medium ${sla.currentMetrics.complianceScore >= 95 ? 'text-green-400' : sla.currentMetrics.complianceScore >= 90 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {sla.currentMetrics.complianceScore}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">オーナー</span>
                <span className="text-sm text-gray-300">{sla.owner}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">次回レビュー</span>
                <span className="text-sm text-gray-300">{sla.reviewDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSLAs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">SLAが見つかりません</p>
        </div>
      )}
    </div>
  );

  const renderDetailView = () => {
    if (!selectedSLA) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">{selectedSLA.name}</h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedSLA.status].bg} ${statusConfig[selectedSLA.status].color}`}>
              {statusConfig[selectedSLA.status].label}
            </div>
          </div>
          <button
            onClick={() => handleEdit(selectedSLA)}
            className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Edit2 className="h-5 w-5" />
            <span>編集</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">基本情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">SLA名</label>
                  <p className="text-white">{selectedSLA.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">対象サービス</label>
                  <p className="text-white">{selectedSLA.serviceName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">オーナー</label>
                  <p className="text-white">{selectedSLA.owner}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">承認者</label>
                  <p className="text-white">{selectedSLA.approvedBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">作成日</label>
                  <p className="text-white">{selectedSLA.createdDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">次回レビュー</label>
                  <p className="text-white">{selectedSLA.reviewDate}</p>
                </div>
              </div>
            </div>

            {/* Target Metrics */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">目標指標</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">目標稼働率</label>
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-semibold">{selectedSLA.targetAvailability}%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">目標応答時間 (分)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(selectedSLA.targetResponseTime).map(([priority, time]) => (
                      <div key={priority} className="text-center p-2 bg-white/5 rounded">
                        <div className="text-xs text-gray-400">{priorityLabels[priority as keyof typeof priorityLabels]}</div>
                        <div className="text-white font-semibold">{time}分</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">目標解決時間 (時間)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(selectedSLA.targetResolutionTime).map(([priority, time]) => (
                      <div key={priority} className="text-center p-2 bg-white/5 rounded">
                        <div className="text-xs text-gray-400">{priorityLabels[priority as keyof typeof priorityLabels]}</div>
                        <div className="text-white font-semibold">{time}時間</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Penalties */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">ペナルティ条項</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">稼働率95%未満</span>
                  <span className="text-red-400">{selectedSLA.penalties.availabilityBelow95}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">応答時間超過</span>
                  <span className="text-red-400">{selectedSLA.penalties.responseTimeExceeded}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">解決時間超過</span>
                  <span className="text-red-400">{selectedSLA.penalties.resolutionTimeExceeded}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Performance */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">現在の実績</h2>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    {selectedSLA.currentMetrics.uptimePercentage}%
                  </div>
                  <div className="text-sm text-gray-300">稼働率</div>
                  <div className={`mt-2 px-2 py-1 rounded text-xs ${selectedSLA.currentMetrics.uptimePercentage >= selectedSLA.targetAvailability ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {selectedSLA.currentMetrics.uptimePercentage >= selectedSLA.targetAvailability ? '目標達成' : '目標未達成'}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {selectedSLA.currentMetrics.complianceScore}%
                  </div>
                  <div className="text-sm text-gray-300">コンプライアンス</div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">平均応答時間</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedSLA.currentMetrics.averageResponseTime).map(([priority, time]) => (
                      <div key={priority} className="flex justify-between text-sm">
                        <span className="text-gray-400">{priorityLabels[priority as keyof typeof priorityLabels]}</span>
                        <span className={`${time <= selectedSLA.targetResponseTime[priority as keyof typeof selectedSLA.targetResponseTime] ? 'text-green-400' : 'text-red-400'}`}>
                          {time}分
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">メンテナンス時間</h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-white">{selectedSLA.maintenanceWindow.day}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-white">
                    {selectedSLA.maintenanceWindow.startTime} - {selectedSLA.maintenanceWindow.endTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">エスカレーション</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">レベル1</span>
                  <span className="text-white">{selectedSLA.escalationPolicy.level1}分</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">レベル2</span>
                  <span className="text-white">{selectedSLA.escalationPolicy.level2}分</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">レベル3</span>
                  <span className="text-white">{selectedSLA.escalationPolicy.level3}分</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFormView = () => {
    const isCreate = viewMode === 'create';

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">
              {isCreate ? '新規SLA作成' : 'SLA編集'}
            </h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
              <span>キャンセル</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="h-5 w-5" />
              <span>保存</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">基本情報</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">SLA名 *</label>
                <input
                  type="text"
                  value={editingSLA.name || ''}
                  onChange={(e) => setEditingSLA({ ...editingSLA, name: e.target.value })}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SLA名を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">サービス名 *</label>
                <input
                  type="text"
                  value={editingSLA.serviceName || ''}
                  onChange={(e) => setEditingSLA({ ...editingSLA, serviceName: e.target.value })}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="対象サービス名を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ステータス</label>
                <select
                  value={editingSLA.status || 'draft'}
                  onChange={(e) => setEditingSLA({ ...editingSLA, status: e.target.value as SLA['status'] })}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">ドラフト</option>
                  <option value="active">アクティブ</option>
                  <option value="under_review">レビュー中</option>
                  <option value="expired">期限切れ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">目標稼働率 (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={editingSLA.targetAvailability || 99.9}
                  onChange={(e) => setEditingSLA({ ...editingSLA, targetAvailability: parseFloat(e.target.value) })}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">オーナー *</label>
                <input
                  type="text"
                  value={editingSLA.owner || ''}
                  onChange={(e) => setEditingSLA({ ...editingSLA, owner: e.target.value })}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="オーナー名を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">承認者</label>
                <input
                  type="text"
                  value={editingSLA.approvedBy || ''}
                  onChange={(e) => setEditingSLA({ ...editingSLA, approvedBy: e.target.value })}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="承認者名を入力"
                />
              </div>
            </div>
          </div>

          {/* Response Time Targets */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">目標応答時間 (分)</h2>
            <div className="space-y-4">
              {Object.entries(priorityLabels).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
                  <input
                    type="number"
                    min="1"
                    value={editingSLA.targetResponseTime?.[key as keyof typeof editingSLA.targetResponseTime] || 0}
                    onChange={(e) => setEditingSLA({
                      ...editingSLA,
                      targetResponseTime: {
                        ...editingSLA.targetResponseTime,
                        [key]: parseInt(e.target.value)
                      } as SLA['targetResponseTime']
                    })}
                    className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Time Targets */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">目標解決時間 (時間)</h2>
            <div className="space-y-4">
              {Object.entries(priorityLabels).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
                  <input
                    type="number"
                    min="1"
                    value={editingSLA.targetResolutionTime?.[key as keyof typeof editingSLA.targetResolutionTime] || 0}
                    onChange={(e) => setEditingSLA({
                      ...editingSLA,
                      targetResolutionTime: {
                        ...editingSLA.targetResolutionTime,
                        [key]: parseInt(e.target.value)
                      } as SLA['targetResolutionTime']
                    })}
                    className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Penalties */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">ペナルティ条項 (%)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">稼働率95%未満</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingSLA.penalties?.availabilityBelow95 || 0}
                  onChange={(e) => setEditingSLA({
                    ...editingSLA,
                    penalties: {
                      ...editingSLA.penalties,
                      availabilityBelow95: parseInt(e.target.value)
                    } as SLA['penalties']
                  })}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">応答時間超過</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingSLA.penalties?.responseTimeExceeded || 0}
                  onChange={(e) => setEditingSLA({
                    ...editingSLA,
                    penalties: {
                      ...editingSLA.penalties,
                      responseTimeExceeded: parseInt(e.target.value)
                    } as SLA['penalties']
                  })}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">解決時間超過</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingSLA.penalties?.resolutionTimeExceeded || 0}
                  onChange={(e) => setEditingSLA({
                    ...editingSLA,
                    penalties: {
                      ...editingSLA.penalties,
                      resolutionTimeExceeded: parseInt(e.target.value)
                    } as SLA['penalties']
                  })}
                  className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {viewMode === 'list' && renderListView()}
        {viewMode === 'detail' && renderDetailView()}
        {(viewMode === 'create' || viewMode === 'edit') && renderFormView()}
      </div>
    </div>
  );
}