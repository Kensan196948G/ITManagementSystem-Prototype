import { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { Dashboard } from "./components/dashboard/Dashboard";
import { IncidentsPage } from "./components/incidents/IncidentsPage";
import { ProblemsPage } from "./components/problems/ProblemsPage";
import { ChangesPage } from "./components/changes/ChangesPage";
import { ConfigurationPage } from "./components/configuration/ConfigurationPage";
import { SecurityPage } from "./components/security/SecurityPage";
import { CapacityPage } from "./components/capacity/CapacityPage";
import { SLAPage } from "./components/sla/SLAPage";
import { KnowledgeBasePage } from "./components/knowledge/KnowledgeBasePage";
import { ServiceCatalogPage } from "./components/service-catalog/ServiceCatalogPage";
import { ReportsPage } from "./components/reports/ReportsPage";
import { SettingsPage } from "./components/settings/SettingsPage";
import { Toaster } from "sonner";
import FigmaSamplePage from "./pages/FigmaSamplePage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  // ナビゲーションシステム - 実際のアプリではルーターを使用
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "incidents":
        return <IncidentsPage />;
      case "problems":
        return <ProblemsPage />;
      case "changes":
        return <ChangesPage />;
      case "configuration":
        return <ConfigurationPage />;
      case "security":
        return <SecurityPage />;
      case "capacity":
        return <CapacityPage />;
      case "sla":
        return <SLAPage />;
      case "knowledge":
        return <KnowledgeBasePage />;
      case "service-catalog":
        return <ServiceCatalogPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      case "figma-sample":
        return <FigmaSamplePage />;
      default:
        return <Dashboard />;
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar onNavigate={handleNavigate} currentPage={currentPage} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
      <Toaster position="top-right" closeButton richColors />
    </div>
  );
}