import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { Navbar } from "@/components/Navbar";
import { Flame, Heart, Calendar, Calculator, Users, PieChart, ArrowRight, Star, Shield, TrendingUp } from "lucide-react";

const features = [
  { icon: Flame, title: "FIRE Path Planner", description: "Get a personalized month-by-month SIP roadmap to financial independence with asset allocation shifts by decade.", path: "/fire-planner" },
  { icon: Heart, title: "Money Health Score", description: "See your financial fitness scored across 6 dimensions — emergency fund, insurance, investments, debt, tax, and retirement.", path: "/money-health" },
  { icon: Calendar, title: "Life Event Advisor", description: "Got a bonus, inheritance, or planning a wedding? Get instant AI strategies tailored to your life changes.", path: "/life-events" },
  { icon: Calculator, title: "Tax Wizard", description: "Old regime vs new regime — know exactly which saves more, with every missed deduction surfaced automatically.", path: "/tax-wizard" },
  { icon: Users, title: "Couple's Planner", description: "Optimize HRA claims, SIP splits, NPS contributions across both partners for maximum tax efficiency.", path: "/couples-planner" },
  { icon: PieChart, title: "MF Portfolio X-Ray", description: "Paste your CAMS statement, get XIRR, fund overlap, expense ratio analysis, and rebalancing recommendations.", path: "/portfolio-xray" },
];

const testimonials = [
  { name: "Priya S.", role: "Software Engineer, Bengaluru", text: "Artha helped me realize I was paying ₹18,000/year more in tax than I needed to. The Tax Wizard is incredible.", stars: 5 },
  { name: "Rahul M.", role: "Product Manager, Mumbai", text: "The FIRE Planner gave me a clear path to retire by 45. I now know exactly how much SIP I need each month.", stars: 5 },
  { name: "Ananya K.", role: "Doctor, Delhi", text: "As a couple, we were clueless about optimizing our finances together. The Couple's Planner changed everything.", stars: 5 },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-navy">
      <Navbar />

      {/* Hero */}
      <section className="container pt-20 pb-24 text-center">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Shield className="w-4 h-4" />
            Powered by AI • Trusted by 10,000+ Indians
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Your Personal <span className="text-gradient-gold">Finance Mentor</span>,
            <br />Powered by AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get the same quality financial advice that costs ₹50,000/year from a certified planner — 
            personalized for your income, goals, and life stage. 100% free.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              size="lg"
              className="gradient-gold text-primary-foreground font-semibold text-base px-8 animate-pulse-gold"
              onClick={() => navigate("/auth")}
            >
              Get Your Free Financial Health Score
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-success" />
              <span>₹2,400 Cr+ managed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-primary" />
              <span>SEBI-aware advice</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-24">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-3">6 Powerful Financial Modules</h2>
          <p className="text-muted-foreground">Each module is a mini financial advisor, powered by AI and tailored to Indian tax laws and products.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <FeatureCard
              key={f.title}
              icon={f.icon}
              title={f.title}
              description={f.description}
              onClick={() => navigate("/auth")}
            />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container pb-24">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-3">Loved by Indians Everywhere</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="glass-card rounded-xl p-6 space-y-4">
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="glass-card rounded-2xl p-12 text-center glow-gold">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join 10,000+ Indians who are using AI to build wealth smarter. It takes 5 minutes to get started.
          </p>
          <Button
            size="lg"
            className="gradient-gold text-primary-foreground font-semibold text-base px-8"
            onClick={() => navigate("/auth")}
          >
            Start Free — No Credit Card Needed
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>AI Money Mentor is for educational purposes. Always consult a SEBI-registered advisor for personalized advice.</p>
          <p className="mt-2">© 2025 AI Money Mentor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
