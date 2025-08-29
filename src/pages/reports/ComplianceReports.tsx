import React from 'react';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  TrendingUp,
  FileText,
  Award,
  Users,
  Lock,
  AlertCircle,
  Clock,
  Target,
  BarChart3,
  Activity,
  Database
} from 'lucide-react';

// Interfaces for compliance tracking
interface ComplianceFramework {
  id: string;
  name: string;
  fullName: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  score: number;
  lastAssessment: string;
  nextAssessment: string;
  controls: number;
  passedControls: number;
  certificationStatus: 'certified' | 'pending' | 'expired' | 'not-certified';
  certificationExpiry?: string;
}

interface AuditFinding {
  id: string;
  framework: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'closed';
  description: string;
  remediation: string;
  deadline: string;
  assignee: string;
  createdDate: string;
  closedDate?: string;
}

interface ControlTest {
  id: string;
  controlId: string;
  controlName: string;
  framework: string;
  testDate: string;
  result: 'pass' | 'fail' | 'partial';
  effectiveness: number;
  tester: string;
  nextTest: string;
  evidence: string[];
}

interface ComplianceTrend {
  month: string;
  iso20000: number;
  iso27001: number;
  soc2: number;
  gdpr: number;
  pciDss: number;
}

interface RiskAssessment {
  id: string;
  riskArea: string;
  impact: 'high' | 'medium' | 'low';
  likelihood: 'high' | 'medium' | 'low';
  riskLevel: 'high' | 'medium' | 'low';
  mitigation: string;
  owner: string;
  reviewDate: string;
}

