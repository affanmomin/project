import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Filter, Search } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/common/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FeatureDataPoint } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function Features() {
  const [features, setFeatures] = useState<FeatureDataPoint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const userInfo = useAuth();

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getFeatures(userInfo.user?.id);
        const featuresData = response.data.find(
          (card: any) => card.key === "top-features"
        );
        if (featuresData?.data) {
          setFeatures(featuresData.data as FeatureDataPoint[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch features");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  const handleTestSearch = async () => {
    setIsSearching(true);
    try {
      await apiClient.post("/search", {
        query: "abc",
      });
      toast({
        title: "Search Successful",
        description: "API call worked! Search completed successfully.",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during search";
      toast({
        title: "Search Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Search Error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Get unique categories (based on label field)
  const categories = [...new Set(features.map((feature) => feature.label))];

  // Filter features
  const filteredFeatures = features.filter((feature) => {
    // Text search
    const matchesSearch =
      feature.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.feature_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.competitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.value.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      categoryFilter === "all" || feature.label === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Get unique competitors for additional filtering if needed
  const competitors = [...new Set(features.map((feature) => feature.competitor_name))];

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
        <p>Loading features...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
          <div className="relative w-full sm:w-64 lg:w-96">
            <Input
              placeholder="Search features, competitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          {/* <Button
            variant="default"
            size="sm"
            onClick={handleTestSearch}
            disabled={isSearching}
          >
            <Search className="mr-2 h-4 w-4" />
            {isSearching ? "Searching..." : "Test Search API"}
          </Button> */}
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature Description</TableHead>
              <TableHead>Competitor</TableHead>
              <TableHead>Feature Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFeatures.length > 0 ? (
              filteredFeatures.map((feature, index) => (
                <TableRow key={`${feature.feature_name}-${index}`}>
                  <TableCell className="font-medium">
                    <div className="max-w-md">
                      <p className="text-sm leading-relaxed">
                        {feature.feature_name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="max-w-xs truncate">
                      {feature.competitor_name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{feature.feature_type}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {/* <Button variant="outline" size="sm">
                        View Details
                      </Button> */}

                      <Button variant="ghost" size="icon" asChild>
                        <a href="#" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">Open source</span>
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No features found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}