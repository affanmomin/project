import { Card } from "@/components/common/card";
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
import { formatDate } from "@/lib/utils";
import { LeadCardResponse } from "@/types";
import { ArrowRight } from "lucide-react";

interface RecentLeadsProps {
  data?: LeadCardResponse;
}

export function RecentLeads({ data }: RecentLeadsProps) {
  if (!data?.data) {
    return null;
  }

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

  // Show only top 3 leads
  const topLeads = data.data.slice(0, 3);

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span>{data.title}</span>
          <Button variant="outline" size="sm" asChild>
            <a href="/leads" className="flex items-center gap-2">
              Show all leads
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      }
      description={data.description}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Platform</TableHead>
            <TableHead>Username</TableHead>
            <TableHead className="w-full">Content</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topLeads.map((lead, index) => (
            <TableRow key={index}>
              <TableCell>
                <Badge variant="outline">{lead.platform}</Badge>
              </TableCell>
              <TableCell className="font-medium">{lead.username}</TableCell>
              <TableCell>{lead.excerpt}</TableCell>
              <TableCell>{formatDate(lead.date)}</TableCell>
              <TableCell>{getStatusBadge(lead.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
