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
import { Calculator, ArrowRight } from "lucide-react";

export default function TaxWizardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [salary, setSalary] = useState({ basic: "", hra: "", lta: "", special: "" });
  const [deductions, setDeductions] = useState({ sec80c: "", sec80d: "", sec80ccd: "", hra_rent: "", home_loan: "" });
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
    try {
      const { data, error } = await supabase.functions.invoke("ai-mentor", {
        body: {
          module: "tax-wizard",
          profile,
          inputs: {
            basic: parseFloat(salary.basic) || 0,
            hra: parseFloat(salary.hra) || 0,
            lta: parseFloat(salary.lta) || 0,
            special: parseFloat(salary.special) || 0,
            sec80c: parseFloat(deductions.sec80c) || 0,
            sec80d: parseFloat(deductions.sec80d) || 0,
            sec80ccd: parseFloat(deductions.sec80ccd) || 0,
            rent: parseFloat(deductions.hra_rent) || 0,
            homeLoan: parseFloat(deductions.home_loan) || 0,
          },
        },
      });
      if (error) throw error;
      // Map AI response to component's expected format
      setResult({
        punchline: data.recommendation || `You can save ${formatINR(data.savings || 0)} by optimizing your tax regime.`,
        comparison: {
          old: { taxable: data.old_regime?.taxable_income || 0, tax: data.old_regime?.tax || 0, deductions: data.old_regime?.deductions_used || 0 },
          new: { taxable: data.new_regime?.taxable_income || 0, tax: data.new_regime?.tax || 0, deductions: 75000 },
        },
        better_regime: (data.old_regime?.tax || 0) < (data.new_regime?.tax || 0) ? "Old" : "New",
        missed_deductions: (data.missing_deductions || []).map((d: any) => ({
          title: `${d.section}: ${d.description}`,
          description: `Max limit: ${formatINR(d.max_limit)}. Potential saving: ${formatINR(d.potential_saving)}`,
          priority: "high" as const,
        })),
        recommendation: data.recommendation || "",
        tax_saving_investments: data.tax_saving_investments || [],
      });
    } catch {
      // Fallback local calculation
      const gross = (parseFloat(salary.basic) || 0) + (parseFloat(salary.hra) || 0) + (parseFloat(salary.lta) || 0) + (parseFloat(salary.special) || 0);
      const basicAnnual = (parseFloat(salary.basic) || 0) * 12;
      const sec80c = parseFloat(deductions.sec80c) || 0;
      const sec80d = parseFloat(deductions.sec80d) || 0;
      const sec80ccd = parseFloat(deductions.sec80ccd) || 0;
      const hraRent = parseFloat(deductions.hra_rent) || 0;
      const homeLoan = parseFloat(deductions.home_loan) || 0;
      const annualGross = gross * 12;
      const standardDeductionOld = 50000;
      const hraExempt = Math.min((parseFloat(salary.hra) || 0) * 12, hraRent * 12 - 0.1 * basicAnnual, 0.5 * basicAnnual);
      const totalDeductionsOld = standardDeductionOld + Math.max(hraExempt, 0) + Math.min(sec80c, 150000) + Math.min(sec80d, 75000) + Math.min(sec80ccd, 50000) + Math.min(homeLoan, 200000);
      const taxableOld = Math.max(annualGross - totalDeductionsOld, 0);
      let taxOld = 0;
      if (taxableOld > 1000000) taxOld += (taxableOld - 1000000) * 0.3;
      if (taxableOld > 500000) taxOld += Math.min(taxableOld - 500000, 500000) * 0.2;
      if (taxableOld > 250000) taxOld += Math.min(taxableOld - 250000, 250000) * 0.05;
      taxOld *= 1.04;
      const taxableNew = Math.max(annualGross - 75000, 0);
      let taxNew = 0;
      const slabs = [400000, 400000, 400000, 400000, 400000];
      const rates = [0.05, 0.10, 0.15, 0.20, 0.30];
      let remaining = Math.max(taxableNew - 400000, 0);
      for (let i = 0; i < slabs.length && remaining > 0; i++) {
        const taxable = Math.min(remaining, slabs[i]);
        taxNew += taxable * rates[i];
        remaining -= taxable;
      }
      taxNew *= 1.04;
      const savings = Math.abs(taxOld - taxNew);
      const betterRegime = taxOld < taxNew ? "Old" : "New";
      setResult({
        punchline: `You can save ${formatINR(Math.round(savings))} by choosing the ${betterRegime} regime for FY 2025-26.`,
        comparison: {
          old: { taxable: Math.round(taxableOld), tax: Math.round(taxOld), deductions: Math.round(totalDeductionsOld) },
          new: { taxable: Math.round(taxableNew), tax: Math.round(taxNew), deductions: 75000 },
        },
        better_regime: betterRegime,
        missed_deductions: [],
        recommendation: betterRegime === "Old"
          ? "The Old Regime works better because your deductions significantly reduce taxable income."
          : "The New Regime is more beneficial since your deductions don't offset the lower slab rates.",
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
          <Calculator className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Tax Wizard</h1>
            <p className="text-muted-foreground">Old vs New regime comparison with missed deduction analysis</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-6">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Monthly Salary Structure</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-foreground">Basic (₹/month)</Label><Input type="number" value={salary.basic} onChange={e => setSalary(p => ({ ...p, basic: e.target.value }))} placeholder="40000" className="bg-secondary border-border mt-1" /></div>
              <div><Label className="text-foreground">HRA (₹/month)</Label><Input type="number" value={salary.hra} onChange={e => setSalary(p => ({ ...p, hra: e.target.value }))} placeholder="16000" className="bg-secondary border-border mt-1" /></div>
              <div><Label className="text-foreground">LTA (₹/month)</Label><Input type="number" value={salary.lta} onChange={e => setSalary(p => ({ ...p, lta: e.target.value }))} placeholder="3000" className="bg-secondary border-border mt-1" /></div>
              <div><Label className="text-foreground">Special Allowance (₹/month)</Label><Input type="number" value={salary.special} onChange={e => setSalary(p => ({ ...p, special: e.target.value }))} placeholder="21000" className="bg-secondary border-border mt-1" /></div>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Existing Deductions (Annual)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-foreground">80C Investments (₹)</Label><Input type="number" value={deductions.sec80c} onChange={e => setDeductions(p => ({ ...p, sec80c: e.target.value }))} placeholder="150000" className="bg-secondary border-border mt-1" /></div>
              <div><Label className="text-foreground">80D Health Insurance (₹)</Label><Input type="number" value={deductions.sec80d} onChange={e => setDeductions(p => ({ ...p, sec80d: e.target.value }))} placeholder="25000" className="bg-secondary border-border mt-1" /></div>
              <div><Label className="text-foreground">80CCD NPS (₹)</Label><Input type="number" value={deductions.sec80ccd} onChange={e => setDeductions(p => ({ ...p, sec80ccd: e.target.value }))} placeholder="50000" className="bg-secondary border-border mt-1" /></div>
              <div><Label className="text-foreground">Monthly Rent for HRA (₹)</Label><Input type="number" value={deductions.hra_rent} onChange={e => setDeductions(p => ({ ...p, hra_rent: e.target.value }))} placeholder="20000" className="bg-secondary border-border mt-1" /></div>
              <div><Label className="text-foreground">Home Loan Interest (₹/yr)</Label><Input type="number" value={deductions.home_loan} onChange={e => setDeductions(p => ({ ...p, home_loan: e.target.value }))} placeholder="0" className="bg-secondary border-border mt-1" /></div>
            </div>
          </div>

          <Button onClick={analyze} disabled={loading} className="gradient-gold text-primary-foreground font-medium">
            {loading ? "Calculating..." : "Compare Tax Regimes"}
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
            {/* Punchline */}
            <div className="glass-card rounded-xl p-6 glow-gold text-center">
              <p className="text-xl font-heading font-bold text-primary">{result.punchline}</p>
              <p className="text-sm text-muted-foreground mt-2">{result.recommendation}</p>
            </div>

            {/* Comparison Table */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Regime Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-muted-foreground font-medium">Parameter</th>
                      <th className={`text-right py-3 font-medium ${result.better_regime === "Old" ? "text-primary" : "text-muted-foreground"}`}>
                        Old Regime {result.better_regime === "Old" && "✓"}
                      </th>
                      <th className={`text-right py-3 font-medium ${result.better_regime === "New" ? "text-primary" : "text-muted-foreground"}`}>
                        New Regime {result.better_regime === "New" && "✓"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 text-foreground">Total Deductions</td>
                      <td className="py-3 text-right text-foreground">{formatINR(result.comparison.old.deductions)}</td>
                      <td className="py-3 text-right text-foreground">{formatINR(result.comparison.new.deductions)}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 text-foreground">Taxable Income</td>
                      <td className="py-3 text-right text-foreground">{formatINR(result.comparison.old.taxable)}</td>
                      <td className="py-3 text-right text-foreground">{formatINR(result.comparison.new.taxable)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-foreground">Tax Payable (incl. cess)</td>
                      <td className={`py-3 text-right font-semibold ${result.better_regime === "Old" ? "text-success" : "text-foreground"}`}>{formatINR(result.comparison.old.tax)}</td>
                      <td className={`py-3 text-right font-semibold ${result.better_regime === "New" ? "text-success" : "text-foreground"}`}>{formatINR(result.comparison.new.tax)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Missed Deductions */}
            {result.missed_deductions.length > 0 && (
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Missed Deductions & Savings Potential</h2>
                <div className="space-y-3">
                  {result.missed_deductions.map((item: any, i: number) => <InsightCard key={i} {...item} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
