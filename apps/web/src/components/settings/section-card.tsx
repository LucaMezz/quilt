import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@quilt/ui/components/card";
import { cn } from "@quilt/ui/lib/utils";
import { type ReactNode, useId } from "react";

export function SectionCard({
  title,
  description,
  action,
  level = 2,
  className,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  level?: 2 | 3;
  className?: string;
  children?: ReactNode;
}) {
  const id = useId();
  const Heading = level === 2 ? "h2" : "h3";

  return (
    <Card
      role="region"
      aria-labelledby={id}
      className={cn("gap-5 md:[--card-spacing:--spacing(6)]", className)}
    >
      <CardHeader>
        <CardTitle>
          <Heading id={id}>{title}</Heading>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
