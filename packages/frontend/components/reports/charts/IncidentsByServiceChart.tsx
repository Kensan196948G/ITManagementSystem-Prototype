import { useState, useEffect } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// サンプルデータ
const data = [
  { name: 'Microsoft 365', value: 45 },
  { name: 'Entra ID', value: 28 },
  { name: 'Teams', value: 23 },
  { name: 'SharePoint', value: 17 },
  { name: '社内Webアプリ', value: 14 },
  { name: 'Exchange', value: 12 },
  { name: 'DeskNet\'s', value: 10 },
  { name: 'データベース', value: 8 },
];

// 色の配列
const colors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
];

export function IncidentsByServiceChart() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // ウィンドウサイズの変更を監視
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // モバイル表示用のデータの絞り込み
  const displayData = screenWidth < 640 ? data.slice(0, 5) : data;

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={displayData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
        >
          <XAxis type="number" />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={60}
            style={{ fontSize: '0.75rem' }}
          />
          <Tooltip
            formatter={(value) => [`${value}件`, 'インシデント数']}
            labelFormatter={(name) => `サービス: ${name}`}
          />
          <Bar dataKey="value" radius={[4, 4, 4, 4]}>
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}