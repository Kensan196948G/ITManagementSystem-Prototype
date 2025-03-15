import React, { useState } from 'react';
import { 
  ServerIcon, 
  ChartBarIcon, 
  ArrowPathIcon, 
  ClockIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// システムカードコンポーネント
const SystemCard = ({ system, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case '正常':
        return 'bg-success-100 border-success-200 text-success-800';
      case '警告':
        return 'bg-warning-100 border-warning-200 text-warning-800';
      case '異常':
        return 'bg-danger-100 border-danger-200 text-danger-800';
      default:
        return 'bg-secondary-100 border-secondary-200 text-secondary-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case '正常':
        return <CheckCircleIcon className="h-5 w-5 text-success-600" />;
      case '警告':
        return <ExclamationTriangleIcon className="h-5 w-5 text-warning-600" />;
      case '異常':
        return <XCircleIcon className="h-5 w-5 text-danger-600" />;
      default:
        return null;
    }
  };

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
      </div>
    </div>
  );
};

// モックデータ - 各システム固有の詳細レポートデータ
const systemDetailReports = {
  // Microsoft 365 詳細レポート
  "Microsoft 365": {
    services: [
      { name: "Exchange Online", status: "正常", availability: 99.98 },
      { name: "SharePoint Online", status: "正常", availability: 99.99 },
      { name: "Teams", status: "正常", availability: 99.95 },
      { name: "OneDrive for Business", status: "正常", availability: 99.99 },
      { name: "Power Platform", status: "警告", availability: 99.5, issue: "一部リージョンで遅延" }
    ],
    licenses: {
      total: 500,
      assigned: 423,
      available: 77,
      breakdown: [
        { type: "E5", total: 100, assigned: 98 },
        { type: "E3", total: 300, assigned: 280 },
        { type: "F3", total: 100, assigned: 45 }
      ]
    },
    tenantSettings: {
      securityDefaults: "有効",
      mfaRegistration: "必須",
      guestAccess: "制限付き許可",
      lastUpdated: "2025/03/10 15:30"
    }
  },
  
  // Active Directory 詳細レポート
  "Active Directory": {
    replication: {
      status: "正常",
      lastSuccess: "2025/03/14 10:15",
      partners: [
        { partner: "DC01 → DC02", status: "正常", lastSync: "2025/03/14 10:15", latency: "5ms" },
        { partner: "DC02 → DC01", status: "正常", lastSync: "2025/03/14 10:14", latency: "4ms" }
      ]
    },
    dcom: {
      status: "正常",
      services: [
        { name: "RPC Service", status: "実行中" },
        { name: "DCOM Server", status: "実行中" },
        { name: "Remote Registry", status: "実行中" }
      ]
    },
    groupPolicies: {
      applied: 32,
      failing: 0,
      lastRefresh: "2025/03/14 08:00",
      topPolicies: [
        { name: "セキュリティ基本設定", appliedTo: "全ユーザー", status: "正常" },
        { name: "リモートアクセス制限", appliedTo: "IT部門", status: "正常" },
        { name: "ソフトウェア配布", appliedTo: "営業部", status: "正常" }
      ]
    },
    userActivity: {
      created: { today: 2, week: 8, month: 15 },
      deleted: { today: 1, week: 3, month: 7 },
      disabled: { today: 0, week: 2, month: 5 },
      passwordReset: { today: 3, week: 12, month: 35 }
    },
    groupActivity: {
      created: { today: 0, week: 2, month: 5 },
      deleted: { today: 0, week: 1, month: 2 },
      membershipChanges: { today: 5, week: 25, month: 78 },
      securityGroups: 45,
      distributionGroups: 17
    }
  },
  
  // Microsoft Entra ID 詳細レポート
  "Microsoft Entra ID": {
    authentication: {
      successRate: 99.7,
      dailyAuthentications: 1250,
      mfaUsage: 85,
      failedAttempts: 15,
      suspiciousActivities: 2
    },
    conditionalAccess: {
      policies: 12,
      activelyEnforcing: 10,
      reportOnly: 2,
      lastUpdated: "2025/03/12 09:30"
    },
    idProtection: {
      riskDetections: 3,
      riskyUsers: 1,
      vulnerableCredentials: 2,
      alertLevel: "低"
    },
    adSync: {
      lastSyncTime: "2025/03/14 12:30",
      syncStatus: "正常",
      syncCycle: "30分ごと",
      objectsSynced: {
        users: 450,
        groups: 67,
        contacts: 23,
        devices: 380
      },
      syncChanges: {
        added: { users: 2, groups: 0 },
        updated: { users: 8, groups: 1 },
        deleted: { users: 1, groups: 0 }
      },
      syncErrors: 0,
      syncWarnings: 1
    }
  },
  
  // Exchange Online 詳細レポート
  "Exchange Online": {
    mailFlow: {
      inbound: 1850,
      outbound: 920,
      internal: 3400,
      totalDaily: 6170,
      avgDeliveryTime: "45秒",
      delayedMessages: 3
    },
    security: {
      spam: {
        detected: 346,
        quarantined: 340,
        falsePositives: 6,
        detectionRate: 98.5
      },
      malware: {
        detected: 12,
        blocked: 12,
        detectionRate: 100
      },
      phishing: {
        detected: 28,
        blocked: 28,
        detectionRate: 100
      }
    },
    mailboxes: {
      total: 423,
      active: 412,
      inactive: 11,
      averageSize: "6.2 GB",
      largestMailbox: "15.8 GB",
      quotaExceeded: 0
    }
  },
  
  // HENGEOINE 詳細レポート
  "HENGEOINE": {
    authentication: {
      successRate: 99.8,
      dailyLogins: 870,
      activeSessions: 342,
      authMethods: {
        password: 385,
        mfa: 475,
        biometric: 210
      },
      failedLogins: {
        total: 4,
        suspicious: 1,
        locations: ["東京", "大阪", "不明(1)"]
      },
      federationStatus: "正常"
    },
    threats: {
      detected: 35,
      blocked: 35,
      byCategory: {
        malware: 8,
        phishing: 12,
        suspiciousActivity: 15
      },
      severity: {
        high: 5,
        medium: 18,
        low: 12
      }
    },
    endpoints: {
      total: 450,
      protected: 442,
      unprotected: 8,
      byOS: {
        windows: 378,
        mac: 52,
        linux: 12,
        other: 8
      }
    },
    compliance: {
      overallRate: 97.8,
      byPolicy: [
        { policy: "エンドポイント保護", compliance: 99.1 },
        { policy: "デバイス暗号化", compliance: 95.8 },
        { policy: "パスワードポリシー", compliance: 100 },
        { policy: "自動更新", compliance: 96.2 }
      ]
    }
  },
  
  // DirectCloud 詳細レポート
  "DirectCloud": {
    storage: {
      total: "10 TB",
      used: "6.2 TB",
      available: "3.8 TB",
      usageRate: 62,
      byDepartment: [
        { dept: "営業部", usage: "2.1 TB" },
        { dept: "開発部", usage: "1.8 TB" },
        { dept: "管理部", usage: "0.9 TB" },
        { dept: "その他", usage: "1.4 TB" }
      ]
    },
    sharing: {
      internalShares: 245,
      externalShares: 37,
      anonymousLinks: 18,
      securityReview: "最終確認: 2025/03/05"
    },
    backup: {
      lastSuccess: "2025/03/14 01:30",
      frequency: "日次",
      retentionPolicy: "30日間",
      restorePoints: 30,
      testRestoreStatus: "成功 (2025/03/10)"
    }
  },
  
  // ファイルサーバー 詳細レポート
  "ファイルサーバー": {
    volumes: {
      total: 4,
      status: [
        { volume: "システム (C:)", total: "500 GB", used: "120 GB", status: "正常" },
        { volume: "データ (D:)", total: "2 TB", used: "1.5 TB", status: "正常" },
        { volume: "バックアップ (E:)", total: "4 TB", used: "3.2 TB", status: "警告" },
        { volume: "アーカイブ (F:)", total: "6 TB", used: "2.1 TB", status: "正常" }
      ]
    },
    diskHealth: {
      smart: {
        passed: 8,
        warning: 0,
        failed: 0
      },
      diskArray: "RAID-5 (正常)",
      lastCheck: "2025/03/14 00:00"
    },
    permissions: {
      shareCount: 18,
      inheritanceBreaks: 3,
      specialPermissions: 5,
      lastAudit: "2025/03/01",
      topShares: [
        { name: "営業資料", access: "営業部(R/W), 管理部(R)" },
        { name: "開発資料", access: "開発部(R/W), プロジェクト管理(R)" },
        { name: "人事書類", access: "人事部(R/W), 経営層(R)" }
      ]
    }
  }
};

