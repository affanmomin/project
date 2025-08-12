import { MetricsCard } from "@/components/common/metrics-card";
import { formatNumber } from "@/lib/utils";
import { CompetitorData } from "@/types";
import { 
  BarChart3, 
  TrendingDown, 
  MessageSquare, 
  Repeat
} from "lucide-react";

interface SummaryMetricsProps {
  competitors: CompetitorData[];
  className?: string;
}

export function SummaryMetrics({ competitors, className }: SummaryMetricsProps) {
  // Calculate total mentions
  const totalMentions = competitors.reduce(
    (sum, competitor) => sum + competitor.totalMentions,
    0
  );
  
  // Calculate average negative sentiment
  const avgNegativeSentiment = competitors.length > 0
    ? competitors.reduce(
        (sum, competitor) => sum + competitor.negativeSentiment,
        0
      ) / competitors.length
    : 0;
  
  // Count total trending complaints
  const totalComplaints = competitors.reduce(
    (sum, competitor) => sum + competitor.trendingComplaints.length,
    0
  );
  
  // Count total alternatives mentioned
  const totalAlternatives = competitors.reduce(
    (sum, competitor) => sum + competitor.alternativesMentioned.length,
    0
  );

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Mentions"
          value={formatNumber(totalMentions)}
          icon={MessageSquare}
          change={12}
          trend="positive"
          description="last month"
        />
        <MetricsCard
          title="Negative Sentiment"
          value={`${(avgNegativeSentiment * 100).toFixed(0)}%`}
          icon={TrendingDown}
          change={-5}
          trend="negative"
          description="last month"
        />
        <MetricsCard
          title="Recurring Complaints"
          value={totalComplaints}
          icon={BarChart3}
          change={8}
          trend="negative"
          description="last month"
        />
        <MetricsCard
          title="Alternatives Mentioned"
          value={totalAlternatives}
          icon={Repeat}
          change={15}
          trend="positive"
          description="last month"
        />
      </div>
    </div>
  );
}