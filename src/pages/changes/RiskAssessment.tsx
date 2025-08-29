import React, { useState } from 'react';
import { AlertTriangle, Shield, BarChart3, CheckCircle, Clock, User, Plus, ArrowLeft } from 'lucide-react';

interface RiskAssessment {
  id: string;
  rfcId: string;
  title: string;
  assessor: string;
  assessmentDate: string;
  overallRisk: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  businessImpact: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  technicalRisk: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  securityRisk: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  rollbackPlan: string;
  testingRequired: boolean;
  approvalRequired: string[];
  recommendation: 'Approve' | 'Conditional Approval' | 'Reject' | 'More Information Needed';
}

interface RiskFactor {
  category: 'Technical' | 'Business' | 'Security' | 'Operational';
  description: string;
  impact: 'Low' | 'Medium' | 'High';
  probability: 'Low' | 'Medium' | 'High';
  riskScore: number;
}

interface MitigationStrategy {
  risk: string;
  strategy: string;
  responsible: string;
  timeline: string;
  status: 'Planned' | 'In Progress' | 'Completed';
}

const RiskAssessment: React.FC = () => {
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create'>('list');
  const [activeTab, setActiveTab] = useState<'overview' | 'factors' | 'mitigation' | 'history'>('overview');
  const [newAssessment, setNewAssessment] = useState({
    rfcId: '',
    title: '',
    assessor: '',
    businessImpact: 'Low' as 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High',
    technicalRisk: 'Low' as 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High',
    securityRisk: 'Low' as 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High',
    rollbackPlan: '',
    testingRequired: false,
    approvalRequired: [] as string[],
    recommendation: 'More Information Needed' as 'Approve' | 'Conditional Approval' | 'Reject' | 'More Information Needed',
    riskFactors: [] as any[],
    mitigationStrategies: [] as any[]
  });

  const mockAssessments: RiskAssessment[] = [
    {
      id: 'RA-2024-001',
      rfcId: 'RFC-2024-001',
      title: 'データベースサーバーメモリ増設',
      assessor: 'セキュリティ責任者 高橋',
      assessmentDate: '2024-08-26',
      overallRisk: 'Medium',
      businessImpact: 'High',
      technicalRisk: 'Medium',
      securityRisk: 'Low',
      riskFactors: [
        {
          category: 'Technical',
          description: 'ハードウェア追加時の互換性問題',
          impact: 'Medium',
          probability: 'Low',
          riskScore: 4
        },
        {
          category: 'Business',
          description: 'メンテナンス中のサービス停止',
          impact: 'High',
          probability: 'High',
          riskScore: 9
        },
        {
          category: 'Operational',
          description: 'メモリ設定の誤構成',
          impact: 'Medium',
          probability: 'Medium',
          riskScore: 6
        }
      ],
      mitigationStrategies: [
        {
          risk: 'ハードウェア互換性問題',
          strategy: '事前に互換性テストを実施',
          responsible: '田中 太郎',
          timeline: '実装1週間前',
          status: 'Planned'
        },
        {
          risk: 'サービス停止による影響',
          strategy: 'メンテナンス時間を最小化（深夜2-4時に実施）',
          responsible: '山田 次郎',
          timeline: '実装時',
          status: 'Planned'
        },
        {
          risk: 'メモリ設定誤構成',
          strategy: '設定チェックリストの作成と二重確認',
          responsible: '田中 太郎',
          timeline: '実装時',
          status: 'In Progress'
        }
      ],
      rollbackPlan: 'メモリモジュールを取り外し、以前の設定に戻す（約30分）',
      testingRequired: true,
      approvalRequired: ['CTO', 'インフラ責任者'],
      recommendation: 'Conditional Approval'
    },
    {
      id: 'RA-2024-002',
      rfcId: 'RFC-2024-002',
      title: 'メールサーバーセキュリティパッチ適用',
      assessor: 'セキュリティ責任者 高橋',
      assessmentDate: '2024-08-27',
      overallRisk: 'Low',
      businessImpact: 'Low',
      technicalRisk: 'Low',
      securityRisk: 'Very Low',
      riskFactors: [
        {
          category: 'Security',
          description: 'パッチ適用による新しい脆弱性の導入',
          impact: 'Low',
          probability: 'Low',
          riskScore: 2
        },
        {
          category: 'Technical',
          description: 'メールサービスの一時的な不安定性',
          impact: 'Low',
          probability: 'Medium',
          riskScore: 3
        }
      ],
      mitigationStrategies: [
        {
          risk: 'パッチ適用リスク',
          strategy: 'テスト環境での事前検証',
          responsible: '高橋 美咲',
          timeline: '適用前',
          status: 'Completed'
        }
      ],
      rollbackPlan: '前バージョンへのロールバック（約15分）',
      testingRequired: false,
      approvalRequired: ['CTO', 'セキュリティ責任者'],
      recommendation: 'Approve'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Very High': return 'text-red-800 bg-red-200';
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-blue-600 bg-blue-100';
      case 'Very Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Approve': return 'text-green-600 bg-green-100';
      case 'Conditional Approval': return 'text-yellow-600 bg-yellow-100';
      case 'Reject': return 'text-red-600 bg-red-100';
      case 'More Information Needed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'Planned': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };


  const selectedAssessmentData = selectedAssessment ? mockAssessments.find(a => a.id === selectedAssessment) : null;

  const handleAssessmentClick = (assessmentId: string) => {
    setSelectedAssessment(assessmentId);
    setViewMode('detail');
    setActiveTab('overview');
  };

  const handleBackToList = () => {
    setSelectedAssessment(null);
    setViewMode('list');
  };

  const handleCreateNew = () => {
    setViewMode('create');
  };

  const handleCancelCreate = () => {
    setViewMode('list');
    setNewAssessment({
      rfcId: '',
      title: '',
      assessor: '',
      businessImpact: 'Low',
      technicalRisk: 'Low',
      securityRisk: 'Low',
      rollbackPlan: '',
      testingRequired: false,
      approvalRequired: [],
      recommendation: 'More Information Needed',
      riskFactors: [],
      mitigationStrategies: []
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {viewMode === 'detail' && (
            <button 
              onClick={handleBackToList}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          )}
          <Shield className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            {viewMode === 'detail' && selectedAssessmentData ? selectedAssessmentData.title : 
             viewMode === 'create' ? '新しいリスク評価を作成' : 'リスクアセスメント'}
          </h1>
        </div>
        {viewMode === 'list' && (
          <button 
            onClick={handleCreateNew}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            新しいリスク評価を作成
          </button>
        )}
      </div>

      {/* 統計カード - 一覧表示時のみ */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">高リスク変更</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">中リスク変更</p>
                <p className="text-2xl font-bold text-yellow-600">8</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">低リスク変更</p>
                <p className="text-2xl font-bold text-green-600">15</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均リスクスコア</p>
                <p className="text-2xl font-bold text-blue-600">5.2</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      {viewMode === 'create' ? (
        /* 新規作成フォーム */
        <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30">
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 左側の基本情報 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RFC ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAssessment.rfcId}
                      onChange={(e) => setNewAssessment({...newAssessment, rfcId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="例: RFC-2024-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      変更タイトル <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAssessment.title}
                      onChange={(e) => setNewAssessment({...newAssessment, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="例: データベースサーバーメモリ増設"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      評価者 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAssessment.assessor}
                      onChange={(e) => setNewAssessment({...newAssessment, assessor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="例: セキュリティ責任者 高橋"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ビジネス影響度
                    </label>
                    <select
                      value={newAssessment.businessImpact}
                      onChange={(e) => setNewAssessment({...newAssessment, businessImpact: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="Very Low">Very Low</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Very High">Very High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      技術リスク
                    </label>
                    <select
                      value={newAssessment.technicalRisk}
                      onChange={(e) => setNewAssessment({...newAssessment, technicalRisk: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="Very Low">Very Low</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Very High">Very High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      セキュリティリスク
                    </label>
                    <select
                      value={newAssessment.securityRisk}
                      onChange={(e) => setNewAssessment({...newAssessment, securityRisk: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="Very Low">Very Low</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Very High">Very High</option>
                    </select>
                  </div>
                </div>

                {/* 右側の詳細情報 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      推奨事項
                    </label>
                    <select
                      value={newAssessment.recommendation}
                      onChange={(e) => setNewAssessment({...newAssessment, recommendation: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="Approve">承認</option>
                      <option value="Conditional Approval">条件付き承認</option>
                      <option value="Reject">拒否</option>
                      <option value="More Information Needed">詳細情報必要</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      テスト必要性
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newAssessment.testingRequired}
                        onChange={(e) => setNewAssessment({...newAssessment, testingRequired: e.target.checked})}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">テストが必要です</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      承認必要者
                    </label>
                    <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
                      {['CTO', 'セキュリティ責任者', 'インフラ責任者', '運用責任者', '品質保証責任者'].map((approver) => (
                        <div key={approver} className="flex items-center p-1">
                          <input
                            type="checkbox"
                            checked={newAssessment.approvalRequired.includes(approver)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewAssessment({
                                  ...newAssessment,
                                  approvalRequired: [...newAssessment.approvalRequired, approver]
                                });
                              } else {
                                setNewAssessment({
                                  ...newAssessment,
                                  approvalRequired: newAssessment.approvalRequired.filter(a => a !== approver)
                                });
                              }
                            }}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">{approver}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ロールバック計画 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newAssessment.rollbackPlan}
                      onChange={(e) => setNewAssessment({...newAssessment, rollbackPlan: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={4}
                      placeholder="変更が失敗した場合の具体的なロールバック手順を記載してください"
                    />
                  </div>
                </div>
              </div>

              {/* 送信ボタン */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={handleCancelCreate}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    alert('リスクアセスメントが正常に作成されました！');
                    handleCancelCreate();
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  評価を作成
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* 一覧表示 */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* アセスメント一覧 */}
          <div className="xl:col-span-1">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">リスクアセスメント</h2>
              <div className="space-y-3">
                {mockAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="p-4 rounded-lg cursor-pointer transition-all border bg-white/30 border-gray-200 hover:bg-white/40"
                    onClick={() => handleAssessmentClick(assessment.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-sm text-gray-900">{assessment.id}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(assessment.overallRisk)}`}>
                        {assessment.overallRisk}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">{assessment.title}</div>
                    <div className="text-xs text-blue-600">{assessment.rfcId}</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-gray-500">
                        {assessment.assessmentDate}
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRecommendationColor(assessment.recommendation)}`}>
                        {assessment.recommendation}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* プレースホルダー */}
          <div className="xl:col-span-2">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 p-6">
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">リスクアセスメントを選択して詳細を表示</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 詳細表示 */
        selectedAssessmentData && (
          <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30">
            {/* タブヘッダー */}
            <div className="border-b border-gray-200 px-6 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedAssessmentData.title}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(selectedAssessmentData.overallRisk)}`}>
                    総合リスク: {selectedAssessmentData.overallRisk}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(selectedAssessmentData.recommendation)}`}>
                    {selectedAssessmentData.recommendation}
                  </span>
                </div>
              </div>

              <nav className="flex space-x-8">
                {[
                  { key: 'overview', label: '概要', icon: Shield },
                  { key: 'factors', label: 'リスク要因', icon: AlertTriangle },
                  { key: 'mitigation', label: '軽減策', icon: CheckCircle },
                  { key: 'history', label: '履歴', icon: Clock }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                      activeTab === key
                        ? 'border-red-500 text-red-600'
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
                      <h3 className="text-sm font-medium text-gray-500 mb-4">基本情報</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">RFC ID:</span>
                          <span className="text-sm text-blue-600">{selectedAssessmentData.rfcId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">評価者:</span>
                          <span className="text-sm text-gray-900">{selectedAssessmentData.assessor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">評価日:</span>
                          <span className="text-sm text-gray-900">{selectedAssessmentData.assessmentDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">テスト必要:</span>
                          <span className={`text-sm ${selectedAssessmentData.testingRequired ? 'text-red-600' : 'text-green-600'}`}>
                            {selectedAssessmentData.testingRequired ? '必要' : '不要'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-4">リスクレベル</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">ビジネス影響:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(selectedAssessmentData.businessImpact)}`}>
                            {selectedAssessmentData.businessImpact}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">技術リスク:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(selectedAssessmentData.technicalRisk)}`}>
                            {selectedAssessmentData.technicalRisk}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">セキュリティリスク:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(selectedAssessmentData.securityRisk)}`}>
                            {selectedAssessmentData.securityRisk}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">ロールバック計画</h3>
                    <p className="text-sm text-gray-700 p-3 bg-yellow-50 rounded-lg">
                      {selectedAssessmentData.rollbackPlan}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">承認必要者</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAssessmentData.approvalRequired.map((approver) => (
                        <span key={approver} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {approver}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'factors' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">識別されたリスク要因</h3>
                  {selectedAssessmentData.riskFactors.map((factor, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              factor.category === 'Technical' ? 'bg-blue-100 text-blue-800' :
                              factor.category === 'Business' ? 'bg-green-100 text-green-800' :
                              factor.category === 'Security' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {factor.category}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              リスクスコア: {factor.riskScore}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{factor.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">影響度:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(factor.impact)}`}>
                            {factor.impact}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">発生確率:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(factor.probability)}`}>
                            {factor.probability}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'mitigation' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">リスク軽減策</h3>
                  {selectedAssessmentData.mitigationStrategies.map((strategy, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{strategy.risk}</h4>
                          <p className="text-sm text-gray-700">{strategy.strategy}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(strategy.status)}`}>
                          {strategy.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>担当: {strategy.responsible}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>期限: {strategy.timeline}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">評価履歴</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <strong>{selectedAssessmentData.assessor}</strong> がリスクアセスメントを完了
                        </p>
                        <p className="text-xs text-gray-500">{selectedAssessmentData.assessmentDate}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          総合リスク: {selectedAssessmentData.overallRisk}、推奨: {selectedAssessmentData.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default RiskAssessment;