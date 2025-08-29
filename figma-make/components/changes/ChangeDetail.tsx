import { useState } from "react";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Edit, 
  FileCheck, 
  FileText, 
  LinkIcon, 
  Shield, 
  ThumbsDown, 
  ThumbsUp, 
  User, 
  Users
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "../ui/accordion";
import { Progress } from "../ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Textarea } from "../ui/textarea";

// 変更リクエストの詳細サンプルデータ
const changeDetail = {
  id: "CHG-002",
  title: "Active DirectoryとEntra IDの同期設定変更",
  description: "現在のActive DirectoryとMicrosoft Entra ID (旧Azure AD)の同期問題を解決するため、Entra Connectサーバーのメモリ増設と構成変更を実施します。これにより、大量のディレクトリ変更が発生した際の同期タイムアウト問題を解消します。",
  category: "構成",
  type: "通常変更",
  status: "審査中",
  priority: "高",
  risk: "中",
  requestor: { name: "山田太郎", initials: "山田", email: "yamada.t@example.com", department: "IT部" },
  assignee: { name: "高橋一郎", initials: "高橋", email: "takahashi.i@example.com", department: "インフラチーム" },
  createdAt: "2025-05-05T14:15:00",
  updatedAt: "2025-05-09T11:30:00",
  scheduledStart: "2025-05-20T21:00:00",
  scheduledEnd: "2025-05-20T23:00:00",
  systems: ["Active Directory", "Microsoft Entra ID", "Entra Connect"],
  relatedProblems: ["PRB-004"],
  approvers: [
    { name: "鈴木花子", initials: "鈴木", role: "変更管理責任者", status: "承認済", date: "2025-05-08T10:30:00" },
    { name: "佐藤三郎", initials: "佐藤", role: "IT部長", status: "未承認", date: "" },
    { name: "伊藤めぐみ", initials: "伊藤", role: "情報セキュリティ責任者", status: "未承認", date: "" }
  ],
  justification: "現在、ユーザーアカウントの変更がEntra IDに適切に反映されず、Microsoft 365サービスへのアクセスに影響が出ています。この問題に対する恒久的な解決策として、根本原因分析（RCA）を基にシステム構成の変更が必要です。",
  riskAssessment: {
    impactDescription: "変更作業中は約30分間、ディレクトリ同期が停止します。この間、新規ユーザー作成やパスワード変更などがMicrosoft 365サービスに反映されません。",
    impact: "中",
    likelihood: "低",
    overallRisk: "中",
    mitigationPlan: "- 業務影響の少ない夜間（21:00-23:00）に作業を実施\n- 事前にユーザーへの通知を行い、作業中の新規ユーザー登録・パスワード変更を控えるよう依頼\n- 緊急時のロールバック手順を準備"
  },
  implementationPlan: {
    steps: [
      { id: 1, title: "事前作業", description: "現在の構成のバックアップを取得", duration: "15分", responsible: "高橋一郎" },
      { id: 2, title: "サーバー停止", description: "Entra Connect同期サービスの停止", duration: "5分", responsible: "高橋一郎" },
      { id: 3, title: "メモリ増設", description: "サーバーへの物理メモリ追加（16GB→32GB）", duration: "30分", responsible: "渡辺健太" },
      { id: 4, title: "構成変更", description: "同期スケジュールとパラメータの最適化", duration: "20分", responsible: "高橋一郎" },
      { id: 5, title: "サービス再開", description: "Entra Connect同期サービスの再開", duration: "5分", responsible: "高橋一郎" },
      { id: 6, title: "テスト", description: "ディレクトリ同期の動作確認", duration: "20分", responsible: "山田太郎" },
      { id: 7, title: "監視設定", description: "監視アラートの追加と確認", duration: "15分", responsible: "高橋一郎" },
    ],
    backoutPlan: "問題が発生した場合、以下の手順でロールバックを行います：\n1. Entra Connect同期サービスを停止\n2. バックアップした構成ファイルを復元\n3. 元のメモリ構成に戻す（必要に応じて）\n4. 同期サービスを再開\n5. 動作確認を実施"
  },
  testPlan: "実装後、以下のテストを実施します：\n1. テストユーザーの作成と同期確認\n2. パスワード変更の同期確認\n3. 大量ユーザー（100アカウント）の同時変更テスト\n4. 同期ログのエラー確認\n5. メモリ使用率の監視確認",
  communicationPlan: "- 5/15: 全社メールで変更内容とスケジュールを通知\n- 5/18: 部門責任者への再確認メール\n- 5/20 17:00: 実施直前の最終通知\n- 5/20 23:30: 完了報告",
  activities: [
    { date: "2025-05-05", user: "山田太郎", action: "変更リクエスト作成" },
    { date: "2025-05-06", user: "高橋一郎", action: "担当者としてアサイン" },
    { date: "2025-05-07", user: "山田太郎", action: "実装計画の詳細追加" },
    { date: "2025-05-08", user: "鈴木花子", action: "変更管理者として承認" },
    { date: "2025-05-09", user: "高橋一郎", action: "リスク評価の更新" }
  ]
};

