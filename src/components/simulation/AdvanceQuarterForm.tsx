"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { advanceQuarterAction } from "@/app/actions/simulation-actions";
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
  currentQuarter,
  currentYear,
  benchmarkRate,
  activeCrisis,
}: AdvanceQuarterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  // Form decisions
  const [retailDepositRate, setRetailDepositRate] = useState(3.5);
  const [commercialDepositRate, setCommercialDepositRate] = useState(3.0);
  const [retailLendingRate, setRetailLendingRate] = useState(7.5);
  const [corporateLendingRate, setCorporateLendingRate] = useState(6.5);
  const [dividendPayoutRatio, setDividendPayoutRatio] = useState(10);
  const [selectedCrisisOptionId, setSelectedCrisisOptionId] = useState<string>(
    activeCrisis?.options?.[0]?.id || ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await advanceQuarterAction(bankId, {
        retailDepositRate: retailDepositRate / 100,
        commercialDepositRate: commercialDepositRate / 100,
        retailLendingRate: retailLendingRate / 100,
        corporateLendingRate: corporateLendingRate / 100,
        dividendPayoutRatio: dividendPayoutRatio / 100,
        selectedCrisisOptionId,
      });

      if (res?.success) {
        setSuccessResult(res.result);
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || "Failed to advance quarter");
    } finally {
      setLoading(false);
    }
  };

  if (successResult) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-emerald-950 dark:text-emerald-200">
                Quarter Simulation Completed Successfully!
              </CardTitle>
              <CardDescription className="text-xs">
                Advanced to Year {successResult.nextYear}, Quarter {successResult.nextQuarter}.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 border-y border-border text-xs">
            <div>
              <span className="text-muted-foreground">Quarterly Net Profit</span>
              <p className="font-bold text-sm font-mono-numbers text-emerald-600">
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
                router.push(`/bank/${bankId}`);
              }}
            >
              Return to Bank Dashboard <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              Higher rates attract deposit volume but increase quarterly interest expenses.
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
              Higher lending rates boost interest margin but reduce application demand and increase default risk.
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
              Retaining earnings increases Tier 1 capital and bolsters your Capital Adequacy Ratio (CAR).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-8"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Simulating Quarter (15-step Engine)...
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
