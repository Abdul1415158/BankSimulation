"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  advanceQuarterInStorage,
  getBank,
  getSimulationState,
  getCustomers,
  getFinalReport,
  SimulationState,
} from "@/lib/storage";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  Zap,
  TrendingUp,
  Percent,
  DollarSign,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Play,
  Calendar,
  AlertCircle,
  Users,
  Building2,
  Award,
  Sparkles,
} from "lucide-react";

interface AdvanceQuarterFormProps {
  bankId: string;
  currency: string;
  currentQuarter: number;
  currentYear: number;
  benchmarkRate: number;
  activeCrisis: any | null;
}

export function AdvanceQuarterForm({
  bankId,
  currency,
  currentQuarter: initialQuarter,
  currentYear: initialYear,
  benchmarkRate,
  activeCrisis,
}: AdvanceQuarterFormProps) {
  const router = useRouter();
  const [successResult, setSuccessResult] = useState<any | null>(null);

  // Live simulation tracking
  const [activeYear, setActiveYear] = useState(initialYear);
  const [activeQuarter, setActiveQuarter] = useState(initialQuarter);
  const [liveState, setLiveState] = useState<SimulationState | null>(null);
  const [customerCount, setCustomerCount] = useState(0);

  // Single-quarter simulation speed & progress state (Simulates EXACTLY 1 Quarter per run)
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState<"1x" | "3x" | "10x" | "boost">("1x");
  const [simProgress, setSimProgress] = useState(0);
  const [annualReportNotice, setAnnualReportNotice] = useState<string | null>(null);

  // Form decisions
  const [retailDepositRate, setRetailDepositRate] = useState(3.5);
  const [commercialDepositRate, setCommercialDepositRate] = useState(3.0);
  const [retailLendingRate, setRetailLendingRate] = useState(7.5);
  const [corporateLendingRate, setCorporateLendingRate] = useState(6.5);
  const [dividendPayoutRatio, setDividendPayoutRatio] = useState(10);
  const [selectedCrisisOptionId, setSelectedCrisisOptionId] = useState<string>(
    activeCrisis?.options?.[0]?.id || ""
  );

  // Load initial live state
  useEffect(() => {
    if (!bankId) return;
    const b = getBank(bankId);
    if (b) {
      setActiveYear(b.current_year);
      setActiveQuarter(b.current_quarter);
    }
    const s = getSimulationState(bankId);
    setLiveState(s);
    setCustomerCount(getCustomers(bankId).length);
  }, [bankId]);

  // Check if simulation mandate (all 20 quarters / 5 years) is completed
  const currentBank = getBank(bankId);
  const isMandateComplete = Boolean(
    currentBank?.status === "completed" ||
    (activeYear >= 5 && activeQuarter >= 4 && getFinalReport(bankId))
  );

  // Single quarter advancement logic (Simulates ONLY the current quarter and stops)
  const executeSingleQuarter = (isMonthlyOnly = false) => {
    try {
      const bCheck = getBank(bankId);
      if (bCheck?.status === "completed" || (activeYear >= 5 && activeQuarter >= 4 && getFinalReport(bankId))) {
        return null;
      }

      const prevYear = activeYear;
      const prevQuarter = activeQuarter;

      const { bank, state } = advanceQuarterInStorage(bankId, {
        savingsRate: retailDepositRate,
        personalLoanSpread: retailLendingRate,
        businessLoanSpread: corporateLendingRate,
        marketingBudget: isMonthlyOnly ? 15000 : 50000,
        trainingBudget: isMonthlyOnly ? 8000 : 25000,
      });

      setActiveYear(bank.current_year);
      setActiveQuarter(bank.current_quarter);
      setLiveState({ ...state });
      setCustomerCount(getCustomers(bankId).length);

      if (prevQuarter === 4) {
        setAnnualReportNotice(`Year ${prevYear} Annual Report Generated!`);
        setTimeout(() => setAnnualReportNotice(null), 5000);
      }

      return {
        bank,
        state,
        completedYear: prevYear,
        completedQuarter: prevQuarter,
        wasYearEnd: prevQuarter === 4,
        isFinal: bank.status === "completed" || (bank.current_year >= 5 && bank.current_quarter === 4),
      };
    } catch (err) {
      console.error("Step advance error:", err);
      return null;
    }
  };

  // Run single quarter at chosen speed, then STOP
  const runQuarterSimulation = (isMonthlyOnly = false) => {
    if (isSimulating || isMandateComplete) return;

    setIsSimulating(true);
    setSimProgress(15);

    const speedDurationMap: Record<string, number> = {
      "1x": 2400,
      "3x": 1200,
      "10x": 500,
      "boost": 120,
    };

    const duration = speedDurationMap[simSpeed] || 2000;
    const intervalMs = Math.max(30, Math.round(duration / 10));

    let currentP = 15;
    const timer = setInterval(() => {
      currentP += 10;
      if (currentP >= 92) {
        clearInterval(timer);
      }
      setSimProgress(Math.min(92, currentP));
    }, intervalMs);

    setTimeout(() => {
      clearInterval(timer);
      setSimProgress(100);

      const res = executeSingleQuarter(isMonthlyOnly);
      setIsSimulating(false);
      setSimProgress(0);

      if (res) {
        setSuccessResult({
          completedYear: res.completedYear,
          completedQuarter: res.completedQuarter,
          nextYear: res.bank.current_year,
          nextQuarter: res.bank.current_quarter,
          netProfit: res.state.net_profit,
          totalAssets: res.state.total_assets,
          capitalAdequacyRatio: res.state.capital_adequacy_ratio / 100,
          customerSatisfaction: res.state.customer_satisfaction,
          wasYearEnd: res.wasYearEnd,
          isFinal: res.isFinal,
        });
      }
    }, duration);
  };

  const handleManualAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    runQuarterSimulation(false);
  };

  if (successResult) {
    return (
      <Card className="border-emerald-500/40 bg-emerald-500/5 shadow-xl transition-all">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="size-11 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-200">
                {successResult.isFinal
                  ? "5-Year Executive Mandate Completed!"
                  : `Year ${successResult.completedYear} · Quarter ${successResult.completedQuarter} Concluded!`}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {successResult.wasYearEnd ? (
                  <strong className="text-emerald-400 font-semibold">
                    Year {successResult.completedYear} (all 4 quarters) successfully finished! Comprehensive Annual Report compiled in Reports desk.
                  </strong>
                ) : (
                  `Quarter ${successResult.completedQuarter} results committed. Advanced to Year ${successResult.nextYear}, Quarter ${successResult.nextQuarter} of 4.`
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-2 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 border-y border-border/60 text-xs">
            <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
              <span className="text-muted-foreground text-[11px] block">Quarter Net Profit</span>
              <p className={`font-bold text-sm font-mono-numbers mt-0.5 ${successResult.netProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {formatCurrency(successResult.netProfit, currency)}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
              <span className="text-muted-foreground text-[11px] block">Total Assets</span>
              <p className="font-bold text-sm font-mono-numbers text-foreground mt-0.5">
                {formatCurrency(successResult.totalAssets, currency)}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
              <span className="text-muted-foreground text-[11px] block">Capital Ratio (CAR)</span>
              <p className="font-bold text-sm font-mono-numbers text-blue-400 mt-0.5">
                {formatPercent(successResult.capitalAdequacyRatio)}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
              <span className="text-muted-foreground text-[11px] block">Customer Trust</span>
              <p className="font-bold text-sm font-mono-numbers text-foreground mt-0.5">
                {successResult.customerSatisfaction}%
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!successResult.isFinal && (
              <Button
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold text-xs sm:text-sm"
                onClick={() => {
                  setSuccessResult(null);
                }}
              >
                <span>Configure Year {successResult.nextYear} · Quarter {successResult.nextQuarter} Decisions</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full sm:w-auto text-xs sm:text-sm"
              onClick={() => {
                setSuccessResult(null);
                router.push(`/bank/${bankId}`);
              }}
            >
              Return to Bank Dashboard
            </Button>

            {successResult.wasYearEnd && (
              <Button
                variant="outline"
                className="w-full sm:w-auto border-blue-500/40 text-blue-400 hover:text-blue-300 text-xs sm:text-sm"
                onClick={() => {
                  setSuccessResult(null);
                  router.push(`/bank/${bankId}/reports`);
                }}
              >
                View Year {successResult.completedYear} Annual Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleManualAdvance} className="space-y-6">
      {/* TIME & SIMULATION CONTROLS BAR (Single-Quarter Run at chosen speed) */}
      <Card className="border-blue-500/30 bg-muted/20 shadow-md overflow-hidden">
        <CardContent className="p-4 space-y-4">
          {/* 5-Year Completion Banner if already done */}
          {isMandateComplete && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-xl text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="size-2 rounded-full bg-amber-400 shrink-0" />
                <span className="text-foreground">
                  <strong className="text-amber-400 font-bold">5-Year Executive Mandate Concluded:</strong> All 20 simulated quarters are finished. Simulation controls are locked to protect official audit filings.
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold shrink-0 text-xs gap-1.5 self-start sm:self-auto"
                onClick={() => router.push(`/bank/${bankId}/reports`)}
              >
                <span>View Annual Reports</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Speed Selector & Run Quarter Action */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1 bg-background border rounded-lg p-0.5 text-xs font-mono">
                <span className="text-[10px] text-muted-foreground uppercase px-2 font-sans font-bold">Speed:</span>
                {(["1x", "3x", "10x", "boost"] as const).map((spd) => (
                  <button
                    type="button"
                    key={spd}
                    disabled={isSimulating || isMandateComplete}
                    onClick={() => setSimSpeed(spd)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      simSpeed === spd
                        ? "bg-blue-600 text-white font-bold shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {spd === "boost" ? "BOOST" : spd}
                  </button>
                ))}
              </div>

              {/* Primary Run Quarter Button (Simulates ONLY the active quarter) */}
              <Button
                type="button"
                size="sm"
                disabled={isSimulating || isMandateComplete}
                onClick={() => runQuarterSimulation(false)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold gap-1.5 text-xs shadow-md"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Simulating Q{activeQuarter} ({simSpeed})...</span>
                  </>
                ) : (
                  <>
                    <Play className="size-3.5" />
                    <span>Run Quarter {activeQuarter} ({simSpeed})</span>
                  </>
                )}
              </Button>
            </div>

            {/* Step Advance / Month Controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => runQuarterSimulation(true)}
                disabled={isSimulating || isMandateComplete}
                className="gap-1 text-xs"
              >
                <Calendar className="size-3.5 text-blue-400" /> Advance Month (30d)
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSimulating || isMandateComplete}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1 text-xs"
              >
                <Zap className="size-3.5" /> Advance Quarter
              </Button>
            </div>
          </div>

          {/* SIMULATION LIVE PROGRESS BAR (Visible while simulating current quarter) */}
          {isSimulating && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-blue-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Processing Year {activeYear} · Quarter {activeQuarter} operations at {simSpeed.toUpperCase()} speed...
                </span>
                <span className="font-mono text-[11px]">{simProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-150 rounded-full"
                  style={{ width: `${simProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* LIVE STATUS MONITOR STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-border/60 text-xs">
            <div className="bg-background/80 p-2.5 rounded-lg border">
              <span className="text-muted-foreground text-[11px]">Current Quarter</span>
              <p className="font-bold text-sm text-blue-400 font-mono-numbers mt-0.5">
                Year {activeYear} · Q{activeQuarter} / 4
              </p>
            </div>
            <div className="bg-background/80 p-2.5 rounded-lg border">
              <span className="text-muted-foreground text-[11px]">Active Customers</span>
              <p className="font-bold text-sm text-foreground font-mono-numbers mt-0.5">
                {customerCount} Accounts
              </p>
            </div>
            <div className="bg-background/80 p-2.5 rounded-lg border">
              <span className="text-muted-foreground text-[11px]">Total Deposits</span>
              <p className="font-bold text-sm font-mono-numbers text-cyan-400 mt-0.5">
                {liveState ? formatCurrency(liveState.total_deposits, currency, true) : "£0"}
              </p>
            </div>
            <div className="bg-background/80 p-2.5 rounded-lg border">
              <span className="text-muted-foreground text-[11px]">Quarterly P&L</span>
              <p
                className={`font-bold text-sm font-mono-numbers mt-0.5 ${
                  liveState && liveState.net_profit >= 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {liveState ? formatCurrency(liveState.net_profit, currency, true) : "£0"}
              </p>
            </div>
            <div className="bg-background/80 p-2.5 rounded-lg border">
              <span className="text-muted-foreground text-[11px]">Capital Ratio (CAR)</span>
              <p className="font-bold text-sm font-mono-numbers text-foreground mt-0.5">
                {liveState ? `${liveState.capital_adequacy_ratio}%` : "100%"}
              </p>
            </div>
          </div>

          {annualReportNotice && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{annualReportNotice} Viewable in Reports desk.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Year-End Q4 Notice */}
      {activeQuarter === 4 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="size-5 text-amber-500 shrink-0" />
            <div className="text-xs">
              <strong className="text-foreground">Quarter 4 of 4 · Year-End Closing:</strong>{" "}
              Running this quarter will conclude Year {activeYear} operations and trigger the generation of the official Annual Report.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Crisis Decision (if any) */}
      {activeCrisis && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                <ShieldAlert className="size-4" /> CRISIS RESPONSE REQUIRED
              </div>
              <Badge variant="destructive">Urgent</Badge>
            </div>
            <CardTitle className="text-base font-semibold">{activeCrisis.title}</CardTitle>
            <CardDescription className="text-xs">{activeCrisis.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label className="text-xs font-semibold">Select Executive Resolution Plan:</Label>
            <div className="space-y-2">
              {(activeCrisis.options ?? []).map((opt: any) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedCrisisOptionId === opt.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-border/80"
                  }`}
                >
                  <input
                    type="radio"
                    name="crisisOption"
                    value={opt.id}
                    checked={selectedCrisisOptionId === opt.id}
                    onChange={(e) => setSelectedCrisisOptionId(e.target.value)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span>{opt.label}</span>
                      <span className="font-mono-numbers text-destructive font-medium">
                        Cost: {formatCurrency(opt.cost, currency)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategic Rates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposit Rate Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Deposit Pricing Policy</CardTitle>
            <CardDescription className="text-xs">
              Higher rates attract more customer accounts and deposit volume, but increase quarterly interest expenses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <Label>Retail Deposit Rate (% p.a.)</Label>
                <span className="font-bold font-mono-numbers">{retailDepositRate.toFixed(2)}%</span>
              </div>
              <Input
                type="number"
                step="0.05"
                min="0.5"
                max="12.0"
                value={retailDepositRate}
                onChange={(e) => setRetailDepositRate(parseFloat(e.target.value) || 0)}
              />
              <p className="text-[11px] text-muted-foreground">
                Central Bank Benchmark Rate: {formatPercent(benchmarkRate)}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <Label>Commercial Deposit Rate (% p.a.)</Label>
                <span className="font-bold font-mono-numbers">{commercialDepositRate.toFixed(2)}%</span>
              </div>
              <Input
                type="number"
                step="0.05"
                min="0.5"
                max="12.0"
                value={commercialDepositRate}
                onChange={(e) => setCommercialDepositRate(parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lending Rate Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Lending Rate Policy</CardTitle>
            <CardDescription className="text-xs">
              Higher lending rates boost interest income margins on loans, but reduce borrower demand and increase NPL risk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <Label>Retail Lending Rate (% p.a.)</Label>
                <span className="font-bold font-mono-numbers">{retailLendingRate.toFixed(2)}%</span>
              </div>
              <Input
                type="number"
                step="0.05"
                min="2.0"
                max="25.0"
                value={retailLendingRate}
                onChange={(e) => setRetailLendingRate(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <Label>Corporate Lending Rate (% p.a.)</Label>
                <span className="font-bold font-mono-numbers">{corporateLendingRate.toFixed(2)}%</span>
              </div>
              <Input
                type="number"
                step="0.05"
                min="2.0"
                max="20.0"
                value={corporateLendingRate}
                onChange={(e) => setCorporateLendingRate(parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout & Capital Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Capital Allocation & Dividends</CardTitle>
          <CardDescription className="text-xs">
            Manage shareholder return vs internal retained earnings buffer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5 max-w-sm">
            <div className="flex justify-between text-xs">
              <Label>Dividend Payout Ratio (% of Net Profit)</Label>
              <span className="font-bold font-mono-numbers">{dividendPayoutRatio}%</span>
            </div>
            <Input
              type="number"
              step="5"
              min="0"
              max="50"
              value={dividendPayoutRatio}
              onChange={(e) => setDividendPayoutRatio(parseInt(e.target.value) || 0)}
            />
            <p className="text-[11px] text-muted-foreground">
              Retaining earnings increases Tier 1 equity and preserves Capital Adequacy Ratio (CAR).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={isSimulating || isMandateComplete}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-8"
        >
          {isSimulating ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Simulating Year {activeYear} · Q{activeQuarter} ({simSpeed})...
            </>
          ) : isMandateComplete ? (
            <>
              <CheckCircle2 className="size-4 mr-2 text-emerald-300" />
              5-Year Mandate Concluded (All 20 Quarters Filed)
            </>
          ) : (
            <>
              <Zap className="size-4 mr-2" />
              Advance to Next Quarter (Year {activeYear} · Q{activeQuarter})
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
