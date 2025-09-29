import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  BarChart3,
  Twitter,
  Linkedin,
  Globe,
  MapPin,
  Smartphone,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

// Import all the dashboard components we need to reuse
import { SummaryMetrics } from "@/components/dashboard/summary-metrics";
import { TopComplaints } from "@/components/dashboard/top-complaints";
import { TopFeatures } from "@/components/dashboard/top-features";
import { TopAlternatives } from "@/components/dashboard/top-alternatives";
import { RecentLeads } from "@/components/dashboard/recent-leads";
import { SentimentChart } from "@/components/common/sentiment-chart";
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

// Platform configuration
const PLATFORM_CONFIG = [
  {
    id: "5d53c057-6e63-47c6-9301-192a3b9fa1d4",
    name: "Twitter",
    icon: Twitter,
    color: "text-blue-500",
    placeholder: "Enter your Twitter handle (without @)",
  },
  {
    id: "4a267045-dbfc-432c-96a5-17a9da542248",
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-700",
    placeholder: "Enter your LinkedIn profile/company name",
  },
  {
    id: "da6acd0d-7b5e-4aec-8d0c-9126220a8341",
    name: "Website",
    icon: Globe,
    color: "text-green-600",
    placeholder: "Enter your website domain",
  },
  {
    id: "8e7857f1-d153-4470-bd6a-cf4ad79bb8fe",
    name: "Google Maps",
    icon: MapPin,
    color: "text-red-500",
    placeholder: "Enter your business name on Google Maps",
  },
  {
    id: "4ee3988d-70a4-4dd4-8708-5441de698a38",
    name: "Google Play Store",
    icon: Smartphone,
    color: "text-green-500",
    placeholder: "Enter your app name on Play Store",
  },
];

interface ConnectedPlatform {
  id: string;
  name: string;
  username: string;
  status: "connected" | "pending" | "error";
  lastSync?: string;
}

