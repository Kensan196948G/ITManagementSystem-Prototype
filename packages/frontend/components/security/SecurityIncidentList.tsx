import { useState } from "react";
import { Shield, AlertTriangle, Search, Filter, MoreHorizontal, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarFallback } from "../ui/avatar";

// セキュリティインシデントのサンプルデータ
const securityIncidents = [
  {
    id: "SEC-001",
    title: "不審なログイン試行検知",
    type: "不正アクセス試行",
    severity: "高",
    status: "対応中",
    reporter: { name: "山田太郎", initials: "山田" },
    assignee: { name: "佐藤三郎", initials: "佐藤" },
    createdAt: "2025-05-08T09:15:00",
    affectedSystems: ["Microsoft 365", "Entra ID"],
    description: "海外IPアドレスから複数回の管理者アカウントへのログイン試行を検知しました。"
  },
  {
    id: "SEC-002",
    title: "異常なデータ転送",
    type: "データ流出の可能性",
    severity: "高",
    status: "調査中",
    reporter: { name: "鈴木花子", initials: "鈴木" },
    assignee: { name: "田中次郎", initials: "田中" },
    createdAt: "2025-05-05T14:30:00",
    affectedSystems: ["SharePoint", "OneDrive for Business"],
    description: "通常よりも大量のデータ転送が特定のユーザーアカウントから検出されました。"
  },
  {
    id: "SEC-003",
    title: "フィッシングメール報告",
    type: "フィッシング",
    severity: "中",
    status: "対応中",
    reporter: { name: "高橋一郎", initials: "高橋" },
    assignee: { name: "佐藤三郎", initials: "佐藤" },
    createdAt: "2025-05-07T11:20:00",
    affectedSystems: ["Exchange Online"],
    description: "Microsoft 365のパスワードリセットを装ったフィッシングメールが複数のユーザーに送信されました。"
  },
  {
    id: "SEC-004",
    title: "マルウェア検出",
    type: "マルウェア",
    severity: "高",
    status: "対応完了",
    reporter: { name: "伊藤めぐみ", initials: "伊藤" },
    assignee: { name: "山田太郎", initials: "山田" },
    createdAt: "2025-05-01T10:45:00",
    affectedSystems: ["クライアントPC"],
    description: "営業部のPCでランサムウェアが検出されました。隔離済みです。"
  },
  {
    id: "SEC-005",
    title: "不正なファイアウォール変更",
    type: "設定変更",
    severity: "高",
    status: "対応完了",
    reporter: { name: "渡辺健太", initials: "渡辺" },
    assignee: { name: "佐藤三郎", initials: "佐藤" },
    createdAt: "2025-05-04T16:30:00",
    affectedSystems: ["ファイアウォール"],
    description: "承認されていないファイアウォールルールの変更が検出されました。変更は元に戻されました。"
  },
  {
    id: "SEC-006",
    title: "特権アカウント不正使用",
    type: "権限悪用",
    severity: "重大",
    status: "調査中",
    reporter: { name: "田中次郎", initials: "田中" },
    assignee: { name: "高橋一郎", initials: "高橋" },
    createdAt: "2025-05-09T09:20:00",
    affectedSystems: ["Active Directory", "Microsoft Entra ID"],
    description: "特権アカウントの不審な使用が検出されました。通常の業務時間外にセキュリティグループの変更が行われています。"
  },
  {
    id: "SEC-007",
    title: "DDoS攻撃",
    type: "サービス妨害",
    severity: "高",
    status: "対応中",
    reporter: { name: "山田太郎", initials: "山田" },
    assignee: { name: "渡辺健太", initials: "渡辺" },
    createdAt: "2025-05-08T13:45:00",
    affectedSystems: ["Webサーバー"],
    description: "社内Webアプリケーションに対する分散型サービス拒否攻撃が検出されました。緩和策を実施中です。"
  },
  {
    id: "SEC-008",
    title: "機密文書への不正アクセス",
    type: "情報漏洩",
    severity: "高",
    status: "調査中",
    reporter: { name: "佐藤三郎", initials: "佐藤" },
    assignee: { name: "鈴木花子", initials: "鈴木" },
    createdAt: "2025-05-06T10:15:00",
    affectedSystems: ["SharePoint"],
    description: "人事部の機密文書へのアクセス権限を持たないユーザーからのアクセスが検出されました。"
  },
  {
    id: "SEC-009",
    title: "未認可デバイス接続",
    type: "ポリシー違反",
    severity: "中",
    status: "対応完了",
    reporter: { name: "高橋一郎", initials: "高橋" },
    assignee: { name: "伊藤めぐみ", initials: "伊藤" },
    createdAt: "2025-05-02T14:20:00",
    affectedSystems: ["社内ネットワーク"],
    description: "承認されていない個人デバイスの社内ネットワークへの接続が検出されました。ネットワークから切断されました。"
  },
  {
    id: "SEC-010",
    title: "SQLインジェクション攻撃",
    type: "Webアプリケーション攻撃",
    severity: "高",
    status: "対応完了",
    reporter: { name: "渡辺健太", initials: "渡辺" },
    assignee: { name: "田中次郎", initials: "田中" },
    createdAt: "2025-04-29T11:30:00",
    affectedSystems: ["社内Webアプリケーション"],
    description: "社内Webアプリケーションに対するSQLインジェクション攻撃が検出されました。脆弱性は修正されました。"
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

export function SecurityIncidentList() {
  const [search, setSearch] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const filteredIncidents = securityIncidents.filter(incident => {
    // 検索フィルタリング
    const searchMatch = incident.title.toLowerCase().includes(search.toLowerCase()) ||
                      incident.id.toLowerCase().includes(search.toLowerCase()) ||
                      incident.affectedSystems.some(system => system.toLowerCase().includes(search.toLowerCase()));
    
    // 重要度フィルタリング
    const severityMatch = selectedSeverity === "all" || incident.severity === selectedSeverity;
    
    // ステータスフィルタリング
    const statusMatch = selectedStatus === "all" || incident.status === selectedStatus;
    
    return searchMatch && severityMatch && statusMatch;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="インシデントを検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 sm:w-[300px]"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">フィルター</span>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="all" value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="重要度" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての重要度</SelectItem>
              <SelectItem value="重大">重大</SelectItem>
              <SelectItem value="高">高</SelectItem>
              <SelectItem value="中">中</SelectItem>
              <SelectItem value="低">低</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all" value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのステータス</SelectItem>
              <SelectItem value="調査中">調査中</SelectItem>
              <SelectItem value="対応中">対応中</SelectItem>
              <SelectItem value="対応完了">対応完了</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead className="w-[300px]">タイトル</TableHead>
              <TableHead>タイプ</TableHead>
              <TableHead>重要度</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>担当者</TableHead>
              <TableHead>報告日</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell>{incident.id}</TableCell>
                <TableCell className="font-medium">{incident.title}</TableCell>
                <TableCell>{incident.type}</TableCell>
                <TableCell>
                  <SeverityBadge severity={incident.severity} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={incident.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {incident.assignee ? (
                      <>
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback>{incident.assignee.initials.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{incident.assignee.name}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">未割り当て</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    {formatDate(incident.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">操作</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>詳細を表示</DropdownMenuItem>
                      <DropdownMenuItem>担当者を変更</DropdownMenuItem>
                      <DropdownMenuItem>ステータスを更新</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>対応レポート作成</DropdownMenuItem>
                      <DropdownMenuItem>関連インシデント検索</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  let classes = "";
  
  switch (severity) {
    case "重大":
      classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      break;
    case "高":
      classes = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      break;
    case "中":
      classes = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      break;
    case "低":
      classes = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{severity}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  let classes = "";
  
  switch (status) {
    case "調査中":
      classes = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      break;
    case "対応中":
      classes = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      break;
    case "対応完了":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{status}</Badge>;
}