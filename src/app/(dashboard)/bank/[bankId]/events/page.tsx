import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  Zap,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ bankId: string }>;
}) {
  const { bankId } = await params;
  const supabase = await createClient();

  const { data: bank } = await supabase
    .from("banks")
    .select("currency")
    .eq("id", bankId)
    .single();

  if (!bank) notFound();

  const { data: crises } = await supabase
    .from("crisis_events")
    .select("*")
    .eq("bank_id", bankId)
    .order("created_at", { ascending: false });

  const activeCrisis = (crises ?? []).find((c) => !c.resolved);
  const resolvedCrises = (crises ?? []).filter((c) => c.resolved);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Economic Events & Crisis Management</h1>
          <p className="text-sm text-muted-foreground">
            Respond to liquidity runs, macroeconomic shocks, regulatory audits, and cyber incidents.
          </p>
        </div>
      </div>

      {/* Active Crisis Card */}
      {activeCrisis ? (
        <Card className="border-destructive/40 bg-destructive/5 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center">
                  <ShieldAlert className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-destructive">
                    ACTIVE CRISIS: {activeCrisis.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Triggered in Quarter {activeCrisis.quarter_triggered} • Severity: {activeCrisis.severity.toUpperCase()}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="destructive" className="uppercase animate-pulse">
                Action Required
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground leading-relaxed">
              {activeCrisis.description}
            </p>

            <div className="pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Available Management Response Pathways
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(activeCrisis.options ?? []).map((opt: any) => (
                  <div
                    key={opt.id}
                    className="p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">{opt.label}</span>
                        <span className="text-xs font-mono-numbers text-destructive font-medium">
                          {formatCurrency(opt.cost, bank.currency)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {opt.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                      <span>Mitigates: {Math.round(opt.mitigationPct * 100)}%</span>
                      <Button size="xs" variant="outline" className="h-6 text-xs">
                        Select Plan
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="py-6 flex items-center gap-4">
            <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Operating Conditions Normal
              </h3>
              <p className="text-xs text-muted-foreground">
                No active crises detected. Liquidity, credit delinquency, and regulatory indicators are currently within standard operating tolerances.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Incident & Crisis History</CardTitle>
          <CardDescription className="text-xs">
            Audit record of prior market shocks, management decisions, and remediation outcomes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resolvedCrises.length > 0 ? (
            <div className="space-y-3">
              {resolvedCrises.map((c) => (
                <div key={c.id} className="p-3 rounded-lg border border-border flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">{c.title}</h4>
                    <span className="text-xs text-muted-foreground">Quarter {c.quarter_triggered} • Resolved</span>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/20">
                    Mitigated
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No historical crises recorded yet. As your bank grows through quarterly simulation, macroeconomic events will appear here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
