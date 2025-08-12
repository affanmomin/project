import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import { ClusterTag } from "@/components/common/cluster-tag";
import { Link } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { Card } from "@/components/common/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Competitors() {
  const { competitors } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter competitors based on search query
  const filteredCompetitors = competitors.filter(competitor => 
    competitor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <TableHead className="w-full">Trending Complaints</TableHead>
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
                    {formatNumber(competitor.totalMentions)}
                  </TableCell>
                  <TableCell>
                    {(competitor.negativeSentiment * 100).toFixed(0)}%
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {competitor.trendingComplaints.map((complaint, index) => (
                        <ClusterTag
                          key={index}
                          label={complaint}
                          size="sm"
                          variant={
                            index === 0
                              ? "destructive"
                              : index === 1
                              ? "warning"
                              : "default"
                          }
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
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
                <TableCell colSpan={5} className="text-center py-6">
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