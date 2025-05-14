import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, Clock, Search, Filter, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { VulnerabilityList } from "./VulnerabilityList";
import { ComplianceList } from "./ComplianceList";
import { SecurityIncidentList } from "./SecurityIncidentList";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { SecurityIncidentForm } from "./SecurityIncidentForm";

export function SecurityPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "vulnerabilities" | "compliance" | "incidents">("dashboard");
  const [showIncidentForm, setShowIncidentForm] = useState(false);

  // セキュリティスコアと統計情報のサンプルデータ
  const securityScore = 72;
  const stats = {
    vulnerabilities: {
      critical: 2,
      high: 8,
      medium: 15,
      low: 22,
      total: 47
    },
    compliance: {
      passed: 85,
      failed: 7,
      warning: 12,
      total: 104
    },
    openIncidents: 5
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1>セキュリティ管理</h1>
          <p className="text-muted-foreground">
            ITサービスとインフラストラクチャのセキュリティリスクを監視・管理
          </p>
        </div>
        <Button onClick={() => setShowIncidentForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規セキュリティインシデント
        </Button>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="dashboard">ダッシュボード</TabsTrigger>
          <TabsTrigger value="vulnerabilities">脆弱性管理</TabsTrigger>
          <TabsTrigger value="compliance">コンプライアンス</TabsTrigger>
          <TabsTrigger value="incidents">セキュリティインシデント</TabsTrigger>
        </TabsList>

        {/* セキュリティダッシュボード */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>セキュリティスコア</CardTitle>
                <CardDescription>全体的なセキュリティ状態</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="relative flex h-40 w-40 items-center justify-center">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <circle
                        className="stroke-muted"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        strokeWidth="10"
                      />
                      <circle
                        className={`stroke-primary ${securityScore >= 70 ? 'stroke-green-500' : securityScore >= 40 ? 'stroke-amber-500' : 'stroke-red-500'}`}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        strokeWidth="10"
                        strokeDasharray={`${securityScore * 2.51} 1000`}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-bold">{securityScore}</span>
                      <span className="text-sm text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${
                      securityScore >= 70 ? 'text-green-600 dark:text-green-400' : 
                      securityScore >= 40 ? 'text-amber-600 dark:text-amber-400' : 
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {securityScore >= 70 ? '良好' : securityScore >= 40 ? '注意が必要' : '危険な状態'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>脆弱性概要</CardTitle>
                <CardDescription>検出された脆弱性の総数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">重大 ({stats.vulnerabilities.critical})</span>
                    </div>
                    <Progress value={(stats.vulnerabilities.critical / stats.vulnerabilities.total) * 100} className="w-1/2 bg-muted" indicatorClassName="bg-red-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm">高 ({stats.vulnerabilities.high})</span>
                    </div>
                    <Progress value={(stats.vulnerabilities.high / stats.vulnerabilities.total) * 100} className="w-1/2 bg-muted" indicatorClassName="bg-orange-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-amber-500"></div>
                      <span className="text-sm">中 ({stats.vulnerabilities.medium})</span>
                    </div>
                    <Progress value={(stats.vulnerabilities.medium / stats.vulnerabilities.total) * 100} className="w-1/2 bg-muted" indicatorClassName="bg-amber-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">低 ({stats.vulnerabilities.low})</span>
                    </div>
                    <Progress value={(stats.vulnerabilities.low / stats.vulnerabilities.total) * 100} className="w-1/2 bg-muted" indicatorClassName="bg-blue-500" />
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("vulnerabilities")}>
                    詳細を表示
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>コンプライアンスステータス</CardTitle>
                <CardDescription>ポリシーと規制への準拠状況</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.compliance.passed}</div>
                      <div className="text-xs text-muted-foreground">合格</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{stats.compliance.warning}</div>
                      <div className="text-xs text-muted-foreground">警告</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{stats.compliance.failed}</div>
                      <div className="text-xs text-muted-foreground">不合格</div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>全体の準拠率</span>
                      <span>{Math.round((stats.compliance.passed / stats.compliance.total) * 100)}%</span>
                    </div>
                    <Progress value={(stats.compliance.passed / stats.compliance.total) * 100} className="h-2" />
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("compliance")}>
                    詳細を表示
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>未対応の重大な脆弱性</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="rounded-md bg-red-50 p-3 dark:bg-red-950">
                    <div className="flex items-start">
                      <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
                      <div>
                        <h4 className="font-medium text-red-600">CVE-2023-1234: SQL Server Remote Code Execution</h4>
                        <p className="text-sm text-red-700">MS-SQL-01サーバーに影響する重大な脆弱性。データベースへの未認証アクセスを許可する可能性があります。</p>
                        <div className="mt-2">
                          <Button size="sm" variant="outline" className="h-7 border-red-200 bg-red-100 text-red-700 hover:bg-red-200 dark:border-red-800 dark:bg-red-900">
                            対応計画を作成
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md bg-red-50 p-3 dark:bg-red-950">
                    <div className="flex items-start">
                      <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
                      <div>
                        <h4 className="font-medium text-red-600">CVE-2023-5678: Microsoft Exchange Server 特権昇格</h4>
                        <p className="text-sm text-red-700">Exchange Onlineに影響する重大な脆弱性。攻撃者が管理者権限を取得する可能性があります。</p>
                        <div className="mt-2">
                          <Button size="sm" variant="outline" className="h-7 border-red-200 bg-red-100 text-red-700 hover:bg-red-200 dark:border-red-800 dark:bg-red-900">
                            対応計画を作成
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>最近のセキュリティインシデント</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                      <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">不審なログイン試行検知</h4>
                      <p className="text-sm text-muted-foreground">海外IPアドレスから複数回の管理者アカウントへのログイン試行を検知しました。</p>
                      <div className="mt-1 flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>2日前</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">異常なデータ転送</h4>
                      <p className="text-sm text-muted-foreground">通常よりも大量のデータ転送が特定のユーザーアカウントから検出されました。</p>
                      <div className="mt-1 flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>5日前</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("incidents")}>
                    すべてのインシデントを表示
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 脆弱性管理タブ */}
        <TabsContent value="vulnerabilities">
          <VulnerabilityList />
        </TabsContent>

        {/* コンプライアンスタブ */}
        <TabsContent value="compliance">
          <ComplianceList />
        </TabsContent>

        {/* セキュリティインシデントタブ */}
        <TabsContent value="incidents">
          <SecurityIncidentList />
        </TabsContent>
      </Tabs>

      <Dialog open={showIncidentForm} onOpenChange={setShowIncidentForm}>
        <DialogContent className="max-h-screen max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新規セキュリティインシデント報告</DialogTitle>
            <DialogDescription>
              セキュリティインシデントの詳細を入力してください
            </DialogDescription>
          </DialogHeader>
          <SecurityIncidentForm 
            onSave={() => setShowIncidentForm(false)}
            onCancel={() => setShowIncidentForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}