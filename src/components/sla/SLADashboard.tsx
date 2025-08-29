import { AlertCircle, CheckCircle, Clock, HelpCircle, Info, RefreshCw, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// SLAダッシュボードのサンプルデータ
const dashboardData = {
  overallCompliance: 98.4,
  status: {
    compliant: 8,
    warning: 2,
    violation: 1
  },
  totalSLAs: 11,
  totalOLAs: 15,
  slaViolations: 1,
  olaViolations: 2,
  upcomingReviews: 3,
  serviceHealthSummary: [
    { service: "Microsoft 365", compliance: 99.2, status: "適合" },
    { service: "Active Directory", compliance: 99.99, status: "適合" },
    { service: "Microsoft Entra ID", compliance: 99.93, status: "適合" },
    { service: "Microsoft Teams", compliance: 93.5, status: "警告" },
    { service: "外部データセンター内ファイルサーバ", compliance: 87.3, status: "違反" }
  ],
  recentViolations: [
    { id: "SLA-007", name: "ファイルサーバー応答時間", date: "2025-05-08", metric: "応答時間", value: "580ms", target: "<500ms" },
    { id: "SLA-005", name: "Microsoft Teams通話品質", date: "2025-05-03", metric: "通話品質スコア", value: "3.2", target: ">3.5" }
  ],
  upcomingReviewsList: [
    { id: "SLA-003", name: "Entra ID認証サービス", date: "2025-05-15", type: "月次レビュー" },
    { id: "SLA-001", name: "Microsoft 365 E3稼働保証", date: "2025-05-20", type: "四半期レビュー" },
    { id: "SLA-008", name: "DeskNet'sNeo応答時間", date: "2025-05-25", type: "月次レビュー" }
  ],
  complianceTrend: [
    { month: "12月", compliance: 98.7 },
    { month: "1月", compliance: 99.1 },
    { month: "2月", compliance: 98.9 },
    { month: "3月", compliance: 98.6 },
    { month: "4月", compliance: 98.2 },
    { month: "5月", compliance: 98.4 }
  ],
  lastUpdated: "2025-05-10T09:30:00"
};

// 日時フォーマット用ユーティリティ関数
function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function SLADashboard() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">サービスレベル管理ダッシュボード</h2>
          <p className="text-muted-foreground">
            SLAとOLAのパフォーマンス概要
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            最終更新: {formatDateTime(dashboardData.lastUpdated)}
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            更新
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="全体コンプライアンス"
          value={`${dashboardData.overallCompliance}%`}
          icon={<CheckCircle className="h-4 w-4" />}
          trend="0.2%上昇"
          indicator="up"
          progress={dashboardData.overallCompliance}
        />
        <SummaryCard
          title="SLA/OLA総数"
          value={`${dashboardData.totalSLAs}/${dashboardData.totalOLAs}`}
          description="SLA/OLA"
          icon={<Clock className="h-4 w-4" />}
        />
        <SummaryCard
          title="違反件数"
          value={`${dashboardData.slaViolations}/${dashboardData.olaViolations}`}
          description="SLA/OLA違反"
          icon={<AlertCircle className="h-4 w-4" />}
          highlight={dashboardData.slaViolations > 0 ? "warning" : undefined}
        />
        <SummaryCard
          title="次回レビュー予定"
          value={`${dashboardData.upcomingReviews}`}
          description="今後14日以内"
          icon={<Info className="h-4 w-4" />}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>サービス健全性</CardTitle>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="すべてのサービス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのサービス</SelectItem>
                  <SelectItem value="cloud">クラウドサービス</SelectItem>
                  <SelectItem value="onprem">オンプレミスサービス</SelectItem>
                  <SelectItem value="critical">重要サービス</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>主要サービスのSLA達成状況</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.serviceHealthSummary.map((service, index) => (
                <div key={index} className="flex flex-col items-start justify-between gap-2 rounded-md border p-3 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <div className="font-medium">{service.service}</div>
                  </div>
                  <div className="flex w-full flex-1 items-center space-x-2 sm:w-auto">
                    <Progress
                      value={service.compliance}
                      className="h-2 w-[100px]"
                      indicatorClassName={
                        service.status === "適合"
                          ? "bg-green-500"
                          : service.status === "警告"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }
                    />
                    <span className="min-w-[50px] text-sm">{service.compliance}%</span>
                  </div>
                  <div>
                    <StatusBadge status={service.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>SLAステータス</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>全SLAの現在の状態</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-1 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span>適合</span>
                  </div>
                  <Badge>{dashboardData.status.compliant}</Badge>
                </div>
                
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-yellow-100 p-1 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <span>警告</span>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    {dashboardData.status.warning}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-red-100 p-1 text-red-800 dark:bg-red-900 dark:text-red-200">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <span>違反</span>
                  </div>
                  <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    {dashboardData.status.violation}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <ComplianceTrendChart data={dashboardData.complianceTrend} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近のSLA違反</CardTitle>
            <CardDescription>過去30日間のSLA違反</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.recentViolations.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentViolations.map((violation, index) => (
                  <div key={index} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{violation.name}</div>
                      <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        {violation.id}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      違反日: {violation.date}
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">メトリクス</div>
                        <div>{violation.metric}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">実測値</div>
                        <div className="text-red-600 dark:text-red-400">{violation.value}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">目標</div>
                        <div>{violation.target}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-2 flex justify-end">
                  <Button variant="outline" size="sm">すべての違反を表示</Button>
                </div>
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center text-muted-foreground">
                <p>最近のSLA違反はありません</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>次回レビュー予定</CardTitle>
            <CardDescription>今後の予定されたSLAレビュー</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.upcomingReviewsList.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.upcomingReviewsList.map((review, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <div className="font-medium">{review.name}</div>
                      <div className="text-xs text-muted-foreground">{review.id} - {review.type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">{review.date}</div>
                      <Button variant="outline" size="sm">詳細</Button>
                    </div>
                  </div>
                ))}
                <div className="mt-2 flex justify-end">
                  <Button variant="outline" size="sm">すべての予定を表示</Button>
                </div>
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center text-muted-foreground">
                <p>近日中のレビュー予定はありません</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// サマリーカードコンポーネント
function SummaryCard({
  title,
  value,
  description,
  icon,
  trend,
  indicator,
  progress,
  highlight
}: {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  trend?: string;
  indicator?: "up" | "down";
  progress?: number;
  highlight?: "success" | "warning" | "danger";
}) {
  let highlightClasses = "";
  if (highlight === "warning") {
    highlightClasses = "border-yellow-300 dark:border-yellow-800";
  } else if (highlight === "danger") {
    highlightClasses = "border-red-300 dark:border-red-800";
  } else if (highlight === "success") {
    highlightClasses = "border-green-300 dark:border-green-800";
  }
  
  return (
    <Card className={`overflow-hidden ${highlightClasses}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="rounded-full bg-muted p-1">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold">{value}</div>
            {trend && (
              <div
                className={`flex items-center text-xs ${
                  indicator === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                <span>{trend}</span>
              </div>
            )}
          </div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {progress !== undefined && (
            <Progress
              value={progress}
              className="h-1"
              indicatorClassName={
                progress >= 98 ? "bg-green-500" : progress >= 95 ? "bg-yellow-500" : "bg-red-500"
              }
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// コンプライアンストレンドチャートコンポーネント
function ComplianceTrendChart({ data }: { data: { month: string; compliance: number }[] }) {
  const maxValue = Math.max(...data.map(item => item.compliance));
  const minValue = Math.min(
    ...data.map(item => item.compliance),
    90 // 最低値を90%にして変化を見やすくする
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>コンプライアンストレンド</CardTitle>
        <CardDescription>過去6ヶ月間の全体コンプライアンス</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[150px]">
          <div className="flex h-full items-end">
            {data.map((item, index) => {
              const height = ((item.compliance - minValue) / (maxValue - minValue)) * 100;
              return (
                <div
                  key={index}
                  className="group relative mx-1 flex flex-1 flex-col items-center"
                >
                  <div className="absolute -top-7 hidden rounded-md bg-muted px-2 py-1 text-xs group-hover:block">
                    {item.compliance}%
                  </div>
                  <div
                    className="w-full rounded-md bg-primary"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  ></div>
                  <div className="mt-2 text-xs text-muted-foreground">{item.month}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ステータスバッジコンポーネント
function StatusBadge({ status }: { status: string }) {
  let classes = "";
  
  switch (status) {
    case "適合":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    case "警告":
      classes = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      break;
    case "違反":
      classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{status}</Badge>;
}