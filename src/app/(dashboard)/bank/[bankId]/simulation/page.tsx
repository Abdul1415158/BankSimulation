import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AdvanceQuarterForm } from "@/components/simulation/AdvanceQuarterForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  Zap,
  TrendingUp,
  Landmark,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default async function SimulationPage({
  params,
}: {
  params: Promise<{ bankId: string }>;
}) {
  const { bankId } = await params;
  const supabase = await createClient();

  const { data: bank } = await supabase
    .from("banks")
    .select("*")
    .eq("id", bankId)
    .single();

  if (!bank) notFound();

  const { data: simState } = await supabase
    .from("simulation_states")
    .select("*")
    .eq("bank_id", bankId)
    .single();

  const { data: macro } = await supabase
    .from("economic_conditions")
    .select("*")
    .eq("bank_id", bankId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const { data: activeCrises } = await supabase
    .from("crisis_events")
    .select("*")
    .eq("bank_id", bankId)
    .eq("resolved", false);

  const activeCrisis = activeCrises && activeCrises.length > 0 ? activeCrises[0] : null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs">
            Year {simState?.current_year ?? 1} • Quarter {simState?.current_quarter ?? 1}
          </Badge>
          <Badge variant="secondary" className="text-xs capitalize">
            {macro?.market_sentiment ?? "Stable"} Economy
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Quarterly Decision Center</h1>
        <p className="text-sm text-muted-foreground">
          Calibrate deposit and lending interest rates, capital allocation, and resolve crisis contingencies before executing the next quarterly simulation tick.
        </p>
      </div>

      <AdvanceQuarterForm
        bankId={bankId}
        currency={bank.currency}
        currentQuarter={simState?.current_quarter ?? 1}
        currentYear={simState?.current_year ?? 1}
        benchmarkRate={Number(macro?.benchmark_interest_rate ?? 0.045)}
        activeCrisis={activeCrisis}
      />
    </div>
  );
}
