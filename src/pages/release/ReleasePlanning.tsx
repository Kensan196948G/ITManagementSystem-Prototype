import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  GitBranch, 
  Users, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Filter,
  Plus,
  Eye,
  Edit,
  FileText,
  Server,
  Database
} from 'lucide-react';

interface ReleasePlan {
  id: string;
  name: string;
  version: string;
  status: 'planning' | 'approved' | 'in-progress' | 'ready' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetDate: string;
  actualDate?: string;
  owner: string;
  team: string;
  features: string[];
  dependencies: string[];
  environments: string[];
  riskLevel: 'low' | 'medium' | 'high';
  approvedBy?: string;
  createdDate: string;
  lastModified: string;
  description: string;
  businessValue: string;
  technicalNotes: string;
}

const mockReleasePlans: ReleasePlan[] = [
  {
    id: 'REL-2025-001',
    name: 'セキュリティ強化リリース v2.1.0',
    version: '2.1.0',
    status: 'approved',
    priority: 'high',
    targetDate: '2025-09-15',
    owner: '田中太郎',
    team: 'セキュリティチーム',
    features: ['多要素認証', 'データ暗号化強化', '監査ログ機能'],
    dependencies: ['認証サーバー更新', 'データベース移行'],
    environments: ['開発', 'ステージング', '本番'],
    riskLevel: 'medium',
    approvedBy: '佐藤花子',
    createdDate: '2025-08-20',
    lastModified: '2025-08-28',
    description: 'セキュリティ要件の強化を目的としたメジャーリリース',
    businessValue: 'コンプライアンス要件への対応とセキュリティリスクの軽減',
    technicalNotes: 'データベーススキーマ変更を含むため、ダウンタイムが発生する可能性'
  },
  {
    id: 'REL-2025-002',
    name: 'ユーザーエクスペリエンス改善 v2.0.5',
    version: '2.0.5',
    status: 'in-progress',
    priority: 'medium',
    targetDate: '2025-09-10',
    owner: '山田次郎',
    team: 'フロントエンドチーム',
    features: ['レスポンシブデザイン', 'パフォーマンス最適化', '新UIコンポーネント'],
    dependencies: ['デザインシステム更新'],
    environments: ['開発', 'ステージング', '本番'],
    riskLevel: 'low',
    createdDate: '2025-08-22',
    lastModified: '2025-08-29',
    description: 'ユーザビリティとパフォーマンスの向上を目的としたマイナーリリース',
    businessValue: 'ユーザー満足度向上と離脱率の改善',
    technicalNotes: 'フロントエンドのみの変更でバックエンドへの影響なし'
  },
  {
    id: 'REL-2025-003',
    name: '緊急バグ修正 v2.0.4',
    version: '2.0.4',
    status: 'ready',
    priority: 'critical',
    targetDate: '2025-09-02',
    owner: '鈴木一郎',
    team: 'バックエンドチーム',
    features: ['データ整合性修正', 'メモリリーク修正'],
    dependencies: [],
    environments: ['ステージング', '本番'],
    riskLevel: 'low',
    approvedBy: '田中太郎',
    createdDate: '2025-08-29',
    lastModified: '2025-08-29',
    description: '重要なバグ修正を含む緊急リリース',
    businessValue: 'システム安定性の確保と顧客満足度の維持',
    technicalNotes: 'ホットフィックスのため最小限の変更'
  }
];

type ViewMode = 'list' | 'detail' | 'create' | 'edit';