export function ChangeDetail({ onBack }: { onBack: () => void }) {
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [implementationDialogOpen, setImplementationDialogOpen] = useState(false);
  
  // 承認状況の計算
  const totalApprovers = changeDetail.approvers.length;
  const approvedCount = changeDetail.approvers.filter(approver => approver.status === "承認済").length;
  const approvalProgress = Math.round((approvedCount / totalApprovers) * 100);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2>{changeDetail.id}: {changeDetail.title}</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>変更リクエスト詳細</CardTitle>
                  <CardDescription>変更内容と実施計画</CardDescription>
                </div>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">説明</h4>
                <p>{changeDetail.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">カテゴリ</h4>
                  <p>{changeDetail.category}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">種類</h4>
                  <ChangeTypeBadge type={changeDetail.type} />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">優先度</h4>
                  <PriorityBadge priority={changeDetail.priority} />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">リスクレベル</h4>
                  <RiskBadge risk={changeDetail.risk} />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">ステータス</h4>
                  <StatusBadge status={changeDetail.status} />
                </div>
              </div>
              
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">影響を受けるシステム</h4>
                <div className="flex flex-wrap gap-2">
                  {changeDetail.systems.map((system) => (
                    <Badge key={system} variant="secondary">{system}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">申請者</h4>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{changeDetail.requestor.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{changeDetail.requestor.name}</div>
                      <div className="text-xs text-muted-foreground">{changeDetail.requestor.department}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">担当者</h4>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{changeDetail.assignee.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{changeDetail.assignee.name}</div>
                      <div className="text-xs text-muted-foreground">{changeDetail.assignee.department}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">実施予定日時</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(changeDetail.scheduledStart)}</span>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">予定完了時間</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(changeDetail.scheduledEnd)}</span>
                  </div>
                </div>
              </div>
              
              {changeDetail.relatedProblems && changeDetail.relatedProblems.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">関連する問題</h4>
                  <div className="flex flex-wrap gap-2">
                    {changeDetail.relatedProblems.map((problem) => (
                      <Button key={problem} variant="outline" size="sm" className="gap-1">
                        <LinkIcon className="h-3.5 w-3.5" />
                        {problem}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">変更の理由</h4>
                <p>{changeDetail.justification}</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <Tabs defaultValue="plan">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="plan">実装計画</TabsTrigger>
                <TabsTrigger value="risk">リスク評価</TabsTrigger>
                <TabsTrigger value="approval">承認状況</TabsTrigger>
                <TabsTrigger value="activity">活動履歴</TabsTrigger>
              </TabsList>
              
              <TabsContent value="plan" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>実装ステップ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      {changeDetail.implementationPlan.steps.map((step) => (
                        <li key={step.id} className="rounded-md border p-3">
                          <div className="flex justify-between">
                            <div className="font-medium">{step.id}. {step.title}</div>
                            <div className="text-sm text-muted-foreground">所要時間: {step.duration}</div>
                          </div>
                          <div className="mt-1 text-sm">{step.description}</div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span>担当: {step.responsible}</span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>バックアウト計画</CardTitle>
                      <CardDescription>問題発生時の対応方法</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{changeDetail.implementationPlan.backoutPlan}</pre>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>テスト計画</CardTitle>
                      <CardDescription>変更後の確認方法</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{changeDetail.testPlan}</pre>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>コミュニケーション計画</CardTitle>
                    <CardDescription>ステークホルダーへの通知スケジュール</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{changeDetail.communicationPlan}</pre>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="risk" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>リスク評価</CardTitle>
                    <CardDescription>変更に伴うリスクとその対策</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">影響の説明</h4>
                      <p>{changeDetail.riskAssessment.impactDescription}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">影響度</h4>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          {changeDetail.riskAssessment.impact}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">発生確率</h4>
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {changeDetail.riskAssessment.likelihood}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">総合リスク</h4>
                        <RiskBadge risk={changeDetail.riskAssessment.overallRisk} />
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">リスク軽減策</h4>
                      <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{changeDetail.riskAssessment.mitigationPlan}</pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="approval" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>承認状況</CardTitle>
                    <CardDescription>現在の承認プロセスの進捗</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">承認進捗状況</span>
                        <span className="text-sm font-medium">{approvedCount}/{totalApprovers}</span>
                      </div>
                      <Progress value={approvalProgress} />
                    </div>
                    
                    <div className="space-y-3">
                      {changeDetail.approvers.map((approver, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{approver.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{approver.name}</div>
                              <div className="text-xs text-muted-foreground">{approver.role}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {approver.status === "承認済" ? (
                              <>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  承認済
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(approver.date)}
                                </div>
                              </>
                            ) : (
                              <Badge variant="outline">未承認</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex w-full items-center justify-end space-x-2">
                      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Shield className="mr-2 h-4 w-4" />
                            申請を承認
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>変更リクエストの承認</DialogTitle>
                            <DialogDescription>
                              あなたは「{changeDetail.title}」の変更リクエストを承認しようとしています。
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">承認コメント（任意）</h4>
                              <Textarea
                                placeholder="承認に関するコメントを入力してください"
                                rows={3}
                              />
                            </div>
                            <div className="flex items-start space-x-2 rounded-md border p-4">
                              <Shield className="mt-0.5 h-5 w-5 text-muted-foreground" />
                              <div className="space-y-1">
                                <p className="text-sm font-medium">承認の責任について</p>
                                <p className="text-sm text-muted-foreground">
                                  この変更リクエストを承認することで、あなたは変更内容、リスク評価、およびリスク軽減策を確認し、変更の実施を許可したことになります。
                                </p>
                              </div>
                            </div>
                          </div>
                          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
                            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
                              <ThumbsDown className="mr-2 h-4 w-4" />
                              却下
                            </Button>
                            <Button onClick={() => setApprovalDialogOpen(false)}>
                              <ThumbsUp className="mr-2 h-4 w-4" />
                              承認
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>活動履歴</CardTitle>
                    <CardDescription>変更リクエストに関する活動の時系列記録</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="relative border-l border-muted">
                      {changeDetail.activities.map((activity, index) => (
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
                リクエストを編集
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <User className="mr-2 h-4 w-4" />
                担当者変更
              </Button>
              <Separator />
              <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full justify-start" variant="secondary">
                    <Shield className="mr-2 h-4 w-4" />
                    承認する
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Dialog open={implementationDialogOpen} onOpenChange={setImplementationDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full justify-start" variant="secondary">
                    <FileCheck className="mr-2 h-4 w-4" />
                    実装状況を報告
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>実装状況の報告</DialogTitle>
                    <DialogDescription>
                      変更の実装状況を報告します。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">実装内容</h4>
                      <Textarea
                        placeholder="実施した作業内容を入力してください"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">テスト結果</h4>
                      <Textarea
                        placeholder="テスト結果を入力してください"
                        rows={3}
                      />
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="issue">
                        <AccordionTrigger>問題は発生しましたか？</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            <Textarea
                              placeholder="発生した問題とその対応について入力してください"
                              rows={3}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  <DialogFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setImplementationDialogOpen(false)}>
                      キャンセル
                    </Button>
                    <div className="space-x-2">
                      <Button variant="outline" onClick={() => setImplementationDialogOpen(false)}>
                        下書き保存
                      </Button>
                      <Button onClick={() => setImplementationDialogOpen(false)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        完了として報告
                      </Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Separator />
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                レポートを作成
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>参照情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">作成日</div>
                <div className="text-sm">{formatDateOnly(changeDetail.createdAt)}</div>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">最終更新</div>
                <div className="text-sm">{formatDateOnly(changeDetail.updatedAt)}</div>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">推定所要時間</div>
                <Badge variant="secondary">2時間</Badge>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">作業時間帯</div>
                <Badge variant="outline">夜間</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 日付フォーマット用ユーティリティ関数
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// 日付のみのフォーマット用関数（時間なし）
function formatDateOnly(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).format(date);
}

function ChangeTypeBadge({ type }: { type: string }) {
  let classes = "";
  
  switch (type) {
    case "標準変更":
      classes = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      break;
    case "通常変更":
      classes = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      break;
    case "緊急変更":
      classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{type}</Badge>;
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

function RiskBadge({ risk }: { risk: string }) {
  let classes = "";
  
  switch (risk) {
    case "高":
      classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      break;
    case "中":
      classes = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      break;
    case "低":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{risk}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  let classes = "";
  
  switch (status) {
    case "ドラフト":
      classes = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      break;
    case "審査中":
      classes = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      break;
    case "承認済":
      classes = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      break;
    case "計画中":
      classes = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      break;
    case "実装中":
      classes = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      break;
    case "完了":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    case "終了":
      classes = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{status}</Badge>;
}