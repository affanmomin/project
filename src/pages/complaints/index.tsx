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
import { ExternalLink, Download } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/common/card";
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

  // Export complaints to CSV
  const exportToCSV = () => {
    try {
      // Use filtered complaints for export
      const dataToExport = filteredComplaints.length > 0 ? filteredComplaints : complaints;
      
      if (dataToExport.length === 0) {
        toast({
          title: "No Data to Export",
          description: "There are no complaints available to export.",
          variant: "destructive",
        });
        return;
      }

      // CSV Headers
      const headers = [
        "Complaint",
        "Category", 
        "Value",
        "Severity"
      ];

      // Convert data to CSV format
      const csvContent = [
        // Add headers
        headers.join(","),
        // Add data rows
        ...dataToExport.map(complaint => {
          const numValue = parseInt(complaint.value, 10);
          let severity = "Low";
          if (numValue >= 100) severity = "High";
          else if (numValue >= 50) severity = "Medium";

          return [
            `"${(complaint.name || complaint.label).replace(/"/g, '""')}"`, // Escape quotes
            `"${complaint.label.replace(/"/g, '""')}"`,
            complaint.value,
            severity
          ].join(",");
        })
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `complaints_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Successful",
          description: `${dataToExport.length} complaints exported to CSV successfully.`,
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting the data.",
        variant: "destructive",
      });
    }
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            disabled={isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
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