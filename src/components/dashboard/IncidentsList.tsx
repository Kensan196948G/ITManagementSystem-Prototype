// 修正ポイント: ハードコードされたデータを削除し、動的なデータ取得とエラーハンドリングを追加
import { useEffect, useState } from "react";
import { cn } from "frontend/src/lib/utils"; // # 修正ポイント: 不要なシングルクォートを削除
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card"; // # 修正ポイント: shadcn/uiのCardコンポーネントのインポートパスを修正
import { Badge } from "src/components/ui/badge"; // # 修正ポイント: shadcn/uiのBadgeコンポーネントのインポートパスを修正
import { Avatar, AvatarFallback } from "src/components/ui/avatar"; // # 修正ポイント: shadcn/uiのAvatarコンポーネントのインポートパスを修正

// インシデントの型定義 (仮)
interface Incident {
  id: string;
  title: string;
  status: "critical" | "high" | "medium" | "low";
  assignee: string;
  timeAgo: string; // 実際にはDate型などで持つべき
}

// モックAPIを想定したデータ取得関数
async function fetchIncidents(): Promise<Incident[]> {
  // 実際にはAPIコールを行う
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "INC-001",
          title: "東データセンターのネットワーク障害",
          status: "critical",
          assignee: "山田",
          timeAgo: "30分前",
        },
        {
          id: "INC-002",
          title: "メールサーバーのパフォーマンス低下",
          status: "high",
          assignee: "田中",
          timeAgo: "1時間前",
        },
        {
          id: "INC-003",
          title: "CRMアプリケーションの読み込み遅延",
          status: "medium",
          assignee: "鈴木",
          timeAgo: "2時間前",
        },
        {
          id: "INC-004",
          title: "リモートユーザー向けVPN接続問題",
          status: "low",
          assignee: "佐藤",
          timeAgo: "3時間前",
        },
      ]);
    }, 1000); // 1秒の遅延をシミュレート
  });
}

export function IncidentsList() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getIncidents = async () => {
      try {
        const data = await fetchIncidents();
        setIncidents(data);
      } catch (err) {
        setError("インシデントの取得に失敗しました。");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getIncidents();
  }, []);

  // cn関数は共通化されたものをインポートして使用することを想定
  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>アクティブなインシデント</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {incidents.length === 0 ? (
            <div>アクティブなインシデントはありません。</div>
          ) : (
            incidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      incident.status === "critical" && "border-red-500 text-red-500",
                      incident.status === "high" && "border-orange-500 text-orange-500",
                      incident.status === "medium" && "border-yellow-500 text-yellow-500",
                      incident.status === "low" && "border-green-500 text-green-500"
                    )}
                  >
                    {incident.status === "critical" && "緊急"}
                    {incident.status === "high" && "高"}
                    {incident.status === "medium" && "中"}
                    {incident.status === "low" && "低"}
                  </Badge>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{incident.id}</span>
                      <span className="text-xs text-muted-foreground">{incident.timeAgo}</span>
                    </div>
                    <div className="text-sm">{incident.title}</div>
                  </div>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{incident.assignee}</AvatarFallback>
                </Avatar>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
