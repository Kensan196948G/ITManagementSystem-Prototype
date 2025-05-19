import { useState, useEffect } from 'react';
import { Line, LineChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

// サンプルデータ
const data = [
  { month: '2024-10', compliance: 91.2, target: 95 },
  { month: '2024-11', compliance: 93.5, target: 95 },
  { month: '2024-12', compliance: 92.8, target: 95 },
  { month: '2025-01', compliance: 94.1, target: 95 },
  { month: '2025-02', compliance: 93.2, target: 95 },
  { month: '2025-03', compliance: 95.5, target: 95 },
  { month: '2025-04', compliance: 93.8, target: 95 },
];

// 月名の取得
const formatMonth = (month: string) => {
  const date = new Date(month);
  return date.toLocaleDateString('ja-JP', { month: 'short' });
};

export function SLAComplianceChart() {
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
        <LineChart
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
            domain={[80, 100]} 
            style={{ fontSize: '0.75rem' }} 
            label={{ 
              value: '遵守率 (%)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: '0.75rem' }
            }} 
          />
          <Tooltip 
            formatter={(value) => [`${value}%`, '']}
            labelFormatter={(month) => `${formatMonth(month)}月`}
          />
          <Legend />
          <ReferenceLine y={95} stroke="var(--destructive)" strokeDasharray="5 5" />
          <Line 
            name="SLA遵守率" 
            type="monotone" 
            dataKey="compliance" 
            stroke="var(--chart-1)" 
            strokeWidth={2} 
            dot={{ r: 4 }} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}