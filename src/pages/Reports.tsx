import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Filter,
  Search,
  Calendar,
  Clock,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Users,
  Server,
  Zap,
  Mail,
  RefreshCw,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: string;
  category: string;
  status: 'completed' | 'running' | 'scheduled' | 'failed';
  createdAt: string;
  lastRun: string;
  nextRun?: string;
  size: string;
  records: number;
  description: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  fields: string[];
  scheduleOptions: boolean;
}

const mockReports: Report[] = [
  {
    id: '1',
    name: 'インシデント月次レポート',
    type: 'incident',
    category: 'インシデント管理',
    status: 'completed',
    createdAt: '2024-08-20',
    lastRun: '2024-08-27',
    size: '2.3MB',
    records: 342,
    description: '月次インシデント発生状況と解決状況の詳細分析'
  },
  {
    id: '2',
    name: 'SLA準拠レポート',
    type: 'sla',
    category: 'サービスレベル管理',
    status: 'running',
    createdAt: '2024-08-15',
    lastRun: '2024-08-27',
    size: '1.8MB',
    records: 156,
    description: 'サービスレベル合意の達成状況と違反事項の分析'
  },
  {
    id: '3',
    name: '変更管理成功率レポート',
    type: 'change',
    category: '変更管理',
    status: 'completed',
    createdAt: '2024-08-10',
    lastRun: '2024-08-26',
    nextRun: '2024-09-02',
    size: '956KB',
    records: 89,
    description: '変更要求の承認、実装、成功率の包括的分析'
  },
  {
    id: '4',
    name: 'セキュリティインシデントレポート',
    type: 'security',
    category: 'セキュリティ管理',
    status: 'scheduled',
    createdAt: '2024-08-05',
    lastRun: '2024-08-25',
    nextRun: '2024-08-30',
    size: '3.1MB',
    records: 67,
    description: 'セキュリティ関連インシデントの詳細分析と対策状況'
  },
  {
    id: '5',
    name: 'パフォーマンス分析レポート',
    type: 'performance',
    category: 'システム監視',
    status: 'failed',
    createdAt: '2024-08-01',
    lastRun: '2024-08-24',
    size: '4.7MB',
    records: 1250,
    description: 'システムパフォーマンス指標とボトルネック分析'
  },
  {
    id: '6',
    name: 'ユーザー活動レポート',
    type: 'user',
    category: 'ユーザー管理',
    status: 'completed',
    createdAt: '2024-07-28',
    lastRun: '2024-08-27',
    size: '1.2MB',
    records: 445,
    description: 'ユーザーのシステム利用状況と活動パターン分析'
  }
];

