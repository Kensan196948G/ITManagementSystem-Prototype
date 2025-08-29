// Mock data service for ITSM system - provides realistic sample data for development and testing

export interface Incident {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  category: string;
  assignedTo?: string;
  reportedBy: string;
  affectedServices: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  impact: 'Low' | 'Medium' | 'High';
  urgency: 'Low' | 'Medium' | 'High';
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Investigating' | 'Known Error' | 'Resolved' | 'Closed';
  category: string;
  assignedTo?: string;
  reportedBy: string;
  rootCause?: string;
  workaround?: string;
  solution?: string;
  relatedIncidents: string[];
  affectedServices: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  priority: 'Emergency' | 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'In Progress' | 'Implemented' | 'Closed';
  category: string;
  requestedBy: string;
  assignedTo?: string;
  approver?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  impact: string;
  rollbackPlan: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigurationItem {
  id: string;
  name: string;
  type: 'Hardware' | 'Software' | 'Service' | 'Documentation' | 'Location';
  status: 'Active' | 'Inactive' | 'Under Change' | 'Retired';
  owner: string;
  location: string;
  description: string;
  attributes: Record<string, any>;
  relationships: Array<{
    type: 'depends_on' | 'used_by' | 'connected_to' | 'installed_on';
    targetId: string;
    targetName: string;
  }>;
  lastUpdated: string;
}

export interface ServiceLevelAgreement {
  id: string;
  serviceName: string;
  availability: number;
  responseTime: number;
  resolutionTime: number;
  customer: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Under Review';
}

// Mock Incidents Data
export const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    title: 'メールサーバーの応答遅延',
    description: '社内メールシステムにおいて、メール送受信の遅延が発生しています。複数のユーザーから同様の報告があり、メールの送信に通常の10倍以上の時間がかかっている状況です。',
    priority: 'High',
    status: 'In Progress',
    category: 'インフラストラクチャ',
    assignedTo: '田中 太郎',
    reportedBy: '佐藤 花子',
    affectedServices: ['Exchange Server', 'Outlook Web App', 'Mobile Sync'],
    createdAt: '2024-01-15 09:30:00',
    updatedAt: '2024-01-15 11:45:00',
    impact: 'High',
    urgency: 'High'
  },
  {
    id: 'INC-002',
    title: 'VPNアクセスの断続的な障害',
    description: 'リモートワーカーのVPN接続が不安定になっています。30分間隔で接続が切断され、業務に大きな支障をきたしています。',
    priority: 'Medium',
    status: 'Open',
    category: 'ネットワーク',
    reportedBy: '山田 次郎',
    affectedServices: ['FortiGate VPN', 'Remote Desktop', 'File Share'],
    createdAt: '2024-01-15 14:20:00',
    updatedAt: '2024-01-15 14:20:00',
    impact: 'Medium',
    urgency: 'Medium'
  },
  {
    id: 'INC-003',
    title: 'Webサイトの表示エラー',
    description: '企業サイトの製品紹介ページで404エラーが発生しています。顧客からの問い合わせもあり、ブランドイメージへの影響が懸念されます。',
    priority: 'Low',
    status: 'Resolved',
    category: 'アプリケーション',
    assignedTo: '鈴木 一郎',
    reportedBy: '高橋 美咲',
    affectedServices: ['Corporate Website', 'CDN', 'Product Catalog'],
    createdAt: '2024-01-14 16:15:00',
    updatedAt: '2024-01-15 10:30:00',
    resolvedAt: '2024-01-15 10:30:00',
    resolution: 'Webサーバーの設定を修正し、リンク切れを解消しました。',
    impact: 'Low',
    urgency: 'Low'
  },
  {
    id: 'INC-004',
    title: 'データベース接続エラー',
    description: 'CRMシステムでデータベース接続の問題が発生しています。営業チームが顧客情報にアクセスできない状態です。',
    priority: 'Critical',
    status: 'Open',
    category: 'データベース',
    reportedBy: '伊藤 健太',
    affectedServices: ['CRM Database', 'Sales Portal', 'Customer Service App'],
    createdAt: '2024-01-15 08:00:00',
    updatedAt: '2024-01-15 08:15:00',
    impact: 'High',
    urgency: 'High'
  },
  {
    id: 'INC-005',
    title: 'プリンターネットワーク接続障害',
    description: '3階のプリンター全台がネットワークから切断されています。印刷業務に支障が出ています。',
    priority: 'Medium',
    status: 'In Progress',
    category: 'ハードウェア',
    assignedTo: '松本 恵子',
    reportedBy: '小林 正樹',
    affectedServices: ['Network Printers', 'Print Spooler', 'Document Management'],
    createdAt: '2024-01-15 13:45:00',
    updatedAt: '2024-01-15 15:20:00',
    impact: 'Medium',
    urgency: 'Medium'
  },
  {
    id: 'INC-006',
    title: 'セキュリティソフトの誤検知',
    description: '業務用ソフトウェアがウイルスとして誤検知され、複数のPCで実行できない状況です。',
    priority: 'High',
    status: 'Resolved',
    category: 'セキュリティ',
    assignedTo: '渡辺 健二',
    reportedBy: '中村 美由紀',
    affectedServices: ['Antivirus Software', 'Business Applications', 'File System'],
    createdAt: '2024-01-14 11:30:00',
    updatedAt: '2024-01-15 09:15:00',
    resolvedAt: '2024-01-15 09:15:00',
    resolution: 'ウイルス定義ファイルを更新し、例外リストに該当ソフトウェアを追加しました。',
    impact: 'High',
    urgency: 'High'
  },
  {
    id: 'INC-007',
    title: 'チャットシステムの同期問題',
    description: '社内チャットでメッセージの同期に遅延が発生しています。チーム間のコミュニケーションに影響しています。',
    priority: 'Low',
    status: 'Open',
    category: 'アプリケーション',
    reportedBy: '青木 智子',
    affectedServices: ['Chat System', 'Notification Service', 'Mobile App'],
    createdAt: '2024-01-15 16:00:00',
    updatedAt: '2024-01-15 16:00:00',
    impact: 'Low',
    urgency: 'Low'
  }
];

