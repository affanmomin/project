import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";

const clusterTagVariants = cva(
  "transition-colors cursor-default flex items-center gap-1.5",
  {
    variants: {
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-1",
        lg: "px-3 py-1.5",
      },
      variant: {
        default: "bg-primary/10 text-primary hover:bg-primary/20",
        secondary: "bg-secondary/80 text-secondary-foreground hover:bg-secondary",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        warning: "bg-warning/10 text-warning-foreground hover:bg-warning/20", 
        success: "bg-success/10 text-success hover:bg-success/20",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

interface ClusterTagProps extends VariantProps<typeof clusterTagVariants> {
  label: string;
  count?: number;
  examples?: string[];
  className?: string;
}

export function ClusterTag({
  label,
  count,
  examples,
  className,
  size,
  variant,
}: ClusterTagProps) {
  const hasExamples = examples && examples.length > 0;
  
  const badge = (
    <Badge 
      className={cn(
        clusterTagVariants({ size, variant }),
        className
      )}
    >
      {label}
      {count !== undefined && (
        <span className="ml-1 opacity-70">({count})</span>
      )}
    </Badge>
  );

  if (hasExamples) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1.5">
              <p className="font-medium">{label}</p>
              <ul className="space-y-1 text-sm">
                {examples.map((example, index) => (
                  <li key={index} className="list-disc list-inside">
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return badge;
}