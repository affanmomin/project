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
import { ExternalLink, Search, Download } from "lucide-react";
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
import { formatDate } from "@/lib/utils";
import { LeadDataPoint } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function Leads() {
  const [leads, setLeads] = useState<LeadDataPoint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const userInfo = useAuth();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getLeads(userInfo.user?.id);
        const leadsData = response.data.find(
          (card) => card.key === "all-leads"
        );
        if (leadsData?.data) {
          setLeads(leadsData.data as LeadDataPoint[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch leads");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
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

  // Get unique platforms
  const platforms = [...new Set(leads.map((lead) => lead.platform))];

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    // Text search
    const matchesSearch =
      lead.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.reason.toLowerCase().includes(searchQuery.toLowerCase());

    // Platform filter
    const matchesPlatform =
      platformFilter === "all" || lead.platform === platformFilter;

    // Status filter
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "new":
        return <Badge variant="default">New</Badge>;
      case "contacted":
        return <Badge variant="secondary">Contacted</Badge>;
      case "responded":
        return <Badge variant="secondary">Responded</Badge>;
      case "ignored":
        return <Badge variant="outline">Ignored</Badge>;
      default:
        return <Badge variant="outline">New</Badge>;
    }
  };

  // Handle status change
  const handleStatusChange = async (
    leadId: string,
    newStatus: "new" | "contacted" | "responded" | "ignored"
  ) => {
    try {
      console.log("Updating status for lead:", leadId, "to", newStatus,"user:",userInfo.user?.id);
      // Make API call to update status
      await apiClient.put("/api/leads/status", {
        user_id: userInfo.user?.id,
        lead_id: leadId,
        status: newStatus,
      });

      // Update local state on successful API call
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );

      toast({
        title: "Status Updated",
        description: `Lead status changed to ${newStatus}`,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update lead status";
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Status Update Error:", error);
    }
  };

  // Export leads to CSV
  const exportToCSV = () => {
    try {
      // Use filtered leads for export
      const dataToExport = filteredLeads.length > 0 ? filteredLeads : leads;
      
      if (dataToExport.length === 0) {
        toast({
          title: "No Data to Export",
          description: "There are no leads available to export.",
          variant: "destructive",
        });
        return;
      }

      // CSV Headers
      const headers = [
        "Platform",
        "Username", 
        "Excerpt",
        "Reason",
        "Date",
        "Status"
      ];

      // Convert data to CSV format
      const csvContent = [
        // Add headers
        headers.join(","),
        // Add data rows
        ...dataToExport.map(lead => {
          return [
            `"${lead.platform.replace(/"/g, '""')}"`, // Escape quotes
            `"${lead.username.replace(/"/g, '""')}"`,
            `"${lead.excerpt.replace(/"/g, '""')}"`,
            `"${lead.reason.replace(/"/g, '""')}"`,
            `"${formatDate(lead.date)}"`,
            `"${lead.status || 'New'}"`
          ].join(",");
        })
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Successful",
          description: `${dataToExport.length} leads exported to CSV successfully.`,
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
        <p>Loading leads...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
          <div className="relative w-full sm:w-64 lg:w-96">
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {platforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="ignored">Ignored</SelectItem>
              </SelectContent>
            </Select>
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
    
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Competitor</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Badge variant="outline">{lead.platform}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{lead.username}</TableCell>
                  <TableCell>{lead.competitor_name || "Unknown"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{lead.reason}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(lead.created_at)}</TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Update Status
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(lead.id, "new")}
                          >
                            New
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(lead.id, "contacted")
                            }
                          >
                            Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(lead.id, "responded")
                            }
                          >
                            Responded
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(lead.id, "ignored")
                            }
                          >
                            Ignored
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

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
                <TableCell colSpan={7} className="text-center py-6">
                  No leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
