import { useState } from "react";
import { 
  AlertCircle, 
  ArrowLeft, 
  Calendar, 
  Check, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  History, 
  Info, 
  LineChart, 
  Plus, 
  Star, 
  ThumbsUp, 
  Users 
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { toast } from "sonner";

// サービス詳細のサンプルデータ
const serviceDetail = {
  id: "SVC-001",
  name: "Microsoft 365 E3ライセンス",
  description: "Microsoft 365 E3ライセンスの割り当て。Word、Excel、PowerPoint、Teams、Exchange、SharePoint、OneDriveなどのアプリケーションとサービスが含まれます。",
  longDescription: `
  # Microsoft 365 E3ライセンス

  Microsoft 365 E3ライセンスは、生産性向上とコラボレーションのための包括的なクラウドサービスとアプリケーションのスイートです。このライセンスにより、ユーザーは以下のサービスやアプリケーションにアクセスできるようになります。

  ## 含まれるサービス

  ### 生産性アプリケーション
  - Microsoft Word：文書作成と編集
  - Microsoft Excel：スプレッドシート
  - Microsoft PowerPoint：プレゼンテーション
  - Microsoft Outlook：メール・カレンダー
  - Microsoft OneNote：ノート取り

  ### コミュニケーションとコラボレーション
  - Microsoft Teams：チャット、オンライン会議、ファイル共有
  - Exchange Online：ビジネスメールサービス
  - SharePoint Online：チーム間のファイル共有とコラボレーション
  - OneDrive for Business：1TBのクラウドストレージ

  ### セキュリティとコンプライアンス
  - 多要素認証
  - データ損失防止
  - 情報保護
  - アーカイブ機能

  ## 用途と活用シーン

  - 日常業務における文書作成・共有
  - チーム間のコラボレーションとコミュニケーション
  - リモートワークとモバイルアクセス
  - 会議の開催と参加
  - 社内ファイルの安全な保存と共有

  ## 申請時の注意事項

  - 申請には部門長の承認が必要です
  - 利用者のMicrosoft Entra IDアカウントが必要です
  - ライセンス割り当て後、アプリケーションのインストールが必要な場合があります
  `,
  category: "software",
  icon: "🖥️",
  fulfillmentTime: "1営業日",
  approvalRequired: true,
  cost: "¥2,100 / 月",
  rating: 4.7,
  tags: ["Microsoft 365", "ライセンス", "Office"],
  status: "available",
  sla: {
    fulfillment: "1営業日以内",
    availability: "99.9%",
    performance: {
      target: "99.9%",
      current: 99.95,
      history: [99.92, 99.95, 99.98, 99.9, 99.94, 99.95]
    }
  },
  approvalProcess: [
    "申請者が必要情報を入力",
    "部門長による承認",
    "IT部門による確認",
    "ライセンス割り当てと通知"
  ],
  requiredInformation: [
    "利用者の氏名",
    "利用者のメールアドレス",
    "利用者の部署",
    "利用目的",
    "請求先部門コード"
  ],
  includes: [
    "Word、Excel、PowerPoint、Outlookなどのデスクトップアプリケーション",
    "Exchange Online（メール）",
    "SharePoint Online（ファイル共有）",
    "Microsoft Teams（コミュニケーション）",
    "OneDrive for Business（1TBストレージ）"
  ],
  excludes: [
    "Power BI Pro（別途申請が必要）",
    "電話システム機能（Teams Phone）",
    "高度な分析機能",
    "高度なコンプライアンス機能"
  ],
  alternatives: [
    { id: "SVC-019", name: "Microsoft 365 E5ライセンス", description: "高度なセキュリティとコンプライアンス機能を含む上位ライセンス" },
    { id: "SVC-020", name: "Microsoft 365 Business Basic", description: "Webアプリのみを含む基本ライセンス" }
  ],
  faqs: [
    {
      question: "既存のライセンスからE3にアップグレードできますか？",
      answer: "はい、既存のライセンスからアップグレードが可能です。アップグレード申請を行うと、現在のライセンスが新しいライセンスに置き換えられます。"
    },
    {
      question: "ライセンスは即時に有効化されますか？",
      answer: "通常、承認後1営業日以内に有効化されます。ただし、システムの状況によっては若干の遅延が生じる場合があります。"
    },
    {
      question: "複数のユーザーに一括でライセンスを割り当てることはできますか？",
      answer: "はい、複数ユーザー向けの一括申請フォームがあります。5名以上の申請の場合はそちらをご利用ください。"
    }
  ],
  documentation: [
    { name: "Microsoft 365 E3ユーザーガイド", url: "#" },
    { name: "初期セットアップガイド", url: "#" },
    { name: "ライセンスポリシー", url: "#" }
  ],
  stats: {
    totalRequests: 234,
    averageFulfillmentTime: "0.8営業日",
    satisfactionRate: 96
  },
  relatedServices: [
    { id: "SVC-004", name: "パスワードリセット" },
    { id: "SVC-008", name: "ソフトウェアインストール" },
    { id: "SVC-012", name: "クラウドストレージ容量追加" }
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

interface ServiceDetailProps {
  serviceId: string;
  onBack: () => void;
  onRequestService: () => void;
}

export function ServiceDetail({ 
  serviceId, 
  onBack,
  onRequestService
}: ServiceDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // サービスのお気に入り追加処理
  const handleAddToFavorites = () => {
    toast.success("お気に入りに追加しました");
  };
  
  // フィードバック送信処理
  const handleSubmitFeedback = () => {
    toast.success("フィードバックが送信されました");
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2>{serviceDetail.name}</h2>
        <ServiceStatusBadge status={serviceDetail.status} />
      </div>
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
                    {serviceDetail.icon}
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-1">
                      {serviceDetail.category}
                    </Badge>
                    <CardTitle>{serviceDetail.name}</CardTitle>
                    <CardDescription className="mt-1">{serviceDetail.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="overview">概要</TabsTrigger>
                  <TabsTrigger value="details">詳細情報</TabsTrigger>
                  <TabsTrigger value="process">申請プロセス</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4 pt-4">
                  <div className="prose max-w-none dark:prose-invert">
                    {/* 実際のアプリではMarkdownレンダラーを使用 */}
                    <pre className="whitespace-pre-wrap font-sans text-sm">{serviceDetail.longDescription}</pre>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-md border p-4">
                      <h3 className="mb-2 text-base font-medium">含まれるもの</h3>
                      <ul className="space-y-2">
                        {serviceDetail.includes.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <h3 className="mb-2 text-base font-medium">含まれないもの</h3>
                      <ul className="space-y-2">
                        {serviceDetail.excludes.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <div className="border-b p-4">
                      <h3 className="text-base font-medium">サービスレベル情報</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-3">
                      <div>
                        <h4 className="mb-1 text-sm font-medium">所要時間</h4>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{serviceDetail.sla.fulfillment}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-medium">サービス可用性</h4>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>{serviceDetail.sla.availability}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-medium">コスト</h4>
                        <div className="font-medium">{serviceDetail.cost}</div>
                      </div>
                      <div className="col-span-1 sm:col-span-3">
                        <h4 className="mb-2 text-sm font-medium">パフォーマンス</h4>
                        <div className="flex items-center space-x-4">
                          <Progress value={serviceDetail.sla.performance.current} max={100} className="flex-1 h-2" />
                          <div className="flex items-center gap-1 text-sm">
                            <span className="font-medium">{serviceDetail.sla.performance.current}%</span>
                            <span className="text-muted-foreground">/ {serviceDetail.sla.performance.target}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">サービス統計</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">総リクエスト数</div>
                            <div className="font-medium">{serviceDetail.stats.totalRequests}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">平均所要時間</div>
                            <div className="font-medium">{serviceDetail.stats.averageFulfillmentTime}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">満足度</div>
                            <div className="flex items-center">
                              <span className="font-medium">{serviceDetail.stats.satisfactionRate}%</span>
                              <ThumbsUp className="ml-1 h-4 w-4 text-green-500" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">関連サービス</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {serviceDetail.relatedServices.map((service, index) => (
                            <div key={index} className="flex items-center justify-between rounded-md border p-2">
                              <div className="font-medium">{service.name}</div>
                              <Button variant="ghost" size="sm">表示</Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="mb-3 text-base font-medium">代替サービス</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {serviceDetail.alternatives.map((alt, index) => (
                        <div key={index} className="rounded-md border p-4">
                          <div className="font-medium">{alt.name}</div>
                          <p className="mt-1 text-sm text-muted-foreground">{alt.description}</p>
                          <Button variant="outline" size="sm" className="mt-3">
                            詳細を表示
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="mb-3 text-base font-medium">ドキュメント</h3>
                    <div className="space-y-2">
                      {serviceDetail.documentation.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-3">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span>{doc.name}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            表示
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="process" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">申請プロセス</CardTitle>
                      <CardDescription>このサービスをリクエストする手順</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ol className="relative space-y-6 border-l border-muted">
                        {serviceDetail.approvalProcess.map((step, index) => (
                          <li key={index} className="ml-6">
                            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              {index + 1}
                            </span>
                            <div className="flex flex-col space-y-1">
                              <h4 className="text-base font-medium">{step}</h4>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">必要情報</CardTitle>
                      <CardDescription>申請時に入力が必要な情報</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {serviceDetail.requiredInformation.map((info, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
                            <span>{info}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <div className="flex items-center gap-2 rounded-md bg-muted p-4 text-sm">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    <span>
                      申請に関して質問がある場合は、IT部門（support@example.com）までお問い合わせください。
                    </span>
                  </div>
                </TabsContent>
                <TabsContent value="faq" className="space-y-4 pt-4">
                  <div>
                    <h3 className="mb-3 text-base font-medium">よくある質問</h3>
                    <div className="space-y-3">
                      {serviceDetail.faqs.map((faq, index) => (
                        <div key={index} className="rounded-md border p-4">
                          <h4 className="font-medium">{faq.question}</h4>
                          <p className="mt-2 text-sm">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <h3 className="mb-3 font-medium">このページは役に立ちましたか？</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSubmitFeedback}>
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          はい、役立ちました
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSubmitFeedback}>
                          いいえ、もっと情報が欲しいです
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>それでも質問がありますか？</span>
                        <Button variant="link" size="sm" className="p-0 h-auto">
                          IT部門に問い合わせる
                        </Button>
                      </div>
                    </div>
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
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={onRequestService}>
                <Plus className="mr-2 h-4 w-4" />
                このサービスをリクエスト
              </Button>
              <Button className="w-full" variant="outline" onClick={handleAddToFavorites}>
                <Star className="mr-2 h-4 w-4" />
                お気に入りに追加
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>サービス情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-3">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-muted-foreground">カテゴリ</div>
                  <div>{serviceDetail.category}</div>
                  <div className="text-muted-foreground">所要時間</div>
                  <div>{serviceDetail.fulfillmentTime}</div>
                  <div className="text-muted-foreground">承認</div>
                  <div>{serviceDetail.approvalRequired ? "必要" : "不要"}</div>
                  <div className="text-muted-foreground">コスト</div>
                  <div>{serviceDetail.cost}</div>
                </div>
              </div>
              
              <div>
                <h3 className="mb-2 text-sm font-medium">タグ</h3>
                <div className="flex flex-wrap gap-1">
                  {serviceDetail.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500 fill-current" />
                  <span className="font-medium">{serviceDetail.rating}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  利用者評価
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// サービスステータスバッジコンポーネント
function ServiceStatusBadge({ status }: { status: string }) {
  let classes = "";
  let label = "";
  
  switch(status) {
    case "available":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      label = "利用可能";
      break;
    case "limited":
      classes = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      label = "一部利用制限あり";
      break;
    case "unavailable":
      classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      label = "現在利用不可";
      break;
    case "planned":
      classes = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      label = "準備中";
      break;
    default:
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      label = "利用可能";
  }
  
  return (
    <Badge variant="outline" className={classes}>
      {label}
    </Badge>
  );
}