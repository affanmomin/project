import { Card } from "@/components/common/card";
import { useAppStore } from "@/lib/store";
import { ClusterPainPoint } from "@/types";
import { useMemo } from "react";
import { ClusterTag } from "@/components/common/cluster-tag";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function TopComplaints() {
  const { painPoints } = useAppStore();
  
  // Get top 5 pain points across all competitors
  const topPainPoints = useMemo(() => {
    const sorted = [...painPoints].sort((a, b) => b.count - a.count);
    return sorted.slice(0, 5);
  }, [painPoints]);
  
  // Find max count for relative scaling
  const maxCount = useMemo(() => {
    return topPainPoints.length > 0
      ? topPainPoints[0].count
      : 0;
  }, [topPainPoints]);
  
  // Determine variant based on index/position
  const getVariant = (index: number) => {
    const variants = ["destructive", "warning", "default", "secondary", "success"];
    return variants[index % variants.length] as
      | "destructive"
      | "warning"
      | "default"
      | "secondary"
      | "success";
  };

  return (
    <Card 
      title="Top Complaints"
      description="Most frequent pain points mentioned"
      contentClassName="space-y-5"
    >
      {topPainPoints.map((painPoint, index) => (
        <div key={painPoint.id} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <ClusterTag
              label={painPoint.label}
              count={painPoint.count}
              examples={painPoint.examples}
              variant={getVariant(index)}
            />
            <span className="text-sm text-muted-foreground">
              {painPoint.count} mentions
            </span>
          </div>
          <Progress 
            value={(painPoint.count / maxCount) * 100} 
            className={cn(
              "h-2",
              index === 0 ? "bg-destructive/20" : "",
              index === 1 ? "bg-warning/20" : "",
              index === 2 ? "bg-primary/20" : "",
              index === 3 ? "bg-secondary/50" : "",
              index === 4 ? "bg-success/20" : ""
            )}
            indicatorClassName={cn(
              index === 0 ? "bg-destructive" : "",
              index === 1 ? "bg-warning" : "",
              index === 2 ? "bg-primary" : "",
              index === 3 ? "bg-secondary" : "",
              index === 4 ? "bg-success" : ""
            )}
          />
        </div>
      ))}
    </Card>
  );
}