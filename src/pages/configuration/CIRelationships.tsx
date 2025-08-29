import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, Filter, Plus, GitBranch, AlertCircle, Zap, Database, Server, 
  Monitor, Shield, HardDrive, Network, Maximize2, Minimize2, 
  RotateCcw, Map, ChevronRight, Info, Activity, Cpu, Cloud, Lock,
  ArrowLeft, ZoomIn, ZoomOut, Move, Eye, EyeOff
} from 'lucide-react';

interface ConfigurationItem {
  id: string;
  name: string;
  type: 'server' | 'network' | 'database' | 'application' | 'desktop' | 'mobile' | 'storage' | 'security';
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
}

interface Node extends ConfigurationItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
}

interface CIRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: 'depends_on' | 'connected_to' | 'installed_on' | 'runs_on' | 'uses' | 'manages';
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  createdDate: Date;
  lastUpdated: Date;
}

interface ImpactAnalysis {
  ciId: string;
  impactedCIs: string[];
  impactLevel: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

type ViewType = 'graph' | 'relationships' | 'create' | 'impact';

const CIRelationships: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('graph');
  const [configurationItems, setConfigurationItems] = useState<ConfigurationItem[]>([]);
  const [relationships, setRelationships] = useState<CIRelationship[]>([]);
  const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis[]>([]);
  const [selectedRelationship, setSelectedRelationship] = useState<CIRelationship | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Initialize data
  useEffect(() => {
    const mockCIs: ConfigurationItem[] = [
      { id: 'CI001', name: 'WEB-SRV-001', type: 'server', status: 'active' },
      { id: 'CI002', name: 'DB-SRV-001', type: 'database', status: 'active' },
      { id: 'CI003', name: 'NET-SW-001', type: 'network', status: 'active' },
      { id: 'CI004', name: 'APP-ERP-001', type: 'application', status: 'active' },
      { id: 'CI005', name: 'PC-DEV-001', type: 'desktop', status: 'active' }
    ];

    const mockRelationships: CIRelationship[] = [
      {
        id: 'REL001',
        sourceId: 'CI004',
        targetId: 'CI001',
        relationshipType: 'runs_on',
        description: 'ERPアプリケーションがWebサーバー上で動作',
        impact: 'critical',
        createdDate: new Date('2024-01-10'),
        lastUpdated: new Date('2024-01-15')
      },
      {
        id: 'REL002',
        sourceId: 'CI001',
        targetId: 'CI002',
        relationshipType: 'depends_on',
        description: 'WebサーバーがDBサーバーに依存',
        impact: 'critical',
        createdDate: new Date('2024-01-10'),
        lastUpdated: new Date('2024-01-15')
      },
      {
        id: 'REL003',
        sourceId: 'CI001',
        targetId: 'CI003',
        relationshipType: 'connected_to',
        description: 'Webサーバーがネットワークスイッチに接続',
        impact: 'high',
        createdDate: new Date('2024-01-12'),
        lastUpdated: new Date('2024-01-18')
      }
    ];

    const mockImpactAnalysis: ImpactAnalysis[] = [
      {
        ciId: 'CI002',
        impactedCIs: ['CI001', 'CI004'],
        impactLevel: 'critical',
        description: 'DBサーバー障害時、Webサーバーとアプリケーションが影響を受ける'
      },
      {
        ciId: 'CI003',
        impactedCIs: ['CI001'],
        impactLevel: 'high',
        description: 'ネットワークスイッチ障害時、Webサーバーが影響を受ける'
      }
    ];

    setConfigurationItems(mockCIs);
    setRelationships(mockRelationships);
    setImpactAnalysis(mockImpactAnalysis);
  }, []);

