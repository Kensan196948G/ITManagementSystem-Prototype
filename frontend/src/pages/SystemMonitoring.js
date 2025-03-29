import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  ArrowPathIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ServerIcon,
  TrashIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// Chart.jsの登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// システムカードコンポーネント
const SystemCard = ({ system, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case '正常': return 'bg-success-100 border-success-200 text-success-800';
      case '警告': return 'bg-warning-100 border-warning-200 text-warning-800';
      case '異常': return 'bg-danger-100 border-danger-200 text-danger-800';
      default: return 'bg-secondary-100 border-secondary-200 text-secondary-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case '正常': return <CheckCircleIcon className="h-5 w-5 text-success-600" />;
      case '警告': return <ExclamationTriangleIcon className="h-5 w-5 text-warning-600" />;
      case '異常': return <XCircleIcon className="h-5 w-5 text-danger-600" />;
      default: return null;
    }
  };

  // デバッグ用: システムデータをコンソールに出力
  console.log('Rendering system:', system.name, system);

  return (
    <div 
      className={`card cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 ${
        getStatusColor(system.status).replace('bg-', 'border-')
      }`}
      onClick={() => onClick(system)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <ServerIcon className="h-6 w-6 text-secondary-500 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-secondary-900">{system.name}</h3>
            <p className="text-sm text-secondary-500">{system.description}</p>
          </div>
        </div>
        <div className="flex items-center">
          <span className={`badge mr-2 ${getStatusColor(system.status)}`}>
            {system.status}
          </span>
          <ChevronRightIcon className="h-5 w-5 text-secondary-400" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 pt-3 border-t border-secondary-200">
        {system.name.includes('SkySea') || system.name.includes('Client View') ? (
          <>
            <div className="text-center">
              <p className="text-xs text-secondary-500">クライアント数</p>
              <p className="font-medium text-secondary-700">
                {system.totalClients || 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-secondary-500">違反件数</p>
              <p className={`font-medium ${system.violations > 0 ? 'text-danger-600' : 'text-secondary-700'}`}>
                {system.violations || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-secondary-500">最終更新</p>
              <p className="font-medium text-secondary-700">{system.lastUpdated || 'N/A'}</p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <p className="text-xs text-secondary-500">CPU</p>
              <p className={`font-medium ${system.cpu > 80 ? 'text-danger-600' : 'text-secondary-700'}`}>
                {system.cpu}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-secondary-500">メモリ</p>
              <p className={`font-medium ${system.memory > 80 ? 'text-danger-600' : 'text-secondary-700'}`}>
                {system.memory}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-secondary-500">稼働時間</p>
              <p className="font-medium text-secondary-700">{system.uptime}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// モックデータ - 各システム固有の詳細レポートデータ
const systemDetailReports = {
  // ... (既存のシステム詳細レポートデータはそのまま保持)

  // SkySea Client View 詳細レポート
  "SkySea Client View": {
    clients: {
      total: 96,
      updated: 93,
      notUpdated: 3,
      byDepartment: [
        { dept: "営業部", count: 32, updated: 31 },
        { dept: "開発部", count: 28, updated: 27 },
        { dept: "管理部", count: 36, updated: 35 }
      ]
    },
    violations: {
      total: 3,
      byType: [
        { type: "USB違反", count: 2 },
        { type: "アプリ起動", count: 1 }
      ],
      bySeverity: {
        high: 1,
        medium: 1,
        low: 1
      }
    },
    securityStatus: {
      usbControl: "有効",
      appRestriction: "有効",
      screenCapture: "無効",
      lastPolicyUpdate: "2025/03/28"
    }
  }
};

// ... (既存のコンポーネント定義はそのまま保持)

// システムデータ（APIから取得する想定）
const initialSystemsData = [
  {
    id: 1,
    name: 'Microsoft 365',
    description: 'Office 365 クラウドサービス',
    status: '正常',
    cpu: 15,
    memory: 30,
    uptime: '180日間',
    lastChecked: '2025/03/29 15:25',
    ipAddress: 'N/A',
    osVersion: 'Cloud',
    admin: '山田太郎',
    notes: 'ライセンス数: 150'
  },
  {
    id: 2,
    name: 'Active Directory',
    description: 'ユーザー認証システム',
    status: '正常',
    cpu: 45,
    memory: 62,
    uptime: '120日間',
    lastChecked: '2025/03/29 15:26',
    ipAddress: '192.168.1.10',
    osVersion: 'Windows Server 2019',
    admin: '鈴木花子',
    notes: '定期的なバックアップ実施中'
  },
  {
    id: 3,
    name: 'Microsoft Entra ID',
    description: 'クラウドID管理',
    status: '正常',
    cpu: 20,
    memory: 35,
    uptime: '90日間',
    lastChecked: '2025/03/29 15:27',
    ipAddress: 'N/A',
    osVersion: 'Cloud',
    admin: '田中一郎',
    notes: 'MFA有効ユーザー: 95%'
  },
  {
    id: 4,
    name: 'Exchange Online',
    description: 'クラウドメールサービス',
    status: '正常',
    cpu: 25,
    memory: 40,
    uptime: '90日間',
    lastChecked: '2025/03/29 15:28',
    ipAddress: 'N/A',
    osVersion: 'Cloud',
    admin: '佐藤次郎',
    notes: 'メールボックス数: 120'
  },
  {
    id: 5,
    name: 'HENGEOINE',
    description: 'ネットワーク監視システム',
    status: '正常',
    cpu: 35,
    memory: 50,
    uptime: '60日間',
    lastChecked: '2025/03/29 15:29',
    ipAddress: '192.168.1.20',
    osVersion: 'Windows Server 2022',
    admin: '高橋健太',
    notes: '監視デバイス数: 45'
  },
  {
    id: 6,
    name: 'DirectCloud',
    description: '仮想デスクトップ基盤',
    status: '警告',
    cpu: 65,
    memory: 75,
    uptime: '45日間',
    lastChecked: '2025/03/29 15:30',
    ipAddress: '192.168.1.21',
    osVersion: 'Windows Server 2022',
    admin: '伊藤美咲',
    notes: 'セッション数: 32/40'
  },
  {
    id: 7,
    name: 'ファイルサーバー',
    description: '社内ファイル共有',
    status: '正常',
    cpu: 32,
    memory: 45,
    uptime: '60日間',
    lastChecked: '2025/03/29 15:31',
    ipAddress: '192.168.1.12',
    osVersion: 'Windows Server 2016',
    admin: '渡辺翔',
    notes: 'ストレージ使用率70%'
  },
  {
    id: 8,
    name: 'SkySea Client View',
    description: 'クライアント資産＆セキュリティ監視',
    status: '正常',
    totalClients: 96,
    violations: 3,
    lastUpdated: '2025/03/28',
    uptime: '30日間',
    lastChecked: '2025/03/29 15:32',
    ipAddress: '192.168.1.25',
    osVersion: 'N/A',
    admin: '中村優子',
    notes: 'USB違反2件、アプリ起動違反1件を検出'
  }
];

// 新規システム追加モーダルコンポーネント
const AddSystemModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: '正常',
    cpu: 0,
    memory: 0,
    uptime: '',
    ipAddress: '',
    osVersion: '',
    admin: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-secondary-900">新規システム追加</h3>
          <button onClick={onClose} className="text-secondary-500 hover:text-secondary-700">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">システム名</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">説明</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">ステータス</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="正常">正常</option>
                  <option value="警告">警告</option>
                  <option value="異常">異常</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">IPアドレス</label>
                <input
                  type="text"
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">CPU使用率 (%)</label>
                <input
                  type="number"
                  name="cpu"
                  value={formData.cpu}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="input input-bordered w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">メモリ使用率 (%)</label>
                <input
                  type="number"
                  name="memory"
                  value={formData.memory}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">管理者</label>
              <input
                type="text"
                name="admin"
                value={formData.admin}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">備考</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="textarea textarea-bordered w-full"
                rows="3"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// システム削除モーダルコンポーネント
const DeleteSystemModal = ({ isOpen, onClose, onDelete, systems }) => {
  const [selectedSystemId, setSelectedSystemId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSystemId) {
      onDelete(selectedSystemId);
      onClose();
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-secondary-900">システム削除</h3>
          <button onClick={onClose} className="text-secondary-500 hover:text-secondary-700">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">削除するシステム</label>
              <select
                value={selectedSystemId}
                onChange={(e) => setSelectedSystemId(e.target.value)}
                className="select select-bordered w-full"
                required
              >
                <option value="">選択してください</option>
                {systems.map(system => (
                  <option key={system.id} value={system.id}>
                    {system.name} ({system.description})
                  </option>
                ))}
              </select>
            </div>
            
            {selectedSystemId && (
              <div className="bg-danger-50 border-l-4 border-danger-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-danger-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-danger-700">
                      このシステムを削除すると、関連するすべてのデータが失われます。この操作は元に戻せません。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              キャンセル
            </button>
            <button 
              type="submit" 
              className="btn btn-danger"
              disabled={!selectedSystemId}
            >
              削除
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SystemMonitoring = () => {
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPerformanceReport, setShowPerformanceReport] = useState(false);
  const [showAddSystemModal, setShowAddSystemModal] = useState(false);
  const [showDeleteSystemModal, setShowDeleteSystemModal] = useState(false);
  const [systemsData, setSystemsData] = useState(initialSystemsData);

  const handleAddSystem = (newSystem) => {
    setSystemsData([...systemsData, {
      ...newSystem,
      id: Math.max(...systemsData.map(s => s.id)) + 1
    }]);
  };

  const handleDeleteSystem = (systemId) => {
    setSystemsData(systemsData.filter(s => s.id !== systemId));
  };

  // ... (既存のロジックはそのまま保持)

  const [selectedTab, setSelectedTab] = useState('overview');

  // システム詳細パネルコンポーネント
  const SystemDetailPanel = ({ system }) => {
    if (!system) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-secondary-900">システム詳細</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setSelectedTab('overview')}
              className={`btn btn-sm ${selectedTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            >
              概要
            </button>
            <button 
              onClick={() => setSelectedTab('performance')}
              className={`btn btn-sm ${selectedTab === 'performance' ? 'btn-primary' : 'btn-secondary'}`}
            >
              パフォーマンス
            </button>
          </div>
        </div>

        {selectedTab === 'overview' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-500">システム名</p>
                <p className="font-medium text-secondary-900">{system.name}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">ステータス</p>
                <span className={`badge ${
                  system.status === '正常' ? 'badge-success' : 
                  system.status === '警告' ? 'badge-warning' : 'badge-danger'
                }`}>
                  {system.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-secondary-500">説明</p>
              <p className="font-medium text-secondary-900">{system.description}</p>
            </div>

            {system.name === 'SkySea Client View' ? (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-secondary-500">クライアント数</p>
                  <p className="font-medium text-secondary-900">
                    {system.totalClients || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">違反件数</p>
                  <p className={`font-medium ${system.violations > 0 ? 'text-danger-600' : 'text-secondary-900'}`}>
                    {system.violations || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">最終更新</p>
                  <p className="font-medium text-secondary-900">
                    {system.lastUpdated || 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-secondary-500">CPU使用率</p>
                  <p className={`font-medium ${system.cpu > 80 ? 'text-danger-600' : 'text-secondary-900'}`}>
                    {system.cpu}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">メモリ使用率</p>
                  <p className={`font-medium ${system.memory > 80 ? 'text-danger-600' : 'text-secondary-900'}`}>
                    {system.memory}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">稼働時間</p>
                  <p className="font-medium text-secondary-900">{system.uptime}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-500">IPアドレス</p>
                <p className="font-medium text-secondary-900">{system.ipAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">OSバージョン</p>
                <p className="font-medium text-secondary-900">{system.osVersion || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-secondary-500">管理者</p>
              <p className="font-medium text-secondary-900">{system.admin || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-secondary-500">備考</p>
              <p className="font-medium text-secondary-900">{system.notes || 'N/A'}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-64">
              <Line 
                data={{
                  labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                  datasets: [
                    {
                      label: 'CPU使用率 (%)',
                      data: [system.cpu, system.cpu + 5, system.cpu - 3, system.cpu + 2, system.cpu - 1, system.cpu + 4],
                      borderColor: 'rgb(75, 192, 192)',
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      tension: 0.3,
                      borderWidth: 2
                    },
                    {
                      label: 'メモリ使用率 (%)',
                      data: [system.memory, system.memory + 3, system.memory - 2, system.memory + 5, system.memory - 3, system.memory + 1],
                      borderColor: 'rgb(54, 162, 235)',
                      backgroundColor: 'rgba(54, 162, 235, 0.2)',
                      tension: 0.3,
                      borderWidth: 2
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: '#6b7280',
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: '#1f2937',
                      titleColor: '#f9fafb',
                      bodyColor: '#f9fafb',
                      borderColor: '#374151',
                      borderWidth: 1,
                      padding: 12
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        color: '#e5e7eb'
                      },
                      ticks: {
                        color: '#6b7280'
                      }
                    },
                    y: {
                      grid: {
                        color: '#e5e7eb'
                      },
                      ticks: {
                        color: '#6b7280'
                      },
                      min: 0,
                      max: 100
                    }
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary-50 p-4 rounded-lg">
                <p className="text-sm text-secondary-500">平均CPU使用率</p>
                <p className="text-2xl font-bold text-secondary-900">{system.cpu}%</p>
              </div>
              <div className="bg-secondary-50 p-4 rounded-lg">
                <p className="text-sm text-secondary-500">平均メモリ使用率</p>
                <p className="text-2xl font-bold text-secondary-900">{system.memory}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ... (既存のヘッダー部分はそのまま保持) */}



      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左カラム - システムリスト */}
        <div className="lg:col-span-2 space-y-6">
      {/* システム操作ボタン */}
      <div className="flex justify-end space-x-2 mb-4">
        <button 
          onClick={() => setShowAddSystemModal(true)}
          className="btn btn-primary btn-sm"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          新規システム追加
        </button>
        <button 
          onClick={() => setShowDeleteSystemModal(true)}
          className="btn btn-danger btn-sm"
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          システム削除
        </button>
      </div>

      {/* システムカードグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {systemsData.map(system => (
          <SystemCard 
            key={system.id} 
            system={system} 
            onClick={() => {
              setSelectedSystem(system);
              setSelectedTab('overview');
            }}
          />
        ))}
      </div>
        </div>

        {/* 右カラム - システム詳細 */}
        <div className="lg:col-span-1">
          <SystemDetailPanel system={selectedSystem} />
        </div>
      </div>

      {/* モーダルコンポーネント */}
      <AddSystemModal
        isOpen={showAddSystemModal}
        onClose={() => setShowAddSystemModal(false)}
        onAdd={handleAddSystem}
      />
      
      <DeleteSystemModal
        isOpen={showDeleteSystemModal}
        onClose={() => setShowDeleteSystemModal(false)}
        onDelete={handleDeleteSystem}
        systems={systemsData}
      />
    </div>
  );
};

export default SystemMonitoring;
