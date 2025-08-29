import React, { useState } from 'react';
import {
  Plus,
  Save,
  Play,
  Download,
  Share2,
  Calendar,
  Filter,
  BarChart3,
  LineChart,
  PieChart,
  Table,
  FileText,
  FileSpreadsheet,
  Database,
  Clock,
  GripVertical,
  Settings,
  Eye,
  Copy,
  Trash2,
  Edit,
  Users,
  Mail,
  Bell
} from 'lucide-react';

// Interfaces for custom report builder
interface ReportField {
  id: string;
  name: string;
  displayName: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  aggregatable: boolean;
}

interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
  displayName: string;
}

interface ReportGrouping {
  field: string;
  order: 'asc' | 'desc';
}

interface ReportSorting {
  field: string;
  order: 'asc' | 'desc';
}

interface CustomReport {
  id: string;
  name: string;
  description: string;
  dataSource: string;
  fields: string[];
  filters: ReportFilter[];
  groupBy: ReportGrouping[];
  sortBy: ReportSorting[];
  visualizationType: 'table' | 'bar' | 'line' | 'pie';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
  createdAt: string;
  lastRun?: string;
  status: 'draft' | 'active' | 'scheduled';
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  dataSource: string;
  visualization: string;
  icon: React.ReactNode;
}

interface DataSource {
  id: string;
  name: string;
  displayName: string;
  description: string;
  fields: ReportField[];
}

const CustomReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'saved' | 'history'>('builder');
  const [selectedDataSource, setSelectedDataSource] = useState<string>('incidents');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [visualizationType, setVisualizationType] = useState<'table' | 'bar' | 'line' | 'pie'>('table');
  const [reportName, setReportName] = useState<string>('');
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [scheduleSettings, setScheduleSettings] = useState({
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    time: '09:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    recipients: [''],
    notifications: true,
    format: 'PDF'
  });

  // File download utility function
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const BOM = '\uFEFF'; // UTF-8 BOM for Japanese text
    const blob = new Blob([BOM + content], { type: mimeType + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export functions
  const exportToPDF = () => {
    try {
      const mockPDFContent = `PDF Report - ${reportName || 'カスタムレポート'}

データソース: ${getCurrentDataSource()?.displayName}
生成日時: ${new Date().toLocaleString('ja-JP')}

選択されたフィールド:
${selectedFields.map(fieldId => {
  const field = getCurrentDataSource()?.fields.find(f => f.id === fieldId);
  return `- ${field?.displayName} (${field?.dataType})`;
}).join('\n')}

このレポートは${new Date().toLocaleDateString('ja-JP')}に生成されました。
詳細なデータについてはシステム管理者にお問い合わせください。`;

      downloadFile(mockPDFContent, `${reportName || 'カスタムレポート'}_${new Date().toISOString().split('T')[0]}.pdf`, 'text/plain');
      alert('PDFレポートを生成しました（開発版）');
    } catch (error) {
      console.error('PDF export error:', error);
      alert('PDFエクスポートでエラーが発生しました。');
    }
  };

  const exportToExcel = () => {
    try {
      const csvHeader = selectedFields.map(fieldId => {
        const field = getCurrentDataSource()?.fields.find(f => f.id === fieldId);
        return field?.displayName || fieldId;
      }).join(',') + '\n';
      
      const mockData = Array.from({length: 10}, (_, i) => 
        selectedFields.map(fieldId => {
          const field = getCurrentDataSource()?.fields.find(f => f.id === fieldId);
          switch(field?.dataType) {
            case 'number': return Math.floor(Math.random() * 100);
            case 'date': return new Date().toISOString().split('T')[0];
            case 'boolean': return Math.random() > 0.5 ? 'はい' : 'いいえ';
            default: return `サンプルデータ${i + 1}`;
          }
        }).join(',')
      ).join('\n');

      const csvContent = csvHeader + mockData;
      downloadFile(csvContent, `${reportName || 'カスタムレポート'}_${new Date().toISOString().split('T')[0]}.xlsx`, 'text/csv');
      alert('Excelファイルを生成しました');
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Excelエクスポートでエラーが発生しました。');
    }
  };

  const exportToCSV = () => {
    try {
      const csvHeader = selectedFields.map(fieldId => {
        const field = getCurrentDataSource()?.fields.find(f => f.id === fieldId);
        return `"${field?.displayName || fieldId}"`;
      }).join(',') + '\n';
      
      const mockData = Array.from({length: 10}, (_, i) => 
        selectedFields.map(fieldId => {
          const field = getCurrentDataSource()?.fields.find(f => f.id === fieldId);
          switch(field?.dataType) {
            case 'number': return Math.floor(Math.random() * 100);
            case 'date': return new Date().toISOString().split('T')[0];
            case 'boolean': return Math.random() > 0.5 ? 'はい' : 'いいえ';
            default: return `"サンプルデータ${i + 1}"`;
          }
        }).join(',')
      ).join('\n');

      const csvContent = csvHeader + mockData;
      downloadFile(csvContent, `${reportName || 'カスタムレポート'}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      alert('CSVファイルを生成しました');
    } catch (error) {
      console.error('CSV export error:', error);
      alert('CSVエクスポートでエラーが発生しました。');
    }
  };

  // Execute report function
  const executeReport = () => {
    if (!reportName.trim()) {
      alert('レポート名を入力してください。');
      return;
    }
    if (selectedFields.length === 0) {
      alert('少なくとも1つのフィールドを選択してください。');
      return;
    }
    
    console.log('Report execution:', {
      name: reportName,
      dataSource: selectedDataSource,
      fields: selectedFields,
      filters: filters,
      visualization: visualizationType
    });
    
    alert(`レポート「${reportName}」を実行しました。\n選択フィールド数: ${selectedFields.length}\nフィルター数: ${filters.length}`);
  };

  // Save report function
  const saveReport = () => {
    if (!reportName.trim()) {
      alert('レポート名を入力してください。');
      return;
    }
    if (selectedFields.length === 0) {
      alert('少なくとも1つのフィールドを選択してください。');
      return;
    }
    
    console.log('Saving report:', {
      name: reportName,
      dataSource: selectedDataSource,
      fields: selectedFields,
      filters: filters,
      visualization: visualizationType,
      schedule: isScheduling ? scheduleSettings : null
    });
    
    alert(`レポート「${reportName}」を保存しました。`);
  };

  // Mock data sources
  const dataSources: DataSource[] = [
    {
      id: 'incidents',
      name: 'incidents',
      displayName: 'インシデント',
      description: 'インシデント管理データ',
      fields: [
        { id: 'id', name: 'id', displayName: 'ID', dataType: 'string', aggregatable: false },
        { id: 'title', name: 'title', displayName: 'タイトル', dataType: 'string', aggregatable: false },
        { id: 'priority', name: 'priority', displayName: '優先度', dataType: 'string', aggregatable: true },
        { id: 'status', name: 'status', displayName: 'ステータス', dataType: 'string', aggregatable: true },
        { id: 'created_at', name: 'created_at', displayName: '作成日', dataType: 'date', aggregatable: false },
        { id: 'resolved_at', name: 'resolved_at', displayName: '解決日', dataType: 'date', aggregatable: false },
        { id: 'assignee', name: 'assignee', displayName: '担当者', dataType: 'string', aggregatable: true }
      ]
    },
    {
      id: 'changes',
      name: 'changes',
      displayName: '変更',
      description: '変更管理データ',
      fields: [
        { id: 'id', name: 'id', displayName: 'ID', dataType: 'string', aggregatable: false },
        { id: 'title', name: 'title', displayName: 'タイトル', dataType: 'string', aggregatable: false },
        { id: 'type', name: 'type', displayName: '種類', dataType: 'string', aggregatable: true },
        { id: 'status', name: 'status', displayName: 'ステータス', dataType: 'string', aggregatable: true },
        { id: 'risk_level', name: 'risk_level', displayName: 'リスクレベル', dataType: 'string', aggregatable: true },
        { id: 'success_rate', name: 'success_rate', displayName: '成功率', dataType: 'number', aggregatable: true }
      ]
    },
    {
      id: 'problems',
      name: 'problems',
      displayName: '問題',
      description: '問題管理データ',
      fields: [
        { id: 'id', name: 'id', displayName: 'ID', dataType: 'string', aggregatable: false },
        { id: 'title', name: 'title', displayName: 'タイトル', dataType: 'string', aggregatable: false },
        { id: 'category', name: 'category', displayName: 'カテゴリ', dataType: 'string', aggregatable: true },
        { id: 'impact', name: 'impact', displayName: '影響度', dataType: 'string', aggregatable: true },
        { id: 'trend', name: 'trend', displayName: 'トレンド', dataType: 'string', aggregatable: true }
      ]
    },
    {
      id: 'assets',
      name: 'assets',
      displayName: '資産',
      description: '資産管理データ',
      fields: [
        { id: 'id', name: 'id', displayName: 'ID', dataType: 'string', aggregatable: false },
        { id: 'name', name: 'name', displayName: '名前', dataType: 'string', aggregatable: false },
        { id: 'type', name: 'type', displayName: '種類', dataType: 'string', aggregatable: true },
        { id: 'status', name: 'status', displayName: 'ステータス', dataType: 'string', aggregatable: true },
        { id: 'location', name: 'location', displayName: '場所', dataType: 'string', aggregatable: true }
      ]
    },
    {
      id: 'services',
      name: 'services',
      displayName: 'サービス',
      description: 'サービス管理データ',
      fields: [
        { id: 'id', name: 'id', displayName: 'ID', dataType: 'string', aggregatable: false },
        { id: 'name', name: 'name', displayName: 'サービス名', dataType: 'string', aggregatable: false },
        { id: 'availability', name: 'availability', displayName: '可用性', dataType: 'number', aggregatable: true },
        { id: 'performance', name: 'performance', displayName: 'パフォーマンス', dataType: 'number', aggregatable: true }
      ]
    }
  ];

  // Pre-built report templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'incident-summary',
      name: 'インシデント要約',
      description: '期間別インシデント発生状況と解決状況の要約',
      category: 'インシデント',
      dataSource: 'incidents',
      visualization: 'bar',
      icon: <BarChart3 className="w-6 h-6 text-red-400" />
    },
    {
      id: 'change-success',
      name: '変更成功率',
      description: '変更管理の成功率とリスク分析',
      category: '変更',
      dataSource: 'changes',
      visualization: 'pie',
      icon: <PieChart className="w-6 h-6 text-blue-400" />
    },
    {
      id: 'problem-trends',
      name: '問題トレンド分析',
      description: '問題発生パターンと傾向分析',
      category: '問題',
      dataSource: 'problems',
      visualization: 'line',
      icon: <LineChart className="w-6 h-6 text-yellow-400" />
    },
    {
      id: 'asset-inventory',
      name: '資産インベントリ',
      description: '資産状況と配置状況の一覧',
      category: '資産',
      dataSource: 'assets',
      visualization: 'table',
      icon: <Table className="w-6 h-6 text-green-400" />
    },
    {
      id: 'service-performance',
      name: 'サービス性能',
      description: 'サービス可用性とパフォーマンス指標',
      category: 'サービス',
      dataSource: 'services',
      visualization: 'line',
      icon: <LineChart className="w-6 h-6 text-purple-400" />
    }
  ];

  // Mock saved reports
  const savedReports: CustomReport[] = [
    {
      id: '1',
      name: '月次インシデントレポート',
      description: '月別のインシデント発生・解決状況',
      dataSource: 'incidents',
      fields: ['title', 'priority', 'status', 'created_at'],
      filters: [],
      groupBy: [{ field: 'priority', order: 'asc' }],
      sortBy: [{ field: 'created_at', order: 'desc' }],
      visualizationType: 'bar',
      schedule: { frequency: 'monthly', recipients: ['manager@company.com'] },
      createdAt: '2024-01-15',
      lastRun: '2024-02-01',
      status: 'active'
    },
    {
      id: '2',
      name: '変更成功率分析',
      description: '週次変更管理成功率レポート',
      dataSource: 'changes',
      fields: ['type', 'status', 'risk_level', 'success_rate'],
      filters: [],
      groupBy: [{ field: 'type', order: 'asc' }],
      sortBy: [{ field: 'success_rate', order: 'desc' }],
      visualizationType: 'pie',
      createdAt: '2024-01-20',
      status: 'draft'
    }
  ];

  const getCurrentDataSource = () => {
    return dataSources.find(ds => ds.id === selectedDataSource);
  };

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: '',
      displayName: ''
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId));
  };

  const getVisualizationIcon = (type: string) => {
    switch (type) {
      case 'table': return <Table className="w-4 h-4" />;
      case 'bar': return <BarChart3 className="w-4 h-4" />;
      case 'line': return <LineChart className="w-4 h-4" />;
      case 'pie': return <PieChart className="w-4 h-4" />;
      default: return <Table className="w-4 h-4" />;
    }
  };

  const getExportIcon = (format: string) => {
    switch (format) {
      case 'PDF': return <FileText className="w-4 h-4" />;
      case 'Excel': return <FileSpreadsheet className="w-4 h-4" />;
      case 'CSV': return <Database className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Mock chart components for different visualization types
  const MockChart: React.FC<{ type: string; height?: string }> = ({ type, height = "h-64" }) => (
    <div className={`${height} bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center border border-white/10`}>
      <div className="text-center text-gray-400">
        {type === 'table' && (
          <div>
            <Table className="w-12 h-12 mx-auto mb-4" />
            <p className="text-sm mb-2">データテーブル</p>
            <div className="text-xs">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="bg-white/10 p-1 rounded">項目A</div>
                <div className="bg-white/10 p-1 rounded">項目B</div>
                <div className="bg-white/10 p-1 rounded">項目C</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 p-1 rounded">値1</div>
                <div className="bg-white/5 p-1 rounded">値2</div>
                <div className="bg-white/5 p-1 rounded">値3</div>
              </div>
            </div>
          </div>
        )}
        {type === 'bar' && (
          <div>
            <BarChart3 className="w-12 h-12 mx-auto mb-4" />
            <p className="text-sm mb-2">棒グラフ</p>
            <div className="flex items-end justify-center space-x-1 h-16">
              <div className="w-4 bg-blue-400 h-8 rounded-t"></div>
              <div className="w-4 bg-green-400 h-12 rounded-t"></div>
              <div className="w-4 bg-yellow-400 h-6 rounded-t"></div>
              <div className="w-4 bg-red-400 h-10 rounded-t"></div>
            </div>
          </div>
        )}
        {type === 'line' && (
          <div>
            <LineChart className="w-12 h-12 mx-auto mb-4" />
            <p className="text-sm mb-2">線グラフ</p>
            <div className="relative h-16 w-24 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                <polyline
                  points="10,50 30,30 50,40 70,20 90,35"
                  fill="none"
                  stroke="rgb(96, 165, 250)"
                  strokeWidth="2"
                />
                {[10,30,50,70,90].map((x, i) => (
                  <circle key={i} cx={x} cy={[50,30,40,20,35][i]} r="2" fill="rgb(96, 165, 250)" />
                ))}
              </svg>
            </div>
          </div>
        )}
        {type === 'pie' && (
          <div>
            <PieChart className="w-12 h-12 mx-auto mb-4" />
            <p className="text-sm mb-2">円グラフ</p>
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 flex items-center justify-center">
              <div className="w-6 h-6 bg-slate-900 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">カスタムレポート</h1>
              <p className="text-gray-300">柔軟なレポート作成とスケジューリング機能</p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={saveReport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>保存</span>
              </button>
              <button 
                onClick={executeReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>実行</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
            {[
              { id: 'builder', label: 'レポートビルダー', icon: <Settings className="w-4 h-4" /> },
              { id: 'templates', label: 'テンプレート', icon: <FileText className="w-4 h-4" /> },
              { id: 'saved', label: '保存済み', icon: <Save className="w-4 h-4" /> },
              { id: 'history', label: '実行履歴', icon: <Clock className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Report Builder Tab */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Data Source Selection */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  データソース選択
                </h3>
                <div className="space-y-3">
                  {dataSources.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => setSelectedDataSource(source.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedDataSource === source.id
                          ? 'bg-blue-600/30 border-2 border-blue-400'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <div className="font-medium text-white">{source.displayName}</div>
                      <div className="text-sm text-gray-300">{source.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visualization Type */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">可視化タイプ</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'table', label: 'テーブル', icon: <Table className="w-5 h-5" /> },
                    { type: 'bar', label: '棒グラフ', icon: <BarChart3 className="w-5 h-5" /> },
                    { type: 'line', label: '線グラフ', icon: <LineChart className="w-5 h-5" /> },
                    { type: 'pie', label: '円グラフ', icon: <PieChart className="w-5 h-5" /> }
                  ].map((viz) => (
                    <button
                      key={viz.type}
                      onClick={() => setVisualizationType(viz.type as any)}
                      className={`p-3 rounded-lg transition-colors flex flex-col items-center space-y-2 ${
                        visualizationType === viz.type
                          ? 'bg-blue-600/30 border-2 border-blue-400'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      {viz.icon}
                      <span className="text-sm text-white">{viz.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">エクスポート形式</h3>
                <div className="space-y-2">
                  <button
                    onClick={exportToPDF}
                    className="w-full flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {getExportIcon('PDF')}
                    <span className="text-white">PDF</span>
                    <Download className="w-4 h-4 ml-auto text-gray-400" />
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {getExportIcon('Excel')}
                    <span className="text-white">Excel</span>
                    <Download className="w-4 h-4 ml-auto text-gray-400" />
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="w-full flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {getExportIcon('CSV')}
                    <span className="text-white">CSV</span>
                    <Download className="w-4 h-4 ml-auto text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Report Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* Report Name */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">レポート設定</h3>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="レポート名を入力"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Field Selection */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <GripVertical className="w-5 h-5 mr-2" />
                  フィールド選択
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">利用可能フィールド</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {getCurrentDataSource()?.fields.map((field) => (
                        <button
                          key={field.id}
                          onClick={() => {
                            if (!selectedFields.includes(field.id)) {
                              setSelectedFields([...selectedFields, field.id]);
                            }
                          }}
                          className="w-full text-left p-2 bg-white/5 rounded hover:bg-white/10 transition-colors"
                        >
                          <span className="text-white text-sm">{field.displayName}</span>
                          <span className="text-xs text-gray-400 ml-2">({field.dataType})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">選択済みフィールド</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedFields.map((fieldId) => {
                        const field = getCurrentDataSource()?.fields.find(f => f.id === fieldId);
                        return (
                          <div
                            key={fieldId}
                            className="flex items-center justify-between p-2 bg-blue-600/20 rounded"
                          >
                            <span className="text-white text-sm">{field?.displayName}</span>
                            <button
                              onClick={() => setSelectedFields(selectedFields.filter(f => f !== fieldId))}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    フィルター設定
                  </h3>
                  <button
                    onClick={addFilter}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>追加</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {filters.map((filter) => (
                    <div key={filter.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <select className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm">
                        <option value="">フィールドを選択</option>
                        {getCurrentDataSource()?.fields.map((field) => (
                          <option key={field.id} value={field.id}>{field.displayName}</option>
                        ))}
                      </select>
                      <select className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm">
                        <option value="equals">等しい</option>
                        <option value="contains">含む</option>
                        <option value="greater_than">より大きい</option>
                        <option value="less_than">より小さい</option>
                        <option value="between">範囲</option>
                        <option value="in">いずれか</option>
                      </select>
                      <input
                        type="text"
                        placeholder="値"
                        className="flex-1 px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-gray-400"
                      />
                      <button
                        onClick={() => removeFilter(filter.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {filters.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      フィルターが設定されていません
                    </div>
                  )}
                </div>
              </div>

              {/* Scheduling */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    スケジュール設定
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsScheduling(!isScheduling)}
                      className={`px-3 py-1 rounded transition-colors ${
                        isScheduling
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {isScheduling ? '有効' : '無効'}
                    </button>
                    {isScheduling && (
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        詳細設定
                      </button>
                    )}
                  </div>
                </div>
                {isScheduling && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">実行頻度</label>
                        <select 
                          value={scheduleSettings.frequency}
                          onChange={(e) => setScheduleSettings(prev => ({ ...prev, frequency: e.target.value as any }))}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        >
                          <option value="daily">毎日</option>
                          <option value="weekly">毎週</option>
                          <option value="monthly">毎月</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">実行時間</label>
                        <input
                          type="time"
                          value={scheduleSettings.time}
                          onChange={(e) => setScheduleSettings(prev => ({ ...prev, time: e.target.value }))}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        />
                      </div>
                    </div>

                    {scheduleSettings.frequency === 'weekly' && (
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">曜日</label>
                        <select
                          value={scheduleSettings.dayOfWeek}
                          onChange={(e) => setScheduleSettings(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        >
                          <option value={1}>月曜日</option>
                          <option value={2}>火曜日</option>
                          <option value={3}>水曜日</option>
                          <option value={4}>木曜日</option>
                          <option value={5}>金曜日</option>
                          <option value={6}>土曜日</option>
                          <option value={7}>日曜日</option>
                        </select>
                      </div>
                    )}

                    {scheduleSettings.frequency === 'monthly' && (
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">実行日</label>
                        <select
                          value={scheduleSettings.dayOfMonth}
                          onChange={(e) => setScheduleSettings(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        >
                          {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>{day}日</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">配信形式</label>
                      <select
                        value={scheduleSettings.format}
                        onChange={(e) => setScheduleSettings(prev => ({ ...prev, format: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      >
                        <option value="PDF">PDF</option>
                        <option value="Excel">Excel</option>
                        <option value="CSV">CSV</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">配信先メールアドレス</label>
                      <div className="space-y-2">
                        {scheduleSettings.recipients.map((email, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => {
                                const newRecipients = [...scheduleSettings.recipients];
                                newRecipients[index] = e.target.value;
                                setScheduleSettings(prev => ({ ...prev, recipients: newRecipients }));
                              }}
                              placeholder="メールアドレスを入力"
                              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400"
                            />
                            {scheduleSettings.recipients.length > 1 && (
                              <button
                                onClick={() => {
                                  const newRecipients = scheduleSettings.recipients.filter((_, i) => i !== index);
                                  setScheduleSettings(prev => ({ ...prev, recipients: newRecipients }));
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            setScheduleSettings(prev => ({ 
                              ...prev, 
                              recipients: [...prev.recipients, ''] 
                            }));
                          }}
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>配信先を追加</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="notifications"
                        checked={scheduleSettings.notifications}
                        onChange={(e) => setScheduleSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="notifications" className="text-sm text-gray-300">
                        実行完了時にSlack/Teams通知を送信する
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Share Options */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  共有・配信設定
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <button className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors flex flex-col items-center space-y-2">
                    <Users className="w-6 h-6 text-blue-400" />
                    <span className="text-sm text-white">Teams共有</span>
                  </button>
                  <button className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors flex flex-col items-center space-y-2">
                    <Mail className="w-6 h-6 text-green-400" />
                    <span className="text-sm text-white">メール配信</span>
                  </button>
                  <button className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors flex flex-col items-center space-y-2">
                    <Bell className="w-6 h-6 text-yellow-400" />
                    <span className="text-sm text-white">通知設定</span>
                  </button>
                </div>
              </div>

              {/* Visualization Preview */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  可視化プレビュー
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-300 mb-2">
                    選択された可視化タイプ: <span className="text-white font-medium">
                      {visualizationType === 'table' ? 'テーブル' : 
                       visualizationType === 'bar' ? '棒グラフ' : 
                       visualizationType === 'line' ? '線グラフ' : 
                       visualizationType === 'pie' ? '円グラフ' : visualizationType}
                    </span>
                  </p>
                  {selectedFields.length > 0 && (
                    <p className="text-sm text-gray-300">
                      選択フィールド数: <span className="text-white font-medium">{selectedFields.length}</span>
                    </p>
                  )}
                </div>
                <MockChart type={visualizationType} height="h-48" />
                {selectedFields.length === 0 && (
                  <div className="mt-4 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                    <p className="text-yellow-300 text-sm">
                      フィールドを選択するとプレビューが表示されます
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <div key={template.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/15 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  {template.icon}
                  <span className="text-xs px-2 py-1 bg-blue-600/30 text-blue-300 rounded">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{template.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Database className="w-4 h-4" />
                    <span>{template.dataSource}</span>
                  </div>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                    使用
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Saved Reports Tab */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {savedReports.map((report) => (
              <div key={report.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{report.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        report.status === 'active'
                          ? 'bg-green-600/30 text-green-300'
                          : report.status === 'scheduled'
                          ? 'bg-blue-600/30 text-blue-300'
                          : 'bg-gray-600/30 text-gray-300'
                      }`}>
                        {report.status === 'active' ? '有効' : report.status === 'scheduled' ? 'スケジュール済み' : 'ドラフト'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{report.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>作成日: {report.createdAt}</span>
                      {report.lastRun && <span>最終実行: {report.lastRun}</span>}
                      <div className="flex items-center space-x-1">
                        {getVisualizationIcon(report.visualizationType)}
                        <span>{report.visualizationType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-blue-400 hover:text-blue-300">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-400 hover:text-green-300">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-yellow-400 hover:text-yellow-300">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">レポート実行履歴</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-gray-300 pb-3">レポート名</th>
                    <th className="text-left text-gray-300 pb-3">実行日時</th>
                    <th className="text-left text-gray-300 pb-3">ステータス</th>
                    <th className="text-left text-gray-300 pb-3">実行時間</th>
                    <th className="text-left text-gray-300 pb-3">レコード数</th>
                    <th className="text-right text-gray-300 pb-3">操作</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {[
                    {
                      name: '月次インシデントレポート',
                      executedAt: '2024-02-01 09:00:00',
                      status: '成功',
                      duration: '2.3秒',
                      records: '1,234件'
                    },
                    {
                      name: '変更成功率分析',
                      executedAt: '2024-01-31 18:30:00',
                      status: '成功',
                      duration: '1.8秒',
                      records: '567件'
                    },
                    {
                      name: 'サービス性能レポート',
                      executedAt: '2024-01-31 15:45:00',
                      status: 'エラー',
                      duration: '0.5秒',
                      records: '0件'
                    }
                  ].map((execution, index) => (
                    <tr key={index} className="border-b border-white/10">
                      <td className="py-3 text-white">{execution.name}</td>
                      <td className="py-3 text-gray-300">{execution.executedAt}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          execution.status === '成功'
                            ? 'bg-green-600/30 text-green-300'
                            : 'bg-red-600/30 text-red-300'
                        }`}>
                          {execution.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">{execution.duration}</td>
                      <td className="py-3 text-gray-300">{execution.records}</td>
                      <td className="py-3 text-right">
                        <button className="text-blue-400 hover:text-blue-300 mr-2">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="text-green-400 hover:text-green-300">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomReports;