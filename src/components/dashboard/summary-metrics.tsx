import { MetricsCard } from "@/components/common/metrics-card";
import { MetricCardResponse } from "@/types";
import { BarChart3, TrendingDown, MessageSquare, Repeat } from "lucide-react";

interface SummaryMetricsProps {
  metrics: {
    totalMentions?: MetricCardResponse;
    negativeSentiment?: MetricCardResponse;
    recurringComplaints?: MetricCardResponse;
    alternativesMentioned?: MetricCardResponse;
  };
  className?: string;
}

export function SummaryMetrics({ metrics, className }: SummaryMetricsProps) {
  const getMetricChange = (data: MetricCardResponse | undefined) => {
    if (!data?.data[0]) return 0;
    return parseFloat(data.data[0].pct_change || "0");
  };

  const getMetricValue = (data: MetricCardResponse | undefined) => {
    if (!data?.data[0]) return "0";
    return data.data[0].current_value || data.data[0].current_pct || "0";
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Complaints"
          value={getMetricValue(metrics.totalMentions)}
          icon={MessageSquare}
          change={getMetricChange(metrics.totalMentions)}
          trend={
            getMetricChange(metrics.totalMentions) >= 0
              ? "positive"
              : "negative"
          }
          description="vs previous period"
        />
        <MetricsCard
          title="Total Features"
          value={getMetricValue(metrics.negativeSentiment)}
          icon={TrendingDown}
          change={getMetricChange(metrics.negativeSentiment)}
          trend={
            getMetricChange(metrics.negativeSentiment) <= 0
              ? "positive"
              : "negative"
          }
          description="vs previous period"
        />
        <MetricsCard
          title="Leads Identified"
          value={getMetricValue(metrics.recurringComplaints)}
          icon={BarChart3}
          change={getMetricChange(metrics.recurringComplaints)}
          trend={
            getMetricChange(metrics.recurringComplaints) <= 0
              ? "positive"
              : "negative"
          }
          description="vs previous period"
        />
        <MetricsCard
          title="Alternatives Mentioned"
          value={getMetricValue(metrics.alternativesMentioned)}
          icon={Repeat}
          change={getMetricChange(metrics.alternativesMentioned)}
          trend={
            getMetricChange(metrics.alternativesMentioned) <= 0
              ? "positive"
              : "negative"
          }
          description="vs previous period"
        />
      </div>
    </div>
  );
}
