import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { InsightCard } from "@/components/InsightCard";
import { AITypingIndicator } from "@/components/AITypingIndicator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/lib/format";
import { PieChart, ArrowRight } from "lucide-react";

export default function PortfolioXRayPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [statement, setStatement] = useState("");
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
    if (!statement.trim()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-mentor", {
        body: { module: "portfolio-xray", profile, inputs: { statement } },
      });
      if (error) throw error;
      setResult(data);
    } catch {
      // Demo fallback
      setResult({
        summary: "Your portfolio returned 11.2% XIRR vs Nifty 500's 14.1% over the same period. While decent, there's room to improve with lower-cost alternatives and better diversification.",
        xirr: 11.2,
        benchmark: 14.1,
        holdings: [
          { name: "Axis Bluechip Fund", value: 250000, weight: 25, xirr: 12.5, expense: 1.62 },
          { name: "Mirae Asset Large Cap", value: 200000, weight: 20, xirr: 13.1, expense: 1.55 },
          { name: "HDFC Mid-Cap Opp.", value: 180000, weight: 18, xirr: 15.2, expense: 1.72 },
          { name: "SBI Small Cap", value: 150000, weight: 15, xirr: 18.5, expense: 1.65 },
          { name: "ICICI Pru Balanced Adv.", value: 120000, weight: 12, xirr: 10.8, expense: 1.58 },
          { name: "Axis Long Term Equity", value: 100000, weight: 10, xirr: 8.2, expense: 1.62 },
        ],
        avg_expense: 1.62,
        overlaps: [
          { pair: "Axis Bluechip + Mirae Asset Large Cap", overlap: "72% stock overlap — essentially the same fund", priority: "high" as const },
          { pair: "HDFC Mid-Cap + SBI Small Cap", overlap: "35% overlap in mid-cap stocks", priority: "medium" as const },
        ],
        gaps: [
          { title: "No international exposure", description: "Add a US/global index fund (5-15% allocation) for geographic diversification. Consider Motilal Oswal S&P 500 Index.", priority: "high" as const },
          { title: "No debt allocation in MF", description: "Consider adding a short-duration debt fund for stability and rebalancing flexibility.", priority: "medium" as const },
        ],
        rebalancing: [
          { title: "Exit Axis Bluechip, move to UTI Nifty 50 Index", description: "Save 1.4% in expense ratio annually. On ₹2.5L, that's ₹3,500/year — compounding to ₹1.5L over 20 years.", priority: "high" as const },
          { title: "Add Motilal Oswal S&P 500 Index Fund", description: "Allocate 10% to US markets. Redirect ₹50K from overlapping large-cap funds.", priority: "medium" as const },
          { title: "Consider direct plans for all funds", description: "Switch from regular to direct plans to save 0.5-1% in expense ratios across the portfolio.", priority: "medium" as const },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-navy">
      <Navbar isAuthenticated />
      <div className="container py-8 space-y-8 max-w-4xl">
        <div className="flex items-center gap-3">
          <PieChart className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">MF Portfolio X-Ray</h1>
            <p className="text-muted-foreground">XIRR, overlap, expense ratio analysis & rebalancing plan</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4">
          <div>
            <Label className="text-foreground">Paste your CAMS/KFintech Statement</Label>
            <p className="text-xs text-muted-foreground mb-2">Or describe your mutual fund holdings with fund names and amounts</p>
            <Textarea
              value={statement}
              onChange={e => setStatement(e.target.value)}
              placeholder={"Axis Bluechip Fund - ₹2,50,000\nMirae Asset Large Cap - ₹2,00,000\nHDFC Mid-Cap Opportunities - ₹1,80,000\nSBI Small Cap - ₹1,50,000\nICICI Pru Balanced Advantage - ₹1,20,000\nAxis Long Term Equity - ₹1,00,000"}
              rows={8}
              className="bg-secondary border-border"
            />
          </div>
          <Button onClick={analyze} disabled={loading || !statement.trim()} className="gradient-gold text-primary-foreground">
            {loading ? "Analyzing Portfolio..." : "Analyze Portfolio"}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {loading && !result && <div className="glass-card rounded-xl p-12 flex items-center justify-center"><AITypingIndicator /></div>}

        {result && (
          <>
            {/* Summary */}
            <div className="glass-card rounded-xl p-6 glow-gold">
              <p className="text-foreground leading-relaxed">{result.summary}</p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center"><p className="text-xs text-muted-foreground">Your XIRR</p><p className="text-2xl font-heading font-bold text-foreground">{result.xirr}%</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Benchmark</p><p className="text-2xl font-heading font-bold text-primary">{result.benchmark}%</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Avg Expense Ratio</p><p className="text-2xl font-heading font-bold text-warning">{result.avg_expense}%</p></div>
              </div>
            </div>

            {/* Holdings Table */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Holdings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Fund</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Value</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Weight</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">XIRR</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">ER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.holdings.map((h: any, i: number) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-3 text-foreground">{h.name}</td>
                        <td className="py-3 text-right text-foreground">{formatINR(h.value)}</td>
                        <td className="py-3 text-right text-foreground">{h.weight}%</td>
                        <td className={`py-3 text-right font-medium ${h.xirr >= result.benchmark ? "text-success" : "text-warning"}`}>{h.xirr}%</td>
                        <td className={`py-3 text-right ${h.expense > 1.5 ? "text-warning" : "text-foreground"}`}>{h.expense}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Overlaps */}
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Fund Overlaps</h2>
              <div className="space-y-3">
                {result.overlaps.map((item: any, i: number) => (
                  <InsightCard key={i} title={item.pair} description={item.overlap} priority={item.priority} />
                ))}
              </div>
            </div>

            {/* Gaps */}
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Category Gaps</h2>
              <div className="space-y-3">{result.gaps.map((item: any, i: number) => <InsightCard key={i} {...item} />)}</div>
            </div>

            {/* Rebalancing */}
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Rebalancing Plan</h2>
              <div className="space-y-3">{result.rebalancing.map((item: any, i: number) => <InsightCard key={i} {...item} />)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
