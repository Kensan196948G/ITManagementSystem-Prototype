import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { CapacityDashboard } from "./CapacityDashboard";
import { ResourceUtilizationChart } from "./ResourceUtilizationChart";
import { CapacityPlanning } from "./CapacityPlanning";
import { ThresholdManagement } from "./ThresholdManagement";

export function CapacityPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1>キャパシティ管理</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>キャパシティ管理ダッシュボード</CardTitle>
          <CardDescription>
            システムリソースの使用状況と予測を表示し、サービスのパフォーマンスと可用性を確保します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="dashboard">ダッシュボード</TabsTrigger>
              <TabsTrigger value="utilization">リソース使用率</TabsTrigger>
              <TabsTrigger value="planning">キャパシティプランニング</TabsTrigger>
              <TabsTrigger value="thresholds">しきい値管理</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard" className="mt-0">
              <CapacityDashboard />
            </TabsContent>
            <TabsContent value="utilization" className="mt-0">
              <ResourceUtilizationChart />
            </TabsContent>
            <TabsContent value="planning" className="mt-0">
              <CapacityPlanning />
            </TabsContent>
            <TabsContent value="thresholds" className="mt-0">
              <ThresholdManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}