import { useState } from "react";
import { 
  AlertCircle, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  ClipboardCopy, 
  Clock, 
  ExternalLink, 
  FileText, 
  Link2, 
  MailPlus, 
  Printer, 
  Share2, 
  ThumbsUp, 
  User,
  Users
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { Timeline, TimelineItem } from "../ui/timeline";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";

// 既知のエラーの詳細データ
const errorDetail = {
  id: "KE-004",
  title: "Microsoft Entra ID - 条件付きアクセスポリシーの競合",
  description: "複数の条件付きアクセスポリシーが競合し、ユーザーがアプリケーションにアクセスできなくなる問題",
  symptoms: [
    "ユーザーがMicrosoft 365アプリケーションにサインインできない",
    "「組織のポリシーによってアクセスがブロックされています」というエラーメッセージが表示される",
    "条件付きアクセスポリシーの診断ツールで競合が検出される",
    "同じユーザーが一部のアプリケーションにはアクセスできるが、他のアプリケーションにはアクセスできない"
  ],
  category: "entra",
  status: "active",
  priority: "高",
  impact: "高",
  services: ["Microsoft Entra ID", "Microsoft 365"],
  workaround: "影響を受けるユーザーを一時的に条件付きアクセスポリシーの除外グループに追加する。または、問題が発生しているポリシーを一時的に無効化する。",
  resolution: `## 解決策

1. **競合する条件付きアクセスポリシーを特定する**
   * Microsoft Entra ID管理センターにアクセスする
   * 「セキュリティ」>「条件付きアクセス」に移動する
   * 「What If」ツールを使用して、影響を受けるユーザーとリソースの組み合わせをテストする
   * 適用されるすべてのポリシーを識別する

2. **ポリシーの優先順位を設定する**
   * 競合するポリシーを特定したら、それらの適用順序を調整する
   * より制限の厳しいポリシーが、より緩やかなポリシーより優先されることを確認する
   * 必要に応じて「名前付きロケーション」を使用して、ネットワークベースのポリシーを整理する

3. **重複するポリシーを統合・整理する**
   * 類似した目的を持つ複数のポリシーを単一のポリシーに統合する
   * 古いポリシーや使用されていないポリシーを削除または無効化する
   * ポリシーの命名規則を標準化し、目的と範囲を明確にする

4. **ポリシーのターゲットスコープを明確に定義する**
   * 各ポリシーのユーザーとグループの割り当てを見直す
   * 例外グループを適切に設定する
   * クラウドアプリケーションの選択を最適化する

5. **テストと検証**
   * 変更後に「What If」ツールを再度使用して、ポリシーが予期したとおりに機能するか確認する
   * テストユーザーアカウントで実際のサインインをテストする
   * サインインログを確認して、正しいポリシーが適用されていることを確認する

6. **監視と継続的な最適化**
   * サインイン診断ログを定期的に確認する
   * 条件付きアクセスインサイトレポートを活用する
   * ユーザーからのフィードバックに基づいてポリシーを調整する`,
  relatedProblems: ["PRB-078"],
  relatedIncidents: [
    { id: "INC-401", title: "営業部のユーザーがTeamsにアクセスできない", date: "2025-04-01", status: "解決済" },
    { id: "INC-422", title: "リモートワーカーがSharePointにアクセスできない", date: "2025-04-10", status: "解決済" },
    { id: "INC-436", title: "モバイルからのOutlookアクセスがブロックされる", date: "2025-04-15", status: "解決済" }
  ],
  createdDate: "2025-03-25T14:10:00",
  lastUpdated: "2025-05-05T11:25:00",
  author: "山田太郎",
  assignedTo: "クラウドサービスチーム",
  reviewDate: "2025-08-05",
  tags: ["Entra ID", "条件付きアクセス", "ポリシー", "サインイン"],
  relatedArticles: [
    { id: "KA-001", title: "Microsoft 365 認証エラーのトラブルシューティング" },
    { id: "KA-015", title: "条件付きアクセスポリシーの設計と実装のベストプラクティス" }
  ],
  history: [
    { date: "2025-03-25T14:10:00", action: "作成", user: "山田太郎", details: "既知のエラーとして登録" },
    { date: "2025-04-02T10:30:00", action: "更新", user: "山田太郎", details: "症状の追加と解決策の詳細化" },
    { date: "2025-04-20T15:45:00", action: "更新", user: "佐藤メイ", details: "関連インシデントの追加" },
    { date: "2025-05-05T11:25:00", action: "更新", user: "山田太郎", details: "解決策のステップ6を追加" }
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

export function KnownErrorDetail({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("details");
  const [feedbackText, setFeedbackText] = useState("");
  
  // フィードバック送信処理
  const handleSubmitFeedback = () => {
    if (feedbackText.trim() === "") return;
    toast.success("フィードバックが送信されました");
    setFeedbackText("");
  };
  
  // エラー情報のコピー処理
  const handleCopyDetails = () => {
    const text = `${errorDetail.id}: ${errorDetail.title}\n\n${errorDetail.description}\n\n症状:\n${errorDetail.symptoms.map(s => `- ${s}`).join('\n')}\n\n回避策:\n${errorDetail.workaround}\n\n解決策:\n${errorDetail.resolution}`;
    navigator.clipboard.writeText(text);
    toast.success("エラー情報をクリップボードにコピーしました");
  };
  
  // 印刷処理
  const handlePrint = () => {
    window.print();
  };
  
  // 共有処理
  const handleShare = () => {
    // 実際のアプリではURLをクリップボードにコピー
    toast.success("エラー情報のURLをクリップボードにコピーしました");
  };
  
  // メール通知処理
  const handleNotify = () => {
    toast.success("通知が送信されました");
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2>{errorDetail.id}: {errorDetail.title}</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={errorDetail.status} />
                    <PriorityBadge priority={errorDetail.priority} />
                    <ImpactBadge impact={errorDetail.impact} />
                  </div>
                  <CardTitle className="mt-2">{errorDetail.title}</CardTitle>
                  <CardDescription className="mt-1">{errorDetail.description}</CardDescription>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {errorDetail.services.map((service, index) => (
                  <Badge key={index} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="details">詳細</TabsTrigger>
                  <TabsTrigger value="incidents">関連インシデント</TabsTrigger>
                  <TabsTrigger value="history">履歴</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-4 space-y-4">
                  <div>
                    <h3 className="mb-2 text-sm font-medium">症状</h3>
                    <ul className="list-inside list-disc space-y-1 rounded-md border p-4">
                      {errorDetail.symptoms.map((symptom, index) => (
                        <li key={index} className="text-sm">{symptom}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">回避策</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{errorDetail.workaround}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">影響を受けるサービス</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {errorDetail.services.map((service, index) => (
                            <div key={index} className="flex items-center gap-2 rounded-md border p-2">
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{service}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="mb-2 text-sm font-medium">解決策</h3>
                    <div className="rounded-md border p-4">
                      <div className="prose max-w-none dark:prose-invert">
                        <pre className="whitespace-pre-wrap font-sans text-sm">{errorDetail.resolution}</pre>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <h3 className="mb-3 font-medium">このエラー情報は役に立ちましたか？</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          はい、役立ちました
                        </Button>
                        <Button variant="outline" size="sm">
                          いいえ、改善が必要です
                        </Button>
                      </div>
                      
                      <div>
                        <Textarea 
                          placeholder="この既知のエラーについてフィードバックがあれば教えてください"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <Button size="sm" className="mt-2" onClick={handleSubmitFeedback}>
                          フィードバックを送信
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="incidents" className="mt-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">関連インシデント</h3>
                    <div className="space-y-3">
                      {errorDetail.relatedIncidents.map((incident, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-3">
                          <div>
                            <div className="font-medium">{incident.title}</div>
                            <div className="text-xs text-muted-foreground">{incident.id} - {formatDate(incident.date)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={incident.status} />
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <h3 className="mt-6 text-sm font-medium">関連問題</h3>
                    <div className="space-y-3">
                      {errorDetail.relatedProblems.map((problem, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{problem}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <h3 className="mt-6 text-sm font-medium">関連ナレッジ記事</h3>
                    <div className="space-y-3">
                      {errorDetail.relatedArticles.map((article, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-3">
                          <div>
                            <div className="font-medium">{article.title}</div>
                            <div className="text-xs text-muted-foreground">{article.id}</div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                  <div>
                    <h3 className="mb-3 text-sm font-medium">変更履歴</h3>
                    <Timeline>
                      {errorDetail.history.map((item, index) => (
                        <TimelineItem key={index}>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="py-0 text-xs">
                                {item.action}
                              </Badge>
                              <time className="text-xs text-muted-foreground">{formatDateTime(item.date)}</time>
                            </div>
                            <p className="text-sm">{item.details}</p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{item.user}</span>
                            </div>
                          </div>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>アクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" onClick={handleCopyDetails}>
                <ClipboardCopy className="mr-2 h-4 w-4" />
                詳細をコピー
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                印刷
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                共有
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={handleNotify}>
                <MailPlus className="mr-2 h-4 w-4" />
                メールで通知
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>エラー情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-3">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-muted-foreground">カテゴリ</div>
                  <div>{errorDetail.category}</div>
                  <div className="text-muted-foreground">優先度</div>
                  <div>{errorDetail.priority}</div>
                  <div className="text-muted-foreground">影響度</div>
                  <div>{errorDetail.impact}</div>
                  <div className="text-muted-foreground">ステータス</div>
                  <div>{errorDetail.status === "active" ? "アクティブ" : "解決済み"}</div>
                </div>
              </div>
              
              <div>
                <h3 className="mb-2 text-sm font-medium">タグ</h3>
                <div className="flex flex-wrap gap-1">
                  {errorDetail.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">作成日</div>
                  <div className="text-sm">{formatDate(errorDetail.createdDate)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">最終更新日</div>
                  <div className="text-sm">{formatDate(errorDetail.lastUpdated)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">次回レビュー日</div>
                  <div className="text-sm">{formatDate(errorDetail.reviewDate)}</div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="mb-2 text-sm font-medium">担当情報</h3>
                <div className="rounded-md border p-3">
                  <div className="mb-2 text-xs text-muted-foreground">作成者</div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>YT</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">{errorDetail.author}</div>
                  </div>
                </div>
                <div className="mt-2 rounded-md border p-3">
                  <div className="mb-2 text-xs text-muted-foreground">担当チーム</div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">{errorDetail.assignedTo}</div>
                  </div>
                </div>
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

// 影響度バッジコンポーネント
function ImpactBadge({ impact }: { impact: string }) {
  let classes = "";
  
  switch (impact) {
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
  
  return <Badge variant="outline" className={classes}>影響: {impact}</Badge>;
}

// ステータスバッジコンポーネント
function StatusBadge({ status }: { status: string }) {
  let classes = "";
  
  switch (status) {
    case "active":
      classes = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      break;
    case "resolved":
    case "解決済":
    case "解決済み":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return (
    <Badge variant="outline" className={classes}>
      {status === "active" ? "アクティブ" : 
       status === "resolved" ? "解決済み" : 
       status}
    </Badge>
  );
}