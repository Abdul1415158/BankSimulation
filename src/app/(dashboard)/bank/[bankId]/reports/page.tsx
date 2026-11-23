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
  const [activeTab, setActiveTab] = useState<string>("annual-reports");

  useEffect(() => {
    if (!bankId) return;
    setBank(getBank(bankId));
    setState(getSimulationState(bankId));
    const hist = getQuarterHistory(bankId);
    setHistory(hist);
    const reps = getAnnualReports(bankId);
    setAnnualReports(reps);
    setFinalReport(getFinalReport(bankId));
    if (reps.length > 0) {
      setSelectedReport((prev) => (prev ? reps.find((r) => r.year === prev.year) || reps[reps.length - 1] : reps[reps.length - 1]));
    } else {
      setActiveTab("balance-sheet");
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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30">
              Desk · Reports & Audits
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Year {bank.current_year} · Quarter {bank.current_quarter} of 5
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight break-words">Financial & Regulatory Reporting Suite</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Audited Balance Sheets, Comprehensive Income (P&L), Multi-Quarter Historical Ledgers, and 15-Section Annual Reports.
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2 shrink-0 w-full sm:w-auto justify-center">
          <Download className="size-4" />
          <span>Export CSV Ledger</span>
        </Button>
      </div>

      {/* STICKY TOP TAB NAVIGATION BAR (Never gets pushed down!) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md pt-2 pb-3 sm:pb-4 border-b -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 bg-muted/60 border border-border rounded-xl gap-1">
            <TabsTrigger value="annual-reports" className="gap-1.5 py-2 sm:py-2.5 px-3 text-xs sm:text-sm font-semibold flex items-center justify-center whitespace-nowrap">
              <BookOpen className="size-3.5 sm:size-4 text-blue-500 shrink-0" />
              <span>Annual Reports</span>
              {annualReports.some((r) => !r.is_read) && (
                <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1 shrink-0">
                  NEW
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="balance-sheet" className="gap-1.5 py-2 sm:py-2.5 px-3 text-xs sm:text-sm font-semibold flex items-center justify-center whitespace-nowrap">
              <Scale className="size-3.5 sm:size-4 text-cyan-500 shrink-0" />
              <span>Balance Sheet</span>
            </TabsTrigger>
            <TabsTrigger value="income-statement" className="gap-1.5 py-2 sm:py-2.5 px-3 text-xs sm:text-sm font-semibold flex items-center justify-center whitespace-nowrap">
              <TrendingUp className="size-3.5 sm:size-4 text-emerald-500 shrink-0" />
              <span>Profit & Loss</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 py-2 sm:py-2.5 px-3 text-xs sm:text-sm font-semibold flex items-center justify-center whitespace-nowrap">
              <Landmark className="size-3.5 sm:size-4 text-purple-500 shrink-0" />
              <span>Quarterly Ledger</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. ANNUAL REPORTS TAB */}
        <TabsContent value="annual-reports" className="space-y-6 pt-4">
          {/* FINAL 5-YEAR CLIMAX BANNER (Inside Annual Reports Tab) */}
          {finalReport && (
            <Card className="border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent shadow-md overflow-hidden">
              <CardHeader className="p-4 sm:p-6 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="size-10 sm:size-11 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <Award className="size-5 sm:size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg font-bold text-amber-950 dark:text-amber-200 break-words leading-tight">
                        5-Year Executive Mandate Complete · Board Evaluation
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Overall Rating: <strong className="text-amber-500 font-bold">{finalReport.mandate_grade}</strong> · {finalReport.total_quarters_completed} Quarters Concluded
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-amber-500 text-black font-bold uppercase text-xs self-start sm:self-auto shrink-0">
                    Mandate Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground break-words">{finalReport.summary}</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1 text-xs">
                  <div className="p-2.5 sm:p-3 bg-background/80 rounded-lg border min-w-0">
                    <span className="text-muted-foreground text-[11px] block truncate">Cumulative Earnings</span>
                    <p className="font-bold text-sm sm:text-base font-mono-numbers text-emerald-500 mt-0.5 truncate">
                      {formatCurrency(finalReport.cumulative_profit, currency)}
                    </p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-background/80 rounded-lg border min-w-0">
                    <span className="text-muted-foreground text-[11px] block truncate">Peak Assets</span>
                    <p className="font-bold text-sm sm:text-base font-mono-numbers text-foreground mt-0.5 truncate">
                      {formatCurrency(finalReport.peak_assets, currency)}
                    </p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-background/80 rounded-lg border min-w-0">
                    <span className="text-muted-foreground text-[11px] block truncate">Final Capital Adequacy</span>
                    <p className="font-bold text-sm sm:text-base font-mono-numbers text-blue-500 mt-0.5 truncate">
                      {finalReport.final_car}%
                    </p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-background/80 rounded-lg border min-w-0">
                    <span className="text-muted-foreground text-[11px] block truncate">Terminal NPL</span>
                    <p className="font-bold text-sm sm:text-base font-mono-numbers text-foreground mt-0.5 truncate">
                      {finalReport.npl_final}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {annualReports.length === 0 ? (
            <Card className="border-dashed p-6 sm:p-10 text-center space-y-3 bg-muted/10">
              <FileText className="size-10 sm:size-12 text-muted-foreground/40 mx-auto" />
              <CardTitle className="text-base sm:text-lg">No Annual Reports Generated Yet</CardTitle>
              <CardDescription className="max-w-md mx-auto text-xs leading-relaxed">
                Annual Reports are automatically compiled upon the completion of <strong>Quarter 5</strong> of each operating year. Currently active: <strong>Year {bank.current_year} · Quarter {bank.current_quarter} of 5</strong>. Advance through Quarter 5 to generate your first Year-End report.
              </CardDescription>
            </Card>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {/* Year Selector Pills (Horizontally scrollable & touch-friendly on mobile) */}
              <div className="p-2 bg-muted/30 border rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                  <span className="text-xs font-bold text-muted-foreground uppercase px-2 shrink-0">Archive:</span>
                  {annualReports.map((rep) => (
                    <button
                      key={rep.id}
                      onClick={() => handleSelectReport(rep)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
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
              </div>

              {/* 15-Section Report Briefcase */}
              {selectedReport && (
                <Card className="border-blue-500/30 shadow-md overflow-hidden">
                  <CardHeader className="border-b p-4 sm:p-6 pb-4 bg-muted/20 space-y-3 sm:space-y-4">
                    {/* Top: Header Text & Regulatory Badges */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Badge variant="outline" className="text-blue-400 border-blue-500/30 text-xs py-0.5 px-2.5">
                          Official Regulatory Filing · Year {selectedReport.year} (Calendar {selectedReport.calendar_year})
                        </Badge>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs py-0.5 px-2.5">
                          Audited 5-Quarter Package
                        </Badge>
                      </div>
                      <CardTitle className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                        {bank.name} — Year {selectedReport.year} Comprehensive Annual Report
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Statutory CEO Address, Audited Financial Statements, Prudential Solvency Position, and Supervisory Disclosures.
                      </CardDescription>
                    </div>

                    {/* Bottom: Dedicated Filter Bar placed underneath the text */}
                    <div className="pt-2 border-t border-border/40">
                      <div className="flex items-center gap-1.5 bg-background/90 border p-1 rounded-xl text-xs overflow-x-auto max-w-full w-fit">
                        <button
                          type="button"
                          onClick={() => setActiveSectionKey("all")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                            activeSectionKey === "all"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          }`}
                        >
                          All 15 Sections
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSectionKey("exec")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                            activeSectionKey === "exec"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          }`}
                        >
                          Financial & Executive
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSectionKey("risk")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                            activeSectionKey === "risk"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          }`}
                        >
                          Risk & Regulation
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Render sections with responsive cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
                        .map(([key, sec]: [string, AnnualReportSection]) => {
                          const isFullWidth = key === "executive_summary" || key === "recommendations_next_year";
                          return (
                            <div
                              key={key}
                              className={`p-4 sm:p-5 rounded-xl border bg-card/70 backdrop-blur-sm transition-all space-y-3 min-w-0 ${
                                isFullWidth ? "md:col-span-2" : ""
                              } ${
                                sec.status === "negative"
                                  ? "border-rose-500/40 bg-rose-500/5"
                                  : sec.status === "warning"
                                  ? "border-amber-500/40 bg-amber-500/5"
                                  : "border-border hover:border-blue-500/40"
                              }`}
                            >
                              <div className="flex items-start sm:items-center justify-between gap-3">
                                <h4 className="font-bold text-sm sm:text-base text-foreground leading-snug flex-1 min-w-0">
                                  {sec.title}
                                </h4>
                                {sec.status && (
                                  <Badge
                                    variant="outline"
                                    className={`text-[11px] font-semibold shrink-0 whitespace-nowrap px-2.5 py-0.5 ${
                                      sec.status === "positive"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                        : sec.status === "warning"
                                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                    }`}
                                  >
                                    {sec.status === "positive" ? (
                                      <CheckCircle2 className="size-3 mr-1 inline-block" />
                                    ) : (
                                      <AlertTriangle className="size-3 mr-1 inline-block" />
                                    )}
                                    {sec.status.toUpperCase()}
                                  </Badge>
                                )}
                              </div>

                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                {sec.content}
                              </p>

                              {sec.metrics && Object.keys(sec.metrics).length > 0 && (
                                <div
                                  className={`grid gap-2 pt-2 border-t border-border/60 text-xs ${
                                    isFullWidth
                                      ? "grid-cols-2 md:grid-cols-4"
                                      : Object.keys(sec.metrics).length === 1
                                      ? "grid-cols-1"
                                      : "grid-cols-1 sm:grid-cols-2"
                                  }`}
                                >
                                  {Object.entries(sec.metrics).map(([mKey, mVal]) => (
                                    <div
                                      key={mKey}
                                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/50 min-w-0"
                                    >
                                      <span className="text-muted-foreground text-[11px] font-medium truncate shrink-0 max-w-[60%]">
                                        {mKey}
                                      </span>
                                      <span className="font-semibold text-foreground font-mono-numbers text-[11px] text-right truncate">
                                        {String(mVal)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* 2. BALANCE SHEET TAB */}
        <TabsContent value="balance-sheet" className="space-y-4 sm:space-y-6 pt-3 sm:pt-4">
          <Card className="overflow-hidden">
            <CardHeader className="border-b p-4 sm:p-6 pb-3 sm:pb-4">
              <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg font-bold break-words">Consolidated Balance Sheet Statement</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    As of Year {bank.current_year}, Quarter {bank.current_quarter} of 5 · Assets = Liabilities + Shareholder Equity
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shrink-0 self-start sm:self-auto">
                  BALANCED
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                {/* Assets */}
                <div className="space-y-3">
                  <h3 className="font-bold text-xs sm:text-sm text-blue-400 uppercase tracking-wider border-b pb-2">
                    Total Assets
                  </h3>
                  <div className="flex justify-between text-xs sm:text-sm py-1.5 border-b gap-2">
                    <span className="text-muted-foreground">Cash & Central Bank Reserves</span>
                    <span className="font-mono-numbers font-medium shrink-0">{formatCurrency(Math.round(state.cash_reserves * 0.7), currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm py-1.5 border-b gap-2">
                    <span className="text-muted-foreground">Sovereign Treasury Securities</span>
                    <span className="font-mono-numbers font-medium shrink-0">{formatCurrency(Math.round(state.cash_reserves * 0.3), currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm py-1.5 border-b gap-2">
                    <span className="text-muted-foreground">Gross Loan Portfolio</span>
                    <span className="font-mono-numbers font-medium shrink-0">{formatCurrency(state.total_loans_outstanding, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base font-bold pt-2 text-foreground gap-2">
                    <span>Total Assets</span>
                    <span className="font-mono-numbers text-blue-400 shrink-0">{formatCurrency(state.total_assets, currency)}</span>
                  </div>
                </div>

                {/* Liabilities & Equity */}
                <div className="space-y-3">
                  <h3 className="font-bold text-xs sm:text-sm text-cyan-400 uppercase tracking-wider border-b pb-2">
                    Liabilities & Shareholder Equity
                  </h3>
                  <div className="flex justify-between text-xs sm:text-sm py-1.5 border-b gap-2">
                    <span className="text-muted-foreground">Customer Deposit Liabilities</span>
                    <span className="font-mono-numbers font-medium shrink-0">{formatCurrency(state.total_deposits, currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm py-1.5 border-b gap-2">
                    <span className="text-muted-foreground">Paid-in Charter Capital</span>
                    <span className="font-mono-numbers font-medium shrink-0">{formatCurrency(bank.starting_capital, currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm py-1.5 border-b gap-2">
                    <span className="text-muted-foreground">Retained Earnings Buffer</span>
                    <span className="font-mono-numbers font-medium shrink-0">{formatCurrency(Math.max(0, state.total_equity - bank.starting_capital), currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base font-bold pt-2 text-foreground gap-2">
                    <span>Total Liabilities & Equity</span>
                    <span className="font-mono-numbers text-cyan-400 shrink-0">{formatCurrency(state.total_liabilities + state.total_equity, currency)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. PROFIT & LOSS TAB */}
        <TabsContent value="income-statement" className="space-y-4 sm:space-y-6 pt-3 sm:pt-4">
          <Card className="overflow-hidden">
            <CardHeader className="border-b p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg font-bold break-words">Statement of Comprehensive Income (P&L)</CardTitle>
              <CardDescription className="text-xs mt-0.5">Quarterly financial performance, operational margins, and net earnings.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 max-w-2xl">
              <div className="flex justify-between text-xs sm:text-sm py-1.5 border-b gap-2">
                <span className="text-muted-foreground">Net Interest Income (NII)</span>
                <span className="font-mono-numbers font-semibold text-emerald-400 shrink-0">{formatCurrency(state.net_interest_income, currency)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm py-1.5 border-b gap-2">
                <span className="text-muted-foreground">Non-Interest Fees & Commissions</span>
                <span className="font-mono-numbers font-semibold text-emerald-400 shrink-0">{formatCurrency(state.non_interest_income, currency)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm py-1.5 border-b gap-2">
                <span className="text-muted-foreground">Operating Expenses (Salaries, AI, Security, IT)</span>
                <span className="font-mono-numbers font-semibold text-rose-400 shrink-0">-{formatCurrency(state.operating_expenses, currency)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm py-1.5 border-b gap-2">
                <span className="text-muted-foreground">Loan Loss Provisions</span>
                <span className="font-mono-numbers font-semibold text-rose-400 shrink-0">-{formatCurrency(state.loan_loss_provisions, currency)}</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-bold pt-3 border-t-2 border-foreground gap-2">
                <span>Net Quarterly Profit / Loss</span>
                <span className={`font-mono-numbers shrink-0 ${state.net_profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatCurrency(state.net_profit, currency)}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. QUARTERLY HISTORY TAB */}
        <TabsContent value="history" className="space-y-4 sm:space-y-6 pt-3 sm:pt-4">
          <Card className="overflow-hidden">
            <CardHeader className="border-b p-4 sm:p-6 pb-3 sm:pb-4 flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold break-words">Quarterly Financial Ledger</CardTitle>
                <CardDescription className="text-xs mt-0.5">Complete trajectory across all simulated quarters (5 Quarters per Year, 25 Quarters max).</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono shrink-0">
                {history.length} Quarters Recorded
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto scrollbar-thin max-h-[600px] overflow-y-auto">
                <table className="w-full text-xs sm:text-sm min-w-[620px]">
                  <thead className="bg-muted/90 sticky top-0 border-b text-[11px] sm:text-xs text-muted-foreground uppercase backdrop-blur-sm z-10">
                    <tr>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left">Period</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">Assets</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">Deposits</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">Loans</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">Net Profit</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-center">NPL</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-center">CAR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {history.map((h, i) => (
                      <tr key={`${h.year}-q${h.quarter}-${i}`} className="hover:bg-muted/20">
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold whitespace-nowrap">Year {h.year} · Q{h.quarter}</td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right font-mono-numbers">{formatCurrency(h.assets, currency, true)}</td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right font-mono-numbers">{formatCurrency(h.deposits, currency, true)}</td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right font-mono-numbers">{formatCurrency(h.loans, currency, true)}</td>
                        <td className={`px-3 sm:px-4 py-2.5 sm:py-3 text-right font-mono-numbers font-semibold ${h.net_profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {formatCurrency(h.net_profit, currency, true)}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-center font-mono-numbers">{h.npl_ratio}%</td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-center font-mono-numbers font-medium text-blue-400">{h.car}%</td>
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
