// # 修正ポイント: APIからデータを取得するロジックを追加
import { useState, useEffect, useContext } from "react";
// import { useAuth } from "../../contexts/AuthContext"; // # 修正ポイント: 未使用のためコメントアウト
// import { useSubscription } from "@apollo/client"; // # 修正ポイント: 未使用のためコメントアウト
// import { AuthContext } from "../../contexts/AuthContext"; // # 修正ポイント: 未使用のためコメントアウト
// import { INCIDENT_SUBSCRIPTION } from "../../graphql/subscriptions"; // # 修正ポイント: 未使用のためコメントアウト
import { MoreHorizontal, Filter, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const [incidents, setIncidents] = useState<Incident[]>([]); // 初期データを空配列に変更
  const [isNewIncidentDialogOpen, setIsNewIncidentDialogOpen] = useState(false);

  // // # 修正ポイント: APIからインシデントデータを取得する非同期関数
  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/incidents');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Incident[] = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
      // エラー発生時は空の配列を表示
      setIncidents([]);
      toast.error("インシデントデータの取得に失敗しました");
    }
  };

  // // # 修正ポイント: コンポーネントマウント時にデータを取得
  useEffect(() => {
    fetchIncidents();
  }, []); // 空の依存配列でマウント時のみ実行

  // 新規インシデント追加処理
  const handleAddIncident = (newIncident: Incident) => {
    // // # 修正ポイント: 新規追加後、APIから最新データを再取得
    // setIncidents([newIncident, ...incidents]); // 直接追加ではなく再取得
    fetchIncidents();
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
    // // # 修正ポイント: ステータス変更後、APIから最新データを再取得
    // setIncidents(incidents.map(incident =>
    //   incident.id === incidentId
    //     ? {
    //       ...incident,
    //       status: newStatus,
    //       updatedAt: new Date().toISOString(),
    //       sla: newStatus === "解決済" || newStatus === "完了" ? "完了" : incident.sla
    //     }
    //     : incident
    // )); // 直接更新ではなく再取得
    // TODO: API経由でのステータス更新処理を実装する必要がある
    console.warn(`インシデント ${incidentId} のステータスを ${newStatus} に変更するAPI処理は未実装です。`);
    toast.info(`インシデントのステータス変更APIは未実装です。`);
    // 一時的にローカルで更新（開発用）
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
    // fetchIncidents(); // API実装後に有効化
    toast.success(`インシデントのステータスが ${newStatus} に更新されました (ローカル更新)`);
  };

  // GraphQL Subscription
  // // # 修正ポイント: SubscriptionのクライアントをAuthContextから取得
  // const { apolloClient } = useContext(AuthContext); // # 修正ポイント: 未使用のためコメントアウト
  // useSubscription(INCIDENT_SUBSCRIPTION, { // # 修正ポイント: 未使用のためコメントアウト
  //   client: apolloClient, // # 修正ポイント: 未使用のためコメントアウト
  //   onSubscriptionData: ({ subscriptionData }) => { // # 修正ポイント: 未使用のためコメントアウト
  //     const { incidentUpdated } = subscriptionData.data; // # 修正ポイント: 未使用のためコメントアウト
  //     setIncidents(prev => // # 修正ポイント: 未使用のためコメントアウト
  //       prev.map(inc => inc.id === incidentUpdated.id ? incidentUpdated : inc) // # 修正ポイント: 未使用のためコメントアウト
  //     ); // # 修正ポイント: 未使用のためコメントアウト
  //   } // # 修正ポイント: 未使用のためコメントアウト
  // }); // # 修正ポイント: 未使用のためコメントアウト

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
          <Button variant="outline"> {/* # 修正ポイント: size="icon" を削除 */}
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
                        <Button variant="ghost"> {/* # 修正ポイント: size="icon" を削除 */}
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">操作</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* # 修正ポイント: DropdownMenuLabel を div に置き換え */}
                        <div className="px-2 py-1.5 text-sm font-semibold">操作</div>
                        {/* # 修正ポイント: DropdownMenuSeparator を div に置き換え */}
                        <div className="my-1 h-px bg-muted"></div>
                        <DropdownMenuItem>詳細を表示</DropdownMenuItem>
                        <DropdownMenuItem>編集</DropdownMenuItem>
                        <DropdownMenuItem>担当者変更</DropdownMenuItem>
                        {/* # 修正ポイント: DropdownMenuSeparator を div に置き換え */}
                        <div className="my-1 h-px bg-muted"></div>
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