import { useState } from "react";
import { MoreHorizontal, Filter, Plus } from "lucide-react";
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
import { NewIncidentForm } from "./NewIncidentForm";
import { toast } from "sonner";

// インシデントのサンプルデータ - タイプ定義
interface Assignee {
  name: string;
  initials: string;
}

interface Incident {
  id: string;
  title: string;
  priority: string;
  status: string;
  assignee: Assignee;
  createdAt: string;
  updatedAt: string;
  sla: string;
  description?: string;
  category?: string;
  impact?: string;
}

// インシデントのサンプルデータ
const initialIncidents: Incident[] = [
  {
    id: "INC-001",
    title: "東データセンターのネットワーク障害",
    priority: "緊急",
    status: "未対応",
    assignee: { name: "山田太郎", initials: "山田" },
    createdAt: "2025-05-09T15:30:00",
    updatedAt: "2025-05-10T08:15:00",
    sla: "残り2時間",
  },
  {
    id: "INC-002",
    title: "メールサーバーのパフォーマンス低下",
    priority: "高",
    status: "対応中",
    assignee: { name: "田中次郎", initials: "田中" },
    createdAt: "2025-05-09T12:45:00",
    updatedAt: "2025-05-10T07:30:00",
    sla: "残り4時間",
  },
  {
    id: "INC-003",
    title: "CRMアプリケーションの読み込み遅延",
    priority: "中",
    status: "対応中",
    assignee: { name: "佐藤三郎", initials: "佐藤" },
    createdAt: "2025-05-09T10:15:00",
    updatedAt: "2025-05-09T14:30:00",
    sla: "残り8時間",
  },
  {
    id: "INC-004",
    title: "リモートユーザー向けVPN接続問題",
    priority: "低",
    status: "未対応",
    assignee: { name: "鈴木花子", initials: "鈴木" },
    createdAt: "2025-05-09T09:00:00",
    updatedAt: "2025-05-09T11:45:00",
    sla: "残り16時間",
  },
  {
    id: "INC-005",
    title: "共有ドライブのアクセス権限エラー",
    priority: "中",
    status: "未対応",
    assignee: { name: "高橋一郎", initials: "高橋" },
    createdAt: "2025-05-08T16:30:00",
    updatedAt: "2025-05-09T10:15:00",
    sla: "残り6時間",
  },
  {
    id: "INC-006",
    title: "プリンターネットワーク設定の障害",
    priority: "低",
    status: "解決済",
    assignee: { name: "伊藤めぐみ", initials: "伊藤" },
    createdAt: "2025-05-08T14:15:00",
    updatedAt: "2025-05-09T09:30:00",
    sla: "完了",
  },
  {
    id: "INC-007",
    title: "会計システムのデータベース接続タイムアウト",
    priority: "高",
    status: "解決済",
    assignee: { name: "渡辺健太", initials: "渡辺" },
    createdAt: "2025-05-08T11:00:00",
    updatedAt: "2025-05-08T16:45:00",
    sla: "完了",
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

export function IncidentsTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [isNewIncidentDialogOpen, setIsNewIncidentDialogOpen] = useState(false);
  
  // 新規インシデント追加処理
  const handleAddIncident = (newIncident: Incident) => {
    setIncidents([newIncident, ...incidents]);
    toast.success(`インシデント ${newIncident.id} が登録されました`);
  };
  
  // フィルタリング処理
  const filteredIncidents = incidents.filter(incident => {
    // 検索フィルター
    const matchesSearch = search === "" || 
      incident.title.toLowerCase().includes(search.toLowerCase()) ||
      incident.id.toLowerCase().includes(search.toLowerCase());
    
    // ステータスフィルター
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "open" && incident.status === "未対応") ||
      (statusFilter === "inprogress" && incident.status === "対応中") ||
      (statusFilter === "resolved" && incident.status === "解決済") ||
      (statusFilter === "closed" && incident.status === "完了");
    
    return matchesSearch && matchesStatus;
  });
  
  // ステータス変更処理
  const handleStatusChange = (incidentId: string, newStatus: string) => {
    setIncidents(incidents.map(incident => 
      incident.id === incidentId 
        ? { 
            ...incident, 
            status: newStatus, 
            updatedAt: new Date().toISOString(),
            sla: newStatus === "解決済" || newStatus === "完了" ? "完了" : incident.sla
          } 
        : incident
    ));
    toast.success(`インシデントのステータスが ${newStatus} に更新されました`);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="インシデントを検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">フィルター</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            defaultValue="all" 
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ステータスで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのステータス</SelectItem>
              <SelectItem value="open">未対応</SelectItem>
              <SelectItem value="inprogress">対応中</SelectItem>
              <SelectItem value="resolved">解決済</SelectItem>
              <SelectItem value="closed">完了</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsNewIncidentDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規インシデント
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>タイトル</TableHead>
              <TableHead>優先度</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>担当者</TableHead>
              <TableHead>更新日時</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  該当するインシデントが見つかりません
                </TableCell>
              </TableRow>
            ) : (
              filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="whitespace-nowrap">{incident.id}</TableCell>
                  <TableCell>{incident.title}</TableCell>
                  <TableCell>
                    <PriorityBadge priority={incident.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={incident.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {incident.assignee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden whitespace-nowrap lg:inline-block">
                        {incident.assignee.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(incident.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <SLAIndicator sla={incident.sla} />
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
                        <DropdownMenuItem>担当者変更</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(incident.id, "対応中")}>
                          対応中にする
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(incident.id, "解決済")}>
                          解決済みにする
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(incident.id, "完了")}>
                          完了にする
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* 新規インシデントフォーム */}
      <NewIncidentForm 
        isOpen={isNewIncidentDialogOpen}
        onClose={() => setIsNewIncidentDialogOpen(false)}
        onSubmit={handleAddIncident}
      />
    </div>
  );
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
      classes = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      break;
    case "対応中":
      classes = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
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

function SLAIndicator({ sla }: { sla: string }) {
  if (sla === "完了") {
    return <span className="text-green-600 dark:text-green-400">{sla}</span>;
  }
  
  if (sla.includes("残り")) {
    const hours = parseInt(sla.replace(/[^0-9]/g, ""));
    if (hours <= 2) {
      return <span className="text-red-600 dark:text-red-400">{sla}</span>;
    } else if (hours <= 4) {
      return <span className="text-orange-600 dark:text-orange-400">{sla}</span>;
    }
  }
  
  return <span className="text-muted-foreground">{sla}</span>;
}