// Mock Problems Data
export const mockProblems: Problem[] = [
  {
    id: 'PRB-001',
    title: 'メールサーバーの定期的な性能劣化',
    description: '月曜日の朝に毎回メールサーバーのパフォーマンスが低下する問題が継続して発生しています。システム負荷の分析が必要です。',
    priority: 'High',
    status: 'Investigating',
    category: 'インフラストラクチャ',
    assignedTo: '田中 太郎',
    reportedBy: '佐藤 花子',
    relatedIncidents: ['INC-001', 'INC-005', 'INC-012'],
    affectedServices: ['Exchange Server', 'Outlook Web App', 'Mobile Sync'],
    createdAt: '2024-01-10 09:30:00',
    updatedAt: '2024-01-15 14:20:00',
    rootCause: 'バックアップジョブとメール処理の競合による負荷増加',
    workaround: 'バックアップ処理を深夜時間帯にスケジュール変更'
  },
  {
    id: 'PRB-002',
    title: 'VPN接続の断続的な切断問題',
    description: 'リモートワーカーのVPN接続が30分ごとに切断される問題が複数のユーザーで発生。ネットワーク機器の設定に問題がある可能性。',
    priority: 'Medium',
    status: 'Known Error',
    category: 'ネットワーク',
    assignedTo: '山田 次郎',
    reportedBy: '鈴木 一郎',
    relatedIncidents: ['INC-002', 'INC-007'],
    affectedServices: ['FortiGate VPN', 'Remote Desktop', 'File Share'],
    createdAt: '2024-01-08 11:15:00',
    updatedAt: '2024-01-14 16:30:00',
    rootCause: 'VPNクライアントソフトウェアのキープアライブ設定の不具合',
    workaround: '手動での再接続またはVPNクライアント設定の調整',
    solution: 'VPNクライアントソフトウェアの最新版へのアップデート'
  },
  {
    id: 'PRB-003',
    title: 'データベースのメモリリークによる性能低下',
    description: 'CRMデータベースで長時間運用後にメモリ使用量が異常に増加し、応答が遅延する問題が継続的に発生しています。',
    priority: 'Critical',
    status: 'Open',
    category: 'データベース',
    reportedBy: '高橋 美咲',
    relatedIncidents: ['INC-004', 'INC-008'],
    affectedServices: ['CRM Database', 'Sales Portal', 'Customer Service App'],
    createdAt: '2024-01-12 08:45:00',
    updatedAt: '2024-01-15 10:00:00'
  },
  {
    id: 'PRB-004',
    title: 'Webアプリケーションでのセッション管理の問題',
    description: 'ユーザーセッションが予期せず終了し、作業内容が失われる問題が頻発。セッション管理機能の見直しが必要。',
    priority: 'High',
    status: 'Resolved',
    category: 'アプリケーション',
    assignedTo: '伊藤 健太',
    reportedBy: '松本 恵子',
    relatedIncidents: ['INC-010', 'INC-013'],
    affectedServices: ['Web Application', 'Session Store', 'User Authentication'],
    createdAt: '2024-01-05 14:20:00',
    updatedAt: '2024-01-13 11:45:00',
    resolvedAt: '2024-01-13 11:45:00',
    rootCause: 'セッションストレージの容量不足とガベージコレクションの不具合',
    solution: 'セッションストレージの容量拡張とガベージコレクション設定の最適化'
  },
  {
    id: 'PRB-005',
    title: 'ネットワーク機器の過熱による障害',
    description: 'サーバールームの空調システムの不調により、ネットワーク機器が過熱し、断続的に障害が発生しています。',
    priority: 'High',
    status: 'Known Error',
    category: 'ハードウェア',
    assignedTo: '渡辺 健二',
    reportedBy: '小林 正樹',
    relatedIncidents: ['INC-015', 'INC-018'],
    affectedServices: ['Core Switches', 'Router', 'Firewall'],
    createdAt: '2024-01-11 10:30:00',
    updatedAt: '2024-01-15 09:45:00',
    rootCause: '空調システムのフィルター詰まりによる冷却能力低下',
    workaround: '緊急用ポータブル空調機での一時的な冷却'
  }
];

