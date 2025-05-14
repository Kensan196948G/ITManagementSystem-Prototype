import { useState } from "react";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Edit, 
  FileText, 
  Globe, 
  History, 
  Info, 
  Link, 
  MapPin, 
  Server, 
  Shield, 
  Tag, 
  User 
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

// 構成項目の詳細情報サンプルデータ
const configItemDetail = {
  id: "CI-002",
  name: "Active Directory",
  type: "サービス",
  category: "ディレクトリサービス",
  status: "稼働中",
  owner: {
    name: "山田太郎",
    department: "インフラチーム",
    email: "yamada.t@example.com",
    initials: "山田"
  },
  createdAt: "2023-07-15T09:30:00",
  lastUpdated: "2025-05-06T09:15:00",
  environment: "本番環境",
  description: "全社ユーザー認証とグループポリシー管理のためのMicrosoft Active Directory。全拠点のユーザーアカウント、グループ、コンピュータオブジェクトの管理に使用。複数のドメインコントローラーで冗長構成を実現。",
  supportLevel: "標準",
  vendor: "Microsoft Corporation",
  version: "Windows Server 2022",
  location: "東京データセンター",
  criticality: "最高",
  sla: "99.9%",
  maintenanceWindow: "毎月第2日曜日 22:00-翌02:00",
  lifecycle: {
    implementationDate: "2023-08-01",
    lastReview: "2025-04-10",
    nextReview: "2025-10-10",
    endOfLife: "2030-12-31"
  },
  technicalContact: {
    name: "鈴木花子",
    email: "suzuki.h@example.com",
    phone: "03-1234-5678",
    department: "インフラチーム"
  },
  businessContact: {
    name: "佐藤三郎",
    email: "sato.s@example.com",
    phone: "03-1234-5679",
    department: "IT部長"
  },
  documentation: [
    { name: "運用手順書", url: "#", lastUpdated: "2025-01-15" },
    { name: "障害対応マニュアル", url: "#", lastUpdated: "2025-03-20" },
    { name: "バックアップ手順", url: "#", lastUpdated: "2025-02-10" }
  ],
  relationships: {
    dependsOn: [
      { id: "CI-012", name: "外部データセンター内ファイルサーバ", type: "サーバー", criticality: "高" },
    ],
    requiredBy: [
      { id: "CI-001", name: "Microsoft 365 E3ライセンス", type: "サービス", criticality: "高" },
      { id: "CI-003", name: "Microsoft Entra ID", type: "サービス", criticality: "最高" },
      { id: "CI-004", name: "Entra Connect", type: "アプリケーション", criticality: "高" },
      { id: "CI-008", name: "DeskNet'sNeo", type: "アプリケーション", criticality: "中" },
      { id: "CI-011", name: "SkySea Client View", type: "アプリケーション", criticality: "中" }
    ],
    connectedTo: [
      { id: "CI-003", name: "Microsoft Entra ID", type: "サービス", criticality: "最高" },
      { id: "CI-004", name: "Entra Connect", type: "アプリケーション", criticality: "高" }
    ]
  },
  changeHistory: [
    { date: "2025-05-06", type: "更新", user: "山田太郎", description: "最新のセキュリティパッチ適用" },
    { date: "2025-04-10", type: "レビュー", user: "鈴木花子", description: "四半期レビュー実施" },
    { date: "2025-03-15", type: "構成変更", user: "佐藤三郎", description: "グループポリシー設定更新" },
    { date: "2025-02-20", type: "更新", user: "山田太郎", description: "パスワードポリシー強化" },
    { date: "2025-01-10", type: "障害", user: "高橋一郎", description: "一時的な接続障害対応" },
    { date: "2024-12-05", type: "構成変更", user: "山田太郎", description: "新拠点用OUの追加" }
  ],
  incidents: [
    { id: "INC-001", date: "2025-01-10", title: "東データセンターのネットワーク障害", status: "解決済" },
    { id: "INC-005", date: "2025-03-22", title: "共有ドライブのアクセス権限エラー", status: "解決済" }
  ],
  changes: [
    { id: "CHG-002", date: "2025-05-20", title: "Active DirectoryとEntra IDの同期設定変更", status: "承認済" }
  ],
  attributes: [
    { key: "ドメイン名", value: "example.local" },
    { key: "フォレスト機能レベル", value: "Windows Server 2016" },
    { key: "ドメイン機能レベル", value: "Windows Server 2016" },
    { key: "ドメインコントローラー数", value: "4" },
    { key: "サイト数", value: "3" },
    { key: "バックアップ方式", value: "日次フルバックアップ + 差分バックアップ" },
    { key: "DNS統合", value: "あり" },
    { key: "DHCP統合", value: "あり" }
  ]
};

