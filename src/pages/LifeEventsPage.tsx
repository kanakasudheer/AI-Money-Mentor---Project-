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
import { Calendar, Gift, Heart, Baby, Briefcase, Home, ArrowRight } from "lucide-react";

const events = [
  { id: "bonus", label: "Bonus Received", icon: Gift },
  { id: "inheritance", label: "Inheritance", icon: Gift },
  { id: "marriage", label: "Marriage", icon: Heart },
  { id: "baby", label: "New Baby", icon: Baby },
  { id: "job-change", label: "Job Change", icon: Briefcase },
  { id: "home", label: "Home Purchase", icon: Home },
];

export default function LifeEventsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [amount, setAmount] = useState("");
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
    if (!selectedEvent || !amount) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-mentor", {
        body: { module: "life-events", profile, inputs: { event: selectedEvent, amount: parseFloat(amount) } },
      });
      if (error) throw error;
      setResult(data);
    } catch {
      // Fallback
      const amt = parseFloat(amount);
      setResult({
        summary: `Receiving ${formatINR(amt)} is a significant financial event. Here's how to make the most of it while keeping your long-term goals on track.`,
        immediate: [
          { title: "Park in liquid fund immediately", description: `Move ${formatINR(amt)} to a liquid fund while you plan. Don't let it sit in savings at 3.5% interest.`, priority: "high" as const },
          { title: "Clear high-interest debt first", description: profile?.total_debt > 0 ? `Pay off your ${formatINR(profile.total_debt)} outstanding debt before investing.` : "You're debt-free — great! Skip this step.", priority: "high" as const },
          { title: "Top up emergency fund", description: `Ensure you have ${formatINR((profile?.monthly_expenses || 50000) * 6)} in emergency reserves before investing the rest.`, priority: "medium" as const },
        ],
        medium_term: [
          { title: "Invest via STP over 6 months", description: `Set up a Systematic Transfer Plan from liquid fund to equity: ${formatINR(Math.round(amt * 0.6 / 6))}/month into a Nifty 500 index fund.`, priority: "medium" as const },
          { title: "Max out tax-saving investments", description: "Use ELSS (₹1.5L under 80C) and NPS (₹50K under 80CCD(1B)) if not already done.", priority: "medium" as const },
          { title: "Review insurance coverage", description: "A windfall is the perfect time to get adequate term and health insurance.", priority: "low" as const },
        ],
        long_term: [
          { title: "Rebalance asset allocation", description: "This infusion may skew your allocation. Rebalance to your target equity/debt/gold split.", priority: "medium" as const },
          { title: "Accelerate FIRE timeline", description: `This could shave 2-3 years off your retirement target. Run the FIRE Planner with updated numbers.`, priority: "info" as const },
        ],
        mistake: "The #1 mistake people make: spending the bonus on lifestyle upgrades. A ₹5L car upgrade costs you ₹25L+ in lost investment returns over 20 years.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-navy">
      <Navbar isAuthenticated />
      <div className="container py-8 space-y-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Life Event Advisor</h1>
            <p className="text-muted-foreground">Get AI-powered financial strategies for life's big moments</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">What's happening in your life?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {events.map(e => {
              const Icon = e.icon;
              return (
                <button
                  key={e.id}
                  onClick={() => setSelectedEvent(e.id)}
                  className={`p-4 rounded-lg border transition-all text-left ${selectedEvent === e.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${selectedEvent === e.id ? "text-primary" : "text-muted-foreground"}`} />
                  <p className={`text-sm font-medium ${selectedEvent === e.id ? "text-primary" : "text-foreground"}`}>{e.label}</p>
                </button>
              );
            })}
          </div>

          {selectedEvent && (
            <div>
              <Label className="text-foreground">Amount Involved (₹)</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500000" className="bg-secondary border-border mt-1" />
            </div>
          )}

          <Button onClick={analyze} disabled={!selectedEvent || !amount || loading} className="gradient-gold text-primary-foreground">
            {loading ? "Analyzing..." : "Get AI Strategy"}
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
            <div className="glass-card rounded-xl p-6">
              <p className="text-foreground leading-relaxed">{result.summary}</p>
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Immediate Actions (30 days)</h2>
              <div className="space-y-3">{result.immediate.map((item: any, i: number) => <InsightCard key={i} {...item} />)}</div>
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Medium-Term (3-6 months)</h2>
              <div className="space-y-3">{result.medium_term.map((item: any, i: number) => <InsightCard key={i} {...item} />)}</div>
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Long-Term Strategy</h2>
              <div className="space-y-3">{result.long_term.map((item: any, i: number) => <InsightCard key={i} {...item} />)}</div>
            </div>

            <div className="glass-card rounded-xl p-6 border-destructive/30">
              <h3 className="text-sm font-semibold text-destructive mb-1">⚠️ Common Mistake to Avoid</h3>
              <p className="text-sm text-muted-foreground">{result.mistake}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
