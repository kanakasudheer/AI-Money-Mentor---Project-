import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const steps = ["Personal Info", "Income & Expenses", "Investments", "Debt & Insurance", "Goals"];

interface OnboardingData {
  name: string;
  age: string;
  city: string;
  monthly_income: string;
  monthly_expenses: string;
  equity: string;
  debt_investments: string;
  gold: string;
  pf_ppf: string;
  nps: string;
  total_debt: string;
  monthly_emi: string;
  life_insurance: string;
  health_insurance: string;
  goals: { name: string; amount: string; years: string }[];
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    name: "", age: "", city: "",
    monthly_income: "", monthly_expenses: "",
    equity: "", debt_investments: "", gold: "", pf_ppf: "", nps: "",
    total_debt: "", monthly_emi: "", life_insurance: "", health_insurance: "",
    goals: [{ name: "Retirement", amount: "", years: "" }, { name: "Emergency Fund", amount: "", years: "" }],
  });

  const update = (field: string, value: string) => setData(prev => ({ ...prev, [field]: value }));
  const updateGoal = (i: number, field: string, value: string) => {
    const goals = [...data.goals];
    goals[i] = { ...goals[i], [field]: value };
    setData(prev => ({ ...prev, goals }));
  };
  const addGoal = () => setData(prev => ({ ...prev, goals: [...prev.goals, { name: "", amount: "", years: "" }] }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("user_profiles").upsert({
        id: user.id,
        name: data.name,
        age: parseInt(data.age) || 0,
        city: data.city,
        monthly_income: parseFloat(data.monthly_income) || 0,
        monthly_expenses: parseFloat(data.monthly_expenses) || 0,
        equity: parseFloat(data.equity) || 0,
        debt_investments: parseFloat(data.debt_investments) || 0,
        gold: parseFloat(data.gold) || 0,
        pf_ppf: parseFloat(data.pf_ppf) || 0,
        nps: parseFloat(data.nps) || 0,
        total_debt: parseFloat(data.total_debt) || 0,
        monthly_emi: parseFloat(data.monthly_emi) || 0,
        life_insurance: parseFloat(data.life_insurance) || 0,
        health_insurance: parseFloat(data.health_insurance) || 0,
        onboarding_complete: true,
      });
      if (error) throw error;

      // Save goals
      for (const goal of data.goals) {
        if (goal.name && goal.amount) {
          await supabase.from("financial_goals").insert({
            user_id: user.id,
            name: goal.name,
            target_amount: parseFloat(goal.amount) || 0,
            target_years: parseInt(goal.years) || 10,
            current_amount: 0,
          });
        }
      }

      toast.success("Profile created! Let's explore your financial health.");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div><Label className="text-foreground">Full Name</Label><Input value={data.name} onChange={e => update("name", e.target.value)} placeholder="Rahul Sharma" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">Age</Label><Input type="number" value={data.age} onChange={e => update("age", e.target.value)} placeholder="28" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">City</Label><Input value={data.city} onChange={e => update("city", e.target.value)} placeholder="Mumbai" className="bg-secondary border-border mt-1" /></div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div><Label className="text-foreground">Monthly Income (₹)</Label><Input type="number" value={data.monthly_income} onChange={e => update("monthly_income", e.target.value)} placeholder="80000" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">Monthly Expenses (₹)</Label><Input type="number" value={data.monthly_expenses} onChange={e => update("monthly_expenses", e.target.value)} placeholder="45000" className="bg-secondary border-border mt-1" /></div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Enter current value of your investments</p>
            <div><Label className="text-foreground">Equity / Mutual Funds (₹)</Label><Input type="number" value={data.equity} onChange={e => update("equity", e.target.value)} placeholder="500000" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">Debt Instruments / FD (₹)</Label><Input type="number" value={data.debt_investments} onChange={e => update("debt_investments", e.target.value)} placeholder="200000" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">Gold / SGBs (₹)</Label><Input type="number" value={data.gold} onChange={e => update("gold", e.target.value)} placeholder="100000" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">PF + PPF (₹)</Label><Input type="number" value={data.pf_ppf} onChange={e => update("pf_ppf", e.target.value)} placeholder="300000" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">NPS (₹)</Label><Input type="number" value={data.nps} onChange={e => update("nps", e.target.value)} placeholder="50000" className="bg-secondary border-border mt-1" /></div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div><Label className="text-foreground">Total Outstanding Debt (₹)</Label><Input type="number" value={data.total_debt} onChange={e => update("total_debt", e.target.value)} placeholder="0" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">Monthly EMI (₹)</Label><Input type="number" value={data.monthly_emi} onChange={e => update("monthly_emi", e.target.value)} placeholder="0" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">Life Insurance Cover (₹)</Label><Input type="number" value={data.life_insurance} onChange={e => update("life_insurance", e.target.value)} placeholder="5000000" className="bg-secondary border-border mt-1" /></div>
            <div><Label className="text-foreground">Health Insurance Cover (₹)</Label><Input type="number" value={data.health_insurance} onChange={e => update("health_insurance", e.target.value)} placeholder="1000000" className="bg-secondary border-border mt-1" /></div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">What are your financial goals?</p>
            {data.goals.map((goal, i) => (
              <div key={i} className="glass-card rounded-lg p-4 space-y-3">
                <div><Label className="text-foreground">Goal Name</Label><Input value={goal.name} onChange={e => updateGoal(i, "name", e.target.value)} placeholder="Home Purchase" className="bg-secondary border-border mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-foreground">Target Amount (₹)</Label><Input type="number" value={goal.amount} onChange={e => updateGoal(i, "amount", e.target.value)} placeholder="5000000" className="bg-secondary border-border mt-1" /></div>
                  <div><Label className="text-foreground">Years</Label><Input type="number" value={goal.years} onChange={e => updateGoal(i, "years", e.target.value)} placeholder="10" className="bg-secondary border-border mt-1" /></div>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addGoal} className="w-full border-dashed border-border text-muted-foreground hover:text-foreground">
              + Add Another Goal
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground">Let's Know You Better</h1>
          <p className="text-muted-foreground mt-2">Step {step + 1} of {steps.length}: {steps[step]}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <div className="glass-card rounded-xl p-6">
          {renderStep()}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="border-border text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} className="gradient-gold text-primary-foreground">
              Next <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="gradient-gold text-primary-foreground">
              {loading ? "Saving..." : "Complete Setup"} <Check className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
