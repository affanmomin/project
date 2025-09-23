import { Card } from "@/components/common/card";
import { ClusterTag } from "@/components/common/cluster-tag";
import { cn } from "@/lib/utils";
import { FeatureCardResponse } from "@/types";

interface TopFeaturesProps {
  data?: FeatureCardResponse;
}

export function TopFeatures({ data }: TopFeaturesProps) {
  if (!data?.data) {
    return null;
  }

  // Filter out null names and sort by value
  const features = data.data
    .filter((item) => item.name !== null)
    .map((item) => ({
      label: item.name!,
      value: parseInt(item.value || "0", 10),
    }))
    .sort((a, b) => b.value - a.value);

  // Find max count for relative scaling
  const maxCount = features.length > 0 ? features[0].value : 0;

  // Determine variant based on index/position
  const getVariant = (index: number) => {
    const variants = [
      "success",
      "default",
      "secondary",
      "warning",
      "destructive",
    ] as const;
    return variants[index % variants.length];
  };

  return (
    <Card
      title={data.title}
      description={data.description}
      contentClassName="space-y-5"
    >
      {features.map((feature, index) => (
        <div key={feature.label} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <ClusterTag
              label={feature.label}
              count={feature.value}
              variant={getVariant(index)}
            />
            <span className="text-sm text-muted-foreground">
              {feature.value} mentions
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full transition-all",
                index === 0 ? "bg-green-500" : "",
                index === 1 ? "bg-primary" : "",
                index === 2 ? "bg-secondary" : "",
                index === 3 ? "bg-orange-500" : "",
                index === 4 ? "bg-destructive" : "bg-primary"
              )}
              style={{ width: `${(feature.value / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </Card>
  );
}