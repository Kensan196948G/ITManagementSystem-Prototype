import { AlertCircle, Clock, HardDrive, Users } from "lucide-react";
import { StatusCard } from "./StatusCard";
import { IncidentsList } from "./IncidentsList";
import { ServiceStatusList } from "./ServiceStatusList";
import { IncidentTrendChart } from "./IncidentTrendChart";

export function Dashboard() {
  return (
    <div className="space-y-4 p-4">
      <h1>ダッシュボード</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="アクティブなインシデント"
          value="7"
          icon={<AlertCircle className="h-4 w-4 text-destructive" />}
          trend="down"
          trendValue="先週比12%減"
        />
        <StatusCard
          title="SLA順守率"
          value="94%"
          icon={<Clock className="h-4 w-4 text-chart-1" />}
          trend="up"
          trendValue="先週比3%増"
        />
        <StatusCard
          title="監視対象資産数"
          value="542"
          icon={<HardDrive className="h-4 w-4 text-chart-2" />}
          trend="up"
          trendValue="今週5件追加"
        />
        <StatusCard
          title="未解決チケット"
          value="23"
          icon={<Users className="h-4 w-4 text-chart-3" />}
          trend="neutral"
          trendValue="変動なし"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <IncidentTrendChart />
        <ServiceStatusList />
      </div>

      <IncidentsList />
    </div>
  );
}