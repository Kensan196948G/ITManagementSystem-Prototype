import { useEffect, useRef } from "react";
import { Card } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";

export function RelationshipGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // この例では、実際のグラフを描画するための疑似コードを含めています
  // 実際の実装では、D3.jsやvisjs、cytoscape.jsなどのライブラリを使用することが推奨されます
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // キャンバスの幅と高さを取得
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    // 疑似グラフ描画 - ノードとエッジを描画
    drawSampleGraph(ctx, width, height);
    
  }, []);
  
  const drawSampleGraph = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // サンプルノード位置
    const nodes = [
      { id: "CI-001", x: width * 0.3, y: height * 0.2, label: "MS-SQL-01", type: "server" },
      { id: "CI-002", x: width * 0.7, y: height * 0.2, label: "WEB-01", type: "server" },
      { id: "CI-003", x: width * 0.5, y: height * 0.4, label: "APP-01", type: "server" },
      { id: "CI-004", x: width * 0.5, y: height * 0.6, label: "CORE-SW-01", type: "network" },
      { id: "CI-007", x: width * 0.3, y: height * 0.8, label: "MS365-DB", type: "application" },
      { id: "CI-008", x: width * 0.7, y: height * 0.8, label: "SharePoint", type: "application" },
      { id: "CI-010", x: width * 0.5, y: height * 0.9, label: "Microsoft 365", type: "service" },
    ];
    
    // サンプルエッジ
    const edges = [
      { source: "CI-001", target: "CI-004", label: "depends_on" },
      { source: "CI-001", target: "CI-007", label: "hosts" },
      { source: "CI-002", target: "CI-004", label: "depends_on" },
      { source: "CI-002", target: "CI-008", label: "hosts" },
      { source: "CI-003", target: "CI-004", label: "depends_on" },
      { source: "CI-007", target: "CI-010", label: "part_of" },
      { source: "CI-008", target: "CI-010", label: "part_of" },
    ];
    
    // エッジを描画
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1;
    
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        
        // エッジラベルの描画
        const labelX = (source.x + target.x) / 2;
        const labelY = (source.y + target.y) / 2;
        
        ctx.fillStyle = "#666";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(edge.label, labelX, labelY - 5);
      }
    });
    
    // ノードを描画
    nodes.forEach(node => {
      // ノードタイプに基づく色を設定
      let color;
      switch (node.type) {
        case "server": color = "#3b82f6"; break;
        case "network": color = "#10b981"; break;
        case "application": color = "#8b5cf6"; break;
        case "service": color = "#0ea5e9"; break;
        default: color = "#6b7280";
      }
      
      // ノードの描画
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // ノードラベルの描画
      ctx.fillStyle = "#000";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(node.label, node.x, node.y + 30);
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Label>表示レベル</Label>
          <Select defaultValue="2">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="表示レベルを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">レベル1 (直接の関係のみ)</SelectItem>
              <SelectItem value="2">レベル2 (2次関係まで)</SelectItem>
              <SelectItem value="3">レベル3 (3次関係まで)</SelectItem>
              <SelectItem value="all">すべての関係を表示</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 min-w-[200px]">
          <Label>ズームレベル</Label>
          <Slider defaultValue={[100]} max={200} min={50} step={10} />
        </div>
      </div>
      
      <Card className="p-0 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-900 w-full h-[600px] relative">
          <canvas 
            ref={canvasRef} 
            width={1000} 
            height={600} 
            className="w-full h-full"
          />
          <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm text-xs">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>サーバー</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>ネットワーク</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>アプリケーション</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-500"></div>
              <span>サービス</span>
            </div>
          </div>
        </div>
      </Card>
      
      <p className="text-sm text-muted-foreground text-center">
        構成アイテム間の関連性を視覚的に表示しています。ノードをドラッグして移動したり、ズームイン/アウトしたりできます。
      </p>
    </div>
  );
}