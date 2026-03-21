import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import OnboardingPage from "./pages/OnboardingPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import MoneyHealthPage from "./pages/MoneyHealthPage.tsx";
import FIREPlannerPage from "./pages/FIREPlannerPage.tsx";
import LifeEventsPage from "./pages/LifeEventsPage.tsx";
import TaxWizardPage from "./pages/TaxWizardPage.tsx";
import CouplesPlannerPage from "./pages/CouplesPlannerPage.tsx";
import PortfolioXRayPage from "./pages/PortfolioXRayPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/money-health" element={<MoneyHealthPage />} />
          <Route path="/fire-planner" element={<FIREPlannerPage />} />
          <Route path="/life-events" element={<LifeEventsPage />} />
          <Route path="/tax-wizard" element={<TaxWizardPage />} />
          <Route path="/couples-planner" element={<CouplesPlannerPage />} />
          <Route path="/portfolio-xray" element={<PortfolioXRayPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
