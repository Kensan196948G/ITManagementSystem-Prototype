import React, { useState } from 'react';
import { 
  ShieldCheckIcon, 
  ShieldExclamationIcon,
  ArrowPathIcon,
  FunnelIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// セキュリティイベント深刻度バッジ
const SeverityBadge = ({ severity }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case '重大':
        return 'bg-danger-100 text-danger-800';
      case '高':
        return 'bg-warning-100 text-warning-800';
      case '中':
        return 'bg-primary-100 text-primary-800';
      case '低':
        return 'bg-success-100 text-success-800';
      case '情報':
        return 'bg-secondary-100 text-secondary-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  return (
    <span className={`badge ${getSeverityColor(severity)}`}>{severity}</span>
  );
};

// セキュリティイベントカテゴリーバッジ
const CategoryBadge = ({ category }) => {
  const getCategoryColor = (category) => {
    switch (category) {
      case '不正アクセス':
        return 'bg-danger-50 text-danger-800 border border-danger-200';
      case 'マルウェア':
        return 'bg-warning-50 text-warning-800 border border-warning-200';
      case '認証エラー':
        return 'bg-primary-50 text-primary-800 border border-primary-200';
      case 'ポリシー違反':
        return 'bg-secondary-50 text-secondary-800 border border-secondary-200';
      case '監査':
        return 'bg-success-50 text-success-800 border border-success-200';
      default:
        return 'bg-secondary-50 text-secondary-800 border border-secondary-200';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(category)}`}>
      {category}
    </span>
  );
};

const SecurityEvents = () => {
  // モックデータ
  const [events] = useState([
    {
      id: 'SEC-2025-0001',
      timestamp: '2025/03/13 17:32:15',
      source: 'Microsoft Entra ID',
      user: 'john.doe@example.com',
      category: '不正アクセス',
      severity: '高',
      description: '複数の国から同一アカウントへの同時ログイン試行を検出',
      ip: '192.168.156.78',
      location: '東京, 日本 / ニューヨーク, 米国',
      status: '調査中',
      details: '同一ユーザーアカウントに対して、日本とアメリカから5分以内にログイン試行がありました。IPアドレスは以前に使用されたことのない新規のものです。Conditional Accessポリシーによりブロックされました。',
      analysis: '追加分析の結果、このアクセス試行はタイミングとIPアドレスのパターンから不正なものと判断されました。該当ユーザーアカウントは一時的にロックされ、セキュリティチームによる調査が行われています。'
    },
    {
      id: 'SEC-2025-0002',
      timestamp: '2025/03/13 15:47:22',
      source: 'HENGEOINE',
      user: 'システム',
      category: 'マルウェア',
      severity: '重大',
      description: 'エンドポイントでマルウェア（Trojan.Win32.GenericKD）を検出',
      ip: '192.168.34.56',
      location: '大阪, 日本',
      status: '対応済み',
      details: '営業部のPCでトロイの木馬が検出されました。検体は自動的に隔離されました。感染源の調査を実施中です。他のエンドポイントへの感染は現在のところ確認されていません。',
      analysis: '検出されたマルウェアは最新の定義ファイルにより特定され、即座に隔離されました。感染経路はメール添付ファイルの可能性が高く、類似パターンの攻撃がないか全社のエンドポイントをスキャン中です。'
    },
    {
      id: 'SEC-2025-0003',
      timestamp: '2025/03/13 12:15:48',
      source: 'Microsoft 365',
      user: 'admin@example.com',
      category: '監査',
      severity: '情報',
      description: '管理者がセキュリティ設定を変更',
      ip: '192.168.12.34',
      location: '東京, 日本',
      status: '確認済み',
      details: 'グローバル管理者がMicrosoft 365のセキュリティ設定を変更しました。多要素認証（MFA）の要件が全ユーザーに適用されるように更新されました。',
      analysis: '設定変更の詳細ログを確認し、すべての変更が適切な承認プロセスを経ていることを確認しました。変更はセキュリティ強化のためのもので、現在正常に機能しています。'
    },
    {
      id: 'SEC-2025-0004',
      timestamp: '2025/03/13 10:03:27',
      source: 'ファイルサーバー',
      user: 'tanaka.jiro@example.com',
      category: 'ポリシー違反',
      severity: '中',
      description: '機密文書へのアクセス権限外の閲覧試行',
      ip: '192.168.78.90',
      location: '大阪, 日本',
      status: '調査中',
      details: '財務部門専用の機密文書フォルダへのアクセスが試行されました。ユーザーはこのフォルダへのアクセス権限を持っていません。アクセスはブロックされ、監査ログに記録されました。',
      analysis: 'アクセス履歴の詳細分析により、このアクセス試行は意図的なものではなく、誤ったディレクトリへのアクセスの可能性が高いと判断されました。ユーザーへの権限説明と教育が推奨されます。'
    },
    {
      id: 'SEC-2025-0005',
      timestamp: '2025/03/13 09:45:11',
      source: 'Microsoft Entra ID',
      user: 'yamada.taro@example.com',
      category: '認証エラー',
      severity: '低',
      description: 'パスワード入力の連続失敗（5回）',
      ip: '192.168.56.78',
      location: '東京, 日本',
      status: '解決済み',
      details: 'ユーザーのパスワード入力が5回連続で失敗しました。ユーザーにヘルプデスクへの連絡を依頼し、パスワードリセットを実施しました。通常の業務用PCからのアクセスであることを確認済みです。',
      analysis: 'パスワード試行の失敗パターンを分析した結果、通常の業務端末からのアクセスであることが確認されました。セキュリティポリシーに従い、アカウントロックを解除し、パスワードリセットが完了しています。'
    },
    {
      id: 'SEC-2025-0006',
      timestamp: '2025/03/13 08:30:55',
      source: 'Microsoft Exchange Online',
      user: 'システム',
      category: '不正アクセス',
      severity: '高',
      description: 'フィッシングメールの一括送信試行を検出',
      ip: '203.0.113.100',
      location: '不明',
      status: '対応済み',
      details: 'Exchange Onlineの保護機能により、フィッシングパターンを含む一括メール送信が検出されブロックされました。送信元は外部IPアドレスで、認証されたアカウントを使用していました。当該アカウントのパスワードは即時リセットされ、調査が進行中です。',
      analysis: 'メールデータの詳細分析により、既知のフィッシング攻撃パターンと一致することが確認されました。送信元IPアドレスはブラックリストに追加され、全ユーザーに対して同様の攻撃に注意するよう警告が発信されました。'
    },
    {
      id: 'SEC-2025-0007',
      timestamp: '2025/03/12 22:15:33',
      source: 'HENGEOINE',
      user: 'システム',
      category: '監査',
      severity: '情報',
      description: 'セキュリティシグネチャの更新完了',
      ip: 'システム',
      location: 'システム',
      status: '完了',
      details: 'エンドポイントセキュリティシステムのシグネチャが最新バージョンに更新されました。すべてのクライアントに適用されたことを確認済みです。',
      analysis: '更新されたシグネチャは最新の脅威に対応しており、すべてのエンドポイントに正常に適用されました。更新前と比較して検知率が12%向上しています。'
    }
  ]);

  const [currentEvent, setCurrentEvent] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // 詳細分析モーダル用の状態
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisEvent, setAnalysisEvent] = useState(null);

  // フィルター適用したイベントリスト
  const filteredEvents = events.filter(event => {
    const severityMatch = filterSeverity === 'all' || event.severity === filterSeverity;
    const categoryMatch = filterCategory === 'all' || event.category === filterCategory;
    return severityMatch && categoryMatch;
  });

  // PDFダウンロード関数
  const exportToPDF = (event) => {
    // モックPDFコンテンツを作成（実際の環境では本物のPDF生成が必要）
    const pdfContent = `
セキュリティイベント詳細分析レポート
===================================
イベントID: ${event.id}
発生日時: ${event.timestamp}
カテゴリ: ${event.category}
重要度: ${event.severity}
ステータス: ${event.status}

説明:
${event.description}

詳細:
${event.details}

分析結果:
${event.analysis}

レポート生成日時: ${new Date().toLocaleString('ja-JP')}
    `;
    
    // Blobオブジェクトを作成してダウンロード
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `セキュリティ分析_${event.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">セキュリティイベント</h1>
        <div className="flex items-center text-primary-600">
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          <span className="text-sm">最終更新: 2025/03/13 18:25</span>
        </div>
      </div>

      {/* セキュリティサマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-danger-50 rounded-lg p-4 border border-danger-200">
          <div className="flex items-center">
            <ShieldExclamationIcon className="h-8 w-8 text-danger-500 mr-4" />
            <div>
              <h3 className="text-lg font-medium text-danger-800">重大/高</h3>
              <p className="text-3xl font-bold text-danger-700">
                {events.filter(e => e.severity === '重大' || e.severity === '高').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-secondary-200">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-primary-500 mr-4" />
            <div>
              <h3 className="text-lg font-medium text-secondary-800">中程度</h3>
              <p className="text-3xl font-bold text-primary-600">
                {events.filter(e => e.severity === '中').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-secondary-200">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-success-500 mr-4" />
            <div>
              <h3 className="text-lg font-medium text-secondary-800">低/情報</h3>
              <p className="text-3xl font-bold text-success-600">
                {events.filter(e => e.severity === '低' || e.severity === '情報').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-secondary-200">
          <div className="flex items-center">
            <DocumentMagnifyingGlassIcon className="h-8 w-8 text-secondary-500 mr-4" />
            <div>
              <h3 className="text-lg font-medium text-secondary-800">総検出数</h3>
              <p className="text-3xl font-bold text-secondary-700">{events.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* フィルターエリア */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-secondary-500" />
          <select
            className="form-input w-full sm:w-auto"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="all">すべての重要度</option>
            <option value="重大">重大</option>
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
            <option value="情報">情報</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <select
            className="form-input w-full sm:w-auto"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">すべてのカテゴリー</option>
            <option value="不正アクセス">不正アクセス</option>
            <option value="マルウェア">マルウェア</option>
            <option value="認証エラー">認証エラー</option>
            <option value="ポリシー違反">ポリシー違反</option>
            <option value="監査">監査</option>
          </select>
        </div>
      </div>

      {/* イベント一覧 */}
      <div className="space-y-4">
        {filteredEvents.map((event) => (
          <div 
            key={event.id}
            className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => setCurrentEvent(event)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start space-x-3">
                {event.severity === '重大' || event.severity === '高' ? (
                  <ShieldExclamationIcon className="h-6 w-6 text-danger-500 flex-shrink-0" />
                ) : (
                  <ShieldCheckIcon className="h-6 w-6 text-primary-500 flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-medium text-secondary-900">{event.description}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-secondary-500">{event.id}</span>
                    <span className="mx-2 text-secondary-300">|</span>
                    <ClockIcon className="h-3 w-3 text-secondary-500 mr-1" />
                    <span className="text-xs text-secondary-500">{event.timestamp}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                <CategoryBadge category={event.category} />
                <SeverityBadge severity={event.severity} />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="flex">
                <span className="text-secondary-500 w-20">ソース:</span>
                <span className="text-secondary-700">{event.source}</span>
              </div>
              <div className="flex">
                <span className="text-secondary-500 w-20">ユーザー:</span>
                <span className="text-secondary-700">{event.user}</span>
              </div>
              <div className="flex">
                <span className="text-secondary-500 w-20">IP:</span>
                <span className="text-secondary-700">{event.ip}</span>
              </div>
              <div className="flex">
                <span className="text-secondary-500 w-20">場所:</span>
                <span className="text-secondary-700">{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* イベント詳細モーダル */}
      {currentEvent && (
        <div className="fixed inset-0 z-30 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setCurrentEvent(null)}>
              <div className="absolute inset-0 bg-secondary-900 opacity-50"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg leading-6 font-medium text-secondary-900 break-words pr-4">
                        {currentEvent.description}
                      </h3>
                      <SeverityBadge severity={currentEvent.severity} />
                    </div>
                    <div className="mt-1 text-sm text-secondary-500 flex items-center">
                      <span className="mr-2">{currentEvent.id}</span>
                      <span>•</span>
                      <span className="ml-2">{currentEvent.timestamp}</span>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      <div className="flex justify-between">
                        <CategoryBadge category={currentEvent.category} />
                        <span className="text-sm text-secondary-500">{currentEvent.status}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-secondary-500">ソース</p>
                          <p className="font-medium">{currentEvent.source}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500">ユーザー</p>
                          <p className="font-medium">{currentEvent.user}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500">IPアドレス</p>
                          <p className="font-medium">{currentEvent.ip}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500">場所</p>
                          <p className="font-medium">{currentEvent.location}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-secondary-500">詳細</p>
                        <p className="mt-1 text-secondary-700">{currentEvent.details}</p>
                      </div>
                      
                      <div className="border-t border-secondary-200 pt-4">
                        <p className="text-sm text-secondary-500 mb-2">推奨アクション</p>
                        <ul className="space-y-2 text-sm text-secondary-700">
                          <li>• 関連するログの詳細分析</li>
                          <li>• 影響を受ける可能性のあるシステムの確認</li>
                          <li>• 類似イベントの検索と相関分析</li>
                          <li>• 必要に応じて対応手順書に従った対応</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-primary w-full sm:w-auto sm:ml-3"
                  onClick={() => setCurrentEvent(null)}
                >
                  閉じる
                </button>
                <button
                  type="button"
                  className="btn border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 mt-3 sm:mt-0 w-full sm:w-auto"
                  onClick={() => {
                    setAnalysisEvent(currentEvent);
                    setShowAnalysisModal(true);
                    setCurrentEvent(null);
                  }}
                >
                  詳細分析を実行
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 詳細分析モーダル - シンプル版 */}
      {showAnalysisModal && analysisEvent && (
        <div className="fixed inset-0 z-40 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowAnalysisModal(false)}>
              <div className="absolute inset-0 bg-secondary-900 opacity-50"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl leading-6 font-bold text-secondary-900 break-words">
                      セキュリティイベント詳細分析
                    </h3>
                    <p className="mt-1 text-sm text-secondary-500">
                      イベントID: {analysisEvent.id} | 分析時刻: {new Date().toLocaleString('ja-JP')}
                    </p>
                  </div>
                  <button 
                    className="flex items-center text-primary-600 hover:text-primary-800"
                    onClick={() => exportToPDF(analysisEvent)}
                  >
                    <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
                    <span className="text-sm">PDFダウンロード</span>
                  </button>
                </div>
                
                <div className="bg-secondary-50 p-4 rounded-lg mb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <div className="flex items-center mb-2 md:mb-0">
                      <CategoryBadge category={analysisEvent.category} />
                      <span className="ml-2">{analysisEvent.description}</span>
                    </div>
                    <SeverityBadge severity={analysisEvent.severity} />
                  </div>
                  <p className="text-sm text-secondary-700">{analysisEvent.details}</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-secondary-900 mb-2">分析結果</h4>
                  <div className="bg-white rounded-lg border border-secondary-200 p-4">
                    <div className="flex items-center mb-2">
                      <ChartBarIcon className="h-5 w-5 text-primary-500 mr-2" />
                      <h5 className="font-medium text-secondary-900">リスク評価</h5>
                    </div>
                    <div className="flex items-center justify-between bg-secondary-50 p-3 rounded-lg">
                      <span className="text-secondary-700 font-medium">リスクレベル:</span>
                      <span className="font-bold text-warning-600">
                        {analysisEvent.severity === '重大' ? '重大 (9.5/10)' :
                          analysisEvent.severity === '高' ? '高 (7.8/10)' :
                          analysisEvent.severity === '中' ? '中 (5.2/10)' :
                          '低 (2.1/10)'}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-secondary-700">{analysisEvent.analysis}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-primary w-full sm:w-auto"
                  onClick={() => setShowAnalysisModal(false)}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityEvents;
