import { useState } from "react";
import { Filter, Grid3X3, List, Plus, Search, ViewIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ServiceCardGrid } from "./ServiceCardGrid";
import { ServiceCardList } from "./ServiceCardList";
import { ServiceDetail } from "./ServiceDetail";
import { ServiceRequestForm } from "./ServiceRequestForm";

export function ServiceCatalogPage() {
  const [viewMode, setViewMode] = useState<"catalog" | "detail" | "request">("catalog");
  const [layoutView, setLayoutView] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  
  // サービスの表示モードを切り替える処理
  const handleViewModeChange = (mode: "catalog" | "detail" | "request") => {
    if (mode === "request" && !selectedServiceId) {
      // 直接サービスリクエ���トを作成する場合はデフォルトサービスを使用
      setSelectedServiceId(null);
    }
    setViewMode(mode);
  };
  
  // サービス詳細を表示する処理
  const handleViewServiceDetail = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setViewMode("detail");
  };
  
  // サービスリクエストフォームを表示する処理
  const handleRequestService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setViewMode("request");
  };
  
  // サービスカタログに戻る処理
  const handleBackToCatalog = () => {
    setViewMode("catalog");
  };
  
  // 検索処理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 実際のアプリではAPIを呼び出して検索
    console.log("検索クエリ:", searchQuery);
  };
  
  return (
    <div className="space-y-4 p-4">
      {viewMode === "catalog" ? (
        <>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h1>サービスカタログ</h1>
              <p className="text-muted-foreground">
                利用可能なITサービスを閲覧しリクエスト
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md border p-1">
                <Button
                  variant={layoutView === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setLayoutView("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span className="sr-only">グリッド表示</span>
                </Button>
                <Button
                  variant={layoutView === "list" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setLayoutView("list")}
                >
                  <List className="h-4 w-4" />
                  <span className="sr-only">リスト表示</span>
                </Button>
              </div>
              <Button onClick={() => handleViewModeChange("request")}>
                <Plus className="mr-2 h-4 w-4" />
                サービスリクエスト作成
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleSearch} className="flex w-full items-center gap-2 sm:w-auto">
              <div className="relative flex-1 sm:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="サービスを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button type="submit" variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">フィルター</span>
              </Button>
              <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="カテゴリで絞り込み" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのカテゴリ</SelectItem>
                  <SelectItem value="software">ソフトウェア</SelectItem>
                  <SelectItem value="hardware">ハードウェア</SelectItem>
                  <SelectItem value="account">アカウント管理</SelectItem>
                  <SelectItem value="network">ネットワーク</SelectItem>
                  <SelectItem value="communication">コミュニケーション</SelectItem>
                </SelectContent>
              </Select>
            </form>
          </div>
          
          <Tabs defaultValue="available">
            <TabsList>
              <TabsTrigger value="available">利用可能なサービス</TabsTrigger>
              <TabsTrigger value="requested">リクエスト履歴</TabsTrigger>
              <TabsTrigger value="popular">人気のサービス</TabsTrigger>
            </TabsList>
            <TabsContent value="available">
              {layoutView === "grid" ? (
                <ServiceCardGrid 
                  searchQuery={searchQuery}
                  categoryFilter={activeCategory}
                  onViewDetail={handleViewServiceDetail}
                  onRequestService={handleRequestService}
                />
              ) : (
                <ServiceCardList
                  searchQuery={searchQuery}
                  categoryFilter={activeCategory}
                  onViewDetail={handleViewServiceDetail}
                  onRequestService={handleRequestService}
                />
              )}
            </TabsContent>
            <TabsContent value="requested">
              <ServiceRequestHistory />
            </TabsContent>
            <TabsContent value="popular">
              <PopularServices 
                onViewDetail={handleViewServiceDetail}
                onRequestService={handleRequestService}
              />
            </TabsContent>
          </Tabs>
        </>
      ) : viewMode === "detail" ? (
        <ServiceDetail 
          serviceId={selectedServiceId!}
          onBack={handleBackToCatalog}
          onRequestService={() => selectedServiceId && handleRequestService(selectedServiceId)}
        />
      ) : (
        <ServiceRequestForm
          serviceId={selectedServiceId || undefined}
          onBack={handleBackToCatalog}
        />
      )}
    </div>
  );
}

