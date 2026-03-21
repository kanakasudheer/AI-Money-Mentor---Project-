import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ScoreRing } from "@/components/ScoreRing";
import { GoalCard } from "@/components/GoalCard";
import { FeatureCard } from "@/components/FeatureCard";
import { formatINR } from "@/lib/format";
import { Flame, Heart, Calendar, Calculator, Users, PieChart, TrendingUp, Wallet } from "lucide-react";

const modules = [
  { icon: Flame, title: "FIRE Planner", desc: "Plan your path to financial independence", path: "/fire-planner" },
  { icon: Heart, title: "Money Health", desc: "Check your financial fitness score", path: "/money-health" },
  { icon: Calendar, title: "Life Events", desc: "Get advice for life's big moments", path: "/life-events" },
  { icon: Calculator, title: "Tax Wizard", desc: "Optimize your tax strategy", path: "/tax-wizard" },
  { icon: Users, title: "Couple's Planner", desc: "Plan finances together", path: "/couples-planner" },
  { icon: PieChart, title: "Portfolio X-Ray", desc: "Analyze your mutual fund portfolio", path: "/portfolio-xray" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const { data: p } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();
      if (!p || !p.onboarding_complete) { navigate("/onboarding"); return; }
      setProfile(p);

      const { data: g } = await supabase.from("financial_goals").select("*").eq("user_id", user.id);
      setGoals(g || []);
      setLoading(false);
    };
    load();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-navy flex items-center justify-center">
        <div className="text-muted-foreground">Loading your dashboard...</div>
      </div>
    );
  }

  const netWorth = (profile?.equity || 0) + (profile?.debt_investments || 0) + (profile?.gold || 0) + (profile?.pf_ppf || 0) + (profile?.nps || 0) - (profile?.total_debt || 0);
  const savingsRate = profile?.monthly_income ? Math.round(((profile.monthly_income - profile.monthly_expenses) / profile.monthly_income) * 100) : 0;

  // Simple score calculation
  const emergencyMonths = profile?.monthly_expenses ? Math.min(((profile.equity || 0) * 0.1) / profile.monthly_expenses, 6) : 0;
  const healthScore = Math.min(Math.round(
    (Math.min(emergencyMonths / 6, 1) * 20) +
    (profile?.health_insurance >= 1000000 ? 15 : (profile?.health_insurance || 0) / 1000000 * 15) +
    (profile?.life_insurance >= profile?.monthly_income * 120 ? 15 : 10) +
    (savingsRate >= 30 ? 20 : savingsRate * 0.67) +
    ((profile?.pf_ppf || 0) > 0 ? 15 : 5) +
    ((profile?.total_debt || 0) === 0 ? 15 : 5)
  ), 100);

  return (
    <div className="min-h-screen gradient-navy">
      <Navbar isAuthenticated />
      <div className="container py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Welcome back, <span className="text-gradient-gold">{profile?.name?.split(" ")[0] || "there"}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here's your financial overview</p>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Score */}
          <div className="glass-card rounded-xl p-6 flex flex-col items-center">
            <ScoreRing score={healthScore} label="Health Score" />
            <p className="text-sm text-muted-foreground mt-3">
              {healthScore >= 75 ? "Great shape!" : healthScore >= 50 ? "Room to improve" : "Needs attention"}
            </p>
          </div>

          {/* Net Worth */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Net Worth</span>
            </div>
            <p className="text-3xl font-heading font-bold text-foreground">{formatINR(netWorth)}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Monthly Income</p>
                <p className="text-foreground font-medium">{formatINR(profile?.monthly_income || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Savings Rate</p>
                <p className="text-foreground font-medium">{savingsRate}%</p>
              </div>
            </div>
          </div>

          {/* Investment Split */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Investment Split</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Equity", value: profile?.equity || 0 },
                { label: "Debt/FD", value: profile?.debt_investments || 0 },
                { label: "Gold", value: profile?.gold || 0 },
                { label: "PF/PPF", value: profile?.pf_ppf || 0 },
                { label: "NPS", value: profile?.nps || 0 },
              ].map(item => {
                const total = (profile?.equity || 0) + (profile?.debt_investments || 0) + (profile?.gold || 0) + (profile?.pf_ppf || 0) + (profile?.nps || 0);
                const pct = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16">{item.label}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-foreground w-10 text-right">{Math.round(pct)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Goals */}
        {goals.length > 0 && (
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Your Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map(g => (
                <GoalCard
                  key={g.id}
                  name={g.name}
                  targetAmount={g.target_amount}
                  currentAmount={g.current_amount || 0}
                  monthlySIP={Math.round(((g.target_amount - (g.current_amount || 0)) / ((g.target_years || 10) * 12)))}
                  targetYear={new Date().getFullYear() + (g.target_years || 10)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Modules */}
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Financial Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map(m => (
              <FeatureCard key={m.title} icon={m.icon} title={m.title} description={m.desc} onClick={() => navigate(m.path)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
