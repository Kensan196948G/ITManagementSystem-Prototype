import React, { useState, useMemo } from 'react';
import { 
  Rocket, 
  Server, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Users, 
  Calendar, 
  Target, 
  Search, 
  Filter,
  Plus,
  Eye,
  Edit,
  Play,
  Pause,
  RotateCcw,
  GitBranch,
  Database,
  Shield,
  Activity,
  Zap,
  RefreshCw
} from 'lucide-react';

interface DeploymentPlan {
  id: string;
  name: string;
  releaseVersion: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'failed' | 'rolled-back' | 'cancelled';
  deploymentType: 'blue-green' | 'canary' | 'rolling' | 'recreate';
  priority: 'low' | 'medium' | 'high' | 'critical';
  environment: 'development' | 'staging' | 'production';
  targetDate: string;
  actualDate?: string;
  startTime?: string;
  endTime?: string;
  owner: string;
  approver: string;
  downtime: number; // minutes
  rollbackPlan: boolean;
  healthChecks: boolean;
  autoRollback: boolean;
  trafficSplit?: number; // percentage for canary
  servers: DeploymentServer[];
  steps: DeploymentStep[];
  risks: RiskAssessment[];
  backupCompleted: boolean;
  testingCompleted: boolean;
  approvalReceived: boolean;
  description: string;
  notes: string;
  createdDate: string;
  lastModified: string;
}

interface DeploymentServer {
  id: string;
  name: string;
  type: 'web' | 'api' | 'database' | 'cache' | 'queue';
  status: 'ready' | 'deploying' | 'deployed' | 'failed' | 'rolled-back';
  progress: number;
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
  lastDeployment?: string;
}

interface DeploymentStep {
  id: string;
  name: string;
  description: string;
  order: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  estimatedDuration: number; // minutes
  actualDuration?: number;
  automated: boolean;
  rollbackAction?: string;
  dependencies: string[];
}

interface RiskAssessment {
  id: string;
  risk: string;
  impact: 'low' | 'medium' | 'high';
  probability: 'low' | 'medium' | 'high';
  mitigation: string;
  status: 'identified' | 'mitigated' | 'accepted';
}

