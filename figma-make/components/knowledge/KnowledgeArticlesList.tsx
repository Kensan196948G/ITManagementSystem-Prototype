import { Clock, Eye, Heart, MessageSquare, Star, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";

// ナレッジ記事のサンプルデータ
const knowledgeArticles = [
  {
    id: "KA-001",
    title: "Microsoft 365 認証エラーのトラブルシューティング",
    summary: "Microsoft 365のサインインエラーの一般的な原因と解決方法をまとめた包括的なガイド",
    content: "Microsoft 365への認証に問題が発生した場合の詳細なトラブルシューティング手順。パスワードリセット、MFAの問題、条件付きアクセスポリシーによるブロックなどの解決方法を説明しています。",
    category: "microsoft365",
    tags: ["認証", "サインイン", "MFA", "条件付きアクセス"],
    author: {
      name: "田中慎太郎",
      department: "クラウドサービスチーム",
      avatar: "TS"
    },
    stats: {
      views: 1245,
      likes: 87,
      comments: 12
    },
    rating: 4.8,
    lastUpdated: "2025-05-08T14:30:00",
    relatedServices: ["Microsoft 365", "Microsoft Entra ID"],
    isFeatured: true
  },
  {
    id: "KA-002",
    title: "Active Directory ユーザーアカウントのロックアウトトラブルシューティング",
    summary: "ユーザーアカウントのロックアウトを診断して解決するための手順と予防策",
    content: "Active Directoryでユーザーがロックアウトされた場合の診断方法とロックアウトの解除方法について解説しています。イベントログの確認、アカウントロックアウトステータスツールの使用方法なども含みます。",
    category: "activedirectory",
    tags: ["アカウントロックアウト", "AD", "セキュリティ", "パスワード"],
    author: {
      name: "高橋一郎",
      department: "インフラチーム",
      avatar: "TI"
    },
    stats: {
      views: 987,
      likes: 62,
      comments: 8
    },
    rating: 4.5,
    lastUpdated: "2025-05-05T11:45:00",
    relatedServices: ["Active Directory", "Microsoft Entra ID"],
    isFeatured: false
  },
  {
    id: "KA-003",
    title: "Microsoft Teams 会議の音声・映像問題の解決方法",
    summary: "Teams会議での音声や映像の問題を解決するためのガイド",
    content: "Microsoft Teamsのオンライン会議で発生する可能性のある音声・映像の問題とその解決策について説明しています。ネットワーク診断、デバイス設定の確認、帯域幅の最適化などを含みます。",
    category: "teams",
    tags: ["音声", "映像", "会議", "オンライン", "トラブルシューティング"],
    author: {
      name: "佐藤メイ",
      department: "コラボレーションチーム",
      avatar: "SM"
    },
    stats: {
      views: 1562,
      likes: 124,
      comments: 18
    },
    rating: 4.9,
    lastUpdated: "2025-05-01T09:15:00",
    relatedServices: ["Microsoft Teams", "Microsoft 365"],
    isFeatured: true
  },
  {
    id: "KA-004",
    title: "Exchange Onlineのメールフロー問題のトラブルシューティング",
    summary: "送受信メールの配信問題を診断し解決するための包括的なガイド",
    content: "Exchange Onlineでのメール配信の遅延や失敗の問題を診断する方法と解決策について説明します。メールトレース、配信レポート、一般的な問題と解決方法などを含みます。",
    category: "exchange",
    tags: ["メールフロー", "配信", "Exchange", "トラブルシューティング"],
    author: {
      name: "鈴木花子",
      department: "メッセージングチーム",
      avatar: "SH"
    },
    stats: {
      views: 856,
      likes: 48,
      comments: 6
    },
    rating: 4.2,
    lastUpdated: "2025-04-25T13:20:00",
    relatedServices: ["Exchange Online", "Microsoft 365"],
    isFeatured: false
  },
  {
    id: "KA-005",
    title: "Microsoft Entra ID (旧Azure AD) と Active Directoryの同期問題",
    summary: "Entra Connect同期エラーのトラブルシューティングと問題解決方法",
    content: "Microsoft Entra Connect（旧Azure AD Connect）を使用したオンプレミスActive DirectoryとEntra IDの同期に関する問題の診断と解決方法について説明します。同期エラー、オブジェクト属性の問題、同期スケジュールの確認などを含みます。",
    category: "entra",
    tags: ["同期", "Azure AD", "Entra ID", "Entra Connect", "ハイブリッド"],
    author: {
      name: "山田太郎",
      department: "クラウドサービスチーム",
      avatar: "YT"
    },
    stats: {
      views: 765,
      likes: 41,
      comments: 9
    },
    rating: 4.6,
    lastUpdated: "2025-04-22T10:30:00",
    relatedServices: ["Microsoft Entra ID", "Active Directory", "Entra Connect"],
    isFeatured: false
  },
  {
    id: "KA-006",
    title: "OneDrive for Businessの同期問題のトラブルシューティング",
    summary: "OneDriveクライアントの同期エラーと解決策",
    content: "OneDrive for Businessクライアントで発生する同期エラーや問題の診断と解決方法について説明します。同期ステータスの確認、一般的なエラーコードの意味、同期のリセット方法などを含みます。",
    category: "microsoft365",
    tags: ["OneDrive", "同期", "ストレージ", "クラウド"],
    author: {
      name: "小林茂",
      department: "ストレージチーム",
      avatar: "KS"
    },
    stats: {
      views: 638,
      likes: 37,
      comments: 5
    },
    rating: 4.4,
    lastUpdated: "2025-04-18T16:45:00",
    relatedServices: ["OneDrive for Business", "Microsoft 365"],
    isFeatured: false
  }
];

// 日付フォーマット用ユーティリティ関数
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).format(date);
}

