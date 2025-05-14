import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { PlusCircle, Clipboard, FileDown, Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useState } from "react";

// サンプルデータ - 実際のアプリケーションではAPIからデータを取得
const forecastData = [
  { month: '1月', current: 60, forecast: 65, threshold: 85 },
  { month: '2月', current: 62, forecast: 68, threshold: 85 },
  { month: '3月', current: 65, forecast: 72, threshold: 85 },
  { month: '4月', current: 68, forecast: 75, threshold: 85 },
  { month: '5月', current: 70, forecast: 78, threshold: 85 },
  { month: '6月', current: 72, forecast: 80, threshold: 85 },
  { month: '7月', current: 75, forecast: 83, threshold: 85 },
  { month: '8月', current: 77, forecast: 85, threshold: 85 },
  { month: '9月', current: 80, forecast: 88, threshold: 85 },
  { month: '10月', current: 83, forecast: 92, threshold: 85 },
  { month: '11月', current: 85, forecast: 95, threshold: 85 },
  { month: '12月', current: 88, forecast: 98, threshold: 85 },
];

const capacityPlans = [
  {
    id: "plan1",
    name: "データベースサーバー増強計画",
    status: "承認待ち",
    target: "データベースクラスター",
    impact: "高",
    cost: "¥5,800,000",
    completionDate: "2025/12/10",
  },
  {
    id: "plan2",
    name: "ストレージ容量増設",
    status: "承認済",
    target: "ストレージアレイ",
    impact: "中",
    cost: "¥2,400,000",
    completionDate: "2025/08/25",
  },
  {
    id: "plan3",
    name: "ネットワーク帯域拡張",
    status: "進行中",
    target: "コアスイッチ",
    impact: "中",
    cost: "¥1,800,000",
    completionDate: "2025/07/15",
  },
  {
    id: "plan4",
    name: "クラウドリソース自動スケーリング設定",
    status: "完了",
    target: "Webサーバー",
    impact: "低",
    cost: "¥500,000",
    completionDate: "2025/05/30",
  },
];

import { CapacityPlanForm } from "./CapacityPlanForm";
import { toast } from "sonner";

export function CapacityPlanning() {
  const [activeTab, setActiveTab] = useState("forecast");
  const [isCapacityPlanFormOpen, setIsCapacityPlanFormOpen] = useState(false);
  const [capacityPlansData, setCapacityPlansData] = useState(capacityPlans);

  // ステータスに応じたバッジのバリアントを取得
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "承認待ち":
        return "secondary";
      case "承認済":
        return "default";
      case "進行中":
        return "default";
      case "完了":
        return "outline";
      default:
        return "secondary";
    }
  };

  // インパクトに応じたバッジのバリアントを取得
  const getImpactVariant = (impact: string) => {
    switch (impact) {
      case "高":
        return "destructive";
      case "中":
        return "default";
      case "低":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Add new capacity plan handler
  const handleAddCapacityPlan = (planData: any) => {
    setCapacityPlansData([planData, ...capacityPlansData]);
    toast.success(`新しいキャパシティ計画「${planData.name}」が作成されました`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="forecast">キャパシティ予測</TabsTrigger>
            <TabsTrigger value="plans">増強計画</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            レポート出力
          </Button>
          <Button size="sm" onClick={() => setIsCapacityPlanFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            キャパシティ計画作成
          </Button>
        </div>
      </div>

      {activeTab === "forecast" ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>リソース予測（12ヶ月）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={forecastData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => [`${value}%`]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="current"
                      name="現在の使用率"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      name="予測使用率"
                      stroke="var(--chart-2)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="threshold"
                      name="しきい値"
                      stroke="var(--destructive)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>リソース容量の限界点</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">データベースサーバー</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-destructive">2025年10月</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">ストレージ容量</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-amber-500">2025年8月</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">アプリケーションサーバー</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">2026年2月</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">バックアップシステム</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">2026年4月</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>業務イベントの影響予測</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium">年度末処理</h4>
                      <p className="text-xs text-muted-foreground">2026年3月30日</p>
                    </div>
                    <Badge variant="destructive">+35%</Badge>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium">夏季キャンペーン</h4>
                      <p className="text-xs text-muted-foreground">2025年7月15日 - 8月15日</p>
                    </div>
                    <Badge>+20%</Badge>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium">システム統合</h4>
                      <p className="text-xs text-muted-foreground">2025年9月1日</p>
                    </div>
                    <Badge>+25%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>キャパシティリスク評価</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">サービス停止リスク</span>
                    <Badge variant="destructive">高</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">パフォーマンス低下</span>
                    <Badge>中</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">コスト超過</span>
                    <Badge variant="secondary">低</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">データロス</span>
                    <Badge variant="secondary">低</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>キャパシティ増強計画</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>計画名</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>対象リソース</TableHead>
                  <TableHead>影響度</TableHead>
                  <TableHead>コスト</TableHead>
                  <TableHead>完了予定日</TableHead>
                  <TableHead className="text-right">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {capacityPlansData.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(plan.status)}>
                        {plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{plan.target}</TableCell>
                    <TableCell>
                      <Badge variant={getImpactVariant(plan.impact)}>
                        {plan.impact}
                      </Badge>
                    </TableCell>
                    <TableCell>{plan.cost}</TableCell>
                    <TableCell>{plan.completionDate}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Clipboard className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Capacity Plan Form */}
      <CapacityPlanForm 
        isOpen={isCapacityPlanFormOpen}
        onClose={() => setIsCapacityPlanFormOpen(false)}
        onSubmit={handleAddCapacityPlan}
      />
    </div>
  );
}