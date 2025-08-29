import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Database, Server, Settings, Monitor, Smartphone, Wifi } from 'lucide-react';

interface ConfigurationItem {
  id: string;
  name: string;
  type: 'server' | 'network' | 'database' | 'application' | 'desktop' | 'mobile';
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  category: string;
  owner: string;
  location: string;
  lastUpdated: Date;
  version: string;
  environment: 'production' | 'staging' | 'development' | 'test';
  criticality: 'critical' | 'high' | 'medium' | 'low';
}

type ViewType = 'list' | 'detail' | 'create';

const CMDB: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [selectedCI, setSelectedCI] = useState<ConfigurationItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [configurationItems, setConfigurationItems] = useState<ConfigurationItem[]>([]);

  // Mock data
  useEffect(() => {
    const mockData: ConfigurationItem[] = [
      {
        id: 'CI001',
        name: 'WEB-SRV-001',
        type: 'server',
        status: 'active',
        category: 'Webサーバー',
        owner: '田中太郎',
        location: 'データセンターA',
        lastUpdated: new Date('2024-01-15'),
        version: '2.4.1',
        environment: 'production',
        criticality: 'critical'
      },
      {
        id: 'CI002',
        name: 'DB-SRV-001',
        type: 'database',
        status: 'active',
        category: 'データベースサーバー',
        owner: '佐藤花子',
        location: 'データセンターA',
        lastUpdated: new Date('2024-01-20'),
        version: '5.7.35',
        environment: 'production',
        criticality: 'critical'
      },
      {
        id: 'CI003',
        name: 'NET-SW-001',
        type: 'network',
        status: 'active',
        category: 'ネットワークスイッチ',
        owner: '山田次郎',
        location: 'データセンターB',
        lastUpdated: new Date('2024-01-10'),
        version: '15.2',
        environment: 'production',
        criticality: 'high'
      }
    ];
    setConfigurationItems(mockData);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'server': return <Server className="h-5 w-5" />;
      case 'database': return <Database className="h-5 w-5" />;
      case 'network': return <Wifi className="h-5 w-5" />;
      case 'application': return <Settings className="h-5 w-5" />;
      case 'desktop': return <Monitor className="h-5 w-5" />;
      case 'mobile': return <Smartphone className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50';
      case 'retired': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredItems = configurationItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewCI = (ci: ConfigurationItem) => {
    setSelectedCI(ci);
    setCurrentView('detail');
  };

  const handleCreateNew = () => {
    setSelectedCI(null);
    setCurrentView('create');
  };

  const handleSave = (ciData: any) => {
    if (selectedCI) {
      // Update existing CI
      setConfigurationItems(prev => prev.map(ci => 
        ci.id === selectedCI.id ? { ...ci, ...ciData, lastUpdated: new Date() } : ci
      ));
    } else {
      // Create new CI
      const newCI: ConfigurationItem = {
        id: `CI${(configurationItems.length + 1).toString().padStart(3, '0')}`,
        lastUpdated: new Date(),
        ...ciData
      };
      setConfigurationItems(prev => [...prev, newCI]);
    }
    setCurrentView('list');
  };

  const ListView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">構成管理データベース (CMDB)</h2>
          <p className="text-gray-300">構成アイテムの管理と追跡</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新規CI作成
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="CIを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全てのタイプ</option>
            <option value="server">サーバー</option>
            <option value="database">データベース</option>
            <option value="network">ネットワーク</option>
            <option value="application">アプリケーション</option>
            <option value="desktop">デスクトップ</option>
            <option value="mobile">モバイル</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全てのステータス</option>
            <option value="active">稼働中</option>
            <option value="inactive">非稼働</option>
            <option value="maintenance">メンテナンス中</option>
            <option value="retired">廃止済み</option>
          </select>
        </div>
      </div>

      {/* CI List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-left">
                <th className="px-6 py-4 text-gray-300 font-medium">CI名</th>
                <th className="px-6 py-4 text-gray-300 font-medium">タイプ</th>
                <th className="px-6 py-4 text-gray-300 font-medium">ステータス</th>
                <th className="px-6 py-4 text-gray-300 font-medium">重要度</th>
                <th className="px-6 py-4 text-gray-300 font-medium">所有者</th>
                <th className="px-6 py-4 text-gray-300 font-medium">最終更新</th>
                <th className="px-6 py-4 text-gray-300 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredItems.map((ci) => (
                <tr key={ci.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-blue-400">
                        {getTypeIcon(ci.type)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{ci.name}</div>
                        <div className="text-gray-400 text-sm">{ci.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">{ci.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ci.status)}`}>
                      {ci.status === 'active' && '稼働中'}
                      {ci.status === 'inactive' && '非稼働'}
                      {ci.status === 'maintenance' && 'メンテナンス中'}
                      {ci.status === 'retired' && '廃止済み'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCriticalityColor(ci.criticality)}`}>
                      {ci.criticality === 'critical' && '重要'}
                      {ci.criticality === 'high' && '高'}
                      {ci.criticality === 'medium' && '中'}
                      {ci.criticality === 'low' && '低'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{ci.owner}</td>
                  <td className="px-6 py-4 text-gray-300">
                    {ci.lastUpdated.toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewCI(ci)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      詳細表示
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

  const DetailView = () => selectedCI && (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('list')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← 戻る
          </button>
          <div className="text-blue-400">
            {getTypeIcon(selectedCI.type)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{selectedCI.name}</h2>
            <p className="text-gray-300">{selectedCI.id}</p>
          </div>
        </div>
        <button
          onClick={() => setCurrentView('create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          編集
        </button>
      </div>

      {/* CI Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">基本情報</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">CI名</label>
              <p className="text-white">{selectedCI.name}</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">タイプ</label>
              <p className="text-white">{selectedCI.category}</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">ステータス</label>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCI.status)}`}>
                {selectedCI.status === 'active' && '稼働中'}
                {selectedCI.status === 'inactive' && '非稼働'}
                {selectedCI.status === 'maintenance' && 'メンテナンス中'}
                {selectedCI.status === 'retired' && '廃止済み'}
              </span>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">重要度</label>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCriticalityColor(selectedCI.criticality)}`}>
                {selectedCI.criticality === 'critical' && '重要'}
                {selectedCI.criticality === 'high' && '高'}
                {selectedCI.criticality === 'medium' && '中'}
                {selectedCI.criticality === 'low' && '低'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">管理情報</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">所有者</label>
              <p className="text-white">{selectedCI.owner}</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">設置場所</label>
              <p className="text-white">{selectedCI.location}</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">環境</label>
              <p className="text-white">
                {selectedCI.environment === 'production' && '本番'}
                {selectedCI.environment === 'staging' && 'ステージング'}
                {selectedCI.environment === 'development' && '開発'}
                {selectedCI.environment === 'test' && 'テスト'}
              </p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">バージョン</label>
              <p className="text-white">{selectedCI.version}</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">最終更新日</label>
              <p className="text-white">{selectedCI.lastUpdated.toLocaleDateString('ja-JP')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const CreateView = () => {
    const [formData, setFormData] = useState({
      name: selectedCI?.name || '',
      type: selectedCI?.type || 'server',
      status: selectedCI?.status || 'active',
      category: selectedCI?.category || '',
      owner: selectedCI?.owner || '',
      location: selectedCI?.location || '',
      version: selectedCI?.version || '',
      environment: selectedCI?.environment || 'development',
      criticality: selectedCI?.criticality || 'medium'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSave(formData);
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView(selectedCI ? 'detail' : 'list')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← 戻る
          </button>
          <h2 className="text-2xl font-bold text-white">
            {selectedCI ? 'CI編集' : '新規CI作成'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">基本情報</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">CI名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">タイプ *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="server">サーバー</option>
                    <option value="database">データベース</option>
                    <option value="network">ネットワーク</option>
                    <option value="application">アプリケーション</option>
                    <option value="desktop">デスクトップ</option>
                    <option value="mobile">モバイル</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">カテゴリ *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">ステータス *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">稼働中</option>
                    <option value="inactive">非稼働</option>
                    <option value="maintenance">メンテナンス中</option>
                    <option value="retired">廃止済み</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">管理情報</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">所有者 *</label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">設置場所 *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">環境 *</label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="production">本番</option>
                    <option value="staging">ステージング</option>
                    <option value="development">開発</option>
                    <option value="test">テスト</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">重要度 *</label>
                  <select
                    value={formData.criticality}
                    onChange={(e) => setFormData({ ...formData, criticality: e.target.value as any })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="critical">重要</option>
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">バージョン</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {selectedCI ? '更新' : '作成'}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView(selectedCI ? 'detail' : 'list')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8">
      {currentView === 'list' && <ListView />}
      {currentView === 'detail' && <DetailView />}
      {currentView === 'create' && <CreateView />}
    </div>
  );
};

export default CMDB;