import { useState } from "react";
import { Sidebar } from "../../figma-make/components/layout/Sidebar";
import { Header } from "../../figma-make/components/layout/Header";
import { Dashboard } from "../../figma-make/components/dashboard/Dashboard";
import { IncidentsPage } from "../../figma-make/components/incidents/IncidentsPage";
import { ProblemsPage } from "../../figma-make/components/problems/ProblemsPage";
import { ChangesPage } from "../../figma-make/components/changes/ChangesPage";
import { ConfigurationPage } from "../../figma-make/components/configuration/ConfigurationPage";
import { SecurityPage } from "../../figma-make/components/security/SecurityPage";
import { CapacityPage } from "../../figma-make/components/capacity/CapacityPage";
import { SLAPage } from "../../figma-make/components/sla/SLAPage";
import { KnowledgeBasePage } from "../../figma-make/components/knowledge/KnowledgeBasePage";
import { ServiceCatalogPage } from "../../figma-make/components/service-catalog/ServiceCatalogPage";
import { ReportsPage } from "../../figma-make/components/reports/ReportsPage";
import { SettingsPage } from "../../figma-make/components/settings/SettingsPage";

// 修正ポイント: Toasterのimportと使用を削除し、まずはUI構成の動作を優先

export const OrchestratorManager = () => {
    const [currentPage, setCurrentPage] = useState("dashboard");

    // ページコンポーネントをcurrentPageに応じて切り替える関数
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
            default:
                return <Dashboard />;
        }
    };

    // Sidebarからのページ遷移イベントを受け取るハンドラ
    const handleNavigate = (page: string) => {
        setCurrentPage(page);
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden">
            <Sidebar onNavigate={handleNavigate} currentPage={currentPage} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto">{renderPage()}</main>
            </div>
        </div>
    );
};