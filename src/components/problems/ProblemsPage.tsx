import { useState } from "react";
import { ProblemsTable } from "./ProblemsTable";
import { ProblemDetail } from "./ProblemDetail";

export function ProblemsPage() {
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  
  return (
    <div className="space-y-4 p-4">
      {viewMode === "list" ? (
        <>
          <div>
            <h1>問題管理</h1>
            <p className="text-muted-foreground">
              ITILガイドラインに基づいた問題の根本原因分析と恒久的解決策の管理
            </p>
          </div>
          <ProblemsTable />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setViewMode("detail")}>
              詳細を表示（デモ用）
            </Button>
          </div>
        </>
      ) : (
        <ProblemDetail onBack={() => setViewMode("list")} />
      )}
    </div>
  );
}

// Buttonコンポーネントが必要なため、ここでインポート
import { Button } from "../ui/button";