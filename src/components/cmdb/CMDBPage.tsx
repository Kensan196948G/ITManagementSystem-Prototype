import { useState } from "react";
import { Network, Database, Server, LineChart } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ConfigItemsTable } from "./ConfigItemsTable";
import { ConfigItemDetail } from "./ConfigItemDetail";
import { TopologyView } from "./TopologyView";

export function CMDBPage() {
  const [viewMode, setViewMode] = useState<"list" | "detail" | "topology">("list");
  const [activeTab, setActiveTab] = useState<"items" | "topology" | "reports">("items");
  
  // タブが変更されたときのハンドラー
  const handleTabChange = (value: string) => {
    setActiveTab(value as "items" | "topology" | "reports");
    if (value === "topology") {
      setViewMode("topology");
    } else if (value === "items") {
      setViewMode("list");
    }
  };
  
  return (
    <div className="space-y-4 p-4">
      {viewMode === "list" || viewMode === "topology" ? (
        <>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h1>構成管理データベース（CMDB）</h1>
              <p className="text-muted-foreground">
                IT資産・サービスの構成情報と関連性の一元管理
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={activeTab === "reports" ? "default" : "outline"} onClick={() => setActiveTab("reports")}>
                <LineChart className="mr-2 h-4 w-4" />
                レポート
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="items" value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="items" className="gap-2">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline-block">構成項目</span>
              </TabsTrigger>
              <TabsTrigger value="topology" className="gap-2">
                <Network className="h-4 w-4" />
                <span className="hidden sm:inline-block">トポロジー</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="items">
              <ConfigItemsTable />
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setViewMode("detail")}>
                  詳細を表示（デモ用）
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="topology">
              <TopologyView />
            </TabsContent>
            <TabsContent value="reports">
              <CMDBReports />
            </TabsContent>
          </Tabs>
        </>
      ) : viewMode === "detail" && (
        <ConfigItemDetail onBack={() => setViewMode("list")} />
      )}
    </div>
  );
}

// CMDBレポートコンポーネント
function CMDBReports() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ReportCard
          title="構成項目概要"
          description="登録されている構成項目の統計"
          icon={<Database className="h-5 w-5 text-blue-500" />}
          stats={[
            { label: "合計構成項目", value: "45" },
            { label: "サービス", value: "12" },
            { label: "アプリケーション", value: "18" },
            { label: "サーバー", value: "15" }
          ]}
        />
        
        <ReportCard
          title="重要度分布"
          description="構成項目の重要度レベル分布"
          icon={<Server className="h-5 w-5 text-red-500" />}
          stats={[
            { label: "最高", value: "7" },
            { label: "高", value: "15" },
            { label: "中", value: "18" },
            { label: "低", value: "5" }
          ]}
        />
        
        <ReportCard
          title="関連性分析"
          description="構成項目間の関連の統計"
          icon={<Network className="h-5 w-5 text-purple-500" />}
          stats={[
            { label: "依存関係", value: "67" },
            { label: "接続関係", value: "43" },
            { label: "中央値（関連数）", value: "4.2" },
            { label: "最多関連", value: "CI-003（18）" }
          ]}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border p-4">
          <h3 className="mb-4 font-medium">更新が必要な構成項目</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-md border p-2">
              <div>CI-008: DeskNet'sNeo</div>
              <div className="text-sm text-muted-foreground">最終更新: 2025-05-02</div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-2">
              <div>CI-013: HENGEOINE</div>
              <div className="text-sm text-muted-foreground">最終更新: 2025-05-01</div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-2">
              <div>CI-010: DirectCloud</div>
              <div className="text-sm text-muted-foreground">最終更新: 2025-05-03</div>
            </div>
          </div>
        </div>
        
        <div className="rounded-md border p-4">
          <h3 className="mb-4 font-medium">最近発生したインシデントの構成項目</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-md border p-2">
              <div>CI-002: Active Directory</div>
              <div className="text-sm text-muted-foreground">インシデント数: 2</div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-2">
              <div>CI-006: Microsoft Teams</div>
              <div className="text-sm text-muted-foreground">インシデント数: 1</div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-2">
              <div>CI-007: OneDrive for Business</div>
              <div className="text-sm text-muted-foreground">インシデント数: 1</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="rounded-md border p-4">
        <h3 className="mb-4 font-medium">最近の変更</h3>
        <div className="space-y-2">
          {[
            { id: "CI-002", name: "Active Directory", date: "2025-05-06", change: "セキュリティパッチ適用" },
            { id: "CI-003", name: "Microsoft Entra ID", date: "2025-05-09", change: "設定最適化" },
            { id: "CI-004", name: "Entra Connect", date: "2025-05-09", change: "バージョンアップデート" },
            { id: "CI-005", name: "Exchange Online", date: "2025-05-07", change: "メールフロールール追加" }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between rounded-md border p-2">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-1 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <div>{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.id}</div>
                </div>
              </div>
              <div>
                <div className="text-right text-sm">{item.change}</div>
                <div className="text-right text-xs text-muted-foreground">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// レポートカードコンポーネント
function ReportCard({ 
  title, 
  description, 
  icon, 
  stats 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  stats: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-md border p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-full bg-muted p-2">
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-md bg-muted/50 p-2">
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="text-lg font-semibold">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}