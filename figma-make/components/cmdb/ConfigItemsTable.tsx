import { useState } from "react";
import { Clock, Filter, Link, MoreHorizontal, Plus, Search, Tag } from "lucide-react";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

// 構成項目（CI）のサンプルデータ
const configItems = [
  {
    id: "CI-001",
    name: "Microsoft 365 E3ライセンス",
    type: "サービス",
    category: "ソフトウェア",
    status: "稼働中",
    owner: "IT部門",
    lastUpdated: "2025-05-08T14:30:00",
    relationships: 12,
    environment: "本番環境",
    description: "Microsoft 365 Enterprise E3ライセンスパッケージ",
    supportLevel: "Premium",
    vendor: "Microsoft Corporation",
    version: "最新",
    location: "クラウド",
    criticality: "高",
  },
  {
    id: "CI-002",
    name: "Active Directory",
    type: "サービス",
    category: "ディレクトリサービス",
    status: "稼働中",
    owner: "インフラチーム",
    lastUpdated: "2025-05-06T09:15:00",
    relationships: 18,
    environment: "本番環境",
    description: "オンプレミスActive Directory",
    supportLevel: "標準",
    vendor: "Microsoft Corporation",
    version: "Windows Server 2022",
    location: "東京データセンター",
    criticality: "最高",
  },
  {
    id: "CI-003",
    name: "Microsoft Entra ID",
    type: "サービス",
    category: "ディレクトリサービス",
    status: "稼働中",
    owner: "インフラチーム",
    lastUpdated: "2025-05-09T11:45:00",
    relationships: 14,
    environment: "本番環境",
    description: "クラウドID管理サービス（旧Azure AD）",
    supportLevel: "Premium",
    vendor: "Microsoft Corporation",
    version: "Premium P2",
    location: "クラウド",
    criticality: "最高",
  },
  {
    id: "CI-004",
    name: "Entra Connect",
    type: "アプリケーション",
    category: "同期ツール",
    status: "稼働中",
    owner: "インフラチーム",
    lastUpdated: "2025-05-09T15:30:00",
    relationships: 6,
    environment: "本番環境",
    description: "Active DirectoryとMicrosoft Entra IDの同期ツール",
    supportLevel: "標準",
    vendor: "Microsoft Corporation",
    version: "2.1.1.0",
    location: "東京データセンター",
    criticality: "高",
  },
  {
    id: "CI-005",
    name: "Exchange Online",
    type: "サービス",
    category: "コミュニケーション",
    status: "稼働中",
    owner: "メッセージングチーム",
    lastUpdated: "2025-05-07T10:00:00",
    relationships: 8,
    environment: "本番環境",
    description: "クラウドメールサービス",
    supportLevel: "Premium",
    vendor: "Microsoft Corporation",
    version: "最新",
    location: "クラウド",
    criticality: "高",
  },
  {
    id: "CI-006",
    name: "Microsoft Teams",
    type: "サービス",
    category: "コラボレーション",
    status: "稼働中",
    owner: "コラボレーションチーム",
    lastUpdated: "2025-05-08T13:20:00",
    relationships: 9,
    environment: "本番環境",
    description: "チャット・会議・ファイル共有プラットフォーム",
    supportLevel: "Premium",
    vendor: "Microsoft Corporation",
    version: "最新",
    location: "クラウド",
    criticality: "高",
  },
  {
    id: "CI-007",
    name: "OneDrive for Business",
    type: "サービス",
    category: "ストレージ",
    status: "稼働中",
    owner: "ストレージチーム",
    lastUpdated: "2025-05-05T16:45:00",
    relationships: 7,
    environment: "本番環境",
    description: "クラウドストレージサービス",
    supportLevel: "Premium",
    vendor: "Microsoft Corporation",
    version: "最新",
    location: "クラウド",
    criticality: "中",
  },
  {
    id: "CI-008",
    name: "DeskNet'sNeo",
    type: "アプリケーション",
    category: "グループウェア",
    status: "稼働中",
    owner: "業務システムチーム",
    lastUpdated: "2025-05-02T09:30:00",
    relationships: 5,
    environment: "本番環境",
    description: "グループウェア・スケジュール管理システム",
    supportLevel: "標準",
    vendor: "ネオジャパン",
    version: "5.2.1",
    location: "西データセンター",
    criticality: "中",
  },
  {
    id: "CI-009",
    name: "AppSuit",
    type: "アプリケーション",
    category: "業務アプリ",
    status: "稼働中",
    owner: "業務システムチーム",
    lastUpdated: "2025-05-02T09:35:00",
    relationships: 3,
    environment: "本番環境",
    description: "DeskNet'sNeoの拡張機能",
    supportLevel: "標準",
    vendor: "ネオジャパン",
    version: "2.0.3",
    location: "西データセンター",
    criticality: "中",
  },
  {
    id: "CI-010",
    name: "DirectCloud",
    type: "サービス",
    category: "バックアップ",
    status: "稼働中",
    owner: "バックアップチーム",
    lastUpdated: "2025-05-03T11:20:00",
    relationships: 4,
    environment: "本番環境",
    description: "クラウドバックアップサービス",
    supportLevel: "標準",
    vendor: "DirectCloud",
    version: "最新",
    location: "クラウド",
    criticality: "中",
  },
  {
    id: "CI-011",
    name: "SkySea Client View",
    type: "アプリケーション",
    category: "資産管理",
    status: "稼働中",
    owner: "セキュリティチーム",
    lastUpdated: "2025-05-04T14:15:00",
    relationships: 6,
    environment: "本番環境",
    description: "クライアントPC管理ツール",
    supportLevel: "標準",
    vendor: "Sky株式会社",
    version: "16.2.0",
    location: "東京データセンター",
    criticality: "中",
  },
  {
    id: "CI-012",
    name: "外部データセンター内ファイルサーバ",
    type: "サーバー",
    category: "ストレージ",
    status: "稼働中",
    owner: "インフラチーム",
    lastUpdated: "2025-05-06T15:30:00",
    relationships: 8,
    environment: "本番環境",
    description: "共有ファイルサーバー",
    supportLevel: "標準",
    vendor: "Dell Technologies",
    version: "PowerEdge R740",
    location: "西データセンター",
    criticality: "高",
  },
  {
    id: "CI-013",
    name: "HENGEOINE",
    type: "アプリケーション",
    category: "セキュリティ",
    status: "稼働中",
    owner: "セキュリティチーム",
    lastUpdated: "2025-05-01T10:45:00",
    relationships: 5,
    environment: "本番環境",
    description: "セキュリティ監視システム",
    supportLevel: "Premium",
    vendor: "HENNGE",
    version: "3.2.1",
    location: "クラウド",
    criticality: "高",
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

export function ConfigItemsTable() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // カテゴリでフィルタリングするための関数
  const filteredItems = configItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // ユニークなカテゴリのリストを取得
  const categories = Array.from(new Set(configItems.map(item => item.category)));
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="構成項目を検索..."
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
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="カテゴリで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのカテゴリ</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            構成項目登録
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="min-w-[180px]">名前</TableHead>
              <TableHead>タイプ</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>重要度</TableHead>
              <TableHead>所有者</TableHead>
              <TableHead>最終更新</TableHead>
              <TableHead>関連</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CITypeIcon type={item.type} />
                    <span>{item.name}</span>
                  </div>
                </TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell>
                  <CriticalityBadge criticality={item.criticality} />
                </TableCell>
                <TableCell>{item.owner}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formatDate(item.lastUpdated)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <RelationshipButton count={item.relationships} />
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
                      <DropdownMenuItem>変更履歴</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>関連を表示</DropdownMenuItem>
                      <DropdownMenuItem>依存関係を管理</DropdownMenuItem>
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

// 構成項目タイプに応じたアイコンを表示するコンポーネント
function CITypeIcon({ type }: { type: string }) {
  let icon;
  
  switch (type) {
    case "サービス":
      icon = <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>;
      break;
    case "アプリケーション":
      icon = <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>;
      break;
    case "サーバー":
      icon = <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>;
      break;
    default:
      icon = <Tag className="h-4 w-4 text-gray-500" />;
  }
  
  return (
    <div className="rounded-full bg-muted p-1">
      {icon}
    </div>
  );
}

// ステータスバッジコンポーネント
function StatusBadge({ status }: { status: string }) {
  let classes = "";
  
  switch (status) {
    case "稼働中":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    case "障害中":
      classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      break;
    case "メンテナンス中":
      classes = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      break;
    case "廃止予定":
      classes = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      break;
    case "廃止済":
      classes = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{status}</Badge>;
}

// 重要度バッジコンポーネント
function CriticalityBadge({ criticality }: { criticality: string }) {
  let classes = "";
  
  switch (criticality) {
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
  
  return <Badge variant="outline" className={classes}>{criticality}</Badge>;
}

// 関連項目数を表示するボタンコンポーネント
function RelationshipButton({ count }: { count: number }) {
  if (count === 0) {
    return <span className="text-muted-foreground">なし</span>;
  }
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1">
          <Link className="h-3.5 w-3.5" />
          <span>{count}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>関連する構成項目</DialogTitle>
          <DialogDescription>
            この構成項目に関連する他の項目
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <div className="rounded-md border p-2">
            <h4 className="text-sm font-medium">依存関係</h4>
            <ul className="mt-2 space-y-1 pl-5 text-sm">
              <li>CI-002: Active Directory</li>
              <li>CI-003: Microsoft Entra ID</li>
              <li>CI-005: Exchange Online</li>
            </ul>
          </div>
          <div className="rounded-md border p-2">
            <h4 className="text-sm font-medium">逆依存関係</h4>
            <ul className="mt-2 space-y-1 pl-5 text-sm">
              <li>CI-006: Microsoft Teams</li>
              <li>CI-007: OneDrive for Business</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}