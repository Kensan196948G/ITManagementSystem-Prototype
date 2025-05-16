import { useState, useEffect } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

// サンプルデータ
const data = [
  { name: '最優先', firstResponse: 0.5, resolution: 3.2 },
  { name: '高', firstResponse: 0.8, resolution: 5.4 },
  { name: '中', firstResponse: 1.3, resolution: 8.7 },
  { name: '低', firstResponse: 2.5, resolution: 24.1 },
];

export function ResolutionTimeChart() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // ウィンドウサイズの変更を監視
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
          <XAxis 
            dataKey="name" 
            style={{ fontSize: '0.75rem' }} 
          />
          <YAxis 
            style={{ fontSize: '0.75rem' }} 
            label={{ 
              value: '時間', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: '0.75rem' }
            }} 
          />
          <Tooltip
            formatter={(value) => [`${value}時間`, '']}
            labelFormatter={(name) => `優先度: ${name}`}
          />
          <Legend />
          <Bar 
            name="初回応答時間" 
            dataKey="firstResponse" 
            fill="var(--chart-2)" 
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            name="解決時間" 
            dataKey="resolution" 
            fill="var(--chart-1)" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}