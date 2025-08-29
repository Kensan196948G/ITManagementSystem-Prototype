import { useState } from "react";
import { Calendar, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ChangesTable } from "./ChangesTable";
import { ChangeDetail } from "./ChangeDetail";
import { ChangeCalendar } from "./ChangeCalendar";
import { ChangeRequestForm } from "./ChangeRequestForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

export function ChangesPage() {
  const [viewMode, setViewMode] = useState<"list" | "detail" | "form">("list");
  const [activeTab, setActiveTab] = useState<"table" | "calendar">("table");
  const [showForm, setShowForm] = useState(false);
  
  return (
    <div className="space-y-4 p-4">
      {viewMode === "list" && (
        <>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h1>変更管理</h1>
              <p className="text-muted-foreground">
                ITサービスとインフラストラクチャの変更を計画、承認、実装するためのプロセス
              </p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新規変更リクエスト
            </Button>
          </div>
          
          <Tabs defaultValue="table" value={activeTab} onValueChange={(v) => setActiveTab(v as "table" | "calendar")}>
            <TabsList>
              <TabsTrigger value="table">一覧表示</TabsTrigger>
              <TabsTrigger value="calendar">カレンダー表示</TabsTrigger>
            </TabsList>
            <TabsContent value="table">
              <ChangesTable />
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setViewMode("detail")}>
                  詳細を表示（デモ用）
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="calendar">
              <ChangeCalendar />
            </TabsContent>
          </Tabs>
          
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="max-h-screen max-w-4xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>新規変更リクエスト</DialogTitle>
                <DialogDescription>
                  変更の詳細を入力してシステム変更リクエストを作成します
                </DialogDescription>
              </DialogHeader>
              <ChangeRequestForm 
                onSave={() => setShowForm(false)}
                onCancel={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
      
      {viewMode === "detail" && (
        <ChangeDetail onBack={() => setViewMode("list")} />
      )}
      
      {viewMode === "form" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setViewMode("list")}>
              戻る
            </Button>
            <h2>新規変更リクエスト作成</h2>
          </div>
          <ChangeRequestForm 
            onSave={() => setViewMode("list")}
            onCancel={() => setViewMode("list")}
          />
        </div>
      )}
    </div>
  );
}