// サービスリクエスト履歴コンポーネント
function ServiceRequestHistory() {
  // サービスリクエスト履歴のサンプルデータ
  const requestHistory = [
    { 
      id: "REQ-001", 
      serviceName: "Microsoft 365 E3ライセンス追加", 
      status: "承認済", 
      requestDate: "2025-05-01",
      fulfillDate: "2025-05-03",
      requestedFor: "自分"
    },
    { 
      id: "REQ-002", 
      serviceName: "ノートPCの修理", 
      status: "処理中", 
      requestDate: "2025-05-05",
      fulfillDate: "",
      requestedFor: "自分"
    },
    { 
      id: "REQ-003", 
      serviceName: "ゲストWi-Fiアクセス権限", 
      status: "完了", 
      requestDate: "2025-04-28",
      fulfillDate: "2025-04-29",
      requestedFor: "営業部"
    },
    { 
      id: "REQ-004", 
      serviceName: "開発環境のセットアップ", 
      status: "却下", 
      requestDate: "2025-04-20",
      fulfillDate: "2025-04-22",
      requestedFor: "田中健太"
    }
  ];
  
  return (
    <div className="space-y-4 pt-4">
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">リクエストID</th>
              <th className="p-3 text-left font-medium">サービス名</th>
              <th className="p-3 text-left font-medium">ステータス</th>
              <th className="p-3 text-left font-medium">リクエスト日</th>
              <th className="p-3 text-left font-medium">完了日</th>
              <th className="p-3 text-left font-medium">リクエスト対象</th>
              <th className="p-3 text-left font-medium">アクション</th>
            </tr>
          </thead>
          <tbody>
            {requestHistory.map((request, index) => (
              <tr key={index} className="border-b">
                <td className="p-3 font-medium">{request.id}</td>
                <td className="p-3">{request.serviceName}</td>
                <td className="p-3">
                  <RequestStatusBadge status={request.status} />
                </td>
                <td className="p-3">{request.requestDate}</td>
                <td className="p-3">{request.fulfillDate || "-"}</td>
                <td className="p-3">{request.requestedFor}</td>
                <td className="p-3">
                  <Button variant="ghost" size="sm">詳細</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {requestHistory.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-md border">
          <p className="text-muted-foreground">リクエスト履歴がありません</p>
        </div>
      )}
    </div>
  );
}

// 人気のサービスコンポーネント
function PopularServices({ 
  onViewDetail, 
  onRequestService 
}: { 
  onViewDetail: (serviceId: string) => void; 
  onRequestService: (serviceId: string) => void;
}) {
  // 人気のサービスのサンプルデータ
  const popularServices = [
    {
      id: "SVC-001",
      name: "Microsoft 365 E3ライセンス",
      description: "Microsoft 365 E3ライセンスの割り当て",
      category: "software",
      requestCount: 156,
      icon: "🖥️",
      fulfillmentTime: "1営業日",
      approvalRequired: true,
      cost: "¥2,100 / 月",
      rating: 4.7
    },
    {
      id: "SVC-002",
      name: "リモートアクセスVPN",
      description: "社外からの社内ネットワークへのセキュアなアクセス",
      category: "network",
      requestCount: 124,
      icon: "🔒",
      fulfillmentTime: "4時間",
      approvalRequired: true,
      cost: "無料",
      rating: 4.5
    },
    {
      id: "SVC-005",
      name: "ゲストWi-Fiアクセス",
      description: "来客用の一時的なWi-Fiアクセス権限の発行",
      category: "network",
      requestCount: 98,
      icon: "📶",
      fulfillmentTime: "即時",
      approvalRequired: false,
      cost: "無料",
      rating: 4.8
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
      {popularServices.map((service) => (
        <div 
          key={service.id} 
          className="flex flex-col rounded-lg border bg-card"
        >
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xl">
                  {service.icon}
                </div>
                <h3 className="text-lg font-semibold">{service.name}</h3>
              </div>
              <Badge variant="outline" className="px-2 py-0 text-xs">
                {service.category}
              </Badge>
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {service.description}
            </p>
          </div>
          <div className="flex flex-1 flex-col justify-end">
            <div className="grid grid-cols-2 gap-2 border-t p-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">所要時間</div>
                <div>{service.fulfillmentTime}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">承認</div>
                <div>{service.approvalRequired ? "必要" : "不要"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">コスト</div>
                <div>{service.cost}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">人気度</div>
                <div className="flex items-center">
                  <span>⭐</span>
                  <span className="ml-1">{service.rating}</span>
                </div>
              </div>
            </div>
            <div className="flex border-t p-2">
              <Button 
                variant="ghost" 
                className="flex-1" 
                onClick={() => onViewDetail(service.id)}
              >
                <ViewIcon className="mr-2 h-4 w-4" />
                詳細
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => onRequestService(service.id)}
              >
                リクエスト
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ステータスバッジコンポーネント
function RequestStatusBadge({ status }: { status: string }) {
  const getStatusStyle = () => {
    switch (status) {
      case "完了":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "処理中":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "承認済":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "却下":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "保留":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle()}`}>
      {status}
    </span>
  );
}

// バッジコンポーネント
function Badge({ children, variant, className }: { 
  children: React.ReactNode; 
  variant?: "default" | "outline" | "secondary"; 
  className?: string;
}) {
  const baseStyle = "inline-flex items-center rounded-full border text-xs font-medium";
  
  let variantStyle = "";
  switch(variant) {
    case "default":
      variantStyle = "border-transparent bg-primary text-primary-foreground";
      break;
    case "outline":
      variantStyle = "border-current";
      break;
    case "secondary":
      variantStyle = "border-transparent bg-secondary text-secondary-foreground";
      break;
    default:
      variantStyle = "border-transparent bg-primary text-primary-foreground";
  }
  
  return (
    <span className={`${baseStyle} ${variantStyle} ${className || ""}`}>
      {children}
    </span>
  );
}