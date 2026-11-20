"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  FileText,
  Download,
  Scale,
  TrendingUp,
  Landmark,
  Award,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  Calendar,
  Layers,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import {
  getBank,
  getSimulationState,
  getQuarterHistory,
  getAnnualReports,
  markReportAsRead,
  getFinalReport,
  SimulationState,
  QuarterHistory,
} from "@/lib/storage";
import type { Bank, AnnualReport, FinalFiveYearReport, AnnualReportSection } from "@/types/bank";

export default function ReportsPage() {
  const params = useParams();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [state, setState] = useState<SimulationState | null>(null);
  const [history, setHistory] = useState<QuarterHistory[]>([]);
  const [annualReports, setAnnualReports] = useState<AnnualReport[]>([]);
  const [finalReport, setFinalReport] = useState<FinalFiveYearReport | null>(null);
  const [selectedReport, setSelectedReport] = useState<AnnualReport | null>(null);
  const [activeSectionKey, setActiveSectionKey] = useState<string>("all");

  useEffect(() => {
    if (!bankId) return;
    setBank(getBank(bankId));
    setState(getSimulationState(bankId));
    setHistory(getQuarterHistory(bankId));
    const reps = getAnnualReports(bankId);
    setAnnualReports(reps);
    setFinalReport(getFinalReport(bankId));
    if (reps.length > 0) {
      setSelectedReport(reps[reps.length - 1]);
    }
  }, [bankId]);

  if (!bank || !state) return <div className="p-6">Loading financial reports...</div>;

  const currency = bank.currency || "USD";

  function handleSelectReport(rep: AnnualReport) {
    setSelectedReport(rep);
    if (!rep.is_read) {
      markReportAsRead(bankId, rep.id);
      setAnnualReports(getAnnualReports(bankId));
    }
  }

  function exportCSV() {
    if (!history.length) return;
    const headers = ["Year", "Quarter", "Assets", "Liabilities", "Equity", "Deposits", "Loans", "Net Profit", "NPL", "CAR"];
    const rows = history.map((h) => [
      h.year,
      `Q${h.quarter}`,
      h.assets,
      h.liabilities,
      h.equity,
      h.deposits,
      h.loans,
      h.net_profit,
      `${h.npl_ratio}%`,
      `${h.car}%`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${bank?.name || "bank"}_financial_statement.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30">
              Desk · Reports & Audits
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Year {bank.current_year} · Quarter {bank.current_quarter} of 5
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Financial & Regulatory Reporting Suite</h1>
          <p className="text-sm text-muted-foreground">
            Audited Balance Sheets, Comprehensive Income (P&L), Multi-Quarter Historical Ledgers, and 15-Section Annual Reports.
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2 shrink-0">
          <Download className="size-4" />
          <span>Export CSV Ledger</span>
        </Button>
      </div>

      {/* STICKY TOP TAB NAVIGATION BAR (Never gets pushed down!) */}
      <Tabs defaultValue={annualReports.length > 0 ? "annual-reports" : "balance-sheet"} className="w-full">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md pt-2 pb-4 border-b">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 bg-muted/60 border border-border rounded-xl">
            <TabsTrigger value="annual-reports" className="gap-1.5 py-2.5 text-xs sm:text-sm font-semibold">
              <BookOpen className="size-4 text-blue-500" /> Annual Reports
              {annualReports.some((r) => !r.is_read) && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1">
                  NEW
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="balance-sheet" className="gap-1.5 py-2.5 text-xs sm:text-sm font-semibold">
              <Scale className="size-4 text-cyan-500" /> Balance Sheet
            </TabsTrigger>
            <TabsTrigger value="income-statement" className="gap-1.5 py-2.5 text-xs sm:text-sm font-semibold">
              <TrendingUp className="size-4 text-emerald-500" /> Profit & Loss (P&L)
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 py-2.5 text-xs sm:text-sm font-semibold">
              <Landmark className="size-4 text-purple-500" /> Quarterly Ledger
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. ANNUAL REPORTS TAB */}
        <TabsContent value="annual-reports" className="space-y-6 pt-4">
          {/* FINAL 5-YEAR CLIMAX BANNER (Inside Annual Reports Tab) */}
          {finalReport && (
            <Card className="border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                      <Award className="size-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-amber-950 dark:text-amber-200">
                        5-Year Executive Mandate Complete · Board of Directors Evaluation
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Overall Rating: <strong className="text-amber-500 font-bold">{finalReport.mandate_grade}</strong> · {finalReport.total_quarters_completed} Quarters Successfully Concluded
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-amber-500 text-black font-bold uppercase text-xs">
                    Mandate Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{finalReport.summary}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                  <div className="p-3 bg-background/80 rounded-lg border">
                    <span className="text-muted-foreground">Cumulative Earnings</span>
                    <p className="font-bold text-base font-mono-numbers text-emerald-500 mt-0.5">
                      {formatCurrency(finalReport.cumulative_profit, currency)}
                    </p>
                  </div>
                  <div className="p-3 bg-background/80 rounded-lg border">
                    <span className="text-muted-foreground">Peak Assets Managed</span>
                    <p className="font-bold text-base font-mono-numbers text-foreground mt-0.5">
                      {formatCurrency(finalReport.peak_assets, currency)}
                    </p>
                  </div>
                  <div className="p-3 bg-background/80 rounded-lg border">
                    <span className="text-muted-foreground">Final Capital Adequacy</span>
                    <p className="font-bold text-base font-mono-numbers text-blue-500 mt-0.5">
                      {finalReport.final_car}%
                    </p>
                  </div>
                  <div className="p-3 bg-background/80 rounded-lg border">
                    <span className="text-muted-foreground">Terminal NPL Ratio</span>
                    <p className="font-bold text-base font-mono-numbers text-foreground mt-0.5">
                      {finalReport.npl_final}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {annualReports.length === 0 ? (
            <Card className="border-dashed p-10 text-center space-y-3 bg-muted/10">
              <FileText className="size-12 text-muted-foreground/40 mx-auto" />
              <CardTitle className="text-lg">No Annual Reports Generated Yet</CardTitle>
              <CardDescription className="max-w-md mx-auto text-xs leading-relaxed">
                Annual Reports are automatically compiled upon the completion of <strong>Quarter 5</strong> of each operating year. Currently active: <strong>Year {bank.current_year} · Quarter {bank.current_quarter} of 5</strong>. Advance through Quarter 5 to generate your first Year-End report.
              </CardDescription>
            </Card>
          ) : (
            <div className="space-y-5">
              {/* Year Selector Pills */}
              <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/30 border rounded-xl">
                <span className="text-xs font-bold text-muted-foreground uppercase px-2">Archive:</span>
                {annualReports.map((rep) => (
                  <button
                    key={rep.id}
                    onClick={() => handleSelectReport(rep)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedReport?.id === rep.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-background hover:bg-muted text-muted-foreground border"
                    }`}
                  >
                    <span>Year {rep.year} Report</span>
                    <span className="text-[10px] opacity-75">({rep.calendar_year})</span>
                    {!rep.is_read && (
                      <span className="size-2 rounded-full bg-rose-400 animate-pulse ml-0.5" />
                    )}
                  </button>
                ))}
              </div>

              {/* 15-Section Report Briefcase */}
              {selectedReport && (
                <Card className="border-blue-500/30 shadow-md">
                  <CardHeader className="border-b pb-4 bg-muted/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-blue-400 border-blue-500/30 text-xs">
                            Official Filing · Year {selectedReport.year} (Calendar {selectedReport.calendar_year})
                          </Badge>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px]">
                            Audited 5-Quarter Package
                          </Badge>
                        </div>
                        <CardTitle className="text-xl font-bold tracking-tight">
                          {bank.name} — Year {selectedReport.year} Comprehensive Annual Report
                        </CardTitle>
                        <CardDescription className="text-xs">
                          CEO Address, Full Financial Statements, Solvency Position, and Supervisory Disclosures.
                        </CardDescription>
                      </div>

                      {/* Section Filter Pills */}
                      <div className="flex items-center gap-1 bg-background border p-1 rounded-lg text-xs">
                        <button
                          type="button"
                          onClick={() => setActiveSectionKey("all")}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            activeSectionKey === "all"
                              ? "bg-blue-600 text-white font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          All 15 Sections
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSectionKey("exec")}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            activeSectionKey === "exec"
                              ? "bg-blue-600 text-white font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Financial & Executive
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSectionKey("risk")}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            activeSectionKey === "risk"
                              ? "bg-blue-600 text-white font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Risk & Regulation
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Render sections with clean cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedReport.sections)
                        .filter(([key]) => {
                          if (activeSectionKey === "exec") {
                            return ["executive_summary", "financial_performance", "profit_and_loss", "assets_and_liabilities", "loan_portfolio", "deposit_growth", "capital_and_liquidity"].includes(key);
                          }
                          if (activeSectionKey === "risk") {
                            return ["security_and_risk", "regulatory_and_compliance", "major_decisions", "important_events", "achievements_and_failures", "recommendations_next_year"].includes(key);
                          }
                          return true;
                        })
                        .map(([key, sec]: [string, AnnualReportSection]) => (
                          <div
                            key={key}
                            className={`p-4 rounded-xl border bg-card/60 transition-all space-y-3 ${
                              sec.status === "negative" ? "border-rose-500/30" : "border-border hover:border-blue-500/30"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                {sec.title}
                              </h4>
                              {sec.status && (
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${
                                    sec.status === "positive"
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                      : sec.status === "warning"
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                      : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                  }`}
                                >
                                  {sec.status === "positive" ? (
                                    <CheckCircle2 className="size-2.5 mr-1" />
                                  ) : (
                                    <AlertTriangle className="size-2.5 mr-1" />
                                  )}
                                  {sec.status.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {sec.content}
                            </p>

                            {sec.metrics && Object.keys(sec.metrics).length > 0 && (
                              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 text-xs">
                                {Object.entries(sec.metrics).map(([mKey, mVal]) => (
                                  <div key={mKey} className="bg-muted/40 p-2 rounded border text-[11px]">
                                    <span className="text-muted-foreground text-[10px] block">{mKey}</span>
                                    <p className="font-semibold text-foreground font-mono-numbers mt-0.5">
                                      {String(mVal)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* 2. BALANCE SHEET TAB */}
        <TabsContent value="balance-sheet" className="space-y-6 pt-4">
          <Card>
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Consolidated Balance Sheet Statement</CardTitle>
                  <CardDescription className="text-xs">
                    As of Year {bank.current_year}, Quarter {bank.current_quarter} of 5 · Assets = Liabilities + Shareholder Equity
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  BALANCED
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Assets */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-blue-400 uppercase tracking-wider border-b pb-2">
                    Total Assets
                  </h3>
                  <div className="flex justify-between text-sm py-1.5 border-b">
                    <span>Cash & Central Bank Reserves</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(state.cash_reserves, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1.5 border-b">
                    <span>Gross Loan Portfolio</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(state.total_loans_outstanding, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1.5 border-b">
                    <span>Sovereign Treasury Securities</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(state.cash_reserves * 0.3, currency)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 text-foreground">
                    <span>Total Assets</span>
                    <span className="font-mono-numbers text-blue-400">{formatCurrency(state.total_assets, currency)}</span>
                  </div>
                </div>

                {/* Liabilities & Equity */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-cyan-400 uppercase tracking-wider border-b pb-2">
                    Liabilities & Shareholder Equity
                  </h3>
                  <div className="flex justify-between text-sm py-1.5 border-b">
                    <span>Customer Deposit Liabilities</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(state.total_deposits, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1.5 border-b">
                    <span>Paid-in Charter Capital</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(bank.starting_capital, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1.5 border-b">
                    <span>Retained Earnings Buffer</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(state.total_equity - bank.starting_capital, currency)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 text-foreground">
                    <span>Total Liabilities & Equity</span>
                    <span className="font-mono-numbers text-cyan-400">{formatCurrency(state.total_liabilities + state.total_equity, currency)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. PROFIT & LOSS TAB */}
        <TabsContent value="income-statement" className="space-y-6 pt-4">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Statement of Comprehensive Income (P&L)</CardTitle>
              <CardDescription className="text-xs">Quarterly financial performance, operational margins, and net earnings.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-w-2xl">
              <div className="flex justify-between text-sm py-1.5 border-b">
                <span className="text-muted-foreground">Net Interest Income (NII)</span>
                <span className="font-mono-numbers font-semibold text-emerald-400">{formatCurrency(state.net_interest_income, currency)}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5 border-b">
                <span className="text-muted-foreground">Non-Interest Fees & Commissions</span>
                <span className="font-mono-numbers font-semibold text-emerald-400">{formatCurrency(state.non_interest_income, currency)}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5 border-b">
                <span className="text-muted-foreground">Operating Expenses (Salaries, AI, Security, IT)</span>
                <span className="font-mono-numbers font-semibold text-rose-400">-{formatCurrency(state.operating_expenses, currency)}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5 border-b">
                <span className="text-muted-foreground">Loan Loss Provisions</span>
                <span className="font-mono-numbers font-semibold text-rose-400">-{formatCurrency(state.loan_loss_provisions, currency)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-foreground">
                <span>Net Quarterly Profit / Loss</span>
                <span className={`font-mono-numbers ${state.net_profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatCurrency(state.net_profit, currency)}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. QUARTERLY HISTORY TAB */}
        <TabsContent value="history" className="space-y-6 pt-4">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Quarterly Financial Ledger</CardTitle>
              <CardDescription className="text-xs">Complete trajectory across all simulated quarters (5 Quarters per Year).</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b text-xs text-muted-foreground uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Period</th>
                      <th className="px-4 py-3 text-right">Assets</th>
                      <th className="px-4 py-3 text-right">Deposits</th>
                      <th className="px-4 py-3 text-right">Loans</th>
                      <th className="px-4 py-3 text-right">Net Profit</th>
                      <th className="px-4 py-3 text-center">NPL</th>
                      <th className="px-4 py-3 text-center">CAR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {history.map((h, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-semibold">Year {h.year} · Q{h.quarter}</td>
                        <td className="px-4 py-3 text-right font-mono-numbers">{formatCurrency(h.assets, currency, true)}</td>
                        <td className="px-4 py-3 text-right font-mono-numbers">{formatCurrency(h.deposits, currency, true)}</td>
                        <td className="px-4 py-3 text-right font-mono-numbers">{formatCurrency(h.loans, currency, true)}</td>
                        <td className={`px-4 py-3 text-right font-mono-numbers font-semibold ${h.net_profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {formatCurrency(h.net_profit, currency, true)}
                        </td>
                        <td className="px-4 py-3 text-center font-mono-numbers">{h.npl_ratio}%</td>
                        <td className="px-4 py-3 text-center font-mono-numbers font-medium text-blue-400">{h.car}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
