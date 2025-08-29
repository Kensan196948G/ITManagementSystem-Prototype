import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, Filter, ChevronLeft, ChevronRight, Plus, ArrowLeft, User, FileText } from 'lucide-react';

interface ScheduledChange {
  id: string;
  rfcId: string;
  title: string;
  type: 'Standard' | 'Normal' | 'Emergency';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Failed' | 'Rolled Back';
  startTime: string;
  endTime: string;
  duration: string;
  assignee: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  riskLevel: 'Low' | 'Medium' | 'High';
  affectedSystems: string[];
  downtime: boolean;
  changeWindow: string;
  dependencies: string[];
}

const ChangeSchedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 7, 28)); // August 2024
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const [filterType, setFilterType] = useState('All');
  const [showConflicts, setShowConflicts] = useState(false);
  const [selectedChange, setSelectedChange] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChange, setNewChange] = useState({
    title: '',
    rfcId: '',
    type: 'Standard' as 'Standard' | 'Normal' | 'Emergency',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    assignee: '',
    priority: 'Medium' as 'Critical' | 'High' | 'Medium' | 'Low',
    riskLevel: 'Low' as 'Low' | 'Medium' | 'High',
    affectedSystems: [] as string[],
    downtime: false,
    changeWindow: 'Standard Window',
    dependencies: [] as string[],
    description: '',
    backoutPlan: '',
    testPlan: ''
  });

  const mockScheduledChanges: ScheduledChange[] = [
    {
      id: 'CHG-2024-001',
      rfcId: 'RFC-2024-001',
      title: 'データベースサーバーメモリ増設',
      type: 'Normal',
      status: 'Scheduled',
      startTime: '2024-09-01 02:00',
      endTime: '2024-09-01 04:00',
      duration: '2時間',
      assignee: '山田 次郎',
      priority: 'High',
      riskLevel: 'Medium',
      affectedSystems: ['Database Server', 'Web Application', 'API Service'],
      downtime: true,
      changeWindow: 'Maintenance Window',
      dependencies: []
    },
    {
      id: 'CHG-2024-002',
      rfcId: 'RFC-2024-002',
      title: 'メールサーバーセキュリティパッチ',
      type: 'Emergency',
      status: 'In Progress',
      startTime: '2024-08-28 20:00',
      endTime: '2024-08-28 21:00',
      duration: '1時間',
      assignee: '高橋 美咲',
      priority: 'Critical',
      riskLevel: 'Low',
      affectedSystems: ['Email Server'],
      downtime: false,
      changeWindow: 'Emergency',
      dependencies: []
    },
    {
      id: 'CHG-2024-003',
      rfcId: 'RFC-2024-005',
      title: 'ファイアウォール設定更新',
      type: 'Standard',
      status: 'Scheduled',
      startTime: '2024-08-30 23:00',
      endTime: '2024-08-31 01:00',
      duration: '2時間',
      assignee: '田中 太郎',
      priority: 'Medium',
      riskLevel: 'Low',
      affectedSystems: ['Network Infrastructure'],
      downtime: false,
      changeWindow: 'Standard Window',
      dependencies: []
    },
    {
      id: 'CHG-2024-004',
      rfcId: 'RFC-2024-006',
      title: 'Webサーバー負荷分散設定',
      type: 'Normal',
      status: 'Scheduled',
      startTime: '2024-09-01 03:00',
      endTime: '2024-09-01 05:00',
      duration: '2時間',
      assignee: '鈴木 一郎',
      priority: 'High',
      riskLevel: 'High',
      affectedSystems: ['Web Server', 'Load Balancer'],
      downtime: true,
      changeWindow: 'Maintenance Window',
      dependencies: ['CHG-2024-001']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'text-blue-600 bg-blue-100';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100';
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Failed': return 'text-red-600 bg-red-100';
      case 'Rolled Back': return 'text-orange-600 bg-orange-100';
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const isChangeOnDate = (change: ScheduledChange, date: Date) => {
    const changeDate = new Date(change.startTime);
    return changeDate.toDateString() === date.toDateString();
  };

  const getChangesForDate = (date: Date) => {
    return mockScheduledChanges.filter(change => isChangeOnDate(change, date));
  };

  const hasConflict = (change: ScheduledChange) => {
    const changeStart = new Date(change.startTime);
    const changeEnd = new Date(change.endTime);
    
    return mockScheduledChanges.some(otherChange => {
      if (otherChange.id === change.id) return false;
      
      const otherStart = new Date(otherChange.startTime);
      const otherEnd = new Date(otherChange.endTime);
      
      // Check for time overlap and system overlap
      const timeOverlap = (changeStart < otherEnd && changeEnd > otherStart);
      const systemOverlap = change.affectedSystems.some(system => 
        otherChange.affectedSystems.includes(system)
      );
      
      return timeOverlap && systemOverlap;
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">変更スケジュール</h1>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          変更をスケジュール
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今週の変更</p>
              <p className="text-2xl font-bold text-blue-600">12</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
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
              <p className="text-sm text-gray-600">競合検出</p>
              <p className="text-2xl font-bold text-yellow-600">1</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">成功率</p>
              <p className="text-2xl font-bold text-green-600">96%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* コントロールパネル */}
      <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 日付ナビゲーション */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 min-w-48 text-center">
              {formatDate(currentDate)}
            </h2>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* ビューモード切替 */}
          <div className="flex items-center space-x-2">
            {['day', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === mode
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {mode === 'day' ? '日' : mode === 'week' ? '週' : '月'}
              </button>
            ))}
          </div>

          {/* フィルター */}
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/50"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">すべてのタイプ</option>
              <option value="Emergency">緊急</option>
              <option value="Normal">通常</option>
              <option value="Standard">標準</option>
            </select>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                checked={showConflicts}
                onChange={(e) => setShowConflicts(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">競合のみ表示</span>
            </label>
          </div>
        </div>
      </div>

      {/* メインコンテンツ - 条件によって表示を切り替え */}
      {showCreateForm ? (
        /* 変更作成フォーム */
        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">新しい変更をスケジュール</h2>
            <button 
              onClick={() => {
                setShowCreateForm(false);
                setNewChange({
                  title: '',
                  rfcId: '',
                  type: 'Standard',
                  startDate: '',
                  startTime: '',
                  endDate: '',
                  endTime: '',
                  assignee: '',
                  priority: 'Medium',
                  riskLevel: 'Low',
                  affectedSystems: [],
                  downtime: false,
                  changeWindow: 'Standard Window',
                  dependencies: [],
                  description: '',
                  backoutPlan: '',
                  testPlan: ''
                });
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左側 - 基本情報 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  変更タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newChange.title}
                  onChange={(e) => setNewChange({...newChange, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="例: データベースサーバーメモリ増設"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RFC ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newChange.rfcId}
                  onChange={(e) => setNewChange({...newChange, rfcId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="例: RFC-2024-001"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    変更タイプ
                  </label>
                  <select
                    value={newChange.type}
                    onChange={(e) => setNewChange({...newChange, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Standard">標準</option>
                    <option value="Normal">通常</option>
                    <option value="Emergency">緊急</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    優先度
                  </label>
                  <select
                    value={newChange.priority}
                    onChange={(e) => setNewChange({...newChange, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Low">低</option>
                    <option value="Medium">中</option>
                    <option value="High">高</option>
                    <option value="Critical">緊急</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    開始日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newChange.startDate}
                    onChange={(e) => setNewChange({...newChange, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    開始時刻 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={newChange.startTime}
                    onChange={(e) => setNewChange({...newChange, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    終了日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newChange.endDate}
                    onChange={(e) => setNewChange({...newChange, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    終了時刻 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={newChange.endTime}
                    onChange={(e) => setNewChange({...newChange, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  担当者 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newChange.assignee}
                  onChange={(e) => setNewChange({...newChange, assignee: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="例: 田中 太郎"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    リスクレベル
                  </label>
                  <select
                    value={newChange.riskLevel}
                    onChange={(e) => setNewChange({...newChange, riskLevel: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Low">低</option>
                    <option value="Medium">中</option>
                    <option value="High">高</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    変更ウィンドウ
                  </label>
                  <select
                    value={newChange.changeWindow}
                    onChange={(e) => setNewChange({...newChange, changeWindow: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Standard Window">標準ウィンドウ</option>
                    <option value="Maintenance Window">メンテナンスウィンドウ</option>
                    <option value="Emergency">緊急</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newChange.downtime}
                  onChange={(e) => setNewChange({...newChange, downtime: e.target.checked})}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">ダウンタイムを伴う</label>
              </div>
            </div>

            {/* 右側 - 詳細情報 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  影響するシステム
                </label>
                <input
                  type="text"
                  placeholder="システム名を入力してEnterで追加"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      setNewChange({
                        ...newChange, 
                        affectedSystems: [...newChange.affectedSystems, e.currentTarget.value]
                      });
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {newChange.affectedSystems.map((system, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                      {system}
                      <button
                        onClick={() => setNewChange({
                          ...newChange,
                          affectedSystems: newChange.affectedSystems.filter((_, i) => i !== index)
                        })}
                        className="ml-1 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  変更内容の説明 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newChange.description}
                  onChange={(e) => setNewChange({...newChange, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="変更の詳細な説明を入力してください"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  バックアウトプラン <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newChange.backoutPlan}
                  onChange={(e) => setNewChange({...newChange, backoutPlan: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="変更に失敗した場合の復旧手順を入力してください"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  テストプラン <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newChange.testPlan}
                  onChange={(e) => setNewChange({...newChange, testPlan: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="変更の妥当性を確認するテスト手順を入力してください"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  依存関係
                </label>
                <input
                  type="text"
                  placeholder="依存する変更IDを入力してEnterで追加"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      setNewChange({
                        ...newChange, 
                        dependencies: [...newChange.dependencies, e.currentTarget.value]
                      });
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {newChange.dependencies.map((dep, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {dep}
                      <button
                        onClick={() => setNewChange({
                          ...newChange,
                          dependencies: newChange.dependencies.filter((_, i) => i !== index)
                        })}
                        className="ml-1 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={() => {
                alert('変更が正常にスケジュールされました！');
                setShowCreateForm(false);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              変更をスケジュール
            </button>
          </div>
        </div>
      ) : selectedChange ? (
        /* 詳細ビュー */
        (() => {
          const selectedChangeData = mockScheduledChanges.find(change => change.id === selectedChange);
          if (!selectedChangeData) return null;

          return (
            <div className="space-y-6">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedChangeData.title}
                  </h2>
                  <button 
                    onClick={() => setSelectedChange(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center shadow-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    一覧に戻る
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* 変更詳細 */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">変更詳細</h3>
                      <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(selectedChangeData.type)}`}>
                            {selectedChangeData.type}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedChangeData.status)}`}>
                            {selectedChangeData.status}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(selectedChangeData.priority)}`}>
                            {selectedChangeData.priority}
                          </span>
                          {hasConflict(selectedChangeData) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-red-600 bg-red-100">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              競合あり
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">{selectedChangeData.rfcId}</div>
                      </div>
                    </div>

                    {/* 影響するシステム */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">影響するシステム</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedChangeData.affectedSystems.map(system => (
                          <span key={system} className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-800 text-sm rounded-lg">
                            {system}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 依存関係 */}
                    {selectedChangeData.dependencies.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">依存関係</h3>
                        <div className="space-y-2">
                          {selectedChangeData.dependencies.map(dep => (
                            <div key={dep} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                              <span className="font-medium text-yellow-800">依存: </span>
                              <span className="text-yellow-700">{dep}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* スケジュール情報 */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">スケジュール</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">開始時刻:</span>
                          <span className="font-medium">{selectedChangeData.startTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">終了時刻:</span>
                          <span className="font-medium">{selectedChangeData.endTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">予定時間:</span>
                          <span className="font-medium">{selectedChangeData.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">変更ウィンドウ:</span>
                          <span className="font-medium">{selectedChangeData.changeWindow}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ダウンタイム:</span>
                          <span className={`font-medium ${selectedChangeData.downtime ? 'text-red-600' : 'text-green-600'}`}>
                            {selectedChangeData.downtime ? 'あり' : 'なし'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 担当者情報 */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">担当者</h3>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-600 mr-2" />
                          <span className="font-medium">{selectedChangeData.assignee}</span>
                        </div>
                      </div>
                    </div>

                    {/* リスク情報 */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">リスク評価</h3>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">リスクレベル: </span>
                        <span className={`font-medium ${getRiskColor(selectedChangeData.riskLevel)}`}>
                          {selectedChangeData.riskLevel}
                        </span>
                      </div>
                    </div>

                    {/* アクション */}
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        編集
                      </button>
                      <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                        再スケジュール
                      </button>
                      <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        キャンセル
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        /* メインビュー - カレンダーと変更一覧 */
        <>
          {/* カレンダービュー */}
          {viewMode === 'week' && (
            <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 overflow-hidden">
              <div className="grid grid-cols-8 bg-gray-50">
                <div className="p-4 font-medium text-gray-700 border-r">時間</div>
                {getWeekDates(currentDate).map((date, index) => (
                  <div key={index} className="p-4 text-center border-r">
                    <div className="font-medium text-gray-900">
                      {date.toLocaleDateString('ja-JP', { weekday: 'short' })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* 時間スロット */}
              <div className="max-h-96 overflow-y-auto">
                {Array.from({ length: 24 }, (_, hour) => (
                  <div key={hour} className="grid grid-cols-8 border-t">
                    <div className="p-2 text-sm text-gray-600 border-r bg-gray-50">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {getWeekDates(currentDate).map((date, dateIndex) => {
                      const changes = getChangesForDate(date).filter(change => {
                        const changeHour = new Date(change.startTime).getHours();
                        return changeHour === hour;
                      });
                      
                      return (
                        <div key={dateIndex} className="p-1 border-r min-h-16">
                          {changes.map(change => (
                            <div
                              key={change.id}
                              className={`text-xs p-2 mb-1 rounded cursor-pointer transition-colors ${
                                hasConflict(change) 
                                  ? 'bg-red-100 border-red-300 border' 
                                  : 'bg-blue-100 hover:bg-blue-200'
                              }`}
                              title={`${change.title} (${change.startTime} - ${change.endTime})`}
                              onClick={() => setSelectedChange(change.id)}
                            >
                              <div className="font-medium truncate">{change.title}</div>
                              <div className="text-gray-600">{change.duration}</div>
                              {hasConflict(change) && (
                                <div className="text-red-600 text-xs">⚠ 競合</div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 変更一覧 */}
          <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/30">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">スケジュール済み変更</h2>
            <div className="space-y-4">
              {mockScheduledChanges
                .filter(change => !showConflicts || hasConflict(change))
                .map(change => (
                  <div 
                    key={change.id} 
                    className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                      hasConflict(change) 
                        ? 'border-red-300 bg-red-50/50' 
                        : 'border-gray-200 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedChange(change.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{change.title}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(change.type)}`}>
                            {change.type}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(change.status)}`}>
                            {change.status}
                          </span>
                          {hasConflict(change) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-red-600 bg-red-100">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              競合
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{change.rfcId}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(change.priority)}`}>
                        {change.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{change.startTime}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{change.duration}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className={`font-medium ${getRiskColor(change.riskLevel)}`}>
                          リスク: {change.riskLevel}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span>担当: {change.assignee}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {change.affectedSystems.map(system => (
                        <span key={system} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {system}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className={`flex items-center ${change.downtime ? 'text-red-600' : 'text-green-600'}`}>
                          {change.downtime ? <AlertTriangle className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                          {change.downtime ? 'ダウンタイムあり' : 'ダウンタイムなし'}
                        </span>
                        <span className="text-gray-600">変更ウィンドウ: {change.changeWindow}</span>
                        {change.dependencies.length > 0 && (
                          <span className="text-yellow-600">依存関係: {change.dependencies.length}件</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChange(change.id);
                          }}
                          className="px-3 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                        >
                          詳細
                        </button>
                        <button className="px-3 py-1 text-xs text-gray-600 bg-gray-50 rounded hover:bg-gray-100">
                          編集
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChangeSchedule;