import React, { useState, useMemo } from 'react';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Calendar, 
  FileText, 
  Search, 
  Filter,
  Plus,
  Eye,
  Edit,
  Play,
  Pause,
  RotateCcw,
  Target,
  Bug,
  Shield
} from 'lucide-react';

interface TestPlan {
  id: string;
  name: string;
  releaseVersion: string;
  status: 'draft' | 'ready' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  testType: 'unit' | 'integration' | 'system' | 'acceptance' | 'performance' | 'security';
  owner: string;
  tester: string;
  environment: string;
  startDate?: string;
  endDate?: string;
  targetDate: string;
  progress: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  blockedTests: number;
  coverage: number;
  defects: number;
  criticalDefects: number;
  description: string;
  testCases: TestCase[];
  createdDate: string;
  lastModified: string;
}

interface TestCase {
  id: string;
  name: string;
  status: 'not-started' | 'in-progress' | 'passed' | 'failed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  defectId?: string;
  executedBy?: string;
  executedDate?: string;
}

const mockTestPlans: TestPlan[] = [
  {
    id: 'TP-2025-001',
    name: 'セキュリティ強化機能テスト',
    releaseVersion: 'v2.1.0',
    status: 'in-progress',
    priority: 'high',
    testType: 'security',
    owner: '田中太郎',
    tester: '鈴木花子',
    environment: 'ステージング',
    startDate: '2025-08-25',
    targetDate: '2025-09-10',
    progress: 65,
    totalTests: 45,
    passedTests: 28,
    failedTests: 2,
    blockedTests: 1,
    coverage: 85,
    defects: 3,
    criticalDefects: 1,
    description: 'セキュリティ強化機能の包括的テスト計画',
    testCases: [
      {
        id: 'TC-001',
        name: '多要素認証ログインテスト',
        status: 'passed',
        priority: 'high',
        steps: ['ログイン画面にアクセス', 'ユーザー名とパスワードを入力', 'SMS認証コードを入力'],
        expectedResult: '正常にログインできること',
        actualResult: '期待通りに動作',
        executedBy: '鈴木花子',
        executedDate: '2025-08-28'
      },
      {
        id: 'TC-002',
        name: 'データ暗号化テスト',
        status: 'failed',
        priority: 'critical',
        steps: ['機密データを入力', '保存処理を実行', 'データベース内容を確認'],
        expectedResult: 'データが暗号化されて保存されること',
        actualResult: '一部データが平文で保存されている',
        defectId: 'DEF-001',
        executedBy: '鈴木花子',
        executedDate: '2025-08-29'
      }
    ],
    createdDate: '2025-08-20',
    lastModified: '2025-08-29'
  },
  {
    id: 'TP-2025-002',
    name: 'パフォーマンステスト',
    releaseVersion: 'v2.0.5',
    status: 'ready',
    priority: 'medium',
    testType: 'performance',
    owner: '山田次郎',
    tester: '佐藤一郎',
    environment: 'テスト',
    targetDate: '2025-09-05',
    progress: 0,
    totalTests: 20,
    passedTests: 0,
    failedTests: 0,
    blockedTests: 0,
    coverage: 0,
    defects: 0,
    criticalDefects: 0,
    description: 'システム全体のパフォーマンス検証',
    testCases: [
      {
        id: 'TC-003',
        name: '負荷テスト（1000同時ユーザー）',
        status: 'not-started',
        priority: 'high',
        steps: ['負荷テストツールを起動', '1000ユーザーの同時アクセスを設定', '30分間実行'],
        expectedResult: '応答時間が3秒以内を維持すること'
      }
    ],
    createdDate: '2025-08-22',
    lastModified: '2025-08-28'
  },
  {
    id: 'TP-2025-003',
    name: '緊急バグ修正テスト',
    releaseVersion: 'v2.0.4',
    status: 'completed',
    priority: 'critical',
    testType: 'system',
    owner: '鈴木一郎',
    tester: '田中花子',
    environment: 'ステージング',
    startDate: '2025-08-29',
    endDate: '2025-08-29',
    targetDate: '2025-08-30',
    progress: 100,
    totalTests: 8,
    passedTests: 8,
    failedTests: 0,
    blockedTests: 0,
    coverage: 100,
    defects: 0,
    criticalDefects: 0,
    description: '緊急バグ修正の回帰テスト',
    testCases: [
      {
        id: 'TC-004',
        name: 'データ整合性確認テスト',
        status: 'passed',
        priority: 'critical',
        steps: ['データ更新処理を実行', 'データベースの整合性を確認'],
        expectedResult: 'データが正しく更新されること',
        actualResult: '正常に動作確認',
        executedBy: '田中花子',
        executedDate: '2025-08-29'
      }
    ],
    createdDate: '2025-08-29',
    lastModified: '2025-08-29'
  }
];

