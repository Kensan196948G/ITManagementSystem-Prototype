import { useState } from "react";
import { 
  Search, Filter, MoreHorizontal, ExternalLink, HardDrive, 
  Calendar, Tag, Server, Network, Cpu, Globe 
} from "lucide-react";
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

// 構成アイテムのサンプルデータ
const configItems = [
  {
    id: "CI-001",
    name: "MS-SQL-01",
    type: "server",
    category: "データベースサーバー",
    status: "稼働中",
    owner: "データベース管理チーム",
    location: "東京データセンター",
    lastUpdated: "2025-04-28T13:45:00",
    relationships: [
      { id: "CI-004", type: "depends_on" },
      { id: "CI-007", type: "hosts" }
    ]
  },
  {
    id: "CI-002",
    name: "WEB-01",
    type: "server",
    category: "Webサーバー",
    status: "稼働中",
    owner: "Webシステム管理チーム",
    location: "東京データセンター",
    lastUpdated: "2025-04-25T10:30:00",
    relationships: [
      { id: "CI-004", type: "depends_on" },
      { id: "CI-008", type: "hosts" }
    ]
  },
  {
    id: "CI-003",
    name: "APP-01",
    type: "server",
    category: "アプリケーションサーバー",
    status: "稼働中",
    owner: "アプリケーション管理チーム",
    location: "東京データセンター",
    lastUpdated: "2025-04-26T09:15:00",
    relationships: [
      { id: "CI-004", type: "depends_on" },
      { id: "CI-007", type: "hosts" }
    ]
  },
  {
    id: "CI-004",
    name: "CORE-SW-01",
    type: "network",
    category: "コアスイッチ",
    status: "稼働中",
    owner: "ネットワーク管理チーム",
    location: "東京データセンター",
    lastUpdated: "2025-04-20T14:50:00",
    relationships: [
      { id: "CI-005", type: "connects_to" }
    ]
  },
  {
    id: "CI-005",
    name: "FW-01",
    type: "network",
    category: "ファイアウォール",
    status: "稼働中",
    owner: "セキュリティ管理チーム",
    location: "東京データセンター",
    lastUpdated: "2025-04-21T11:25:00",
    relationships: [
      { id: "CI-006", type: "connects_to" }
    ]
  },
  {
    id: "CI-006",
    name: "RTR-01",
    type: "network",
    category: "エッジルーター",
    status: "稼働中",
    owner: "ネットワーク管理チーム",
    location: "東京データセンター",
    lastUpdated: "2025-04-22T16:40:00",
    relationships: []
  },
  {
    id: "CI-007",
    name: "MS365-DB",
    type: "application",
    category: "データベースソフトウェア",
    status: "稼働中",
    owner: "データベース管理チーム",
    location: "N/A",
    lastUpdated: "2025-04-23T09:10:00",
    relationships: [
      { id: "CI-010", type: "part_of" }
    ]
  },
  {
    id: "CI-008",
    name: "SharePoint",
    type: "application",
    category: "ウェブアプリケーション",
    status: "稼働中",
    owner: "Microsoft 365管理チーム",
    location: "N/A",
    lastUpdated: "2025-04-24T15:30:00",
    relationships: [
      { id: "CI-010", type: "part_of" }
    ]
  },
  {
    id: "CI-009",
    name: "SAN-01",
    type: "storage",
    category: "ストレージエリアネットワーク",
    status: "稼働中",
    owner: "ストレージ管理チーム",
    location: "東京データセンター",
    lastUpdated: "2025-04-25T13:20:00",
    relationships: [
      { id: "CI-001", type: "used_by" },
      { id: "CI-002", type: "used_by" },
      { id: "CI-003", type: "used_by" }
    ]
  },
  {
    id: "CI-010",
    name: "Microsoft 365",
    type: "service",
    category: "SaaSサービス",
    status: "稼働中",
    owner: "Microsoft 365管理チーム",
    location: "クラウド",
    lastUpdated: "2025-04-26T10:45:00",
    relationships: []
  }
];

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

export function ConfigurationItemsList({ selectedType = "all" }) {
  const [search, setSearch] = useState("");
  
  const filteredItems = configItems.filter(item => {
    // 検索フィルタリング
    const searchMatch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                      item.id.toLowerCase().includes(search.toLowerCase()) ||
                      item.category.toLowerCase().includes(search.toLowerCase());
    
    // タイプフィルタリング
    const typeMatch = selectedType === "all" || item.type === selectedType;
    
    return searchMatch && typeMatch;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="構成アイテムを検索..."
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
              <SelectItem value="active">稼働中</SelectItem>
              <SelectItem value="maintenance">メンテナンス中</SelectItem>
              <SelectItem value="inactive">非アクティブ</SelectItem>
              <SelectItem value="planned">計画中</SelectItem>
              <SelectItem value="retired">廃止</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>名前</TableHead>
              <TableHead>種類</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>所有者</TableHead>
              <TableHead>場所</TableHead>
              <TableHead>最終更新</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="whitespace-nowrap">{item.id}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {item.type === "server" && <Server className="h-4 w-4 text-blue-500" />}
                    {item.type === "network" && <Network className="h-4 w-4 text-green-500" />}
                    {item.type === "storage" && <HardDrive className="h-4 w-4 text-amber-500" />}
                    {item.type === "application" && <Cpu className="h-4 w-4 text-purple-500" />}
                    {item.type === "service" && <Globe className="h-4 w-4 text-sky-500" />}
                    <span>{getTypeLabel(item.type)}</span>
                  </div>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell>{item.owner}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{formatDate(item.lastUpdated)}</TableCell>
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
                      <DropdownMenuItem>関連アイテムを表示</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>履歴を表示</DropdownMenuItem>
                      <DropdownMenuItem>レポートを生成</DropdownMenuItem>
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

function getTypeLabel(type: string): string {
  switch (type) {
    case "server": return "サーバー";
    case "network": return "ネットワーク";
    case "storage": return "ストレージ";
    case "application": return "アプリケーション";
    case "service": return "サービス";
    default: return type;
  }
}

function StatusBadge({ status }: { status: string }) {
  let classes = "";
  
  switch (status) {
    case "稼働中":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    case "メンテナンス中":
      classes = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      break;
    case "非アクティブ":
      classes = "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      break;
    case "計画中":
      classes = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      break;
    case "廃止":
      classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{status}</Badge>;
}