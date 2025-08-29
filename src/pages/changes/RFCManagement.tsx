import React, { useState } from 'react';
import { FileText, Plus, Calendar, User, Clock, CheckCircle, AlertTriangle, Filter, Search } from 'lucide-react';

interface RFC {
  id: string;
  title: string;
  type: 'Standard' | 'Normal' | 'Emergency';
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Implemented' | 'Closed';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  requester: string;
  assignee: string;
  description: string;
  businessJustification: string;
  implementationDate: string;
  rollbackPlan: string;
  riskAssessment: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  createdAt: string;
  updatedAt: string;
  affectedServices: string[];
  approvers: { name: string; status: 'Pending' | 'Approved' | 'Rejected'; date?: string }[];
}

const RFCManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [selectedRFC, setSelectedRFC] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create'>('list');
  
  // RFC作成フォームのstate
  const [newRFC, setNewRFC] = useState({
    title: '',
    type: 'Normal' as 'Standard' | 'Normal' | 'Emergency',
    priority: 'Medium' as 'Critical' | 'High' | 'Medium' | 'Low',
    requester: '',
    assignee: '',
    description: '',
    businessJustification: '',
    implementationDate: '',
    rollbackPlan: '',
    riskAssessment: 'Medium' as 'Low' | 'Medium' | 'High',
    impact: 'Medium' as 'Low' | 'Medium' | 'High',
    affectedServices: [] as string[]
  });

  // ビューを切り替える関数
  const handleShowDetail = (rfcId: string) => {
    setSelectedRFC(rfcId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedRFC(null);
    setViewMode('list');
  };

  const handleCreateClick = () => {
    setViewMode('create');
  };

  const handleCancelCreate = () => {
    setViewMode('list');
    setNewRFC({
      title: '',
      type: 'Normal',
      priority: 'Medium',
      requester: '',
      assignee: '',
      description: '',
      businessJustification: '',
      implementationDate: '',
      rollbackPlan: '',
      riskAssessment: 'Medium',
      impact: 'Medium',
      affectedServices: []
    });
  };

  const handleSubmitRFC = () => {
    // RFC送信のロジック
    console.log('新しいRFC:', newRFC);
    alert('RFCが正常に作成されました！');
    handleCancelCreate();
  };

  const mockRFCs: RFC[] = [
    {
      id: 'RFC-2024-001',
      title: 'データベースサーバーのメモリ増設',
      type: 'Normal',
      status: 'Under Review',
      priority: 'High',
      requester: '田中 太郎',
      assignee: '山田 次郎',
      description: 'パフォーマンス改善のため、本番データベースサーバーのメモリを32GBから64GBに増設する',
      businessJustification: '現在の応答時間遅延により、顧客満足度が低下している。メモリ増設により20%の性能向上が期待される',
      implementationDate: '2024-09-01 02:00',
      rollbackPlan: 'メモリモジュール取り外し、設定を元に戻す（約30分）',
      riskAssessment: 'Medium',
      impact: 'High',
      createdAt: '2024-08-25 09:30',
      updatedAt: '2024-08-27 14:20',
      affectedServices: ['Database Service', 'Web Application', 'API Service'],
      approvers: [
        { name: 'CTO 佐藤', status: 'Pending' },
        { name: 'インフラ責任者 鈴木', status: 'Approved', date: '2024-08-26' },
        { name: 'セキュリティ責任者 高橋', status: 'Pending' }
      ]
    },
    {
      id: 'RFC-2024-002',
      title: 'メールサーバーセキュリティパッチ適用',
      type: 'Emergency',
      status: 'Approved',
      priority: 'Critical',
      requester: '高橋 美咲',
      assignee: '高橋 美咲',
      description: '重要なセキュリティ脆弱性に対するパッチを緊急適用',
      businessJustification: 'CVE-2024-XXXX脆弱性により、メールサーバーが攻撃を受ける可能性がある',
      implementationDate: '2024-08-28 20:00',
      rollbackPlan: '前バージョンへのロールバック（約15分）',
      riskAssessment: 'Low',
      impact: 'Low',
      createdAt: '2024-08-27 16:45',
      updatedAt: '2024-08-28 08:30',
      affectedServices: ['Email Service'],
      approvers: [
        { name: 'CTO 佐藤', status: 'Approved', date: '2024-08-27' },
        { name: 'セキュリティ責任者 高橋', status: 'Approved', date: '2024-08-27' }
      ]
    },
    {
      id: 'RFC-2024-003',
      title: 'バックアップシステム更新',
      type: 'Standard',
      status: 'Draft',
      priority: 'Medium',
      requester: '中村 健太',
      assignee: '中村 健太',
      description: '既存のバックアップシステムを新しいソリューションに更新',
      businessJustification: '現行システムの保守終了により、新システムへの移行が必要',
      implementationDate: '2024-09-15 01:00',
      rollbackPlan: '既存システムの再有効化（約2時間）',
      riskAssessment: 'High',
      impact: 'Medium',
      createdAt: '2024-08-22 11:15',
      updatedAt: '2024-08-28 09:00',
      affectedServices: ['Backup Service', 'File Server'],
      approvers: [
        { name: 'CTO 佐藤', status: 'Pending' },
        { name: 'インフラ責任者 鈴木', status: 'Pending' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'text-gray-600 bg-gray-100';
      case 'Submitted': return 'text-blue-600 bg-blue-100';
      case 'Under Review': return 'text-yellow-600 bg-yellow-100';
      case 'Approved': return 'text-green-600 bg-green-100';
      case 'Rejected': return 'text-red-600 bg-red-100';
      case 'Implemented': return 'text-purple-600 bg-purple-100';
      case 'Closed': return 'text-gray-600 bg-gray-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency': return 'text-red-600 bg-red-100';
      case 'Normal': return 'text-blue-600 bg-blue-100';
      case 'Standard': return 'text-green-600 bg-green-100';
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-green-600 bg-green-100';
      case 'Rejected': return 'text-red-600 bg-red-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const selectedRFCData = mockRFCs.find(rfc => rfc.id === selectedRFC);

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">RFC管理</h1>
        </div>
        <button 
          onClick={handleCreateClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          新しいRFCを作成
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">承認待ち</p>
              <p className="text-2xl font-bold text-yellow-600">8</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">承認済み</p>
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
              <p className="text-sm text-gray-600">緊急変更</p>
              <p className="text-2xl font-bold text-red-600">2</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今月実装</p>
              <p className="text-2xl font-bold text-blue-600">23</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* フィルターとサーチ */}
      <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="RFCを検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">すべてのステータス</option>
              <option value="Draft">ドラフト</option>
              <option value="Submitted">提出済み</option>
              <option value="Under Review">レビュー中</option>
              <option value="Approved">承認済み</option>
              <option value="Implemented">実装済み</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">すべてのタイプ</option>
              <option value="Emergency">緊急</option>
              <option value="Normal">通常</option>
              <option value="Standard">標準</option>
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        /* RFC一覧 */
        <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RFC
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タイプ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    優先度
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    要求者
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    実装予定日
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    リスク
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockRFCs.map((rfc) => (
                  <tr 
                    key={rfc.id} 
                    className="hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => handleShowDetail(rfc.id)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {rfc.id}
                        </div>
                        <div className="text-sm text-gray-600">
                          {rfc.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(rfc.type)}`}>
                        {rfc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rfc.status)}`}>
                        {rfc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(rfc.priority)}`}>
                        {rfc.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{rfc.requester}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {rfc.implementationDate}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${getRiskColor(rfc.riskAssessment)}`}>
                        {rfc.riskAssessment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'detail' && selectedRFCData ? (
        /* RFC詳細 */
        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedRFCData.id}: {selectedRFCData.title}
            </h2>
            <button 
              onClick={handleBackToList}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← 一覧に戻る
            </button>
          </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 基本情報 */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">タイプ:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedRFCData.type)}`}>
                        {selectedRFCData.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ステータス:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRFCData.status)}`}>
                        {selectedRFCData.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">優先度:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedRFCData.priority)}`}>
                        {selectedRFCData.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">要求者:</span>
                      <span>{selectedRFCData.requester}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">担当者:</span>
                      <span>{selectedRFCData.assignee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">実装予定日:</span>
                      <span>{selectedRFCData.implementationDate}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">説明</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedRFCData.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ビジネス正当性</h3>
                  <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">
                    {selectedRFCData.businessJustification}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ロールバック計画</h3>
                  <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg">
                    {selectedRFCData.rollbackPlan}
                  </p>
                </div>
              </div>

              {/* サイドバー情報 */}
              <div className="space-y-6">
                {/* 承認者 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">承認状況</h3>
                  <div className="space-y-3">
                    {selectedRFCData.approvers.map((approver, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{approver.name}</div>
                          {approver.date && (
                            <div className="text-xs text-gray-500">{approver.date}</div>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getApprovalStatusColor(approver.status)}`}>
                          {approver.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* リスク評価 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">リスク評価</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">リスクレベル:</span>
                      <span className={`font-medium ${getRiskColor(selectedRFCData.riskAssessment)}`}>
                        {selectedRFCData.riskAssessment}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">影響度:</span>
                      <span className={`font-medium ${getRiskColor(selectedRFCData.impact)}`}>
                        {selectedRFCData.impact}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 影響サービス */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">影響サービス</h3>
                  <div className="space-y-2">
                    {selectedRFCData.affectedServices.map((service) => (
                      <div key={service} className="px-3 py-2 bg-blue-50 text-blue-800 rounded text-sm">
                        {service}
                      </div>
                    ))}
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    編集
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    複製
                  </button>
                  <button className="w-full px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50">
                    承認
                  </button>
                </div>
              </div>
            </div>
          </div>
      ) : viewMode === 'create' ? (
        /* RFC作成フォーム */
        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">新しいRFCを作成</h2>
            <button 
              onClick={handleCancelCreate}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左側のフォーム */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRFC.title}
                  onChange={(e) => setNewRFC({...newRFC, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="変更のタイトルを入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイプ <span className="text-red-500">*</span>
                </label>
                <select
                  value={newRFC.type}
                  onChange={(e) => setNewRFC({...newRFC, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Standard">標準</option>
                  <option value="Normal">通常</option>
                  <option value="Emergency">緊急</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  優先度 <span className="text-red-500">*</span>
                </label>
                <select
                  value={newRFC.priority}
                  onChange={(e) => setNewRFC({...newRFC, priority: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Low">低</option>
                  <option value="Medium">中</option>
                  <option value="High">高</option>
                  <option value="Critical">緊急</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  要求者 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRFC.requester}
                  onChange={(e) => setNewRFC({...newRFC, requester: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="要求者名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  担当者 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRFC.assignee}
                  onChange={(e) => setNewRFC({...newRFC, assignee: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="実装担当者"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  実装予定日時 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={newRFC.implementationDate}
                  onChange={(e) => setNewRFC({...newRFC, implementationDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 右側のフォーム */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newRFC.description}
                  onChange={(e) => setNewRFC({...newRFC, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="変更内容の詳細説明"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ビジネス正当性 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newRFC.businessJustification}
                  onChange={(e) => setNewRFC({...newRFC, businessJustification: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="なぜこの変更が必要か"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ロールバック計画 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newRFC.rollbackPlan}
                  onChange={(e) => setNewRFC({...newRFC, rollbackPlan: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="問題発生時の復旧手順"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    リスク評価
                  </label>
                  <select
                    value={newRFC.riskAssessment}
                    onChange={(e) => setNewRFC({...newRFC, riskAssessment: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Low">低</option>
                    <option value="Medium">中</option>
                    <option value="High">高</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    影響度
                  </label>
                  <select
                    value={newRFC.impact}
                    onChange={(e) => setNewRFC({...newRFC, impact: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Low">低</option>
                    <option value="Medium">中</option>
                    <option value="High">高</option>
                  </select>
                </div>
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
              onClick={handleSubmitRFC}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              RFCを作成
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RFCManagement;