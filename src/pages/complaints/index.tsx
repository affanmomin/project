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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ComplaintDataPoint } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function Complaints() {
  const [complaints, setComplaints] = useState<ComplaintDataPoint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const userInfo = useAuth();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getComplaints(userInfo.user?.id);
        const complaintsData = response.data.find(
          (card: any) => card.key === "top-complaints"
        );
        if (complaintsData?.data) {
          setComplaints(complaintsData.data as ComplaintDataPoint[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch complaints");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
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
  const categories = [...new Set(complaints.map((complaint) => complaint.label))];

  // Filter complaints
  const filteredComplaints = complaints.filter((complaint) => {
    // Text search
    const matchesSearch =
      complaint.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (complaint.name && complaint.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      complaint.value.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      categoryFilter === "all" || complaint.label === categoryFilter;

    // Severity filter (based on value ranges)
    const numValue = parseInt(complaint.value, 10);
    const matchesSeverity = 
      severityFilter === "all" ||
      (severityFilter === "high" && numValue >= 100) ||
      (severityFilter === "medium" && numValue >= 50 && numValue < 100) ||
      (severityFilter === "low" && numValue < 50);

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  // Get severity badge based on value
  const getSeverityBadge = (value: string) => {
    const numValue = parseInt(value, 10);
    if (numValue >= 100) {
      return <Badge variant="destructive">High Severity</Badge>;
    } else if (numValue >= 50) {
      return <Badge variant="default">Medium Severity</Badge>;
    } else {
      return <Badge variant="secondary">Low Severity</Badge>;
    }
  };

  // Handle complaint status change (you can add status field to ComplaintDataPoint if needed)
  const handleStatusChange = (
    newStatus: "open" | "investigating" | "resolved" | "dismissed"
  ) => {
    // This could be extended to update complaint status if the API supports it
    toast({
      title: "Status Updated",
      description: `Complaint status changed to ${newStatus}`,
    });
  };

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
        <p>Loading complaints...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
          <div className="relative w-full sm:w-64 lg:w-96">
            <Input
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

        
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleTestSearch}
            disabled={isSearching}
          >
            <Search className="mr-2 h-4 w-4" />
            {isSearching ? "Searching..." : "Test Search API"}
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Complaint</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint, index) => (
                <TableRow key={`${complaint.label}-${index}`}>
                  <TableCell className="font-medium">
                    {complaint.name || complaint.label}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{complaint.label}</Badge>
                  </TableCell>
                  {/* <TableCell>
                    <span className="font-semibold">{complaint.value}</span>
                  </TableCell> */}
                  {/* <TableCell>{getSeverityBadge(complaint.value)}</TableCell> */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                

                      <Button variant="ghost" size="icon" asChild>
                        <a href="#" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No complaints found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}