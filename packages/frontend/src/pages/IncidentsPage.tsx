import React from 'react';
// # 修正ポイント: IncidentsTable コンポーネントをインポート
import { IncidentsTable } from '../components/incidents/IncidentsTable'; // 修正ポイント: パスを新ディレクトリ構成に合わせて修正

const IncidentsPage: React.FC = () => (
  <div className="container mx-auto py-10">
    {' '}
    {/* # 修正ポイント: スタイルを追加 */}
    <h1 className="text-3xl font-bold mb-6">インシデント一覧</h1>
    {' '}
    {/* # 修正ポイント: スタイルを追加 */}
    {/* IncidentsTable コンポーネントをここに配置 */}
    <IncidentsTable />
    {' '}
    {/* # 修正ポイント: IncidentsTable コンポーネントを呼び出し */}
  </div>
);

export default IncidentsPage;
