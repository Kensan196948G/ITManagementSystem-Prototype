import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";

// インシデントのサンプルデータ
const incidents = [
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
];

export function IncidentsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>アクティブなインシデント</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {incidents.map((incident) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// クラス名結合ユーティリティ
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}