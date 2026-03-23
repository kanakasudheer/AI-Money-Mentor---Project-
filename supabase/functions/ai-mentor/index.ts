import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Artha — India's most trusted AI personal finance mentor. You speak to everyday Indians: salaried professionals, young earners, and aspiring investors.

Your personality: Warm, confident, jargon-free. You never talk down to users. You explain complex concepts using simple analogies. You are direct — you give specific recommendations with rupee amounts, not vague advice.

Your expertise covers:
- Indian tax laws: 80C, 80D, 80CCD, 80E, 80TTA, 24(b), HRA exemption, old vs new regime (FY 2025-26)
- Investment products: ELSS, PPF, NPS, EPF, SIP, index funds, SGBs, REITs, FDs
- Insurance: Term life, health insurance (min ₹10L family floater)
- FIRE planning: 25x rule, India inflation 6%, equity 12% CAGR, debt 7%, gold 8%
- Life events: Bonus deployment, inheritance, marriage, baby, home purchase
- Portfolio analysis: XIRR, fund overlap, expense ratios, benchmarking

Rules:
- Use ₹ for all amounts. Format: ₹50,000 / ₹5 lakh / ₹1.2 crore
- Never recommend specific stock picks
- Always caveat with "consult a SEBI-registered advisor"
- If emergency fund < 3 months expenses, address that first
- Never suggest lock-in investments if user has >12% debt
- Model optimistic and conservative scenarios

CRITICAL: You MUST respond with valid JSON only. No markdown, no code fences, no extra text.`;

function getModulePrompt(module: string, profile: any, inputs: any): string {
  const profileSummary = `User Profile: Name: ${profile?.name || "User"}, Age: ${profile?.age || 30}, City: ${profile?.city || "Metro"}, Monthly Income: ₹${profile?.monthly_income || 0}, Monthly Expenses: ₹${profile?.monthly_expenses || 0}, Monthly EMI: ₹${profile?.monthly_emi || 0}, Equity: ₹${profile?.equity || 0}, Debt Investments: ₹${profile?.debt_investments || 0}, Gold: ₹${profile?.gold || 0}, PF/PPF: ₹${profile?.pf_ppf || 0}, NPS: ₹${profile?.nps || 0}, Total Debt: ₹${profile?.total_debt || 0}, Health Insurance: ₹${profile?.health_insurance || 0}, Life Insurance: ₹${profile?.life_insurance || 0}.`;

  switch (module) {
    case "fire-planner":
      return `${profileSummary}

User wants to retire at age ${inputs?.retirementAge || 50} with monthly expenses of ₹${inputs?.monthlyExpenseGoal || 50000}.

Return JSON with this exact structure:
{
  "fire_age": number,
  "corpus_needed": number,
  "monthly_sip": number,
  "years_to_fire": number,
  "asset_allocation": { "equity": number, "debt": number, "gold": number },
  "sip_roadmap": [{ "phase": string, "years": string, "monthly_sip": number, "equity_pct": number, "debt_pct": number, "gold_pct": number }],
  "insurance_gaps": [{ "title": string, "description": string, "priority": "high"|"medium"|"low" }],
  "tax_moves": [{ "title": string, "description": string, "priority": "high"|"medium"|"low" }],
  "emergency_fund": { "target": number, "current_estimate": number },
  "motivation": string
}`;

    case "money-health":
      return `${profileSummary}

Analyze this user's complete financial health. Score each dimension 0-100.

Return JSON:
{
  "overall_score": number,
  "diagnosis": string,
  "dimensions": [{ "name": string, "score": number, "description": string }],
  "action_items": [{ "title": string, "description": string, "priority": "high"|"medium"|"low" }]
}

Dimensions must be exactly: Emergency Preparedness, Insurance Coverage, Investment Diversification, Debt Health, Tax Efficiency, Retirement Readiness. Provide exactly 3 action items ranked by impact.`;

    case "life-events":
      return `${profileSummary}

Life event: ${inputs?.event || "bonus"}. Amount involved: ₹${inputs?.amount || 0}.

Return JSON:
{
  "summary": string,
  "immediate": [{ "title": string, "description": string, "priority": "high"|"medium"|"low" }],
  "medium_term": [{ "title": string, "description": string, "priority": "high"|"medium"|"low"|"info" }],
  "long_term": [{ "title": string, "description": string, "priority": "medium"|"info" }],
  "mistake": string
}

Provide 3 immediate actions, 3 medium-term moves, 2 long-term shifts. Include tax angle and common mistake.`;

    case "tax-wizard":
      return `${profileSummary}

Salary structure: Basic: ₹${inputs?.basic || 0}/month, HRA: ₹${inputs?.hra || 0}/month, LTA: ₹${inputs?.lta || 0}/month, Special Allowance: ₹${inputs?.special || 0}/month.
Existing deductions: 80C: ₹${inputs?.sec80c || 0}, 80D: ₹${inputs?.sec80d || 0}, 80CCD(1B): ₹${inputs?.sec80ccd || 0}, Home Loan Interest: ₹${inputs?.homeLoan || 0}, Monthly Rent: ₹${inputs?.rent || 0}.

Calculate old vs new regime tax for FY 2025-26. Return JSON:
{
  "recommendation": string,
  "savings": number,
  "old_regime": { "taxable_income": number, "tax": number, "deductions_used": number },
  "new_regime": { "taxable_income": number, "tax": number },
  "missing_deductions": [{ "section": string, "description": string, "max_limit": number, "potential_saving": number }],
  "tax_saving_investments": [{ "title": string, "description": string, "priority": "high"|"medium"|"low" }]
}`;

    case "couples-planner":
      return `${profileSummary}

Partner data: Name: ${inputs?.name || "Partner 2"}, Income: ₹${inputs?.income || 0}/month, Expenses: ₹${inputs?.expenses || 0}/month, Investments: ₹${inputs?.investments || 0}, Rent: ₹${inputs?.rent || 0}/month, Health Insurance: ₹${inputs?.insurance_health || 0}.

Optimize as one financial unit. Return JSON:
{
  "combined_net_worth": number,
  "savings_rate": number,
  "combined_income": number,
  "hra": { "claimer": string, "reason": string },
  "sip_split": string,
  "nps": string,
  "insurance": string,
  "action_plan": [{ "title": string, "description": string, "priority": "high"|"medium"|"low" }]
}

Provide 4 action items in the plan.`;

    case "portfolio-xray":
      return `${profileSummary}

Portfolio statement text:
${inputs?.statement || "No statement provided"}

Parse and analyze. Return JSON:
{
  "summary": string,
  "xirr": number,
  "benchmark": number,
  "holdings": [{ "name": string, "value": number, "weight": number, "xirr": number, "expense": number }],
  "avg_expense": number,
  "overlaps": [{ "pair": string, "overlap": string, "priority": "high"|"medium"|"low" }],
  "gaps": [{ "category": string, "suggestion": string, "priority": "high"|"medium"|"low"|"info" }],
  "rebalancing": [{ "title": string, "description": string, "priority": "high"|"medium"|"low" }]
}`;

    default:
      return `${profileSummary}\n\nProvide general financial advice as JSON: { "advice": string }`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { module, profile, inputs } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = getModulePrompt(module, profile, inputs);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("Gateway error:", response.status, errText);
      throw new Error(`Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    let content = aiResponse.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-mentor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