type ViewMode = 'list' | 'detail' | 'create' | 'edit';

const ReleaseTesting: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPlan, setSelectedPlan] = useState<TestPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isPaused, setIsPaused] = useState(false);
  const [editData, setEditData] = useState<Partial<TestPlan> | null>(null);
  const [formData, setFormData] = useState<Partial<TestPlan>>({
    name: '',
    releaseVersion: '',
    status: 'draft',
    priority: 'medium',
    testType: 'system',
    owner: '',
    tester: '',
    environment: '',
    targetDate: '',
    totalTests: 0,
    description: '',
    testCases: []
  });

  const filteredPlans = useMemo(() => {
    return mockTestPlans.filter(plan => {
      const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          plan.releaseVersion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          plan.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
      const matchesType = typeFilter === 'all' || plan.testType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchTerm, statusFilter, typeFilter]);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-500/20 text-gray-400',
      ready: 'bg-blue-500/20 text-blue-400',
      'in-progress': 'bg-yellow-500/20 text-yellow-400',
      completed: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
      cancelled: 'bg-gray-500/20 text-gray-400'
    };
    return colors[status as keyof typeof colors] || colors.draft;
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

  const getTestTypeColor = (type: string) => {
    const colors = {
      unit: 'bg-blue-500/20 text-blue-400',
      integration: 'bg-purple-500/20 text-purple-400',
      system: 'bg-green-500/20 text-green-400',
      acceptance: 'bg-yellow-500/20 text-yellow-400',
      performance: 'bg-orange-500/20 text-orange-400',
      security: 'bg-red-500/20 text-red-400'
    };
    return colors[type as keyof typeof colors] || colors.system;
  };

  const getTestCaseStatusColor = (status: string) => {
    const colors = {
      'not-started': 'bg-gray-500/20 text-gray-400',
      'in-progress': 'bg-yellow-500/20 text-yellow-400',
      passed: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
      blocked: 'bg-orange-500/20 text-orange-400'
    };
    return colors[status as keyof typeof colors] || colors['not-started'];
  };

  const handleView = (plan: TestPlan) => {
    setSelectedPlan(plan);
    setViewMode('detail');
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      releaseVersion: '',
      status: 'draft',
      priority: 'medium',
      testType: 'system',
      owner: '',
      tester: '',
      environment: '',
      targetDate: '',
      totalTests: 0,
      description: '',
      testCases: []
    });
    setViewMode('create');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // フォーム送信処理をここに実装
    console.log('テスト計画を作成:', formData);
    setViewMode('list');
  };

  const renderListView = () => (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">リリーステスト管理</h1>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>新規テスト計画</span>
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
              <option value="draft">下書き</option>
              <option value="ready">準備完了</option>
              <option value="in-progress">実行中</option>
              <option value="completed">完了</option>
              <option value="failed">失敗</option>
              <option value="cancelled">中止</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none"
            >
              <option value="all">すべてのテストタイプ</option>
              <option value="unit">単体テスト</option>
              <option value="integration">統合テスト</option>
              <option value="system">システムテスト</option>
              <option value="acceptance">受入テスト</option>
              <option value="performance">パフォーマンステスト</option>
              <option value="security">セキュリティテスト</option>
            </select>
          </div>
        </div>
      </div>

      {/* テスト統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">総テスト計画</p>
              <p className="text-2xl font-bold text-white">{filteredPlans.length}</p>
            </div>
            <TestTube className="w-8 h-8 text-blue-400" />
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
                    {plan.status === 'draft' && '下書き'}
                    {plan.status === 'ready' && '準備完了'}
                    {plan.status === 'in-progress' && '実行中'}
                    {plan.status === 'completed' && '完了'}
                    {plan.status === 'failed' && '失敗'}
                    {plan.status === 'cancelled' && '中止'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(plan.priority)}`}>
                    {plan.priority === 'critical' && '緊急'}
                    {plan.priority === 'high' && '高'}
                    {plan.priority === 'medium' && '中'}
                    {plan.priority === 'low' && '低'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTestTypeColor(plan.testType)}`}>
                    {plan.testType === 'unit' && '単体'}
                    {plan.testType === 'integration' && '統合'}
                    {plan.testType === 'system' && 'システム'}
                    {plan.testType === 'acceptance' && '受入'}
                    {plan.testType === 'performance' && 'パフォーマンス'}
                    {plan.testType === 'security' && 'セキュリティ'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-300 mb-3">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>{plan.releaseVersion}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{plan.targetDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{plan.tester}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TestTube className="w-4 h-4" />
                    <span>{plan.passedTests}/{plan.totalTests}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bug className="w-4 h-4 text-red-400" />
                    <span>{plan.defects}</span>
                  </div>
                </div>
                {plan.progress > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>進捗</span>
                      <span>{plan.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${plan.progress}%` }}
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
            {selectedPlan.status === 'ready' && (
              <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Play className="w-5 h-5" />
                <span>テスト開始</span>
              </button>
            )}
            {selectedPlan.status === 'in-progress' && (
              <button 
                onClick={() => {
                  setIsPaused(!isPaused);
                  alert(isPaused ? 'テストを再開しました' : 'テストを一時停止しました');
                }}
                className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                <span>{isPaused ? '再開' : '一時停止'}</span>
              </button>
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
                {selectedPlan.status === 'draft' && '下書き'}
                {selectedPlan.status === 'ready' && '準備完了'}
                {selectedPlan.status === 'in-progress' && '実行中'}
                {selectedPlan.status === 'completed' && '完了'}
                {selectedPlan.status === 'failed' && '失敗'}
                {selectedPlan.status === 'cancelled' && '中止'}
              </span>
              <span className={`px-3 py-1 rounded-full ${getPriorityColor(selectedPlan.priority)}`}>
                {selectedPlan.priority === 'critical' && '緊急'}
                {selectedPlan.priority === 'high' && '高'}
                {selectedPlan.priority === 'medium' && '中'}
                {selectedPlan.priority === 'low' && '低'}
              </span>
              <span className={`px-3 py-1 rounded-full ${getTestTypeColor(selectedPlan.testType)}`}>
                {selectedPlan.testType === 'unit' && '単体テスト'}
                {selectedPlan.testType === 'integration' && '統合テスト'}
                {selectedPlan.testType === 'system' && 'システムテスト'}
                {selectedPlan.testType === 'acceptance' && '受入テスト'}
                {selectedPlan.testType === 'performance' && 'パフォーマンステスト'}
                {selectedPlan.testType === 'security' && 'セキュリティテスト'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">基本情報</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">バージョン: {selectedPlan.releaseVersion}</span>
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
                  <TestTube className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">テスト実行者: {selectedPlan.tester}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">環境: {selectedPlan.environment}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">進捗状況</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>全体進捗</span>
                    <span>{selectedPlan.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${selectedPlan.progress}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-green-400">
                    <span className="block font-medium">{selectedPlan.passedTests}</span>
                    <span className="text-gray-400">成功</span>
                  </div>
                  <div className="text-red-400">
                    <span className="block font-medium">{selectedPlan.failedTests}</span>
                    <span className="text-gray-400">失敗</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">品質指標</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">カバレッジ:</span>
                  <span className="text-white">{selectedPlan.coverage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">総不具合:</span>
                  <span className="text-red-400">{selectedPlan.defects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">重大不具合:</span>
                  <span className="text-red-400">{selectedPlan.criticalDefects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ブロック済み:</span>
                  <span className="text-orange-400">{selectedPlan.blockedTests}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 説明 */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>テスト計画説明</span>
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">{selectedPlan.description}</p>
        </div>

        {/* テストケース */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <TestTube className="w-5 h-5" />
            <span>テストケース</span>
          </h3>
          <div className="space-y-4">
            {selectedPlan.testCases.map((testCase) => (
              <div key={testCase.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-white">{testCase.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getTestCaseStatusColor(testCase.status)}`}>
                      {testCase.status === 'not-started' && '未開始'}
                      {testCase.status === 'in-progress' && '実行中'}
                      {testCase.status === 'passed' && '成功'}
                      {testCase.status === 'failed' && '失敗'}
                      {testCase.status === 'blocked' && 'ブロック'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(testCase.priority)}`}>
                      {testCase.priority === 'critical' && '緊急'}
                      {testCase.priority === 'high' && '高'}
                      {testCase.priority === 'medium' && '中'}
                      {testCase.priority === 'low' && '低'}
                    </span>
                  </div>
                  {testCase.executedBy && (
                    <div className="text-sm text-gray-400">
                      実行者: {testCase.executedBy} ({testCase.executedDate})
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-300 mb-2">テスト手順:</h5>
                    <ol className="list-decimal list-inside space-y-1 text-gray-400">
                      {testCase.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-300 mb-2">期待結果:</h5>
                    <p className="text-gray-400">{testCase.expectedResult}</p>
                    {testCase.actualResult && (
                      <>
                        <h5 className="font-medium text-gray-300 mb-2 mt-3">実際の結果:</h5>
                        <p className={testCase.status === 'failed' ? 'text-red-400' : 'text-green-400'}>
                          {testCase.actualResult}
                        </p>
                      </>
                    )}
                    {testCase.defectId && (
                      <div className="mt-3">
                        <span className="text-red-400">不具合ID: {testCase.defectId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
            {selectedPlan.startDate && (
              <div>
                <span className="text-gray-400">開始日:</span>
                <span className="ml-2">{selectedPlan.startDate}</span>
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
        <h1 className="text-3xl font-bold text-white">新規テスト計画</h1>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6">基本情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">テスト計画名</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="テスト計画名を入力"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">テストタイプ</label>
              <select
                value={formData.testType || 'system'}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value as any })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="unit">単体テスト</option>
                <option value="integration">統合テスト</option>
                <option value="system">システムテスト</option>
                <option value="acceptance">受入テスト</option>
                <option value="performance">パフォーマンステスト</option>
                <option value="security">セキュリティテスト</option>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">テスト実行者</label>
              <input
                type="text"
                value={formData.tester || ''}
                onChange={(e) => setFormData({ ...formData, tester: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="テスト実行者名"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">テスト環境</label>
              <input
                type="text"
                value={formData.environment || ''}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="テスト環境"
                required
              />
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
                rows={4}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="テスト計画の説明を入力"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">総テストケース数</label>
              <input
                type="number"
                min="0"
                value={formData.totalTests || 0}
                onChange={(e) => setFormData({ ...formData, totalTests: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="0"
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
          <h1 className="text-3xl font-bold text-white">テスト計画を編集</h1>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          // 保存処理（実際の実装では、APIコールを行う）
          console.log('保存データ:', editData);
          alert('テスト計画を更新しました');
          setSelectedPlan({...selectedPlan!, ...editData} as TestPlan);
          setViewMode('detail');
          setEditData(null);
        }} className="space-y-6">
          {/* 基本情報 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">テスト計画名</label>
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
                  value={editData.status || 'draft'}
                  onChange={(e) => setEditData({...editData, status: e.target.value as TestPlan['status']})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">下書き</option>
                  <option value="ready">準備完了</option>
                  <option value="in-progress">実行中</option>
                  <option value="completed">完了</option>
                  <option value="failed">失敗</option>
                  <option value="cancelled">中止</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">優先度</label>
                <select
                  value={editData.priority || 'medium'}
                  onChange={(e) => setEditData({...editData, priority: e.target.value as TestPlan['priority']})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="critical">緊急</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">テストタイプ</label>
                <select
                  value={editData.testType || 'system'}
                  onChange={(e) => setEditData({...editData, testType: e.target.value as TestPlan['testType']})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unit">単体テスト</option>
                  <option value="integration">統合テスト</option>
                  <option value="system">システムテスト</option>
                  <option value="acceptance">受入テスト</option>
                  <option value="performance">パフォーマンステスト</option>
                  <option value="security">セキュリティテスト</option>
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
            </div>
          </div>
          
          {/* 担当情報 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">担当情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium text-gray-300 mb-2">テスト実行者</label>
                <input
                  type="text"
                  value={editData.tester || ''}
                  onChange={(e) => setEditData({...editData, tester: e.target.value})}
                  className="w-full bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">テスト環境</label>
                <input
                  type="text"
                  value={editData.environment || ''}
                  onChange={(e) => setEditData({...editData, environment: e.target.value})}
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

export default ReleaseTesting;