const ReleasePlanning: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPlan, setSelectedPlan] = useState<ReleasePlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<ReleasePlan> | null>(null);
  const [formData, setFormData] = useState<Partial<ReleasePlan>>({
    name: '',
    version: '',
    status: 'planning',
    priority: 'medium',
    targetDate: '',
    owner: '',
    team: '',
    features: [],
    dependencies: [],
    environments: ['開発', 'ステージング', '本番'],
    riskLevel: 'medium',
    description: '',
    businessValue: '',
    technicalNotes: ''
  });

  const filteredPlans = useMemo(() => {
    return mockReleasePlans.filter(plan => {
      const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          plan.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          plan.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || plan.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchTerm, statusFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-blue-500/20 text-blue-400',
      approved: 'bg-green-500/20 text-green-400',
      'in-progress': 'bg-yellow-500/20 text-yellow-400',
      ready: 'bg-purple-500/20 text-purple-400',
      cancelled: 'bg-red-500/20 text-red-400'
    };
    return colors[status as keyof typeof colors] || colors.planning;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-500/20 text-green-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-orange-500/20 text-orange-400',
      critical: 'bg-red-500/20 text-red-400'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-red-400'
    };
    return colors[risk as keyof typeof colors] || colors.medium;
  };

  const handleView = (plan: ReleasePlan) => {
    setSelectedPlan(plan);
    setViewMode('detail');
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      version: '',
      status: 'planning',
      priority: 'medium',
      targetDate: '',
      owner: '',
      team: '',
      features: [],
      dependencies: [],
      environments: ['開発', 'ステージング', '本番'],
      riskLevel: 'medium',
      description: '',
      businessValue: '',
      technicalNotes: ''
    });
    setViewMode('create');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // フォーム送信処理をここに実装
    console.log('リリース計画を作成:', formData);
    setViewMode('list');
  };

  const renderListView = () => (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">リリース計画管理</h1>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>新規計画</span>
        </button>
      </div>

      {/* 検索とフィルター */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none"
            >
              <option value="all">すべてのステータス</option>
              <option value="planning">計画中</option>
              <option value="approved">承認済み</option>
              <option value="in-progress">進行中</option>
              <option value="ready">準備完了</option>
              <option value="cancelled">中止</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none"
            >
              <option value="all">すべての優先度</option>
              <option value="critical">緊急</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>
      </div>

      {/* リスト */}
      <div className="space-y-4">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/15 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(plan.status)}`}>
                    {plan.status === 'planning' && '計画中'}
                    {plan.status === 'approved' && '承認済み'}
                    {plan.status === 'in-progress' && '進行中'}
                    {plan.status === 'ready' && '準備完了'}
                    {plan.status === 'cancelled' && '中止'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(plan.priority)}`}>
                    {plan.priority === 'critical' && '緊急'}
                    {plan.priority === 'high' && '高'}
                    {plan.priority === 'medium' && '中'}
                    {plan.priority === 'low' && '低'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="w-4 h-4" />
                    <span>{plan.version}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{plan.targetDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{plan.owner}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className={`w-4 h-4 ${getRiskColor(plan.riskLevel)}`} />
                    <span>{plan.riskLevel === 'low' ? '低' : plan.riskLevel === 'medium' ? '中' : '高'}リスク</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleView(plan)}
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Eye className="w-5 h-5" />
                <span>詳細</span>
              </button>
            </div>
            <div className="text-sm text-gray-400">
              <p>{plan.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDetailView = () => {
    if (!selectedPlan) return null;

    return (
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setViewMode('list')}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← リスト に戻る
          </button>
          <button 
            onClick={() => {
              setEditData(selectedPlan);
              setViewMode('edit');
            }}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Edit className="w-5 h-5" />
            <span>編集</span>
          </button>
        </div>

        {/* 基本情報 */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">{selectedPlan.name}</h1>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full ${getStatusColor(selectedPlan.status)}`}>
                {selectedPlan.status === 'planning' && '計画中'}
                {selectedPlan.status === 'approved' && '承認済み'}
                {selectedPlan.status === 'in-progress' && '進行中'}
                {selectedPlan.status === 'ready' && '準備完了'}
                {selectedPlan.status === 'cancelled' && '中止'}
              </span>
              <span className={`px-3 py-1 rounded-full ${getPriorityColor(selectedPlan.priority)}`}>
                {selectedPlan.priority === 'critical' && '緊急'}
                {selectedPlan.priority === 'high' && '高'}
                {selectedPlan.priority === 'medium' && '中'}
                {selectedPlan.priority === 'low' && '低'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">基本情報</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <GitBranch className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">バージョン: {selectedPlan.version}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">目標日: {selectedPlan.targetDate}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">担当者: {selectedPlan.owner}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">チーム: {selectedPlan.team}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={`w-5 h-5 ${getRiskColor(selectedPlan.riskLevel)}`} />
                  <span className="text-gray-300">
                    リスクレベル: {selectedPlan.riskLevel === 'low' ? '低' : selectedPlan.riskLevel === 'medium' ? '中' : '高'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">機能・特徴</h3>
              <div className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">環境</h3>
              <div className="space-y-2">
                {selectedPlan.environments.map((env, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                    <Server className="w-4 h-4 text-blue-400" />
                    <span>{env}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 詳細情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>説明</span>
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">{selectedPlan.description}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>ビジネス価値</span>
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">{selectedPlan.businessValue}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>依存関係</span>
            </h3>
            <div className="space-y-2">
              {selectedPlan.dependencies.length > 0 ? (
                selectedPlan.dependencies.map((dep, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span>{dep}</span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-gray-400">依存関係なし</span>
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>技術的注意事項</span>
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">{selectedPlan.technicalNotes}</p>
          </div>
        </div>

        {/* メタデータ */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">メタデータ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <span className="text-gray-400">作成日:</span>
              <span className="ml-2">{selectedPlan.createdDate}</span>
            </div>
            <div>
              <span className="text-gray-400">最終更新:</span>
              <span className="ml-2">{selectedPlan.lastModified}</span>
            </div>
            {selectedPlan.approvedBy && (
              <div>
                <span className="text-gray-400">承認者:</span>
                <span className="ml-2">{selectedPlan.approvedBy}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCreateView = () => (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setViewMode('list')}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← リスト に戻る
        </button>
        <h1 className="text-3xl font-bold text-white">新規リリース計画</h1>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6">基本情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">リリース名</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="リリース名を入力"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">バージョン</label>
              <input
                type="text"
                value={formData.version || ''}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="v1.0.0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">優先度</label>
              <select
                value={formData.priority || 'medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="critical">緊急</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">目標日</label>
              <input
                type="date"
                value={formData.targetDate || ''}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">担当者</label>
              <input
                type="text"
                value={formData.owner || ''}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="担当者名"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">チーム</label>
              <input
                type="text"
                value={formData.team || ''}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="チーム名"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6">詳細情報</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">説明</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="リリースの説明を入力"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ビジネス価値</label>
              <textarea
                value={formData.businessValue || ''}
                onChange={(e) => setFormData({ ...formData, businessValue: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="ビジネス価値を入力"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">技術的注意事項</label>
              <textarea
                value={formData.technicalNotes || ''}
                onChange={(e) => setFormData({ ...formData, technicalNotes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="技術的注意事項を入力"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">リスクレベル</label>
              <select
                value={formData.riskLevel || 'medium'}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            作成
          </button>
        </div>
      </form>
    </div>
  );

  const renderEditView = () => {
    if (!editData) return null;
    
    return (
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              setEditData(null);
              setViewMode('detail');
            }}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← 詳細に戻る
          </button>
          <h1 className="text-3xl font-bold text-white">リリース計画を編集</h1>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          // 保存処理（実際の実装では、APIコールを行う）
          console.log('保存データ:', editData);
          alert('リリース計画を更新しました');
          setSelectedPlan({...selectedPlan!, ...editData} as ReleasePlan);
          setViewMode('detail');
          setEditData(null);
        }} className="space-y-6">
          {/* 基本情報 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">リリース名</label>
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">バージョン</label>
                <input
                  type="text"
                  value={editData.version || ''}
                  onChange={(e) => setEditData({...editData, version: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ステータス</label>
                <select
                  value={editData.status || 'planning'}
                  onChange={(e) => setEditData({...editData, status: e.target.value as ReleasePlan['status']})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planning">計画中</option>
                  <option value="approved">承認済み</option>
                  <option value="in-progress">進行中</option>
                  <option value="ready">準備完了</option>
                  <option value="cancelled">中止</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">優先度</label>
                <select
                  value={editData.priority || 'medium'}
                  onChange={(e) => setEditData({...editData, priority: e.target.value as ReleasePlan['priority']})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="critical">緊急</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">目標日</label>
                <input
                  type="date"
                  value={editData.targetDate || ''}
                  onChange={(e) => setEditData({...editData, targetDate: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">リスクレベル</label>
                <select
                  value={editData.riskLevel || 'medium'}
                  onChange={(e) => setEditData({...editData, riskLevel: e.target.value as ReleasePlan['riskLevel']})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
            </div>
          </div>

          {/* 担当情報 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">担当情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">担当者</label>
                <input
                  type="text"
                  value={editData.owner || ''}
                  onChange={(e) => setEditData({...editData, owner: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">チーム</label>
                <input
                  type="text"
                  value={editData.team || ''}
                  onChange={(e) => setEditData({...editData, team: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* 詳細情報 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">詳細情報</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">説明</label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ビジネス価値</label>
                <textarea
                  value={editData.businessValue || ''}
                  onChange={(e) => setEditData({...editData, businessValue: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">技術的注意事項</label>
                <textarea
                  value={editData.technicalNotes || ''}
                  onChange={(e) => setEditData({...editData, technicalNotes: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setEditData(null);
                setViewMode('detail');
              }}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {viewMode === 'list' && renderListView()}
        {viewMode === 'detail' && renderDetailView()}
        {viewMode === 'create' && renderCreateView()}
        {viewMode === 'edit' && renderEditView()}
      </div>
    </div>
  );
};

export default ReleasePlanning;