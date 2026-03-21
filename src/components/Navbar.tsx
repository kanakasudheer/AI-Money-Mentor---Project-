import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  isAuthenticated?: boolean;
}

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/fire-planner", label: "FIRE Planner" },
  { to: "/money-health", label: "Health Score" },
  { to: "/tax-wizard", label: "Tax Wizard" },
  { to: "/life-events", label: "Life Events" },
  { to: "/portfolio-xray", label: "Portfolio X-Ray" },
];

export function Navbar({ isAuthenticated }: NavbarProps) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-sm">₹</span>
          </div>
          <span className="font-heading font-bold text-lg text-foreground">AI Money Mentor</span>
        </Link>

        {isAuthenticated && (
          <>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors rounded-md"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </>
        )}

        {!isAuthenticated && (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")} className="text-muted-foreground hover:text-foreground">
              Login
            </Button>
            <Button onClick={() => navigate("/auth")} className="gradient-gold text-primary-foreground font-medium">
              Get Started
            </Button>
          </div>
        )}
      </div>

      {mobileOpen && isAuthenticated && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors rounded-md"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
