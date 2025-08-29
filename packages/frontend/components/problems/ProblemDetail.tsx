import { useState } from "react";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle, Clock, Edit, FileText, Link, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

// 問題詳細のサンプルデータ
const problemDetail = {
  id: "PRB-004",
  title: "Active DirectoryとEntra IDの同期不具合",
  description: "社内Active DirectoryとMicrosoft Entra ID（旧Azure AD）の間で、Entra Connectを使用した同期処理が断続的に失敗しています。ユーザーアカウントの変更が適切に反映されず、Microsoft 365サービスへのアクセスに影響が出ています。",
  category: "構成",
  impactedSystems: ["Active Directory", "Microsoft Entra ID", "Entra Connect"],
  status: "解決策実装中",
  priority: "緊急",
  assignee: { name: "高橋一郎", initials: "高橋" },
  createdAt: "2025-05-03T16:00:00",
  updatedAt: "2025-05-10T08:30:00",
  relatedIncidents: [
    { id: "INC-001", title: "東データセンターのネットワーク障害", status: "resolved" },
    { id: "INC-005", title: "共有ドライブのアクセス権限エラー", status: "open" }
  ],
  knownError: true,
  symptoms: "- ユーザーアカウント変更後、Microsoft 365サービスへのログインが失敗する\n- パスワードリセット後の同期遅延\n- 新規追加ユーザーがEntra IDに反映されない\n- 同期ログにタイムアウトエラーが記録されている",
  rootCause: "Entra Connectサーバーのメモリ不足により、大量のディレクトリ変更が発生した際に同期プロセスがタイムアウトする。また、ネットワーク設定の制限により、一部の同期リクエストがブロックされている。",
  workaround: "同期に失敗した場合、Entra Connectサーバー上で手動で同期を再実行する。緊急の場合はEntra ID管理ポータルから直接変更を行う。",
  proposedSolution: "1. Entra Connectサーバーのメモリを16GBから32GBに増設\n2. 同期スケジュールの見直しと調整（ピーク時間帯を避ける）\n3. ネットワークファイアウォールルールの最適化\n4. Microsoft推奨設定への構成変更",
  implementationPlan: "2025年5月15日の定期メンテナンス時間内で実施予定：\n- 21:00-21:30: Entra Connectサーバーのメモリ増設\n- 21:30-22:00: 構成変更とテスト\n- 22:00-22:30: 監視設定の追加",
  activities: [
    { date: "2025-05-03", user: "山田太郎", action: "問題登録" },
    { date: "2025-05-04", user: "高橋一郎", action: "調査開始" },
    { date: "2025-05-06", user: "高橋一郎", action: "根本原因特定" },
    { date: "2025-05-08", user: "佐藤三郎", action: "解決策提案" },
    { date: "2025-05-09", user: "田中次郎", action: "実装計画承認" },
    { date: "2025-05-10", user: "高橋一郎", action: "実装準備開始" }
  ]
};

