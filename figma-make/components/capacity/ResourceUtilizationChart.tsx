import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { useState } from "react";

// サンプルデータ - 実際のアプリケーションではAPIからデータを取得
const cpuData = [
  { name: "00:00", cpu: 65, memory: 55, disk: 32, network: 21 },
  { name: "02:00", cpu: 59, memory: 57, disk: 32, network: 19 },
  { name: "04:00", cpu: 45, memory: 54, disk: 33, network: 18 },
  { name: "06:00", cpu: 55, memory: 56, disk: 34, network: 25 },
  { name: "08:00", cpu: 75, memory: 62, disk: 35, network: 45 },
  { name: "10:00", cpu: 85, memory: 68, disk: 36, network: 55 },
  { name: "12:00", cpu: 90, memory: 72, disk: 39, network: 60 },
  { name: "14:00", cpu: 88, memory: 74, disk: 42, network: 58 },
  { name: "16:00", cpu: 85, memory: 75, disk: 45, network: 53 },
  { name: "18:00", cpu: 78, memory: 72, disk: 48, network: 45 },
  { name: "20:00", cpu: 70, memory: 68, disk: 50, network: 35 },
  { name: "22:00", cpu: 60, memory: 60, disk: 51, network: 25 },
];

const weeklyData = [
  { name: "月", cpu: 75, memory: 65, disk: 45, network: 35 },
  { name: "火", cpu: 70, memory: 62, disk: 47, network: 32 },
  { name: "水", cpu: 78, memory: 68, disk: 49, network: 38 },
  { name: "木", cpu: 82, memory: 72, disk: 52, network: 42 },
  { name: "金", cpu: 88, memory: 80, disk: 55, network: 48 },
  { name: "土", cpu: 65, memory: 60, disk: 58, network: 30 },
  { name: "日", cpu: 60, memory: 55, disk: 60, network: 25 },
];

const monthlyData = [
  { name: "1月", cpu: 70, memory: 62, disk: 40, network: 35 },
  { name: "2月", cpu: 72, memory: 65, disk: 45, network: 38 },
  { name: "3月", cpu: 75, memory: 68, disk: 50, network: 40 },
  { name: "4月", cpu: 80, memory: 72, disk: 55, network: 45 },
  { name: "5月", cpu: 85, memory: 75, disk: 60, network: 48 },
  { name: "6月", cpu: 82, memory: 70, disk: 65, network: 44 },
  { name: "7月", cpu: 78, memory: 68, disk: 70, network: 40 },
  { name: "8月", cpu: 76, memory: 65, disk: 72, network: 38 },
  { name: "9月", cpu: 80, memory: 70, disk: 75, network: 42 },
  { name: "10月", cpu: 82, memory: 72, disk: 78, network: 45 },
  { name: "11月", cpu: 85, memory: 75, disk: 80, network: 48 },
  { name: "12月", cpu: 88, memory: 78, disk: 82, network: 50 },
];

export function ResourceUtilizationChart() {
  const [server, setServer] = useState("all");
  const [timeRange, setTimeRange] = useState("daily");

  // 時間範囲に基づいてデータを選択
  const getChartData = () => {
    switch (timeRange) {
      case "daily":
        return cpuData;
      case "weekly":
        return weeklyData;
      case "monthly":
        return monthlyData;
      default:
        return cpuData;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-[180px]">
            <Select value={server} onValueChange={setServer}>
              <SelectTrigger>
                <SelectValue placeholder="サーバーを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのサーバー</SelectItem>
                <SelectItem value="app1">アプリケーションサーバー 1</SelectItem>
                <SelectItem value="app2">アプリケーションサーバー 2</SelectItem>
                <SelectItem value="db1">データベースサーバー 1</SelectItem>
                <SelectItem value="db2">データベースサーバー 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-[300px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">日次</TabsTrigger>
            <TabsTrigger value="weekly">週次</TabsTrigger>
            <TabsTrigger value="monthly">月次</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>リソース使用率の推移</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={getChartData()}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`]} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  name="CPU"
                  stackId="1"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  name="メモリ"
                  stackId="2"
                  stroke="var(--chart-2)"
                  fill="var(--chart-2)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="disk"
                  name="ディスク"
                  stackId="3"
                  stroke="var(--chart-3)"
                  fill="var(--chart-3)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="network"
                  name="ネットワーク"
                  stackId="4"
                  stroke="var(--chart-4)"
                  fill="var(--chart-4)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ピーク使用率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>CPU</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full max-w-[200px] rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-[var(--chart-1)]"
                      style={{ width: '90%' }}
                    />
                  </div>
                  <span className="text-sm">90%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>メモリ</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full max-w-[200px] rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-[var(--chart-2)]"
                      style={{ width: '75%' }}
                    />
                  </div>
                  <span className="text-sm">75%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>ディスク</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full max-w-[200px] rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-[var(--chart-3)]"
                      style={{ width: '82%' }}
                    />
                  </div>
                  <span className="text-sm">82%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>ネットワーク</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full max-w-[200px] rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-[var(--chart-4)]"
                      style={{ width: '60%' }}
                    />
                  </div>
                  <span className="text-sm">60%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>リソースのボトルネック</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">CPU使用率の高いプロセス</h4>
                  <p className="text-sm text-muted-foreground">DB接続プール（dbsrv.exe）</p>
                </div>
                <Badge variant="destructive">高負荷</Badge>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">メモリリーク</h4>
                  <p className="text-sm text-muted-foreground">アプリケーションサーバー（app2）</p>
                </div>
                <Badge variant="destructive">検出</Badge>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">I/Oボトルネック</h4>
                  <p className="text-sm text-muted-foreground">データベースサーバー（RAID構成）</p>
                </div>
                <Badge>監視中</Badge>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">ネットワーク帯域</h4>
                  <p className="text-sm text-muted-foreground">DMZ - 内部ネットワーク間</p>
                </div>
                <Badge variant="secondary">正常</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}