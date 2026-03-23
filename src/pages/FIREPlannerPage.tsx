import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { InsightCard } from "@/components/InsightCard";
import { AITypingIndicator } from "@/components/AITypingIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/format";
import Galaxy from "@/component/Galaxy";
import { Flame, ArrowRight } from "lucide-react";

interface FIREResult {
  fire_age: number;
  corpus_needed: number;
  monthly_sip: number;
  allocation: { decade: string; equity: number; debt: number; gold: number }[];
  insurance_gaps: { title: string; description: string; priority: "high" | "medium" | "low" }[];
  tax_moves: { title: string; description: string; priority: "high" | "medium" | "low" }[];
  emergency_target: number;
  motivational: string;
}

export default function FIREPlannerPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [retirementAge, setRetirementAge] = useState("45");
  const [monthlyExpenseGoal, setMonthlyExpenseGoal] = useState("");
  const [result, setResult] = useState<FIREResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();
      if (!data?.onboarding_complete) { navigate("/onboarding"); return; }
      setProfile(data);
      setMonthlyExpenseGoal(String(data.monthly_expenses || 50000));
    };
    load();
  }, [navigate]);

  const calculateFIRE = async () => {
    if (!profile) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-mentor", {
        body: {
          module: "fire-planner",
          profile,
          inputs: { retirementAge: parseInt(retirementAge), monthlyExpenseGoal: parseInt(monthlyExpenseGoal) },
        },
      });
      if (error) throw error;
      setResult(data);
    } catch (error: any) {
      console.error("AI error:", error);
      // Fallback calculation
      const age = profile.age || 28;
      const targetAge = parseInt(retirementAge);
      const yearsToRetire = targetAge - age;
      const monthlyExp = parseInt(monthlyExpenseGoal) || profile.monthly_expenses;
      const inflationAdjusted = monthlyExp * Math.pow(1.06, yearsToRetire);
      const corpus = inflationAdjusted * 12 * 25;
      const currentInvestments = (profile.equity || 0) + (profile.debt_investments || 0) + (profile.gold || 0) + (profile.pf_ppf || 0) + (profile.nps || 0);
      const futureValueCurrent = currentInvestments * Math.pow(1.12, yearsToRetire);
      const remaining = Math.max(corpus - futureValueCurrent, 0);
      const monthlySIP = remaining > 0 ? Math.round(remaining / (((Math.pow(1 + 0.01, yearsToRetire * 12) - 1) / 0.01) * (1 + 0.01))) : 0;

      setResult({
        fire_age: targetAge,
        corpus_needed: Math.round(corpus),
        monthly_sip: monthlySIP,
        allocation: [
          { decade: `${age}-${Math.min(age + 10, targetAge)}`, equity: 70, debt: 20, gold: 10 },
          { decade: `${age + 10}-${Math.min(age + 20, targetAge)}`, equity: 60, debt: 30, gold: 10 },
          { decade: `${age + 20}+`, equity: 40, debt: 45, gold: 15 },
        ],
        insurance_gaps: [
          { title: `Life insurance gap: Need ${formatINR(profile.monthly_income * 120)} cover`, description: `Your current cover of ${formatINR(profile.life_insurance || 0)} may not be sufficient. Aim for 10x annual income.`, priority: "high" },
          { title: "Health insurance: Upgrade to ₹10 lakh", description: "Medical inflation in India is 14% p.a. A ₹10L family floater is the minimum for adequate coverage.", priority: "high" },
          { title: "Consider critical illness rider", description: "A ₹25L critical illness policy costs ~₹8,000/year and covers scenarios your health insurance might not.", priority: "medium" },
        ],
        tax_moves: [
          { title: "Max out Section 80C (₹1.5 lakh)", description: "Use ELSS funds for the best combination of tax saving and equity returns.", priority: "high" },
          { title: "NPS for extra ₹50,000 deduction", description: "Section 80CCD(1B) gives an additional ₹50K deduction beyond the 80C limit.", priority: "high" },
          { title: "Health insurance premium under 80D", description: "Ensure you're claiming the full ₹25,000 (₹50,000 for parents above 60).", priority: "medium" },
        ],
        emergency_target: profile.monthly_expenses * 6,
        motivational: `With discipline and a ${formatINR(monthlySIP)}/month SIP, you can achieve financial independence by age ${targetAge}. Every month you start earlier saves you lakhs. Let's make it happen! 🔥`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-navy relative">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0">
        <Galaxy 
          transparent={true}
          mouseInteraction={true}
          hueShift={180}
          density={0.7}
          glowIntensity={0.25}
          twinkleIntensity={0.5}
          speed={0.6}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Navbar isAuthenticated />
        <div className="container py-8 space-y-8 max-w-4xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-3xl font-bold text-foreground">FIRE Path Planner</h1>
          </div>
          <p className="text-muted-foreground">Plan your journey to Financial Independence, Retire Early</p>
        </div>

        {/* Inputs */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">Your FIRE Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground">Target Retirement Age</Label>
              <Input type="number" value={retirementAge} onChange={e => setRetirementAge(e.target.value)} placeholder="45" className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <Label className="text-foreground">Monthly Expenses at Retirement (₹)</Label>
              <Input type="number" value={monthlyExpenseGoal} onChange={e => setMonthlyExpenseGoal(e.target.value)} placeholder="75000" className="bg-secondary border-border mt-1" />
            </div>
          </div>
          <Button onClick={calculateFIRE} disabled={loading} className="gradient-gold text-primary-foreground font-medium">
            {loading ? "Calculating..." : "Generate My FIRE Plan"}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {loading && !result && (
          <div className="glass-card rounded-xl p-12 flex items-center justify-center">
            <AITypingIndicator />
          </div>
        )}

        {result && (
          <>
            {/* Summary */}
            <div className="glass-card rounded-xl p-8 glow-gold">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">FIRE Age</p>
                  <p className="text-4xl font-heading font-bold text-primary">{result.fire_age}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Corpus Needed</p>
                  <p className="text-4xl font-heading font-bold text-foreground">{formatINR(result.corpus_needed)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly SIP</p>
                  <p className="text-4xl font-heading font-bold text-success">{formatINR(result.monthly_sip)}</p>
                </div>
              </div>
            </div>

            {/* Asset Allocation by Decade */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Asset Allocation by Decade</h2>
              <div className="space-y-4">
                {result.allocation.map(a => (
                  <div key={a.decade} className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Age {a.decade}</p>
                    <div className="flex h-8 rounded-lg overflow-hidden">
                      <div className="bg-info flex items-center justify-center text-xs font-medium text-info-foreground" style={{ width: `${a.equity}%` }}>
                        Equity {a.equity}%
                      </div>
                      <div className="bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground" style={{ width: `${a.debt}%` }}>
                        Debt {a.debt}%
                      </div>
                      <div className="bg-warning flex items-center justify-center text-xs font-medium text-warning-foreground" style={{ width: `${a.gold}%` }}>
                        Gold {a.gold}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insurance Gaps */}
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Insurance Gap Analysis</h2>
              <div className="space-y-3">
                {result.insurance_gaps.map((item, i) => (
                  <InsightCard key={i} title={item.title} description={item.description} priority={item.priority} />
                ))}
              </div>
            </div>

            {/* Tax Moves */}
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Tax-Saving Recommendations</h2>
              <div className="space-y-3">
                {result.tax_moves.map((item, i) => (
                  <InsightCard key={i} title={item.title} description={item.description} priority={item.priority} />
                ))}
              </div>
            </div>

            {/* Emergency Fund */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">Emergency Fund Target</h2>
              <p className="text-3xl font-heading font-bold text-primary">{formatINR(result.emergency_target)}</p>
              <p className="text-sm text-muted-foreground mt-1">6 months of expenses in a liquid fund</p>
            </div>

            {/* Motivational */}
            <div className="glass-card rounded-xl p-6 border-primary/30 text-center">
              <p className="text-foreground leading-relaxed italic">"{result.motivational}"</p>
              <p className="text-sm text-primary font-medium mt-2">— Artha, Your AI Money Mentor</p>
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Projections use equity CAGR 12%, debt 7%, gold 8%, inflation 6%. Consult a SEBI-registered advisor for personalized advice.
        </p>
        </div>
      </div>
    </div>
  );
}
