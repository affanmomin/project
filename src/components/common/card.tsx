import { 
  Card as UICard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PropsWithChildren, ReactNode } from "react";

interface CardProps extends PropsWithChildren {
  title?: string;
  description?: string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  footer?: ReactNode;
}

export function Card({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  footer,
}: CardProps) {
  return (
    <UICard className={cn("overflow-hidden", className)}>
      {(title || description) && (
        <CardHeader className={cn("space-y-1", headerClassName)}>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn("", contentClassName)}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className={cn("flex justify-between", footerClassName)}>
          {footer}
        </CardFooter>
      )}
    </UICard>
  );
}