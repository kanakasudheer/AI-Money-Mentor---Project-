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
import { Users, ArrowRight, Plus } from "lucide-react";

export default function CouplesPlannerPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [partner, setPartner] = useState({ name: "", income: "", expenses: "", equity: "", debt_inv: "", pf: "", nps: "", insurance_health: "", insurance_life: "", rent: "" });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  const analyze = async () => {
    setLoading(true);
    const p2Income = parseFloat(partner.income) || 0;
    const combinedIncome = (profile?.monthly_income || 0) + p2Income;
    const combinedExpenses = (profile?.monthly_expenses || 0) + (parseFloat(partner.expenses) || 0);
    const combinedNetWorth = (profile?.equity || 0) + (profile?.debt_investments || 0) + (profile?.gold || 0) + (profile?.pf_ppf || 0) + (profile?.nps || 0)
      + (parseFloat(partner.equity) || 0) + (parseFloat(partner.debt_inv) || 0) + (parseFloat(partner.pf) || 0) + (parseFloat(partner.nps) || 0);
    const savingsRate = combinedIncome > 0 ? Math.round(((combinedIncome - combinedExpenses) / combinedIncome) * 100) : 0;

    // Determine who should claim HRA
    const p1Income = profile?.monthly_income || 0;
    const rent = parseFloat(partner.rent) || 0;
    const hraClaimer = p1Income >= p2Income ? profile?.name || "Partner 1" : partner.name || "Partner 2";

    setResult({
      combined_net_worth: combinedNetWorth,
      savings_rate: savingsRate,
      combined_income: combinedIncome,
      hra: { claimer: hraClaimer, reason: `The higher earner (${hraClaimer}) should claim HRA as it provides more tax benefit at a higher tax slab. Monthly rent of ${formatINR(rent)} can save approximately ${formatINR(Math.round(rent * 12 * 0.3))} in taxes annually.` },
      sip_split: `Split SIPs across both PAN cards: ${profile?.name || "Partner 1"} invests in ELSS + large-cap index funds. ${partner.name || "Partner 2"} focuses on mid-cap + international funds for diversification.`,
      nps: `Both should invest ₹50,000/year in NPS under 80CCD(1B) for combined tax saving of ₹31,200 (at 30% slab). Choose aggressive allocation (75% equity) if both are under 40.`,
      insurance: (parseFloat(partner.insurance_health) || 0) > 0
        ? "Individual health policies are better if both have employer coverage. Consider a top-up plan of ₹25L for catastrophic coverage."
        : "Get a ₹10L family floater immediately. Add a ₹25L super top-up for comprehensive coverage at minimal extra cost.",
      action_plan: [
        { title: "Open joint emergency fund", description: `Target: ${formatINR(combinedExpenses * 6)} in a liquid fund. Both contribute proportionally.`, priority: "high" as const },
        { title: "Align investment goals", description: "Create shared goals (home, child's education) and track net worth together monthly.", priority: "medium" as const },
        { title: "Optimize tax across both incomes", description: `Combined tax saving potential: ~${formatINR(Math.round((150000 + 50000 + 25000) * 0.3 * 2))} by maxing 80C, 80CCD, and 80D for both.`, priority: "medium" as const },
        { title: "Review nomination and will", description: "Update all investment nominations, write a simple will, and ensure both partners know all financial details.", priority: "low" as const },
      ],
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-navy">
      <Navbar isAuthenticated />
      <div className="container py-8 space-y-8 max-w-4xl">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Couple's Money Planner</h1>
            <p className="text-muted-foreground">Optimize finances together for maximum tax efficiency</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">Your Partner's Financial Details</h2>
          <p className="text-sm text-muted-foreground">Your data is already loaded from your profile. Enter your partner's details below.</p>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-foreground">Partner's Name</Label><Input value={partner.name} onChange={e => setPartner(p => ({ ...p, name: e.target.value }))} placeholder="Name" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">Monthly Income (₹)</Label><Input type="number" value={partner.income} onChange={e => setPartner(p => ({ ...p, income: e.target.value }))} placeholder="60000" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">Monthly Expenses (₹)</Label><Input type="number" value={partner.expenses} onChange={e => setPartner(p => ({ ...p, expenses: e.target.value }))} placeholder="25000" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">Monthly Rent (₹)</Label><Input type="number" value={partner.rent} onChange={e => setPartner(p => ({ ...p, rent: e.target.value }))} placeholder="20000" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">Equity / MF (₹)</Label><Input type="number" value={partner.equity} onChange={e => setPartner(p => ({ ...p, equity: e.target.value }))} placeholder="300000" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">Debt / FD (₹)</Label><Input type="number" value={partner.debt_inv} onChange={e => setPartner(p => ({ ...p, debt_inv: e.target.value }))} placeholder="100000" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">PF + PPF (₹)</Label><Input type="number" value={partner.pf} onChange={e => setPartner(p => ({ ...p, pf: e.target.value }))} placeholder="200000" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">NPS (₹)</Label><Input type="number" value={partner.nps} onChange={e => setPartner(p => ({ ...p, nps: e.target.value }))} placeholder="0" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">Health Insurance (₹)</Label><Input type="number" value={partner.insurance_health} onChange={e => setPartner(p => ({ ...p, insurance_health: e.target.value }))} placeholder="500000" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">Life Insurance (₹)</Label><Input type="number" value={partner.insurance_life} onChange={e => setPartner(p => ({ ...p, insurance_life: e.target.value }))} placeholder="5000000" className="bg-secondary border-border mt-1" /></div>
          </div>
          <Button onClick={analyze} disabled={loading} className="gradient-gold text-primary-foreground">
            {loading ? "Analyzing..." : "Optimize Together"}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {loading && !result && <div className="glass-card rounded-xl p-12 flex items-center justify-center"><AITypingIndicator /></div>}

        {result && (
          <>
            <div className="glass-card rounded-xl p-8 glow-gold">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div><p className="text-sm text-muted-foreground">Combined Net Worth</p><p className="text-3xl font-heading font-bold text-foreground">{formatINR(result.combined_net_worth)}</p></div>
                <div><p className="text-sm text-muted-foreground">Combined Income</p><p className="text-3xl font-heading font-bold text-primary">{formatINR(result.combined_income)}/mo</p></div>
                <div><p className="text-sm text-muted-foreground">Savings Rate</p><p className="text-3xl font-heading font-bold text-success">{result.savings_rate}%</p></div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 space-y-2">
              <h3 className="font-heading font-semibold text-foreground">HRA Optimization</h3>
              <p className="text-sm text-muted-foreground">{result.hra.reason}</p>
            </div>

            <div className="glass-card rounded-xl p-6 space-y-2">
              <h3 className="font-heading font-semibold text-foreground">SIP Split Strategy</h3>
              <p className="text-sm text-muted-foreground">{result.sip_split}</p>
            </div>

            <div className="glass-card rounded-xl p-6 space-y-2">
              <h3 className="font-heading font-semibold text-foreground">NPS Contributions</h3>
              <p className="text-sm text-muted-foreground">{result.nps}</p>
            </div>

            <div className="glass-card rounded-xl p-6 space-y-2">
              <h3 className="font-heading font-semibold text-foreground">Insurance Recommendation</h3>
              <p className="text-sm text-muted-foreground">{result.insurance}</p>
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">12-Month Joint Action Plan</h2>
              <div className="space-y-3">{result.action_plan.map((item: any, i: number) => <InsightCard key={i} {...item} />)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
