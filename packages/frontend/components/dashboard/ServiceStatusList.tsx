import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// 運用対象システムのサンプルデータ
const services = [
  { name: "Microsoft 365（E3ライセンス）", status: "operational" },
  { name: "OneDrive for Business", status: "operational" },
  { name: "Microsoft Teams", status: "operational" },
  { name: "Active Directory（AD）", status: "operational" },
  { name: "Microsoft Entra ID（旧Azure AD）", status: "operational" },
  { name: "Entra Connect", status: "degraded" },
  { name: "HENGEOINE", status: "operational" },
  { name: "Exchange Online", status: "operational" },
  { name: "DeskNet'sNeo（Appsuit含む）", status: "degraded" },
  { name: "DirectCloud", status: "operational" },
  { name: "SkySea Client View", status: "down" },
  { name: "外部データセンター内ファイルサーバ", status: "operational" }
];

export function ServiceStatusList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>サービス状態</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
        <div className="space-y-2">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between rounded-lg border p-2"
            >
              <span>{service.name}</span>
              <StatusIndicator status={service.status} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusIndicator({ status }: { status: string }) {
  switch (status) {
    case "operational":
      return (
        <div className="flex items-center text-green-500">
          <CheckCircle className="mr-1 h-4 w-4" />
          <span className="text-xs">正常</span>
        </div>
      );
    case "degraded":
      return (
        <div className="flex items-center text-orange-500">
          <AlertTriangle className="mr-1 h-4 w-4" />
          <span className="text-xs">一部障害</span>
        </div>
      );
    case "down":
      return (
        <div className="flex items-center text-red-500">
          <XCircle className="mr-1 h-4 w-4" />
          <span className="text-xs">停止中</span>
        </div>
      );
    default:
      return null;
  }
}