import { Clock, ExternalLink, Star, CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

// サービスカタログのサンプルデータ
const servicesData = [
  {
    id: "SVC-001",
    name: "Microsoft 365 E3ライセンス",
    description: "Microsoft 365 E3ライセンスの割り当て。Word、Excel、PowerPoint、Teams、Exchange、SharePoint、OneDriveなどのアプリケーションとサービスが含まれます。",
    category: "software",
    icon: "🖥️",
    fulfillmentTime: "1営業日",
    approvalRequired: true,
    cost: "¥2,100 / 月",
    rating: 4.7,
    tags: ["Microsoft 365", "ライセンス", "Office"],
    status: "available",
    sla: {
      fulfillment: "1営業日以内",
      availability: "99.9%"
    }
  },
  {
    id: "SVC-002",
    name: "リモートアクセスVPN",
    description: "社外からの社内ネットワークへのセキュアなアクセス。自宅やその他の場所から安全に社内リソースにアクセスできるようになります。",
    category: "network",
    icon: "🔒",
    fulfillmentTime: "4時間",
    approvalRequired: true,
    cost: "無料",
    rating: 4.5,
    tags: ["VPN", "リモートアクセス", "セキュリティ"],
    status: "available",
    sla: {
      fulfillment: "4時間以内",
      availability: "99.5%"
    }
  },
  {
    id: "SVC-003",
    name: "社用スマートフォン",
    description: "業務用のスマートフォン端末とプランの提供。会社支給のモバイルデバイスが必要な場合に申請してください。",
    category: "hardware",
    icon: "📱",
    fulfillmentTime: "3〜5営業日",
    approvalRequired: true,
    cost: "¥8,000 / 月",
    rating: 4.2,
    tags: ["スマートフォン", "モバイル", "デバイス"],
    status: "available",
    sla: {
      fulfillment: "5営業日以内",
      availability: "N/A"
    }
  },
  {
    id: "SVC-004",
    name: "パスワードリセット",
    description: "Microsoft 365、Active Directory、その他の企業システムのパスワードリセット。アカウントにアクセスできなくなった場合に申請してください。",
    category: "account",
    icon: "🔑",
    fulfillmentTime: "30分",
    approvalRequired: false,
    cost: "無料",
    rating: 4.9,
    tags: ["パスワード", "アカウント", "リセット"],
    status: "available",
    sla: {
      fulfillment: "30分以内",
      availability: "99.99%"
    }
  },
  {
    id: "SVC-005",
    name: "ゲストWi-Fiアクセス",
    description: "来客用の一時的なWi-Fiアクセス権限の発行。社内来訪者や取引先向けの一時的なインターネットアクセスを提供します。",
    category: "network",
    icon: "📶",
    fulfillmentTime: "即時",
    approvalRequired: false,
    cost: "無料",
    rating: 4.8,
    tags: ["Wi-Fi", "ゲストアクセス", "来訪者"],
    status: "available",
    sla: {
      fulfillment: "15分以内",
      availability: "99.5%"
    }
  },
  {
    id: "SVC-006",
    name: "チームMicrosoft Teamsの作成",
    description: "新しいTeamsチームとチャネルの作成。プロジェクトや部門のためのコラボレーション環境が必要な場合に申請してください。",
    category: "communication",
    icon: "👥",
    fulfillmentTime: "4時間",
    approvalRequired: true,
    cost: "無料",
    rating: 4.6,
    tags: ["Teams", "コラボレーション", "チームワーク"],
    status: "available",
    sla: {
      fulfillment: "4時間以内",
      availability: "99.9%"
    }
  },
  {
    id: "SVC-007",
    name: "ノートPC",
    description: "業務用のノートPCの提供。新入社員や機器更新が必要な場合に申請してください。標準仕様と高性能モデルから選択できます。",
    category: "hardware",
    icon: "💻",
    fulfillmentTime: "5〜7営業日",
    approvalRequired: true,
    cost: "¥15,000〜25,000 / 月",
    rating: 4.4,
    tags: ["ノートPC", "デバイス", "ハードウェア"],
    status: "available",
    sla: {
      fulfillment: "7営業日以内",
      availability: "N/A"
    }
  },
  {
    id: "SVC-008",
    name: "ソフトウェアインストール",
    description: "業務に必要なソフトウェアのインストール依頼。標準外のソフトウェアが必要な場合に申請してください。",
    category: "software",
    icon: "📥",
    fulfillmentTime: "1営業日",
    approvalRequired: true,
    cost: "ソフトウェアによる",
    rating: 4.3,
    tags: ["ソフトウェア", "インストール", "アプリケーション"],
    status: "available",
    sla: {
      fulfillment: "1営業日以内",
      availability: "N/A"
    }
  },
  {
    id: "SVC-009",
    name: "会議室予約システム",
    description: "会議室の予約・管理システムへのアクセス権限。会議やイベントスペースの予約が必要な場合に申請してください。",
    category: "communication",
    icon: "🏢",
    fulfillmentTime: "2時間",
    approvalRequired: false,
    cost: "無料",
    rating: 4.7,
    tags: ["会議室", "予約", "ファシリティ"],
    status: "available",
    sla: {
      fulfillment: "2時間以内",
      availability: "99.5%"
    }
  },
  {
    id: "SVC-010",
    name: "プリンターアクセス",
    description: "オフィスプリンターへのアクセス設定。プリンター・複合機の利用権限が必要な場合に申請してください。",
    category: "hardware",
    icon: "🖨️",
    fulfillmentTime: "2時間",
    approvalRequired: false,
    cost: "無料 (印刷量による課金あり)",
    rating: 4.5,
    tags: ["プリンター", "印刷", "複合機"],
    status: "available",
    sla: {
      fulfillment: "2時間以内",
      availability: "99%"
    }
  },
  {
    id: "SVC-011",
    name: "データ復旧サービス",
    description: "削除・破損したデータの復旧サポート。誤って削除したファイルや破損したデータの回復が必要な場合に申請してください。",
    category: "support",
    icon: "🔄",
    fulfillmentTime: "優先度による",
    approvalRequired: true,
    cost: "無料 (大規模復旧は別途費用)",
    rating: 4.2,
    tags: ["データ復旧", "ファイル", "バックアップ"],
    status: "available",
    sla: {
      fulfillment: "優先度による（最大2営業日）",
      availability: "N/A"
    }
  },
  {
    id: "SVC-012",
    name: "クラウドストレージ容量追加",
    description: "OneDriveやSharePointのストレージ容量の追加申請。標準割当量以上のストレージが必要な場合に申請してください。",
    category: "storage",
    icon: "☁️",
    fulfillmentTime: "1営業日",
    approvalRequired: true,
    cost: "¥500 / 10GB / 月",
    rating: 4.6,
    tags: ["ストレージ", "クラウド", "OneDrive"],
    status: "available",
    sla: {
      fulfillment: "1営業日以内",
      availability: "99.9%"
    }
  }
];

interface ServiceCardGridProps {
  searchQuery: string;
  categoryFilter: string;
  onViewDetail: (serviceId: string) => void;
  onRequestService: (serviceId: string) => void;
}

export function ServiceCardGrid({ 
  searchQuery, 
  categoryFilter,
  onViewDetail,
  onRequestService
}: ServiceCardGridProps) {
  // 検索クエリとカテゴリでフィルタリング
  const filteredServices = servicesData.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      categoryFilter === "all" || 
      service.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredServices.map((service) => (
        <Card key={service.id} className="flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xl">
                  {service.icon}
                </div>
                <div>
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  <CardDescription className="text-xs">{service.category}</CardDescription>
                </div>
              </div>
              <ServiceStatusIndicator status={service.status} />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="line-clamp-3 text-sm">{service.description}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {service.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t bg-muted/20 p-3">
            <div className="grid w-full grid-cols-2 gap-x-2 gap-y-1 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{service.fulfillmentTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <ApprovalIndicator required={service.approvalRequired} />
                <span>{service.approvalRequired ? "承認必要" : "承認不要"}</span>
              </div>
              <div className="col-span-2 flex items-center gap-1">
                <span className="font-medium">コスト:</span>
                <span>{service.cost}</span>
              </div>
            </div>
            <div className="flex w-full gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onViewDetail(service.id)}
              >
                詳細
              </Button>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onRequestService(service.id)}
              >
                リクエスト
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
      
      {filteredServices.length === 0 && (
        <div className="col-span-3 flex h-40 items-center justify-center rounded-md border">
          <p className="text-muted-foreground">検索条件に一致するサービスが見つかりませんでした</p>
        </div>
      )}
    </div>
  );
}

// サービスステータスインジケーターコンポーネント
function ServiceStatusIndicator({ status }: { status: string }) {
  let icon = null;
  let tooltipText = "";
  
  switch(status) {
    case "available":
      icon = <CheckCircle className="h-4 w-4 text-green-500" />;
      tooltipText = "利用可能";
      break;
    case "limited":
      icon = <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      tooltipText = "一部利用制限あり";
      break;
    case "unavailable":
      icon = <AlertTriangle className="h-4 w-4 text-red-500" />;
      tooltipText = "現在利用不可";
      break;
    case "planned":
      icon = <Clock className="h-4 w-4 text-blue-500" />;
      tooltipText = "準備中";
      break;
    default:
      icon = <CheckCircle className="h-4 w-4 text-green-500" />;
      tooltipText = "利用可能";
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{icon}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// 承認必要性インジケーターコンポーネント
function ApprovalIndicator({ required }: { required: boolean }) {
  return required ? 
    <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04L12 21.416l9.618-13.432A11.955 11.955 0 0112 2.944z" />
    </svg> : 
    <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>;
}