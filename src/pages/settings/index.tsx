import { useAppStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/common/card";
import { Trash2, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  const [fetchedCompetitors, setFetchedCompetitors] = useState<
    { id: string; name: string; slug: string; created_at: string; user_id: string }[]
  >([]);
  const { toast } = useToast();
  
  // Debug log to see current competitors
  
  const handleAddCompetitor = async () => {
    if (!newCompetitor.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.addCompetitor(newCompetitor.trim(), user?.id);
      
      console.log("API Response:", response); // Debug log
      console.log("Adding competitor to store:", response.name); // Debug log
      
      // Update the local store with the response from the API
      addCompetitor({ id: response.data.id, name: response.data.name });
      setFetchedCompetitors(prev => [...prev, response.data]);
      setNewCompetitor("");
      
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

  console.log("user id:", user?.id);

  const handleGetUserCompetitors = async () => {
    try {
      const response = await apiClient.getUserCompetitors(user?.id);
      console.log("Fetched competitors:", response.data);
      setFetchedCompetitors(response.data); // Store the fetched data
    } catch (error) {
      console.error("Error fetching competitors:", error);
    }   
  };

  const handleRemoveCompetitor = async (competitorId: string) => {
    try {
      await apiClient.removeCompetitor(competitorId, user?.id);
      
      // Remove from local store
      removeCompetitor(competitorId);
      setFetchedCompetitors(prev => prev.filter(competitor => competitor.id !== competitorId));

      
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
    }
  };
  
  const availablePlatforms = ["Reddit", "Twitter", "G2", "HackerNews", "ProductHunt"];

  // Add useEffect to fetch competitors on component mount
  useEffect(() => {
    if (user?.id) {
      handleGetUserCompetitors();
    }
  }, [user?.id]);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card
        title="Competitor Keywords"
        description="Add or remove competitors you want to track"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add new competitor name..."
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleAddCompetitor();
                }
              }}
            />
            <Button 
              onClick={handleAddCompetitor}
              disabled={isLoading || !newCompetitor.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isLoading ? "Adding..." : "Add"}
            </Button>
          </div>
          
          <div className="space-y-2 mt-4">
            {fetchedCompetitors.length > 0 ? (
              fetchedCompetitors.map((data) => (
                <div
                  key={data.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                >
                  <span>{data.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCompetitor(data.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No competitors added yet.
              </div>
            )}
          </div>
        </div>
      </Card>
      
      <Card
        title="Data Sources"
        description="Select platforms to monitor for mentions"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {availablePlatforms.map((platform) => (
            <div
              key={platform}
              className="flex items-center space-x-2"
            >
              <Switch
                id={`platform-${platform}`}
                checked={platforms.includes(platform)}
                onCheckedChange={() => togglePlatform(platform)}
              />
              <Label htmlFor={`platform-${platform}`}>{platform}</Label>
            </div>
          ))}
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