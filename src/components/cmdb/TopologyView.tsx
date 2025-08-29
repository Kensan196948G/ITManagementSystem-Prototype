import { useState, useRef, useEffect } from "react";
import { Search, ZoomIn, ZoomOut, Maximize, Save, Filter, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

// サンプルトポロジーデータ
const topologyData = {
  nodes: [
    { id: "CI-001", label: "Microsoft 365 E3ライセンス", type: "サービス", category: "ソフトウェア", status: "稼働中", criticality: "高" },
    { id: "CI-002", label: "Active Directory", type: "サービス", category: "ディレクトリサービス", status: "稼働中", criticality: "最高" },
    { id: "CI-003", label: "Microsoft Entra ID", type: "サービス", category: "ディレクトリサービス", status: "稼働中", criticality: "最高" },
    { id: "CI-004", label: "Entra Connect", type: "アプリケーション", category: "同期ツール", status: "稼働中", criticality: "高" },
    { id: "CI-005", label: "Exchange Online", type: "サービス", category: "コミュニケーション", status: "稼働中", criticality: "高" },
    { id: "CI-006", label: "Microsoft Teams", type: "サービス", category: "コラボレーション", status: "稼働中", criticality: "高" },
    { id: "CI-007", label: "OneDrive for Business", type: "サービス", category: "ストレージ", status: "稼働中", criticality: "中" },
    { id: "CI-012", label: "外部データセンター内ファイルサーバ", type: "サーバー", category: "ストレージ", status: "稼働中", criticality: "高" }
  ],
  edges: [
    { from: "CI-002", to: "CI-012", label: "依存", type: "depends_on" },
    { from: "CI-003", to: "CI-002", label: "同期", type: "syncs_with" },
    { from: "CI-003", to: "CI-004", label: "使用", type: "uses" },
    { from: "CI-004", to: "CI-002", label: "接続", type: "connects_to" },
    { from: "CI-004", to: "CI-003", label: "接続", type: "connects_to" },
    { from: "CI-001", to: "CI-003", label: "依存", type: "depends_on" },
    { from: "CI-001", to: "CI-005", label: "含む", type: "includes" },
    { from: "CI-001", to: "CI-006", label: "含む", type: "includes" },
    { from: "CI-001", to: "CI-007", label: "含む", type: "includes" },
    { from: "CI-005", to: "CI-003", label: "依存", type: "depends_on" },
    { from: "CI-006", to: "CI-003", label: "依存", type: "depends_on" },
    { from: "CI-007", to: "CI-003", label: "依存", type: "depends_on" }
  ]
};

// 次の実装ではd3.jsやreact-force-graphを使うところですが、
// このデモでは簡易的な描画でトポロジービューを表現します
export function TopologyView() {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // フィルタリングされたノードを取得
  const filteredNodes = topologyData.nodes.filter(node => {
    const matchesSearch = node.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          node.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || node.type === filterType;
    return matchesSearch && matchesType;
  });
  
  // フィルタリングされたノードIDに基づいてエッジをフィルタリング
  const nodeIds = filteredNodes.map(node => node.id);
  const filteredEdges = topologyData.edges.filter(edge => 
    nodeIds.includes(edge.from) && nodeIds.includes(edge.to)
  );
  
  // ズームイン処理
  const handleZoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(zoomLevel + 20);
    }
  };
  
  // ズームアウト処理
  const handleZoomOut = () => {
    if (zoomLevel > 40) {
      setZoomLevel(zoomLevel - 20);
    }
  };
  
  // ズームリセット処理
  const handleZoomReset = () => {
    setZoomLevel(100);
  };
  
  // 保存処理（実際のアプリではPNG/SVGなどで保存するロジックを実装）
  const handleSave = () => {
    alert("トポロジー図を保存しました（デモ機能）");
  };
  
  // ノード選択処理
  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="構成項目を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:w-[300px]"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="タイプで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのタイプ</SelectItem>
              <SelectItem value="サービス">サービス</SelectItem>
              <SelectItem value="アプリケーション">アプリケーション</SelectItem>
              <SelectItem value="サーバー">サーバー</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="w-16 text-center text-sm">
            {zoomLevel}%
          </div>
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomReset}>
            <Maximize className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleSave}>
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle>トポロジービュー</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>構成項目間の関係を可視化した図です</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>
            Microsoft 365関連のサービスと依存関係
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                サービス
              </Badge>
              <Badge variant="outline" className="gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                アプリケーション
              </Badge>
              <Badge variant="outline" className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                サーバー
              </Badge>
              <Separator className="mx-2 h-5" orientation="vertical" />
              <Badge variant="outline" className="gap-1">
                <div className="h-1 w-5 border-b-2 border-dashed border-gray-500"></div>
                依存
              </Badge>
              <Badge variant="outline" className="gap-1">
                <div className="h-1 w-5 border-b-2 border-gray-500"></div>
                接続
              </Badge>
            </div>
            
            <div 
              ref={canvasRef}
              className="relative h-[500px] overflow-hidden rounded-md border bg-muted/30"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
            >
              {/* 実際のアプリではD3.jsやreact-force-graphなどのライブラリを使用して
                  リッチなインタラクティブトポロジー図を実装 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-muted-foreground">
                  <div className="text-center">
                    <p>トポロジービューのためにはD3.jsやreact-force-graphなどのライブラリが必要です</p>
                    <p>このデモでは{filteredNodes.length}個のノードと{filteredEdges.length}個の接続をビジュアライズします</p>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 gap-4 rounded-md border p-4">
                    <div>
                      <h4 className="mb-2 font-medium">ノード</h4>
                      <div className="space-y-1 text-sm">
                        {filteredNodes.map(node => (
                          <div 
                            key={node.id}
                            className={`
                              cursor-pointer rounded-md border p-1 transition-colors
                              ${getNodeColorClass(node.type)}
                              ${selectedNode === node.id ? 'ring-2 ring-primary' : ''}
                            `}
                            onClick={() => handleNodeSelect(node.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{node.label}</div>
                              <Badge variant="outline" className="text-xs">
                                {node.id}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="mb-2 font-medium">接続関係</h4>
                      <div className="space-y-1 text-sm">
                        {filteredEdges.map((edge, idx) => (
                          <div 
                            key={idx}
                            className={`
                              rounded-md border p-1
                              ${selectedNode === edge.from || selectedNode === edge.to ? 'bg-muted' : ''}
                            `}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <span className="font-mono">{edge.from}</span>
                                <span className="mx-1">→</span>
                                <span className="font-mono">{edge.to}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {edge.label}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedNode && (
        <NodeDetails 
          node={topologyData.nodes.find(n => n.id === selectedNode)!}
          edges={topologyData.edges.filter(e => e.from === selectedNode || e.to === selectedNode)}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}

// ノードの詳細情報を表示するコンポーネント
function NodeDetails({ 
  node, 
  edges,
  onClose 
}: { 
  node: typeof topologyData.nodes[0];
  edges: typeof topologyData.edges[0][];
  onClose: () => void;
}) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle>{node.label}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            閉じる
          </Button>
        </div>
        <CardDescription>
          {node.id} - {node.type}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-md border p-2">
              <div className="text-xs text-muted-foreground">タイプ</div>
              <div>{node.type}</div>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-xs text-muted-foreground">カテゴリ</div>
              <div>{node.category}</div>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-xs text-muted-foreground">ステータス</div>
              <div>
                <StatusBadge status={node.status} />
              </div>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-xs text-muted-foreground">重要度</div>
              <div>
                <CriticalityBadge criticality={node.criticality} />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">関連</h4>
            <div className="space-y-1">
              {edges.map((edge, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    {edge.from === node.id ? (
                      <>
                        <div className="rounded-full bg-muted p-1">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm">{edge.label}: {findNodeLabel(edge.to)}</div>
                          <div className="text-xs text-muted-foreground">{edge.to}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="rounded-full bg-muted p-1">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm">{findNodeLabel(edge.from)}からの{edge.label}</div>
                          <div className="text-xs text-muted-foreground">{edge.from}</div>
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">詳細</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button>構成項目詳細を表示</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{node.label}</DialogTitle>
                  <DialogDescription>
                    構成項目の詳細情報
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                  <p>
                    実際のアプリでは、この構成項目の詳細情報ページに遷移します。
                  </p>
                  <p className="text-muted-foreground">
                    ID: {node.id}, タイプ: {node.type}, カテゴリ: {node.category}
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ノードのラベルを取得する関数
function findNodeLabel(nodeId: string): string {
  const node = topologyData.nodes.find(n => n.id === nodeId);
  return node ? node.label : nodeId;
}

// ノードのタイプに基づいて色クラスを取得
function getNodeColorClass(type: string): string {
  switch (type) {
    case "サービス":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "アプリケーション":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "サーバー":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-secondary text-secondary-foreground";
  }
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

// セパレータコンポーネント
function Separator({ className, orientation = "horizontal" }: { className?: string, orientation?: "horizontal" | "vertical" }) {
  return (
    <div 
      className={`
        bg-border
        ${orientation === "horizontal" ? "h-px w-full" : "h-full w-px"} 
        ${className || ""}
      `}
    />
  );
}