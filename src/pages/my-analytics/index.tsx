import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  AlertCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

// Import all the dashboard components we need to reuse
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

// Platform configuration
const PLATFORM_CONFIG = [
  {
    id: "14cd087d-b4c2-4356-ae81-6cbec3c8acbf",
    name: "Twitter",
    icon: Twitter,
    color: "text-blue-500",
    placeholder: "Enter your Twitter handle (without @)",
  },
  {
    id: "ddb82018-1361-428d-bcde-b0e4517ed28d",
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-700",
    placeholder: "Enter your LinkedIn profile/company name",
  },
  {
    id: "348977d6-18c5-4ba8-bbf6-3774d7ed6a30",
    name: "Website",
    icon: Globe,
    color: "text-green-600",
    placeholder: "Enter your website domain",
  },
  {
    id: "06ccac39-70bc-43ae-bfca-37590669e9e0",
    name: "Google Maps",
    icon: MapPin,
    color: "text-red-500",
    placeholder: "Enter your business name on Google Maps",
  },
  {
    id: "feebc6ba-ea7f-4414-a111-fa15962eb03e",
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

  // Modal state for adding more platforms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPlatformUsernames, setModalPlatformUsernames] = useState<
    Record<string, string>
  >({});
  const [isAddingPlatforms, setIsAddingPlatforms] = useState(false);

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

  // Handle adding more platforms to existing competitor
  const handleAddMorePlatforms = async () => {
    if (!userCompanyId || !user?.id) {
      toast({
        title: "Error",
        description: "Missing company or user information",
        variant: "destructive",
      });
      return;
    }

    // Get platforms to add (those with usernames that aren't already connected)
    const platformsToAdd = PLATFORM_CONFIG.filter(
      (platform) =>
        modalPlatformUsernames[platform.id]?.trim() &&
        !connectedPlatforms.some((p) => p.id === platform.id)
    ).map((platform) => ({
      source_id: platform.id,
      username: modalPlatformUsernames[platform.id].trim(),
    }));

    if (platformsToAdd.length === 0) {
      toast({
        title: "No platforms to add",
        description:
          "Please enter usernames for new platforms you want to connect.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingPlatforms(true);

    try {
      const response = await apiClient.addCompetitorSources(
        userCompanyId,
        user.id,
        platformsToAdd
      );

      if (response.success) {
        // Update connected platforms with newly added ones
        const newConnectedPlatforms: ConnectedPlatform[] = platformsToAdd.map(
          (platform) => {
            const config = PLATFORM_CONFIG.find(
              (p) => p.id === platform.source_id
            );
            return {
              id: platform.source_id,
              name: config?.name || platform.source_id,
              username: platform.username,
              status: "connected" as const,
              lastSync: new Date().toISOString(),
            };
          }
        );

        setConnectedPlatforms((prev) => [...prev, ...newConnectedPlatforms]);

        // Clear modal form
        setModalPlatformUsernames({});
        setIsModalOpen(false);

        // Refresh analytics data
        await fetchAnalyticsDataWithCompetitorId(userCompanyId);

        toast({
          title: "Platforms Connected",
          description: `Successfully connected ${platformsToAdd.length} new platform(s). ${
            response.analysis
              ? `Scraped ${response.analysis.new_posts_scraped} new posts.`
              : ""
          }`,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add platforms";
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAddingPlatforms(false);
    }
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

  // Helper function to check if card has data
  const hasCardData = (card: CardResponse | undefined): boolean => {
    if (!card || !card.data) return false;
    
    if (Array.isArray(card.data)) {
      return card.data.length > 0;
    }
    
    // For number type cards, check if value exists and is not null/undefined
    return card.data !== null && card.data !== undefined;
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

  // Show processing state when user has connected platforms but analytics data is still being processed
  if (
    userCompanyId &&
    connectedPlatforms.length > 0 &&
    (!hasAnalytics || dashboardData.length === 0)
  ) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Processing Your Data
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're analyzing your connected platforms and gathering insights.
              This usually takes a few minutes.
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Connected Platforms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {connectedPlatforms.map((platform) => {
                const config = PLATFORM_CONFIG.find(
                  (p) => p.id === platform.id
                );
                const IconComponent = config?.icon || Globe;
                return (
                  <div key={platform.id} className="flex items-center gap-3">
                    <IconComponent
                      className={`w-4 h-4 ${config?.color || "text-gray-500"}`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{platform.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {platform.username}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700"
                    >
                      Processing...
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="mt-4 text-center">
            <Button
              onClick={() => fetchAnalyticsDataWithCompetitorId(userCompanyId!)}
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "Check Again"}
            </Button>
          </div>
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
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Manage Connections</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Connect More Platforms
                </DialogTitle>
                <DialogDescription>
                  Add more social media accounts and platforms to get
                  comprehensive analytics across all your channels.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {PLATFORM_CONFIG.map((platform) => {
                  const IconComponent = platform.icon;
                  const isAlreadyConnected = connectedPlatforms.some(
                    (p) => p.id === platform.id
                  );

                  if (isAlreadyConnected) {
                    const connectedPlatform = connectedPlatforms.find(
                      (p) => p.id === platform.id
                    );
                    return (
                      <div
                        key={platform.id}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <IconComponent
                          className={`w-5 h-5 ${platform.color}`}
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">
                            {platform.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Connected as: {connectedPlatform?.username}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-green-50 text-green-700"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={platform.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <IconComponent className={`w-5 h-5 ${platform.color}`} />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{platform.name}</h3>
                        <Input
                          placeholder={platform.placeholder}
                          value={modalPlatformUsernames[platform.id] || ""}
                          onChange={(e) =>
                            setModalPlatformUsernames((prev) => ({
                              ...prev,
                              [platform.id]: e.target.value,
                            }))
                          }
                          className="mt-2"
                          disabled={isAddingPlatforms}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={handleAddMorePlatforms}
                  disabled={
                    isAddingPlatforms ||
                    !Object.values(modalPlatformUsernames).some((v) =>
                      v?.trim()
                    )
                  }
                  className="flex-1"
                >
                  {isAddingPlatforms
                    ? "Connecting..."
                    : "Connect Selected Platforms"}
                </Button>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                    message="No mention trends available" 
                    icon={TrendingUp}
                    description="Mention trends will appear here once data is collected from your connected platforms."
                  />
                )}
              </div>
              <div>
                {(() => {
                  const featuresData = getFeaturesData();
                  console.log("Features data:", featuresData);
                  return hasCardData(featuresData) ? (
                    <TopFeatures data={featuresData} />
                  ) : (
                    <NoData 
                      message="No features data available" 
                      icon={BarChart3}
                      description="Top features mentioned about your brand will be displayed here."
                      height="300px"
                    />
                  );
                })()}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div>
                {(() => {
                  const complaintsData = getComplaintsData();
                  console.log("Complaints data:", complaintsData);
                  return hasCardData(complaintsData) ? (
                    <TopComplaints data={complaintsData} />
                  ) : (
                    <NoData 
                      message="No complaints data available" 
                      icon={AlertCircle}
                      description="Customer complaints and feedback about your brand will appear here."
                      height="300px"
                    />
                  );
                })()}
              </div>
              <div>
                {(() => {
                  const alternativesData = getAlternativesData();
                  console.log("Alternatives data:", alternativesData);
                  return hasCardData(alternativesData) ? (
                    <TopAlternatives data={alternativesData} />
                  ) : (
                    <NoData 
                      message="No alternatives data available" 
                      icon={BarChart3}
                      description="Alternative brands mentioned by users will be shown here."
                      height="300px"
                    />
                  );
                })()}
              </div>
              <div>
                {(() => {
                  const leadsData = getLeadsData();
                  console.log("Leads data:", leadsData);
                  return hasCardData(leadsData) ? (
                    <RecentLeads data={leadsData} />
                  ) : (
                    <NoData 
                      message="No leads data available" 
                      icon={Users}
                      description="Potential customers and leads will be listed here once identified."
                      height="300px"
                    />
                  );
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
