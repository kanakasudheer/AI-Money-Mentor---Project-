import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  onClick?: () => void;
}

export function FeatureCard({ icon: Icon, title, description, className, onClick }: FeatureCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card rounded-xl p-6 cursor-pointer group transition-all duration-300 hover:border-primary/50 hover:glow-gold",
        className
      )}
    >
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