// Mock Change Requests Data
export const mockChangeRequests: ChangeRequest[] = [
  {
    id: 'CHG-001',
    title: 'メールサーバーのセキュリティパッチ適用',
    description: 'Exchange Serverの最新セキュリティパッチを適用し、既知の脆弱性を修正します。',
    priority: 'High',
    status: 'Approved',
    category: 'セキュリティ',
    requestedBy: '田中 太郎',
    assignedTo: '佐藤 花子',
    approver: '管理者',
    plannedStartDate: '2024-01-20 02:00:00',
    plannedEndDate: '2024-01-20 04:00:00',
    riskLevel: 'Medium',
    impact: 'メールサービスの2時間停止',
    rollbackPlan: '事前に作成したシステムバックアップからの復旧',
    createdAt: '2024-01-10 14:30:00',
    updatedAt: '2024-01-15 10:20:00'
  },
  {
    id: 'CHG-002',
    title: '新規CRMシステムの導入',
    description: '既存のCRMシステムを新しいクラウドベースのソリューションに移行します。',
    priority: 'Medium',
    status: 'Under Review',
    category: 'アプリケーション',
    requestedBy: '山田 次郎',
    plannedStartDate: '2024-02-01 09:00:00',
    plannedEndDate: '2024-02-15 17:00:00',
    riskLevel: 'High',
    impact: 'CRM機能の一時的な制限、データ移行期間中のアクセス制限',
    rollbackPlan: '旧CRMシステムの維持とデータの逆同期',
    createdAt: '2024-01-08 11:00:00',
    updatedAt: '2024-01-14 16:45:00'
  }
];

// Mock Configuration Items Data
export const mockConfigurationItems: ConfigurationItem[] = [
  {
    id: 'CI-001',
    name: 'MAIL-SERVER-01',
    type: 'Hardware',
    status: 'Active',
    owner: '田中 太郎',
    location: 'データセンター A-1',
    description: 'メインメールサーバー (Exchange Server)',
    attributes: {
      manufacturer: 'Dell',
      model: 'PowerEdge R740',
      serialNumber: 'SN123456789',
      cpu: 'Intel Xeon Gold 6230',
      memory: '128GB DDR4',
      storage: '2TB SSD RAID1',
      operatingSystem: 'Windows Server 2019',
      ipAddress: '192.168.1.100'
    },
    relationships: [
      {
        type: 'connected_to',
        targetId: 'CI-002',
        targetName: 'CORE-SWITCH-01'
      },
      {
        type: 'used_by',
        targetId: 'SVC-001',
        targetName: 'Email Service'
      }
    ],
    lastUpdated: '2024-01-15 10:30:00'
  },
  {
    id: 'CI-002',
    name: 'CORE-SWITCH-01',
    type: 'Hardware',
    status: 'Active',
    owner: '山田 次郎',
    location: 'データセンター A-1',
    description: 'コアネットワークスイッチ',
    attributes: {
      manufacturer: 'Cisco',
      model: 'Catalyst 9300',
      serialNumber: 'CSC987654321',
      ports: '48 x 1GbE',
      firmware: '16.12.04',
      managementIP: '192.168.1.10'
    },
    relationships: [
      {
        type: 'connected_to',
        targetId: 'CI-001',
        targetName: 'MAIL-SERVER-01'
      }
    ],
    lastUpdated: '2024-01-14 15:20:00'
  }
];

