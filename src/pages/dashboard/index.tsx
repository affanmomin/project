import { SummaryMetrics } from "@/components/dashboard/summary-metrics";
import { TopComplaints } from "@/components/dashboard/top-complaints";
import { TopFeatures } from "@/components/dashboard/top-features";
import { TopAlternatives } from "@/components/dashboard/top-alternatives";
import { RecentLeads } from "@/components/dashboard/recent-leads";
import { SentimentChart } from "@/components/common/sentiment-chart";
import { apiClient } from "@/lib/api";
import { useEffect, useState } from "react";
import type {
  CardResponse,
  ComplaintCardResponse,
  FeatureCardResponse,
  AlternativeCardResponse,
  LeadCardResponse,
  MetricCardResponse,
  TrendCardResponse,
  MentionPoint,
} from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<CardResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const user = useAuth();
  console.log("Authenticated user:", user);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getDashboardCards({
          // Default to this year for trend
          start_date: new Date(new Date().getFullYear(), 0, 1).toISOString(),
          end_date: new Date().toISOString(),
          
        },user?.user?.id);
        setDashboardData(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch dashboard data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p>Loading dashboard data...</p>
      </div>
    );
  }



  // Helper function to find card data by key with type assertion
  const getCardData = <T extends CardResponse>(
    key: string,
    type: "number" | "bar" | "table"
  ): T | undefined => {
    const card = dashboardData.find((card) => card.key === key);
    if (card?.chartType === type) {
      return card as T;
    }
    return undefined;
  };

  // Get metrics data
  const metricsData = {
    totalMentions: getCardData<MetricCardResponse>("total-mentions", "number"),
    negativeSentiment: getCardData<MetricCardResponse>(
      "negative-sentiment-percentage",
      "number"
    ),
    recurringComplaints: getCardData<MetricCardResponse>(
      "recurring-complaints",
      "number"
    ),
    alternativesMentioned: getCardData<MetricCardResponse>(
      "alternatives-mentioned",
      "number"
    ),
  };

  // Prepare trend data for SentimentChart
  const complaintTrend = dashboardData.find(
    (c) => c.key === "complaint-trend" && c.chartType === "line"
  ) as TrendCardResponse | undefined;

  const sentimentSeries: MentionPoint[] = complaintTrend?.data
    ? complaintTrend.data.map((d) => ({
        date: d.date,
        value: Number(d.value),
        sentiment: 0,
      }))
    : [];

  return (
    <div className="space-y-6">
      <SummaryMetrics metrics={metricsData} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SentimentChart
            data={sentimentSeries}
            title={complaintTrend?.title || "Complaint Trend"}
            description={
              complaintTrend?.description || "Complaint trend over time"
            }
          />
        </div>
        <div>
          <TopFeatures
            data={getCardData<FeatureCardResponse>("top-features", "bar")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div>
          <TopComplaints
            data={getCardData<ComplaintCardResponse>("top-complaints", "bar")}
          />
        </div>
        <div>
          <TopAlternatives
            data={getCardData<AlternativeCardResponse>(
              "top-alternatives",
              "bar"
            )}
          />
        </div>
        <div>
          <RecentLeads
            data={getCardData<LeadCardResponse>(
              "recent-switching-leads",
              "table"
            )}
          />
        </div>
      </div>
    </div>
  );
}
