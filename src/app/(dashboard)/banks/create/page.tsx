"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  COUNTRIES,
  BANK_TYPES,
  DIFFICULTIES,
  STRATEGIES,
  type BankType,
  type Difficulty,
  type CreateBankFormData,
} from "@/types/bank";
import { formatCurrency } from "@/lib/formatters";
import { createBankInSlot } from "@/lib/storage";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Globe,
  Settings,
  CheckCircle,
  Loader2,
  AlertCircle,
  Landmark,
} from "lucide-react";
import { cn } from "cn";

const STEPS = [
  { label: "Identity", icon: Building2 },
  { label: "Configuration", icon: Settings },
  { label: "Strategy", icon: Globe },
  { label: "Review", icon: CheckCircle },
];

function CreateBankFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slotNumber = parseInt(searchParams.get("slot") || "1", 10);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateBankFormData>({
    name: "",
    ceo_name: "",
    country: "",
    city: "",
    currency: "USD",
    bank_type: "retail",
    difficulty: "beginner",
    simulation_duration_years: 5,
    start_year: 2025,
    operating_mode: "guided",
    initial_strategy: "balanced",
    starting_capital: 50_000_000,
  });

  function update(fields: Partial<CreateBankFormData>) {
    setForm((prev) => ({ ...prev, ...fields }));
  }

  function canNext(): boolean {
    switch (step) {
      case 0:
        return form.name.length >= 3 && form.ceo_name.trim().length >= 2 && form.country !== "" && form.city.length >= 2;
      case 1:
        return true;
      case 2:
        return form.starting_capital >= 5_000_000;
      case 3:
        return true;
      default:
        return false;
    }
  }

  function handleCreate() {
    setLoading(true);
    setError(null);
    try {
      const bank = createBankInSlot(slotNumber as 1 | 2 | 3, form);
      router.push(`/bank/${bank.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create bank";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.push("/banks")} className="mb-4">
          <ArrowLeft className="size-4 mr-1" /> Back to Banks
        </Button>
        <h1 className="text-2xl font-bold">New Bank Charter & Executive Appointment</h1>
        <p className="text-muted-foreground mt-1">Slot {slotNumber} · Start from zero with initial capital and full management authority</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                  i <= step ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <CheckCircle className="size-4" /> : i + 1}
              </div>
              <span className={cn("text-xs font-medium hidden sm:inline", i <= step ? "text-foreground" : "text-muted-foreground")}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Leadership & Bank Identity</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CEO / Chairman's Full Name *</Label>
                  <Input
                    placeholder="e.g., Jhon"
                    value={form.ceo_name}
                    onChange={(e) => update({ ceo_name: e.target.value })}
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground">The appointed executive officer accountable to the Board.</p>
                </div>
                <div className="space-y-2">
                  <Label>Appointment / Start Year *</Label>
                  <Select
                    value={String(form.start_year)}
                    onValueChange={(v) => {
                      if (v) update({ start_year: parseInt(v) });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Start year" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2025, 2026, 2024, 2023, 2020].map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          Year {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bank Name *</Label>
                <Input
                  placeholder="e.g., Meridian National Bank"
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label>Jurisdiction / Country *</Label>
                <Select
                  value={form.country}
                  onValueChange={(v) => {
                    if (!v) return;
                    const c = COUNTRIES.find((c) => c.code === v);
                    update({ country: v, currency: c?.currency || form.currency });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Headquarters City *</Label>
                  <Input placeholder="e.g., New York" value={form.city} onChange={(e) => update({ city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Accounting Currency</Label>
                  <Input value={form.currency} onChange={(e) => update({ currency: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Operating Terms & Guidance</h2>
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  <div
                    onClick={() => update({ operating_mode: "guided" })}
                    className={cn(
                      "cursor-pointer rounded-xl border-2 p-4 transition-all",
                      form.operating_mode === "guided" ? "border-blue-500 bg-blue-50/50" : "border-border hover:border-blue-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("size-4 rounded-full border-2", form.operating_mode === "guided" ? "border-blue-500 bg-blue-500" : "border-muted-foreground/30")} />
                      <div>
                        <p className="font-medium text-sm">Guided Onboarding</p>
                        <p className="text-xs text-muted-foreground">Includes advisory commentary, ratio alerts, and guided quarterly workflow.</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => update({ operating_mode: "unguided" })}
                    className={cn(
                      "cursor-pointer rounded-xl border-2 p-4 transition-all",
                      form.operating_mode === "unguided" ? "border-blue-500 bg-blue-50/50" : "border-border hover:border-blue-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("size-4 rounded-full border-2", form.operating_mode === "unguided" ? "border-blue-500 bg-blue-500" : "border-muted-foreground/30")} />
                      <div>
                        <p className="font-medium text-sm">Start Without Guidance</p>
                        <p className="text-xs text-muted-foreground">Direct executive management with zero hand-holding. Realistic supervisory scrutiny.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Bank Type</h2>
                <div className="grid gap-3">
                  {(Object.entries(BANK_TYPES) as [BankType, { label: string; description: string }][]).map(([key, val]) => (
                    <div
                      key={key}
                      onClick={() => update({ bank_type: key })}
                      className={cn(
                        "cursor-pointer rounded-xl border-2 p-4 transition-all",
                        form.bank_type === key ? "border-blue-500 bg-blue-50/50" : "border-border hover:border-blue-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("size-4 rounded-full border-2", form.bank_type === key ? "border-blue-500 bg-blue-500" : "border-muted-foreground/30")} />
                        <div>
                          <p className="font-medium text-sm">{val.label}</p>
                          <p className="text-xs text-muted-foreground">{val.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Simulation Difficulty</h2>
                <div className="grid gap-3">
                  {(Object.entries(DIFFICULTIES) as [Difficulty, { label: string; description: string; startingCapital: number }][]).map(
                    ([key, val]) => (
                      <div
                        key={key}
                        onClick={() => update({ difficulty: key, starting_capital: val.startingCapital })}
                        className={cn(
                          "cursor-pointer rounded-xl border-2 p-4 transition-all",
                          form.difficulty === key ? "border-blue-500 bg-blue-50/50" : "border-border hover:border-blue-200"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("size-4 rounded-full border-2", form.difficulty === key ? "border-blue-500 bg-blue-500" : "border-muted-foreground/30")} />
                            <div>
                              <p className="font-medium text-sm">{val.label}</p>
                              <p className="text-xs text-muted-foreground">{val.description}</p>
                            </div>
                          </div>
                          <span className="text-xs font-mono-numbers text-muted-foreground">
                            {formatCurrency(val.startingCapital, form.currency, true)}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Starting Capital (Tier-1 Equity)</Label>
                  <Input
                    type="number"
                    value={form.starting_capital}
                    onChange={(e) => update({ starting_capital: parseFloat(e.target.value) || 0 })}
                    min={5000000}
                    step={1000000}
                  />
                  <p className="text-xs text-muted-foreground">{formatCurrency(form.starting_capital, form.currency)} cash reserves</p>
                </div>
                <div className="space-y-2">
                  <Label>Mandate Duration</Label>
                  <div className="h-10 px-3 py-2 border rounded-md bg-muted/30 text-sm font-medium flex items-center">
                    5 Years (4 Quarters/Yr = 20 Quarters)
                  </div>
                  <p className="text-xs text-muted-foreground">Fixed regulatory tenure with annual reports at each Q4.</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Initial Strategy</h2>
                <div className="grid gap-3">
                  {STRATEGIES.map((s) => (
                    <div
                      key={s.value}
                      onClick={() => update({ initial_strategy: s.value })}
                      className={cn(
                        "cursor-pointer rounded-xl border-2 p-4 transition-all",
                        form.initial_strategy === s.value ? "border-blue-500 bg-blue-50/50" : "border-border hover:border-blue-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("size-4 rounded-full border-2", form.initial_strategy === s.value ? "border-blue-500 bg-blue-500" : "border-muted-foreground/30")} />
                        <div>
                          <p className="font-medium text-sm">{s.label}</p>
                          <p className="text-xs text-muted-foreground">{s.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Executive Charter & Review</h2>
              <div className="bg-muted/50 rounded-xl p-5 space-y-4 border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <Landmark className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{form.name || "Unnamed Bank"}</p>
                    <p className="text-sm text-muted-foreground">
                      CEO: <span className="font-semibold text-foreground">{form.ceo_name}</span> · {form.city},{" "}
                      {COUNTRIES.find((c) => c.code === form.country)?.name || form.country}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Appointment Year", `Year ${form.start_year}`],
                    ["Operating Mode", form.operating_mode === "guided" ? "Guided Onboarding" : "Autonomous Unguided"],
                    ["Bank Type", BANK_TYPES[form.bank_type]?.label],
                    ["Accounting Currency", form.currency],
                    ["Difficulty", DIFFICULTIES[form.difficulty]?.label],
                    ["Initial Capital (Cash)", formatCurrency(form.starting_capital, form.currency)],
                    ["Simulation System", "5 Years × 4 Quarters = 20 Quarters"],
                    ["Initial Staff / Loans", "0 Staff / 0 Debt (Clean Start from Zero)"],
                  ].map(([label, value]) => (
                    <div key={label as string} className="bg-background/80 p-2.5 rounded-lg border">
                      <p className="text-muted-foreground text-xs">{label}</p>
                      <p className="font-medium text-xs sm:text-sm mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400">
                  <strong>Clean Baseline Notice:</strong> The bank starts at Year 1 Quarter 1 with 100% equity capital in cash reserves, 0 pre-populated staff, and 0 pre-existing loans. You will actively recruit officers, establish security protocols, and underwrite incoming credit applications.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => (step === 0 ? router.push("/banks") : setStep(step - 1))}>
          <ArrowLeft className="size-4 mr-1" /> {step === 0 ? "Cancel" : "Back"}
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
            Next <ArrowRight className="size-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={loading} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" /> Chartering Bank...
              </>
            ) : (
              <>
                Take Office & Establish Bank <CheckCircle className="size-4 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function CreateBankPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48 mx-auto" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </div>
      }
    >
      <CreateBankFormContent />
    </Suspense>
  );
}
