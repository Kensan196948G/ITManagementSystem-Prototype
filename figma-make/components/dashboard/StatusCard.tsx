import { cn } from "../ui/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface StatusCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatusCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
}: StatusCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && trendValue && (
          <div className={cn(
            "mt-1 text-xs",
            trend === "up" && "text-green-500",
            trend === "down" && "text-red-500",
          )}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}