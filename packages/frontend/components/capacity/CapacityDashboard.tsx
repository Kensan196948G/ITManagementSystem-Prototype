import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp, HardDrive, Cpu, Database, Server } from "lucide-react";

// サンプルデータ - 実際のアプリケーションではAPIからデータを取得
const capacityMetrics = {
  serverUtilization: 75,
  serverTrend: "up",
  storageUtilization: 68,
  storageTrend: "up",
  databaseUtilization: 82,
  databaseTrend: "up",
  networkUtilization: 45,
  networkTrend: "down",
  alerts: [
    {
      id: "alert1",
      title: "データベースサーバーの負荷が高くなっています",
      severity: "warning",
      time: "15分前",
    },
    {
      id: "alert2",
      title: "ストレージ容量が警告しきい値に近づいています",
      severity: "warning",
      time: "3時間前",
    },
    {
      id: "alert3",
      title: "Webサーバーのメモリ使用率が90%を超えています",
      severity: "critical",
      time: "5分前",
    }
  ]
};

export function CapacityDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">サーバーリソース</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{capacityMetrics.serverUtilization}%</div>
                <p className="text-xs text-muted-foreground">使用率</p>
              </div>
              <div className="flex items-center gap-1">
                {capacityMetrics.serverTrend === "up" ? (
                  <ArrowUp className="h-4 w-4 text-destructive" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-green-500" />
                )}
                <span className={capacityMetrics.serverTrend === "up" ? "text-destructive" : "text-green-500"}>
                  {capacityMetrics.serverTrend === "up" ? "上昇中" : "下降中"}
                </span>
              </div>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-secondary">
              <div 
                className={`h-2 rounded-full ${
                  capacityMetrics.serverUtilization > 90 
                    ? "bg-destructive" 
                    : capacityMetrics.serverUtilization > 70 
                    ? "bg-amber-500" 
                    : "bg-green-500"
                }`}
                style={{ width: `${capacityMetrics.serverUtilization}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ストレージ</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{capacityMetrics.storageUtilization}%</div>
                <p className="text-xs text-muted-foreground">使用率</p>
              </div>
              <div className="flex items-center gap-1">
                {capacityMetrics.storageTrend === "up" ? (
                  <ArrowUp className="h-4 w-4 text-destructive" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-green-500" />
                )}
                <span className={capacityMetrics.storageTrend === "up" ? "text-destructive" : "text-green-500"}>
                  {capacityMetrics.storageTrend === "up" ? "上昇中" : "下降中"}
                </span>
              </div>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-secondary">
              <div 
                className={`h-2 rounded-full ${
                  capacityMetrics.storageUtilization > 90 
                    ? "bg-destructive" 
                    : capacityMetrics.storageUtilization > 70 
                    ? "bg-amber-500" 
                    : "bg-green-500"
                }`}
                style={{ width: `${capacityMetrics.storageUtilization}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">データベース</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{capacityMetrics.databaseUtilization}%</div>
                <p className="text-xs text-muted-foreground">使用率</p>
              </div>
              <div className="flex items-center gap-1">
                {capacityMetrics.databaseTrend === "up" ? (
                  <ArrowUp className="h-4 w-4 text-destructive" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-green-500" />
                )}
                <span className={capacityMetrics.databaseTrend === "up" ? "text-destructive" : "text-green-500"}>
                  {capacityMetrics.databaseTrend === "up" ? "上昇中" : "下降中"}
                </span>
              </div>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-secondary">
              <div 
                className={`h-2 rounded-full ${
                  capacityMetrics.databaseUtilization > 90 
                    ? "bg-destructive" 
                    : capacityMetrics.databaseUtilization > 70 
                    ? "bg-amber-500" 
                    : "bg-green-500"
                }`}
                style={{ width: `${capacityMetrics.databaseUtilization}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ネットワーク</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{capacityMetrics.networkUtilization}%</div>
                <p className="text-xs text-muted-foreground">使用率</p>
              </div>
              <div className="flex items-center gap-1">
                {capacityMetrics.networkTrend === "up" ? (
                  <ArrowUp className="h-4 w-4 text-destructive" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-green-500" />
                )}
                <span className={capacityMetrics.networkTrend === "up" ? "text-destructive" : "text-green-500"}>
                  {capacityMetrics.networkTrend === "up" ? "上昇中" : "下降中"}
                </span>
              </div>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-secondary">
              <div 
                className={`h-2 rounded-full ${
                  capacityMetrics.networkUtilization > 90 
                    ? "bg-destructive" 
                    : capacityMetrics.networkUtilization > 70 
                    ? "bg-amber-500" 
                    : "bg-green-500"
                }`}
                style={{ width: `${capacityMetrics.networkUtilization}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3>キャパシティアラート</h3>
        {capacityMetrics.alerts.map((alert) => (
          <Alert key={alert.id} variant={alert.severity === "critical" ? "destructive" : "default"}>
            <div className="flex items-start">
              {alert.severity === "critical" ? (
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5" />
              )}
              <div className="w-full">
                <div className="flex justify-between items-center">
                  <AlertTitle>{alert.title}</AlertTitle>
                  <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                    {alert.severity === "critical" ? "緊急" : "警告"}
                  </Badge>
                </div>
                <AlertDescription className="flex justify-between mt-1">
                  <span>対応アクションが必要です</span>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ))}
      </div>
    </div>
  );
}