const reportTemplates: ReportTemplate[] = [
  {
    id: 'incident_template',
    name: 'インシデントレポート',
    category: 'インシデント管理',
    description: 'インシデントの発生、対応、解決状況の詳細レポート',
    icon: <AlertTriangle className="w-5 h-5" />,
    fields: ['発生日時', '優先度', '状態', '担当者', '解決時間', 'カテゴリ'],
    scheduleOptions: true
  },
  {
    id: 'problem_template',
    name: '問題管理レポート',
    category: '問題管理',
    description: '根本原因分析と問題解決の進捗レポート',
    icon: <Search className="w-5 h-5" />,
    fields: ['問題ID', '発見日', '根本原因', '影響範囲', '解決策', '状態'],
    scheduleOptions: true
  },
  {
    id: 'change_template',
    name: '変更管理レポート',
    category: '変更管理',
    description: '変更要求の承認、実装、成功率の分析レポート',
    icon: <Activity className="w-5 h-5" />,
    fields: ['変更ID', '要求日', '実装日', '承認者', '成功/失敗', 'リスク評価'],
    scheduleOptions: true
  },
  {
    id: 'sla_template',
    name: 'SLA準拠レポート',
    category: 'サービスレベル管理',
    description: 'サービスレベル合意の達成状況と違反分析',
    icon: <CheckCircle className="w-5 h-5" />,
    fields: ['サービス名', 'SLA目標', '実績値', '達成率', '違反件数', '改善策'],
    scheduleOptions: true
  },
  {
    id: 'performance_template',
    name: 'パフォーマンスレポート',
    category: 'システム監視',
    description: 'システムパフォーマンス指標とリソース使用状況',
    icon: <BarChart3 className="w-5 h-5" />,
    fields: ['CPU使用率', 'メモリ使用率', '応答時間', 'スループット', '可用性'],
    scheduleOptions: true
  },
  {
    id: 'custom_template',
    name: 'カスタムレポート',
    category: 'カスタム',
    description: 'ユーザー定義のフィールドと条件によるカスタムレポート',
    icon: <Settings className="w-5 h-5" />,
    fields: ['カスタムフィールド'],
    scheduleOptions: false
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'text-green-400 bg-green-400/20';
    case 'running': return 'text-blue-400 bg-blue-400/20';
    case 'scheduled': return 'text-yellow-400 bg-yellow-400/20';
    case 'failed': return 'text-red-400 bg-red-400/20';
    default: return 'text-gray-400 bg-gray-400/20';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return '完了';
    case 'running': return '実行中';
    case 'scheduled': return '予定';
    case 'failed': return '失敗';
    default: return '不明';
  }
};

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'templates' | 'create'>('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredReports = useMemo(() => {
    return mockReports.filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus]);

  const categories = [...new Set(mockReports.map(report => report.category))];
  const statuses = [...new Set(mockReports.map(report => report.status))];

  const handleExport = (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting report ${reportId} as ${format}`);
    // Export implementation would go here
  };

  const handleSchedule = (reportId: string) => {
    console.log(`Scheduling report ${reportId}`);
    // Schedule implementation would go here
  };

  const handlePreview = (reportId: string) => {
    console.log(`Previewing report ${reportId}`);
    // Preview implementation would go here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">レポート管理</h1>
              <p className="text-gray-300">ITサービス管理レポートの生成と管理</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新規レポート作成
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            レポート一覧
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            テンプレート
          </button>
        </div>

        {activeTab === 'reports' && (
          <div>
            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="レポート検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全カテゴリ</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全ステータス</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{getStatusText(status)}</option>
                  ))}
                </select>
                
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">過去7日</option>
                  <option value="30d">過去30日</option>
                  <option value="90d">過去90日</option>
                  <option value="365d">過去1年</option>
                </select>
              </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/20">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-300">レポート名</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-300">カテゴリ</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-300">ステータス</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-300">最終実行</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-300">レコード数</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-300">サイズ</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-300">アクション</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-white">{report.name}</div>
                            <div className="text-sm text-gray-400 mt-1">{report.description}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">{report.category}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {getStatusText(report.status)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-300">{report.lastRun}</td>
                        <td className="py-4 px-6 text-gray-300">{report.records.toLocaleString()}</td>
                        <td className="py-4 px-6 text-gray-300">{report.size}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handlePreview(report.id)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="プレビュー"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <div className="relative group">
                              <button className="text-green-400 hover:text-green-300 transition-colors" title="エクスポート">
                                <Download className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 rounded-lg shadow-lg py-1 min-w-max">
                                <button
                                  onClick={() => handleExport(report.id, 'pdf')}
                                  className="block px-3 py-1 text-sm text-white hover:bg-gray-700 w-full text-left"
                                >
                                  PDF
                                </button>
                                <button
                                  onClick={() => handleExport(report.id, 'excel')}
                                  className="block px-3 py-1 text-sm text-white hover:bg-gray-700 w-full text-left"
                                >
                                  Excel
                                </button>
                                <button
                                  onClick={() => handleExport(report.id, 'csv')}
                                  className="block px-3 py-1 text-sm text-white hover:bg-gray-700 w-full text-left"
                                >
                                  CSV
                                </button>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleSchedule(report.id)}
                              className="text-yellow-400 hover:text-yellow-300 transition-colors"
                              title="スケジュール設定"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            
                            <button className="text-purple-400 hover:text-purple-300 transition-colors" title="編集">
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            <button className="text-red-400 hover:text-red-300 transition-colors" title="削除">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                      {template.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{template.name}</h3>
                      <p className="text-sm text-gray-400">{template.category}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4">{template.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">含まれるフィールド:</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.slice(0, 3).map((field, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300"
                          >
                            {field}
                          </span>
                        ))}
                        {template.fields.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">
                            +{template.fields.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        {template.scheduleOptions && (
                          <>
                            <Clock className="w-4 h-4" />
                            <span>スケジュール対応</span>
                          </>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCreateModal(true);
                          setSelectedTemplate(template.id);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                      >
                        使用
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Report Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">新規レポート作成</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedTemplate(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">閉じる</span>
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    レポート名
                  </label>
                  <input
                    type="text"
                    placeholder="レポート名を入力..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    説明
                  </label>
                  <textarea
                    rows={3}
                    placeholder="レポートの説明を入力..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      カテゴリ
                    </label>
                    <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="incident">インシデント管理</option>
                      <option value="problem">問題管理</option>
                      <option value="change">変更管理</option>
                      <option value="sla">サービスレベル管理</option>
                      <option value="performance">システム監視</option>
                      <option value="custom">カスタム</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      データ範囲
                    </label>
                    <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="7d">過去7日</option>
                      <option value="30d">過去30日</option>
                      <option value="90d">過去90日</option>
                      <option value="365d">過去1年</option>
                      <option value="custom">カスタム範囲</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    出力形式
                  </label>
                  <div className="flex gap-4">
                    {['PDF', 'Excel', 'CSV'].map((format) => (
                      <label key={format} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-white">{format}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-white">自動スケジュール実行を有効にする</span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedTemplate(null);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  レポート作成
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;