interface KnowledgeArticlesListProps {
  searchQuery: string;
  categoryFilter: string;
  onViewArticle: () => void;
}

export function KnowledgeArticlesList({ 
  searchQuery, 
  categoryFilter,
  onViewArticle
}: KnowledgeArticlesListProps) {
  // 検索クエリとカテゴリでフィルタリング
  const filteredArticles = knowledgeArticles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      categoryFilter === "all" || 
      article.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // 特集記事（上部に表示）
  const featuredArticles = filteredArticles.filter(article => article.isFeatured);
  
  // 通常記事
  const regularArticles = filteredArticles.filter(article => !article.isFeatured);
  
  return (
    <div className="space-y-6">
      {featuredArticles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">特集記事</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {featuredArticles.map(article => (
              <FeaturedArticleCard 
                key={article.id} 
                article={article} 
                onView={onViewArticle} 
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">技術文書</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {regularArticles.map(article => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              onView={onViewArticle} 
            />
          ))}
        </div>
        
        {regularArticles.length === 0 && (
          <div className="flex h-40 items-center justify-center rounded-md border">
            <p className="text-muted-foreground">検索条件に一致する記事が見つかりませんでした</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 特集記事カード
function FeaturedArticleCard({ 
  article, 
  onView 
}: { 
  article: typeof knowledgeArticles[0]; 
  onView: () => void;
}) {
  return (
    <Card className="overflow-hidden border-primary/10">
      <div className="absolute right-2 top-2">
        <Badge className="bg-primary text-primary-foreground">特集</Badge>
      </div>
      <CardHeader className="pb-2">
        <CardTitle 
          className="cursor-pointer hover:text-primary/80"
          onClick={onView}
        >
          {article.title}
        </CardTitle>
        <CardDescription>{article.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{article.author.avatar}</AvatarFallback>
          </Avatar>
          <div className="text-sm">{article.author.name}</div>
          <div className="text-xs text-muted-foreground">{article.author.department}</div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {article.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 pt-3">
        <div className="flex w-full items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{article.stats.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{article.stats.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{article.stats.comments}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>{article.rating}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

// 通常記事カード
function ArticleCard({ 
  article, 
  onView 
}: { 
  article: typeof knowledgeArticles[0]; 
  onView: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle 
          className="cursor-pointer text-base hover:text-primary/80"
          onClick={onView}
        >
          {article.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm">{article.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {article.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {article.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{article.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3">
        <div className="flex w-full items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">更新: {formatDate(article.lastUpdated)}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onView}>
            詳細を表示
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}