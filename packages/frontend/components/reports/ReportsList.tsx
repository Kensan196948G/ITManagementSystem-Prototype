import { useState } from "react";
import { Search, Filter, Download, MoreHorizontal, Calendar, FileText, RefreshCw } from "lucide-react";
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

// レポートのサンプルデータ
const savedReports = [
  {
    id: "REP-001",
    name: "月次インシデント概要レポート - 2025年4月",
    type: "インシデント",
    format: "PDF",
    createdBy: "山田太郎",
    createdAt: "2025-05-02T10:30:00",
    period: "2025-04-01 ～ 2025-04-30",
    size: "1.2 MB"
  },
  {
    id: "REP-002",
    name: "SLA遵守状況レポート - Q1 2025",
    type: "SLA",
    format: "Excel",
    createdBy: "佐藤花子",
    createdAt: "2025-04-15T14:20:00",
    period: "2025-01-01 ～ 2025-03-31",
    size: "3.4 MB"
  },
  {
    id: "REP-003",
    name: "問題管理効率分析レポート",
    type: "問題管理",
    format: "PDF",
    createdBy: "鈴木一郎",
    createdAt: "2025-04-25T09:45:00",
    period: "2025-01-01 ～ 2025-04-25",
    size: "2.1 MB"
  },
  {
    id: "REP-004",
    name: "変更管理効果測定レポート - 2025年Q1",
    type: "変更管理",
    format: "PDF",
    createdBy: "高橋誠",
    createdAt: "2025-04-10T11:15:00",
    period: "2025-01-01 ～ 2025-03-31",
    size: "1.8 MB"
  },
  {
    id: "REP-005",
    name: "セキュリティインシデント分析レポート",
    type: "セキュリティ",
    format: "PDF",
    createdBy: "田中健太",
    createdAt: "2025-05-01T15:30:00",
    period: "2025-04-01 ～ 2025-04-30",
    size: "2.5 MB"
  },
  {
    id: "REP-006",
    name: "サービスデスクパフォーマンスレポート",
    type: "サービスデスク",
    format: "Excel",
    createdBy: "山田太郎",
    createdAt: "2025-04-28T13:40:00",
    period: "2025-04-01 ～ 2025-04-28",
    size: "1.9 MB"
  },
  {
    id: "REP-007",
    name: "トレンド分析レポート - Webサービス",
    type: "トレンド分析",
    format: "PDF",
    createdBy: "佐藤花子",
    createdAt: "2025-04-20T10:10:00",
    period: "2024-05-01 ～ 2025-04-20",
    size: "3.2 MB"
  },
  {
    id: "REP-008",
    name: "運用コスト分析レポート - 2025年Q1",
    type: "コスト分析",
    format: "Excel",
    createdBy: "鈴木一郎",
    createdAt: "2025-04-12T16:25:00",
    period: "2025-01-01 ～ 2025-03-31",
    size: "2.8 MB"
  }
];

