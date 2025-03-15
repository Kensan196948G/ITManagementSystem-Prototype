import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// インシデント状態コンポーネント
const IncidentStatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case '未対応':
        return 'bg-danger-100 text-danger-800';
      case '対応中':
        return 'bg-warning-100 text-warning-800';
      case '解決済み':
        return 'bg-success-100 text-success-800';
      case 'クローズ':
        return 'bg-secondary-100 text-secondary-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  return (
    <span className={`badge ${getStatusColor(status)}`}>{status}</span>
  );
};

// インシデント優先度コンポーネント
const IncidentPriorityBadge = ({ priority }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case '緊急':
        return 'bg-danger-100 text-danger-800';
      case '高':
        return 'bg-warning-100 text-warning-800';
      case '中':
        return 'bg-primary-100 text-primary-800';
      case '低':
        return 'bg-secondary-100 text-secondary-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  return (
    <span className={`badge ${getPriorityColor(priority)}`}>{priority}</span>
  );
};

const IncidentManagement = () => {
  // 認証コンテキストを使用
  const { currentUser, hasPermission, USER_ROLES } = useAuth();
  
  // システム管理モーダル用の状態
  const [isSystemManagerOpen, setIsSystemManagerOpen] = useState(false);
  const [systemToDelete, setSystemToDelete] = useState(null);
  
  // 現在のユーザーがグローバル管理者かどうかを確認
  const isGlobalAdmin = currentUser && currentUser.role === USER_ROLES.GLOBAL_ADMIN;
  
  // システムリストの管理
  const [systems, setSystems] = useState([
    'Microsoft Entra ID',
    'Exchange Online',
    'SharePoint Online',
    'Teams',
    'ファイルサーバー',
    'DeskNet\'s Neo',
    'Active Directory',
    'VPN',
    'Salesforce'
  ]);
  const [isAddingNewSystem, setIsAddingNewSystem] = useState(false);
  const [newSystemName, setNewSystemName] = useState('');

  // 新規インシデント用の状態
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: '',
    system: '',
    status: '未対応',
    priority: '中',
    assignee: '',
    description: ''
  });

  const [incidents, setIncidents] = useState([
    {
      id: 'INC-2025-0001',
      title: 'Exchange Online同期エラー',
      system: 'Exchange Online',
      status: '対応中',
      priority: '中',
      assignee: '山田太郎',
      created: '2025/03/12 15:23',
      updated: '2025/03/12 16:45',
      description: 'Exchange Onlineの同期が失敗しています。一部メールの配信に遅延が発生しています。'
    },
    {
      id: 'INC-2025-0002',
      title: 'ユーザー認証エラーの増加',
      system: 'Microsoft Entra ID',
      status: '解決済み',
      priority: '高',
      assignee: '鈴木一郎',
      created: '2025/03/11 09:45',
      updated: '2025/03/11 14:23',
      description: 'Microsoft Entra IDでのユーザー認証エラーが通常より増加しています。特に海外からのアクセスで顕著です。'
    },
    {
      id: 'INC-2025-0003',
      title: 'ファイルサーバーパフォーマンス低下',
      system: 'ファイルサーバー',
      status: '解決済み',
      priority: '低',
      assignee: '佐藤次郎',
      created: '2025/03/10 14:12',
      updated: '2025/03/10 16:30',
      description: 'ファイルサーバーのアクセス速度が低下しています。ディスク使用率が90%を超えています。'
    },
    {
      id: 'INC-2025-0004',
      title: 'Entra ID同期エラー',
      system: 'Microsoft Entra ID',
      status: '解決済み',
      priority: '中',
      assignee: '山田太郎',
      created: '2025/03/08 22:36',
      updated: '2025/03/09 09:15',
      description: 'Active DirectoryからEntra IDへの同期が失敗しています。新規ユーザーの追加がクラウドサービスに反映されていません。'
    },
    {
      id: 'INC-2025-0005',
      title: 'DeskNet\'s Neoアクセス障害',
      system: 'DeskNet\'s Neo',
      status: '未対応',
      priority: '緊急',
      assignee: '未割当',
      created: '2025/03/13 18:05',
      updated: '2025/03/13 18:05',
      description: 'DeskNet\'s Neoにアクセスできない状況が発生しています。全社的に影響が出ています。'
    }
  ]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState(null);

  // フィルター適用したインシデントリスト
  const filteredIncidents = incidents.filter(incident => {
    const statusMatch = statusFilter === 'all' || incident.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || incident.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  // インシデント詳細モーダル
  const IncidentDetailModal = () => {
    if (!selectedIncident) return null;

    return (
      <div className="fixed inset-0 z-30 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setSelectedIncident(null)}>
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
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg leading-6 font-medium text-secondary-900">
                      {selectedIncident.title}
                    </h3>
                    <div className="badge bg-secondary-100 text-secondary-800">{selectedIncident.id}</div>
                  </div>
                  
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-secondary-500">システム</p>
                        <p className="font-medium">{selectedIncident.system}</p>
                      </div>
                      <div>
                        <p className="text-sm text-secondary-500">ステータス</p>
                        <IncidentStatusBadge status={selectedIncident.status} />
                      </div>
                      <div>
                        <p className="text-sm text-secondary-500">優先度</p>
                        <IncidentPriorityBadge priority={selectedIncident.priority} />
                      </div>
                      <div>
                        <p className="text-sm text-secondary-500">担当者</p>
                        <p className="font-medium">{selectedIncident.assignee}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-secondary-500">作成日時</p>
                      <p className="font-medium">{selectedIncident.created}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-secondary-500">最終更新</p>
                      <p className="font-medium">{selectedIncident.updated}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-secondary-500">説明</p>
                      <p className="mt-1 text-secondary-700">{selectedIncident.description}</p>
                    </div>
                    
                    <div className="border-t border-secondary-200 pt-4">
                      <p className="text-sm text-secondary-500 mb-2">活動履歴</p>
                      <ul className="space-y-3">
                        <li className="text-sm">
                          <span className="text-secondary-500">2025/03/13 18:22</span> - <span className="font-medium">山田太郎</span>が調査を開始しました。
                        </li>
                        <li className="text-sm">
                          <span className="text-secondary-500">2025/03/13 18:10</span> - インシデントが<span className="font-medium">鈴木一郎</span>によって作成されました。
                        </li>
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
                onClick={() => setSelectedIncident(null)}
              >
                閉じる
              </button>
              <button
                type="button"
                className="btn border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 mt-3 sm:mt-0 w-full sm:w-auto"
                onClick={() => setSelectedIncident(null)}
              >
                編集
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">インシデント管理</h1>
        <div className="flex items-center text-primary-600">
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          <span className="text-sm">最終更新: 2025/03/13 18:25</span>
        </div>
      </div>

      {/* フィルター・アクションエリア */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-secondary-500" />
            <select
              className="form-input w-full sm:w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">すべてのステータス</option>
              <option value="未対応">未対応</option>
              <option value="対応中">対応中</option>
              <option value="解決済み">解決済み</option>
              <option value="クローズ">クローズ</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select
              className="form-input w-full sm:w-auto"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">すべての優先度</option>
              <option value="緊急">緊急</option>
              <option value="高">高</option>
              <option value="中">中</option>
              <option value="低">低</option>
            </select>
          </div>
        </div>
        <div>
          <button 
            className="btn btn-primary w-full sm:w-auto"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            新規インシデント作成
          </button>
        </div>
      </div>

      {/* 新規インシデント作成モーダル */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-30 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsCreateModalOpen(false)}>
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
                    <h3 className="text-lg leading-6 font-medium text-secondary-900">
                      新規インシデント作成
                    </h3>
                    
                    <div className="mt-4">
                      <form className="space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-secondary-700">タイトル</label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            className="mt-1 block w-full border border-secondary-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            required
                            value={newIncident.title}
                            onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="system" className="block text-sm font-medium text-secondary-700">対象システム</label>
                          <div className="mt-1 flex items-center">
                            <div className="w-full flex">
                              <select
                                id="system"
                                name="system"
                                className="block w-full bg-white border border-secondary-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                value={newIncident.system}
                                onChange={(e) => setNewIncident({...newIncident, system: e.target.value})}
                                required
                              >
                                <option value="" disabled>システムを選択してください</option>
                                {systems.map((system, index) => (
                                  <option key={index} value={system}>{system}</option>
                                ))}
                              </select>
                              
                              {isGlobalAdmin && (
                                <button
                                  type="button"
                                  className="ml-2 inline-flex items-center px-3 py-2 border border-secondary-300 shadow-sm text-sm leading-4 font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none"
                                  onClick={() => setIsSystemManagerOpen(true)}
                                >
                                  管理
                                </button>
                              )}
                            </div>
                          </div>
                          {isGlobalAdmin && (
                            <p className="mt-1 text-xs text-secondary-500">
                              システムの追加・削除は「管理」ボタンから行えます。（グローバル管理者のみ）
                            </p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-secondary-700">ステータス</label>
                            <select
                              id="status"
                              name="status"
                              className="mt-1 block w-full bg-white border border-secondary-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              value={newIncident.status}
                              onChange={(e) => setNewIncident({...newIncident, status: e.target.value})}
                            >
                              <option value="未対応">未対応</option>
                              <option value="対応中">対応中</option>
                              <option value="解決済み">解決済み</option>
                              <option value="クローズ">クローズ</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-secondary-700">優先度</label>
                            <select
                              id="priority"
                              name="priority"
                              className="mt-1 block w-full bg-white border border-secondary-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              value={newIncident.priority}
                              onChange={(e) => setNewIncident({...newIncident, priority: e.target.value})}
                            >
                              <option value="緊急">緊急</option>
                              <option value="高">高</option>
                              <option value="中">中</option>
                              <option value="低">低</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="assignee" className="block text-sm font-medium text-secondary-700">担当者</label>
                          <input
                            type="text"
                            name="assignee"
                            id="assignee"
                            className="mt-1 block w-full border border-secondary-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={newIncident.assignee}
                            onChange={(e) => setNewIncident({...newIncident, assignee: e.target.value})}
                            placeholder="未割当（空欄の場合）"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-secondary-700">説明</label>
                          <textarea
                            id="description"
                            name="description"
                            rows={4}
                            className="mt-1 block w-full border border-secondary-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={newIncident.description}
                            onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                          ></textarea>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-primary w-full sm:w-auto sm:ml-3"
                  onClick={() => {
                    // バリデーション
                    if (!newIncident.title || !newIncident.system) {
                      alert('タイトルと対象システムは必須です');
                      return;
                    }
                    
                    // 新規インシデントの作成
                    const now = new Date();
                    const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    
                    const newId = `INC-2025-${String(incidents.length + 1).padStart(4, '0')}`;
                    
                    const createdIncident = {
                      id: newId,
                      title: newIncident.title,
                      system: newIncident.system,
                      status: newIncident.status,
                      priority: newIncident.priority,
                      assignee: newIncident.assignee || '未割当',
                      created: dateStr,
                      updated: dateStr,
                      description: newIncident.description
                    };
                    
                    // インシデントリストに追加
                    setIncidents([createdIncident, ...incidents]);
                    
                    // モーダルを閉じて入力値をリセット
                    setIsCreateModalOpen(false);
                    setNewIncident({
                      title: '',
                      system: '',
                      status: '未対応',
                      priority: '中',
                      assignee: '',
                      description: ''
                    });
                  }}
                >
                  作成
                </button>
                <button
                  type="button"
                  className="btn border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 mt-3 sm:mt-0 w-full sm:w-auto"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* インシデント一覧 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                タイトル
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                システム
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                ステータス
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                優先度
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                担当者
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                作成日時
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                詳細
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {filteredIncidents.map((incident) => (
              <tr 
                key={incident.id} 
                className="hover:bg-secondary-50 cursor-pointer"
                onClick={() => setSelectedIncident(incident)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                  {incident.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {incident.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  {incident.system}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <IncidentStatusBadge status={incident.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <IncidentPriorityBadge priority={incident.priority} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  {incident.assignee}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  {incident.created}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  <button 
                    className="px-3 py-1 bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation(); // 行のクリックイベントを阻止
                      setSelectedIncident(incident);
                    }}
                  >
                    詳細を表示
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* インシデント詳細モーダル */}
      <IncidentDetailModal />

      {/* システム管理モーダル - グローバル管理者のみ表示 */}
      {isSystemManagerOpen && isGlobalAdmin && (
        <div className="fixed inset-0 z-40 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsSystemManagerOpen(false)}>
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
                    <h3 className="text-lg leading-6 font-medium text-secondary-900 flex items-center">
                      <span className="mr-2">システム管理</span>
                      <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                        グローバル管理者専用
                      </span>
                    </h3>
                    
                    <p className="mt-2 text-sm text-secondary-500">
                      インシデント管理で使用するシステムの追加・削除を行えます。
                    </p>
                    
                    <div className="mt-4 space-y-4">
                      {/* 新規システム追加フォーム */}
                      <div className="bg-secondary-50 p-3 rounded-md">
                        <h4 className="text-sm font-medium text-secondary-700 mb-2">新規システム追加</h4>
                        <div className="flex">
                          <input
                            type="text"
                            className="block w-full border border-secondary-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="新しいシステム名"
                            value={newSystemName}
                            onChange={(e) => setNewSystemName(e.target.value)}
                          />
                          <button
                            type="button"
                            className="ml-2 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                            onClick={() => {
                              if (newSystemName.trim()) {
                                // 重複チェック
                                if (!systems.includes(newSystemName.trim())) {
                                  // 新しいシステムを追加
                                  const updatedSystems = [...systems, newSystemName.trim()];
                                  setSystems(updatedSystems);
                                  
                                  // 入力欄をリセット
                                  setNewSystemName('');
                                } else {
                                  alert('このシステムは既に存在します');
                                }
                              } else {
                                alert('システム名を入力してください');
                              }
                            }}
                          >
                            追加
                          </button>
                        </div>
                      </div>
                      
                      {/* システム一覧 */}
                      <div>
                        <h4 className="text-sm font-medium text-secondary-700 mb-2">システム一覧</h4>
                        <div className="border border-secondary-200 rounded-md divide-y divide-secondary-200 max-h-80 overflow-y-auto">
                          {systems.map((system, index) => (
                            <div 
                              key={index} 
                              className="px-4 py-3 flex justify-between items-center hover:bg-secondary-50"
                            >
                              <span className="text-sm text-secondary-700">{system}</span>
                              
                              {/* 削除ボタン - 確認用のUIを表示 */}
                              {systemToDelete === system ? (
                                <div className="flex items-center">
                                  <span className="text-xs text-danger-600 mr-2">削除しますか？</span>
                                  <button
                                    type="button"
                                    className="text-xs text-white bg-danger-600 hover:bg-danger-700 px-2 py-1 rounded mr-1"
                                    onClick={() => {
                                      // このシステムを使用しているインシデントがあるかチェック
                                      const incidentsUsingSystem = incidents.filter(
                                        incident => incident.system === system
                                      );
                                      
                                      if (incidentsUsingSystem.length > 0) {
                                        alert(`このシステムは${incidentsUsingSystem.length}件のインシデントで使用されているため削除できません。`);
                                        setSystemToDelete(null);
                                        return;
                                      }
                                      
                                      // 削除処理
                                      const updatedSystems = systems.filter(s => s !== system);
                                      setSystems(updatedSystems);
                                      setSystemToDelete(null);
                                    }}
                                  >
                                    はい
                                  </button>
                                  <button
                                    type="button"
                                    className="text-xs text-secondary-600 bg-secondary-100 hover:bg-secondary-200 px-2 py-1 rounded"
                                    onClick={() => setSystemToDelete(null)}
                                  >
                                    いいえ
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="text-xs text-danger-600 hover:text-danger-800"
                                  onClick={() => setSystemToDelete(system)}
                                >
                                  削除
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-secondary-500">
                          ※ インシデントで使用中のシステムは削除できません
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-primary w-full sm:w-auto"
                  onClick={() => setIsSystemManagerOpen(false)}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* インシデントサマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-secondary-900">未対応</h3>
            <div className="bg-danger-100 text-danger-800 w-8 h-8 rounded-full flex items-center justify-center font-medium">
              {incidents.filter(i => i.status === '未対応').length}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-secondary-900">対応中</h3>
            <div className="bg-warning-100 text-warning-800 w-8 h-8 rounded-full flex items-center justify-center font-medium">
              {incidents.filter(i => i.status === '対応中').length}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-secondary-900">解決済み</h3>
            <div className="bg-success-100 text-success-800 w-8 h-8 rounded-full flex items-center justify-center font-medium">
              {incidents.filter(i => i.status === '解決済み').length}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-secondary-900">合計</h3>
            <div className="bg-primary-100 text-primary-800 w-8 h-8 rounded-full flex items-center justify-center font-medium">
              {incidents.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentManagement;
