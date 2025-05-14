import { useState } from "react";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Edit, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Link, 
  FileText
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

// OLA詳細のサンプルデータ
const olaDetail = {
  id: "OLA-001",
  name: "ネットワークチームとの運用レベル契約",
  description: "Active Directoryサービスを支援するネットワークインフラの可用性と性能に関する運用レベル契約",
  status: "適合",
  compliance: 100,
  provider: "ネットワークチーム",
  consumer: "インフラチーム",
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  lastReviewed: "2025-04-15",
  relatedSLAs: [
    { id: "SLA-002", name: "Active Directory認証サービス", compliance: 99.995 }
  ],
  serviceHours: "24時間365日",
  responseTime: {
    critical: "15分以内",
    high: "30分以内",
    medium: "1時間以内",
    low: "4時間以内"
  },
  metrics: [
    {
      name: "ネットワーク可用性",
      description: "データセンター間およびADDCへのネットワーク接続の可用性",
      target: "99.999%",
      actual: "100%",
      status: "適合"
    },
    {
      name: "ネットワークレイテンシ",
      description: "データセンター間の往復時間（RTT）",
      target: "<5ms",
      actual: "2.3ms",
      status: "適合"
    },
    {
      name: "障害対応時間",
      description: "ネットワーク障害発生時の初期対応開始までの時間",
      target: "15分以内",
      actual: "12分",
      status: "適合"
    }
  ],
  responsibilities: {
    provider: [
      "データセンター間のネットワーク接続の維持",
      "ネットワーク機器の監視とメンテナンス",
      "障害発生時の素早い対応",
      "容量・帯域の計画と確保",
      "セキュリティ対策の実施"
    ],
    consumer: [
      "障害内容の明確な伝達",
      "サービス要件の事前通知",
      "計画的なメンテナンス情報の共有",
      "変更管理プロセスの遵守"
    ]
  },
  escalationProcedure: [
    { level: 1, contact: "ネットワーク運用担当", response: "即時" },
    { level: 2, contact: "ネットワークチーム責任者", response: "30分以内" },
    { level: 3, contact: "IT運用部長", response: "1時間以内" }
  ],
  performanceHistory: [
    { period: "2025年4月", compliance: 100, status: "適合" },
    { period: "2025年3月", compliance: 100, status: "適合" },
    { period: "2025年2月", compliance: 99.8, status: "適合" },
    { period: "2025年1月", compliance: 100, status: "適合" }
  ],
  reviewComments: [
    { date: "2025-04-15", reviewer: "高橋一郎", comment: "すべての指標が目標を達成している。継続的な良好なパフォーマンスを維持している。" },
    { date: "2025-01-15", reviewer: "高橋一郎", comment: "四半期レビューを実施。ネットワーク監視の強化について協議した。" }
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

export function OLADetail({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2>{olaDetail.id}: {olaDetail.name}</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>OLA詳細</CardTitle>
                  <CardDescription>運用レベル契約の詳細情報</CardDescription>
                </div>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">説明</h4>
                <p>{olaDetail.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">サービス提供者</h4>
                  <p>{olaDetail.provider}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">サービス利用者</h4>
                  <p>{olaDetail.consumer}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">ステータス</h4>
                  <StatusBadge status={olaDetail.status} />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">コンプライアンス</h4>
                  <div className="flex items-center space-x-2">
                    <Progress value={olaDetail.compliance} className="h-2 w-[100px]" />
                    <span>{olaDetail.compliance}%</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">開始日</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(olaDetail.startDate)}</span>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">終了日</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(olaDetail.endDate)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">サービス提供時間</h4>
                <p>{olaDetail.serviceHours}</p>
              </div>
              
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">関連SLA</h4>
                <div className="space-y-2">
                  {olaDetail.relatedSLAs.map((sla, index) => (
                    <div key={index} className="flex justify-between rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4 text-muted-foreground" />
                        <span>{sla.id}: {sla.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{sla.compliance}%</span>
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          適合
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <Tabs defaultValue="metrics" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="metrics">メトリクス</TabsTrigger>
                <TabsTrigger value="response">対応時間</TabsTrigger>
                <TabsTrigger value="responsibilities">責任分担</TabsTrigger>
                <TabsTrigger value="history">履歴</TabsTrigger>
              </TabsList>
              
              <TabsContent value="metrics" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>パフォーマンスメトリクス</CardTitle>
                    <CardDescription>OLAの測定指標と現在の状態</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {olaDetail.metrics.map((metric, index) => (
                        <div key={index} className="rounded-md border p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-base font-medium">{metric.name}</h3>
                            <StatusBadge status={metric.status} />
                          </div>
                          <p className="mb-3 text-sm">{metric.description}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-muted-foreground">目標</div>
                              <div className="font-medium">{metric.target}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">現在値</div>
                              <div className="font-medium">{metric.actual}</div>
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
                    <CardTitle>対応時間</CardTitle>
                    <CardDescription>優先度別の対応時間要件</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-hidden rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>優先度</TableHead>
                            <TableHead>対応時間</TableHead>
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
                            <TableCell>{olaDetail.responseTime.critical}</TableCell>
                            <TableCell>24時間365日</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                高
                              </Badge>
                            </TableCell>
                            <TableCell>{olaDetail.responseTime.high}</TableCell>
                            <TableCell>24時間365日</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                中
                              </Badge>
                            </TableCell>
                            <TableCell>{olaDetail.responseTime.medium}</TableCell>
                            <TableCell>平日 9:00-17:30</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                低
                              </Badge>
                            </TableCell>
                            <TableCell>{olaDetail.responseTime.low}</TableCell>
                            <TableCell>平日 9:00-17:30</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-medium">エスカレーション手順</h4>
                      <div className="overflow-hidden rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>レベル</TableHead>
                              <TableHead>連絡先</TableHead>
                              <TableHead>対応時間</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {olaDetail.escalationProcedure.map((level, index) => (
                              <TableRow key={index}>
                                <TableCell>{level.level}</TableCell>
                                <TableCell>{level.contact}</TableCell>
                                <TableCell>{level.response}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="responsibilities" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>責任分担</CardTitle>
                    <CardDescription>サービス提供者と利用者の責任範囲</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-medium">サービス提供者の責任（{olaDetail.provider}）</h4>
                        <ul className="list-inside list-disc space-y-1 rounded-md border p-4">
                          {olaDetail.responsibilities.provider.map((item, index) => (
                            <li key={index} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="mb-2 font-medium">サービス利用者の責任（{olaDetail.consumer}）</h4>
                        <ul className="list-inside list-disc space-y-1 rounded-md border p-4">
                          {olaDetail.responsibilities.consumer.map((item, index) => (
                            <li key={index} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>パフォーマンス履歴</CardTitle>
                    <CardDescription>過去のOLAコンプライアンス履歴</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-hidden rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>期間</TableHead>
                            <TableHead>コンプライアンス</TableHead>
                            <TableHead>ステータス</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {olaDetail.performanceHistory.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.period}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Progress value={item.compliance} className="h-2 w-[60px]" />
                                  <span>{item.compliance}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={item.status} />
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
                    <CardDescription>OLAレビューの記録</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      {olaDetail.reviewComments.map((review, index) => (
                        <li key={index} className="rounded-md border p-4">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center justify-between">
                              <time className="text-sm text-muted-foreground">{review.date}</time>
                              <Badge variant="outline">{review.reviewer}</Badge>
                            </div>
                            <p className="text-sm">{review.comment}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
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
                OLAを編集
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                連絡先を管理
              </Button>
              <Separator />
              <Button className="w-full justify-start" variant="secondary">
                <CheckCircle className="mr-2 h-4 w-4" />
                レビュー実施
              </Button>
              <Button className="w-full justify-start" variant="secondary">
                <AlertCircle className="mr-2 h-4 w-4" />
                違反報告
              </Button>
              <Separator />
              <Button className="w-full justify-start" variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                履歴を表示
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                レポート生成
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>OLA概要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">有効期間</div>
                <div className="text-sm">
                  {formatDate(olaDetail.startDate)} 〜 {formatDate(olaDetail.endDate)}
                </div>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">現在のコンプライアンス</div>
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {olaDetail.compliance}%
                </Badge>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">最終レビュー日</div>
                <div className="text-sm">{formatDate(olaDetail.lastReviewed)}</div>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">関連SLA数</div>
                <Badge variant="secondary">
                  {olaDetail.relatedSLAs.length}
                </Badge>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">次回レビュー</div>
                <div className="text-sm">2025年7月15日</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ステータスバッジコンポーネント
function StatusBadge({ status }: { status: string }) {
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