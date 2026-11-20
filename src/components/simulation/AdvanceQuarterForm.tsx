"use client";

import { useState, useEffect, useRef } from "react";
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
  Pause,
  FastForward,
  Flame,
  Calendar,
  AlertCircle,
  Users,
  Building2,
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
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  // Live simulation tracking
  const [activeYear, setActiveYear] = useState(initialYear);
  const [activeQuarter, setActiveQuarter] = useState(initialQuarter);
  const [liveState, setLiveState] = useState<SimulationState | null>(null);
  const [customerCount, setCustomerCount] = useState(0);

  // Time & Simulation controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [simSpeed, setSimSpeed] = useState<"1x" | "3x" | "10x" | "boost">("1x");
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

  // Single step advancement logic
  const stepAdvance = (isMonthlyOnly = false) => {
    try {
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

      if (bank.current_quarter === 1 && bank.current_year > activeYear) {
        setAnnualReportNotice(`Year ${bank.current_year - 1} Annual Report Generated!`);
        setTimeout(() => setAnnualReportNotice(null), 4000);
      }

      if (bank.status === "completed" || (bank.current_year >= 5 && bank.current_quarter === 5)) {
        setIsPlaying(false);
        setSuccessResult({
          nextYear: 5,
          nextQuarter: 5,
          netProfit: state.net_profit,
          totalAssets: state.total_assets,
          capitalAdequacyRatio: state.capital_adequacy_ratio / 100,
          customerSatisfaction: state.customer_satisfaction,
          wasYearEnd: true,
          completedYear: 5,
          isFinal: true,
        });
      }

      return { bank, state };
    } catch (err) {
      console.error("Step advance error:", err);
      setIsPlaying(false);
      return null;
    }
  };

  // AUTOMATED SIMULATION RUNNER (Ticks when isPlaying is true at chosen speed)
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMap: Record<string, number> = {
      "1x": 3500,
      "3x": 1600,
      "10x": 700,
      "boost": 250,
    };

    const intervalMs = intervalMap[simSpeed] || 2000;

    const timer = setInterval(() => {
      const res = stepAdvance(false);
      if (!res || res.bank.status === "completed") {
        setIsPlaying(false);
        clearInterval(timer);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, simSpeed, bankId, retailDepositRate, retailLendingRate, corporateLendingRate, activeYear]);

  const handleManualAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = stepAdvance(false);
    if (res) {
      setSuccessResult({
        nextYear: res.bank.current_year,
        nextQuarter: res.bank.current_quarter,
        netProfit: res.state.net_profit,
        totalAssets: res.state.total_assets,
        capitalAdequacyRatio: res.state.capital_adequacy_ratio / 100,
        customerSatisfaction: res.state.customer_satisfaction,
        wasYearEnd: activeQuarter === 5,
        completedYear: activeYear,
        isFinal: res.bank.status === "completed",
      });
    }
    setLoading(false);
  };

  if (successResult) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-emerald-950 dark:text-emerald-200">
                {successResult.isFinal
                  ? "5-Year Executive Mandate Completed!"
                  : "Quarter Simulation Completed Successfully!"}
              </CardTitle>
              <CardDescription className="text-xs">
                {successResult.wasYearEnd ? (
                  <strong className="text-emerald-400">
                    Year {successResult.completedYear} Completed! 15-Section Annual Report generated and archived in Reports section.
                  </strong>
                ) : (
                  `Advanced to Year ${successResult.nextYear}, Quarter ${successResult.nextQuarter} of 5.`
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 border-y border-border text-xs">
            <div>
              <span className="text-muted-foreground">Quarterly Net Profit</span>
              <p className={`font-bold text-sm font-mono-numbers ${successResult.netProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {formatCurrency(successResult.netProfit, currency)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Assets</span>
              <p className="font-bold text-sm font-mono-numbers">
                {formatCurrency(successResult.totalAssets, currency)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Capital Adequacy (CAR)</span>
              <p className="font-bold text-sm font-mono-numbers">
                {formatPercent(successResult.capitalAdequacyRatio)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Customer Satisfaction</span>
              <p className="font-bold text-sm font-mono-numbers">
                {successResult.customerSatisfaction}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setSuccessResult(null);
                if (successResult.wasYearEnd) {
                  router.push(`/bank/${bankId}/reports`);
                } else {
                  router.push(`/bank/${bankId}`);
                }
              }}
            >
              {successResult.wasYearEnd ? "View Year-End Annual Report" : "Return to Bank Dashboard"}{" "}
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleManualAdvance} className="space-y-6">
      {/* TIME & SIMULATION CONTROLS BAR (Play/Resume + 1x, 3x, 10x, Boost) */}
      <Card className="border-blue-500/30 bg-muted/20 shadow-md">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Play/Pause & Speed Selection */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant={isPlaying ? "destructive" : "default"}
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`gap-1.5 font-bold ${
                  !isPlaying
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    : ""
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="size-4 animate-pulse" /> Pause Simulation
                  </>
                ) : (
                  <>
                    <Play className="size-4" /> Resume & Auto-Run
                  </>
                )}
              </Button>

              <div className="flex items-center gap-1 bg-background border rounded-lg p-0.5 text-xs font-mono">
                {(["1x", "3x", "10x", "boost"] as const).map((spd) => (
                  <button
                    type="button"
                    key={spd}
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
            </div>

            {/* Manual Step Controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => stepAdvance(true)}
                disabled={loading || isPlaying}
                className="gap-1 text-xs"
              >
                <Calendar className="size-3.5 text-blue-400" /> Advance Month (30d)
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading || isPlaying}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1 text-xs"
              >
                <Zap className="size-3.5" /> Advance Quarter
              </Button>
            </div>
          </div>

          {/* LIVE STATUS MONITOR STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-border/60 text-xs">
            <div className="bg-background/80 p-2.5 rounded-lg border">
              <span className="text-muted-foreground">Simulated Period</span>
              <p className="font-bold text-sm text-blue-400 font-mono-numbers mt-0.5">
                Year {activeYear} · Q{activeQuarter} / 5
              </p>
            </div>
            <div className="bg-background/80 p-2.5 rounded-lg border">
              <span className="text-muted-foreground">Active Customers</span>
              <p className="font-bold text-sm text-foreground font-mono-numbers mt-0.5">
                {customerCount} Accounts
              </p>
            </div>
            <div className="bg-background/80 p-2.5 rounded-lg border">
              <span className="text-muted-foreground">Total Deposits</span>
              <p className="font-bold text-sm font-mono-numbers text-cyan-400 mt-0.5">
                {liveState ? formatCurrency(liveState.total_deposits, currency, true) : "£0"}
              </p>
            </div>
            <div className="bg-background/80 p-2.5 rounded-lg border">
              <span className="text-muted-foreground">Quarterly P&L</span>
              <p
                className={`font-bold text-sm font-mono-numbers mt-0.5 ${
                  liveState && liveState.net_profit >= 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {liveState ? formatCurrency(liveState.net_profit, currency, true) : "£0"}
              </p>
            </div>
            <div className="bg-background/80 p-2.5 rounded-lg border">
              <span className="text-muted-foreground">Capital Ratio (CAR)</span>
              <p className="font-bold text-sm font-mono-numbers text-foreground mt-0.5">
                {liveState ? `${liveState.capital_adequacy_ratio}%` : "100%"}
              </p>
            </div>
          </div>

          {isPlaying && (
            <div className="flex items-center justify-between text-xs text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Simulation Running at {simSpeed.toUpperCase()} Speed... (advancing quarters automatically)
              </span>
              <span className="font-mono text-[11px]">Click Pause anytime to freeze simulation</span>
            </div>
          )}

          {annualReportNotice && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{annualReportNotice} Viewable in Reports desk.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Year-End Q5 Notice */}
      {activeQuarter === 5 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="size-5 text-amber-500 shrink-0" />
            <div className="text-xs">
              <strong className="text-foreground">Quarter 5 of 5 · Year-End Closing:</strong>{" "}
              Advancing this quarter will conclude Year {activeYear} operations and trigger the generation of the official 15-Section Annual Report.
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
          disabled={loading || isPlaying}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-8"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Simulating Quarter...
            </>
          ) : (
            <>
              <Zap className="size-4 mr-2" />
              Advance to Next Quarter
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
