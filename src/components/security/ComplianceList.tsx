import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Search, Filter, MoreHorizontal } from "lucide-react";
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
import { Progress } from "../ui/progress";

// コンプライアンスポリシーのサンプルデータ
const compliancePolicies = [
  {
    id: "POL-001",
    name: "パスワードポリシー",
    framework: "社内セキュリティ基準",
    status: "合格",
    compliantItems: 12,
    totalItems: 12,
    lastChecked: "2025-05-07T14:30:00",
    description: "パスワードの複雑さ、有効期限、履歴に関する要件。"
  },
  {
    id: "POL-002",
    name: "アクセス制御",
    framework: "社内セキュリティ基準",
    status: "警告",
    compliantItems: 9,
    totalItems: 12,
    lastChecked: "2025-05-07T14:30:00",
    description: "システムおよびデータへのアクセス権限管理に関する要件。"
  },
  {
    id: "POL-003",
    name: "データ暗号化",
    framework: "社内セキュリティ基準",
    status: "不合格",
    compliantItems: 5,
    totalItems: 10,
    lastChecked: "2025-05-07T14:30:00",
    description: "保存データおよび通信データの暗号化に関する要件。"
  },
  {
    id: "POL-004",
    name: "ネットワークセキュリティ",
    framework: "社内セキュリティ基準",
    status: "合格",
    compliantItems: 15,
    totalItems: 15,
    lastChecked: "2025-05-07T14:30:00",
    description: "ファイアウォール、侵入検知、ネットワークセグメンテーションに関する要件。"
  },
  {
    id: "POL-005",
    name: "アカウント管理",
    framework: "社内セキュリティ基準",
    status: "合格",
    compliantItems: 8,
    totalItems: 8,
    lastChecked: "2025-05-07T14:30:00",
    description: "ユーザーアカウントの作成、変更、削除プロセスに関する要件。"
  },
  {
    id: "POL-006",
    name: "バックアップと復旧",
    framework: "社内セキュリティ基準",
    status: "警告",
    compliantItems: 6,
    totalItems: 8,
    lastChecked: "2025-05-07T14:30:00",
    description: "データバックアップの頻度、方法、テストに関する要件。"
  },
  {
    id: "POL-007",
    name: "エンドポイントセキュリティ",
    framework: "社内セキュリティ基準",
    status: "不合格",
    compliantItems: 4,
    totalItems: 12,
    lastChecked: "2025-05-07T14:30:00",
    description: "デバイスの暗号化、マルウェア対策、パッチ管理に関する要件。"
  },
  {
    id: "POL-008",
    name: "インシデント対応",
    framework: "社内セキュリティ基準",
    status: "合格",
    compliantItems: 10,
    totalItems: 10,
    lastChecked: "2025-05-07T14:30:00",
    description: "セキュリティインシデントの検出、報告、対応プロセスに関する要件。"
  },
  {
    id: "POL-009",
    name: "GDPR対応",
    framework: "法規制",
    status: "警告",
    compliantItems: 14,
    totalItems: 18,
    lastChecked: "2025-05-07T14:30:00",
    description: "EU一般データ保護規則への準拠に関する要件。"
  },
  {
    id: "POL-010",
    name: "個人情報保護法対応",
    framework: "法規制",
    status: "合格",
    compliantItems: 12,
    totalItems: 12,
    lastChecked: "2025-05-07T14:30:00",
    description: "日本の個人情報保護法への準拠に関する要件。"
  },
  {
    id: "POL-011",
    name: "ログ管理と監視",
    framework: "社内セキュリティ基準",
    status: "合格",
    compliantItems: 9,
    totalItems: 9,
    lastChecked: "2025-05-07T14:30:00",
    description: "システムログの収集、保持、監視に関する要件。"
  },
  {
    id: "POL-012",
    name: "クラウドセキュリティ",
    framework: "社内セキュリティ基準",
    status: "警告",
    compliantItems: 7,
    totalItems: 10,
    lastChecked: "2025-05-07T14:30:00",
    description: "クラウドサービスの利用におけるセキュリティ要件。"
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

export function ComplianceList() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedFramework, setSelectedFramework] = useState("all");
  
  const filteredPolicies = compliancePolicies.filter(policy => {
    // 検索フィルタリング
    const searchMatch = policy.name.toLowerCase().includes(search.toLowerCase()) ||
                      policy.id.toLowerCase().includes(search.toLowerCase()) ||
                      policy.description.toLowerCase().includes(search.toLowerCase());
    
    // ステータスフィルタリング
    const statusMatch = selectedStatus === "all" || policy.status === selectedStatus;
    
    // フレームワークフィルタリング
    const frameworkMatch = selectedFramework === "all" || policy.framework === selectedFramework;
    
    return searchMatch && statusMatch && frameworkMatch;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ポリシーを検索..."
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
          <Select defaultValue="all" value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのステータス</SelectItem>
              <SelectItem value="合格">合格</SelectItem>
              <SelectItem value="警告">警告</SelectItem>
              <SelectItem value="不合格">不合格</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all" value={selectedFramework} onValueChange={setSelectedFramework}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="フレームワーク" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのフレームワーク</SelectItem>
              <SelectItem value="社内セキュリティ基準">社内セキュリティ基準</SelectItem>
              <SelectItem value="法規制">法規制</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead className="w-[300px]">ポリシー名</TableHead>
              <TableHead>フレームワーク</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>準拠率</TableHead>
              <TableHead>最終確認</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPolicies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>{policy.id}</TableCell>
                <TableCell className="font-medium">{policy.name}</TableCell>
                <TableCell>{policy.framework}</TableCell>
                <TableCell>
                  <StatusBadge status={policy.status} />
                </TableCell>
                <TableCell>
                  <div className="w-32">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{policy.compliantItems}/{policy.totalItems}</span>
                      <span>{Math.round((policy.compliantItems / policy.totalItems) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(policy.compliantItems / policy.totalItems) * 100} 
                      className="h-2"
                      indicatorClassName={
                        policy.status === "合格" ? "bg-green-500" :
                        policy.status === "警告" ? "bg-amber-500" : "bg-red-500"
                      }
                    />
                  </div>
                </TableCell>
                <TableCell>{formatDate(policy.lastChecked)}</TableCell>
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
                      <DropdownMenuItem>チェック項目を確認</DropdownMenuItem>
                      <DropdownMenuItem>修正計画を作成</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>再スキャンを実行</DropdownMenuItem>
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

function StatusBadge({ status }: { status: string }) {
  let classes = "";
  let icon = null;
  
  switch (status) {
    case "合格":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      icon = <CheckCircle className="mr-1 h-3.5 w-3.5" />;
      break;
    case "警告":
      classes = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      icon = <AlertTriangle className="mr-1 h-3.5 w-3.5" />;
      break;
    case "不合格":
      classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      icon = <XCircle className="mr-1 h-3.5 w-3.5" />;
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return (
    <Badge variant="outline" className={`flex items-center ${classes}`}>
      {icon}
      {status}
    </Badge>
  );
}