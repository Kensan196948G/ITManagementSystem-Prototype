import { AlertCircle, Check, Clock, FileText, Search } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

// 既知のエラーのサンプルデータ
const knownErrors = [
  {
    id: "KE-001",
    title: "Exchange Online - NDR 5.7.134でメール配信失敗",
    description: "メールがSPF, DKIMまたはDMARC認証に失敗した際に発生するNDR 5.7.134エラー",
    symptoms: [
      "外部ドメインへのメール送信時にNDR（配信不能レポート）が返される",
      "NDRメッセージに「5.7.134 メッセージはSPF, DKIM, DMARCの検証に失敗しました」というエラーが表示される",
      "特定の外部ドメインのみに発生する場合がある"
    ],
    category: "exchange",
    status: "active",
    priority: "中",
    impact: "中",
    services: ["Exchange Online"],
    workaround: "送信ドメインのDNS設定を確認し、SPFレコードが正しく構成されていることを確認する。DMARCポリシーが厳格に設定されている場合は、受信者のIT管理者に連絡し、例外リストに追加してもらう。",
    resolution: "1. SPFレコードの設定を修正する\n2. DKIMを有効化し、適切に構成する\n3. DMARCポリシーを設定する",
    relatedProblems: ["PRB-023"],
    relatedIncidents: ["INC-156", "INC-178", "INC-203"],
    createdDate: "2025-02-15T10:30:00",
    lastUpdated: "2025-05-01T14:45:00",
    author: "鈴木花子",
    tags: ["メール配信", "NDR", "SPF", "DKIM", "DMARC"]
  },
  {
    id: "KE-002",
    title: "Active Directory - グループポリシー適用の遅延",
    description: "Active Directoryのグループポリシー処理の遅延によりログオン時間が大幅に増加する問題",
    symptoms: [
      "Windowsログオン時に「グループポリシーを適用しています」の画面が長時間表示される",
      "ログオン完了までに2分以上かかる",
      "イベントビューアに「グループポリシー処理に時間がかかりすぎています」という警告が表示される"
    ],
    category: "activedirectory",
    status: "active",
    priority: "高",
    impact: "高",
    services: ["Active Directory"],
    workaround: "一時的な対処として、gpupdate /forceコマンドの実行を避ける。必要に応じてローカルグループポリシーを使用する。",
    resolution: "1. WMIリポジトリの再構築\n2. SYSVOLフォルダの整合性確認\n3. 不要なGPOを整理・削除\n4. GPOの処理順序を最適化",
    relatedProblems: ["PRB-042"],
    relatedIncidents: ["INC-287", "INC-295", "INC-312"],
    createdDate: "2025-03-10T11:20:00",
    lastUpdated: "2025-04-28T16:30:00",
    author: "高橋一郎",
    tags: ["グループポリシー", "ログオン", "処理遅延", "GPO"]
  },
  {
    id: "KE-003",
    title: "Microsoft Teams - アクセス権要求が表示されない",
    description: "Microsoft Teamsでのチャネルへのアクセス権要求オプションが表示されない問題",
    symptoms: [
      "プライベートチャネルで「アクセス権を要求」オプションが表示されない",
      "ユーザーがプライベートチャネルにアクセスできない",
      "チャネル所有者に直接連絡する必要がある"
    ],
    category: "teams",
    status: "active",
    priority: "低",
    impact: "低",
    services: ["Microsoft Teams"],
    workaround: "管理者またはチャネル所有者に直接連絡して、チャネルアクセス権を要求する。",
    resolution: "現在この問題に対する恒久的な解決策はありません。Microsoft Teamsの既知の問題として認識されています。最新のTeamsアップデートを適用することで将来的に解決される可能性があります。",
    relatedProblems: ["PRB-056"],
    relatedIncidents: ["INC-342"],
    createdDate: "2025-04-05T09:15:00",
    lastUpdated: "2025-04-20T13:40:00",
    author: "佐藤メイ",
    tags: ["Teams", "プライベートチャネル", "アクセス権", "権限"]
  },
  {
    id: "KE-004",
    title: "Microsoft Entra ID - 条件付きアクセスポリシーの競合",
    description: "複数の条件付きアクセスポリシーが競合し、ユーザーがアプリケーションにアクセスできなくなる問題",
    symptoms: [
      "ユーザーがMicrosoft 365アプリケーションにサインインできない",
      "「組織のポリシーによってアクセスがブロックされています」というエラーメッセージが表示される",
      "条件付きアクセスポリシーの診断ツールで競合が検出される"
    ],
    category: "entra",
    status: "active",
    priority: "高",
    impact: "高",
    services: ["Microsoft Entra ID", "Microsoft 365"],
    workaround: "影響を受けるユーザーを一時的に条件付きアクセスポリシーの除外グループに追加する。",
    resolution: "1. 競合する条件付きアクセスポリシーを特定する\n2. ポリシーの優先順位を設定する\n3. 重複するポリシーを統合・整理する\n4. ポリシーのターゲットスコープを明確に定義する",
    relatedProblems: ["PRB-078"],
    relatedIncidents: ["INC-401", "INC-422", "INC-436"],
    createdDate: "2025-03-25T14:10:00",
    lastUpdated: "2025-05-05T11:25:00",
    author: "山田太郎",
    tags: ["Entra ID", "条件付きアクセス", "ポリシー", "サインイン"]
  },
  {
    id: "KE-005",
    title: "OneDrive for Business - 同期エラー 0x8004def5",
    description: "OneDriveクライアントで発生する同期エラー 0x8004def5により、ファイル同期が停止する問題",
    symptoms: [
      "OneDriveクライアントにエラーコード 0x8004def5が表示される",
      "ファイルの同期が停止する",
      "OneDriveタスクトレイアイコンに赤い「X」マークが表示される"
    ],
    category: "microsoft365",
    status: "resolved",
    priority: "中",
    impact: "中",
    services: ["OneDrive for Business"],
    workaround: "OneDriveクライアントの再起動、またはWindowsにサインアウトして再サインインする。",
    resolution: "1. OneDriveキャッシュをリセットする\n2. OneDriveクライアントを最新バージョンに更新する\n3. Microsoft Supportツールを使用してOneDriveを修復する",
    relatedProblems: ["PRB-062"],
    relatedIncidents: ["INC-356", "INC-365"],
    createdDate: "2025-02-28T15:30:00",
    lastUpdated: "2025-04-15T10:45:00",
    author: "小林茂",
    tags: ["OneDrive", "同期", "エラーコード", "0x8004def5"]
  },
  {
    id: "KE-006",
    title: "DirectCloud - バックアップエラー E1003",
    description: "DirectCloudのバックアップジョブ実行中にエラーE1003が発生し、バックアップが失敗する問題",
    symptoms: [
      "バックアップジョブがエラーE1003で失敗する",
      "管理コンソールに「接続が予期せず切断されました」というメッセージが表示される",
      "増分バックアップが完了しない"
    ],
    category: "backups",
    status: "active",
    priority: "中",
    impact: "中",
    services: ["DirectCloud"],
    workaround: "一時的な対処として、完全バックアップを手動で開始する。",
    resolution: "1. DirectCloudエージェントを再インストールする\n2. ファイアウォール設定でDirectCloudサービスの通信を許可する\n3. システムイベントログでネットワーク接続の問題を確認する",
    relatedProblems: ["PRB-085"],
    relatedIncidents: ["INC-452"],
    createdDate: "2025-04-12T09:40:00",
    lastUpdated: "2025-05-02T13:20:00",
    author: "伊藤雄太",
    tags: ["DirectCloud", "バックアップ", "エラー", "E1003"]
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

interface KnownErrorsListProps {
  searchQuery: string;
  categoryFilter: string;
  onViewKnownError: () => void;
}

export function KnownErrorsList({ 
  searchQuery, 
  categoryFilter,
  onViewKnownError
}: KnownErrorsListProps) {
  // 検索クエリとカテゴリでフィルタリング
  const filteredErrors = knownErrors.filter(error => {
    const matchesSearch = 
      error.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      error.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.symptoms.some(symptom => symptom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      error.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      categoryFilter === "all" || 
      error.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // アクティブな既知のエラー
  const activeErrors = filteredErrors.filter(error => error.status === "active");
  
  // 解決済みの既知のエラー
  const resolvedErrors = filteredErrors.filter(error => error.status === "resolved");
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">既知のエラー</h2>
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <span>アクティブ: {activeErrors.length}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>現在アクティブな既知のエラー</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900 dark:text-green-200">
                  <Check className="h-4 w-4" />
                  <span>解決済み: {resolvedErrors.length}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>解決済みの既知のエラー</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">ID</TableHead>
              <TableHead>タイトル</TableHead>
              <TableHead>影響サービス</TableHead>
              <TableHead>優先度</TableHead>
              <TableHead>状態</TableHead>
              <TableHead>最終更新</TableHead>
              <TableHead className="w-[100px]">アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredErrors.map(error => (
              <TableRow key={error.id}>
                <TableCell className="font-medium">{error.id}</TableCell>
                <TableCell>
                  <div className="max-w-md">
                    <div className="font-medium hover:cursor-pointer hover:text-primary" onClick={onViewKnownError}>
                      {error.title}
                    </div>
                    <div className="line-clamp-1 text-sm text-muted-foreground">
                      {error.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {error.services.map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={error.priority} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={error.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDate(error.lastUpdated)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={onViewKnownError}>
                    <FileText className="mr-1 h-3.5 w-3.5" />
                    詳細
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {filteredErrors.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-md border">
          <p className="text-muted-foreground">検索条件に一致する既知のエラーが見つかりませんでした</p>
        </div>
      )}
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

// ステータスバッジコンポーネント
function StatusBadge({ status }: { status: string }) {
  let classes = "";
  
  switch (status) {
    case "active":
      classes = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      break;
    case "resolved":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return (
    <Badge variant="outline" className={classes}>
      {status === "active" ? "アクティブ" : "解決済み"}
    </Badge>
  );
}