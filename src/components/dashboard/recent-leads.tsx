import { Card } from "@/components/common/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { truncateText, formatDate } from "@/lib/utils";
import { useMemo } from "react";

export function RecentLeads() {
  const { leads } = useAppStore();
  
  // Get the 5 most recent leads
  const recentLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [leads]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'contacted':
        return <Badge variant="secondary">Contacted</Badge>;
      case 'responded':
        return <Badge variant="success">Responded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card 
      title="Recent Switching Leads"
      description="Users expressing interest in switching"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Platform</TableHead>
            <TableHead>Username</TableHead>
            <TableHead className="w-full">Content</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentLeads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <Badge variant="outline">{lead.platform}</Badge>
              </TableCell>
              <TableCell className="font-medium">{lead.username}</TableCell>
              <TableCell>{truncateText(lead.content, 70)}</TableCell>
              <TableCell>{formatDate(lead.date)}</TableCell>
              <TableCell>{getStatusBadge(lead.status)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-8 w-8"
                >
                  <a href={lead.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open source</span>
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <a href="/leads">View all leads</a>
        </Button>
      </div>
    </Card>
  );
}