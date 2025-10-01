import { SummaryMetrics } from "@/components/dashboard/summary-metrics";
import { TopComplaints } from "@/components/dashboard/top-complaints";
import { TopFeatures } from "@/components/dashboard/top-features";
import { TopAlternatives } from "@/components/dashboard/top-alternatives";
import { RecentLeads } from "@/components/dashboard/recent-leads";
import { SentimentChart } from "@/components/common/sentiment-chart";
import { apiClient } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  TrendingUp,
  Users,
} from "lucide-react";
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

// Enhanced NoData component with better UI
const NoData = ({ 
  message = "No data available", 
  icon: Icon = AlertCircle,
  description,
  height = "200px" 
}: { 
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  height?: string;
}) => (
  <div 
    className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50" 
    style={{ height }}
  >
    <div className="flex flex-col items-center space-y-3 text-center">
      <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {message}
        </p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
            {description}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<CardResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const user = useAuth();

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

  // Helper function to check if card has data
  const hasCardData = (card: CardResponse | undefined): boolean => {
    if (!card || !card.data) return false;
    
    if (Array.isArray(card.data)) {
      return card.data.length > 0;
    }
    
    // For number type cards, check if value exists and is not null/undefined
    return card.data !== null && card.data !== undefined;
  };

  // Get metrics data
  const metricsData = {
    totalMentions: getCardData<MetricCardResponse>("total-complaints", "number"),
    negativeSentiment: getCardData<MetricCardResponse>(
      "total-features-identified",
      "number"
    ),
    recurringComplaints: getCardData<MetricCardResponse>(
      "leads-identified",
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

  // Get card data for components
  const featuresData = getCardData<FeatureCardResponse>("top-features-short", "bar");
  const complaintsData = getCardData<ComplaintCardResponse>("top-complaints-short", "bar");
  const alternativesData = getCardData<AlternativeCardResponse>("top-alternatives-short", "bar");
  const leadsData = getCardData<LeadCardResponse>("recent-switching-leads", "table");

  return (
    <div className="space-y-6">
      <SummaryMetrics metrics={metricsData} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {hasCardData(complaintTrend) ? (
            <SentimentChart
              data={sentimentSeries}
              title={complaintTrend?.title || "Complaint Trend"}
              description={
                complaintTrend?.description || "Complaint trend over time"
              }
            />
          ) : (
            <NoData 
              message="No complaint trend data available" 
              icon={TrendingUp}
              description="Complaint trends will appear here once customer feedback data is collected."
            />
          )}
        </div>
        <div>
          {hasCardData(featuresData) ? (
            <TopFeatures data={featuresData} />
          ) : (
            <NoData 
              message="No features data available" 
              icon={BarChart3}
              description="Top product features mentioned by customers will be displayed here."
              height="300px"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div>
          {hasCardData(complaintsData) ? (
            <TopComplaints data={complaintsData} />
          ) : (
            <NoData 
              message="No complaints data available" 
              icon={AlertCircle}
              description="Customer complaints and issues will appear here once data is collected."
              height="300px"
            />
          )}
        </div>
        <div>
          {hasCardData(alternativesData) ? (
            <TopAlternatives data={alternativesData} />
          ) : (
            <NoData 
              message="No alternatives data available" 
              icon={BarChart3}
              description="Alternative products mentioned by customers will be shown here."
              height="300px"
            />
          )}
        </div>
        <div>
          {hasCardData(leadsData) ? (
            <RecentLeads data={leadsData} />
          ) : (
            <NoData 
              message="No leads data available" 
              icon={Users}
              description="Recent switching leads and potential customers will be listed here."
              height="300px"
            />
          )}
        </div>
      </div>
    </div>
  );
}