  const getCIById = (id: string): ConfigurationItem | undefined => {
    return configurationItems.find(ci => ci.id === id);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'server': return <Server className="h-5 w-5" />;
      case 'database': return <Database className="h-5 w-5" />;
      case 'network': return <GitBranch className="h-5 w-5" />;
      case 'application': return <Monitor className="h-5 w-5" />;
      default: return <Monitor className="h-5 w-5" />;
    }
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'depends_on': return 'text-red-400';
      case 'connected_to': return 'text-blue-400';
      case 'installed_on': return 'text-green-400';
      case 'runs_on': return 'text-purple-400';
      case 'uses': return 'text-yellow-400';
      case 'manages': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleCreateNew = () => {
    setSelectedRelationship(null);
    setCurrentView('create');
  };

  const handleSaveRelationship = (relationshipData: any) => {
    if (selectedRelationship) {
      setRelationships(prev => prev.map(rel => 
        rel.id === selectedRelationship.id ? { ...rel, ...relationshipData, lastUpdated: new Date() } : rel
      ));
    } else {
      const newRelationship: CIRelationship = {
        id: `REL${(relationships.length + 1).toString().padStart(3, '0')}`,
        createdDate: new Date(),
        lastUpdated: new Date(),
        ...relationshipData
      };
      setRelationships(prev => [...prev, newRelationship]);
    }
    setCurrentView('relationships');
  };

