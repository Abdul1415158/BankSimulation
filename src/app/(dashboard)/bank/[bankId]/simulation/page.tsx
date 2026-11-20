"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AdvanceQuarterForm } from "@/components/simulation/AdvanceQuarterForm";
import { Badge } from "@/components/ui/badge";
import { getBank, getSimulationState, getEconomicCondition, getEvents, SimulationState, EconomicCondition, CrisisEvent } from "@/lib/storage";
import type { Bank } from "@/types/bank";

export default function SimulationPage() {
  const params = useParams();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [state, setState] = useState<SimulationState | null>(null);
  const [economy, setEconomy] = useState<EconomicCondition | null>(null);
  const [activeCrisis, setActiveCrisis] = useState<CrisisEvent | null>(null);

  useEffect(() => {
    if (!bankId) return;
    const b = getBank(bankId);
    const s = getSimulationState(bankId);
    const e = getEconomicCondition(bankId);
    const evs = getEvents(bankId);
    setBank(b);
    setState(s);
    setEconomy(e);
    setActiveCrisis(evs.find((x) => !x.resolved) || null);
  }, [bankId]);

  if (!bank || !state || !economy) return <div className="p-6">Loading quarterly simulation controls...</div>;

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs">
            Year {bank.current_year} • Quarter {bank.current_quarter}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Rate: {economy.central_bank_rate}%
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Advance Quarterly Simulation</h1>
        <p className="text-sm text-muted-foreground">
          Calibrate quarterly interest margins, operational budgets, and crisis mitigation before submitting results to the simulation engine.
        </p>
      </div>

      <AdvanceQuarterForm
        bankId={bankId}
        currency={bank.currency || "USD"}
        currentQuarter={bank.current_quarter}
        currentYear={bank.current_year}
        benchmarkRate={economy.central_bank_rate}
        activeCrisis={activeCrisis}
      />
    </div>
  );
}