export function ProblemDetail({ onBack }: { onBack: () => void }) {
  const [activePlan, setActivePlan] = useState<boolean>(false);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2>{problemDetail.id}: {problemDetail.title}</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>問題概要</CardTitle>
                  <CardDescription>問題の詳細情報と現在の状態</CardDescription>
                </div>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">説明</h4>
                <p>{problemDetail.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">カテゴリ</h4>
                  <p>{problemDetail.category}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">優先度</h4>
                  <PriorityBadge priority={problemDetail.priority} />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">ステータス</h4>
                  <StatusBadge status={problemDetail.status} />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">担当者</h4>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{problemDetail.assignee.initials}</AvatarFallback>
                    </Avatar>
                    <span>{problemDetail.assignee.name}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">影響を受けるシステム</h4>
                <div className="flex flex-wrap gap-2">
                  {problemDetail.impactedSystems.map((system) => (
                    <Badge key={system} variant="secondary">{system}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">作成日時</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDateTime(problemDetail.createdAt)}</span>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">最終更新</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDateTime(problemDetail.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <Tabs defaultValue="diagnosis">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="diagnosis">診断情報</TabsTrigger>
                <TabsTrigger value="solution">解決策</TabsTrigger>
                <TabsTrigger value="incidents">関連インシデント</TabsTrigger>
                <TabsTrigger value="activity">活動履歴</TabsTrigger>
              </TabsList>
              
              <TabsContent value="diagnosis" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>症状</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{problemDetail.symptoms}</pre>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>根本原因</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{problemDetail.rootCause}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>回避策</CardTitle>
                    <CardDescription>一時的な対応策</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{problemDetail.workaround}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="solution" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>提案された解決策</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{problemDetail.proposedSolution}</pre>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>実装計画</CardTitle>
                      <Dialog open={activePlan} onOpenChange={setActivePlan}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            計画を更新
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>実装計画の更新</DialogTitle>
                            <DialogDescription>
                              解決策の実装計画を更新します。スケジュールと担当者を確認してください。
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="plan-date" className="text-right">
                                実施日
                              </Label>
                              <input
                                id="plan-date"
                                type="date"
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue="2025-05-15"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="plan-assignee" className="text-right">
                                担当者
                              </Label>
                              <Select defaultValue="takahashi">
                                <SelectTrigger id="plan-assignee" className="col-span-3">
                                  <SelectValue placeholder="担当者を選択" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="takahashi">高橋一郎</SelectItem>
                                  <SelectItem value="tanaka">田中次郎</SelectItem>
                                  <SelectItem value="yamada">山田太郎</SelectItem>
                                  <SelectItem value="suzuki">鈴木花子</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="plan-details" className="text-right">
                                詳細計画
                              </Label>
                              <Textarea
                                id="plan-details"
                                className="col-span-3"
                                rows={5}
                                defaultValue={problemDetail.implementationPlan}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" onClick={() => setActivePlan(false)}>保存</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{problemDetail.implementationPlan}</pre>
                  </CardContent>
                  <CardFooter>
                    <div className="flex w-full items-center justify-end space-x-2">
                      <Button variant="outline">
                        実装延期
                      </Button>
                      <Button>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        実装完了を報告
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="incidents" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>関連インシデント</CardTitle>
                    <CardDescription>この問題に関連するインシデント一覧</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {problemDetail.relatedIncidents.map((incident) => (
                        <div key={incident.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">{incident.id}</div>
                              <div className="text-sm">{incident.title}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={incident.status === "open" ? "未対応" : "解決済"} />
                            <Button variant="ghost" size="sm">
                              <Link className="mr-1 h-3.5 w-3.5" />
                              詳細
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex w-full items-center justify-end">
                      <Button variant="outline" size="sm">
                        インシデントを関連付ける
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>活動履歴</CardTitle>
                    <CardDescription>問題に関する活動の時系列記録</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="relative border-l border-muted">
                      {problemDetail.activities.map((activity, index) => (
                        <li key={index} className="mb-6 ml-6">
                          <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                            <Users className="h-3 w-3 text-muted-foreground" />
                          </span>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <time className="text-sm text-muted-foreground">{activity.date}</time>
                              <Badge variant="outline" className="px-2 py-0 text-xs">
                                {activity.user}
                              </Badge>
                            </div>
                            <h3 className="text-base font-medium">{activity.action}</h3>
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
                問題を編集
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                担当者変更
              </Button>
              <Separator />
              <Button className="w-full justify-start" variant="secondary">
                <FileText className="mr-2 h-4 w-4" />
                RCA報告
              </Button>
              <Button className="w-full justify-start" variant="secondary">
                <CheckCircle className="mr-2 h-4 w-4" />
                解決策提案
              </Button>
              <Separator />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="ステータスを更新" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="investigating">調査中</SelectItem>
                  <SelectItem value="rootcause">根本原因特定済</SelectItem>
                  <SelectItem value="planning">対策検討中</SelectItem>
                  <SelectItem value="implementing">解決策実装中</SelectItem>
                  <SelectItem value="resolved">解決済</SelectItem>
                  <SelectItem value="closed">完了</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>関連情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">インシデント数</div>
                <Badge>{problemDetail.relatedIncidents.length}</Badge>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">既知のエラー</div>
                <Badge variant={problemDetail.knownError ? "default" : "outline"}>
                  {problemDetail.knownError ? "はい" : "いいえ"}
                </Badge>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">作成からの経過</div>
                <Badge variant="secondary">7日間</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 日付フォーマット用ユーティリティ関数
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

function PriorityBadge({ priority }: { priority: string }) {
  let classes = "";
  
  switch (priority) {
    case "緊急":
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

function StatusBadge({ status }: { status: string }) {
  let classes = "";
  
  switch (status) {
    case "未対応":
    case "調査中":
      classes = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      break;
    case "根本原因特定済":
      classes = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      break;
    case "対策検討中":
      classes = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      break;
    case "解決策実装中":
      classes = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      break;
    case "解決済":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    case "完了":
      classes = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{status}</Badge>;
}