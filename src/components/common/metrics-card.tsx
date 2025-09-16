import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";

const metricCardVariants = cva("transition-all", {
  variants: {
    trend: {
      positive: "text-success",
      negative: "text-destructive",
      neutral: "text-muted-foreground",
    },
  },
  defaultVariants: {
    trend: "neutral",
  },
});

interface MetricsCardProps extends VariantProps<typeof metricCardVariants> {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  change?: number;
  className?: string;
}

export function MetricsCard({
  title,
  value,
  description,
  icon: Icon,
  change,
  trend,
  className,
}: MetricsCardProps) {
  const showTrend = change !== undefined;

  // Determine trend type from change if not explicitly provided
  const determinedTrend =
    trend ||
    (change && change > 0
      ? "positive"
      : change && change < 0
        ? "negative"
        : "neutral");

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          {showTrend && (
            <div
              className={cn(
                "text-xs font-medium flex items-center",
                metricCardVariants({ trend: determinedTrend })
              )}
            >
              {change > 0 ? "↑" : change < 0 ? "↓" : "→"} {Math.abs(change)}%
              {description && (
                <span className="text-muted-foreground ml-1">
                  vs. {description}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
