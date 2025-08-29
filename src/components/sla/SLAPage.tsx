import { useState } from "react";
import { LineChart, Plus, Shield } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { SLATable } from "./SLATable";
import { SLADetail } from "./SLADetail";
import { OLADetail } from "./OLADetail";
import { SLADashboard } from "./SLADashboard";

import { SLAForm } from "./SLAForm";
import { toast } from "sonner";

export function SLAPage() {
  const [viewMode, setViewMode] = useState<"dashboard" | "list" | "slaDetail" | "olaDetail">("dashboard");
  const [activeTab, setActiveTab] = useState<"dashboard" | "sla" | "ola">("dashboard");
  const [isSLAFormOpen, setIsSLAFormOpen] = useState(false);
  
  // タブが変更されたときのハンドラー
  const handleTabChange = (value: string) => {
    setActiveTab(value as "dashboard" | "sla" | "ola");
    if (value === "dashboard") {
      setViewMode("dashboard");
    } else if (value === "sla") {
      setViewMode("list");
    } else if (value === "ola") {
      setViewMode("list");
    }
  };
  
  // 新規SLA作成処理
  const handleAddSLA = (slaData: any) => {
    toast.success(`新しいSLA「${slaData.name}」が作成されました`);
    // 実際の実装では、ここでSLAをリストに追加するなど
  };
  
  return (
    <div className="space-y-4 p-4">
      {viewMode === "dashboard" || viewMode === "list" ? (
        <>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h1>サービスレベル管理</h1>
              <p className="text-muted-foreground">
                SLA（サービスレベル契約）とOLA（運用レベル契約）の管理
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <LineChart className="mr-2 h-4 w-4" />
                レポート
              </Button>
              <Button onClick={() => setIsSLAFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                新規SLA作成
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="dashboard" className="gap-2">
                <LineChart className="h-4 w-4" />
                <span className="hidden sm:inline-block">ダッシュボード</span>
              </TabsTrigger>
              <TabsTrigger value="sla" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline-block">SLA</span>
              </TabsTrigger>
              <TabsTrigger value="ola" className="gap-2">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="hidden sm:inline-block">OLA</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
              <SLADashboard />
            </TabsContent>
            <TabsContent value="sla">
              <SLATable />
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setViewMode("slaDetail")}>
                  詳細を表示（デモ用）
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="ola">
              <OLAList />
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setViewMode("olaDetail")}>
                  詳細を表示（デモ用）
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : viewMode === "slaDetail" ? (
        <SLADetail onBack={() => setViewMode("list")} />
      ) : viewMode === "olaDetail" && (
        <OLADetail onBack={() => setViewMode("list")} />
      )}
      
      {/* SLA作成フォーム */}
      <SLAForm
        isOpen={isSLAFormOpen}
        onClose={() => setIsSLAFormOpen(false)}
        onSubmit={handleAddSLA}
      />
    </div>
  );
}

// OLA一覧表コンポーネント
function OLAList() {
  // OLAのサンプルデータ
  const olaData = [
    {
      id: "OLA-001",
      name: "ネットワークチームとの運用レベル契約",
      provider: "ネットワークチーム",
      consumer: "インフラチーム",
      category: "インフラストラクチャ",
      compliance: 100,
      status: "適合",
      relatedSLAs: ["SLA-002"],
      startDate: "2025-01-01",
      endDate: "2025-12-31"
    },
    {
      id: "OLA-002",
      name: "サーバーチームとの運用レベル契約",
      provider: "インフラチーム",
      consumer: "インフラチーム",
      category: "インフラストラクチャ",
      compliance: 99.9,
      status: "適合",
      relatedSLAs: ["SLA-002", "SLA-007"],
      startDate: "2025-01-01",
      endDate: "2025-12-31"
    },
    {
      id: "OLA-003",
      name: "ヘルプデスクとの運用レベル契約",
      provider: "サポートチーム",
      consumer: "インフラチーム",
      category: "サポート",
      compliance: 98.7,
      status: "適合",
      relatedSLAs: ["SLA-001", "SLA-002", "SLA-003"],
      startDate: "2025-01-01",
      endDate: "2025-12-31"
    },
    {
      id: "OLA-004",
      name: "クラウドチームとの運用レベル契約",
      provider: "クラウドサービスチーム",
      consumer: "インフラチーム",
      category: "クラウド",
      compliance: 99.5,
      status: "適合",
      relatedSLAs: ["SLA-001", "SLA-003", "SLA-004"],
      startDate: "2025-01-01",
      endDate: "2025-12-31"
    },
    {
      id: "OLA-005",
      name: "セキュリティチームとの運用レベル契約",
      provider: "セキュリティチーム",
      consumer: "全チーム",
      category: "セキュリティ",
      compliance: 97.5,
      status: "警告",
      relatedSLAs: ["SLA-001", "SLA-002", "SLA-003"],
      startDate: "2025-01-01",
      endDate: "2025-12-31"
    }
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">運用レベル契約（OLA）</h2>
          <p className="text-muted-foreground">
            内部チーム間のサービスレベル合意
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-3.5 w-3.5" />
          新規OLA作成
        </Button>
      </div>
      
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">OLA ID</th>
              <th className="p-3 text-left font-medium">名前</th>
              <th className="p-3 text-left font-medium">提供者</th>
              <th className="p-3 text-left font-medium">利用者</th>
              <th className="p-3 text-left font-medium">コンプライアンス</th>
              <th className="p-3 text-left font-medium">ステータス</th>
              <th className="p-3 text-left font-medium">関連SLA</th>
              <th className="p-3 text-left font-medium">アクション</th>
            </tr>
          </thead>
          <tbody>
            {olaData.map((ola, index) => (
              <tr key={index} className="border-b">
                <td className="p-3">{ola.id}</td>
                <td className="p-3">{ola.name}</td>
                <td className="p-3">{ola.provider}</td>
                <td className="p-3">{ola.consumer}</td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-[60px] rounded-full bg-muted">
                      <div 
                        className={`h-full rounded-full ${
                          ola.compliance >= 98 
                            ? "bg-green-500" 
                            : ola.compliance >= 95 
                            ? "bg-yellow-500" 
                            : "bg-red-500"
                        }`} 
                        style={{ width: `${ola.compliance}%` }}
                      />
                    </div>
                    <span className="text-sm">{ola.compliance}%</span>
                  </div>
                </td>
                <td className="p-3">
                  <StatusBadge status={ola.status} />
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {ola.relatedSLAs.map((sla, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {sla}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <Button variant="ghost" size="sm">詳細</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ステータスバッジコンポーネント
function StatusBadge({ status }: { status: string }) {
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