const mockDeploymentPlans: DeploymentPlan[] = [
  {
    id: 'DP-2025-001',
    name: 'セキュリティ強化リリース本番デプロイ',
    releaseVersion: 'v2.1.0',
    status: 'scheduled',
    deploymentType: 'blue-green',
    priority: 'high',
    environment: 'production',
    targetDate: '2025-09-15',
    startTime: '02:00',
    owner: '田中太郎',
    approver: '佐藤花子',
    downtime: 30,
    rollbackPlan: true,
    healthChecks: true,
    autoRollback: true,
    servers: [
      {
        id: 'srv-001',
        name: 'web-server-01',
        type: 'web',
        status: 'ready',
        progress: 0,
        healthStatus: 'healthy',
        lastDeployment: '2025-08-15'
      },
      {
        id: 'srv-002',
        name: 'api-server-01',
        type: 'api',
        status: 'ready',
        progress: 0,
        healthStatus: 'healthy',
        lastDeployment: '2025-08-15'
      },
      {
        id: 'srv-003',
        name: 'db-server-01',
        type: 'database',
        status: 'ready',
        progress: 0,
        healthStatus: 'healthy',
        lastDeployment: '2025-08-10'
      }
    ],
    steps: [
      {
        id: 'step-001',
        name: 'データベースバックアップ',
        description: '本番データベースの完全バックアップを実行',
        order: 1,
        status: 'pending',
        estimatedDuration: 15,
        automated: true,
        rollbackAction: 'バックアップから復元',
        dependencies: []
      },
      {
        id: 'step-002',
        name: 'Blue環境へデプロイ',
        description: 'Blue環境に新バージョンをデプロイ',
        order: 2,
        status: 'pending',
        estimatedDuration: 10,
        automated: true,
        rollbackAction: 'Green環境に切り戻し',
        dependencies: ['step-001']
      },
      {
        id: 'step-003',
        name: 'ヘルスチェック実行',
        description: 'Blue環境のヘルスチェックを実行',
        order: 3,
        status: 'pending',
        estimatedDuration: 5,
        automated: true,
        rollbackAction: 'Green環境に切り戻し',
        dependencies: ['step-002']
      }
    ],
    risks: [
      {
        id: 'risk-001',
        risk: 'データベース移行失敗',
        impact: 'high',
        probability: 'low',
        mitigation: '事前テスト環境での検証実施',
        status: 'mitigated'
      },
      {
        id: 'risk-002',
        risk: 'パフォーマンス劣化',
        impact: 'medium',
        probability: 'medium',
        mitigation: '負荷テスト実施、監視強化',
        status: 'mitigated'
      }
    ],
    backupCompleted: true,
    testingCompleted: true,
    approvalReceived: true,
    description: 'セキュリティ強化機能の本番環境デプロイメント',
    notes: 'Blue-Green デプロイメントによる無停止デプロイを実施',
    createdDate: '2025-08-20',
    lastModified: '2025-08-29'
  },
  {
    id: 'DP-2025-002',
    name: 'UIパフォーマンス改善デプロイ',
    releaseVersion: 'v2.0.5',
    status: 'in-progress',
    deploymentType: 'canary',
    priority: 'medium',
    environment: 'production',
    targetDate: '2025-09-10',
    startTime: '10:00',
    actualDate: '2025-09-10',
    trafficSplit: 10,
    owner: '山田次郎',
    approver: '田中太郎',
    downtime: 0,
    rollbackPlan: true,
    healthChecks: true,
    autoRollback: false,
    servers: [
      {
        id: 'srv-004',
        name: 'web-server-02',
        type: 'web',
        status: 'deploying',
        progress: 60,
        healthStatus: 'healthy'
      },
      {
        id: 'srv-005',
        name: 'web-server-03',
        type: 'web',
        status: 'deployed',
        progress: 100,
        healthStatus: 'healthy'
      }
    ],
    steps: [
      {
        id: 'step-004',
        name: 'Canary環境デプロイ',
        description: '10%のトラフィックを新バージョンに流す',
        order: 1,
        status: 'completed',
        estimatedDuration: 5,
        actualDuration: 4,
        automated: true,
        rollbackAction: '旧バージョンに100%切り戻し',
        dependencies: []
      },
      {
        id: 'step-005',
        name: 'パフォーマンス監視',
        description: '30分間パフォーマンス指標を監視',
        order: 2,
        status: 'in-progress',
        estimatedDuration: 30,
        automated: true,
        rollbackAction: 'Canaryデプロイロールバック',
        dependencies: ['step-004']
      }
    ],
    risks: [
      {
        id: 'risk-003',
        risk: 'ユーザーエクスペリエンス悪化',
        impact: 'medium',
        probability: 'low',
        mitigation: 'Canaryデプロイで段階的展開',
        status: 'mitigated'
      }
    ],
    backupCompleted: false,
    testingCompleted: true,
    approvalReceived: true,
    description: 'フロントエンドパフォーマンス改善のCanaryデプロイメント',
    notes: '10%のトラフィックで開始、問題なければ段階的に拡張',
    createdDate: '2025-08-22',
    lastModified: '2025-09-10'
  },
  {
    id: 'DP-2025-003',
    name: '緊急バグ修正ホットフィックス',
    releaseVersion: 'v2.0.4',
    status: 'completed',
    deploymentType: 'rolling',
    priority: 'critical',
    environment: 'production',
    targetDate: '2025-09-02',
    actualDate: '2025-09-02',
    startTime: '14:00',
    endTime: '14:15',
    owner: '鈴木一郎',
    approver: '田中太郎',
    downtime: 0,
    rollbackPlan: true,
    healthChecks: true,
    autoRollback: true,
    servers: [
      {
        id: 'srv-006',
        name: 'api-server-02',
        type: 'api',
        status: 'deployed',
        progress: 100,
        healthStatus: 'healthy',
        lastDeployment: '2025-09-02'
      }
    ],
    steps: [
      {
        id: 'step-006',
        name: 'ローリングアップデート',
        description: 'APIサーバーを順次更新',
        order: 1,
        status: 'completed',
        estimatedDuration: 10,
        actualDuration: 8,
        automated: true,
        rollbackAction: '旧バージョンにロールバック',
        dependencies: []
      }
    ],
    risks: [],
    backupCompleted: true,
    testingCompleted: true,
    approvalReceived: true,
    description: 'データ整合性問題の緊急修正デプロイメント',
    notes: 'ローリングアップデートで無停止デプロイ完了',
    createdDate: '2025-09-02',
    lastModified: '2025-09-02'
  }
];

