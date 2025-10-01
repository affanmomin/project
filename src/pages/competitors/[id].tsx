import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { SentimentChart } from "@/components/common/sentiment-chart";
import { Card } from "@/components/common/card";
import { TopComplaints } from "@/components/dashboard/top-complaints";
import { TopFeatures } from "@/components/dashboard/top-features";
import { TopAlternatives } from "@/components/dashboard/top-alternatives";
import { RecentLeads } from "@/components/dashboard/recent-leads";
import {
  MessageSquare,
  Globe,
  Calendar,
  Activity,
  Twitter,
  Linkedin,
  MapPin,
  Building,
  ExternalLink,
  Hash,
  FileText,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Users,
  Database,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type {
  CardResponse,
  ComplaintCardResponse,
  FeatureCardResponse,
  AlternativeCardResponse,
  LeadCardResponse,
  TrendCardResponse,
  MentionPoint,
} from "@/types";

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

export default function CompetitorDetails() {
  const { id } = useParams<{ id: string }>();
  const user = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [competitorData, setCompetitorData] = useState<CardResponse[]>([]);
  const [competitorDetails, setCompetitorDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompetitorData = async () => {
      if (!id || !user?.user?.id) return;

      try {
        setIsLoading(true);

        // Fetch both competitor cards and competitor details in parallel
        const [cardsResponse, detailsResponse] = await Promise.all([
          apiClient.getCompetitorCards(id, user.user.id, {
            // Default to this year for trend
            start_date: new Date(new Date().getFullYear(), 0, 1).toISOString(),
            end_date: new Date().toISOString(),
          }),
          apiClient.getCompetitorDetails(id),
        ]);

        console.log("Competitor API response:", cardsResponse);
        console.log("Competitor details response:", detailsResponse);

        // Transform the response object into an array of cards
        const cardsArray: CardResponse[] = cardsResponse.data
          ? Object.values(cardsResponse.data)
          : [];
        console.log("Transformed cards array:", cardsArray);

        setCompetitorData(cardsArray);
        setCompetitorDetails(detailsResponse.data);
      } catch (err) {
        console.error("Failed to fetch competitor data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch competitor data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompetitorData();
  }, [id, user?.user?.id]);

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
        <p>Loading competitor data...</p>
      </div>
    );
  }

  if (!id) {
    return <div>Competitor ID not found in URL</div>;
  }

  // Helper function to find card data by key with type assertion
  const getCardData = <T extends CardResponse>(
    key: string,
    type: "number" | "bar" | "table" | "line"
  ): T | undefined => {
    if (!Array.isArray(competitorData)) {
      console.warn("competitorData is not an array:", competitorData);
      return undefined;
    }
    const card = competitorData.find((card) => card.key === key);
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

  // Get metrics data from API
  // Prepare trend data for SentimentChart
  const complaintTrend = getCardData<TrendCardResponse>(
    "competitor-complaint-trend",
    "line"
  );
  const sentimentSeries: MentionPoint[] = complaintTrend?.data
    ? complaintTrend.data.map((d) => ({
        date: d.date,
        value: Number(d.value),
        sentiment: 0,
      }))
    : [];

  // Function to get platform icon
  const getPlatformIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    switch (platformLower) {
      case "twitter":
        return <Twitter className="h-5 w-5 text-blue-500" />;
      case "linkedin":
        return <Linkedin className="h-5 w-5 text-blue-600" />;
      case "google maps":
        return <MapPin className="h-5 w-5 text-red-500" />;
      case "google business":
        return <Building className="h-5 w-5 text-green-600" />;
      case "website":
        return <ExternalLink className="h-5 w-5 text-purple-500" />;
      case "reddit":
        return <Hash className="h-5 w-5 text-orange-500" />;
      case "medium":
        return <FileText className="h-5 w-5 text-gray-700" />;
      default:
        return <Globe className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 p-8">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white">
                {competitorDetails?.name || `Competitor ${id}`}
              </h1>
              {competitorDetails && (
                <div className="flex items-center space-x-6 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>ID: {competitorDetails.competitor_id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>
                      {competitorDetails.sources?.length || 0} Sources
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Since{" "}
                      {new Date(
                        competitorDetails.created_at
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 -mt-4 opacity-10">
          <MessageSquare className="p-10 h-32 w-32 text-white" />
        </div>
      </div>

      {/* Data Sources Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Data Sources
        </h2>
        {competitorDetails?.sources && competitorDetails.sources.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {competitorDetails.sources.map((source: any, index: number) => (
              <Card key={source.competitor_source_id || index} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getPlatformIcon(source.platform)}
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">
                        {source.platform}
                      </h3>
                      {source.username && (
                        <p className="text-sm text-muted-foreground">
                          @{source.username}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      source.enabled
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {source.enabled ? "Active" : "Inactive"}
                  </div>
                </div>
                {source.last_scraped_at && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Last updated:{" "}
                      {new Date(source.last_scraped_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <NoData 
            message="No data sources configured" 
            icon={Database}
            description="Configure data sources like social media accounts, review platforms, or websites to start collecting competitor insights."
            height="160px"
          />
        )}
      </div>

      {/* Analytics Overview */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Analytics Overview
        </h2>

        {/* Main Chart and Features */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {hasCardData(complaintTrend) ? (
              <SentimentChart
                data={sentimentSeries}
                title={complaintTrend?.title || "Mentions Over Time"}
                description={
                  complaintTrend?.description || "Mentions and sentiment trends"
                }
              />
            ) : (
              <NoData 
                message="No mentions trend data available" 
                icon={TrendingUp}
                description="Mention trends will appear here once data is collected from configured sources."
              />
            )}
          </div>
          <div className="space-y-6">
            {(() => {
              const featuresData = getCardData<FeatureCardResponse>(
                "competitor-top-features-short",
                "bar"
              );
              return hasCardData(featuresData) ? (
                <TopFeatures data={featuresData} />
              ) : (
                <NoData 
                  message="No features data available" 
                  icon={BarChart3}
                  description="Feature mentions and analysis will be displayed here."
                  height="300px"
                />
              );
            })()}
          </div>
        </div>

        {/* Complaints, Alternatives, and Leads */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            {(() => {
              const complaintsData = getCardData<ComplaintCardResponse>(
                "competitor-top-complaints-short",
                "bar"
              );
              return hasCardData(complaintsData) ? (
                <TopComplaints data={complaintsData} />
              ) : (
                <NoData 
                  message="No complaints data available" 
                  icon={AlertCircle}
                  description="Customer complaints and feedback will appear here."
                  height="300px"
                />
              );
            })()}
          </div>
          <div>
            {(() => {
              const alternativesData = getCardData<AlternativeCardResponse>(
                "competitor-top-alternatives-short",
                "bar"
              );
              return hasCardData(alternativesData) ? (
                <TopAlternatives data={alternativesData} />
              ) : (
                <NoData 
                  message="No alternatives data available" 
                  icon={BarChart3}
                  description="Alternative products mentioned by users will be shown here."
                  height="300px"
                />
              );
            })()}
          </div>
          <div>
            {(() => {
              const leadsData = getCardData<LeadCardResponse>(
                "competitor-recent-switching-leads",
                "table"
              );
              return hasCardData(leadsData) ? (
                <RecentLeads data={leadsData} />
              ) : (
                <NoData 
                  message="No leads data available" 
                  icon={Users}
                  description="Recent switching leads and potential customers will be listed here."
                  height="300px"
                />
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
