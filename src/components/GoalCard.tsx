import { formatINR } from "@/lib/format";
import { Target } from "lucide-react";

interface GoalCardProps {
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlySIP: number;
  targetYear: number;
}

export function GoalCard({ name, targetAmount, currentAmount, monthlySIP, targetYear }: GoalCardProps) {
  const progress = Math.min((currentAmount / targetAmount) * 100, 100);

  return (
    <div className="glass-card rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Target className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-foreground">{name}</h4>
          <p className="text-xs text-muted-foreground">Target: {targetYear}</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">{formatINR(currentAmount)}</span>
          <span className="text-foreground">{formatINR(targetAmount)}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Monthly SIP needed: <span className="text-primary font-medium">{formatINR(monthlySIP)}</span>
      </div>
    </div>
  );
}
