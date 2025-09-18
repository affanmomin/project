import { Card } from "@/components/common/card";
import { ClusterTag } from "@/components/common/cluster-tag";
import { cn } from "@/lib/utils";
import { ComplaintCardResponse } from "@/types";

interface TopComplaintsProps {
  data?: ComplaintCardResponse;
}

export function TopComplaints({ data }: TopComplaintsProps) {
  if (!data?.data) {
    return null;
  }

  // Filter out null names and sort by value
  const complaints = data.data
    .filter((item) => item.name !== null)
    .map((item) => ({
      label: item.name!,
      value: parseInt(item.value || "0", 10),
    }))
    .sort((a, b) => b.value - a.value);

  // Find max count for relative scaling
  const maxCount = complaints.length > 0 ? complaints[0].value : 0;

  // Determine variant based on index/position
  const getVariant = (index: number) => {
    const variants = [
      "destructive",
      "warning",
      "default",
      "secondary",
      "success",
    ] as const;
    return variants[index % variants.length];
  };

  return (
    <Card
      title={data.title}
      description={data.description}
      contentClassName="space-y-5"
    >
      {complaints.map((complaint, index) => (
        <div key={complaint.label} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <ClusterTag
              label={complaint.label}
              count={complaint.value}
              variant={getVariant(index)}
            />
            <span className="text-sm text-muted-foreground">
              {complaint.value} mentions
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full transition-all",
                index === 0 ? "bg-destructive" : "",
                index === 1 ? "bg-orange-500" : "",
                index === 2 ? "bg-primary" : "",
                index === 3 ? "bg-secondary" : "",
                index === 4 ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${(complaint.value / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </Card>
  );
}
