import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// 修正ポイント: ハードコードされたデータを削除し、動的なデータ取得とエラーハンドリングを追加
import { useEffect, useState } from "react";

// サービス状態の型定義 (仮)
interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down" | "maintenance" | "unknown"; // 修正ポイント: 状態網羅性を向上
}

// モックAPIを想定したデータ取得関数
async function fetchServiceStatuses(): Promise<ServiceStatus[]> {
  // 実際にはAPIコールを行う
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
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
        { name: "外部データセンター内ファイルサーバ", status: "operational" },
        { name: "社内Wikiシステム", status: "maintenance" }, // 修正ポイント: 新しい状態のサンプルデータ
        { name: "VPNゲートウェイ", status: "unknown" }, // 修正ポイント: 新しい状態のサンプルデータ
      ]);
    }, 1500); // 1.5秒の遅延をシミュレート
  });
}

export function ServiceStatusList() {
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getServiceStatuses = async () => {
      try {
        const data = await fetchServiceStatuses();
        setServiceStatuses(data);
      } catch (err) {
        setError("サービス状態の取得に失敗しました。"); // 修正ポイント: エラーメッセージを更新
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getServiceStatuses();
  }, []);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>サービス状態</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
        <div className="space-y-2">
          {serviceStatuses.length === 0 ? (
            <div>サービス状態の情報はありません。</div> // 修正ポイント: メッセージを更新
          ) : (
            serviceStatuses.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between rounded-lg border p-2"
              >
                <span>{service.name}</span>
                <StatusIndicator status={service.status} />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 修正ポイント: StatusIndicatorの状態網羅性を向上
function StatusIndicator({ status }: { status: ServiceStatus["status"] }) {
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
    case "maintenance": // 修正ポイント: maintenance状態を追加
      return (
        <div className="flex items-center text-blue-500">
          <AlertTriangle className="mr-1 h-4 w-4" /> {/* 適切なアイコンに変更する可能性あり */}
          <span className="text-xs">メンテナンス中</span>
        </div>
      );
    case "unknown": // 修正ポイント: unknown状態を追加
      return (
        <div className="flex items-center text-gray-500">
          <AlertTriangle className="mr-1 h-4 w-4" /> {/* 適切なアイコンに変更する可能性あり */}
          <span className="text-xs">不明</span>
        </div>
      );
    default:
      return null;
  }
}