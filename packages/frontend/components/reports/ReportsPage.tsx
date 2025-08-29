import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Plus, Download, Printer, Save, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { ReportDashboard } from "./ReportDashboard";
import { ReportsList } from "./ReportsList";
import { ReportGeneratorForm } from "./ReportGeneratorForm";

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "reports" | "scheduled">("dashboard");
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  
  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1>レポート</h1>
          <p className="text-muted-foreground">
            サービスパフォーマンス、運用状況、トレンド分析のレポート生成と管理
          </p>
        </div>
        <Button onClick={() => setShowReportGenerator(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規レポート作成
        </Button>
      </div>
      
      <Tabs 
        defaultValue="dashboard" 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as "dashboard" | "reports" | "scheduled")}
      >
        <TabsList>
          <TabsTrigger value="dashboard">レポートダッシュボード</TabsTrigger>
          <TabsTrigger value="reports">既存レポート</TabsTrigger>
          <TabsTrigger value="scheduled">定期レポート</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <ReportDashboard />
        </TabsContent>
        
        <TabsContent value="reports">
          <ReportsList type="saved" />
        </TabsContent>
        
        <TabsContent value="scheduled">
          <ReportsList type="scheduled" />
        </TabsContent>
      </Tabs>
      
      <Dialog open={showReportGenerator} onOpenChange={setShowReportGenerator}>
        <DialogContent className="max-h-screen max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新規レポート作成</DialogTitle>
            <DialogDescription>
              生成するレポートの種類と期間、内容を選択してください
            </DialogDescription>
          </DialogHeader>
          <ReportGeneratorForm 
            onSave={() => setShowReportGenerator(false)}
            onCancel={() => setShowReportGenerator(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}