const scheduledReports = [
  {
    id: "SCH-001",
    name: "週次インシデントサマリー",
    type: "インシデント",
    format: "PDF",
    frequency: "毎週月曜日",
    lastRun: "2025-05-06T06:00:00",
    nextRun: "2025-05-13T06:00:00",
    recipients: "ITサポートチーム, マネージャー",
    status: "有効"
  },
  {
    id: "SCH-002",
    name: "月次SLA遵守状況レポート",
    type: "SLA",
    format: "Excel",
    frequency: "毎月1日",
    lastRun: "2025-05-01T07:00:00",
    nextRun: "2025-06-01T07:00:00",
    recipients: "経営陣, サービス管理者",
    status: "有効"
  },
  {
    id: "SCH-003",
    name: "四半期問題管理レポート",
    type: "問題管理",
    format: "PDF",
    frequency: "毎四半期初日",
    lastRun: "2025-04-01T08:00:00",
    nextRun: "2025-07-01T08:00:00",
    recipients: "問題管理チーム, IT部門長",
    status: "有効"
  },
  {
    id: "SCH-004",
    name: "日次セキュリティアラートサマリー",
    type: "セキュリティ",
    format: "PDF",
    frequency: "毎日",
    lastRun: "2025-05-10T05:00:00",
    nextRun: "2025-05-11T05:00:00",
    recipients: "セキュリティチーム",
    status: "有効"
  },
  {
    id: "SCH-005",
    name: "四半期業務改善レポート",
    type: "業務改善",
    format: "PowerPoint",
    frequency: "毎四半期末日",
    lastRun: "2025-03-31T08:00:00",
    nextRun: "2025-06-30T08:00:00",
    recipients: "経営陣, IT部門長, 全マネージャー",
    status: "有効"
  },
  {
    id: "SCH-006",
    name: "月次リソース使用状況レポート",
    type: "リソース管理",
    format: "Excel",
    frequency: "毎月末日",
    lastRun: "2025-04-30T07:00:00",
    nextRun: "2025-05-31T07:00:00",
    recipients: "インフラチーム, 運用管理者",
    status: "一時停止"
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

interface ReportsListProps {
  type: 'saved' | 'scheduled';
}

export function ReportsList({ type }: ReportsListProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  
  const reports = type === 'saved' ? savedReports : scheduledReports;
  
  const filteredReports = reports.filter(report => {
    // 検索フィルタリング
    const searchMatch = report.name.toLowerCase().includes(search.toLowerCase()) ||
                     report.id.toLowerCase().includes(search.toLowerCase());
    
    // タイプフィルタリング（保存レポートとスケジュールレポートで条件が異なる）
    let typeMatch = true;
    if (selectedType !== "all") {
      if (type === 'saved') {
        typeMatch = report.type === selectedType;
      } else {
        // スケジュールレポートの場合はstatusでフィルタリング
        typeMatch = (selectedType === 'active' && report.status === '有効') || 
                   (selectedType === 'paused' && report.status === '一時停止');
      }
    }
    
    return searchMatch && typeMatch;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="レポートを検索..."
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
          {type === 'saved' ? (
            <Select defaultValue="all" value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="レポートタイプ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのタイプ</SelectItem>
                <SelectItem value="インシデント">インシデント</SelectItem>
                <SelectItem value="SLA">SLA</SelectItem>
                <SelectItem value="問題管理">問題管理</SelectItem>
                <SelectItem value="変更管理">変更管理</SelectItem>
                <SelectItem value="セキュリティ">セキュリティ</SelectItem>
                <SelectItem value="サービスデスク">サービスデスク</SelectItem>
                <SelectItem value="トレンド分析">トレンド分析</SelectItem>
                <SelectItem value="コスト分析">コスト分析</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Select defaultValue="all" value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのステータス</SelectItem>
                <SelectItem value="active">有効</SelectItem>
                <SelectItem value="paused">一時停止</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead className="w-[300px]">レポート名</TableHead>
              <TableHead>タイプ</TableHead>
              <TableHead>フォーマット</TableHead>
              {type === 'saved' ? (
                <>
                  <TableHead>作成者</TableHead>
                  <TableHead>作成日時</TableHead>
                  <TableHead>対象期間</TableHead>
                </>
              ) : (
                <>
                  <TableHead>頻度</TableHead>
                  <TableHead>次回実行</TableHead>
                  <TableHead>ステータス</TableHead>
                </>
              )}
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.id}</TableCell>
                <TableCell className="font-medium">{report.name}</TableCell>
                <TableCell>{report.type}</TableCell>
                <TableCell>
                  <FormatBadge format={report.format} />
                </TableCell>
                {type === 'saved' ? (
                  <>
                    <TableCell>{report.createdBy}</TableCell>
                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                    <TableCell>{report.period}</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{report.frequency}</TableCell>
                    <TableCell>{formatDate(report.nextRun)}</TableCell>
                    <TableCell>
                      <StatusBadge status={report.status} />
                    </TableCell>
                  </>
                )}
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
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        プレビュー
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        ダウンロード
                      </DropdownMenuItem>
                      {type === 'saved' ? (
                        <>
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            再生成
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            スケジュール編集
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            今すぐ実行
                          </DropdownMenuItem>
                        </>
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

function FormatBadge({ format }: { format: string }) {
  let classes = "";
  
  switch (format) {
    case "PDF":
      classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      break;
    case "Excel":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    case "PowerPoint":
      classes = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{format}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  let classes = "";
  
  switch (status) {
    case "有効":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    case "一時停止":
      classes = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{status}</Badge>;
}