// Mock Service Level Agreements Data
export const mockSLAs: ServiceLevelAgreement[] = [
  {
    id: 'SLA-001',
    serviceName: 'メールサービス',
    availability: 99.9,
    responseTime: 2,
    resolutionTime: 4,
    customer: '全社',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'Active'
  },
  {
    id: 'SLA-002',
    serviceName: 'VPNサービス',
    availability: 99.5,
    responseTime: 1,
    resolutionTime: 2,
    customer: 'リモートワーカー',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'Active'
  }
];

// Mock API functions
export const mockApi = {
  // Incident API
  incidents: {
    getAll: async (filters?: any): Promise<Incident[]> => {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      return mockIncidents.filter(incident => {
        if (filters?.status && filters.status !== 'All' && incident.status !== filters.status) return false;
        if (filters?.priority && filters.priority !== 'All' && incident.priority !== filters.priority) return false;
        if (filters?.search && !incident.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      });
    },
    
    getById: async (id: string): Promise<Incident | null> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockIncidents.find(incident => incident.id === id) || null;
    },
    
    create: async (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newIncident: Incident = {
        ...incident,
        id: `INC-${String(mockIncidents.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      mockIncidents.push(newIncident);
      return newIncident;
    },
    
    update: async (id: string, updates: Partial<Incident>): Promise<Incident | null> => {
      await new Promise(resolve => setTimeout(resolve, 400));
      const index = mockIncidents.findIndex(incident => incident.id === id);
      if (index === -1) return null;
      
      mockIncidents[index] = {
        ...mockIncidents[index],
        ...updates,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      return mockIncidents[index];
    }
  },

  // Problem API
  problems: {
    getAll: async (filters?: any): Promise<Problem[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockProblems.filter(problem => {
        if (filters?.status && filters.status !== 'All' && problem.status !== filters.status) return false;
        if (filters?.priority && filters.priority !== 'All' && problem.priority !== filters.priority) return false;
        if (filters?.search && !problem.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      });
    },
    
    getById: async (id: string): Promise<Problem | null> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockProblems.find(problem => problem.id === id) || null;
    },
    
    create: async (problem: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>): Promise<Problem> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newProblem: Problem = {
        ...problem,
        id: `PRB-${String(mockProblems.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      mockProblems.push(newProblem);
      return newProblem;
    },
    
    update: async (id: string, updates: Partial<Problem>): Promise<Problem | null> => {
      await new Promise(resolve => setTimeout(resolve, 400));
      const index = mockProblems.findIndex(problem => problem.id === id);
      if (index === -1) return null;
      
      mockProblems[index] = {
        ...mockProblems[index],
        ...updates,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      return mockProblems[index];
    }
  },

  // Change Request API
  changeRequests: {
    getAll: async (): Promise<ChangeRequest[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockChangeRequests;
    }
  },

  // Configuration Items API
  configurationItems: {
    getAll: async (): Promise<ConfigurationItem[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockConfigurationItems;
    }
  },

  // SLA API
  slas: {
    getAll: async (): Promise<ServiceLevelAgreement[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockSLAs;
    }
  }
};

// Statistics helper functions
export const getIncidentStatistics = () => {
  const stats = {
    total: mockIncidents.length,
    byStatus: mockIncidents.reduce((acc, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byPriority: mockIncidents.reduce((acc, incident) => {
      acc[incident.priority] = (acc[incident.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byCategory: mockIncidents.reduce((acc, incident) => {
      acc[incident.category] = (acc[incident.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
  return stats;
};

export const getProblemStatistics = () => {
  const stats = {
    total: mockProblems.length,
    byStatus: mockProblems.reduce((acc, problem) => {
      acc[problem.status] = (acc[problem.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byPriority: mockProblems.reduce((acc, problem) => {
      acc[problem.priority] = (acc[problem.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    knownErrors: mockProblems.filter(p => p.status === 'Known Error').length
  };
  return stats;
};

export default mockApi;