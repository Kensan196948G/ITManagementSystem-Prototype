import React, { useState, useEffect } from 'react';
import {
  AlertTriangleIcon,
  PlusIcon,
  SearchIcon,
  DownloadIcon,
  RefreshCwIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  FileTextIcon,
  BrainIcon,
  WrenchIcon,
  BugIcon,
  LinkIcon
} from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Investigating' | 'Known Error' | 'Resolved' | 'Closed';
  category: string;
  assignedTo?: string;
  reportedBy: string;
  rootCause?: string;
  workaround?: string;
  solution?: string;
  relatedIncidents: string[];
  affectedServices: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface NewProblemForm {
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
  relatedIncidents: string[];
  affectedServices: string[];
}

interface RootCauseAnalysisForm {
  problemId: string;
  rootCause: string;
  workaround: string;
}

const ProblemManagement: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [showNewProblemForm, setShowNewProblemForm] = useState(false);
  const [showRootCauseForm, setShowRootCauseForm] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [newProblem, setNewProblem] = useState<NewProblemForm>({
    title: '',
    description: '',
    priority: 'Medium',
    category: '',
    relatedIncidents: [],
    affectedServices: []
  });
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState<RootCauseAnalysisForm>({
    problemId: '',
    rootCause: '',
    workaround: ''
  });

  // Sample data
  const sampleProblems: Problem[] = [
    {
      id: 'PRB-001',
      title: 'メールサーバーの定期的な性能劣化',
      description: '月曜日の朝に毎回メールサーバーのパフォーマンスが低下する問題が継続して発生しています。',
      priority: 'High',
      status: 'Investigating',
      category: 'インフラストラクチャ',
      assignedTo: '田中 太郎',
      reportedBy: '佐藤 花子',
      relatedIncidents: ['INC-001', 'INC-005', 'INC-012'],
      affectedServices: ['Exchange Server', 'Outlook Web App'],
      createdAt: '2024-01-10 09:30:00',
      updatedAt: '2024-01-15 14:20:00',
      rootCause: 'バックアップジョブとメール処理の競合による負荷増加',
      workaround: 'バックアップ処理を深夜時間帯にスケジュール変更'
    },
    {
      id: 'PRB-002',
      title: 'VPN接続の断続的な切断問題',
      description: 'リモートワーカーのVPN接続が30分ごとに切断される問題が複数のユーザーで発生。',
      priority: 'Medium',
      status: 'Known Error',
      category: 'ネットワーク',
      assignedTo: '山田 次郎',
      reportedBy: '鈴木 一郎',
      relatedIncidents: ['INC-002', 'INC-007'],
      affectedServices: ['FortiGate VPN', 'Remote Desktop'],
      createdAt: '2024-01-08 11:15:00',
      updatedAt: '2024-01-14 16:30:00',
      rootCause: 'VPNクライアントソフトウェアのキープアライブ設定の不具合',
      workaround: '手動での再接続またはVPNクライアント設定の調整',
      solution: 'VPNクライアントソフトウェアの最新版へのアップデート'
    },
    {
      id: 'PRB-003',
      title: 'データベースのメモリリークによる性能低下',
      description: 'CRMデータベースで長時間運用後にメモリ使用量が異常に増加し、応答が遅延する。',
      priority: 'Critical',
      status: 'Open',
      category: 'データベース',
      reportedBy: '高橋 美咲',
      relatedIncidents: ['INC-004', 'INC-008'],
      affectedServices: ['CRM Database', 'Sales Portal', 'Customer Service App'],
      createdAt: '2024-01-12 08:45:00',
      updatedAt: '2024-01-15 10:00:00'
    },
    {
      id: 'PRB-004',
      title: 'Webアプリケーションでのセッション管理の問題',
      description: 'ユーザーセッションが予期せず終了し、作業内容が失われる問題が頻発。',
      priority: 'High',
      status: 'Resolved',
      category: 'アプリケーション',
      assignedTo: '伊藤 健太',
      reportedBy: '松本 恵子',
      relatedIncidents: ['INC-010', 'INC-013'],
      affectedServices: ['Web Application', 'Session Store'],
      createdAt: '2024-01-05 14:20:00',
      updatedAt: '2024-01-13 11:45:00',
      resolvedAt: '2024-01-13 11:45:00',
      rootCause: 'セッションストレージの容量不足とガベージコレクションの不具合',
      solution: 'セッションストレージの容量拡張とガベージコレクション設定の最適化'
    }
  ];

  useEffect(() => {
    setProblems(sampleProblems);
    setFilteredProblems(sampleProblems);
  }, []);

  useEffect(() => {
    let filtered = problems.filter(problem => {
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          problem.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || problem.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || problem.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    setFilteredProblems(filtered);
  }, [problems, searchTerm, statusFilter, priorityFilter]);

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
      case 'Investigating': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Known Error': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertCircleIcon className="w-4 h-4" />;
      case 'Investigating': return <BrainIcon className="w-4 h-4" />;
      case 'Known Error': return <BugIcon className="w-4 h-4" />;
      case 'Resolved': return <CheckCircleIcon className="w-4 h-4" />;
      case 'Closed': return <XCircleIcon className="w-4 h-4" />;
      default: return <AlertCircleIcon className="w-4 h-4" />;
    }
  };

  const handleCreateProblem = () => {
    const problem: Problem = {
      id: `PRB-${String(problems.length + 1).padStart(3, '0')}`,
      ...newProblem,
      status: 'Open',
      reportedBy: 'Current User',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setProblems([...problems, problem]);
    setNewProblem({
      title: '',
      description: '',
      priority: 'Medium',
      category: '',
      relatedIncidents: [],
      affectedServices: []
    });
    setShowNewProblemForm(false);
  };

  const handleAddRootCause = () => {
    if (!selectedProblem) return;

    const updatedProblems = problems.map(problem => 
      problem.id === selectedProblem.id 
        ? {
            ...problem,
            rootCause: rootCauseAnalysis.rootCause,
            workaround: rootCauseAnalysis.workaround,
            status: 'Known Error' as const,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
          }
        : problem
    );

    setProblems(updatedProblems);
    setShowRootCauseForm(false);
    setSelectedProblem(null);
    setRootCauseAnalysis({ problemId: '', rootCause: '', workaround: '' });
  };

  const openRootCauseAnalysis = (problem: Problem) => {
    setSelectedProblem(problem);
    setRootCauseAnalysis({
      problemId: problem.id,
      rootCause: problem.rootCause || '',
      workaround: problem.workaround || ''
    });
    setShowRootCauseForm(true);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const renderProblemForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">新規問題登録</h3>
          <button
            onClick={() => setShowNewProblemForm(false)}
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
              value={newProblem.title}
              onChange={(e) => setNewProblem({...newProblem, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="問題のタイトルを入力してください"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">説明 *</label>
            <textarea
              value={newProblem.description}
              onChange={(e) => setNewProblem({...newProblem, description: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="問題の詳細な説明を入力してください"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">優先度</label>
              <select
                value={newProblem.priority}
                onChange={(e) => setNewProblem({...newProblem, priority: e.target.value as any})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリー</label>
              <select
                value={newProblem.category}
                onChange={(e) => setNewProblem({...newProblem, category: e.target.value})}
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
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={() => setShowNewProblemForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleCreateProblem}
              disabled={!newProblem.title || !newProblem.description}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              登録
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRootCauseForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">根本原因分析</h3>
          <button
            onClick={() => setShowRootCauseForm(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">問題: {selectedProblem?.title}</h4>
            <p className="text-sm text-blue-700">{selectedProblem?.description}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BrainIcon className="w-4 h-4 inline mr-1" />
              根本原因 *
            </label>
            <textarea
              value={rootCauseAnalysis.rootCause}
              onChange={(e) => setRootCauseAnalysis({...rootCauseAnalysis, rootCause: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="問題の根本原因を詳細に記述してください"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <WrenchIcon className="w-4 h-4 inline mr-1" />
              ワークアラウンド *
            </label>
            <textarea
              value={rootCauseAnalysis.workaround}
              onChange={(e) => setRootCauseAnalysis({...rootCauseAnalysis, workaround: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="一時的な対処方法や回避策を記述してください"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={() => setShowRootCauseForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleAddRootCause}
              disabled={!rootCauseAnalysis.rootCause || !rootCauseAnalysis.workaround}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              既知のエラーとして登録
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
              <BrainIcon className="w-8 h-8 mr-3 text-purple-600" />
              問題管理
            </h1>
            <p className="text-gray-600 mt-2">
              根本原因分析による再発防止とサービス品質向上
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
              onClick={() => setShowNewProblemForm(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              新規登録
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
              placeholder="問題を検索..."
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
              <option value="Investigating">Investigating</option>
              <option value="Known Error">Known Error</option>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {filteredProblems.filter(p => p.status === 'Open').length}
              </div>
              <div className="text-blue-100">新規</div>
            </div>
            <AlertCircleIcon className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {filteredProblems.filter(p => p.status === 'Investigating').length}
              </div>
              <div className="text-yellow-100">調査中</div>
            </div>
            <BrainIcon className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {filteredProblems.filter(p => p.status === 'Known Error').length}
              </div>
              <div className="text-orange-100">既知エラー</div>
            </div>
            <BugIcon className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {filteredProblems.filter(p => p.status === 'Resolved').length}
              </div>
              <div className="text-green-100">解決済み</div>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {filteredProblems.length}
              </div>
              <div className="text-purple-100">合計</div>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-gray-800">
            問題一覧 ({filteredProblems.length}件)
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
                  関連インシデント
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50">
              {filteredProblems.map((problem) => (
                <tr key={problem.id} className="hover:bg-white/10 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{problem.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{problem.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{problem.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(problem.priority)}`}>
                      {problem.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(problem.status)}`}>
                      {getStatusIcon(problem.status)}
                      <span className="ml-1">{problem.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{problem.assignedTo || '未割り当て'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <LinkIcon className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">
                        {problem.relatedIncidents.length}件
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {new Date(problem.createdAt).toLocaleDateString('ja-JP')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {(problem.status === 'Open' || problem.status === 'Investigating') && (
                        <button
                          onClick={() => openRootCauseAnalysis(problem)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded hover:bg-purple-200 transition-colors"
                        >
                          <BrainIcon className="w-3 h-3 mr-1" />
                          分析
                        </button>
                      )}
                      {problem.rootCause && (
                        <button className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded hover:bg-green-200 transition-colors">
                          <FileTextIcon className="w-3 h-3 mr-1" />
                          詳細
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProblems.length === 0 && (
          <div className="px-6 py-12 text-center">
            <BrainIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">問題が見つかりません</h3>
            <p className="text-gray-500">検索条件を変更するか、新しい問題を登録してください。</p>
          </div>
        )}
      </div>

      {/* New Problem Form Modal */}
      {showNewProblemForm && renderProblemForm()}

      {/* Root Cause Analysis Form Modal */}
      {showRootCauseForm && renderRootCauseForm()}
    </div>
  );
};

export default ProblemManagement;