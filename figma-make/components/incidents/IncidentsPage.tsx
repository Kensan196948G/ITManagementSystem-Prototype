import { IncidentsTable } from "./IncidentsTable";

export function IncidentsPage() {
  return (
    <div className="space-y-4 p-4">
      <h1>インシデント管理</h1>
      <p className="text-muted-foreground">
        ITILガイドラインに基づいたIT障害のトラッキングと管理
      </p>
      <IncidentsTable />
    </div>
  );
}