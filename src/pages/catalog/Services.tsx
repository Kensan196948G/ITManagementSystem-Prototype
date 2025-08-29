import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Server,
  Database,
  Globe,
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Save,
  X,
  Users,
  Zap,
  DollarSign,
  GitBranch
} from 'lucide-react';

// Service interface
interface Service {
  id: string;
  name: string;
  category: 'Infrastructure' | 'Application' | 'Business';
  status: 'active' | 'maintenance' | 'deprecated';
  description: string;
  owner: string;
  supportTeam: string;
  availability: string;
  cost: number;
  dependencies: string[];
  criticality: 'low' | 'medium' | 'high' | 'critical';
  version: string;
  lastUpdated: string;
  createdAt: string;
}

// Mock data
const mockServices: Service[] = [
  {
    id: '1',
    name: 'メールサービス',
    category: 'Business',
    status: 'active',
    description: 'エンタープライズメールサービス（Exchange Online）',
    owner: '田中太郎',
    supportTeam: 'ITインフラチーム',
    availability: '99.9%',
    cost: 150000,
    dependencies: ['Active Directory', 'ネットワーク基盤'],
    criticality: 'high',
    version: '2.1.0',
    lastUpdated: '2024-03-15',
    createdAt: '2023-01-15'
  },
  {
    id: '2',
    name: 'データベースサービス',
    category: 'Infrastructure',
    status: 'active',
    description: 'PostgreSQL クラスタ環境による高可用性データベース',
    owner: '佐藤花子',
    supportTeam: 'データベースチーム',
    availability: '99.95%',
    cost: 300000,
    dependencies: ['サーバーインフラ', 'バックアップシステム'],
    criticality: 'critical',
    version: '14.2',
    lastUpdated: '2024-03-20',
    createdAt: '2022-08-10'
  },
  {
    id: '3',
    name: 'ウェブホスティング',
    category: 'Application',
    status: 'maintenance',
    description: 'Nginx ベースの高性能ウェブホスティングサービス',
    owner: '鈴木一郎',
    supportTeam: 'ウェブ運用チーム',
    availability: '99.5%',
    cost: 80000,
    dependencies: ['ロードバランサー', 'SSL証明書'],
    criticality: 'medium',
    version: '1.8.3',
    lastUpdated: '2024-03-18',
    createdAt: '2023-05-20'
  },
  {
    id: '4',
    name: 'セキュリティ監視',
    category: 'Infrastructure',
    status: 'active',
    description: '24/7 セキュリティ監視・インシデント対応サービス',
    owner: '山田三郎',
    supportTeam: 'セキュリティチーム',
    availability: '99.99%',
    cost: 500000,
    dependencies: ['SIEM システム', '監視基盤'],
    criticality: 'critical',
    version: '3.0.1',
    lastUpdated: '2024-03-22',
    createdAt: '2022-12-01'
  }
];

