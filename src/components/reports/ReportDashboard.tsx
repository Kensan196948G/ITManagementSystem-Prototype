import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Calendar, Download, Filter } from "lucide-react";
import { IncidentTrendChart } from "../dashboard/IncidentTrendChart";
import { IncidentsByServiceChart } from "./charts/IncidentsByServiceChart";
import { ResolutionTimeChart } from "./charts/ResolutionTimeChart";
import { SLAComplianceChart } from "./charts/SLAComplianceChart";
import { ProblemTrendChart } from "./charts/ProblemTrendChart";

export function ReportDashboard() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="期間を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">過去7日間</SelectItem>
              <SelectItem value="30days">過去30日間</SelectItem>
              <SelectItem value="90days">過去90日間</SelectItem>
              <SelectItem value="year">過去1年</SelectItem>
              <SelectItem value="custom">カスタム期間</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          ダッシュボードをエクスポート
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">総インシデント数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">前月比 +12%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">解決時間（平均）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.3時間</div>
            <p className="text-xs text-muted-foreground">前月比 -15%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SLA準拠率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">93.8%</div>
            <p className="text-xs text-muted-foreground">目標 95%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">未解決問題</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-muted-foreground">前月比 -3件</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="incidents">
        <TabsList>
          <TabsTrigger value="incidents">インシデント分析</TabsTrigger>
          <TabsTrigger value="problems">問題分析</TabsTrigger>
          <TabsTrigger value="sla">SLA分析</TabsTrigger>
        </TabsList>
        
        <TabsContent value="incidents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>インシデントトレンド</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <IncidentTrendChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>サービス別インシデント</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <IncidentsByServiceChart />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>解決時間分析</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResolutionTimeChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="problems" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>問題傾向</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ProblemTrendChart />
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>カテゴリ別問題</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  カテゴリ別問題チャート
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>根本原因分析</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  根本原因分析チャート
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SLA準拠率推移</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <SLAComplianceChart />
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>優先度別SLAパフォーマンス</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  優先度別SLAパフォーマンスチャート
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>サービス別SLAパフォーマンス</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  サービス別SLAパフォーマンスチャート
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}