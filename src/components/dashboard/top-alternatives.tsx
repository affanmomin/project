import { Card } from "@/components/common/card";
import { useAppStore } from "@/lib/store";
import { AlternativeMention } from "@/types";
import { useMemo } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopAlternatives() {
  const { competitors } = useAppStore();
  
  // Combine and count all alternatives mentioned
  const alternatives = useMemo(() => {
    const allAlternatives: Record<string, number> = {};
    
    competitors.forEach((competitor) => {
      competitor.alternativesMentioned.forEach((alt) => {
        if (allAlternatives[alt.name]) {
          allAlternatives[alt.name] += alt.count;
        } else {
          allAlternatives[alt.name] = alt.count;
        }
      });
    });
    
    const sortedAlternatives: AlternativeMention[] = Object.entries(allAlternatives)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return sortedAlternatives;
  }, [competitors]);
  
  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-warning" />;
      case 1:
        return <Medal className="h-5 w-5 text-chart-3" />;
      case 2:
        return <Award className="h-5 w-5 text-chart-2" />;
      default:
        return null;
    }
  };

  return (
    <Card 
      title="Top Alternatives"
      description="Most mentioned competitor alternatives"
      contentClassName="space-y-4"
    >
      {alternatives.map((alternative, index) => (
        <div 
          key={alternative.name}
          className={cn(
            "flex items-center justify-between p-3 rounded-md",
            index === 0 ? "bg-warning/10 border border-warning/20" : "",
            index === 1 ? "bg-chart-3/10 border border-chart-3/20" : "",
            index === 2 ? "bg-chart-2/10 border border-chart-2/20" : "",
            index > 2 ? "bg-muted/50" : ""
          )}
        >
          <div className="flex items-center gap-x-3">
            {getIcon(index)}
            <span className={cn(
              "font-medium",
              index === 0 ? "text-warning" : "",
              index === 1 ? "text-chart-3" : "",
              index === 2 ? "text-chart-2" : ""
            )}>
              {alternative.name}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {alternative.count} mentions
          </span>
        </div>
      ))}
    </Card>
  );
}