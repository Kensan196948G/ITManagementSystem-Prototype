import React, { useState } from 'react';
import { Search, GitBranch, AlertCircle, CheckCircle, Clock, User, FileText } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  status: 'Open' | 'Under Investigation' | 'Known Error' | 'Resolved';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  createdAt: string;
  assignee: string;
  relatedIncidents: string[];
  rootCause: string;
  workaround: string;
  knownError: boolean;
}

interface RCAStep {
  id: string;
  step: string;
  description: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  assignee: string;
  dueDate: string;
  findings: string;
}

const RootCauseAnalysis: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<string>('PRB-2024-001');
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'timeline'>('overview');

  const mockProblems: Problem[] = [
    {
      id: 'PRB-2024-001',
      title: 'データベース接続の断続的な失敗',
      status: 'Under Investigation',
      priority: 'Critical',
      createdAt: '2024-08-25 09:30',
      assignee: '田中 太郎',
      relatedIncidents: ['INC-2024-010', 'INC-2024-015', 'INC-2024-018'],
      rootCause: '調査中',
      workaround: 'データベース接続プールのサイズを一時的に増加',
      knownError: false
    },
    {
      id: 'PRB-2024-002',
      title: 'メール配信システムの遅延',
      status: 'Known Error',
      priority: 'High',
      createdAt: '2024-08-20 14:15',
      assignee: '山田 次郎',
      relatedIncidents: ['INC-2024-008', 'INC-2024-012'],
      rootCause: 'メールキューの処理能力不足によるボトルネック',
      workaround: '優先度の高いメールを別キューで処理',
      knownError: true
    }
  ];

  const rcaSteps: RCAStep[] = [
    {
      id: '1',
      step: '問題の定義',
      description: '問題の症状と影響範囲の明確化',
      status: 'Completed',
      assignee: '田中 太郎',
      dueDate: '2024-08-25',
      findings: 'データベース接続が1日に3-5回、5-10分間失敗する。影響ユーザー数約500名。'
    },
    {
      id: '2',
      step: '情報収集',
      description: 'ログ、メトリクス、関連インシデントの収集',
      status: 'Completed',
      assignee: '田中 太郎',
      dueDate: '2024-08-26',
      findings: 'データベースログに接続プールの枯渇エラーを確認。CPU使用率のスパイクと相関。'
    },
    {
      id: '3',
      step: '仮説の立案',
      description: '可能性のある原因の特定と優先順位付け',
      status: 'In Progress',
      assignee: '田中 太郎',
      dueDate: '2024-08-27',
      findings: '仮説1: アプリケーションのコネクションリーク 仮説2: データベースサーバーのリソース不足'
    },
    {
      id: '4',
      step: '仮説の検証',
      description: '各仮説の検証テストの実施',
      status: 'Pending',
      assignee: '田中 太郎',
      dueDate: '2024-08-28',
      findings: ''
    },
    {
      id: '5',
      step: '根本原因の特定',
      description: '検証結果に基づく根本原因の確定',
      status: 'Pending',
      assignee: '田中 太郎',
      dueDate: '2024-08-29',
      findings: ''
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-blue-600 bg-blue-100';
      case 'Under Investigation': return 'text-yellow-600 bg-yellow-100';
      case 'Known Error': return 'text-orange-600 bg-orange-100';
      case 'Resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'Pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const selectedProblemData = mockProblems.find(p => p.id === selectedProblem);

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Search className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">根本原因分析</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 問題一覧 */}
        <div className="xl:col-span-1">
          <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">分析対象の問題</h2>
            <div className="space-y-3">
              {mockProblems.map((problem) => (
                <div
                  key={problem.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all border ${
                    selectedProblem === problem.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white/30 border-gray-200 hover:bg-white/40'
                  }`}
                  onClick={() => setSelectedProblem(problem.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-sm text-gray-900">{problem.id}</div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(problem.priority)}`}>
                      {problem.priority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">{problem.title}</div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(problem.status)}`}>
                      {problem.status}
                    </span>
                    <div className="text-xs text-gray-500">
                      {problem.relatedIncidents.length}件の関連インシデント
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 詳細パネル */}
        <div className="xl:col-span-2">
          {selectedProblemData && (
            <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30">
              {/* タブヘッダー */}
              <div className="border-b border-gray-200 px-6 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedProblemData.id}: {selectedProblemData.title}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProblemData.status)}`}>
                      {selectedProblemData.status}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedProblemData.priority)}`}>
                      {selectedProblemData.priority}
                    </span>
                  </div>
                </div>

                <nav className="flex space-x-8">
                  {[
                    { key: 'overview', label: '概要', icon: AlertCircle },
                    { key: 'analysis', label: '分析', icon: Search },
                    { key: 'timeline', label: 'タイムライン', icon: Clock }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as any)}
                      className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                        activeTab === key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* タブコンテンツ */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">基本情報</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">作成日:</span>
                            <span className="text-sm text-gray-900">{selectedProblemData.createdAt}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">担当者:</span>
                            <span className="text-sm text-gray-900">{selectedProblemData.assignee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">既知のエラー:</span>
                            <span className={`text-sm ${selectedProblemData.knownError ? 'text-orange-600' : 'text-gray-600'}`}>
                              {selectedProblemData.knownError ? 'はい' : 'いいえ'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">関連インシデント</h3>
                        <div className="space-y-2">
                          {selectedProblemData.relatedIncidents.map((incident) => (
                            <div key={incident} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm text-gray-900">{incident}</span>
                              <button className="text-xs text-blue-600 hover:text-blue-800">詳細</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">現在の根本原因</h3>
                      <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded">
                        {selectedProblemData.rootCause}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">回避策</h3>
                      <p className="text-sm text-gray-700 p-3 bg-blue-50 rounded">
                        {selectedProblemData.workaround}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'analysis' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">根本原因分析プロセス</h3>
                    <div className="space-y-4">
                      {rcaSteps.map((step, index) => (
                        <div key={step.id} className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              step.status === 'Completed' ? 'bg-green-100 text-green-600' :
                              step.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {step.status === 'Completed' ? <CheckCircle className="h-4 w-4" /> : index + 1}
                            </div>
                            {index < rcaSteps.length - 1 && (
                              <div className="w-px h-16 bg-gray-300 mt-2"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-900">{step.step}</h4>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStepStatusColor(step.status)}`}>
                                {step.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <User className="h-3 w-3 mr-1" />
                              <span>{step.assignee}</span>
                              <span className="mx-2">•</span>
                              <Clock className="h-3 w-3 mr-1" />
                              <span>期限: {step.dueDate}</span>
                            </div>
                            {step.findings && (
                              <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                                <strong>調査結果:</strong> {step.findings}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">活動履歴</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <strong>田中 太郎</strong> が情報収集を完了しました
                          </p>
                          <p className="text-xs text-gray-500">2024-08-26 16:30</p>
                          <p className="text-sm text-gray-600 mt-1">
                            データベースログとアプリケーションメトリクスを分析。接続プールの枯渇が原因の可能性を特定。
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <strong>田中 太郎</strong> が仮説立案を開始しました
                          </p>
                          <p className="text-xs text-gray-500">2024-08-26 09:00</p>
                          <p className="text-sm text-gray-600 mt-1">
                            2つの主要仮説を立案。アプリケーションリークとサーバーリソース不足を検証予定。
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <strong>システム</strong> が問題レコードを作成しました
                          </p>
                          <p className="text-xs text-gray-500">2024-08-25 09:30</p>
                          <p className="text-sm text-gray-600 mt-1">
                            関連する3つのインシデントから問題パターンを検出し、自動的に問題レコードを作成。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RootCauseAnalysis;