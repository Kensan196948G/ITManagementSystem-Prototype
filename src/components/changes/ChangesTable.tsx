import { useState } from "react";
import { Calendar, Clock, Filter, LinkIcon, MoreHorizontal, Search, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Avatar, AvatarFallback } from "../ui/avatar";

// 変更リクエストのサンプルデータ
const changes = [
  {
    id: "CHG-002",
    title: "Active DirectoryとEntra IDの同期設定変更",
    category: "構成",
    type: "通常変更",
    status: "審査中",
    priority: "高",
    risk: "中",
    requestor: { name: "山田太郎", initials: "山田" },
    assignee: { name: "高橋一郎", initials: "高橋" },
    createdAt: "2025-05-05T14:15:00",
    scheduledStart: "2025-05-20T21:00:00",
    scheduledEnd: "2025-05-20T23:00:00",
    systems: ["Active Directory", "Microsoft Entra ID", "Entra Connect"],
    approvals: 1,
    pendingApprovals: 2,
  },
  {
    id: "CHG-003",
    title: "Microsoft Teamsの通話品質改善設定",
    category: "パフォーマンス",
    type: "標準変更",
    status: "計画中",
    priority: "中",
    risk: "低",
    requestor: { name: "伊藤めぐみ", initials: "伊藤" },
    assignee: { name: "佐藤三郎", initials: "佐藤" },
    createdAt: "2025-05-07T10:45:00",
    scheduledStart: "2025-05-18T09:00:00",
    scheduledEnd: "2025-05-18T10:30:00",
    systems: ["Microsoft Teams"],
    approvals: 0,
    pendingApprovals: 3,
  },
  {
    id: "CHG-004",
    title: "OneDrive for Business同期クライアントアップデート",
    category: "アップデート",
    type: "標準変更",
    status: "実装中",
    priority: "低",
    risk: "低",
    requestor: { name: "鈴木花子", initials: "鈴木" },
    assignee: { name: "山田太郎", initials: "山田" },
    createdAt: "2025-05-01T08:30:00",
    scheduledStart: "2025-05-10T10:00:00",
    scheduledEnd: "2025-05-10T16:00:00",
    systems: ["OneDrive for Business"],
    approvals: 3,
    pendingApprovals: 0,
  },
  {
    id: "CHG-005",
    title: "Exchange Onlineのメール保持ポリシー変更",
    category: "ポリシー",
    type: "緊急変更",
    status: "審査中",
    priority: "緊急",
    risk: "高",
    requestor: { name: "高橋一郎", initials: "高橋" },
    assignee: { name: "佐藤三郎", initials: "佐藤" },
    createdAt: "2025-05-09T16:20:00",
    scheduledStart: "2025-05-11T20:00:00",
    scheduledEnd: "2025-05-11T21:30:00",
    systems: ["Exchange Online"],
    approvals: 1,
    pendingApprovals: 1,
  },
  {
    id: "CHG-006",
    title: "DeskNet'sNeo（Appsuit含む）バージョンアップグレード",
    category: "アップグレード",
    type: "通常変更",
    status: "ドラフト",
    priority: "中",
    risk: "中",
    requestor: { name: "渡辺健太", initials: "渡辺" },
    assignee: null,
    createdAt: "2025-05-08T11:30:00",
    scheduledStart: "2025-05-25T22:00:00",
    scheduledEnd: "2025-05-26T02:00:00",
    systems: ["DeskNet'sNeo（Appsuit含む）"],
    approvals: 0,
    pendingApprovals: 0,
  },
  {
    id: "CHG-007",
    title: "SkySea Client Viewエージェント設定変更",
    category: "構成",
    type: "標準変更",
    status: "完了",
    priority: "低",
    risk: "低",
    requestor: { name: "田中次郎", initials: "田中" },
    assignee: { name: "伊藤めぐみ", initials: "伊藤" },
    createdAt: "2025-04-28T13:45:00",
    scheduledStart: "2025-05-05T09:00:00",
    scheduledEnd: "2025-05-05T11:00:00",
    systems: ["SkySea Client View"],
    approvals: 3,
    pendingApprovals: 0,
  },
  {
    id: "CHG-008",
    title: "外部データセンター内ファイルサーバーストレージ増設",
    category: "ハードウェア",
    type: "通常変更",
    status: "承認済",
    priority: "高",
    risk: "中",
    requestor: { name: "鈴木花子", initials: "鈴木" },
    assignee: { name: "渡辺健太", initials: "渡辺" },
    createdAt: "2025-05-03T09:15:00",
    scheduledStart: "2025-05-17T21:00:00",
    scheduledEnd: "2025-05-18T05:00:00",
    systems: ["外部データセンター内ファイルサーバ"],
    approvals: 3,
    pendingApprovals: 0,
  },
];

// 日付フォーマット用ユーティリティ関数
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function ChangesTable() {
  const [search, setSearch] = useState("");
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="変更リクエストを検索..."
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
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ステータスで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのステータス</SelectItem>
              <SelectItem value="draft">ドラフト</SelectItem>
              <SelectItem value="review">審査中</SelectItem>
              <SelectItem value="approved">承認済</SelectItem>
              <SelectItem value="planning">計画中</SelectItem>
              <SelectItem value="implementing">実装中</SelectItem>
              <SelectItem value="completed">完了</SelectItem>
              <SelectItem value="closed">終了</SelectItem>
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
              <TableHead>カテゴリ</TableHead>
              <TableHead>種類</TableHead>
              <TableHead>リスク</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>スケジュール</TableHead>
              <TableHead>承認</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {changes.map((change) => (
              <TableRow key={change.id}>
                <TableCell className="whitespace-nowrap">{change.id}</TableCell>
                <TableCell>
                  <div className="overflow-hidden text-ellipsis">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-pointer">{change.title}</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="start" className="max-w-sm">
                          <p className="font-medium">{change.title}</p>
                          <p className="text-sm text-muted-foreground">
                            影響システム: {change.systems.join(", ")}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell>{change.category}</TableCell>
                <TableCell>
                  <ChangeTypeBadge type={change.type} />
                </TableCell>
                <TableCell>
                  <RiskBadge risk={change.risk} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={change.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{formatDateShort(change.scheduledStart)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <div className="font-medium">実装期間</div>
                            <div>開始: {formatDate(change.scheduledStart)}</div>
                            <div>終了: {formatDate(change.scheduledEnd)}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {change.pendingApprovals > 0 ? (
                      <span className="flex items-center gap-1 text-sm">
                        <Badge variant="outline">{change.approvals}/{change.approvals + change.pendingApprovals}</Badge>
                      </span>
                    ) : change.approvals > 0 ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        承認済
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">未申請</span>
                    )}
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
                      <DropdownMenuItem>編集</DropdownMenuItem>
                      {change.assignee ? (
                        <DropdownMenuItem>担当者変更</DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem>担当者割り当て</DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {change.status === "審査中" && (
                        <DropdownMenuItem>承認</DropdownMenuItem>
                      )}
                      {change.status === "承認済" && (
                        <DropdownMenuItem>実装開始</DropdownMenuItem>
                      )}
                      {change.status === "実装中" && (
                        <DropdownMenuItem>完了報告</DropdownMenuItem>
                      )}
                      {change.status === "ドラフト" && (
                        <DropdownMenuItem>審査依頼</DropdownMenuItem>
                      )}
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

// 日付の簡易フォーマット用関数（月/日のみ）
function formatDateShort(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
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