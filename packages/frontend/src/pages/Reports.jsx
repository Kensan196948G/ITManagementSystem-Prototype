import React, { useState, useEffect } from 'react';
import { 
  DocumentChartBarIcon, 
  ArrowPathIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  PresentationChartLineIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

// レポートカードコンポーネント
const ReportCard = ({ title, description, category, date, icon: Icon, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className="bg-primary-50 p-3 rounded-lg">
          <Icon className="h-6 w-6 text-primary-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-secondary-900">{title}</h4>
          <p className="text-sm text-secondary-500 mt-1">{description}</p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-xs bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full">
              {category}
            </span>
            <div className="flex items-center text-xs text-secondary-500">
              <ClockIcon className="h-3 w-3 mr-1" />
              <span>{date}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// レポート詳細モーダルコンポーネント
const ReportDetailModal = ({ report, onClose, onExportPDF }) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-secondary-900 opacity-50"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-secondary-900">
                    {report.title}
                  </h3>
                  <span className="text-xs bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full">
                    {report.category}
                  </span>
                </div>
                <div className="mt-1 flex items-center text-sm text-secondary-500">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>{report.date}</span>
                </div>
                
                <div className="mt-4 space-y-6">
                  <p className="text-secondary-700">{report.description}</p>
                  
                  {/* レポートの詳細内容（仮のチャートや表を表現） */}
                  <div className="border border-secondary-200 rounded-lg p-4">
                    <h4 className="font-medium text-secondary-900 mb-4">サマリー</h4>
                    
                    {report.category === 'システム稼働状況' && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-secondary-500 mb-1">過去30日間のシステム稼働率</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-secondary-100 rounded-full h-2">
                              <div className="bg-success-500 h-2 rounded-full" style={{ width: '99.8%' }}></div>
                            </div>
                            <span className="text-sm font-medium">99.8%</span>
                          </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-secondary-200">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">サービス</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">稼働率</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">ダウンタイム</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">傾向</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">Microsoft 365</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">100%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">0分</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-success-600">安定</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">Exchange Online</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">99.7%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">120分</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-warning-600">注意</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">ファイルサーバー</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">99.9%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">30分</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-success-600">安定</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {report.category === 'セキュリティ分析' && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-secondary-500 mb-1">セキュリティイベント分類</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            <div className="bg-danger-50 border border-danger-100 p-3 rounded-lg">
                              <p className="text-danger-600 font-medium text-lg">12</p>
                              <p className="text-xs text-secondary-700">不正アクセス</p>
                            </div>
                            <div className="bg-warning-50 border border-warning-100 p-3 rounded-lg">
                              <p className="text-warning-600 font-medium text-lg">8</p>
                              <p className="text-xs text-secondary-700">マルウェア</p>
                            </div>
                            <div className="bg-primary-50 border border-primary-100 p-3 rounded-lg">
                              <p className="text-primary-600 font-medium text-lg">24</p>
                              <p className="text-xs text-secondary-700">認証エラー</p>
                            </div>
                            <div className="bg-success-50 border border-success-100 p-3 rounded-lg">
                              <p className="text-success-600 font-medium text-lg">45</p>
                              <p className="text-xs text-secondary-700">監査イベント</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-secondary-500 mb-1">検出イベント時系列</p>
                          <div className="w-full h-24 bg-secondary-50 border border-secondary-200 rounded-lg flex items-end p-2">
                            <div className="h-30% w-4 bg-primary-500 mx-1"></div>
                            <div className="h-50% w-4 bg-primary-500 mx-1"></div>
                            <div className="h-40% w-4 bg-primary-500 mx-1"></div>
                            <div className="h-25% w-4 bg-primary-500 mx-1"></div>
                            <div className="h-60% w-4 bg-danger-500 mx-1"></div>
                            <div className="h-20% w-4 bg-primary-500 mx-1"></div>
                            <div className="h-30% w-4 bg-primary-500 mx-1"></div>
                            <div className="h-80% w-4 bg-danger-500 mx-1"></div>
                            <div className="h-40% w-4 bg-primary-500 mx-1"></div>
                            <div className="h-30% w-4 bg-primary-500 mx-1"></div>
                            <div className="h-20% w-4 bg-primary-500 mx-1"></div>
                            <div className="h-45% w-4 bg-warning-500 mx-1"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {report.category === 'コスト分析' && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-secondary-500 mb-1">月間予算との比較</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-secondary-100 rounded-full h-2">
                              <div className="bg-primary-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                            <span className="text-sm font-medium">85%</span>
                          </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-secondary-200">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">サービス</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">予算</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">実績</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">前月比</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">Microsoft 365</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">¥850,000</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">¥842,500</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-success-600">-1.5%</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">クラウドストレージ</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">¥320,000</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">¥365,000</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-danger-600">+15.5%</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">セキュリティ</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">¥450,000</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">¥445,000</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-success-600">-1.1%</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <h4 className="font-medium text-secondary-900 mb-2">分析結果</h4>
                    <ul className="space-y-2 text-sm text-secondary-700 ml-4 list-disc">
                      <li>過去30日間のシステム全体の可用性は99.8%で、SLA目標の99.5%を上回っています。</li>
                      <li>Exchange Onlineで2時間の計画外ダウンタイムが発生しました。原因は外部プロバイダーの問題です。</li>
                      <li>Microsoft 365ライセンスの最適化により、前月比1.5%のコスト削減を達成しました。</li>
                      <li>セキュリティイベントの総数は前月比で15%減少しています。</li>
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
              onClick={onClose}
            >
              閉じる
            </button>
            <button
              type="button"
              className="btn border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 mt-3 sm:mt-0 w-full sm:w-auto"
              onClick={() => onExportPDF(report)}
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              PDFダウンロード
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reports = () => {
  const { generateReport, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('system_overview');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [emailNotification, setEmailNotification] = useState(true);
  
  // 生成成功メッセージをリセット
  useEffect(() => {
    let timer;
    if (generationSuccess) {
      timer = setTimeout(() => {
        setGenerationSuccess(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [generationSuccess]);

  // レポート即時生成処理
  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const reportData = await generateReport(selectedReportType, selectedPeriod);
      console.log('レポート生成結果:', reportData);
      
      if (reportData) {
        // 新しいレポートを追加
        const newReport = {
          id: `RPT-${new Date().getTime()}`,
          title: `${getReportTypeName(selectedReportType)} - ${getReportPeriodName(selectedPeriod)}`,
          description: `${getReportTypeName(selectedReportType)}の${getReportPeriodName(selectedPeriod)}レポートです`,
          category: getReportCategory(selectedReportType),
          date: new Date().toLocaleDateString('ja-JP'),
          icon: getReportIcon(selectedReportType)
        };
        
        // レポートデータに追加
        setReportsData(prev => [newReport, ...prev]);
        setGenerationSuccess(true);
        
        // メール通知がオンの場合
        if (emailNotification) {
          // メール送信をシミュレート
          console.log(`メール送信: ${currentUser?.email} 宛に "${newReport.title}" を送信しました`);
        }
      }
    } catch (err) {
      console.error('レポート生成エラー:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // レポートタイプ名の取得
  const getReportTypeName = (type) => {
    const types = {
      system_overview: 'システム概要',
      incident_summary: 'インシデント概要',
      user_activity: 'ユーザーアクティビティ',
      security_events: 'セキュリティイベント',
      performance_metrics: 'パフォーマンス指標',
      user_login_status: 'ユーザーログイン状況'
    };
    return types[type] || type;
  };
  
  // レポート期間名の取得
  const getReportPeriodName = (period) => {
    const periods = {
      today: '今日',
      yesterday: '昨日',
      last7days: '過去7日間',
      last30days: '過去30日間',
      thismonth: '今月',
      lastmonth: '先月'
    };
    return periods[period] || period;
  };
  
  // レポートカテゴリの取得
  const getReportCategory = (type) => {
    const categories = {
      system_overview: 'システム稼働状況',
      incident_summary: 'インシデント',
      user_activity: 'ユーザー分析',
      security_events: 'セキュリティ分析',
      performance_metrics: 'パフォーマンス',
      user_login_status: 'ユーザー管理'
    };
    return categories[type] || 'その他';
  };
  
  // レポートアイコンの取得
  const getReportIcon = (type) => {
    const icons = {
      system_overview: PresentationChartLineIcon,
      incident_summary: ClockIcon,
      user_activity: ChartBarIcon,
      security_events: ShieldCheckIcon,
      performance_metrics: DocumentChartBarIcon
    };
    return icons[type] || DocumentTextIcon;
  };
  
  // PDFダウンロード関数
  const exportToPDF = (report) => {
    if (!report) return;
    
    // レポートの内容に基づいたPDF用テキストを作成
    let analysisText = '';
    if (report.category === 'システム稼働状況') {
      analysisText = '過去30日間のシステム全体の可用性は99.8%で、SLA目標の99.5%を上回っています。\nExchange Onlineで2時間の計画外ダウンタイムが発生しました。原因は外部プロバイダーの問題です。';
    } else if (report.category === 'セキュリティ分析') {
      analysisText = '検出されたセキュリティイベントの総数は89件で、前月比15%減少しています。\n不正アクセス試行が12件、マルウェア検出が8件、認証エラーが24件、監査イベントが45件検出されました。';
    } else if (report.category === 'コスト分析') {
      analysisText = 'IT全体の月間コストは予算比85%で推移しています。\nMicrosoft 365ライセンスの最適化により前月比1.5%のコスト削減を達成しました。\nクラウドストレージのコストが予算を超過しているため、最適化が必要です。';
    } else {
      analysisText = '詳細な分析結果はレポート本文をご参照ください。';
    }
    
    // モックPDFコンテンツを作成
    const pdfContent = `
${report.title}
====================================================
レポートID: ${report.id}
作成日: ${report.date}
カテゴリ: ${report.category}

概要:
${report.description}

分析結果:
${analysisText}

推奨アクション:
• 検出された問題点への対応策の実施
• システム最適化のための提案の検討
• 次回レポートでのフォローアップ確認

====================================================
レポート出力日時: ${new Date().toLocaleString('ja-JP')}
ITマネジメントシステム
    `;
    
    // Blobオブジェクトを作成してダウンロード
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.category}_レポート_${report.date.replace(/\//g, '')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // カスタムShieldCheckIconコンポーネント
  const ShieldCheckIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );


  const [selectedReport, setSelectedReport] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // レポートデータ状態
  const [reportsData, setReportsData] = useState([
    {
      id: 'RPT-2025-0001',
      title: 'システム稼働状況月次レポート',
      description: '全システムの可用性、パフォーマンス、インシデント対応状況の月次サマリー',
      category: 'システム稼働状況',
      date: '2025/03/01',
      icon: PresentationChartLineIcon
    },
    {
      id: 'RPT-2025-0002',
      title: 'セキュリティイベント月次分析',
      description: '検出されたセキュリティイベントの分析と対応状況、脆弱性評価の月次レポート',
      category: 'セキュリティ分析',
      date: '2025/03/01',
      icon: ShieldCheckIcon
    },
    {
      id: 'RPT-2025-0003',
      title: 'ITコスト分析レポート',
      description: 'サービス・システム別のコスト分析、予算との比較、最適化提案',
      category: 'コスト分析',
      date: '2025/03/01',
      icon: DocumentChartBarIcon
    },
    {
      id: 'RPT-2025-0004',
      title: 'Microsoft 365使用状況レポート',
      description: 'Microsoft 365サービスの使用状況、ライセンス分析、最適化提案',
      category: 'サービス使用状況',
      date: '2025/03/01',
      icon: ChartBarIcon
    },
    {
      id: 'RPT-2025-0005',
      title: 'ISO 27001コンプライアンス評価',
      description: 'ISO 27001準拠状況の評価、リスク分析、改善提案',
      category: 'コンプライアンス',
      date: '2025/03/01',
      icon: DocumentTextIcon
    },
    {
      id: 'RPT-2025-0006',
      title: '週次インシデントサマリー',
      description: '過去1週間のインシデント対応状況、解決時間、影響分析',
      category: 'インシデント',
      date: '2025/03/10',
      icon: ClockIcon
    },
    {
      id: 'RPT-2025-0007',
      title: 'システム稼働状況日次レポート',
      description: '全システムの可用性、パフォーマンス、インシデント対応状況の日次サマリー',
      category: 'システム稼働状況',
      date: '2025/03/16',
      icon: PresentationChartLineIcon
    },
    {
      id: 'RPT-2025-0008',
      title: 'セキュリティイベント日次分析',
      description: '検出されたセキュリティイベントの分析と対応状況の日次レポート',
      category: 'セキュリティ分析',
      date: '2025/03/16',
      icon: ShieldCheckIcon
    }
  ]);

  // 日付の一覧を取得（フィルター用）
  const dates = [...new Set(reportsData.map(report => report.date))].sort((a, b) => new Date(b) - new Date(a));
  
  // カテゴリの一覧を取得（フィルター用）
  const categories = [...new Set(reportsData.map(report => report.category))];

  // フィルター適用
  const filteredReports = reportsData.filter(report => {
    const dateMatch = dateFilter === 'all' || report.date === dateFilter;
    const categoryMatch = categoryFilter === 'all' || report.category === categoryFilter;
    return dateMatch && categoryMatch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">レポート</h1>
        <div className="flex items-center text-primary-600">
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          <span className="text-sm">最終更新: {new Date().toLocaleString('ja-JP', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
          })}</span>
        </div>
      </div>

      {/* 即時レポート生成エリア */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
        <h2 className="text-lg font-medium text-secondary-900 mb-4">即時レポート生成</h2>
        <p className="text-sm text-secondary-600 mb-4">
          選択したタイプと期間のレポートを即時生成し、ブラウザに表示します。必要に応じてダウンロードや配信も可能です。
        </p>
        
        {generationSuccess && (
          <div className="bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded mb-4 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            <span>レポートが正常に生成されました！レポート一覧に追加されました。</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">レポートタイプ</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              disabled={loading}
            >
              <option value="system_overview">システム概要</option>
              <option value="incident_summary">インシデント概要</option>
              <option value="user_activity">ユーザーアクティビティ</option>
              <option value="security_events">セキュリティイベント</option>
              <option value="performance_metrics">パフォーマンス指標</option>
              <option value="user_login_status">ユーザーログイン状況</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">期間</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              disabled={loading}
            >
              <option value="today">今日</option>
              <option value="yesterday">昨日</option>
              <option value="last7days">過去7日間</option>
              <option value="last30days">過去30日間</option>
              <option value="thismonth">今月</option>
              <option value="lastmonth">先月</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <input 
            id="email_notification" 
            type="checkbox" 
            className="h-4 w-4 rounded text-primary-600 border-secondary-300"
            checked={emailNotification}
            onChange={(e) => setEmailNotification(e.target.checked)}
            disabled={loading}
          />
          <label htmlFor="email_notification" className="ml-2 text-sm text-secondary-700">
            レポートをメールでも受け取る ({currentUser?.email || 'メールアドレス'})
          </label>
        </div>
        
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>生成中...</span>
              </>
            ) : (
              <>
                <PresentationChartLineIcon className="h-5 w-5 mr-2" />
                <span>レポート生成</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* フィルターと過去レポート一覧 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
        <h2 className="text-lg font-medium text-secondary-900 mb-4">レポート一覧</h2>
        
        {/* フィルターエリア */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-secondary-500" />
            <select
              className="form-input w-full sm:w-auto"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">すべての日付</option>
              {dates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <DocumentChartBarIcon className="h-5 w-5 text-secondary-500" />
            <select
              className="form-input w-full sm:w-auto"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">すべてのカテゴリー</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* レポート一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map(report => (
            <ReportCard
              key={report.id}
              title={report.title}
              description={report.description}
              category={report.category}
              date={report.date}
              icon={report.icon}
              onClick={() => setSelectedReport(report)}
            />
          ))}
        </div>
        
        {filteredReports.length === 0 && (
          <div className="text-center py-8 text-secondary-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-secondary-300" />
            <p className="mt-2">検索条件に一致するレポートがありません</p>
          </div>
        )}
      </div>

      {/* レポート詳細モーダル */}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onExportPDF={exportToPDF}
      />
    </div>
  );
};

export default Reports;
