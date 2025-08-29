import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// インシデント傾向のサンプルデータ
const data = [
  { name: "5/4", critical: 2, high: 5, medium: 8, low: 12 },
  { name: "5/5", critical: 1, high: 6, medium: 10, low: 9 },
  { name: "5/6", critical: 3, high: 4, medium: 7, low: 8 },
  { name: "5/7", critical: 0, high: 2, medium: 5, low: 10 },
  { name: "5/8", critical: 2, high: 3, medium: 6, low: 11 },
  { name: "5/9", critical: 1, high: 5, medium: 8, low: 9 },
  { name: "5/10", critical: 0, high: 2, medium: 4, low: 7 },
];

export function IncidentTrendChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>インシデント傾向（過去7日間）</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="name" 
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--card-foreground)",
              }}
              formatter={(value, name) => {
                const nameMap: Record<string, string> = {
                  'critical': '緊急',
                  'high': '高',
                  'medium': '中',
                  'low': '低'
                };
                return [value, nameMap[name] || name];
              }}
            />
            <Bar name="緊急" dataKey="critical" fill="var(--destructive)" stackId="a" />
            <Bar name="高" dataKey="high" fill="var(--chart-1)" stackId="a" />
            <Bar name="中" dataKey="medium" fill="var(--chart-2)" stackId="a" />
            <Bar name="低" dataKey="low" fill="var(--chart-3)" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}