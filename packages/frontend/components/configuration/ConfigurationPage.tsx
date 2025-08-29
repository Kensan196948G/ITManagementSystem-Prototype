import { useState } from "react";
import { Database, Filter, Plus, Search, Server, HardDrive, Network, Cpu, Globe } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ConfigurationItemsList } from "./ConfigurationItemsList";
import { RelationshipGraph } from "./RelationshipGraph";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { ConfigurationItemForm } from "./ConfigurationItemForm";

export function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState<"items" | "graph">("items");
  const [selectedItemType, setSelectedItemType] = useState<string>("all");
  const [showItemForm, setShowItemForm] = useState(false);
  
  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1>構成管理</h1>
          <p className="text-muted-foreground">
            ITサービスとインフラストラクチャコンポーネントの関係と属性を記録・管理するデータベース
          </p>
        </div>
        <Button onClick={() => setShowItemForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規構成アイテム
        </Button>
      </div>
      
      <Tabs defaultValue="items" value={activeTab} onValueChange={(v) => setActiveTab(v as "items" | "graph")}>
        <TabsList>
          <TabsTrigger value="items">構成アイテム一覧</TabsTrigger>
          <TabsTrigger value="graph">関連性グラフ</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={selectedItemType === "all" ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setSelectedItemType("all")}
              >
                <Database className="mr-2 h-4 w-4" />
                すべて
              </Button>
              <Button 
                variant={selectedItemType === "server" ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setSelectedItemType("server")}
              >
                <Server className="mr-2 h-4 w-4" />
                サーバー
              </Button>
              <Button 
                variant={selectedItemType === "network" ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setSelectedItemType("network")}
              >
                <Network className="mr-2 h-4 w-4" />
                ネットワーク
              </Button>
              <Button 
                variant={selectedItemType === "storage" ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setSelectedItemType("storage")}
              >
                <HardDrive className="mr-2 h-4 w-4" />
                ストレージ
              </Button>
              <Button 
                variant={selectedItemType === "application" ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setSelectedItemType("application")}
              >
                <Cpu className="mr-2 h-4 w-4" />
                アプリケーション
              </Button>
              <Button 
                variant={selectedItemType === "service" ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setSelectedItemType("service")}
              >
                <Globe className="mr-2 h-4 w-4" />
                サービス
              </Button>
            </div>
            
            <ConfigurationItemsList selectedType={selectedItemType} />
          </div>
        </TabsContent>
        <TabsContent value="graph">
          <RelationshipGraph />
        </TabsContent>
      </Tabs>
      
      <Dialog open={showItemForm} onOpenChange={setShowItemForm}>
        <DialogContent className="max-h-screen max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新規構成アイテム</DialogTitle>
            <DialogDescription>
              新しい構成アイテムの詳細情報を入力してください
            </DialogDescription>
          </DialogHeader>
          <ConfigurationItemForm 
            onSave={() => setShowItemForm(false)}
            onCancel={() => setShowItemForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}