export default function SelfAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Platform connection state
  const [connectedPlatforms, setConnectedPlatforms] = useState<
    ConnectedPlatform[]
  >([]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [platformUsernames, setPlatformUsernames] = useState<
    Record<string, string>
  >({});

  // Analytics data state (same as dashboard)
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<CardResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalytics, setHasAnalytics] = useState(false);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);

  useEffect(() => {
    // Check if user already has connected platforms/analytics data
    console.log("useEffect triggered, user:", user);
    if (user?.id) {
      console.log("User found, calling checkExistingAnalytics");
      checkExistingAnalytics();
    } else {
      console.log("No user found, setting isCheckingExisting to false");
      setIsCheckingExisting(false);
    }
  }, [user]);

  const checkExistingAnalytics = async () => {
    if (!user?.id) {
      console.log("No user ID found, skipping check");
      setIsCheckingExisting(false);
      return;
    }

    console.log("Starting checkExistingAnalytics for user:", user.id);
    setIsCheckingExisting(true);
    try {
      // First check if user has any existing company data
      console.log("Calling getUserCompany API...");
      const userCompanyResponse = await apiClient.getUserCompany(user.id);
      console.log("getUserCompany response:", userCompanyResponse);

      if (userCompanyResponse.success && userCompanyResponse.data.length > 0) {
        const userCompany = userCompanyResponse.data[0];
        console.log("Found user company:", userCompany);
        setUserCompanyId(userCompany.competitor_id);

        // Convert sources to connected platforms
        const connectedPlatformsFromAPI: ConnectedPlatform[] =
          userCompany.sources.map((source) => {
            const platformConfig = PLATFORM_CONFIG.find(
              (p) => p.id === source.source_id
            );
            return {
              id: source.source_id,
              name: platformConfig?.name || source.platform,
              username: source.username,
              status: source.enabled
                ? ("connected" as const)
                : ("error" as const),
              lastSync: source.last_scraped_at || source.source_created_at,
            };
          });

        console.log("Connected platforms from API:", connectedPlatformsFromAPI);
        setConnectedPlatforms(connectedPlatformsFromAPI);

        // If we have connected platforms, try to fetch analytics data
        if (connectedPlatformsFromAPI.length > 0) {
          console.log(
            "Fetching analytics data with competitor ID:",
            userCompany.competitor_id
          );
          // Call fetchAnalyticsData with the competitor ID directly since state might not be updated yet
          await fetchAnalyticsDataWithCompetitorId(userCompany.competitor_id);
        }
      } else {
        // No existing company data, show connection interface
        console.log("No existing company data found");
        setHasAnalytics(false);
        setConnectedPlatforms([]);
      }
    } catch (err) {
      // If no data found, that's expected for first-time users
      console.log("Error in checkExistingAnalytics:", err);
      setHasAnalytics(false);
      setConnectedPlatforms([]);
    } finally {
      console.log("Finished checkExistingAnalytics");
      setIsCheckingExisting(false);
    }
  };

  const handlePlatformConnect = async (platformId: string) => {
    const username = platformUsernames[platformId];
    if (!username?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid username/identifier",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(platformId);

    try {
      // Find platform config
      const platform = PLATFORM_CONFIG.find((p) => p.id === platformId);
      if (!platform) throw new Error("Platform not found");

      // Add platform as connected (pending state)
      const newPlatform: ConnectedPlatform = {
        id: platformId,
        name: platform.name,
        username: username.trim(),
        status: "pending",
      };

      setConnectedPlatforms((prev) => [...prev, newPlatform]);

      // Call the competitors API with is_user: true
      await apiClient.post("/api/competitors", {
        name: username.trim(),
        user_id: user.id,
        platforms: [{ source_id: platformId, username: username.trim() }],
        is_user: true, // This is the key difference for self-analytics!
      });

      // Update platform status to connected
      setConnectedPlatforms((prev) =>
        prev.map((p) =>
          p.id === platformId
            ? {
                ...p,
                status: "connected" as const,
                lastSync: new Date().toISOString(),
              }
            : p
        )
      );

      // Clear the username field
      setPlatformUsernames((prev) => ({
        ...prev,
        [platformId]: "",
      }));

      // Refresh analytics data
      await fetchAnalyticsData();

      toast({
        title: "Success",
        description: `${platform.name} connected successfully! Analytics data is being processed.`,
      });
    } catch (err) {
      // Update platform status to error
      setConnectedPlatforms((prev) =>
        prev.map((p) =>
          p.id === platformId ? { ...p, status: "error" as const } : p
        )
      );

      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect platform";
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const handleConnectAll = async () => {
    const platformsToConnect = PLATFORM_CONFIG.filter(
      (platform) =>
        platformUsernames[platform.id]?.trim() &&
        !connectedPlatforms.some((p) => p.id === platform.id)
    );

    if (platformsToConnect.length === 0) {
      toast({
        title: "No platforms to connect",
        description:
          "Please enter usernames for the platforms you want to connect.",
        variant: "destructive",
      });
      return;
    }

    for (const platform of platformsToConnect) {
      await handlePlatformConnect(platform.id);
      // Small delay between connections to avoid overwhelming the backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  const fetchAnalyticsData = async () => {
    console.log("user", user);
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // If we have a competitor ID (user's company), use the competitor-specific API
      if (userCompanyId) {
        const response = await apiClient.getCompetitorCards(
          userCompanyId,
          user.id,
          {
            start_date: new Date(new Date().getFullYear(), 0, 1).toISOString(),
            end_date: new Date().toISOString(),
          }
        );

        console.log("Competitor API response:", response);

        // Transform the response object into an array of cards (same logic as [id].tsx)
        const cardsArray: CardResponse[] = response.data
          ? Object.values(response.data)
          : [];
        console.log("Transformed cards array:", cardsArray);

        setDashboardData(cardsArray);
      } else {
        // Fallback to general dashboard cards if no competitor ID
        const response = await apiClient.getDashboardCards(
          {
            start_date: new Date(new Date().getFullYear(), 0, 1).toISOString(),
            end_date: new Date().toISOString(),
          },
          user.id
        );
        setDashboardData(response.data);
      }

      setHasAnalytics(true);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to fetch analytics data with a specific competitor ID
  const fetchAnalyticsDataWithCompetitorId = async (competitorId: string) => {
    console.log(
      "fetchAnalyticsDataWithCompetitorId called with:",
      competitorId
    );
    if (!user?.id) return;

    try {
      setIsLoading(true);

      const response = await apiClient.getCompetitorCards(
        competitorId,
        user.id,
        {
          start_date: new Date(new Date().getFullYear(), 0, 1).toISOString(),
          end_date: new Date().toISOString(),
        }
      );

      console.log("Competitor API response:", response);

      // Transform the response object into an array of cards (same logic as [id].tsx)
      const cardsArray: CardResponse[] = response.data
        ? Object.values(response.data)
        : [];
      console.log("Transformed cards array:", cardsArray);

      setDashboardData(cardsArray);
      setHasAnalytics(true);
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectPlatform = (platformId: string) => {
    setConnectedPlatforms((prev) => prev.filter((p) => p.id !== platformId));
    // TODO: Also call API to remove the connection from backend
  };

  // Helper function to get card data (same logic as [id].tsx)
  const getCardData = <T extends CardResponse>(
    key: string,
    type: "number" | "bar" | "table" | "line"
  ): T | undefined => {
    if (!Array.isArray(dashboardData)) {
      console.warn("dashboardData is not an array:", dashboardData);
      return undefined;
    }
    const card = dashboardData.find((card) => card.key === key);
    if (card?.chartType === type) {
      return card as T;
    }
    return undefined;
  };

  // Prepare analytics data (adapted for competitor-specific queries when userCompanyId exists)
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

  // Handle both regular and competitor-specific trend data
  const complaintTrend = userCompanyId
    ? getCardData<TrendCardResponse>("competitor-complaint-trend", "line")
    : getCardData<TrendCardResponse>("complaint-trend", "line");

  const sentimentSeries: MentionPoint[] = complaintTrend?.data
    ? complaintTrend.data.map((d) => ({
        date: d.date,
        value: Number(d.value),
        sentiment: 0,
      }))
    : [];

  // Get alternatives data (adapted for competitor queries)
  const getAlternativesData = () => {
    const queryKey = userCompanyId
      ? "competitor-top-alternatives-short"
      : "top-alternatives-short";
    return getCardData<AlternativeCardResponse>(queryKey, "bar");
  };

  // Get features data (adapted for competitor queries)
  const getFeaturesData = () => {
    const queryKey = userCompanyId
      ? "competitor-top-features-short"
      : "top-features-short";
    return getCardData<FeatureCardResponse>(queryKey, "bar");
  };

  // Get complaints data (adapted for competitor queries)
  const getComplaintsData = () => {
    const queryKey = userCompanyId
      ? "competitor-top-complaints-short"
      : "top-complaints-short";
    return getCardData<ComplaintCardResponse>(queryKey, "bar");
  };

  // Get leads data (adapted for competitor queries)
  const getLeadsData = () => {
    const queryKey = userCompanyId
      ? "competitor-recent-switching-leads"
      : "recent-switching-leads";
    return getCardData<LeadCardResponse>(queryKey, "table");
  };

  // Show loading state while checking existing data
  if (isCheckingExisting) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p>Checking your connected platforms...</p>
        </div>
      </div>
    );
  }

  // Show analytics dashboard only if we have connected platforms and data
  if (userCompanyId && hasAnalytics && dashboardData.length > 0) {
    // Show analytics dashboard
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Analyze your Brand
            </h1>
            <p className="text-muted-foreground">
              Monitor mentions and sentiment across your connected platforms
            </p>
          </div>
          <Button onClick={() => setHasAnalytics(false)} variant="outline">
            Manage Connections
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          {connectedPlatforms.map((platform) => {
            const config = PLATFORM_CONFIG.find((p) => p.id === platform.id);
            const IconComponent = config?.icon || Globe;

            return (
              <Badge
                key={platform.id}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <IconComponent
                  className={`h-3 w-3 ${config?.color || "text-gray-500"}`}
                />
                {platform.name}: {platform.username}
                {platform.status === "connected" && (
                  <Check className="h-3 w-3 text-green-500" />
                )}
                {platform.status === "error" && (
                  <X className="h-3 w-3 text-red-500" />
                )}
              </Badge>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <p>Loading your analytics data...</p>
          </div>
        ) : error ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-destructive">Error: {error}</p>
          </div>
        ) : (
          <>
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
                {(() => {
                  const featuresData = getFeaturesData();
                  console.log("Features data:", featuresData);
                  return <TopFeatures data={featuresData} />;
                })()}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div>
                {(() => {
                  const complaintsData = getComplaintsData();
                  console.log("Complaints data:", complaintsData);
                  return <TopComplaints data={complaintsData} />;
                })()}
              </div>
              <div>
                {(() => {
                  const alternativesData = getAlternativesData();
                  console.log("Alternatives data:", alternativesData);
                  return <TopAlternatives data={alternativesData} />;
                })()}
              </div>
              <div>
                {(() => {
                  const leadsData = getLeadsData();
                  console.log("Leads data:", leadsData);
                  return <RecentLeads data={leadsData} />;
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Show platform connection interface when no platforms are connected
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Analytics</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            You need to connect at least one platform to start monitoring
            mentions and sentiment. Connect your social media accounts and
            platforms below to get started.
          </p>
          {connectedPlatforms.length === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4 max-w-2xl mx-auto">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Connection Required:</strong> To view your analytics
                dashboard, you must connect at least one platform below.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Connect Your Platforms
            </CardTitle>
            <CardDescription>
              Add your social media accounts and platforms to start monitoring
              mentions and sentiment. You can connect multiple platforms at once
              for comprehensive analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {PLATFORM_CONFIG.map((platform, index) => {
              const IconComponent = platform.icon;
              const isConnected = connectedPlatforms.some(
                (p) => p.id === platform.id
              );
              const isConnectingThis = isConnecting === platform.id;
              const connectedPlatform = connectedPlatforms.find(
                (p) => p.id === platform.id
              );

              return (
                <div key={platform.id}>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <IconComponent className={`w-6 h-6 ${platform.color}`} />
                      <div className="flex-1">
                        <h3 className="font-medium">{platform.name}</h3>
                        {isConnected && connectedPlatform && (
                          <p className="text-sm text-muted-foreground">
                            Connected as: {connectedPlatform.username}
                            {connectedPlatform.status === "pending" &&
                              " (Processing...)"}
                            {connectedPlatform.status === "error" && " (Error)"}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isConnected ? (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={platform.placeholder}
                          value={platformUsernames[platform.id] || ""}
                          onChange={(e) =>
                            setPlatformUsernames((prev) => ({
                              ...prev,
                              [platform.id]: e.target.value,
                            }))
                          }
                          className="w-64"
                          disabled={isConnectingThis}
                        />
                        <Button
                          onClick={() => handlePlatformConnect(platform.id)}
                          disabled={
                            isConnectingThis ||
                            !platformUsernames[platform.id]?.trim()
                          }
                          size="sm"
                        >
                          {isConnectingThis ? "Connecting..." : "Connect"}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {connectedPlatform?.status === "connected" && (
                          <Badge
                            variant="secondary"
                            className="bg-green-50 text-green-700"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                        {connectedPlatform?.status === "pending" && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-50 text-yellow-700"
                          >
                            Processing
                          </Badge>
                        )}
                        {connectedPlatform?.status === "error" && (
                          <Badge
                            variant="secondary"
                            className="bg-red-50 text-red-700"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Error
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisconnectPlatform(platform.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    )}
                  </div>
                  {index < PLATFORM_CONFIG.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              );
            })}

            {/* Connect All Button */}
            {Object.keys(platformUsernames).some((key) =>
              platformUsernames[key]?.trim()
            ) && (
              <div className="pt-4 border-t">
                <Button
                  onClick={handleConnectAll}
                  disabled={isConnecting !== null}
                  className="w-full"
                  variant="outline"
                >
                  {isConnecting
                    ? "Connecting..."
                    : "Connect All Filled Platforms"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  This will connect all platforms where you've entered
                  information
                </p>
              </div>
            )}

            {connectedPlatforms.length > 0 && (
              <div
                className={`${Object.keys(platformUsernames).some((key) => platformUsernames[key]?.trim()) ? "pt-4" : "pt-4 border-t"}`}
              >
                <Button
                  onClick={fetchAnalyticsData}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading Analytics..." : "View My Analytics"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