type ViewMode = 'list' | 'detail' | 'create' | 'edit';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    criticality: ''
  });
  const [editForm, setEditForm] = useState<Service | null>(null);

  // Filter services based on search and filters
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.owner.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filters.category || service.category === filters.category;
    const matchesStatus = !filters.status || service.status === filters.status;
    const matchesCriticality = !filters.criticality || service.criticality === filters.criticality;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesCriticality;
  });

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'maintenance':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'deprecated':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Infrastructure':
        return <Server className="w-4 h-4" />;
      case 'Application':
        return <Globe className="w-4 h-4" />;
      case 'Business':
        return <Users className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  // Get criticality color
  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-orange-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Handle create service
  const handleCreateService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: '',
      category: 'Infrastructure',
      status: 'active',
      description: '',
      owner: '',
      supportTeam: '',
      availability: '99.9%',
      cost: 0,
      dependencies: [],
      criticality: 'medium',
      version: '1.0.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setEditForm(newService);
    setViewMode('create');
  };

  // Handle edit service
  const handleEditService = (service: Service) => {
    setEditForm({ ...service });
    setSelectedService(service);
    setViewMode('edit');
  };

  // Handle save service
  const handleSaveService = () => {
    if (!editForm) return;

    if (viewMode === 'create') {
      setServices([...services, editForm]);
    } else if (viewMode === 'edit') {
      setServices(services.map(s => s.id === editForm.id ? editForm : s));
    }

    setViewMode('list');
    setEditForm(null);
    setSelectedService(null);
  };

  // Handle view detail
  const handleViewDetail = (service: Service) => {
    setSelectedService(service);
    setViewMode('detail');
  };

  // Service form component
  const ServiceForm = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('list')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">
            {viewMode === 'create' ? 'サービス作成' : 'サービス編集'}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveService}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors"
          >
            <X className="w-4 h-4" />
            キャンセル
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">サービス名</label>
            <input
              type="text"
              value={editForm?.name || ''}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="サービス名を入力"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">カテゴリ</label>
            <select
              value={editForm?.category || ''}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, category: e.target.value as Service['category'] } : null)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="Infrastructure">Infrastructure</option>
              <option value="Application">Application</option>
              <option value="Business">Business</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ステータス</label>
            <select
              value={editForm?.status || ''}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, status: e.target.value as Service['status'] } : null)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="active">稼働中</option>
              <option value="maintenance">メンテナンス中</option>
              <option value="deprecated">廃止予定</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">重要度</label>
            <select
              value={editForm?.criticality || ''}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, criticality: e.target.value as Service['criticality'] } : null)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="critical">クリティカル</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">所有者</label>
            <input
              type="text"
              value={editForm?.owner || ''}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, owner: e.target.value } : null)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="所有者名を入力"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">サポートチーム</label>
            <input
              type="text"
              value={editForm?.supportTeam || ''}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, supportTeam: e.target.value } : null)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="サポートチーム名を入力"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">説明</label>
            <textarea
              value={editForm?.description || ''}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, description: e.target.value } : null)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 h-24"
              placeholder="サービスの詳細な説明を入力"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">可用性</label>
            <input
              type="text"
              value={editForm?.availability || ''}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, availability: e.target.value } : null)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="例: 99.9%"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">月額コスト（円）</label>
            <input
              type="number"
              value={editForm?.cost || 0}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, cost: parseInt(e.target.value) || 0 } : null)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">バージョン</label>
            <input
              type="text"
              value={editForm?.version || ''}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, version: e.target.value } : null)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="例: 1.0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">依存関係（カンマ区切り）</label>
            <input
              type="text"
              value={editForm?.dependencies.join(', ') || ''}
              onChange={(e) => setEditForm(prev => prev ? { 
                ...prev, 
                dependencies: e.target.value.split(',').map(dep => dep.trim()).filter(dep => dep) 
              } : null)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="例: Active Directory, ネットワーク基盤"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Service detail component
  const ServiceDetail = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('list')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">サービス詳細</h2>
        </div>
        <button
          onClick={() => selectedService && handleEditService(selectedService)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Edit className="w-4 h-4" />
          編集
        </button>
      </div>

      {selectedService && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                {getCategoryIcon(selectedService.category)}
                基本情報
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">サービス名:</span>
                  <span className="font-medium">{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">カテゴリ:</span>
                  <span className="font-medium">{selectedService.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">ステータス:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedService.status)}
                    <span className="font-medium">
                      {selectedService.status === 'active' ? '稼働中' :
                       selectedService.status === 'maintenance' ? 'メンテナンス中' : '廃止予定'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">重要度:</span>
                  <span className={`font-medium ${getCriticalityColor(selectedService.criticality)}`}>
                    {selectedService.criticality === 'low' ? '低' :
                     selectedService.criticality === 'medium' ? '中' :
                     selectedService.criticality === 'high' ? '高' : 'クリティカル'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">バージョン:</span>
                  <span className="font-medium">{selectedService.version}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                管理情報
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">所有者:</span>
                  <span className="font-medium">{selectedService.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">サポートチーム:</span>
                  <span className="font-medium">{selectedService.supportTeam}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">作成日:</span>
                  <span className="font-medium">{selectedService.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">最終更新:</span>
                  <span className="font-medium">{selectedService.lastUpdated}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                パフォーマンス
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">可用性:</span>
                  <span className="font-medium text-green-500">{selectedService.availability}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">月額コスト:</span>
                  <span className="font-medium flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    ¥{selectedService.cost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">説明</h3>
              <p className="text-gray-300 leading-relaxed">{selectedService.description}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                依存関係
              </h3>
              {selectedService.dependencies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedService.dependencies.map((dep, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">依存関係なし</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (viewMode === 'create' || viewMode === 'edit') {
    return <ServiceForm />;
  }

  if (viewMode === 'detail') {
    return <ServiceDetail />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">サービスカタログ</h1>
        <button
          onClick={handleCreateService}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規サービス
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="サービス名、説明、所有者で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">全カテゴリ</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Application">Application</option>
              <option value="Business">Business</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">全ステータス</option>
              <option value="active">稼働中</option>
              <option value="maintenance">メンテナンス中</option>
              <option value="deprecated">廃止予定</option>
            </select>
            <select
              value={filters.criticality}
              onChange={(e) => setFilters({ ...filters, criticality: e.target.value })}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">全重要度</option>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="critical">クリティカル</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 font-semibold">サービス名</th>
                <th className="text-left p-4 font-semibold">カテゴリ</th>
                <th className="text-left p-4 font-semibold">ステータス</th>
                <th className="text-left p-4 font-semibold">重要度</th>
                <th className="text-left p-4 font-semibold">所有者</th>
                <th className="text-left p-4 font-semibold">可用性</th>
                <th className="text-left p-4 font-semibold">月額コスト</th>
                <th className="text-left p-4 font-semibold">アクション</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(service.category)}
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-400">v{service.version}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
                      {service.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <span className="text-sm">
                        {service.status === 'active' ? '稼働中' :
                         service.status === 'maintenance' ? 'メンテナンス中' : '廃止予定'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${getCriticalityColor(service.criticality)}`}>
                      {service.criticality === 'low' ? '低' :
                       service.criticality === 'medium' ? '中' :
                       service.criticality === 'high' ? '高' : 'クリティカル'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-sm">{service.owner}</div>
                      <div className="text-xs text-gray-400">{service.supportTeam}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-green-400 font-medium">{service.availability}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium">¥{service.cost.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(service)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="詳細表示"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditService(service)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-8">
            <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">該当するサービスが見つかりません</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Server className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{services.length}</div>
              <div className="text-sm text-gray-400">総サービス数</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {services.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-gray-400">稼働中</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {services.filter(s => s.criticality === 'critical').length}
              </div>
              <div className="text-sm text-gray-400">クリティカル</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                ¥{services.reduce((sum, s) => sum + s.cost, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">月間総コスト</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;