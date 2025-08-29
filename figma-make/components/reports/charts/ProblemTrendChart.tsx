import { useState, useEffect } from 'react';
import { Line, LineChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Area, ComposedChart } from 'recharts';

// サンプルデータ
const data = [
  { month: '2024-10', new: 14, resolved: 10, open: 21 },
  { month: '2024-11', new: 12, resolved: 13, open: 20 },
  { month: '2024-12', new: 15, resolved: 12, open: 23 },
  { month: '2025-01', new: 18, resolved: 15, open: 26 },
  { month: '2025-02', new: 14, resolved: 17, open: 23 },
  { month: '2025-03', new: 12, resolved: 19, open: 16 },
  { month: '2025-04', new: 10, resolved: 10, open: 16 },
];

// 月名の取得
const formatMonth = (month: string) => {
  const date = new Date(month);
  return date.toLocaleDateString('ja-JP', { month: 'short' });
};

export function ProblemTrendChart() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // ウィンドウサイズの変更を監視
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // モバイル表示用のデータの絞り込み
  const displayData = screenWidth < 640 ? data.slice(data.length - 5) : data;

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={displayData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
          <XAxis 
            dataKey="month" 
            tickFormatter={formatMonth}
            style={{ fontSize: '0.75rem' }} 
          />
          <YAxis 
            style={{ fontSize: '0.75rem' }} 
            label={{ 
              value: '件数', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: '0.75rem' }
            }} 
          />
          <Tooltip 
            formatter={(value) => [`${value}件`, '']}
            labelFormatter={(month) => `${formatMonth(month)}月`}
          />
          <Legend />
          <Area 
            name="未解決の問題" 
            type="monotone" 
            dataKey="open" 
            fill="var(--chart-3)" 
            stroke="var(--chart-3)" 
            fillOpacity={0.3}
          />
          <Line 
            name="新規問題" 
            type="monotone" 
            dataKey="new" 
            stroke="var(--chart-1)" 
            strokeWidth={2} 
            dot={{ r: 4 }} 
          />
          <Line 
            name="解決済み問題" 
            type="monotone" 
            dataKey="resolved" 
            stroke="var(--chart-4)" 
            strokeWidth={2} 
            dot={{ r: 4 }} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}