import { Clock, Star, CheckCircle, AlertTriangle, Clock5 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

// サービスカタログのサンプルデータはServiceCardGrid.tsxと同じデータを使用
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

interface ServiceCardListProps {
  searchQuery: string;
  categoryFilter: string;
  onViewDetail: (serviceId: string) => void;
  onRequestService: (serviceId: string) => void;
}

export function ServiceCardList({ 
  searchQuery, 
  categoryFilter,
  onViewDetail,
  onRequestService
}: ServiceCardListProps) {
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
    <div className="space-y-2 pt-4">
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-8 p-3"></th>
              <th className="p-3 text-left font-medium">サービス名</th>
              <th className="p-3 text-left font-medium">カテゴリ</th>
              <th className="p-3 text-left font-medium">説明</th>
              <th className="p-3 text-left font-medium">所要時間</th>
              <th className="p-3 text-left font-medium">承認</th>
              <th className="p-3 text-left font-medium">コスト</th>
              <th className="p-3 text-left font-medium">アクション</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map((service) => (
              <tr key={service.id} className="border-b">
                <td className="p-3 text-center">{service.icon}</td>
                <td className="p-3 font-medium">
                  <div className="flex items-center gap-2">
                    <span>{service.name}</span>
                    <ServiceStatusIndicator status={service.status} />
                  </div>
                </td>
                <td className="p-3">
                  <CategoryBadge category={service.category} />
                </td>
                <td className="max-w-xs p-3">
                  <p className="line-clamp-2 text-sm">{service.description}</p>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{service.fulfillmentTime}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    {service.approvalRequired ? (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        必要
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        不要
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <span className="text-sm">{service.cost}</span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewDetail(service.id)}
                    >
                      詳細
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => onRequestService(service.id)}
                    >
                      リクエスト
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredServices.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-md border">
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
      icon = <Clock5 className="h-4 w-4 text-blue-500" />;
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

// カテゴリバッジコンポーネント
function CategoryBadge({ category }: { category: string }) {
  let color = "";
  
  switch(category) {
    case "software":
      color = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      break;
    case "hardware":
      color = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      break;
    case "network":
      color = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    case "account":
      color = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      break;
    case "communication":
      color = "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
      break;
    case "support":
      color = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      break;
    case "storage":
      color = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      break;
    default:
      color = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {category}
    </span>
  );
}