import { useState } from "react";
import { 
  AlertCircle,
  ArrowLeft, 
  Calendar, 
  Clock, 
  Edit, 
  FileText, 
  HelpCircle, 
  History, 
  LineChart, 
  ShieldAlert, 
  Target, 
  BarChart4, 
  Bell, 
  Users
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// SLA詳細のサンプルデータ
const slaDetail = {
  id: "SLA-002",
  name: "Active Directory認証サービス",
  service: "Active Directory",
  category: "可用性",
  target: "99.99%",
  status: "適合",
  compliance: 99.995,
  priority: "最高",
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  responsibleTeam: "インフラチーム",
  responseTime: {
    critical: "15分",
    high: "30分",
    medium: "2時間",
    low: "4時間"
  },
  resolutionTime: {
    critical: "2時間",
    high: "4時間",
    medium: "8時間",
    low: "24時間"
  },
  violations: 0,
  lastChecked: "2025-05-10T08:30:00",
  description: "Active Directoryのドメインコントローラーサービスの可用性に関するSLA。ユーザー認証、グループポリシー適用などの主要なActive Directory機能の稼働を保証します。",
  scope: [
    "ユーザー認証・認可サービス",
    "グループポリシーの適用",
    "DNSサービス",
    "KerberosとNTLM認証",
    "ドメインレプリケーション"
  ],
  excludedItems: [
    "端末側の問題による認証エラー",
    "ネットワーク到達性の問題",
    "計画メンテナンス時間",
    "ユーザーによる誤操作"
  ],
  metrics: [
    {
      name: "サービス可用性",
      description: "Active Directoryの認証サービスが正常に動作している時間の割合",
      target: "99.99%",
      calculation: "(合計時間 - ダウンタイム) / 合計時間 × 100",
      threshold: {
        green: "≥ 99.99%",
        yellow: "99.95% - 99.99%",
        red: "< 99.95%"
      },
      currentValue: "99.995%",
      status: "適合"
    },
    {
      name: "認証レスポンスタイム",
      description: "認証リクエストから応答までの平均時間",
      target: "< 200ms",
      calculation: "認証要求の応答時間の平均値",
      threshold: {
        green: "< 200ms",
        yellow: "200ms - 500ms",
        red: "> 500ms"
      },
      currentValue: "156ms",
      status: "適合"
    },
    {
      name: "レプリケーション整合性",
      description: "ドメインコントローラー間のレプリケーション整合性",
      target: "99.9%",
      calculation: "整合性チェックの成功率",
      threshold: {
        green: "≥ 99.9%",
        yellow: "99.5% - 99.9%",
        red: "< 99.5%"
      },
      currentValue: "99.97%",
      status: "適合"
    }
  ],
  servicePeriod: "24時間365日",
  maintenanceWindow: "毎月第2日曜日 22:00-翌02:00",
  monitoringFrequency: "5分ごと",
  reportingFrequency: "月次",
  escalationContacts: [
    { name: "高橋一郎", role: "インフラチーム責任者", email: "takahashi.i@example.com", phone: "080-1234-5678" },
    { name: "佐藤三郎", role: "IT部長", email: "sato.s@example.com", phone: "080-2345-6789" },
    { name: "鈴木花子", role: "情報システム部長", email: "suzuki.h@example.com", phone: "080-3456-7890" }
  ],
  violations: [],
  performanceHistory: [
    { period: "2025年4月", compliance: 99.998, status: "適合" },
    { period: "2025年3月", compliance: 99.995, status: "適合" },
    { period: "2025年2月", compliance: 99.997, status: "適合" },
    { period: "2025年1月", compliance: 99.99, status: "適合" },
    { period: "2024年12月", compliance: 99.996, status: "適合" },
    { period: "2024年11月", compliance: 99.994, status: "適合" }
  ],
  relatedIncidents: [],
  supportingOLAs: [
    { id: "OLA-001", name: "ネットワークチームとの運用レベル契約", team: "ネットワークチーム", compliance: 100 },
    { id: "OLA-002", name: "サーバーチームとの運用レベル契約", team: "インフラチーム", compliance: 99.9 },
    { id: "OLA-003", name: "ヘルプデスクとの運用レベル契約", team: "サポートチーム", compliance: 98.7 }
  ],
  reviewHistory: [
    { date: "2025-04-05", reviewer: "山田太郎", notes: "四半期レビュー実施、すべての指標が目標を満たしている" },
    { date: "2025-01-10", reviewer: "山田太郎", notes: "年次レビュー実施、SLA継続を承認" },
    { date: "2024-10-08", reviewer: "佐藤三郎", notes: "半期レビュー実施、メトリクスの監視頻度を10分から5分に変更" }
  ]
};

// 日付フォーマット用ユーティリティ関数
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).format(date);
}

// 日時フォーマット用ユーティリティ関数
function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function SLADetail({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2>{slaDetail.id}: {slaDetail.name}</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>SLA詳細</CardTitle>
                  <CardDescription>サービスレベル契約の詳細情報</CardDescription>
                </div>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">説明</h4>
                <p>{slaDetail.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">サービス</h4>
                  <p>{slaDetail.service}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">カテゴリ</h4>
                  <p>{slaDetail.category}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">目標</h4>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {slaDetail.target}
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">優先度</h4>
                  <PriorityBadge priority={slaDetail.priority} />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">ステータス</h4>
                  <SLAStatusBadge status={slaDetail.status} />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">コンプライアンス</h4>
                  <div className="flex items-center space-x-2">
                    <Progress value={slaDetail.compliance} className="h-2 w-[100px]" />
                    <span>{slaDetail.compliance}%</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">開始日</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(slaDetail.startDate)}</span>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">終了日</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(slaDetail.endDate)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">担当チーム</h4>
                <p>{slaDetail.responsibleTeam}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">サービス提供時間</h4>
                  <p>{slaDetail.servicePeriod}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">メンテナンスウィンドウ</h4>
                  <p>{slaDetail.maintenanceWindow}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">監視頻度</h4>
                  <p>{slaDetail.monitoringFrequency}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">レポート頻度</h4>
                  <p>{slaDetail.reportingFrequency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <Tabs defaultValue="metrics" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="metrics">メトリクス</TabsTrigger>
                <TabsTrigger value="response">対応時間</TabsTrigger>
                <TabsTrigger value="scope">適用範囲</TabsTrigger>
                <TabsTrigger value="history">履歴</TabsTrigger>
                <TabsTrigger value="olas">関連OLA</TabsTrigger>
              </TabsList>
              
              <TabsContent value="metrics" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>パフォーマンスメトリクス</CardTitle>
                    <CardDescription>SLAの測定指標と現在の状態</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {slaDetail.metrics.map((metric, index) => (
                        <div key={index} className="rounded-md border p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-base font-medium">{metric.name}</h3>
                            <SLAStatusBadge status={metric.status} />
                          </div>
                          <p className="mb-3 text-sm">{metric.description}</p>
                          <div className="mb-4 grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-muted-foreground">目標</div>
                              <div className="font-medium">{metric.target}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">現在値</div>
                              <div className="font-medium">{metric.currentValue}</div>
                            </div>
                          </div>
                          <div className="mb-2 text-xs text-muted-foreground">計算方法</div>
                          <div className="rounded-md bg-muted p-2 text-sm">
                            {metric.calculation}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <div className="rounded-md bg-green-100 p-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                              適合: {metric.threshold.green}
                            </div>
                            <div className="rounded-md bg-yellow-100 p-1 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              警告: {metric.threshold.yellow}
                            </div>
                            <div className="rounded-md bg-red-100 p-1 text-xs text-red-800 dark:bg-red-900 dark:text-red-200">
                              違反: {metric.threshold.red}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="response" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>対応時間SLA</CardTitle>
                    <CardDescription>優先度別の対応および解決時間</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-hidden rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>優先度</TableHead>
                            <TableHead>初期対応時間</TableHead>
                            <TableHead>解決時間</TableHead>
                            <TableHead>対象時間帯</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                緊急
                              </Badge>
                            </TableCell>
                            <TableCell>{slaDetail.responseTime.critical}</TableCell>
                            <TableCell>{slaDetail.resolutionTime.critical}</TableCell>
                            <TableCell>24時間365日</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                高
                              </Badge>
                            </TableCell>
                            <TableCell>{slaDetail.responseTime.high}</TableCell>
                            <TableCell>{slaDetail.resolutionTime.high}</TableCell>
                            <TableCell>24時間365日</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                中
                              </Badge>
                            </TableCell>
                            <TableCell>{slaDetail.responseTime.medium}</TableCell>
                            <TableCell>{slaDetail.resolutionTime.medium}</TableCell>
                            <TableCell>平日 9:00-17:30</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                低
                              </Badge>
                            </TableCell>
                            <TableCell>{slaDetail.responseTime.low}</TableCell>
                            <TableCell>{slaDetail.resolutionTime.low}</TableCell>
                            <TableCell>平日 9:00-17:30</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="mt-4 rounded-md border p-4">
                      <h4 className="mb-2 text-sm font-medium">エスカレーション連絡先</h4>
                      <div className="space-y-2">
                        {slaDetail.escalationContacts.map((contact, index) => (
                          <div key={index} className="flex flex-col rounded-md border p-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-xs text-muted-foreground">{contact.role}</div>
                            </div>
                            <div className="mt-2 flex flex-col sm:mt-0 sm:flex-row sm:items-center sm:gap-4">
                              <div className="flex items-center gap-1 text-xs">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>{contact.email}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>{contact.phone}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="scope" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>適用範囲</CardTitle>
                    <CardDescription>SLAが適用されるサービスの範囲</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border p-4">
                      <h4 className="mb-2 font-medium">SLAの対象となるサービス</h4>
                      <ul className="list-inside list-disc space-y-1">
                        {slaDetail.scope.map((item, index) => (
                          <li key={index} className="text-sm">{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-4 rounded-md border p-4">
                      <h4 className="mb-2 font-medium">SLAの対象外項目</h4>
                      <ul className="list-inside list-disc space-y-1">
                        {slaDetail.excludedItems.map((item, index) => (
                          <li key={index} className="text-sm">{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 rounded-md bg-muted p-4 text-sm">
                      <HelpCircle className="h-5 w-5 text-muted-foreground" />
                      <span>
                        本SLAは、指定された範囲内のサービスにのみ適用されます。対象外の項目についてはサポートを提供しますが、SLA指標の計算には含まれません。
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>パフォーマンス履歴</CardTitle>
                    <CardDescription>過去のSLAコンプライアンス履歴</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-hidden rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>期間</TableHead>
                            <TableHead>コンプライアンス</TableHead>
                            <TableHead>ステータス</TableHead>
                            <TableHead>アクション</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {slaDetail.performanceHistory.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.period}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Progress value={item.compliance} className="h-2 w-[60px]" />
                                  <span>{item.compliance}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <SLAStatusBadge status={item.status} />
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <FileText className="mr-1 h-3.5 w-3.5" />
                                  レポート
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>レビュー履歴</CardTitle>
                    <CardDescription>SLAレビューの記録</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="relative border-l border-muted">
                      {slaDetail.reviewHistory.map((review, index) => (
                        <li key={index} className="mb-6 ml-6">
                          <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                            <History className="h-3 w-3 text-muted-foreground" />
                          </span>
                          <div className="flex flex-col space-y-1">
                            <time className="text-sm text-muted-foreground">{review.date}</time>
                            <h3 className="text-base font-medium">レビュー実施</h3>
                            <p className="text-sm">{review.notes}</p>
                            <div className="text-xs text-muted-foreground">レビュアー: {review.reviewer}</div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="olas" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>関連OLA</CardTitle>
                    <CardDescription>このSLAをサポートする内部的な運用レベル契約</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {slaDetail.supportingOLAs.map((ola, index) => (
                        <div key={index} className="rounded-md border p-4">
                          <div className="flex flex-col justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-medium">{ola.id}: {ola.name}</div>
                                <Badge variant="outline">{ola.team}</Badge>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <Progress value={ola.compliance} className="h-2 w-[60px]" />
                                <span className="text-sm">{ola.compliance}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 rounded-md bg-muted p-4 text-sm">
                      <Info className="h-5 w-5 text-muted-foreground" />
                      <span>
                        OLA（運用レベル契約）は、SLAを達成するために内部チーム間で結ばれた合意です。各OLAはこのSLAの特定の側面をサポートします。
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>アクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start">
                <Edit className="mr-2 h-4 w-4" />
                SLAを編集
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <History className="mr-2 h-4 w-4" />
                履歴を表示
              </Button>
              <Separator />
              <Button className="w-full justify-start" variant="secondary">
                <LineChart className="mr-2 h-4 w-4" />
                レポート生成
              </Button>
              <Button className="w-full justify-start" variant="secondary">
                <BarChart4 className="mr-2 h-4 w-4" />
                メトリクス分析
              </Button>
              <Separator />
              <Button className="w-full justify-start" variant="outline">
                <Bell className="mr-2 h-4 w-4" />
                通知設定
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full justify-start" variant="outline">
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    インシデント分析
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>インシデント分析</DialogTitle>
                    <DialogDescription>
                      この機能ではSLAに関連するインシデントを分析し、パターンを特定します
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-center text-muted-foreground">
                      このSLAに関連するインシデントはありません
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>SLA概要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">有効期間</div>
                <div className="text-sm">
                  {formatDate(slaDetail.startDate)} 〜 {formatDate(slaDetail.endDate)}
                </div>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">現在のコンプライアンス</div>
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {slaDetail.compliance}%
                </Badge>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">最終チェック</div>
                <div className="text-sm">{formatDateTime(slaDetail.lastChecked)}</div>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">SLA違反</div>
                <Badge variant={slaDetail.violations > 0 ? "destructive" : "outline"}>
                  {slaDetail.violations}
                </Badge>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">次回レビュー</div>
                <div className="text-sm">2025年7月10日</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 優先度バッジコンポーネント
function PriorityBadge({ priority }: { priority: string }) {
  let classes = "";
  
  switch (priority) {
    case "最高":
      classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      break;
    case "高":
      classes = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      break;
    case "中":
      classes = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      break;
    case "低":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{priority}</Badge>;
}

// SLAステータスバッジコンポーネント
function SLAStatusBadge({ status }: { status: string }) {
  let classes = "";
  
  switch (status) {
    case "適合":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    case "警告":
      classes = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      break;
    case "違反":
      classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{status}</Badge>;
}