const ComplianceReports: React.FC = () => {
  // Mock data for compliance frameworks
  const complianceFrameworks: ComplianceFramework[] = [
    {
      id: 'iso20000',
      name: 'ISO 20000',
      fullName: 'ITサービス管理システム',
      status: 'compliant',
      score: 92,
      lastAssessment: '2024-06-15',
      nextAssessment: '2024-12-15',
      controls: 45,
      passedControls: 41,
      certificationStatus: 'certified',
      certificationExpiry: '2025-06-15'
    },
    {
      id: 'iso27001',
      name: 'ISO 27001',
      fullName: '情報セキュリティ管理システム',
      status: 'compliant',
      score: 88,
      lastAssessment: '2024-05-20',
      nextAssessment: '2024-11-20',
      controls: 114,
      passedControls: 100,
      certificationStatus: 'certified',
      certificationExpiry: '2025-05-20'
    },
    {
      id: 'soc2',
      name: 'SOC 2',
      fullName: 'サービス組織統制',
      status: 'partial',
      score: 76,
      lastAssessment: '2024-07-10',
      nextAssessment: '2025-01-10',
      controls: 32,
      passedControls: 24,
      certificationStatus: 'pending',
    },
    {
      id: 'gdpr',
      name: 'GDPR',
      fullName: '一般データ保護規則',
      status: 'compliant',
      score: 94,
      lastAssessment: '2024-04-25',
      nextAssessment: '2024-10-25',
      controls: 28,
      passedControls: 26,
      certificationStatus: 'certified',
      certificationExpiry: '2025-04-25'
    },
    {
      id: 'pcidss',
      name: 'PCI DSS',
      fullName: 'ペイメントカード業界データセキュリティ基準',
      status: 'non-compliant',
      score: 65,
      lastAssessment: '2024-03-12',
      nextAssessment: '2024-09-12',
      controls: 12,
      passedControls: 8,
      certificationStatus: 'expired',
      certificationExpiry: '2024-03-12'
    }
  ];

  // Mock data for audit findings
  const auditFindings: AuditFinding[] = [
    {
      id: '1',
      framework: 'ISO 27001',
      title: 'アクセス権管理の不備',
      severity: 'high',
      status: 'in-progress',
      description: '元従業員のアクセス権が適切に削除されていない',
      remediation: 'HR退職プロセスの自動化とアクセス権レビューの実装',
      deadline: '2024-09-15',
      assignee: '佐藤 太郎',
      createdDate: '2024-07-20'
    },
    {
      id: '2',
      framework: 'PCI DSS',
      title: 'ネットワークセグメンテーションの欠如',
      severity: 'high',
      status: 'open',
      description: 'カードホルダーデータ環境の適切な分離がされていない',
      remediation: 'ファイアウォール規則の見直しとネットワーク分離の実装',
      deadline: '2024-10-01',
      assignee: '田中 花子',
      createdDate: '2024-08-01'
    },
    {
      id: '3',
      framework: 'SOC 2',
      title: 'ログ監視体制の不十分',
      severity: 'medium',
      status: 'in-progress',
      description: 'セキュリティログの監視とアラート体制が不十分',
      remediation: 'SIEM導入とログ監視プロセスの確立',
      deadline: '2024-09-30',
      assignee: '山田 次郎',
      createdDate: '2024-07-15'
    },
    {
      id: '4',
      framework: 'GDPR',
      title: 'データ保持期間の管理',
      severity: 'medium',
      status: 'closed',
      description: '個人データの保持期間が適切に管理されていない',
      remediation: 'データライフサイクル管理ポリシーの策定と実装',
      deadline: '2024-08-15',
      assignee: '鈴木 三郎',
      createdDate: '2024-06-20',
      closedDate: '2024-08-10'
    }
  ];

  // Mock data for control tests
  const controlTests: ControlTest[] = [
    {
      id: '1',
      controlId: 'A.9.2.1',
      controlName: 'ユーザー登録と登録削除',
      framework: 'ISO 27001',
      testDate: '2024-08-15',
      result: 'pass',
      effectiveness: 95,
      tester: '監査チーム',
      nextTest: '2024-11-15',
      evidence: ['アクセス権レビュー記録', '退職者チェックリスト']
    },
    {
      id: '2',
      controlId: 'A.12.6.1',
      controlName: '脆弱性管理',
      framework: 'ISO 27001',
      testDate: '2024-08-10',
      result: 'partial',
      effectiveness: 78,
      tester: 'セキュリティチーム',
      nextTest: '2024-11-10',
      evidence: ['脆弱性スキャン結果', '修正記録']
    },
    {
      id: '3',
      controlId: 'CC6.1',
      controlName: '論理・物理アクセス統制',
      framework: 'SOC 2',
      testDate: '2024-08-05',
      result: 'fail',
      effectiveness: 45,
      tester: '外部監査人',
      nextTest: '2024-09-05',
      evidence: ['アクセスログ', '物理アクセス記録']
    }
  ];

  // Mock data for compliance trends
  const complianceTrends: ComplianceTrend[] = [
    { month: '2024-03', iso20000: 85, iso27001: 82, soc2: 70, gdpr: 88, pciDss: 60 },
    { month: '2024-04', iso20000: 87, iso27001: 84, soc2: 72, gdpr: 90, pciDss: 62 },
    { month: '2024-05', iso20000: 89, iso27001: 86, soc2: 74, gdpr: 92, pciDss: 63 },
    { month: '2024-06', iso20000: 91, iso27001: 87, soc2: 75, gdpr: 93, pciDss: 64 },
    { month: '2024-07', iso20000: 92, iso27001: 88, soc2: 76, gdpr: 94, pciDss: 65 },
    { month: '2024-08', iso20000: 92, iso27001: 88, soc2: 76, gdpr: 94, pciDss: 65 }
  ];

  // Mock data for risk assessment
  const riskAssessments: RiskAssessment[] = [
    {
      id: '1',
      riskArea: 'データ漏洩',
      impact: 'high',
      likelihood: 'medium',
      riskLevel: 'high',
      mitigation: 'データ暗号化とアクセス制御の強化',
      owner: 'セキュリティ責任者',
      reviewDate: '2024-09-15'
    },
    {
      id: '2',
      riskArea: 'システム障害',
      impact: 'high',
      likelihood: 'low',
      riskLevel: 'medium',
      mitigation: '冗長化とバックアップ体制の確立',
      owner: 'インフラ責任者',
      reviewDate: '2024-10-01'
    },
    {
      id: '3',
      riskArea: 'コンプライアンス違反',
      impact: 'medium',
      likelihood: 'medium',
      riskLevel: 'medium',
      mitigation: '定期的な監査と教育プログラムの実施',
      owner: 'コンプライアンス責任者',
      reviewDate: '2024-09-30'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'pass':
      case 'certified':
      case 'closed':
        return 'text-green-400';
      case 'partial':
      case 'in-progress':
      case 'pending':
        return 'text-yellow-400';
      case 'non-compliant':
      case 'fail':
      case 'expired':
      case 'open':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'pass':
      case 'certified':
      case 'closed':
        return <CheckCircle className="w-5 h-5" />;
      case 'partial':
      case 'in-progress':
      case 'pending':
        return <AlertTriangle className="w-5 h-5" />;
      case 'non-compliant':
      case 'fail':
      case 'expired':
      case 'open':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 text-red-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">コンプライアンスレポート</h1>
          </div>
          <p className="text-gray-300">IT統制・規制要件の遵守状況とリスク評価</p>
        </div>

        {/* Compliance Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {complianceFrameworks.map((framework) => (
            <div key={framework.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">{framework.name}</h3>
                </div>
                <div className={`flex items-center gap-1 ${getStatusColor(framework.status)}`}>
                  {getStatusIcon(framework.status)}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">コンプライアンススコア</span>
                  <span className="text-white font-bold text-lg">{framework.score}%</span>
                </div>
                
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                    style={{ width: `${framework.score}%` }}
                  ></div>
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">統制項目</span>
                    <span className="text-gray-300">{framework.passedControls}/{framework.controls}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">認証状況</span>
                    <span className={getStatusColor(framework.certificationStatus)}>
                      {framework.certificationStatus === 'certified' ? '認証済' :
                       framework.certificationStatus === 'pending' ? '審査中' :
                       framework.certificationStatus === 'expired' ? '期限切れ' : '未認証'}
                    </span>
                  </div>
                  {framework.certificationExpiry && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">認証期限</span>
                      <span className="text-gray-300 text-xs">{framework.certificationExpiry}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Compliance Trends */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">コンプライアンス傾向</h2>
            </div>
            
            <div className="space-y-4">
              {complianceFrameworks.map((framework) => {
                const trend = complianceTrends[complianceTrends.length - 1];
                const prevTrend = complianceTrends[complianceTrends.length - 2];
                const currentScore = trend[framework.id as keyof ComplianceTrend] as number;
                const prevScore = prevTrend[framework.id as keyof ComplianceTrend] as number;
                const change = currentScore - prevScore;
                
                return (
                  <div key={framework.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                      <span className="text-white font-medium">{framework.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{currentScore}%</span>
                      <span className={`text-sm flex items-center gap-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Assessment Matrix */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold text-white">リスク評価マトリックス</h2>
            </div>
            
            <div className="space-y-4">
              {riskAssessments.map((risk) => (
                <div key={risk.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">{risk.riskArea}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getRiskColor(risk.riskLevel)}`}>
                      {risk.riskLevel === 'high' ? '高' : risk.riskLevel === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">影響度:</span>
                      <span className={`ml-2 px-2 py-1 rounded ${getRiskColor(risk.impact)}`}>
                        {risk.impact === 'high' ? '高' : risk.impact === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">発生可能性:</span>
                      <span className={`ml-2 px-2 py-1 rounded ${getRiskColor(risk.likelihood)}`}>
                        {risk.likelihood === 'high' ? '高' : risk.likelihood === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm">
                    <div className="text-gray-400">対策:</div>
                    <div className="text-gray-300 mt-1">{risk.mitigation}</div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="text-gray-400">担当者: {risk.owner}</span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      レビュー期限: {risk.reviewDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Audit Findings and Remediation Tracking */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-semibold text-white">監査指摘事項・改善追跡</h2>
            </div>
            
            <div className="space-y-4">
              {auditFindings.map((finding) => (
                <div key={finding.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(finding.severity)}`}>
                          {finding.severity === 'high' ? '高' : finding.severity === 'medium' ? '中' : '低'}
                        </span>
                        <span className="text-gray-400 text-sm">{finding.framework}</span>
                      </div>
                      <h4 className="text-white font-medium mb-2">{finding.title}</h4>
                      <p className="text-gray-300 text-sm mb-2">{finding.description}</p>
                    </div>
                    <div className={`flex items-center gap-1 ${getStatusColor(finding.status)}`}>
                      {getStatusIcon(finding.status)}
                      <span className="text-xs">
                        {finding.status === 'open' ? '対応中' :
                         finding.status === 'in-progress' ? '進行中' : '完了'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-gray-400">改善計画:</span>
                      <div className="text-gray-300 mt-1">{finding.remediation}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">担当者: {finding.assignee}</span>
                      <span className={`flex items-center gap-1 ${new Date(finding.deadline) < new Date() ? 'text-red-400' : 'text-gray-400'}`}>
                        <Clock className="w-4 h-4" />
                        期限: {finding.deadline}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Control Testing Results */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">統制テスト結果</h2>
            </div>
            
            <div className="space-y-4">
              {controlTests.map((test) => (
                <div key={test.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-400 text-sm">{test.controlId}</span>
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-gray-400 text-sm">{test.framework}</span>
                      </div>
                      <h4 className="text-white font-medium mb-2">{test.controlName}</h4>
                    </div>
                    <div className={`flex items-center gap-1 ${getStatusColor(test.result)}`}>
                      {getStatusIcon(test.result)}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">有効性スコア</span>
                      <span className="text-white font-bold">{test.effectiveness}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          test.effectiveness >= 80 ? 'bg-green-400' :
                          test.effectiveness >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${test.effectiveness}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">テスト実施者: {test.tester}</span>
                      <span className="text-gray-400">実施日: {test.testDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">次回テスト: {test.nextTest}</span>
                      <span className="text-gray-400">証跡数: {test.evidence.length}件</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Collection Process Documentation */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">データ収集・検証プロセス</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-green-400" />
                データ収集
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="font-medium text-white mb-1">自動収集システム</div>
                  <p>ITサービス管理システムから自動的にログ、メトリクス、設定情報を24時間体制で収集しています。</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="font-medium text-white mb-1">手動データ入力</div>
                  <p>定期的な監査結果、証跡資料、外部評価結果などを担当者が定期的に入力・更新しています。</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="font-medium text-white mb-1">第三者機関データ</div>
                  <p>外部監査機関、認証機関からの評価結果や指摘事項を統合して管理しています。</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                データ検証
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="font-medium text-white mb-1">多段階検証</div>
                  <p>収集データの整合性を自動チェック、異常値検出、相関関係分析により品質を保証しています。</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="font-medium text-white mb-1">クロスリファレンス</div>
                  <p>複数のデータソースから得られた情報を照合し、データの信頼性を向上させています。</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="font-medium text-white mb-1">専門家レビュー</div>
                  <p>コンプライアンス専門家による定期的なデータレビューと妥当性確認を実施しています。</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                レポート生成
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="font-medium text-white mb-1">リアルタイム更新</div>
                  <p>コンプライアンススコアと指標は収集データの更新に合わせてリアルタイムで再計算されます。</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="font-medium text-white mb-1">トレーサビリティ</div>
                  <p>全ての数値とスコアについて、元データまで遡って確認できる完全な監査証跡を保持しています。</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="font-medium text-white mb-1">定期検証</div>
                  <p>月次でデータ品質レビューを実施し、四半期ごとに外部機関による妥当性評価を受けています。</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <h4 className="text-white font-medium mb-2">データ品質保証</h4>
                <p className="text-sm text-gray-300">
                  当システムのコンプライアンスデータは、ISO 20000、ISO 27001、SOC 2、GDPR、PCI DSSの各要求事項に準拠した
                  データ管理プロセスに基づいて収集・検証・報告されています。データの完全性、機密性、可用性を確保するため、
                  定期的な内部監査と外部評価を実施し、継続的な改善を行っています。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Score Summary */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">総合コンプライアンススコア</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">85%</div>
              <div className="text-gray-300">全体平均スコア</div>
              <div className="text-sm text-gray-400 mt-1">前月比 +2%</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">12</div>
              <div className="text-gray-300">未解決指摘事項</div>
              <div className="text-sm text-gray-400 mt-1">高リスク: 3件</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">95%</div>
              <div className="text-gray-300">統制テスト合格率</div>
              <div className="text-sm text-gray-400 mt-1">今月実施: 24件</div>
            </div>
          </div>
        </div>

        {/* Certification Status Overview */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-gold-400" />
            <h2 className="text-xl font-semibold text-white">認証状況サマリー</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">3</div>
              <div className="text-green-300 text-sm">認証済</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
              <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-400">1</div>
              <div className="text-yellow-300 text-sm">審査中</div>
            </div>
            
            <div className="text-center p-4 bg-red-500/20 rounded-lg border border-red-500/30">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-400">1</div>
              <div className="text-red-300 text-sm">期限切れ</div>
            </div>
            
            <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-400">45</div>
              <div className="text-blue-300 text-sm">平均有効日数</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceReports;