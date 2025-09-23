import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { Card } from "@/components/common/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { CompetitorDataPoint } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function Competitors() {
  const [competitors, setCompetitors] = useState<CompetitorDataPoint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuth();

  useEffect(() => {
    const fetchCompetitors = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getCompetitors(user?.user?.id);
        const competitorsData = response.data.find(
          (card) => card.key === "all-competitors"
        );
        if (competitorsData?.data) {
          setCompetitors(competitorsData.data as CompetitorDataPoint[]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch competitors"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompetitors();
  }, []);

  // Filter competitors based on search query
  const filteredCompetitors = competitors.filter((competitor) =>
    competitor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <p>Loading competitors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:w-64 lg:w-96">
          <Input
            placeholder="Search competitors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button asChild>
          <Link to="/settings">
            <Plus className="mr-2 h-4 w-4" />
            Add Competitor
          </Link>
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Total Mentions</TableHead>
              <TableHead>Negative Sentiment</TableHead>
              <TableHead>Total Leads</TableHead>
              <TableHead>Complaint Clusters</TableHead>
              <TableHead>Alternatives</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompetitors.length > 0 ? (
              filteredCompetitors.map((competitor) => (
                <TableRow key={competitor.id}>
                  <TableCell className="font-medium">
                    {competitor.name}
                  </TableCell>
                  <TableCell>
                    {formatNumber(parseInt(competitor.total_mentions))}
                  </TableCell>
                  <TableCell>
                    {competitor.negative_mentions && competitor.total_mentions
                      ? (
                          (parseInt(competitor.negative_mentions) /
                            parseInt(competitor.total_mentions)) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </TableCell>
                  <TableCell>
                    {formatNumber(parseInt(competitor.total_leads))}
                  </TableCell>
                  <TableCell>
                    {formatNumber(
                      parseInt(competitor.total_complaint_clusters)
                    )}
                  </TableCell>
                  <TableCell>
                    {formatNumber(parseInt(competitor.total_alternatives))}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/competitors/${competitor.id}`}>
                        View Insights
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No competitors found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
