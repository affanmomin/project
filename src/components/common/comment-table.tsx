import { Comment } from "@/types";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { formatDate, getSentimentColor, truncateText } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentTableProps {
  comments: Comment[];
  className?: string;
}

export function CommentTable({ comments, className }: CommentTableProps) {
  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Platform</TableHead>
            <TableHead>Username</TableHead>
            <TableHead className="w-full">Comment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead className="text-right">Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell>
                <Badge variant="outline">{comment.platform}</Badge>
              </TableCell>
              <TableCell className="font-medium">{comment.username}</TableCell>
              <TableCell>{truncateText(comment.content, 100)}</TableCell>
              <TableCell>{formatDate(comment.date)}</TableCell>
              <TableCell>
                <span className={getSentimentColor(comment.sentiment)}>
                  {(comment.sentiment * 100).toFixed(0)}%
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <a
                    href={comment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open source</span>
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
