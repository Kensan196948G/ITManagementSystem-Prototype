import { useState } from "react";
import { Clock, Filter, MoreHorizontal, Plus, Search, AlertCircle, CheckCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

// SLAのサンプルデータ
const slaData = [
  {
    id: "SLA-001",
    name: "Microsoft 365 E3稼働保証",
    service: "Microsoft 365",
    category: "可用性",
    target: "99.9%",
    status: "適合",
    compliance: 99.95,
    priority: "高",
    startDate: "2025-01-01",
    endDate: "2026-12-31",
    responsibleTeam: "クラウドサービスチーム",
    responseTime: {
      critical: "30分",
      high: "2時間",
      medium: "4時間",
      low: "8時間"
    },
    resolutionTime: {
      critical: "4時間",
      high: "8時間",
      medium: "24時間",
      low: "48時間"
    },
    violations: 0,
    lastChecked: "2025-05-10T08:30:00"
  },
  {
    id: "SLA-002",
    name: "Active Directory認証サービス",
    service: "Active Directory",
    category: "可用性",
    target: "99.99%",
    status: "適合",
    compliance: 99.995,
    priority: "最高",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    responsibleTeam: "インフラチーム",
    responseTime: {
      critical: "15分",
      high: "30分",
      medium: "2時間",
      low: "4時間"
    },
    resolutionTime: {
      critical: "2時間",
      high: "4時間",
      medium: "8時間",
      low: "24時間"
    },
    violations: 0,
    lastChecked: "2025-05-10T08:30:00"
  },
  {
    id: "SLA-003",
    name: "Entra ID認証サービス",
    service: "Microsoft Entra ID",
    category: "可用性",
    target: "99.9%",
    status: "適合",
    compliance: 99.93,
    priority: "最高",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    responsibleTeam: "クラウドサービスチーム",
    responseTime: {
      critical: "15分",
      high: "30分",
      medium: "2時間",
      low: "4時間"
    },
    resolutionTime: {
      critical: "2時間",
      high: "4時間",
      medium: "8時間",
      low: "24時間"
    },
    violations: 0,
    lastChecked: "2025-05-10T08:30:00"
  },
  {
    id: "SLA-004",
    name: "Exchange Onlineメールサービス",
    service: "Exchange Online",
    category: "可用性",
    target: "99.9%",
    status: "適合",
    compliance: 99.92,
    priority: "高",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    responsibleTeam: "メッセージングチーム",
    responseTime: {
      critical: "30分",
      high: "2時間",
      medium: "4時間",
      low: "8時間"
    },
    resolutionTime: {
      critical: "4時間",
      high: "8時間",
      medium: "24時間",
      low: "48時間"
    },
    violations: 0,
    lastChecked: "2025-05-10T08:30:00"
  },
  {
    id: "SLA-005",
    name: "Microsoft Teams通話品質",
    service: "Microsoft Teams",
    category: "パフォーマンス",
    target: "95%",
    status: "警告",
    compliance: 93.5,
    priority: "高",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    responsibleTeam: "コラボレーションチーム",
    responseTime: {
      critical: "30分",
      high: "2時間",
      medium: "4時間",
      low: "8時間"
    },
    resolutionTime: {
      critical: "4時間",
      high: "8時間",
      medium: "24時間",
      low: "48時間"
    },
    violations: 2,
    lastChecked: "2025-05-10T08:30:00"
  },
  {
    id: "SLA-006",
    name: "OneDrive for Business同期速度",
    service: "OneDrive for Business",
    category: "パフォーマンス",
    target: "90%",
    status: "適合",
    compliance: 94.2,
    priority: "中",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    responsibleTeam: "ストレージチーム",
    responseTime: {
      critical: "1時間",
      high: "4時間",
      medium: "8時間",
      low: "16時間"
    },
    resolutionTime: {
      critical: "6時間",
      high: "12時間",
      medium: "36時間",
      low: "72時間"
    },
    violations: 0,
    lastChecked: "2025-05-10T08:30:00"
  },
  {
    id: "SLA-007",
    name: "ファイルサーバー応答時間",
    service: "外部データセンター内ファイルサーバ",
    category: "パフォーマンス",
    target: "95%",
    status: "違反",
    compliance: 87.3,
    priority: "高",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    responsibleTeam: "インフラチーム",
    responseTime: {
      critical: "30分",
      high: "2時間",
      medium: "4時間",
      low: "8時間"
    },
    resolutionTime: {
      critical: "4時間",
      high: "8時間",
      medium: "24時間",
      low: "48時間"
    },
    violations: 5,
    lastChecked: "2025-05-10T08:30:00"
  },
  {
    id: "SLA-008",
    name: "DeskNet'sNeo応答時間",
    service: "DeskNet'sNeo（Appsuit含む）",
    category: "パフォーマンス",
    target: "95%",
    status: "適合",
    compliance: 96.8,
    priority: "中",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    responsibleTeam: "業務システムチーム",
    responseTime: {
      critical: "1時間",
      high: "4時間",
      medium: "8時間",
      low: "16時間"
    },
    resolutionTime: {
      critical: "6時間",
      high: "12時間",
      medium: "36時間",
      low: "72時間"
    },
    violations: 0,
    lastChecked: "2025-05-10T08:30:00"
  },
  {
    id: "SLA-009",
    name: "DirectCloudバックアップ成功率",
    service: "DirectCloud",
    category: "信頼性",
    target: "99%",
    status: "適合",
    compliance: 99.7,
    priority: "中",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    responsibleTeam: "バックアップチーム",
    responseTime: {
      critical: "1時間",
      high: "4時間",
      medium: "8時間",
      low: "16時間"
    },
    resolutionTime: {
      critical: "6時間",
      high: "12時間",
      medium: "36時間",
      low: "72時間"
    },
    violations: 0,
    lastChecked: "2025-05-10T08:30:00"
  },
  {
    id: "SLA-010",
    name: "SkySea Client View更新成功率",
    service: "SkySea Client View",
    category: "信頼性",
    target: "98%",
    status: "警告",
    compliance: 95.2,
    priority: "中",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    responsibleTeam: "セキュリティチーム",
    responseTime: {
      critical: "1時間",
      high: "4時間",
      medium: "8時間",
      low: "16時間"
    },
    resolutionTime: {
      critical: "6時間",
      high: "12時間",
      medium: "36時間",
      low: "72時間"
    },
    violations: 3,
    lastChecked: "2025-05-10T08:30:00"
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

export function SLATable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // 検索とフィルタリングを適用したデータを取得
  const filteredSLAs = slaData.filter(sla => {
    const matchesSearch = 
      sla.name.toLowerCase().includes(search.toLowerCase()) || 
      sla.service.toLowerCase().includes(search.toLowerCase()) ||
      sla.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      sla.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="SLAを検索..."
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ステータスで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのステータス</SelectItem>
              <SelectItem value="適合">適合</SelectItem>
              <SelectItem value="警告">警告</SelectItem>
              <SelectItem value="違反">違反</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規SLA登録
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">SLA ID</TableHead>
              <TableHead className="min-w-[200px]">名前</TableHead>
              <TableHead>サービス</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>目標</TableHead>
              <TableHead>コンプライアンス</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>違反</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSLAs.map((sla) => (
              <TableRow key={sla.id}>
                <TableCell className="font-medium">{sla.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{sla.name}</div>
                  <div className="text-xs text-muted-foreground">優先度: {sla.priority}</div>
                </TableCell>
                <TableCell>{sla.service}</TableCell>
                <TableCell>{sla.category}</TableCell>
                <TableCell>{sla.target}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Progress value={sla.compliance} className="h-2 w-[60px]" />
                    <span className="text-sm">{sla.compliance}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <SLAStatusBadge status={sla.status} />
                </TableCell>
                <TableCell>
                  {sla.violations > 0 ? (
                    <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>{sla.violations}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span>0</span>
                    </div>
                  )}
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
                      <DropdownMenuItem>履歴を表示</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>レポート生成</DropdownMenuItem>
                      <DropdownMenuItem>通知設定</DropdownMenuItem>
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

// SLAステータスバッジコンポーネント
function SLAStatusBadge({ status }: { status: string }) {
  let classes = "";
  
  switch (status) {
    case "適合":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    case "警告":
      classes = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      break;
    case "違反":
      classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{status}</Badge>;
}