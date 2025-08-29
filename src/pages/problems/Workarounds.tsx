import React, { useState } from 'react';
import { Shield, AlertCircle, CheckCircle, Clock, User, Search, Filter, Plus } from 'lucide-react';

interface Workaround {
  id: string;
  problemId: string;
  title: string;
  description: string;
  status: 'Active' | 'Testing' | 'Retired' | 'Failed';
  effectiveness: 'High' | 'Medium' | 'Low';
  implementationTime: string;
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  usageCount: number;
  successRate: number;
  steps: string[];
  prerequisites: string[];
  risks: string[];
  affectedServices: string[];
}

const Workarounds: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterEffectiveness, setFilterEffectiveness] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const mockWorkarounds: Workaround[] = [
    {
      id: 'WA-2024-001',
      problemId: 'PRB-2024-001',
      title: 'データベース接続プール拡張',
      description: 'データベース接続問題に対する一時的な回避策として、接続プールサイズを増加させる',
      status: 'Active',
      effectiveness: 'High',
      implementationTime: '15分',
      createdBy: '田中 太郎',
      createdAt: '2024-08-25 10:30',
      lastUpdated: '2024-08-26 14:20',
      usageCount: 23,
      successRate: 95.7,
      steps: [
        'データベース管理ツールにアクセス',
        '接続プール設定ページを開く',
        '最大接続数を50から100に変更',
        '設定を保存してサーバーを再起動',
        'アプリケーションの動作確認'
      ],
      prerequisites: [
        'データベース管理者権限',
        'サーバー再起動の許可',
        '業務時間外での実行推奨'
      ],
      risks: [
        'データベースサーバーのメモリ使用量増加',
        '一時的なサービス停止（2-3分）',
        '設定変更による予期しない副作用の可能性'
      ],
      affectedServices: ['Web Application', 'API Service', 'Reporting System']
    },
    {
      id: 'WA-2024-002',
      problemId: 'PRB-2024-002',
      title: 'メール配信優先キュー設定',
      description: '重要メールを別キューで処理することで配信遅延を回避',
      status: 'Active',
      effectiveness: 'Medium',
      implementationTime: '30分',
      createdBy: '山田 次郎',
      createdAt: '2024-08-20 16:45',
      lastUpdated: '2024-08-22 09:15',
      usageCount: 12,
      successRate: 83.3,
      steps: [
        'メールサーバー管理画面にログイン',
        '新しいキュー「priority_mail」を作成',
        '優先度ルールを設定',
        'アプリケーション設定で優先メールの分類条件を追加',
        '動作テストを実行'
      ],
      prerequisites: [
        'メールサーバー管理者権限',
        'アプリケーション設定変更権限'
      ],
      risks: [
        'メール処理ロジックの複雑化',
        '設定ミスによる全メール配信停止リスク'
      ],
      affectedServices: ['Email Service', 'Notification System']
    },
    {
      id: 'WA-2024-003',
      problemId: 'PRB-2024-003',
      title: 'キャッシュクリア手順',
      description: 'Webページ表示問題の緊急回避策としてアプリケーションキャッシュをクリア',
      status: 'Testing',
      effectiveness: 'Low',
      implementationTime: '5分',
      createdBy: '高橋 美咲',
      createdAt: '2024-08-22 11:20',
      lastUpdated: '2024-08-28 10:00',
      usageCount: 3,
      successRate: 66.7,
      steps: [
        'アプリケーションサーバーにSSHアクセス',
        'キャッシュディレクトリに移動',
        'キャッシュファイルを削除',
        'アプリケーションサーバーを再起動'
      ],
      prerequisites: [
        'サーバーアクセス権限',
        'メンテナンス作業の承認'
      ],
      risks: [
        '一時的なパフォーマンス低下',
        'キャッシュ再構築時間の必要性'
      ],
      affectedServices: ['Web Application']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Testing': return 'text-blue-600 bg-blue-100';
      case 'Retired': return 'text-gray-600 bg-gray-100';
      case 'Failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">回避策管理</h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          新しい回避策を追加
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">アクティブな回避策</p>
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
              <p className="text-sm text-gray-600">テスト中</p>
              <p className="text-2xl font-bold text-blue-600">3</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均成功率</p>
              <p className="text-2xl font-bold text-purple-600">88.4%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今月の利用回数</p>
              <p className="text-2xl font-bold text-orange-600">47</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <User className="h-6 w-6 text-orange-600" />
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
              placeholder="回避策を検索..."
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
              <option value="Active">アクティブ</option>
              <option value="Testing">テスト中</option>
              <option value="Retired">退役済み</option>
              <option value="Failed">失敗</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              value={filterEffectiveness}
              onChange={(e) => setFilterEffectiveness(e.target.value)}
            >
              <option value="All">すべての効果度</option>
              <option value="High">高</option>
              <option value="Medium">中</option>
              <option value="Low">低</option>
            </select>
          </div>
        </div>
      </div>

      {/* 回避策一覧 */}
      <div className="space-y-4">
        {mockWorkarounds.map((workaround) => (
          <div key={workaround.id} className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{workaround.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workaround.status)}`}>
                    {workaround.status}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEffectivenessColor(workaround.effectiveness)}`}>
                    効果度: {workaround.effectiveness}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{workaround.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>作成者: {workaround.createdBy}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>実装時間: {workaround.implementationTime}</span>
                  </div>
                  <div>
                    <span>利用回数: {workaround.usageCount}回</span>
                  </div>
                  <div>
                    <span className={`font-medium ${getSuccessRateColor(workaround.successRate)}`}>
                      成功率: {workaround.successRate}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">問題ID</div>
                <div className="text-sm font-medium text-blue-600">{workaround.problemId}</div>
              </div>
            </div>

            {/* 詳細情報 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                  実装手順
                </h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  {workaround.steps.map((step, index) => (
                    <li key={index} className="flex">
                      <span className="text-blue-600 mr-2 font-medium">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 text-yellow-600" />
                  前提条件
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {workaround.prerequisites.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 text-red-600" />
                  リスク
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {workaround.risks.map((risk, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-600 mr-2">⚠</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 影響サービス */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">影響サービス</h4>
              <div className="flex flex-wrap gap-2">
                {workaround.affectedServices.map((service) => (
                  <span key={service} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                編集
              </button>
              <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded">
                実行履歴
              </button>
              <button className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded">
                詳細表示
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 新規作成フォーム（モーダル風） */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold mb-4">新しい回避策を追加</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">問題ID</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">効果度</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="High">高</option>
                    <option value="Medium">中</option>
                    <option value="Low">低</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workarounds;