type ViewMode = 'list' | 'detail' | 'create' | 'edit';

const ReleaseDeployment: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPlan, setSelectedPlan] = useState<DeploymentPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  const [editData, setEditData] = useState<Partial<DeploymentPlan> | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [formData, setFormData] = useState<Partial<DeploymentPlan>>({
    name: '',
    releaseVersion: '',
    status: 'scheduled',
    deploymentType: 'blue-green',
    priority: 'medium',
    environment: 'production',
    targetDate: '',
    owner: '',
    approver: '',
    downtime: 0,
    rollbackPlan: true,
    healthChecks: true,
    autoRollback: false,
    description: '',
    notes: ''
  });

  const filteredPlans = useMemo(() => {
    return mockDeploymentPlans.filter(plan => {
      const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          plan.releaseVersion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          plan.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
      const matchesEnvironment = environmentFilter === 'all' || plan.environment === environmentFilter;
      
      return matchesSearch && matchesStatus && matchesEnvironment;
    });
  }, [searchTerm, statusFilter, environmentFilter]);

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-500/20 text-blue-400',
      'in-progress': 'bg-yellow-500/20 text-yellow-400',
      completed: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
      'rolled-back': 'bg-orange-500/20 text-orange-400',
      cancelled: 'bg-gray-500/20 text-gray-400'
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
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

  const getDeploymentTypeColor = (type: string) => {
    const colors = {
      'blue-green': 'bg-blue-500/20 text-blue-400',
      canary: 'bg-yellow-500/20 text-yellow-400',
      rolling: 'bg-green-500/20 text-green-400',
      recreate: 'bg-red-500/20 text-red-400'
    };
    return colors[type as keyof typeof colors] || colors['blue-green'];
  };

  const getEnvironmentColor = (env: string) => {
    const colors = {
      development: 'bg-green-500/20 text-green-400',
      staging: 'bg-yellow-500/20 text-yellow-400',
      production: 'bg-red-500/20 text-red-400'
    };
    return colors[env as keyof typeof colors] || colors.production;
  };

  const getRiskColor = (level: string) => {
    const colors = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-red-400'
    };
    return colors[level as keyof typeof colors] || colors.medium;
  };

  const getServerStatusColor = (status: string) => {
    const colors = {
      ready: 'bg-blue-500/20 text-blue-400',
      deploying: 'bg-yellow-500/20 text-yellow-400',
      deployed: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
      'rolled-back': 'bg-orange-500/20 text-orange-400'
    };
    return colors[status as keyof typeof colors] || colors.ready;
  };

  const getStepStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-500/20 text-gray-400',
      'in-progress': 'bg-yellow-500/20 text-yellow-400',
      completed: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
      skipped: 'bg-gray-500/20 text-gray-400'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const handleView = (plan: DeploymentPlan) => {
    setSelectedPlan(plan);
    setViewMode('detail');
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      releaseVersion: '',
      status: 'scheduled',
      deploymentType: 'blue-green',
      priority: 'medium',
      environment: 'production',
      targetDate: '',
      owner: '',
      approver: '',
      downtime: 0,
      rollbackPlan: true,
      healthChecks: true,
      autoRollback: false,
      description: '',
      notes: ''
    });
    setViewMode('create');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // フォーム送信処理をここに実装
    console.log('デプロイメント計画を作成:', formData);
    setViewMode('list');
  };

  const renderListView = () => (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">リリースデプロイメント</h1>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>新規デプロイ計画</span>
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
              <option value="scheduled">予定</option>
              <option value="in-progress">実行中</option>
              <option value="completed">完了</option>
              <option value="failed">失敗</option>
              <option value="rolled-back">ロールバック</option>
              <option value="cancelled">中止</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={environmentFilter}
              onChange={(e) => setEnvironmentFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none"
            >
              <option value="all">すべての環境</option>
              <option value="development">開発</option>
              <option value="staging">ステージング</option>
              <option value="production">本番</option>
            </select>
          </div>
        </div>
      </div>

      {/* デプロイメント統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">総デプロイ計画</p>
              <p className="text-2xl font-bold text-white">{filteredPlans.length}</p>
            </div>
            <Rocket className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">実行中</p>
              <p className="text-2xl font-bold text-yellow-400">
                {filteredPlans.filter(p => p.status === 'in-progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">完了</p>
              <p className="text-2xl font-bold text-green-400">
                {filteredPlans.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">失敗</p>
              <p className="text-2xl font-bold text-red-400">
                {filteredPlans.filter(p => p.status === 'failed').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
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
                    {plan.status === 'scheduled' && '予定'}
                    {plan.status === 'in-progress' && '実行中'}
                    {plan.status === 'completed' && '完了'}
                    {plan.status === 'failed' && '失敗'}
                    {plan.status === 'rolled-back' && 'ロールバック'}
                    {plan.status === 'cancelled' && '中止'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(plan.priority)}`}>
                    {plan.priority === 'critical' && '緊急'}
                    {plan.priority === 'high' && '高'}
                    {plan.priority === 'medium' && '中'}
                    {plan.priority === 'low' && '低'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getDeploymentTypeColor(plan.deploymentType)}`}>
                    {plan.deploymentType === 'blue-green' && 'Blue-Green'}
                    {plan.deploymentType === 'canary' && 'Canary'}
                    {plan.deploymentType === 'rolling' && 'Rolling'}
                    {plan.deploymentType === 'recreate' && 'Recreate'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getEnvironmentColor(plan.environment)}`}>
                    {plan.environment === 'development' && '開発'}
                    {plan.environment === 'staging' && 'ステージング'}
                    {plan.environment === 'production' && '本番'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-300 mb-3">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="w-4 h-4" />
                    <span>{plan.releaseVersion}</span>
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
                    <Server className="w-4 h-4" />
                    <span>{plan.servers.length}サーバー</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{plan.downtime}分停止</span>
                  </div>
                </div>
                {plan.status === 'in-progress' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>デプロイ進捗</span>
                      <span>{Math.round((plan.servers.reduce((sum, server) => sum + server.progress, 0) / plan.servers.length))}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((plan.servers.reduce((sum, server) => sum + server.progress, 0) / plan.servers.length))}%` }}
                      />
                    </div>
                  </div>
                )}
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
          <div className="flex space-x-2">
            {selectedPlan.status === 'scheduled' && (
              <button 
                onClick={() => {
                  if (!selectedPlan.approvalReceived) {
                    const confirmed = confirm('このデプロイメントを承認しますか？\n\n承認後、スケジュールされた時間にデプロイメントが開始されます。');
                    if (confirmed) {
                      setApprovalStatus('approved');
                      setSelectedPlan({...selectedPlan, approvalReceived: true});
                      alert('デプロイメントが承認されました。\nスケジュールされた時間に自動的にデプロイメントが開始されます。');
                    }
                  } else {
                    const confirmed = confirm('承認を取り消しますか？');
                    if (confirmed) {
                      setApprovalStatus('pending');
                      setSelectedPlan({...selectedPlan, approvalReceived: false});
                      alert('デプロイメントの承認が取り消されました。');
                    }
                  }
                }}
                className={`flex items-center space-x-2 ${selectedPlan.approvalReceived ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-lg transition-colors`}
              >
                {selectedPlan.approvalReceived ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                <span>{selectedPlan.approvalReceived ? '承認取消' : 'デプロイ承認'}</span>
              </button>
            )}
            {selectedPlan.status === 'in-progress' && (
              <>
                <button className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <RotateCcw className="w-5 h-5" />
                  <span>ロールバック</span>
                </button>
                <button className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Pause className="w-5 h-5" />
                  <span>一時停止</span>
                </button>
              </>
            )}
            <button 
              onClick={() => {
                setEditData(selectedPlan);
                setViewMode('edit');
              }}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Edit className="w-5 h-5" />
              <span>編集</span>
            </button>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">{selectedPlan.name}</h1>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full ${getStatusColor(selectedPlan.status)}`}>
                {selectedPlan.status === 'scheduled' && '予定'}
                {selectedPlan.status === 'in-progress' && '実行中'}
                {selectedPlan.status === 'completed' && '完了'}
                {selectedPlan.status === 'failed' && '失敗'}
                {selectedPlan.status === 'rolled-back' && 'ロールバック'}
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
              <h3 className="text-lg font-semibold text-white mb-3">デプロイメント情報</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <GitBranch className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">バージョン: {selectedPlan.releaseVersion}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">タイプ: {selectedPlan.deploymentType}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Server className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">環境: {selectedPlan.environment}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">予定日: {selectedPlan.targetDate}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">ダウンタイム: {selectedPlan.downtime}分</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">責任者</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">担当者: {selectedPlan.owner}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">承認者: {selectedPlan.approver}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">設定</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">
                    ロールバック計画: {selectedPlan.rollbackPlan ? '有' : '無'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">
                    ヘルスチェック: {selectedPlan.healthChecks ? '有効' : '無効'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">
                    自動ロールバック: {selectedPlan.autoRollback ? '有効' : '無効'}
                  </span>
                </div>
                {selectedPlan.trafficSplit && (
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">トラフィック分割: {selectedPlan.trafficSplit}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* サーバー状況 */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <span>サーバー状況</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedPlan.servers.map((server) => (
              <div key={server.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">{server.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getServerStatusColor(server.status)}`}>
                    {server.status === 'ready' && '準備完了'}
                    {server.status === 'deploying' && 'デプロイ中'}
                    {server.status === 'deployed' && 'デプロイ済み'}
                    {server.status === 'failed' && '失敗'}
                    {server.status === 'rolled-back' && 'ロールバック'}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>タイプ:</span>
                    <span>{server.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ヘルス:</span>
                    <span className={
                      server.healthStatus === 'healthy' ? 'text-green-400' :
                      server.healthStatus === 'unhealthy' ? 'text-red-400' : 'text-gray-400'
                    }>
                      {server.healthStatus === 'healthy' && '正常'}
                      {server.healthStatus === 'unhealthy' && '異常'}
                      {server.healthStatus === 'unknown' && '不明'}
                    </span>
                  </div>
                  {server.progress > 0 && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>進捗:</span>
                        <span>{server.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${server.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* デプロイメント手順 */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>デプロイメント手順</span>
          </h3>
          <div className="space-y-4">
            {selectedPlan.steps
              .sort((a, b) => a.order - b.order)
              .map((step) => (
              <div key={step.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 text-sm">#{step.order}</span>
                    <h4 className="font-medium text-white">{step.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStepStatusColor(step.status)}`}>
                      {step.status === 'pending' && '待機中'}
                      {step.status === 'in-progress' && '実行中'}
                      {step.status === 'completed' && '完了'}
                      {step.status === 'failed' && '失敗'}
                      {step.status === 'skipped' && 'スキップ'}
                    </span>
                    {step.automated && (
                      <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                        自動
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {step.actualDuration ? `${step.actualDuration}分` : `予定${step.estimatedDuration}分`}
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-2">{step.description}</p>
                {step.rollbackAction && (
                  <div className="text-xs text-orange-400">
                    <span className="font-medium">ロールバック:</span> {step.rollbackAction}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* リスク評価 */}
        {selectedPlan.risks.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>リスク評価</span>
            </h3>
            <div className="space-y-4">
              {selectedPlan.risks.map((risk) => (
                <div key={risk.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{risk.risk}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      risk.status === 'mitigated' ? 'bg-green-500/20 text-green-400' :
                      risk.status === 'accepted' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {risk.status === 'identified' && '特定済み'}
                      {risk.status === 'mitigated' && '軽減済み'}
                      {risk.status === 'accepted' && '受容'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">影響度:</span>
                      <span className={`ml-2 ${getRiskColor(risk.impact)}`}>
                        {risk.impact === 'low' ? '低' : risk.impact === 'medium' ? '中' : '高'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">確率:</span>
                      <span className={`ml-2 ${getRiskColor(risk.probability)}`}>
                        {risk.probability === 'low' ? '低' : risk.probability === 'medium' ? '中' : '高'}
                      </span>
                    </div>
                    <div className="md:col-span-1">
                      <span className="text-gray-400">軽減策:</span>
                      <span className="ml-2 text-gray-300">{risk.mitigation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 事前チェック */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>事前チェック</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                selectedPlan.backupCompleted ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {selectedPlan.backupCompleted ? (
                  <CheckCircle className="w-3 h-3 text-white" />
                ) : (
                  <XCircle className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="text-gray-300">バックアップ完了</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                selectedPlan.testingCompleted ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {selectedPlan.testingCompleted ? (
                  <CheckCircle className="w-3 h-3 text-white" />
                ) : (
                  <XCircle className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="text-gray-300">テスト完了</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                selectedPlan.approvalReceived ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {selectedPlan.approvalReceived ? (
                  <CheckCircle className="w-3 h-3 text-white" />
                ) : (
                  <XCircle className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="text-gray-300">承認取得</span>
            </div>
          </div>
        </div>

        {/* 注意事項とメタデータ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">説明</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{selectedPlan.description}</p>
            {selectedPlan.notes && (
              <>
                <h4 className="text-md font-medium text-white mt-4 mb-2">注意事項</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{selectedPlan.notes}</p>
              </>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">メタデータ</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">作成日:</span>
                <span>{selectedPlan.createdDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">最終更新:</span>
                <span>{selectedPlan.lastModified}</span>
              </div>
              {selectedPlan.actualDate && (
                <div className="flex justify-between">
                  <span className="text-gray-400">実行日:</span>
                  <span>{selectedPlan.actualDate}</span>
                </div>
              )}
              {selectedPlan.startTime && (
                <div className="flex justify-between">
                  <span className="text-gray-400">開始時刻:</span>
                  <span>{selectedPlan.startTime}</span>
                </div>
              )}
              {selectedPlan.endTime && (
                <div className="flex justify-between">
                  <span className="text-gray-400">終了時刻:</span>
                  <span>{selectedPlan.endTime}</span>
                </div>
              )}
            </div>
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
        <h1 className="text-3xl font-bold text-white">新規デプロイメント計画</h1>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6">基本情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">デプロイメント名</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="デプロイメント名を入力"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">リリースバージョン</label>
              <input
                type="text"
                value={formData.releaseVersion || ''}
                onChange={(e) => setFormData({ ...formData, releaseVersion: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="v1.0.0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">デプロイメントタイプ</label>
              <select
                value={formData.deploymentType || 'blue-green'}
                onChange={(e) => setFormData({ ...formData, deploymentType: e.target.value as any })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="blue-green">Blue-Green</option>
                <option value="canary">Canary</option>
                <option value="rolling">Rolling</option>
                <option value="recreate">Recreate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">環境</label>
              <select
                value={formData.environment || 'production'}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="development">開発</option>
                <option value="staging">ステージング</option>
                <option value="production">本番</option>
              </select>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">承認者</label>
              <input
                type="text"
                value={formData.approver || ''}
                onChange={(e) => setFormData({ ...formData, approver: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="承認者名"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6">設定</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                予定ダウンタイム（分）
              </label>
              <input
                type="number"
                min="0"
                value={formData.downtime || 0}
                onChange={(e) => setFormData({ ...formData, downtime: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.rollbackPlan || false}
                  onChange={(e) => setFormData({ ...formData, rollbackPlan: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">ロールバック計画を作成</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.healthChecks || false}
                  onChange={(e) => setFormData({ ...formData, healthChecks: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">ヘルスチェックを有効化</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.autoRollback || false}
                  onChange={(e) => setFormData({ ...formData, autoRollback: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">自動ロールバックを有効化</span>
              </label>
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
                placeholder="デプロイメントの説明を入力"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">注意事項</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="注意事項を入力"
              />
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
          <h1 className="text-3xl font-bold text-white">デプロイメント計画を編集</h1>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          // 保存処理（実際の実装では、APIコールを行う）
          console.log('保存データ:', editData);
          alert('デプロイメント計画を更新しました');
          setSelectedPlan({...selectedPlan!, ...editData} as DeploymentPlan);
          setViewMode('detail');
          setEditData(null);
        }} className="space-y-6">
          {/* 基本情報 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">デプロイメント名</label>
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">リリースバージョン</label>
                <input
                  type="text"
                  value={editData.releaseVersion || ''}
                  onChange={(e) => setEditData({...editData, releaseVersion: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ステータス</label>
                <select
                  value={editData.status || 'scheduled'}
                  onChange={(e) => setEditData({...editData, status: e.target.value as DeploymentPlan['status']})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="scheduled">予定</option>
                  <option value="in-progress">実行中</option>
                  <option value="completed">完了</option>
                  <option value="failed">失敗</option>
                  <option value="rolled-back">ロールバック</option>
                  <option value="cancelled">中止</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">優先度</label>
                <select
                  value={editData.priority || 'medium'}
                  onChange={(e) => setEditData({...editData, priority: e.target.value as DeploymentPlan['priority']})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="critical">緊急</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">デプロイメントタイプ</label>
                <select
                  value={editData.deploymentType || 'blue-green'}
                  onChange={(e) => setEditData({...editData, deploymentType: e.target.value as DeploymentPlan['deploymentType']})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="blue-green">Blue-Green</option>
                  <option value="canary">Canary</option>
                  <option value="rolling">Rolling</option>
                  <option value="recreate">Recreate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">環境</label>
                <select
                  value={editData.environment || 'production'}
                  onChange={(e) => setEditData({...editData, environment: e.target.value as DeploymentPlan['environment']})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="development">開発</option>
                  <option value="staging">ステージング</option>
                  <option value="production">本番</option>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">承認者</label>
                <input
                  type="text"
                  value={editData.approver || ''}
                  onChange={(e) => setEditData({...editData, approver: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ダウンタイム（分）</label>
                <input
                  type="number"
                  min="0"
                  value={editData.downtime || 0}
                  onChange={(e) => setEditData({...editData, downtime: parseInt(e.target.value) || 0})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  rows={3}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="デプロイメントの説明を入力"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">注意事項</label>
                <textarea
                  value={editData.notes || ''}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  rows={3}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="注意事項を入力"
                />
              </div>
            </div>
          </div>

          {/* 保存・キャンセルボタン */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setEditData(null);
                setViewMode('detail');
              }}
              className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
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

export default ReleaseDeployment;