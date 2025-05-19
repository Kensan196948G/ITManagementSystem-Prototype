import { useState } from "react";
import { 
  ArrowLeft, 
  Bookmark, 
  Calendar, 
  Check, 
  ClipboardCopy, 
  Clock, 
  FileText, 
  Heart, 
  Link2, 
  MessageSquare, 
  Printer, 
  Share2, 
  Star, 
  ThumbsDown, 
  ThumbsUp, 
  User
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { toast } from "sonner";

// ナレッジ記事の詳細データ
const articleDetail = {
  id: "KA-001",
  title: "Microsoft 365 認証エラーのトラブルシューティング",
  summary: "Microsoft 365のサインインエラーの一般的な原因と解決方法をまとめた包括的なガイド",
  content: `
# Microsoft 365 認証エラーのトラブルシューティング

Microsoft 365サービスにサインインできない問題は、ユーザーの生産性に大きく影響します。このガイドでは、一般的な認証エラーの原因と解決策について説明します。

## 一般的な認証エラーのタイプ

### 1. パスワード関連の問題

* **症状**: 「パスワードが正しくありません」というエラーメッセージが表示される
* **原因**: パスワードの入力ミス、パスワードの有効期限切れ、アカウントのロック
* **解決策**:
  * パスワードをリセットする（[パスワードリセットポータル](https://passwordreset.microsoftonline.com)）
  * Caps Lockがオンになっていないか確認する
  * キーボード言語が正しいか確認する

### 2. 多要素認証（MFA）の問題

* **症状**: MFAの方法（電話、アプリなど）が機能しない
* **原因**: 認証アプリの設定ミス、電話番号の変更、デバイスの時刻同期の問題
* **解決策**:
  * Microsoft Authenticatorアプリが最新バージョンであることを確認する
  * デバイスの日付と時刻が正確に設定されていることを確認する
  * 代替認証方法を使用する
  * IT部門に連絡して認証方法をリセットしてもらう

### 3. 条件付きアクセスポリシーによるブロック

* **症状**: 「組織のポリシーによりアクセスがブロックされています」というエラーメッセージ
* **原因**: 企業のセキュリティポリシーが特定の条件下でアクセスを制限している
* **解決策**:
  * 企業ネットワークに接続する（VPN経由など）
  * 準拠デバイスからサインインする
  * IT部門に例外申請を行う

### 4. アカウントのロックアウト

* **症状**: 複数回のサインイン試行後にアカウントがロックされる
* **原因**: 複数回のパスワード入力ミス
* **解決策**:
  * 一定時間（通常30分）待ってから再試行する
  * パスワードリセットポータルを使用する
  * IT部門に連絡してアカウントのロックを解除してもらう

## サインイン問題の詳細な診断方法

1. **ブラウザのキャッシュをクリア**: プライベートブラウザモードでの試行または既存のブラウザキャッシュのクリア
2. **異なるブラウザでの試行**: Chrome、Edge、Firefoxなど複数のブラウザで試す
3. **デバイスの確認**: 別のデバイスからのサインイン試行
4. **ネットワークの確認**: 別のネットワーク（モバイルホットスポットなど）からの試行

## エラーコードと対処法

| エラーコード | 説明 | 対処法 |
|------------|------|------|
| AADSTS50126 | パスワードが間違っている | パスワードをリセットする |
| AADSTS50053 | アカウントがロックされている | しばらく待つか、IT部門に連絡する |
| AADSTS50076 | MFAが必要 | MFA認証を完了する |
| AADSTS50105 | ユーザーが見つからない | メールアドレスを確認する |
| AADSTS50158 | 条件付きアクセスによるブロック | IT部門に連絡して例外申請を行う |

## その他の解決方法

* **Office 365アプリの再認証**: アプリからサインアウトし、再サインインする
* **資格情報マネージャーのクリア**: Windowsの資格情報マネージャーからMicrosoft関連の資格情報を削除する
* **最新のソフトウェア**: OSとブラウザが最新であることを確認する

この問題が継続する場合は、IT部門またはヘルプデスクにお問い合わせください。問い合わせの際は以下の情報を提供することで、迅速な解決につながります：

1. エラーメッセージのスクリーンショット
2. エラーが発生した時刻
3. 使用していたデバイスとブラウザの情報
4. 試した解決策

---

最終更新: 2025年5月8日
`,
  category: "microsoft365",
  tags: ["認証", "サインイン", "MFA", "条件付きアクセス"],
  author: {
    name: "田中慎太郎",
    department: "クラウドサービスチーム",
    avatar: "TS",
    email: "tanaka.s@example.com"
  },
  stats: {
    views: 1245,
    likes: 87,
    comments: 12
  },
  rating: 4.8,
  createdDate: "2025-03-10T09:15:00",
  lastUpdated: "2025-05-08T14:30:00",
  relatedServices: ["Microsoft 365", "Microsoft Entra ID"],
  relatedArticles: [
    { id: "KA-005", title: "Microsoft Entra ID (旧Azure AD) と Active Directoryの同期問題" },
    { id: "KA-008", title: "Microsoft 365 サインインセッションの理解とトラブルシューティング" },
    { id: "KA-012", title: "多要素認証（MFA）の設定とトラブルシューティング" }
  ],
  relatedKnownErrors: [
    { id: "KE-004", title: "Microsoft Entra ID - 条件付きアクセスポリシーの競合" }
  ],
  comments: [
    {
      id: 1,
      author: "佐藤健太",
      avatar: "SK",
      date: "2025-05-05T11:30:00",
      content: "とても役立つ記事です。特にエラーコードと対処法の表が分かりやすいですね。ありがとうございます！",
      likes: 5
    },
    {
      id: 2,
      author: "鈴木メイ",
      avatar: "SM",
      date: "2025-05-02T15:45:00",
      content: "AADSTSエラーコードの解説が助かりました。条件付きアクセスによるブロックの診断方法についても、もう少し詳しく知りたいです。",
      likes: 3
    },
    {
      id: 3,
      author: "高橋一郎",
      avatar: "TI",
      date: "2025-04-28T09:20:00",
      content: "「その他の解決方法」セクションに、「ハイブリッド環境でのパスワードハッシュ同期の確認」も追加してはどうでしょうか？オンプレADとEntra IDを使用している環境ではよく問題になります。",
      likes: 7
    }
  ],
  versions: [
    { version: "1.0", date: "2025-03-10", notes: "初版公開" },
    { version: "1.1", date: "2025-04-15", notes: "エラーコード表の追加" },
    { version: "1.2", date: "2025-05-08", notes: "条件付きアクセスポリシーの情報を更新" }
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

export function KnowledgeArticleDetail({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("content");
  const [commentText, setCommentText] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(null);
  
  // コメント送信処理
  const handleSubmitComment = () => {
    if (commentText.trim() === "") return;
    // 実際のアプリではAPIを呼び出してコメントを保存
    toast.success("コメントが投稿されました");
    setCommentText("");
  };
  
  // 記事のコピー処理
  const handleCopyArticle = () => {
    navigator.clipboard.writeText(articleDetail.content);
    toast.success("記事の内容をクリップボードにコピーしました");
  };
  
  // 記事のURL共有処理
  const handleShareArticle = () => {
    // 実際のアプリではURLをクリップボードにコピー
    toast.success("記事のURLをクリップボードにコピーしました");
  };
  
  // 記事をお気に入りに追加する処理
  const handleBookmark = () => {
    toast.success("記事をお気に入りに追加しました");
  };
  
  // 印刷処理
  const handlePrint = () => {
    window.print();
  };
  
  // フィードバック送信処理
  const handleSubmitFeedback = (type: "helpful" | "not-helpful") => {
    setFeedback(type);
    toast.success(type === "helpful" ? "フィードバックをありがとうございます" : "改善点のフィードバックをありがとうございます");
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2>{articleDetail.id}: {articleDetail.title}</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b pb-3">
              <div className="flex justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {articleDetail.category}
                  </Badge>
                  <CardTitle>{articleDetail.title}</CardTitle>
                  <CardDescription className="mt-1">{articleDetail.summary}</CardDescription>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{articleDetail.author.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">{articleDetail.author.name}</div>
                  <div className="text-xs text-muted-foreground">{articleDetail.author.department}</div>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>更新: {formatDate(articleDetail.lastUpdated)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="content">内容</TabsTrigger>
                  <TabsTrigger value="comments">
                    コメント
                    <Badge variant="secondary" className="ml-1">{articleDetail.comments.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="history">履歴</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="markdown-content mt-4">
                  <div className="prose max-w-none dark:prose-invert">
                    {/* 実際のアプリではMarkdownレンダラーを使用 */}
                    <pre className="whitespace-pre-wrap font-sans text-sm">{articleDetail.content}</pre>
                  </div>
                  
                  <div className="mt-8 rounded-md border p-4">
                    <h3 className="mb-3 font-medium">このナレッジ記事は役に立ちましたか？</h3>
                    <div className="flex gap-2">
                      <Button
                        variant={feedback === "helpful" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSubmitFeedback("helpful")}
                      >
                        <ThumbsUp className="mr-1 h-4 w-4" />
                        はい、役立ちました
                      </Button>
                      <Button
                        variant={feedback === "not-helpful" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSubmitFeedback("not-helpful")}
                      >
                        <ThumbsDown className="mr-1 h-4 w-4" />
                        いいえ、十分ではありません
                      </Button>
                    </div>
                    
                    {feedback === "not-helpful" && (
                      <div className="mt-3">
                        <Textarea 
                          placeholder="この記事をどのように改善できるか教えてください"
                          className="min-h-[80px]"
                        />
                        <Button size="sm" className="mt-2">
                          フィードバックを送信
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="comments" className="mt-4 space-y-4">
                  <div className="space-y-4">
                    {articleDetail.comments.map(comment => (
                      <div key={comment.id} className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{comment.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{comment.author}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDateTime(comment.date)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <ThumbsUp className="h-3.5 w-3.5" />
                            </Button>
                            <span>{comment.likes}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <h3 className="mb-2 text-sm font-medium">コメントを追加</h3>
                    <Textarea
                      placeholder="この記事についてのコメントを書いてください..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button size="sm" onClick={handleSubmitComment}>
                        コメントを投稿
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>バージョン</TableHead>
                          <TableHead>日付</TableHead>
                          <TableHead>変更内容</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {articleDetail.versions.map((version, index) => (
                          <TableRow key={index}>
                            <TableCell>{version.version}</TableCell>
                            <TableCell>{formatDate(version.date)}</TableCell>
                            <TableCell>{version.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="mb-2 text-sm font-medium">作成・更新情報</h3>
                    <div className="grid grid-cols-2 gap-3 rounded-md border p-3">
                      <div>
                        <div className="text-xs text-muted-foreground">作成日</div>
                        <div className="text-sm">{formatDateTime(articleDetail.createdDate)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">作成者</div>
                        <div className="text-sm">{articleDetail.author.name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">最終更新日</div>
                        <div className="text-sm">{formatDateTime(articleDetail.lastUpdated)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">最終更新者</div>
                        <div className="text-sm">{articleDetail.author.name}</div>
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
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" onClick={handleCopyArticle}>
                <ClipboardCopy className="mr-2 h-4 w-4" />
                記事をコピー
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                印刷
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={handleShareArticle}>
                <Share2 className="mr-2 h-4 w-4" />
                共有
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={handleBookmark}>
                <Bookmark className="mr-2 h-4 w-4" />
                お気に入りに追加
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>記事情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span className="font-medium">評価</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-1 font-medium">{articleDetail.rating}</span>
                  <span className="text-muted-foreground">/ 5</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center rounded-md border p-3">
                  <Eye className="mb-1 h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{articleDetail.stats.views}</span>
                  <span className="text-xs text-muted-foreground">閲覧数</span>
                </div>
                <div className="flex flex-col items-center rounded-md border p-3">
                  <Heart className="mb-1 h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{articleDetail.stats.likes}</span>
                  <span className="text-xs text-muted-foreground">いいね</span>
                </div>
                <div className="flex flex-col items-center rounded-md border p-3">
                  <MessageSquare className="mb-1 h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{articleDetail.stats.comments}</span>
                  <span className="text-xs text-muted-foreground">コメント</span>
                </div>
              </div>
              
              <div>
                <h3 className="mb-2 text-sm font-medium">タグ</h3>
                <div className="flex flex-wrap gap-1">
                  {articleDetail.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="mb-2 text-sm font-medium">関連サービス</h3>
                <div className="flex flex-wrap gap-1">
                  {articleDetail.relatedServices.map((service, index) => (
                    <Badge key={index} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>関連記事</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {articleDetail.relatedArticles.map((article, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-md border p-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="cursor-pointer text-sm hover:text-primary">{article.title}</div>
                      <div className="text-xs text-muted-foreground">{article.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {articleDetail.relatedKnownErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>関連する既知のエラー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {articleDetail.relatedKnownErrors.map((error, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-md border p-3">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="cursor-pointer text-sm hover:text-primary">{error.title}</div>
                        <div className="text-xs text-muted-foreground">{error.id}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// テーブルコンポーネント
function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        {children}
      </table>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>;
}

function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-b transition-colors hover:bg-muted/50">{children}</tr>;
}

function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`h-10 px-2 text-left align-middle font-medium text-muted-foreground ${className || ""}`}>
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="p-2 align-middle">{children}</td>;
}