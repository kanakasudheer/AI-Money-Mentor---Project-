import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, Lightbulb } from "lucide-react";

interface InsightCardProps {
  title: string;
  description: string;
  priority: "high" | "medium" | "low" | "info";
  className?: string;
}

const priorityConfig = {
  high: { icon: AlertTriangle, badge: "High Priority", badgeClass: "bg-destructive/20 text-destructive", iconClass: "text-destructive" },
  medium: { icon: Lightbulb, badge: "Medium", badgeClass: "bg-warning/20 text-warning", iconClass: "text-warning" },
  low: { icon: CheckCircle, badge: "Low", badgeClass: "bg-success/20 text-success", iconClass: "text-success" },
  info: { icon: Info, badge: "Info", badgeClass: "bg-info/20 text-info", iconClass: "text-info" },
};

export function InsightCard({ title, description, priority, className }: InsightCardProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <div className={cn("glass-card rounded-lg p-4 flex gap-3", className)}>
      <div className={cn("mt-0.5", config.iconClass)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", config.badgeClass)}>
            {config.badge}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
