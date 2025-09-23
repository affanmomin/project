import { useAppStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/common/card";
import { Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Settings() {
  const { 
    platforms, 
    notifications, 
    emailDigests, 
    addCompetitor, 
    removeCompetitor, 
    togglePlatform, 
    toggleNotifications, 
    toggleEmailDigests 
  } = useAppStore();
  
  const { user } = useAuth();
  const [newCompetitor, setNewCompetitor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [removingCompetitorId, setRemovingCompetitorId] = useState<string | null>(null);
  const [expandedCompetitors, setExpandedCompetitors] = useState<Set<string>>(new Set());
  const [competitorSources, setCompetitorSources] = useState<Record<string, any[]>>({});
  const [fetchedCompetitors, setFetchedCompetitors] = useState<
    { id: string; name: string; slug: string; created_at: string; user_id: string; competitor_id: string }[]
  >([]);
  const [sources, setSources] = useState<
    { id: string; competitor_id: string; platform: string; enabled: boolean; last_scraped_at: string; created_at: string; competitor_name: string | null; user_id: string | null }[]
  >([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const { toast } = useToast();
  
  // Debug log to see current competitors
  
  const handleAddCompetitor = async () => {
    if (!newCompetitor.trim()) return;
    
    // Check if at least one platform is enabled
    const hasEnabledPlatform = sources.length > 0 
      ? sources.some(source => source.enabled)
      : platforms.length > 0;
    
    if (!hasEnabledPlatform) {
      toast({
        title: "Error",
        description: "Please enable at least one data source platform before adding a competitor.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Get enabled source IDs
      const enabledSourceIds = sources
        .filter(source => source.enabled)
        .map(source => source.id);
      
      const response = await apiClient.addCompetitor(
        newCompetitor.trim(), 
        user?.id, 
        enabledSourceIds
      );
      
      // Update the local store with the response from the API
      addCompetitor({ id: response.data.id, name: response.data.name });
      setFetchedCompetitors(prev => [...prev, response.data]);
      setNewCompetitor("");
      
      // Reset all sources to disabled state
      setSources(prevSources => 
        prevSources.map(source => ({ ...source, enabled: false }))
      );
      
      // Also reset the platforms in the store for backward compatibility
      platforms.forEach(platform => {
        if (platforms.includes(platform)) {
          togglePlatform(platform);
        }
      });
      
      toast({
        title: "Success",
        description: "Competitor added successfully",
      });
    } catch (error) {
      console.error("Error adding competitor:", error);
      toast({
        title: "Error",
        description: "Failed to add competitor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleGetUserCompetitors = async () => {
    try {
      const response = await apiClient.getUserCompetitors(user?.id);
      console.log("Fetched competitors:", response.data);
      setFetchedCompetitors(response.data); // Store the fetched data
    } catch (error) {
      console.error("Error fetching competitors:", error);
    }   
  };

  const handleGetSources = async () => {
    setSourcesLoading(true);
    try {
      const response = await apiClient.getSources();
      console.log("Fetched sources:", response.data);
      setSources(response.data);
    } catch (error) {
      console.error("Error fetching sources:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data sources. Using default platforms.",
        variant: "destructive",
      });
    } finally {
      setSourcesLoading(false);
    }
  };

  const handleToggleSource = async (platform: string, newEnabledState: boolean) => {
    // Find the source for this platform
    const sourceData = sources.find(source => source.platform.toLowerCase() === platform.toLowerCase());
    
    if (!sourceData) {
      // If no source data, fall back to the store toggle
      togglePlatform(platform);
      return;
    }

    try {
      // Update via API
      const response = await apiClient.toggleSource(sourceData.id, newEnabledState);
      
      // Update local sources state with the response
      setSources(prevSources => 
        prevSources.map(source => 
          source.id === sourceData.id 
            ? { ...source, enabled: response.data.enabled }
            : source
        )
      );

      // Also update the store for backward compatibility
      if (newEnabledState && !platforms.includes(platform)) {
        togglePlatform(platform);
      } else if (!newEnabledState && platforms.includes(platform)) {
        togglePlatform(platform);
      }

      toast({
        title: "Success",
        description: `${platform} ${newEnabledState ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error("Error toggling source:", error);
      toast({
        title: "Error",
        description: `Failed to ${newEnabledState ? 'enable' : 'disable'} ${platform}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleRemoveCompetitor = async (competitorId: string) => {
    setRemovingCompetitorId(competitorId);
    try {
      await apiClient.removeCompetitor(competitorId, user?.id);
      console.log("Removing competitor from store:", competitorId); // Debug log
      // Remove from local store
      removeCompetitor(competitorId);
      setFetchedCompetitors(prev => prev.filter(competitor => competitor.competitor_id !== competitorId));

      
      toast({
        title: "Success",
        description: "Competitor removed successfully",
      });
    } catch (error) {
      console.error("Error removing competitor:", error);
      toast({
        title: "Error",
        description: "Failed to remove competitor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRemovingCompetitorId(null);
    }
  };

  const handleToggleAccordion = async (competitorId: string) => {
    const isExpanded = expandedCompetitors.has(competitorId);
    
    if (isExpanded) {
      // Collapse
      setExpandedCompetitors(prev => {
        const newSet = new Set(prev);
        newSet.delete(competitorId);
        return newSet;
      });
    } else {
      // Expand and fetch sources if not already fetched
      setExpandedCompetitors(prev => new Set(prev).add(competitorId));
      
      if (!competitorSources[competitorId]) {
        try {
          const response = await apiClient.getCompetitorSources(competitorId);
          setCompetitorSources(prev => ({
            ...prev,
            [competitorId]: response.data
          }));
        } catch (error) {
          console.error("Error fetching competitor sources:", error);
          toast({
            title: "Error",
            description: "Failed to fetch competitor data sources.",
            variant: "destructive",
          });
        }
      }
    }
  };
  
  // Get unique platforms from sources data, fallback to hardcoded list
  const availablePlatforms = sources.length > 0 
    ? [...new Set(sources.map(source => source.platform))]
    : ["Reddit", "Twitter", "G2", "HackerNews", "ProductHunt"];

  // Add useEffect to fetch competitors and sources on component mount
  useEffect(() => {
    if (user?.id) {
      handleGetUserCompetitors();
    }
    handleGetSources();
  }, [user?.id]);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card
        title="Competitor Keywords"
        description="Add or remove competitors you want to track"
      >
        <div className="space-y-6">
          {/* Competitor Name Input */}
          <div className="space-y-2">
            <Label htmlFor="competitor-input" className="text-sm font-medium">
              Competitor Name
            </Label>
            <div className="relative">
              <Input
                id="competitor-input"
                placeholder="Enter competitor name (e.g., Company XYZ)"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border-2 border-border/50 focus:border-primary transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleAddCompetitor();
                  }
                }}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          {/* Data Sources Section */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                <h4 className="text-sm font-semibold">Data Sources</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Choose which platforms to monitor for competitor mentions and discussions
              </p>
            </div>
            
            {sourcesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span className="text-sm">Loading data sources...</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availablePlatforms.map((platform) => {
                  // Find the source for this platform to get its enabled state
                  const sourceData = sources.find(source => source.platform.toLowerCase() === platform.toLowerCase());
                  const isEnabled = sourceData ? sourceData.enabled : platforms.includes(platform);
                  
                  return (
                    <div
                      key={platform}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
                        isEnabled 
                          ? 'border-primary/20 bg-primary/5 shadow-sm' 
                          : 'border-border/50 bg-background hover:border-border'
                      }`}
                    >
                      <Label 
                        htmlFor={`platform-${platform}`} 
                        className="flex items-center space-x-3 cursor-pointer flex-1"
                      >
                        <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-primary' : 'bg-muted-foreground/40'}`}></div>
                        <span className="capitalize font-medium text-sm">{platform}</span>
                      </Label>
                      <Switch
                        id={`platform-${platform}`}
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleToggleSource(platform, checked)}
                        className="ml-2"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Button Section */}
          <div className="border-t pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                {sources.length > 0 && sources.some(source => source.enabled) 
                  ? `${sources.filter(source => source.enabled).length} data source${sources.filter(source => source.enabled).length > 1 ? 's' : ''} selected`
                  : platforms.length > 0 
                    ? `${platforms.length} platform${platforms.length > 1 ? 's' : ''} selected`
                    : 'No data sources selected'
                }
              </div>
              <Button 
                onClick={handleAddCompetitor}
                disabled={
                  isLoading || 
                  !newCompetitor.trim() || 
                  (sources.length > 0 
                    ? !sources.some(source => source.enabled)
                    : platforms.length === 0
                  )
                }
                className="w-full sm:w-auto px-6 py-2 font-medium"
                size="default"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Competitor
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="Existing Competitors"
        description="Manage your tracked competitors"
      >
        <div className="space-y-3">
          {fetchedCompetitors.length > 0 ? (
            fetchedCompetitors.map((data) => {
              const isExpanded = expandedCompetitors.has(data.competitor_id);
              const sources = competitorSources[data.competitor_id] || [];
              
              return (
                <Collapsible key={data.id} open={isExpanded} onOpenChange={() => handleToggleAccordion(data.competitor_id)}>
                  <div className="p-3 bg-muted/50 rounded-md">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{data.name}</span>
                      <div className="flex items-center space-x-2">
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs px-3 py-1 h-8"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                Hide Platforms
                              </>
                            ) : (
                              <>
                                <ChevronRight className="h-3 w-3 mr-1" />
                                View Platforms
                              </>
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCompetitor(data.competitor_id)}
                          disabled={removingCompetitorId === data.competitor_id}
                        >
                          {removingCompetitorId === data.competitor_id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Collapsible Content */}
                    <CollapsibleContent className="mt-3">
                      <div className="border-t pt-3">
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Data Sources:</h4>
                        {sources.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {sources.map((source, index) => (
                              <div
                                key={source.id || index}
                                className="flex items-center justify-between p-2 bg-background/50 rounded border"
                              >
                                <span className="text-sm capitalize font-medium">{source.platform}</span>
                                {/* <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  source.enabled 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                }`}>
                                </div> */}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-4">
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              <span className="text-sm">Loading data sources...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No competitors added yet.
            </div>
          )}
        </div>
      </Card>
      
      <Card
        title="Notifications"
        description="Configure how you receive updates"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Push Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Receive real-time alerts for important changes
              </div>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={toggleNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-digests">Weekly Email Digests</Label>
              <div className="text-sm text-muted-foreground">
                Get a summary of insights every week
              </div>
            </div>
            <Switch
              id="email-digests"
              checked={emailDigests}
              onCheckedChange={toggleEmailDigests}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}