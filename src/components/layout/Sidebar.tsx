import { Home, AlertCircle, Wrench, BarChart3, HardDrive, FileSpreadsheet, Settings, ClipboardList, Book, Database, Shield, Cpu } from "lucide-react";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface SidebarProps {
  className?: string;
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export function Sidebar({ className, onNavigate, currentPage = "dashboard" }: SidebarProps) {
  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className={cn("flex h-full w-60 flex-col bg-sidebar text-sidebar-foreground", className)}>
      <div className="flex h-14 items-center px-4">
        <h2 className="flex items-center gap-2 text-sidebar-foreground">
          <HardDrive className="h-5 w-5" />
          <span>IT運用管理</span>
        </h2>
      </div>
      <Separator className="bg-sidebar-border" />
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <Button 
            variant={currentPage === "dashboard" ? "secondary" : "ghost"} 
            className="justify-start gap-2"
            onClick={() => handleNavigate("dashboard")}
          >
            <Home className="h-4 w-4" />
            ダッシュボード
          </Button>
          <Button 
            variant={currentPage === "incidents" ? "secondary" : "ghost"} 
            className="justify-start gap-2"
            onClick={() => handleNavigate("incidents")}
          >
            <AlertCircle className="h-4 w-4" />
            インシデント
          </Button>
          <Button 
            variant={currentPage === "problems" ? "secondary" : "ghost"}
            className="justify-start gap-2"
            onClick={() => handleNavigate("problems")}
          >
            <Wrench className="h-4 w-4" />
            問題管理
          </Button>
          <Button 
            variant={currentPage === "changes" ? "secondary" : "ghost"}
            className="justify-start gap-2"
            onClick={() => handleNavigate("changes")}
          >
            <ClipboardList className="h-4 w-4" />
            変更管理
          </Button>
          <Button 
            variant={currentPage === "configuration" ? "secondary" : "ghost"}
            className="justify-start gap-2"
            onClick={() => handleNavigate("configuration")}
          >
            <Database className="h-4 w-4" />
            構成管理
          </Button>
          <Button 
            variant={currentPage === "security" ? "secondary" : "ghost"}
            className="justify-start gap-2"
            onClick={() => handleNavigate("security")}
          >
            <Shield className="h-4 w-4" />
            セキュリティ管理
          </Button>
          <Button 
            variant={currentPage === "capacity" ? "secondary" : "ghost"}
            className="justify-start gap-2"
            onClick={() => handleNavigate("capacity")}
          >
            <Cpu className="h-4 w-4" />
            キャパシティ管理
          </Button>
          <Button 
            variant={currentPage === "sla" ? "secondary" : "ghost"}
            className="justify-start gap-2"
            onClick={() => handleNavigate("sla")}
          >
            <FileSpreadsheet className="h-4 w-4" />
            SLA管理
          </Button>
          <Button 
            variant={currentPage === "knowledge" ? "secondary" : "ghost"}
            className="justify-start gap-2"
            onClick={() => handleNavigate("knowledge")}
          >
            <Book className="h-4 w-4" />
            ナレッジベース
          </Button>
          <Button 
            variant={currentPage === "service-catalog" ? "secondary" : "ghost"}
            className="justify-start gap-2"
            onClick={() => handleNavigate("service-catalog")}
          >
            <ClipboardList className="h-4 w-4" />
            サービスカタログ
          </Button>
          <Button 
            variant={currentPage === "reports" ? "secondary" : "ghost"}
            className="justify-start gap-2"
            onClick={() => handleNavigate("reports")}
          >
            <BarChart3 className="h-4 w-4" />
            レポート
          </Button>
        </nav>
      </div>
      <Separator className="bg-sidebar-border" />
      <div className="p-2">
        <Button 
          variant={currentPage === "settings" ? "secondary" : "ghost"} 
          className="w-full justify-start gap-2"
          onClick={() => handleNavigate("settings")}
        >
          <Settings className="h-4 w-4" />
          設定
        </Button>
      </div>
    </div>
  );
}