// 日付フォーマット用ユーティリティ関数
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// 日付のみのフォーマット用関数（時間なし）
function formatDateOnly(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).format(date);
}

export function ConfigItemDetail({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2>{configItemDetail.id}: {configItemDetail.name}</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>構成項目詳細</CardTitle>
                  <CardDescription>詳細情報と現在の構成状態</CardDescription>
                </div>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">説明</h4>
                <p>{configItemDetail.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">カテゴリ</h4>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span>{configItemDetail.category}</span>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">タイプ</h4>
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span>{configItemDetail.type}</span>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">ステータス</h4>
                  <StatusBadge status={configItemDetail.status} />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">重要度</h4>
                  <CriticalityBadge criticality={configItemDetail.criticality} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">ベンダー</h4>
                  <p>{configItemDetail.vendor}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">バージョン</h4>
                  <p>{configItemDetail.version}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">所有者</h4>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{configItemDetail.owner.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{configItemDetail.owner.name}</div>
                      <div className="text-xs text-muted-foreground">{configItemDetail.owner.department}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">環境</h4>
                  <Badge variant="outline">{configItemDetail.environment}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">場所</h4>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{configItemDetail.location}</span>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">サポートレベル</h4>
                  <p>{configItemDetail.supportLevel}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">SLA</h4>
                  <Badge variant="secondary">{configItemDetail.sla}</Badge>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">メンテナンスウィンドウ</h4>
                  <p>{configItemDetail.maintenanceWindow}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">作成日</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(configItemDetail.createdAt)}</span>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">最終更新</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(configItemDetail.lastUpdated)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <Tabs defaultValue="relationships" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="relationships">関連性</TabsTrigger>
                <TabsTrigger value="attributes">属性</TabsTrigger>
                <TabsTrigger value="lifecycle">ライフサイクル</TabsTrigger>
                <TabsTrigger value="history">変更履歴</TabsTrigger>
              </TabsList>
              
              <TabsContent value="relationships" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>依存関係</CardTitle>
                    <CardDescription>この構成項目が依存する他の項目</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {configItemDetail.relationships.dependsOn.length > 0 ? (
                      <div className="space-y-2">
                        {configItemDetail.relationships.dependsOn.map(item => (
                          <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                            <div className="flex items-center gap-3">
                              <CITypeIcon type={item.type} />
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-muted-foreground">{item.id} - {item.type}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CriticalityBadge criticality={item.criticality} />
                              <Button variant="ghost" size="sm">
                                <Link className="mr-1 h-3.5 w-3.5" />
                                詳細
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">依存関係はありません</div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>逆依存関係</CardTitle>
                    <CardDescription>この構成項目に依存する他の項目</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {configItemDetail.relationships.requiredBy.map(item => (
                        <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                          <div className="flex items-center gap-3">
                            <CITypeIcon type={item.type} />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.id} - {item.type}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CriticalityBadge criticality={item.criticality} />
                            <Button variant="ghost" size="sm">
                              <Link className="mr-1 h-3.5 w-3.5" />
                              詳細
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>接続関係</CardTitle>
                    <CardDescription>この構成項目と接続している他の項目</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {configItemDetail.relationships.connectedTo.map(item => (
                        <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                          <div className="flex items-center gap-3">
                            <CITypeIcon type={item.type} />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.id} - {item.type}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CriticalityBadge criticality={item.criticality} />
                            <Button variant="ghost" size="sm">
                              <Link className="mr-1 h-3.5 w-3.5" />
                              詳細
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="attributes" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>技術属性</CardTitle>
                    <CardDescription>構成項目の技術的詳細情報</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {configItemDetail.attributes.map((attr, index) => (
                        <div key={index} className="rounded-md border p-3">
                          <div className="text-sm text-muted-foreground">{attr.key}</div>
                          <div className="font-medium">{attr.value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="lifecycle" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>ライフサイクル情報</CardTitle>
                    <CardDescription>構成項目の重要な日程</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="relative border-l border-muted">
                      <LifecycleItem
                        title="導入日"
                        date={configItemDetail.lifecycle.implementationDate}
                        isPast={true}
                      />
                      <LifecycleItem
                        title="最終レビュー"
                        date={configItemDetail.lifecycle.lastReview}
                        isPast={true}
                      />
                      <LifecycleItem
                        title="次回レビュー"
                        date={configItemDetail.lifecycle.nextReview}
                        isPast={false}
                      />
                      <LifecycleItem
                        title="サポート終了"
                        date={configItemDetail.lifecycle.endOfLife}
                        isPast={false}
                      />
                    </ol>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>技術担当者</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{configItemDetail.technicalContact.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{configItemDetail.technicalContact.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{configItemDetail.technicalContact.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{configItemDetail.technicalContact.department}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>業務担当者</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{configItemDetail.businessContact.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{configItemDetail.businessContact.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{configItemDetail.businessContact.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{configItemDetail.businessContact.department}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>ドキュメント</CardTitle>
                    <CardDescription>関連ドキュメントとマニュアル</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {configItemDetail.documentation.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-3">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{doc.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">更新: {formatDateOnly(doc.lastUpdated)}</span>
                            <Button variant="outline" size="sm">表示</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>変更履歴</CardTitle>
                    <CardDescription>構成項目の変更履歴記録</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="relative border-l border-muted">
                      {configItemDetail.changeHistory.map((change, index) => (
                        <li key={index} className="mb-6 ml-6">
                          <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                            <History className="h-3 w-3 text-muted-foreground" />
                          </span>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <time className="text-sm text-muted-foreground">{change.date}</time>
                              <Badge variant="outline" className="px-2 py-0 text-xs">
                                {change.type}
                              </Badge>
                            </div>
                            <h3 className="text-base font-medium">{change.description}</h3>
                            <p className="text-sm text-muted-foreground">変更者: {change.user}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>関連インシデント</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {configItemDetail.incidents.length > 0 ? (
                        <div className="space-y-2">
                          {configItemDetail.incidents.map(incident => (
                            <div key={incident.id} className="flex items-center justify-between rounded-md border p-3">
                              <div>
                                <div className="font-medium">{incident.title}</div>
                                <div className="text-xs text-muted-foreground">{incident.id} - {incident.date}</div>
                              </div>
                              <Badge variant={incident.status === "解決済" ? "outline" : "default"}>
                                {incident.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground">関連するインシデントはありません</div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>関連変更リクエスト</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {configItemDetail.changes.length > 0 ? (
                        <div className="space-y-2">
                          {configItemDetail.changes.map(change => (
                            <div key={change.id} className="flex items-center justify-between rounded-md border p-3">
                              <div>
                                <div className="font-medium">{change.title}</div>
                                <div className="text-xs text-muted-foreground">{change.id} - {change.date}</div>
                              </div>
                              <Badge variant="outline">
                                {change.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground">関連する変更リクエストはありません</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>アクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start">
                <Edit className="mr-2 h-4 w-4" />
                構成項目を編集
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <History className="mr-2 h-4 w-4" />
                変更履歴を表示
              </Button>
              <Separator />
              <Button className="w-full justify-start" variant="secondary">
                <Link className="mr-2 h-4 w-4" />
                関連項目を管理
              </Button>
              <Button className="w-full justify-start" variant="secondary">
                <Globe className="mr-2 h-4 w-4" />
                トポロジー表示
              </Button>
              <Separator />
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="mr-2 h-4 w-4" />
                    セキュリティレビュー
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>セキュリティレビュー</DialogTitle>
                    <DialogDescription>
                      この構成項目に関連するセキュリティレビュー情報
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="rounded-md border p-4">
                      <h4 className="mb-2 font-medium">最終セキュリティレビュー</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">実施日</span>
                          <span>2025年3月15日</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">実施者</span>
                          <span>セキュリティチーム</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">結果</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            合格
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">セキュリティレビュー所見</h4>
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        <li>パスワードポリシーが適切に構成されている</li>
                        <li>監査ログが有効化されている</li>
                        <li>最新のセキュリティパッチが適用されている</li>
                        <li>特権アクセスが適切に制限されている</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">推奨アクション</h4>
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        <li>多要素認証の適用範囲を拡大する</li>
                        <li>セキュリティログの保持期間を延長する</li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                レポート生成
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>メタデータ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">構成項目ID</div>
                <div className="font-mono text-sm">{configItemDetail.id}</div>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">タイプ</div>
                <div className="text-sm">{configItemDetail.type}</div>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">環境</div>
                <Badge variant="outline">{configItemDetail.environment}</Badge>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">サポート終了</div>
                <div className="text-sm">{configItemDetail.lifecycle.endOfLife}</div>
              </div>
              <div className="flex justify-between rounded-md border p-3">
                <div className="text-sm">関連項目数</div>
                <Badge variant="secondary">
                  {configItemDetail.relationships.dependsOn.length + 
                   configItemDetail.relationships.requiredBy.length + 
                   configItemDetail.relationships.connectedTo.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// LifecycleItem コンポーネント
function LifecycleItem({ title, date, isPast }: { title: string; date: string; isPast: boolean }) {
  return (
    <li className="mb-6 ml-6">
      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-muted">
        <Calendar className="h-3 w-3 text-muted-foreground" />
      </span>
      <div className="flex flex-col space-y-1">
        <time className="text-sm text-muted-foreground">{date}</time>
        <h3 className="text-base font-medium">{title}</h3>
        {isPast ? (
          <Badge variant="outline" className="w-fit bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            完了
          </Badge>
        ) : (
          <Badge variant="outline" className="w-fit bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            予定
          </Badge>
        )}
      </div>
    </li>
  );
}

// 構成項目タイプに応じたアイコンを表示するコンポーネント
function CITypeIcon({ type }: { type: string }) {
  let icon;
  
  switch (type) {
    case "サービス":
      icon = <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>;
      break;
    case "アプリケーション":
      icon = <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>;
      break;
    case "サーバー":
      icon = <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>;
      break;
    default:
      icon = <Tag className="h-4 w-4 text-gray-500" />;
  }
  
  return (
    <div className="rounded-full bg-muted p-1">
      {icon}
    </div>
  );
}

// ステータスバッジコンポーネント
function StatusBadge({ status }: { status: string }) {
  let classes = "";
  
  switch (status) {
    case "稼働中":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    case "障害中":
      classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      break;
    case "メンテナンス中":
      classes = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      break;
    case "廃止予定":
      classes = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      break;
    case "廃止済":
      classes = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{status}</Badge>;
}

// 重要度バッジコンポーネント
function CriticalityBadge({ criticality }: { criticality: string }) {
  let classes = "";
  
  switch (criticality) {
    case "最高":
      classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      break;
    case "高":
      classes = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      break;
    case "中":
      classes = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      break;
    case "低":
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    default:
      classes = "bg-secondary text-secondary-foreground";
  }
  
  return <Badge variant="outline" className={classes}>{criticality}</Badge>;
}