// 詳細モーダルコンポーネント
const SystemDetailModal = ({ system, onClose }) => {
  const [showDetailReport, setShowDetailReport] = useState(false);
  
  if (!system) return null;

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-secondary-900 opacity-50"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-secondary-900" id="modal-title">
                  {system.name} - {showDetailReport ? '詳細レポート' : '基本情報'}
                </h3>
                
                {!showDetailReport ? (
                  <div className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-secondary-500">ステータス</p>
                        <p className="font-medium">{system.status}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-secondary-500">最終確認</p>
                        <p className="font-medium">{system.lastChecked}</p>
                      </div>
                    </div>
                    
                    <h4 className="font-medium mt-6 mb-2 text-secondary-900">パフォーマンスメトリクス</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-secondary-500">CPU使用率</p>
                        <div className="relative h-2 bg-secondary-200 rounded">
                          <div 
                            className={`absolute top-0 left-0 h-full rounded ${
                              system.cpu > 80 ? 'bg-danger-500' : 'bg-success-500'
                            }`}
                            style={{ width: `${system.cpu}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-right">{system.cpu}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-secondary-500">メモリ使用率</p>
                        <div className="relative h-2 bg-secondary-200 rounded">
                          <div 
                            className={`absolute top-0 left-0 h-full rounded ${
                              system.memory > 80 ? 'bg-danger-500' : 'bg-success-500'
                            }`}
                            style={{ width: `${system.memory}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-right">{system.memory}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-secondary-500">ディスク使用率</p>
                        <div className="relative h-2 bg-secondary-200 rounded">
                          <div 
                            className={`absolute top-0 left-0 h-full rounded ${
                              system.disk > 80 ? 'bg-danger-500' : 'bg-success-500'
                            }`}
                            style={{ width: `${system.disk}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-right">{system.disk}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-secondary-500">ネットワーク遅延</p>
                        <div className="relative h-2 bg-secondary-200 rounded">
                          <div 
                            className={`absolute top-0 left-0 h-full rounded ${
                              system.network > 50 ? 'bg-warning-500' : 'bg-success-500'
                            }`}
                            style={{ width: `${Math.min(system.network * 2, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-right">{system.network} ms</p>
                      </div>
                    </div>
                    
                    <h4 className="font-medium mt-6 mb-2 text-secondary-900">システム情報</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-secondary-500">IPアドレス</p>
                        <p className="font-medium">{system.ipAddress}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-secondary-500">OS / バージョン</p>
                        <p className="font-medium">{system.osVersion}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-secondary-500">稼働時間</p>
                        <p className="font-medium">{system.uptime}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-secondary-500">管理者</p>
                        <p className="font-medium">{system.admin}</p>
                      </div>
                    </div>
                    
                    {system.monitoringConfig && (
                      <>
                        <h4 className="font-medium mt-6 mb-2 text-secondary-900">監視/接続設定</h4>
                        <div className="bg-secondary-50 p-3 rounded-lg border border-secondary-200">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm text-secondary-500">監視方法</p>
                              <p className="font-medium">
                                {(() => {
                                  switch (system.monitoringConfig.method) {
                                    case 'agent': return 'エージェント';
                                    case 'snmp': return 'SNMP';
                                    case 'wmi': return 'WMI';
                                    case 'api': return 'API';
                                    case 'ssh': return 'SSH';
                                    default: return system.monitoringConfig.method;
                                  }
                                })()}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-secondary-500">認証方式</p>
                              <p className="font-medium">
                                {(() => {
                                  switch (system.monitoringConfig.credentialType) {
                                    case 'none': return '認証なし';
                                    case 'basic': return 'ベーシック認証';
                                    case 'token': return 'APIキー/トークン';
                                    case 'certificate': return '証明書';
                                    case 'key': return 'SSH鍵';
                                    default: return system.monitoringConfig.credentialType;
                                  }
                                })()}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-secondary-500">ポーリング間隔</p>
                              <p className="font-medium">{system.monitoringConfig.pollingInterval || '5分'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-secondary-500">接続テスト実施</p>
                              <p className="font-medium">{system.monitoringConfig.lastTested || '未実施'}</p>
                            </div>
                            {system.monitoringConfig.endpoint && (
                              <div className="col-span-2 space-y-1">
                                <p className="text-sm text-secondary-500">エンドポイント</p>
                                <p className="font-medium break-all">{system.monitoringConfig.endpoint}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 flex justify-end">
                            <button 
                              className="text-xs text-primary-600 hover:text-primary-800 hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                alert('この機能は開発中です。');
                              }}
                            >
                              接続テスト実行
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {system.notes && (
                      <>
                        <h4 className="font-medium mt-6 mb-2 text-secondary-900">備考</h4>
                        <p className="text-sm text-secondary-600">{system.notes}</p>
                      </>
                    )}
                  </div>
                ) : (
                  <SystemDetailReport 
                    system={system} 
                    reportData={systemDetailReports[system.name]} 
                  />
                )}
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
              onClick={() => setShowDetailReport(!showDetailReport)}
            >
              {showDetailReport ? '基本情報に戻る' : '詳細レポート'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 詳細レポートコンポーネント
const SystemDetailReport = ({ system, reportData }) => {
  if (!reportData) {
    return <div className="p-4 text-center text-secondary-500">詳細レポートは利用できません</div>;
  }

  // システム名に基づいてレポートコンテンツをレンダリング
  const renderReportContent = () => {
    switch (system.name) {
      case 'Microsoft 365':
        return <Microsoft365Report data={reportData} />;
      case 'Active Directory':
        return <ActiveDirectoryReport data={reportData} />;
      case 'Microsoft Entra ID':
        return <EntraIDReport data={reportData} />;
      case 'Exchange Online':
        return <ExchangeOnlineReport data={reportData} />;
      case 'HENGEOINE':
        return <HengeoineReport data={reportData} />;
      case 'DirectCloud':
        return <DirectCloudReport data={reportData} />;
      case 'ファイルサーバー':
        return <FileServerReport data={reportData} />;
      default:
        return <div className="p-4 text-center text-secondary-500">このシステムの詳細レポートはまだ実装されていません</div>;
    }
  };

  return (
    <div className="mt-4">
      <div className="mb-4 pb-2 border-b border-secondary-200">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg text-primary-700">{system.name} 詳細レポート</h3>
          <span className="text-sm text-secondary-500">生成日時: {new Date().toLocaleString()}</span>
        </div>
      </div>
      
      {renderReportContent()}
    </div>
  );
};

// Microsoft 365 詳細レポート
const Microsoft365Report = ({ data }) => (
  <div className="space-y-6">
    <div className="bg-primary-50 p-4 rounded-lg">
      <h4 className="font-medium text-primary-800 mb-3">サービス状態</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-primary-200">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-primary-600 uppercase tracking-wider">サービス</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-primary-600 uppercase tracking-wider">状態</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-primary-600 uppercase tracking-wider">可用性</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-100">
            {data.services.map((service, index) => (
              <tr key={index} className={service.status !== '正常' ? 'bg-warning-50' : ''}>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-secondary-700">{service.name}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    service.status === '正常' ? 'bg-success-100 text-success-800' : 
                    service.status === '警告' ? 'bg-warning-100 text-warning-800' : 
                    'bg-danger-100 text-danger-800'
                  }`}>
                    {service.status}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-secondary-700">{service.availability}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-secondary-200 rounded-lg p-4">
        <h4 className="font-medium text-secondary-800 mb-3">ライセンス使用状況</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-600">合計ライセンス数</span>
            <span className="font-medium">{data.licenses.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-600">割り当て済み</span>
            <span className="font-medium">{data.licenses.assigned}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-600">利用可能</span>
            <span className="font-medium text-success-700">{data.licenses.available}</span>
          </div>
          
          <div className="relative h-2 bg-secondary-200 rounded mt-4">
            <div 
              className="absolute top-0 left-0 h-full rounded bg-primary-500"
              style={{ width: `${(data.licenses.assigned / data.licenses.total) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-secondary-500 text-right">
            使用率 {Math.round((data.licenses.assigned / data.licenses.total) * 100)}%
          </p>
        </div>
        
        <h5 className="font-medium text-secondary-700 mt-4 mb-2 text-sm">ライセンスタイプ内訳</h5>
        <div className="space-y-2">
          {data.licenses.breakdown.map((license, index) => (
            <div key={index} className="flex items-center">
              <div className="w-24 text-sm text-secondary-600">{license.type}</div>
              <div className="flex-1 mx-2">
                <div className="relative h-2 bg-secondary-200 rounded">
                  <div 
                    className="absolute top-0 left-0 h-full rounded bg-primary-400"
                    style={{ width: `${(license.assigned / license.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-xs text-secondary-700 w-20 text-right">
                {license.assigned} / {license.total}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white border border-secondary-200 rounded-lg p-4">
        <h4 className="font-medium text-secondary-800 mb-3">テナント設定状態</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-secondary-100">
            <span className="text-sm text-secondary-600">セキュリティデフォルト</span>
            <span className={`px-2 py-1 rounded text-xs ${
              data.tenantSettings.securityDefaults === '有効' 
                ? 'bg-success-100 text-success-800' 
                : 'bg-warning-100 text-warning-800'
            }`}>
              {data.tenantSettings.securityDefaults}
            </span>
          </div>
          
          <div className="flex justify-between items-center pb-2 border-b border-secondary-100">
            <span className="text-sm text-secondary-600">MFA登録</span>
            <span className={`px-2 py-1 rounded text-xs ${
              data.tenantSettings.mfaRegistration === '必須' 
                ? 'bg-success-100 text-success-800' 
                : 'bg-warning-100 text-warning-800'
            }`}>
              {data.tenantSettings.mfaRegistration}
            </span>
          </div>
          
          <div className="flex justify-between items-center pb-2 border-b border-secondary-100">
            <span className="text-sm text-secondary-600">ゲストアクセス</span>
            <span className="px-2 py-1 rounded text-xs bg-secondary-100 text-secondary-800">
              {data.tenantSettings.guestAccess}
            </span>
          </div>
          
          <div className="mt-3 text-xs text-secondary-500 text-right">
            最終更新: {data.tenantSettings.lastUpdated}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Active Directory 詳細レポート
const ActiveDirectoryReport = ({ data }) => (
  <div className="space-y-6">
    {/* レプリケーション状態 */}
    <div className="bg-white border border-secondary-200 rounded-lg p-4">
      <h4 className="font-medium text-secondary-800 mb-3">レプリケーション状態</h4>
      <div className="flex items-center mb-3">
        <span className={`px-2 py-1 rounded text-xs mr-2 ${
          data.replication.status === '正常' 
            ? 'bg-success-100 text-success-800' 
            : 'bg-warning-100 text-warning-800'
        }`}>
          {data.replication.status}
        </span>
        <span className="text-sm text-secondary-500">最終成功: {data.replication.lastSuccess}</span>
      </div>
      
      <table className="min-w-full divide-y divide-secondary-200">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-secondary-500">パートナー</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-secondary-500">状態</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-secondary-500">最終同期</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-secondary-500">遅延</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-200">
          {data.replication.partners.map((partner, index) => (
            <tr key={index}>
              <td className="px-3 py-2 text-sm">{partner.partner}</td>
              <td className="px-3 py-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  partner.status === '正常' ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
                }`}>
                  {partner.status}
                </span>
              </td>
              <td className="px-3 py-2 text-sm text-secondary-500">{partner.lastSync}</td>
              <td className="px-3 py-2 text-sm text-secondary-500">{partner.latency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {/* ユーザー・グループ活動 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-secondary-200 rounded-lg p-4">
        <h4 className="font-medium text-secondary-800 mb-3">ユーザー登録・削除状況</h4>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-secondary-50 rounded">
            <p className="text-xs text-secondary-500">今日</p>
            <div className="flex justify-center gap-2 mt-1">
              <div className="text-center">
                <p className="text-xs text-success-600">作成</p>
                <p className="font-medium text-sm">{data.userActivity.created.today}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-danger-600">削除</p>
                <p className="font-medium text-sm">{data.userActivity.deleted.today}</p>
              </div>
            </div>
          </div>
          <div className="text-center p-2 bg-secondary-50 rounded">
            <p className="text-xs text-secondary-500">今週</p>
            <div className="flex justify-center gap-2 mt-1">
              <div className="text-center">
                <p className="text-xs text-success-600">作成</p>
                <p className="font-medium text-sm">{data.userActivity.created.week}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-danger-600">削除</p>
                <p className="font-medium text-sm">{data.userActivity.deleted.week}</p>
              </div>
            </div>
          </div>
          <div className="text-center p-2 bg-secondary-50 rounded">
            <p className="text-xs text-secondary-500">今月</p>
            <div className="flex justify-center gap-2 mt-1">
              <div className="text-center">
                <p className="text-xs text-success-600">作成</p>
                <p className="font-medium text-sm">{data.userActivity.created.month}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-danger-600">削除</p>
                <p className="font-medium text-sm">{data.userActivity.deleted.month}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-secondary-200 rounded-lg p-4">
        <h4 className="font-medium text-secondary-800 mb-3">グループの登録・削除状況</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-600">セキュリティグループ</span>
            <span className="font-medium">{data.groupActivity.securityGroups}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-600">配布グループ</span>
            <span className="font-medium">{data.groupActivity.distributionGroups}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-600">今日のメンバーシップ変更</span>
            <span className="font-medium">{data.groupActivity.membershipChanges.today}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Microsoft Entra ID 詳細レポート
const EntraIDReport = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-secondary-200 rounded-lg p-4">
        <h4 className="font-medium text-secondary-800 mb-3">認証統計</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-600">認証成功率</span>
            <span className="font-medium text-success-600">{data.authentication.successRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-600">日次認証回数</span>
            <span className="font-medium">{data.authentication.dailyAuthentications}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-600">MFA使用率</span>
            <span className="font-medium">{data.authentication.mfaUsage}%</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-secondary-200 rounded-lg p-4">
        <h4 className="font-medium text-secondary-800 mb-3">ADとの同期状態</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-600">同期状態</span>
            <span className={`px-2 py-1 rounded text-xs ${
              data.adSync.syncStatus === '正常' 
                ? 'bg-success-100 text-success-800' 
                : 'bg-warning-100 text-warning-800'
            }`}>
              {data.adSync.syncStatus}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-600">最終同期時刻</span>
            <span className="font-medium">{data.adSync.lastSyncTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-600">同期サイクル</span>
            <span className="font-medium">{data.adSync.syncCycle}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Exchange Online 詳細レポート
const ExchangeOnlineReport = ({ data }) => (
  <div className="space-y-6">
    <div className="bg-white border border-secondary-200 rounded-lg p-4">
      <h4 className="font-medium text-secondary-800 mb-3">メールフロー統計</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-secondary-600">1日あたりの合計メッセージ</p>
          <p className="font-medium text-lg">{data.mailFlow.totalDaily}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-secondary-600">平均配信時間</p>
          <p className="font-medium text-lg">{data.mailFlow.avgDeliveryTime}</p>
        </div>
      </div>
    </div>
    
    <div className="bg-white border border-secondary-200 rounded-lg p-4">
      <h4 className="font-medium text-secondary-800 mb-3">セキュリティ統計</h4>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-2 bg-secondary-50 rounded">
          <p className="text-sm text-secondary-700">スパム</p>
          <p className="font-medium">{data.security.spam.detected}</p>
          <p className="text-xs text-secondary-500">検出率: {data.security.spam.detectionRate}%</p>
        </div>
        <div className="text-center p-2 bg-secondary-50 rounded">
          <p className="text-sm text-secondary-700">マルウェア</p>
          <p className="font-medium">{data.security.malware.detected}</p>
          <p className="text-xs text-secondary-500">検出率: {data.security.malware.detectionRate}%</p>
        </div>
        <div className="text-center p-2 bg-secondary-50 rounded">
          <p className="text-sm text-secondary-700">フィッシング</p>
          <p className="font-medium">{data.security.phishing.detected}</p>
          <p className="text-xs text-secondary-500">検出率: {data.security.phishing.detectionRate}%</p>
        </div>
      </div>
    </div>
  </div>
);

// HENGEOINE 詳細レポート
const HengeoineReport = ({ data }) => (
  <div className="space-y-6">
    <div className="bg-white border border-secondary-200 rounded-lg p-4">
      <h4 className="font-medium text-secondary-800 mb-3">ユーザー認証状況</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-secondary-600">認証成功率</p>
          <p className="font-medium text-lg">{data.authentication.successRate}%</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-secondary-600">アクティブセッション</p>
          <p className="font-medium text-lg">{data.authentication.activeSessions}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-secondary-600 mb-1">フェデレーション状態</p>
        <span className={`px-2 py-1 rounded text-xs ${
          data.authentication.federationStatus === '正常' 
            ? 'bg-success-100 text-success-800' 
            : 'bg-warning-100 text-warning-800'
        }`}>
          {data.authentication.federationStatus}
        </span>
      </div>
    </div>
    
    <div className="bg-white border border-secondary-200 rounded-lg p-4">
      <h4 className="font-medium text-secondary-800 mb-3">脅威検出</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-secondary-600">検出された脅威</p>
          <p className="font-medium text-lg">{data.threats.detected}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-secondary-600">ブロックされた脅威</p>
          <p className="font-medium text-lg">{data.threats.blocked}</p>
        </div>
      </div>
    </div>
  </div>
);

// DirectCloud 詳細レポート
const DirectCloudReport = ({ data }) => (
  <div className="space-y-6">
    <div className="bg-white border border-secondary-200 rounded-lg p-4">
      <h4 className="font-medium text-secondary-800 mb-3">ストレージ使用状況</h4>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="space-y-1 text-center">
          <p className="text-xs text-secondary-500">合計</p>
          <p className="font-medium">{data.storage.total}</p>
        </div>
        <div className="space-y-1 text-center">
          <p className="text-xs text-secondary-500">使用中</p>
          <p className="font-medium">{data.storage.used}</p>
        </div>
        <div className="space-y-1 text-center">
          <p className="text-xs text-secondary-500">利用可能</p>
          <p className="font-medium text-success-600">{data.storage.available}</p>
        </div>
      </div>
      <div className="relative h-2 bg-secondary-200 rounded">
        <div 
          className="absolute top-0 left-0 h-full rounded bg-primary-500"
          style={{ width: `${data.storage.usageRate}%` }}
        ></div>
      </div>
      <p className="text-xs text-secondary-500 text-right mt-1">
        使用率 {data.storage.usageRate}%
      </p>
    </div>
    
    <div className="bg-white border border-secondary-200 rounded-lg p-4">
      <h4 className="font-medium text-secondary-800 mb-3">バックアップ状態</h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary-600">最終バックアップ</span>
          <span className="font-medium">{data.backup.lastSuccess}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary-600">頻度</span>
          <span className="font-medium">{data.backup.frequency}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary-600">保持ポリシー</span>
          <span className="font-medium">{data.backup.retentionPolicy}</span>
        </div>
      </div>
    </div>
  </div>
);

// ファイルサーバー 詳細レポート
const FileServerReport = ({ data }) => (
  <div className="space-y-6">
    <div className="bg-white border border-secondary-200 rounded-lg p-4">
      <h4 className="font-medium text-secondary-800 mb-3">ボリューム使用状況</h4>
      <div className="space-y-4">
        {data.volumes.status.map((volume, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium">{volume.volume}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                volume.status === '正常' ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
              }`}>
                {volume.status}
              </span>
            </div>
            <div className="flex justify-between text-xs text-secondary-500">
              <span>容量: {volume.total}</span>
              <span>使用中: {volume.used}</span>
            </div>
            <div className="relative h-2 bg-secondary-200 rounded">
              <div 
                className={`absolute top-0 left-0 h-full rounded ${
                  volume.status === '正常' ? 'bg-success-500' : 'bg-warning-500'
                }`}
                style={{ width: `${parseInt(volume.used) / parseInt(volume.total.replace(/[^\d]/g, '')) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    <div className="bg-white border border-secondary-200 rounded-lg p-4">
      <h4 className="font-medium text-secondary-800 mb-3">ディスク健全性</h4>
      <div className="flex items-center mb-3">
        <div className="p-2 bg-success-100 text-success-800 rounded">
          <p className="text-sm font-medium">S.M.A.R.T. ステータス: 正常</p>
        </div>
      </div>
      <div className="text-sm">
        <p><span className="font-medium">ディスクアレイ:</span> {data.diskHealth.diskArray}</p>
        <p><span className="font-medium">最終チェック:</span> {data.diskHealth.lastCheck}</p>
      </div>
    </div>
  </div>
);

// パフォーマンスレポートモーダル
const PerformanceReportModal = ({ systemsData, onClose }) => {
  // PDF生成機能（モック）
  const handleExportPDF = () => {
    // 実際のプロジェクトではここでPDF生成ライブラリを使用
    alert('PDFレポートをエクスポートしました');
  };

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-secondary-900 opacity-50"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-secondary-900 mb-4">
                  ITシステムパフォーマンスレポート
                </h3>
                
                <div className="mb-6">
                  <div className="bg-primary-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-primary-800 mb-2">レポートサマリー</h4>
                    <p className="text-sm text-secondary-600 mb-2">
                      このレポートは、監視対象のITシステム全体のパフォーマンス概要を提供します。詳細なデータとグラフはPDFで確認できます。
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary-600">レポート生成日時:</span>
                      <span className="text-sm font-medium">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white border border-secondary-200 rounded-lg p-4">
                      <h4 className="font-medium text-secondary-800 mb-3">システム状態サマリー</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-success-600">正常</span>
                          <span className="font-medium">{systemsData.filter(s => s.status === '正常').length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-warning-600">警告</span>
                          <span className="font-medium">{systemsData.filter(s => s.status === '警告').length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-danger-600">異常</span>
                          <span className="font-medium">{systemsData.filter(s => s.status === '異常').length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-secondary-200 rounded-lg p-4">
                      <h4 className="font-medium text-secondary-800 mb-3">パフォーマンス指標</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-secondary-600">平均CPU使用率</span>
                          <span className="font-medium">
                            {Math.round(systemsData.reduce((acc, sys) => acc + sys.cpu, 0) / systemsData.length)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-secondary-600">平均メモリ使用率</span>
                          <span className="font-medium">
                            {Math.round(systemsData.reduce((acc, sys) => acc + sys.memory, 0) / systemsData.length)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-secondary-600">平均ディスク使用率</span>
                          <span className="font-medium">
                            {Math.round(systemsData.reduce((acc, sys) => acc + sys.disk, 0) / systemsData.length)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-secondary-200 rounded-lg p-4">
                    <h4 className="font-medium text-secondary-800 mb-3">注意が必要なシステム</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-secondary-200">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">システム名</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">状態</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">問題点</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-200">
                          {systemsData.filter(s => s.status !== '正常' || s.cpu > 70 || s.memory > 70 || s.disk > 70).map((system) => (
                            <tr key={system.id}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">{system.name}</td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  system.status === '正常' ? 'bg-success-100 text-success-800' : 
                                  system.status === '警告' ? 'bg-warning-100 text-warning-800' : 
                                  'bg-danger-100 text-danger-800'
                                }`}>
                                  {system.status}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-sm text-secondary-500">
                                {system.status !== '正常' ? system.notes : 
                                system.cpu > 70 ? 'CPU使用率が高い' : 
                                system.memory > 70 ? 'メモリ使用率が高い' : 
                                system.disk > 70 ? 'ディスク使用率が高い' : ''}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="bg-secondary-50 p-4 rounded-lg border border-secondary-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-secondary-800">詳細レポートをPDFでエクスポート</h4>
                      <p className="text-sm text-secondary-500 mt-1">
                        システムごとの詳細な分析、パフォーマンス推移グラフ、推奨アクションを含む完全レポート
                      </p>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleExportPDF}
                    >
                      PDFエクスポート
                    </button>
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
          </div>
        </div>
      </div>
    </div>
  );
};

// システム追加モーダル
const AddSystemModal = ({ onClose, onAdd }) => {
  // フォームの状態
  const [formData, setFormData] = useState({
    // 基本情報
    name: '',
    description: '',
    systemType: 'server',
    
    // ネットワーク情報
    ipAddress: '',
    hostname: '',
    location: '',
    networkSpeed: '',
    
    // ハードウェア/OS情報
    osType: 'windows',
    osVersion: '',
    cpuModel: '',
    cpuCores: '',
    memoryTotal: '',
    diskTotal: '',
    
    // 管理情報
    criticality: 'medium',
    department: '',
    owner: '',
    admin: '',
    purchaseDate: '',
    warrantyExpiration: '',
    vendor: '',
    supportContract: '',
    supportContactInfo: '',
    
    // セキュリティ情報
    securityLevel: 'standard',
    firewallRule: '',
    antivirusInstalled: 'yes',
    lastPatchDate: '',
    
    // バックアップ情報
    backupSchedule: '',
    lastBackup: '',
    
    // 監視/接続情報（新規追加）
    monitoringMethod: 'agent', // エージェント、SNMP、WMI、APIなど
    credentialType: 'none',    // none, basic, token, certificate, key
    username: '',
    password: '',
    apiKey: '',
    apiEndpoint: '',
    snmpCommunity: '',
    snmpVersion: 'v2c',
    pollingInterval: '5',      // 分単位
    sshEnabled: 'no',
    sshPort: '22',
    certificatePath: '',
    
    // その他情報
    maintenanceWindow: '',
    notes: '',
    tags: '',
    serviceStatus: 'active',
    applicationList: '',
    listeningPorts: '',
    virtualHost: 'no',
    cloudProvider: '',
    connectionDetails: '',
  });

  // バリデーション状態
  const [errors, setErrors] = useState({});
  const [testStatus, setTestStatus] = useState(null); // null, loading, success, error
  const [testMessage, setTestMessage] = useState("");

  // 入力変更ハンドラ
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 入力時にそのフィールドのエラーをクリア
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 接続テスト
  const testConnection = () => {
    // 接続に必要な基本情報をチェック
    const requiredFields = ['name', 'ipAddress'];
    const newErrors = {};
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'このフィールドは必須です';
      }
    });
    
    // 接続方法による追加チェック
    if (formData.monitoringMethod === 'api' && !formData.apiEndpoint) {
      newErrors.apiEndpoint = 'APIエンドポイントは必須です';
    }
    
    if (formData.credentialType === 'basic' && (!formData.username || !formData.password)) {
      if (!formData.username) newErrors.username = 'ユーザー名は必須です';
      if (!formData.password) newErrors.password = 'パスワードは必須です';
    }
    
    if (formData.credentialType === 'token' && !formData.apiKey) {
      newErrors.apiKey = 'APIキーは必須です';
    }
    
    if (formData.monitoringMethod === 'snmp' && !formData.snmpCommunity) {
      newErrors.snmpCommunity = 'SNMPコミュニティ文字列は必須です';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // 接続テスト開始
    setTestStatus('loading');
    setTestMessage('接続テスト中...');
    
    // 実際のシステムではここで実際の接続テストを行う
    // モックのテスト - 成功または失敗をランダムに選択
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70%の確率で成功
      
      if (success) {
        setTestStatus('success');
        setTestMessage(`${formData.name}への接続に成功しました。システム情報を取得できます。`);
      } else {
        setTestStatus('error');
        setTestMessage(`接続エラー: ${formData.ipAddress}に接続できませんでした。ネットワーク設定または認証情報を確認してください。`);
      }
    }, 1500);
  };

  // フォームバリデーション
  const validateForm = () => {
    const newErrors = {};
    
    // 必須フィールドの検証
    if (!formData.name) newErrors.name = 'システム名は必須です';
    if (!formData.systemType) newErrors.systemType = 'システムタイプは必須です';
    
    // IPアドレスの形式検証
    if (formData.ipAddress && !/^(\d{1,3}\.){3}\d{1,3}$|^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$|^Cloud Service$/.test(formData.ipAddress)) {
      newErrors.ipAddress = '有効なIPアドレスまたはホスト名を入力してください';
    }
    
    // 日付の検証
    if (formData.purchaseDate && formData.warrantyExpiration) {
      const purchase = new Date(formData.purchaseDate);
      const warranty = new Date(formData.warrantyExpiration);
      
      if (warranty < purchase) {
        newErrors.warrantyExpiration = '保証期限は購入日より後である必要があります';
      }
    }
    
    // ポーリング間隔の検証
    if (formData.pollingInterval && (isNaN(formData.pollingInterval) || parseInt(formData.pollingInterval) < 1)) {
      newErrors.pollingInterval = '有効な数値（1以上）を入力してください';
    }
    
    // SSHポートの検証
    if (formData.sshEnabled === 'yes' && formData.sshPort) {
      const port = parseInt(formData.sshPort);
      if (isNaN(port) || port < 1 || port > 65535) {
        newErrors.sshPort = '有効なポート番号（1-65535）を入力してください';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 送信ハンドラ
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // フォームバリデーション
    if (!validateForm()) {
      return; // バリデーションエラーがある場合は処理を中止
    }
    
    // 新しいシステムオブジェクトを作成
    const newSystem = {
      id: Date.now(), // 一時的なID
      name: formData.name,
      description: formData.description,
      status: '正常', // デフォルト状態
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0,
      uptime: '0日間',
      lastChecked: new Date().toLocaleString(),
      ipAddress: formData.ipAddress,
      osVersion: formData.osType + ' ' + formData.osVersion,
      admin: formData.admin,
      notes: formData.notes,
      // 監視設定情報を追加
      monitoringConfig: {
        method: formData.monitoringMethod,
        credentialType: formData.credentialType,
        pollingInterval: formData.pollingInterval + '分',
        endpoint: formData.apiEndpoint || formData.ipAddress,
        lastTested: testStatus === 'success' ? new Date().toLocaleString() : '未テスト'
      }
    };
    
    // 親コンポーネントに新しいシステムを渡す
    onAdd(newSystem);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-30 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-secondary-900 opacity-50"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-secondary-900 mb-4" id="modal-title">
                    新規システム追加
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* 基本情報セクション */}
                    <div className="col-span-2">
                      <h4 className="text-md font-medium text-secondary-900 mb-2 border-b pb-1">基本情報</h4>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">システム名 <span className="text-danger-500">*</span></label>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">システムタイプ <span className="text-danger-500">*</span></label>
                      <select 
                        name="systemType" 
                        value={formData.systemType} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                        required
                      >
                        <option value="server">サーバー</option>
                        <option value="network">ネットワーク機器</option>
                        <option value="storage">ストレージ</option>
                        <option value="cloud">クラウドサービス</option>
                        <option value="application">アプリケーション</option>
                        <option value="security">セキュリティ機器</option>
                        <option value="other">その他</option>
                      </select>
                    </div>
                    
                    <div className="col-span-2 space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">説明</label>
                      <input 
                        type="text" 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                      />
                    </div>
                    
                    {/* ネットワーク情報セクション */}
                    <div className="col-span-2 mt-4">
                      <h4 className="text-md font-medium text-secondary-900 mb-2 border-b pb-1">ネットワーク情報</h4>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">IPアドレス</label>
                      <input 
                        type="text" 
                        name="ipAddress" 
                        value={formData.ipAddress} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                        placeholder="例: 192.168.1.10" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">ホスト名</label>
                      <input 
                        type="text" 
                        name="hostname" 
                        value={formData.hostname} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">ロケーション</label>
                      <input 
                        type="text" 
                        name="location" 
                        value={formData.location} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                        placeholder="例: 東京データセンター" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">ネットワーク速度</label>
                      <input 
                        type="text" 
                        name="networkSpeed" 
                        value={formData.networkSpeed} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                        placeholder="例: 1Gbps" 
                      />
                    </div>
                    
                    {/* ハードウェア情報セクション */}
                    <div className="col-span-2 mt-4">
                      <h4 className="text-md font-medium text-secondary-900 mb-2 border-b pb-1">ハードウェア/OS情報</h4>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">OSタイプ</label>
                      <select 
                        name="osType" 
                        value={formData.osType} 
                        onChange={handleChange} 
                        className="form-input w-full"
                      >
                        <option value="windows">Windows</option>
                        <option value="linux">Linux</option>
                        <option value="macos">macOS</option>
                        <option value="freebsd">FreeBSD</option>
                        <option value="other">その他</option>
                        <option value="na">該当なし</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">OSバージョン</label>
                      <input 
                        type="text" 
                        name="osVersion" 
                        value={formData.osVersion} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                        placeholder="例: Server 2022" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">CPUモデル</label>
                      <input 
                        type="text" 
                        name="cpuModel" 
                        value={formData.cpuModel} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">CPUコア数</label>
                      <input 
                        type="text" 
                        name="cpuCores" 
                        value={formData.cpuCores} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">メモリ容量</label>
                      <input 
                        type="text" 
                        name="memoryTotal" 
                        value={formData.memoryTotal} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                        placeholder="例: 16GB" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">ディスク容量</label>
                      <input 
                        type="text" 
                        name="diskTotal" 
                        value={formData.diskTotal} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                        placeholder="例: 500GB" 
                      />
                    </div>
                    
                    {/* 管理情報セクション */}
                    <div className="col-span-2 mt-4">
                      <h4 className="text-md font-medium text-secondary-900 mb-2 border-b pb-1">管理情報</h4>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">重要度</label>
                      <select 
                        name="criticality" 
                        value={formData.criticality} 
                        onChange={handleChange} 
                        className="form-input w-full"
                      >
                        <option value="critical">最重要</option>
                        <option value="high">高</option>
                        <option value="medium">中</option>
                        <option value="low">低</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">所属部門</label>
                      <input 
                        type="text" 
                        name="department" 
                        value={formData.department} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">所有者</label>
                      <input 
                        type="text" 
                        name="owner" 
                        value={formData.owner} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">管理者</label>
                      <input 
                        type="text" 
                        name="admin" 
                        value={formData.admin} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">購入日</label>
                      <input 
                        type="date" 
                        name="purchaseDate" 
                        value={formData.purchaseDate} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">保証期限</label>
                      <input 
                        type="date" 
                        name="warrantyExpiration" 
                        value={formData.warrantyExpiration} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                      />
                    </div>
                    
                    {/* セキュリティ情報セクション */}
                    <div className="col-span-2 mt-4">
                      <h4 className="text-md font-medium text-secondary-900 mb-2 border-b pb-1">セキュリティ情報</h4>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">セキュリティレベル</label>
                      <select 
                        name="securityLevel" 
                        value={formData.securityLevel} 
                        onChange={handleChange} 
                        className="form-input w-full"
                      >
                        <option value="high">高 (機密データを含む)</option>
                        <option value="standard">標準</option>
                        <option value="low">低</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">ファイアウォールルール</label>
                      <input 
                        type="text" 
                        name="firewallRule" 
                        value={formData.firewallRule} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">ウイルス対策ソフト</label>
                      <select 
                        name="antivirusInstalled" 
                        value={formData.antivirusInstalled} 
                        onChange={handleChange} 
                        className="form-input w-full"
                      >
                        <option value="yes">インストール済み</option>
                        <option value="no">未インストール</option>
                        <option value="na">該当なし</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">最終パッチ適用日</label>
                      <input 
                        type="date" 
                        name="lastPatchDate" 
                        value={formData.lastPatchDate} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                      />
                    </div>
                    
                    {/* バックアップ情報セクション */}
                    <div className="col-span-2 mt-4">
                      <h4 className="text-md font-medium text-secondary-900 mb-2 border-b pb-1">バックアップ情報</h4>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">バックアップスケジュール</label>
                      <input 
                        type="text" 
                        name="backupSchedule" 
                        value={formData.backupSchedule} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                        placeholder="例: 毎日 22:00" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">最終バックアップ日時</label>
                      <input 
                        type="datetime-local" 
                        name="lastBackup" 
                        value={formData.lastBackup} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                      />
                    </div>
                    {/* 監視/接続設定セクション（新規追加） */}
                    <div className="col-span-2 mt-4">
                      <h4 className="text-md font-medium text-secondary-900 mb-2 border-b pb-1">監視/接続設定</h4>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">監視方法</label>
                      <select 
                        name="monitoringMethod" 
                        value={formData.monitoringMethod} 
                        onChange={handleChange} 
                        className="form-input w-full"
                      >
                        <option value="agent">エージェント</option>
                        <option value="snmp">SNMP</option>
                        <option value="wmi">WMI</option>
                        <option value="api">API</option>
                        <option value="ssh">SSH</option>
                        <option value="other">その他</option>
                      </select>
                      {errors.monitoringMethod && (
                        <p className="text-xs text-danger-600 mt-1">{errors.monitoringMethod}</p>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">認証方式</label>
                      <select 
                        name="credentialType" 
                        value={formData.credentialType} 
                        onChange={handleChange} 
                        className="form-input w-full"
                      >
                        <option value="none">認証なし</option>
                        <option value="basic">ベーシック認証</option>
                        <option value="token">APIキー/トークン</option>
                        <option value="certificate">証明書</option>
                        <option value="key">SSH鍵</option>
                      </select>
                    </div>
                    
                    {formData.credentialType === 'basic' && (
                      <>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-secondary-700">ユーザー名</label>
                          <input 
                            type="text" 
                            name="username" 
                            value={formData.username} 
                            onChange={handleChange} 
                            className={`form-input w-full ${errors.username ? 'border-danger-300' : ''}`} 
                          />
                          {errors.username && (
                            <p className="text-xs text-danger-600 mt-1">{errors.username}</p>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-secondary-700">パスワード</label>
                          <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange}
                            className={`form-input w-full ${errors.password ? 'border-danger-300' : ''}`} 
                          />
                          {errors.password && (
                            <p className="text-xs text-danger-600 mt-1">{errors.password}</p>
                          )}
                        </div>
                      </>
                    )}
                    
                    {formData.credentialType === 'token' && (
                      <div className="space-y-1 col-span-2">
                        <label className="block text-sm font-medium text-secondary-700">APIキー/トークン</label>
                        <input 
                          type="text" 
                          name="apiKey" 
                          value={formData.apiKey} 
                          onChange={handleChange} 
                          className={`form-input w-full ${errors.apiKey ? 'border-danger-300' : ''}`} 
                        />
                        {errors.apiKey && (
                          <p className="text-xs text-danger-600 mt-1">{errors.apiKey}</p>
                        )}
                      </div>
                    )}
                    
                    {formData.monitoringMethod === 'api' && (
                      <div className="space-y-1 col-span-2">
                        <label className="block text-sm font-medium text-secondary-700">APIエンドポイント</label>
                        <input 
                          type="text" 
                          name="apiEndpoint" 
                          value={formData.apiEndpoint} 
                          onChange={handleChange} 
                          className={`form-input w-full ${errors.apiEndpoint ? 'border-danger-300' : ''}`} 
                          placeholder="例: https://api.example.com/v1/metrics" 
                        />
                        {errors.apiEndpoint && (
                          <p className="text-xs text-danger-600 mt-1">{errors.apiEndpoint}</p>
                        )}
                      </div>
                    )}
                    
                    {formData.monitoringMethod === 'snmp' && (
                      <>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-secondary-700">SNMPバージョン</label>
                          <select 
                            name="snmpVersion" 
                            value={formData.snmpVersion} 
                            onChange={handleChange} 
                            className="form-input w-full"
                          >
                            <option value="v1">v1</option>
                            <option value="v2c">v2c</option>
                            <option value="v3">v3</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-secondary-700">コミュニティ文字列</label>
                          <input 
                            type="text" 
                            name="snmpCommunity" 
                            value={formData.snmpCommunity} 
                            onChange={handleChange} 
                            className={`form-input w-full ${errors.snmpCommunity ? 'border-danger-300' : ''}`} 
                            placeholder="例: public" 
                          />
                          {errors.snmpCommunity && (
                            <p className="text-xs text-danger-600 mt-1">{errors.snmpCommunity}</p>
                          )}
                        </div>
                      </>
                    )}
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">ポーリング間隔（分）</label>
                      <input 
                        type="number" 
                        name="pollingInterval" 
                        value={formData.pollingInterval} 
                        onChange={handleChange} 
                        className={`form-input w-full ${errors.pollingInterval ? 'border-danger-300' : ''}`} 
                        min="1" 
                      />
                      {errors.pollingInterval && (
                        <p className="text-xs text-danger-600 mt-1">{errors.pollingInterval}</p>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">SSH有効</label>
                      <select 
                        name="sshEnabled" 
                        value={formData.sshEnabled} 
                        onChange={handleChange} 
                        className="form-input w-full"
                      >
                        <option value="no">無効</option>
                        <option value="yes">有効</option>
                      </select>
                    </div>
                    
                    {formData.sshEnabled === 'yes' && (
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-secondary-700">SSHポート</label>
                        <input 
                          type="text" 
                          name="sshPort" 
                          value={formData.sshPort} 
                          onChange={handleChange} 
                          className={`form-input w-full ${errors.sshPort ? 'border-danger-300' : ''}`} 
                          placeholder="例: 22" 
                        />
                        {errors.sshPort && (
                          <p className="text-xs text-danger-600 mt-1">{errors.sshPort}</p>
                        )}
                      </div>
                    )}
                    
                    {/* 接続テスト結果 */}
                    <div className="col-span-2 mt-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={testConnection}
                      >
                        接続テスト
                      </button>
                      
                      {testStatus && (
                        <div className={`mt-3 p-3 rounded ${
                          testStatus === 'loading' ? 'bg-secondary-100' : 
                          testStatus === 'success' ? 'bg-success-100' : 
                          'bg-danger-100'
                        }`}>
                          <p className={`text-sm ${
                            testStatus === 'loading' ? 'text-secondary-700' : 
                            testStatus === 'success' ? 'text-success-700' : 
                            'text-danger-700'
                          }`}>
                            {testMessage}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* その他情報セクション */}
                    <div className="col-span-2 mt-4">
                      <h4 className="text-md font-medium text-secondary-900 mb-2 border-b pb-1">その他情報</h4>
                    </div>
                    
                    <div className="col-span-2 space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">メンテナンスウィンドウ</label>
                      <input 
                        type="text" 
                        name="maintenanceWindow" 
                        value={formData.maintenanceWindow} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                        placeholder="例: 毎週日曜日 03:00-06:00" 
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">備考</label>
                      <textarea 
                        name="notes" 
                        value={formData.notes} 
                        onChange={handleChange} 
                        className="form-input w-full h-20" 
                      ></textarea>
                    </div>
                    
                    <div className="col-span-2 space-y-1">
                      <label className="block text-sm font-medium text-secondary-700">タグ</label>
                      <input 
                        type="text" 
                        name="tags" 
                        value={formData.tags} 
                        onChange={handleChange} 
                        className="form-input w-full" 
                        placeholder="コンマ区切りでタグを入力" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto sm:ml-3"
              >
                システムを追加
              </button>
              <button
                type="button"
                className="btn btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                onClick={onClose}
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// システムデータ（APIから取得する想定）
const initialSystemsData = [
  {
    id: 1,
    name: 'Microsoft 365',
    description: 'クラウドサービススイート',
    status: '正常',
    cpu: 45,
    memory: 52,
    disk: 65,
    network: 18,
    uptime: '30日間',
    lastChecked: '2025/03/13 18:15',
    ipAddress: 'Cloud Service',
    osVersion: 'N/A',
    admin: '山田太郎',
    notes: 'サービスの状態は良好です。定期メンテナンスは3/20に予定されています。'
  },
  {
    id: 2,
    name: 'Active Directory',
    description: 'ディレクトリサービス',
    status: '正常',
    cpu: 38,
    memory: 45,
    disk: 57,
    network: 12,
    uptime: '30日間',
    lastChecked: '2025/03/13 18:10',
    ipAddress: '192.168.1.10',
    osVersion: 'Windows Server 2022',
    admin: '鈴木一郎',
    notes: null
  },
  {
    id: 3,
    name: 'Microsoft Entra ID',
    description: 'クラウドID管理',
    status: '正常',
    cpu: 22,
    memory: 35,
    disk: 40,
    network: 15,
    uptime: '30日間',
    lastChecked: '2025/03/13 18:12',
    ipAddress: 'Cloud Service',
    osVersion: 'N/A',
    admin: '山田太郎',
    notes: null
  },
  {
    id: 4,
    name: 'Exchange Online',
    description: 'メールサービス',
    status: '警告',
    cpu: 72,
    memory: 68,
    disk: 75,
    network: 45,
    uptime: '29日間',
    lastChecked: '2025/03/13 18:05',
    ipAddress: 'Cloud Service',
    osVersion: 'N/A',
    admin: '山田太郎',
    notes: '一部のメール配信に遅延が発生しています。監視を継続中です。'
  },
  {
    id: 5,
    name: 'HENGEOINE',
    description: 'エンドポイントセキュリティ',
    status: '正常',
    cpu: 55,
    memory: 48,
    disk: 60,
    network: 20,
    uptime: '30日間',
    lastChecked: '2025/03/13 18:08',
    ipAddress: '192.168.1.15',
    osVersion: 'Windows Server 2022',
    admin: '佐藤次郎',
    notes: null
  },
  {
    id: 6,
    name: 'DirectCloud',
    description: 'クラウドストレージ',
    status: '正常',
    cpu: 32,
    memory: 41,
    disk: 82,
    network: 22,
    uptime: '30日間',
    lastChecked: '2025/03/13 18:00',
    ipAddress: 'Cloud Service',
    osVersion: 'N/A',
    admin: '田中三郎',
    notes: null
  },
  {
    id: 7,
    name: 'ファイルサーバー',
    description: 'データセンター内共有ストレージ',
    status: '正常',
    cpu: 42,
    memory: 55,
    disk: 78,
    network: 17,
    uptime: '30日間',
    lastChecked: '2025/03/13 18:20',
    ipAddress: '192.168.1.20',
    osVersion: 'Windows Server 2022',
    admin: '伊藤四郎',
    notes: null
  }
];

const SystemMonitoring = () => {
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPerformanceReport, setShowPerformanceReport] = useState(false);
  const [showAddSystemModal, setShowAddSystemModal] = useState(false);
  const [systemsData, setSystemsData] = useState(initialSystemsData);

  // フィルター適用したシステムリスト
  const filteredSystems = systemsData.filter(system => {
    if (filterStatus === 'all') return true;
    return system.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">システム監視</h1>
        <div className="flex items-center text-primary-600">
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          <span className="text-sm">最終更新: 2025/03/13 18:25</span>
        </div>
      </div>

      {/* フィルターとアクションボタン */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <select
            className="form-input w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">すべてのステータス</option>
            <option value="正常">正常</option>
            <option value="警告">警告</option>
            <option value="異常">異常</option>
          </select>
          <span className="text-sm text-secondary-500">
            表示: {filteredSystems.length} / {systemsData.length}
          </span>
        </div>
        <div className="flex space-x-3">
          <button className="btn btn-primary" onClick={() => setShowPerformanceReport(true)}>
            <ChartBarIcon className="h-5 w-5 mr-2" />
            パフォーマンスレポート
          </button>
          <button className="btn btn-secondary" onClick={() => setShowAddSystemModal(true)}>
            <ServerIcon className="h-5 w-5 mr-2" />
            新規システム追加
          </button>
        </div>
      </div>

      {/* システムカードグリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSystems.map((system) => (
          <SystemCard 
            key={system.id} 
            system={system} 
            onClick={(system) => setSelectedSystem(system)}
          />
        ))}
      </div>

      {/* サマリーセクション */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-secondary-200">
        <h2 className="text-lg font-medium text-secondary-900 mb-4">システム監視サマリー</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
            <div>
              <p className="text-sm text-secondary-500">正常システム</p>
              <p className="text-2xl font-bold text-success-600">
                {systemsData.filter(s => s.status === '正常').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-success-500" />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
            <div>
              <p className="text-sm text-secondary-500">警告中</p>
              <p className="text-2xl font-bold text-warning-600">
                {systemsData.filter(s => s.status === '警告').length}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-warning-500" />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
            <div>
              <p className="text-sm text-secondary-500">異常</p>
              <p className="text-2xl font-bold text-danger-600">
                {systemsData.filter(s => s.status === '異常').length}
              </p>
            </div>
            <XCircleIcon className="h-8 w-8 text-danger-500" />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
            <div>
              <p className="text-sm text-secondary-500">全体稼働率</p>
              <p className="text-2xl font-bold text-primary-600">99.8%</p>
            </div>
            <ClockIcon className="h-8 w-8 text-primary-500" />
          </div>
        </div>
      </div>

      {/* システム詳細モーダル */}
      {selectedSystem && (
        <SystemDetailModal 
          system={selectedSystem} 
          onClose={() => setSelectedSystem(null)} 
        />
      )}

      {/* パフォーマンスレポートモーダル */}
      {showPerformanceReport && (
        <PerformanceReportModal 
          systemsData={systemsData}
          onClose={() => setShowPerformanceReport(false)} 
        />
      )}

      {/* システム追加モーダル */}
      {showAddSystemModal && (
        <AddSystemModal 
          onClose={() => setShowAddSystemModal(false)}
          onAdd={(newSystem) => {
            setSystemsData([...systemsData, newSystem]);
          }}
        />
      )}
    </div>
  );
};

export default SystemMonitoring;