  // Simple Graph View
  const GraphView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">CI関係図</h2>
          <p className="text-gray-300">構成アイテム間の依存関係と接続を可視化</p>
        </div>
        <button
          onClick={() => {
            console.log('Changing view to relationships');
            setCurrentView('relationships');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <GitBranch className="h-4 w-4" />
          関係管理へ
        </button>
      </div>

      {/* Simplified Network Visualization */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-full max-w-3xl h-[450px] mx-auto">
            {/* Central Node - Web Server */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-blue-500/30 border-2 border-blue-400 rounded-xl p-4 text-center shadow-lg backdrop-blur-sm">
                <Server className="h-10 w-10 text-blue-400 mx-auto mb-2" />
                <div className="text-white font-semibold">WEB-SRV-001</div>
                <div className="text-blue-300 text-xs">メインサーバー</div>
              </div>
            </div>
            
            {/* Top Node - Application */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-orange-500/30 border-2 border-orange-400 rounded-xl p-3 text-center shadow-lg backdrop-blur-sm">
                <Monitor className="h-8 w-8 text-orange-400 mx-auto mb-1" />
                <div className="text-white text-sm font-medium">APP-ERP-001</div>
                <div className="text-orange-300 text-xs">ERPシステム</div>
              </div>
            </div>
            
            {/* Left Node - Database */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <div className="bg-purple-500/30 border-2 border-purple-400 rounded-xl p-3 text-center shadow-lg backdrop-blur-sm">
                <Database className="h-8 w-8 text-purple-400 mx-auto mb-1" />
                <div className="text-white text-sm font-medium">DB-SRV-001</div>
                <div className="text-purple-300 text-xs">データベース</div>
              </div>
            </div>
            
            {/* Right Node - Network */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="bg-green-500/30 border-2 border-green-400 rounded-xl p-3 text-center shadow-lg backdrop-blur-sm">
                <Network className="h-8 w-8 text-green-400 mx-auto mb-1" />
                <div className="text-white text-sm font-medium">NET-SW-001</div>
                <div className="text-green-300 text-xs">ネットワーク</div>
              </div>
            </div>
            
            {/* Bottom Node - Desktop */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-cyan-500/30 border-2 border-cyan-400 rounded-xl p-3 text-center shadow-lg backdrop-blur-sm">
                <Monitor className="h-8 w-8 text-cyan-400 mx-auto mb-1" />
                <div className="text-white text-sm font-medium">PC-DEV-001</div>
                <div className="text-cyan-300 text-xs">開発PC</div>
              </div>
            </div>
            
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                 refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                </marker>
              </defs>
              
              {/* Center to Top (Web to App) */}
              <line x1="50%" y1="50%" x2="50%" y2="20%" 
                stroke="#f97316" strokeWidth="2" strokeDasharray="5,5" opacity="0.6"
                markerEnd="url(#arrowhead)" />
              
              {/* Center to Left (Web to DB) */}
              <line x1="50%" y1="50%" x2="20%" y2="50%" 
                stroke="#a855f7" strokeWidth="2" strokeDasharray="5,5" opacity="0.6"
                markerEnd="url(#arrowhead)" />
              
              {/* Center to Right (Web to Network) */}
              <line x1="50%" y1="50%" x2="80%" y2="50%" 
                stroke="#10b981" strokeWidth="2" opacity="0.6"
                markerEnd="url(#arrowhead)" />
              
              {/* Center to Bottom (Web to Desktop) */}
              <line x1="50%" y1="50%" x2="50%" y2="80%" 
                stroke="#06b6d4" strokeWidth="2" opacity="0.6"
                markerEnd="url(#arrowhead)" />
            </svg>
            
            {/* Relationship Labels */}
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="text-orange-400 text-xs bg-gray-900/70 px-2 py-1 rounded">実行</span>
            </div>
            <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
              <span className="text-purple-400 text-xs bg-gray-900/70 px-2 py-1 rounded">依存</span>
            </div>
            <div className="absolute top-1/2 right-1/3 transform translate-x-1/2 -translate-y-1/2">
              <span className="text-green-400 text-xs bg-gray-900/70 px-2 py-1 rounded">接続</span>
            </div>
            <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <span className="text-cyan-400 text-xs bg-gray-900/70 px-2 py-1 rounded">アクセス</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">総CI数</p>
              <p className="text-2xl font-bold text-white">{configurationItems.length}</p>
            </div>
            <GitBranch className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">関係数</p>
              <p className="text-2xl font-bold text-white">{relationships.length}</p>
            </div>
            <Zap className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">重要な依存関係</p>
              <p className="text-2xl font-bold text-red-400">
                {relationships.filter(r => r.impact === 'critical').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>
    </div>
  );

  // Relationships View
  const RelationshipsView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">CI関係管理</h2>
          <p className="text-gray-300">構成アイテム間の関係を管理</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('graph')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            グラフに戻る
          </button>
          <button
            onClick={handleCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            新規関係作成
          </button>
          <button
            onClick={() => setCurrentView('impact')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <AlertCircle className="h-4 w-4" />
            影響分析
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="関係を検索..."
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
            <option value="all">全ての関係タイプ</option>
            <option value="depends_on">依存関係</option>
            <option value="connected_to">接続</option>
            <option value="runs_on">実行</option>
            <option value="uses">使用</option>
            <option value="manages">管理</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-left">
                <th className="px-6 py-4 text-gray-300 font-medium">ソースCI</th>
                <th className="px-6 py-4 text-gray-300 font-medium">関係タイプ</th>
                <th className="px-6 py-4 text-gray-300 font-medium">ターゲットCI</th>
                <th className="px-6 py-4 text-gray-300 font-medium">影響度</th>
                <th className="px-6 py-4 text-gray-300 font-medium">説明</th>
                <th className="px-6 py-4 text-gray-300 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {relationships.map((relationship) => {
                const sourceCI = getCIById(relationship.sourceId);
                const targetCI = getCIById(relationship.targetId);
                return (
                  <tr key={relationship.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {sourceCI && (
                          <>
                            <div className="text-blue-400">{getTypeIcon(sourceCI.type)}</div>
                            <div>
                              <div className="text-white font-medium">{sourceCI.name}</div>
                              <div className="text-gray-400 text-sm">{sourceCI.id}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${getRelationshipColor(relationship.relationshipType)}`}>
                        {relationship.relationshipType === 'depends_on' && '依存'}
                        {relationship.relationshipType === 'connected_to' && '接続'}
                        {relationship.relationshipType === 'runs_on' && '実行'}
                        {relationship.relationshipType === 'uses' && '使用'}
                        {relationship.relationshipType === 'manages' && '管理'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {targetCI && (
                          <>
                            <div className="text-blue-400">{getTypeIcon(targetCI.type)}</div>
                            <div>
                              <div className="text-white font-medium">{targetCI.name}</div>
                              <div className="text-gray-400 text-sm">{targetCI.id}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(relationship.impact)}`}>
                        {relationship.impact === 'critical' && '重要'}
                        {relationship.impact === 'high' && '高'}
                        {relationship.impact === 'medium' && '中'}
                        {relationship.impact === 'low' && '低'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 max-w-xs truncate">
                      {relationship.description}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedRelationship(relationship);
                          setCurrentView('create');
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        編集
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Create/Edit View
  const CreateView = () => {
    const [formData, setFormData] = useState({
      sourceId: selectedRelationship?.sourceId || '',
      targetId: selectedRelationship?.targetId || '',
      relationshipType: selectedRelationship?.relationshipType || 'depends_on',
      description: selectedRelationship?.description || '',
      impact: selectedRelationship?.impact || 'medium'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSaveRelationship(formData);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('relationships')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold text-white">
            {selectedRelationship ? '関係編集' : '新規関係作成'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">関係情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm mb-2">ソースCI *</label>
                <select
                  value={formData.sourceId}
                  onChange={(e) => setFormData({ ...formData, sourceId: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">選択してください</option>
                  {configurationItems.map((ci) => (
                    <option key={ci.id} value={ci.id}>
                      {ci.name} ({ci.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">ターゲットCI *</label>
                <select
                  value={formData.targetId}
                  onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">選択してください</option>
                  {configurationItems.map((ci) => (
                    <option key={ci.id} value={ci.id}>
                      {ci.name} ({ci.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">関係タイプ *</label>
                <select
                  value={formData.relationshipType}
                  onChange={(e) => setFormData({ ...formData, relationshipType: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="depends_on">依存関係</option>
                  <option value="connected_to">接続</option>
                  <option value="runs_on">実行</option>
                  <option value="uses">使用</option>
                  <option value="manages">管理</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">影響度 *</label>
                <select
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="critical">重要</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm mb-2">説明</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="関係の詳細を入力..."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {selectedRelationship ? '更新' : '作成'}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('relationships')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Impact Analysis View
  const ImpactAnalysisView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentView('relationships')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">影響分析</h2>
          <p className="text-gray-300">CI障害時の影響範囲を分析</p>
        </div>
      </div>

      <div className="space-y-4">
        {impactAnalysis.map((analysis) => {
          const ci = getCIById(analysis.ciId);
          const impactedCIs = analysis.impactedCIs.map(id => getCIById(id)).filter(Boolean);
          
          return (
            <div key={analysis.ciId} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {ci && (
                    <>
                      <div className="text-blue-400">{getTypeIcon(ci.type)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{ci.name}</h3>
                        <p className="text-gray-300 text-sm">{ci.id}</p>
                      </div>
                    </>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(analysis.impactLevel)}`}>
                  {analysis.impactLevel === 'critical' && '重要'}
                  {analysis.impactLevel === 'high' && '高'}
                  {analysis.impactLevel === 'medium' && '中'}
                  {analysis.impactLevel === 'low' && '低'}
                </span>
              </div>
              
              <p className="text-gray-300 mb-4">{analysis.description}</p>
              
              <div>
                <h4 className="text-white font-medium mb-2">影響を受けるCI:</h4>
                <div className="flex flex-wrap gap-2">
                  {impactedCIs.map((impactedCI) => (
                    <div key={impactedCI!.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1">
                      <div className="text-red-400">{getTypeIcon(impactedCI!.type)}</div>
                      <span className="text-white text-sm">{impactedCI!.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen p-8">
      {currentView === 'graph' && <GraphView />}
      {currentView === 'relationships' && <RelationshipsView />}
      {currentView === 'create' && <CreateView />}
      {currentView === 'impact' && <ImpactAnalysisView />}
    </div>
  );
};

export default CIRelationships;