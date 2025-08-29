import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Package, Laptop, Server, Monitor, Calendar, AlertTriangle } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: 'hardware' | 'software' | 'license';
  category: string;
  status: 'active' | 'inactive' | 'maintenance' | 'disposed' | 'reserved';
  location: string;
  owner: string;
  assignedTo: string;
  purchaseDate: Date;
  warrantyExpiry?: Date;
  value: number;
  vendor: string;
  model: string;
  serialNumber: string;
  lifecycle: 'planning' | 'procurement' | 'deployment' | 'operation' | 'maintenance' | 'retirement';
  maintenanceSchedule?: Date;
}

type ViewType = 'list' | 'detail' | 'create';

const AssetManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [assets, setAssets] = useState<Asset[]>([]);

  // Mock data
  useEffect(() => {
    const mockData: Asset[] = [
      {
        id: 'AST001',
        name: 'MacBook Pro 16"',
        type: 'hardware',
        category: 'ノートパソコン',
        status: 'active',
        location: '東京オフィス',
        owner: '田中太郎',
        assignedTo: '佐藤花子',
        purchaseDate: new Date('2023-04-15'),
        warrantyExpiry: new Date('2026-04-15'),
        value: 280000,
        vendor: 'Apple',
        model: 'MacBook Pro 16-inch',
        serialNumber: 'MBP2023001',
        lifecycle: 'operation',
        maintenanceSchedule: new Date('2024-04-15')
      },
      {
        id: 'AST002',
        name: 'Dell OptiPlex 7090',
        type: 'hardware',
        category: 'デスクトップPC',
        status: 'active',
        location: '大阪オフィス',
        owner: '山田次郎',
        assignedTo: '鈴木一郎',
        purchaseDate: new Date('2023-06-20'),
        warrantyExpiry: new Date('2026-06-20'),
        value: 120000,
        vendor: 'Dell',
        model: 'OptiPlex 7090',
        serialNumber: 'DLL2023002',
        lifecycle: 'operation'
      },
      {
        id: 'AST003',
        name: 'Adobe Creative Suite',
        type: 'software',
        category: 'デザインソフト',
        status: 'active',
        location: 'クラウド',
        owner: '田中太郎',
        assignedTo: 'デザイン部',
        purchaseDate: new Date('2023-01-01'),
        value: 84000,
        vendor: 'Adobe',
        model: 'Creative Suite 2023',
        serialNumber: 'ADB-CS-2023-001',
        lifecycle: 'operation'
      }
    ];
    setAssets(mockData);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hardware': return <Server className="h-5 w-5" />;
      case 'software': return <Package className="h-5 w-5" />;
      case 'license': return <Monitor className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50';
      case 'disposed': return 'text-red-600 bg-red-50';
      case 'reserved': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getLifecycleColor = (lifecycle: string) => {
    switch (lifecycle) {
      case 'planning': return 'text-purple-600 bg-purple-50';
      case 'procurement': return 'text-blue-600 bg-blue-50';
      case 'deployment': return 'text-yellow-600 bg-yellow-50';
      case 'operation': return 'text-green-600 bg-green-50';
      case 'maintenance': return 'text-orange-600 bg-orange-50';
      case 'retirement': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const isWarrantyExpiringSoon = (warrantyExpiry?: Date) => {
    if (!warrantyExpiry) return false;
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return warrantyExpiry <= threeMonthsFromNow && warrantyExpiry >= now;
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setCurrentView('detail');
  };

  const handleCreateNew = () => {
    setSelectedAsset(null);
    setCurrentView('create');
  };

  const handleSave = (assetData: any) => {
    if (selectedAsset) {
      // Update existing asset
      setAssets(prev => prev.map(asset => 
        asset.id === selectedAsset.id ? { ...asset, ...assetData } : asset
      ));
    } else {
      // Create new asset
      const newAsset: Asset = {
        id: `AST${(assets.length + 1).toString().padStart(3, '0')}`,
        ...assetData
      };
      setAssets(prev => [...prev, newAsset]);
    }
    setCurrentView('list');
  };

  const ListView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">資産管理</h2>
          <p className="text-gray-300">ハードウェア・ソフトウェア資産の管理とライフサイクル追跡</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新規資産登録
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">総資産数</p>
              <p className="text-2xl font-bold text-white">{assets.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">稼働中</p>
              <p className="text-2xl font-bold text-green-400">
                {assets.filter(a => a.status === 'active').length}
              </p>
            </div>
            <Server className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">保証期限切れ間近</p>
              <p className="text-2xl font-bold text-yellow-400">
                {assets.filter(a => isWarrantyExpiringSoon(a.warrantyExpiry)).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">総額</p>
              <p className="text-2xl font-bold text-white">
                ¥{assets.reduce((sum, a) => sum + a.value, 0).toLocaleString()}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="資産を検索..."
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
            <option value="hardware">ハードウェア</option>
            <option value="software">ソフトウェア</option>
            <option value="license">ライセンス</option>
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
            <option value="disposed">廃棄済み</option>
            <option value="reserved">予約済み</option>
          </select>
        </div>
      </div>

      {/* Asset List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-left">
                <th className="px-6 py-4 text-gray-300 font-medium">資産名</th>
                <th className="px-6 py-4 text-gray-300 font-medium">タイプ</th>
                <th className="px-6 py-4 text-gray-300 font-medium">ステータス</th>
                <th className="px-6 py-4 text-gray-300 font-medium">ライフサイクル</th>
                <th className="px-6 py-4 text-gray-300 font-medium">割当先</th>
                <th className="px-6 py-4 text-gray-300 font-medium">価格</th>
                <th className="px-6 py-4 text-gray-300 font-medium">保証期限</th>
                <th className="px-6 py-4 text-gray-300 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-blue-400">
                        {getTypeIcon(asset.type)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{asset.name}</div>
                        <div className="text-gray-400 text-sm">{asset.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">{asset.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                      {asset.status === 'active' && '稼働中'}
                      {asset.status === 'inactive' && '非稼働'}
                      {asset.status === 'maintenance' && 'メンテナンス中'}
                      {asset.status === 'disposed' && '廃棄済み'}
                      {asset.status === 'reserved' && '予約済み'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLifecycleColor(asset.lifecycle)}`}>
                      {asset.lifecycle === 'planning' && '計画'}
                      {asset.lifecycle === 'procurement' && '調達'}
                      {asset.lifecycle === 'deployment' && '展開'}
                      {asset.lifecycle === 'operation' && '運用'}
                      {asset.lifecycle === 'maintenance' && '保守'}
                      {asset.lifecycle === 'retirement' && '廃止'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{asset.assignedTo}</td>
                  <td className="px-6 py-4 text-gray-300">¥{asset.value.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300">
                        {asset.warrantyExpiry?.toLocaleDateString('ja-JP') || 'なし'}
                      </span>
                      {isWarrantyExpiringSoon(asset.warrantyExpiry) && (
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewAsset(asset)}
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

  const DetailView = () => selectedAsset && (
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
            {getTypeIcon(selectedAsset.type)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{selectedAsset.name}</h2>
            <p className="text-gray-300">{selectedAsset.id}</p>
          </div>
        </div>
        <button
          onClick={() => setCurrentView('create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          編集
        </button>
      </div>

      {/* Asset Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">基本情報</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">資産名</label>
              <p className="text-white">{selectedAsset.name}</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">タイプ</label>
              <p className="text-white">{selectedAsset.category}</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">メーカー</label>
              <p className="text-white">{selectedAsset.vendor}</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">モデル</label>
              <p className="text-white">{selectedAsset.model}</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">シリアル番号</label>
              <p className="text-white">{selectedAsset.serialNumber}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">管理情報</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">ステータス</label>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAsset.status)}`}>
                {selectedAsset.status === 'active' && '稼働中'}
                {selectedAsset.status === 'inactive' && '非稼働'}
                {selectedAsset.status === 'maintenance' && 'メンテナンス中'}
                {selectedAsset.status === 'disposed' && '廃棄済み'}
                {selectedAsset.status === 'reserved' && '予約済み'}
              </span>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">ライフサイクル</label>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLifecycleColor(selectedAsset.lifecycle)}`}>
                {selectedAsset.lifecycle === 'planning' && '計画'}
                {selectedAsset.lifecycle === 'procurement' && '調達'}
                {selectedAsset.lifecycle === 'deployment' && '展開'}
                {selectedAsset.lifecycle === 'operation' && '運用'}
                {selectedAsset.lifecycle === 'maintenance' && '保守'}
                {selectedAsset.lifecycle === 'retirement' && '廃止'}
              </span>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">所有者</label>
              <p className="text-white">{selectedAsset.owner}</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">割当先</label>
              <p className="text-white">{selectedAsset.assignedTo}</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">設置場所</label>
              <p className="text-white">{selectedAsset.location}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">財務情報</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">購入価格</label>
              <p className="text-white">¥{selectedAsset.value.toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">購入日</label>
              <p className="text-white">{selectedAsset.purchaseDate.toLocaleDateString('ja-JP')}</p>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">保証期限</label>
              <div className="flex items-center gap-2">
                <p className="text-white">
                  {selectedAsset.warrantyExpiry?.toLocaleDateString('ja-JP') || 'なし'}
                </p>
                {isWarrantyExpiringSoon(selectedAsset.warrantyExpiry) && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">期限切れ間近</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">メンテナンス情報</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">次回メンテナンス予定</label>
              <p className="text-white">
                {selectedAsset.maintenanceSchedule?.toLocaleDateString('ja-JP') || '未定'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const CreateView = () => {
    const [formData, setFormData] = useState({
      name: selectedAsset?.name || '',
      type: selectedAsset?.type || 'hardware',
      category: selectedAsset?.category || '',
      status: selectedAsset?.status || 'active',
      location: selectedAsset?.location || '',
      owner: selectedAsset?.owner || '',
      assignedTo: selectedAsset?.assignedTo || '',
      purchaseDate: selectedAsset?.purchaseDate?.toISOString().split('T')[0] || '',
      warrantyExpiry: selectedAsset?.warrantyExpiry?.toISOString().split('T')[0] || '',
      value: selectedAsset?.value || 0,
      vendor: selectedAsset?.vendor || '',
      model: selectedAsset?.model || '',
      serialNumber: selectedAsset?.serialNumber || '',
      lifecycle: selectedAsset?.lifecycle || 'planning',
      maintenanceSchedule: selectedAsset?.maintenanceSchedule?.toISOString().split('T')[0] || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const processedData = {
        ...formData,
        purchaseDate: new Date(formData.purchaseDate),
        warrantyExpiry: formData.warrantyExpiry ? new Date(formData.warrantyExpiry) : undefined,
        maintenanceSchedule: formData.maintenanceSchedule ? new Date(formData.maintenanceSchedule) : undefined,
        value: Number(formData.value)
      };
      handleSave(processedData);
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView(selectedAsset ? 'detail' : 'list')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← 戻る
          </button>
          <h2 className="text-2xl font-bold text-white">
            {selectedAsset ? '資産編集' : '新規資産登録'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">基本情報</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">資産名 *</label>
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
                    <option value="hardware">ハードウェア</option>
                    <option value="software">ソフトウェア</option>
                    <option value="license">ライセンス</option>
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
                  <label className="block text-gray-300 text-sm mb-2">メーカー *</label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">モデル *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">シリアル番号 *</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">管理情報</h3>
              <div className="space-y-4">
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
                    <option value="disposed">廃棄済み</option>
                    <option value="reserved">予約済み</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">ライフサイクル *</label>
                  <select
                    value={formData.lifecycle}
                    onChange={(e) => setFormData({ ...formData, lifecycle: e.target.value as any })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="planning">計画</option>
                    <option value="procurement">調達</option>
                    <option value="deployment">展開</option>
                    <option value="operation">運用</option>
                    <option value="maintenance">保守</option>
                    <option value="retirement">廃止</option>
                  </select>
                </div>
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
                  <label className="block text-gray-300 text-sm mb-2">割当先</label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">財務・メンテナンス情報</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">購入価格 *</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">購入日 *</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">保証期限</label>
                  <input
                    type="date"
                    value={formData.warrantyExpiry}
                    onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">次回メンテナンス予定</label>
                  <input
                    type="date"
                    value={formData.maintenanceSchedule}
                    onChange={(e) => setFormData({ ...formData, maintenanceSchedule: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {selectedAsset ? '更新' : '作成'}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView(selectedAsset ? 'detail' : 'list')}
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

export default AssetManagement;