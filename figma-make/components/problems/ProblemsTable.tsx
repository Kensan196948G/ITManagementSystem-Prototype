import { useState } from "react";
import { MoreHorizontal, Filter, Plus, Search, FileText, Link } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { NewProblemForm } from "./NewProblemForm";
import { toast } from "sonner";

// 問題のタイプ定義
interface Assignee {
  name: string;
  initials: string;
}

interface Problem {
  id: string;
  title: string;
  category: string;
  impactedSystems: string[];
  status: string;
  priority: string;
  assignee: Assignee;
  createdAt: string;
  updatedAt: string;
  relatedIncidents: string[];
  knownError: boolean;
  description?: string;
}

// 問題のサンプルデータ
const initialProblems: Problem[] = [
  {
    id: "PRB-001",
    title: "Exchange Onlineの定期的な接続タイムアウト",
    category: "パフォーマンス",
    impactedSystems: ["Exchange Online", "Outlook"],
    status: "調査中",
    priority: "高",
    assignee: { name: "山田太郎", initials: "山田" },
    createdAt: "2025-05-05T10:30:00",
    updatedAt: "2025-05-10T09:15:00",
    relatedIncidents: ["INC-002", "INC-007"],
    knownError: true,
  },
  {
    id: "PRB-002",
    title: "Microsoft Teamsの音声品質低下",
    category: "サービス品質",
    impactedSystems: ["Microsoft Teams"],
    status: "根本原因特定済",
    priority: "中",
    assignee: { name: "佐藤三郎", initials: "佐藤" },
    createdAt: "2025-05-06T14:45:00",
    updatedAt: "2025-05-09T16:30:00",
    relatedIncidents: ["INC-003"],
    knownError: true,
  },
  {
    id: "PRB-003",
    title: "OneDrive for Businessの同期エラー",
    category: "アプリケーション",
    impactedSystems: ["OneDrive for Business"],
    status: "対策検討中",
    priority: "中",
    assignee: { name: "田中次郎", initials: "田中" },
    createdAt: "2025-05-07T09:15:00",
    updatedAt: "2025-05-09T11:45:00",
    relatedIncidents: ["INC-004"],
    knownError: false,
  },
  {
    id: "PRB-004",
    title: "Active DirectoryとEntra IDの同期不具合",
    category: "構成",
    impactedSystems: ["Active Directory", "Microsoft Entra ID", "Entra Connect"],
    status: "解決策実装中",
    priority: "緊急",
    assignee: { name: "高橋一郎", initials: "高橋" },
    createdAt: "2025-05-03T16:00:00",
    updatedAt: "2025-05-10T08:30:00",
    relatedIncidents: ["INC-001", "INC-005"],
    knownError: true,
  },
  {
    id: "PRB-005",
    title: "DeskNet'sNeoとAppsuitの統合エラー",
    category: "インテグレーション",
    impactedSystems: ["DeskNet'sNeo（Appsuit含む）"],
    status: "調査中",
    priority: "低",
    assignee: { name: "鈴木花子", initials: "鈴木" },
    createdAt: "2025-05-08T13:30:00",
    updatedAt: "2025-05-09T15:15:00",
    relatedIncidents: [],
    knownError: false,
  },
  {
    id: "PRB-006",
    title: "SkySea Client Viewのエージェント自動更新失敗",
    category: "ソフトウェア",
    impactedSystems: ["SkySea Client View"],
    status: "解決済",
    priority: "低",
    assignee: { name: "伊藤めぐみ", initials: "伊藤" },
    createdAt: "2025-05-04T11:45:00",
    updatedAt: "2025-05-08T14:30:00",
    relatedIncidents: [],
    knownError: true,
  },
  {
    id: "PRB-007",
    title: "外部データセンター内ファイルサーバのパフォーマンス低下",
    category: "インフラストラクチャ",
    impactedSystems: ["外部データセンター内ファイルサーバ"],
    status: "対策検討中",
    priority: "高",
    assignee: { name: "渡辺健太", initials: "渡辺" },
    createdAt: "2025-05-06T10:15:00",
    updatedAt: "2025-05-10T07:45:00",
    relatedIncidents: [],
    knownError: false,
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

export function ProblemsTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [problems, setProblems] = useState<Problem[]>(initialProblems);
  const [isNewProblemDialogOpen, setIsNewProblemDialogOpen] = useState(false);

  // 新規問題追加処理
  const handleAddProblem = (newProblem: Problem) => {
    setProblems([newProblem, ...problems]);
    toast.success(`問題 ${newProblem.id} が登録されました`);
  };

  // フィルタリング処理
  const filteredProblems = problems.filter(problem => {
    // 検索フィルター
    const matchesSearch = search === "" || 
      problem.title.toLowerCase().includes(search.toLowerCase()) ||
      problem.id.toLowerCase().includes(search.toLowerCase()) ||
      problem.category.toLowerCase().includes(search.toLowerCase()) ||
      problem.impactedSystems.some(system => 
        system.toLowerCase().includes(search.toLowerCase())
      );
    
    // ステータスフィルター
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "investigating" && problem.status === "調査中") ||
      (statusFilter === "rootcause" && problem.status === "根本原因特定済") ||
      (statusFilter === "planning" && problem.status === "対策検討中") ||
      (statusFilter === "implementing" && problem.status === "解決策実装中") ||
      (statusFilter === "resolved" && problem.status === "解決済") ||
      (statusFilter === "closed" && problem.status === "完了");
    
    return matchesSearch && matchesStatus;
  });

  // ステータス変更処理
  const handleStatusChange = (problemId: string, newStatus: string) => {
    setProblems(problems.map(problem => 
      problem.id === problemId 
        ? { 
            ...problem, 
            status: newStatus, 
            updatedAt: new Date().toISOString() 
          } 
        : problem
    ));
    toast.success(`問題のステータスが ${newStatus} に更新されました`);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="問題を検索..."
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
              <SelectItem value="investigating">調査中</SelectItem>
              <SelectItem value="rootcause">根本原因特定済</SelectItem>
              <SelectItem value="planning">対策検討中</SelectItem>
              <SelectItem value="implementing">解決策実装中</SelectItem>
              <SelectItem value="resolved">解決済</SelectItem>
              <SelectItem value="closed">完了</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsNewProblemDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規問題登録
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead className="w-[300px]">タイトル</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>優先度</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>担当者</TableHead>
              <TableHead>更新日時</TableHead>
              <TableHead>関連インシデント</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProblems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  該当する問題が見つかりません
                </TableCell>
              </TableRow>
            ) : (
              filteredProblems.map((problem) => (
                <TableRow key={problem.id}>
                  <TableCell className="whitespace-nowrap">{problem.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {problem.title}
                      {problem.knownError && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>既知のエラー</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{problem.category}</TableCell>
                  <TableCell>
                    <PriorityBadge priority={problem.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={problem.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {problem.assignee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden whitespace-nowrap lg:inline-block">
                        {problem.assignee.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(problem.updatedAt)}
                  </TableCell>
                  <TableCell>
                    {problem.relatedIncidents.length > 0 ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 gap-1">
                            <Link className="h-3.5 w-3.5" />
                            <span>{problem.relatedIncidents.length}</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>関連インシデント</DialogTitle>
                            <DialogDescription>
                              この問題に関連するインシデント一覧
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-2 py-4">
                            {problem.relatedIncidents.map((incidentId) => (
                              <div key={incidentId} className="flex items-center justify-between rounded-md border p-2">
                                <span>{incidentId}</span>
                                <Button variant="outline" size="sm">詳細を表示</Button>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="text-muted-foreground">なし</span>
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
                        <DropdownMenuItem>担当者変更</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(problem.id, "調査中")}>
                          調査中に設定
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(problem.id, "根本原因特定済")}>
                          根本原因特定済に設定
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(problem.id, "対策検討中")}>
                          対策検討中に設定
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(problem.id, "解決策実装中")}>
                          解決策実装中に設定
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(problem.id, "解決済")}>
                          解決済に設定
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>RCA報告</DropdownMenuItem>
                        <DropdownMenuItem>解決策提案</DropdownMenuItem>
                        <DropdownMenuItem>既知のエラーに登録</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* 新規問題登録フォーム */}
      <NewProblemForm 
        isOpen={isNewProblemDialogOpen}
        onClose={() => setIsNewProblemDialogOpen(false)}
        onSubmit={handleAddProblem}
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
    case "調査中":
      classes = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      break;
    case "根本原因特定済":
      classes = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      break;
    case "対策検討中":
      classes = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      break;
    case "解決策実装中":
      classes = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
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