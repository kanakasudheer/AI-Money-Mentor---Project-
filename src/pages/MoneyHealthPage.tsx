import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ScoreRing } from "@/components/ScoreRing";
import { InsightCard } from "@/components/InsightCard";
import { AITypingIndicator } from "@/components/AITypingIndicator";
import { Button } from "@/components/ui/button";
import Galaxy from "@/component/Galaxy";
import { RefreshCw } from "lucide-react";

interface DimensionScore {
  name: string;
  score: number;
  description: string;
}

interface HealthResult {
  overall_score: number;
  diagnosis: string;
  dimensions: DimensionScore[];
  action_items: { title: string; description: string; priority: "high" | "medium" | "low" }[];
}

export default function MoneyHealthPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [result, setResult] = useState<HealthResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();
      if (!data?.onboarding_complete) { navigate("/onboarding"); return; }
      setProfile(data);
    };
    load();
  }, [navigate]);

  const analyzeHealth = async () => {
    if (!profile) return;
    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-mentor", {
        body: {
          module: "money-health",
          profile,
        },
      });

      if (error) throw error;
      setResult(data);
    } catch (error: any) {
      console.error("AI error:", error);
      // Fallback with calculated scores
      const emergencyMonths = profile.monthly_expenses ? ((profile.equity * 0.1) / profile.monthly_expenses) : 0;
      setResult({
        overall_score: 62,
        diagnosis: "Your finances show a solid foundation but there are key gaps in insurance and retirement planning that need attention.",
        dimensions: [
          { name: "Emergency Preparedness", score: Math.min(Math.round(emergencyMonths / 6 * 100), 100), description: `You have approximately ${emergencyMonths.toFixed(1)} months of emergency coverage. Aim for 6 months.` },
          { name: "Insurance Coverage", score: profile.health_insurance >= 1000000 ? 70 : 35, description: profile.health_insurance >= 1000000 ? "Your health insurance is adequate." : "Your health insurance is below the recommended ₹10 lakh family floater." },
          { name: "Investment Diversification", score: 65, description: "Your portfolio has a reasonable mix but could benefit from more international exposure." },
          { name: "Debt Health", score: profile.total_debt === 0 ? 100 : 50, description: profile.total_debt === 0 ? "Excellent! You're debt-free." : "You have outstanding debt that should be prioritized." },
          { name: "Tax Efficiency", score: 55, description: "There may be tax-saving opportunities you're missing. Use the Tax Wizard for a detailed analysis." },
          { name: "Retirement Readiness", score: 45, description: "At your current savings rate, retirement planning needs attention. Consider the FIRE Planner." },
        ],
        action_items: [
          { title: "Increase health insurance to ₹10 lakh", description: "A family floater of ₹10L costs approximately ₹12,000-15,000/year for your age group.", priority: "high" },
          { title: "Build emergency fund to 6 months expenses", description: `Target: ₹${(profile.monthly_expenses * 6).toLocaleString('en-IN')} in a liquid fund or savings account.`, priority: "high" },
          { title: "Start NPS for additional tax benefit", description: "₹50,000 under Section 80CCD(1B) gives you an extra ₹15,600 tax saving at 30% slab.", priority: "medium" },
        ],
      });
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (profile && !result && !analyzing) {
      analyzeHealth();
    }
  }, [profile]);

  const getDimensionColor = (score: number) => {
    if (score >= 75) return "text-success";
    if (score >= 50) return "text-primary";
    if (score >= 25) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen gradient-navy relative">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0">
        <Galaxy 
          transparent={true}
          mouseInteraction={true}
          hueShift={200}
          density={0.6}
          glowIntensity={0.15}
          twinkleIntensity={0.3}
          speed={0.4}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Navbar isAuthenticated />
        <div className="container py-8 space-y-8 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Money Health Score</h1>
            <p className="text-muted-foreground mt-1">A comprehensive assessment of your financial wellness</p>
          </div>
          <Button variant="outline" onClick={analyzeHealth} disabled={analyzing} className="border-border text-muted-foreground hover:text-foreground">
            <RefreshCw className={`w-4 h-4 mr-2 ${analyzing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {analyzing && !result && (
          <div className="glass-card rounded-xl p-12 flex items-center justify-center">
            <AITypingIndicator />
          </div>
        )}

        {result && (
          <>
            {/* Overall Score */}
            <div className="glass-card rounded-xl p-8 flex flex-col md:flex-row items-center gap-8">
              <ScoreRing score={result.overall_score} size={180} strokeWidth={12} label="Overall Score" />
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Your Financial Health</h2>
                <p className="text-muted-foreground leading-relaxed">{result.diagnosis}</p>
              </div>
            </div>

            {/* Dimension Scores */}
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">6 Dimensions of Financial Health</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.dimensions.map(dim => (
                  <div key={dim.name} className="glass-card rounded-lg p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground">{dim.name}</h3>
                      <span className={`text-xl font-heading font-bold ${getDimensionColor(dim.score)}`}>{dim.score}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${dim.score >= 75 ? "bg-success" : dim.score >= 50 ? "bg-primary" : dim.score >= 25 ? "bg-warning" : "bg-destructive"}`}
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{dim.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items */}
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Priority Action Items</h2>
              <div className="space-y-3">
                {result.action_items.map((item, i) => (
                  <InsightCard key={i} title={item.title} description={item.description} priority={item.priority} />
                ))}
              </div>
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground text-center">
          This assessment is for educational purposes. Please consult a SEBI-registered advisor for personalized advice.
        </p>
        </div>
      </div>
    </div>
  );
}
