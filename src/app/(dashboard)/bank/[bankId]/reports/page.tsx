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
  Users,
  Bot,
  Sparkles,
  Cpu,
  Zap,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
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
    <div className="p-4 sm:p-8 space-y-6 max-w-[1550px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30">
              Desk · Reports & Audits
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Year {bank.current_year} · Quarter {bank.current_quarter} of 4
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">Financial & Regulatory Reporting Suite</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Audited Balance Sheets, Comprehensive Income (P&L), Human vs. AI Workforce Analytics, and Annual Reports.
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2 shrink-0 w-full sm:w-auto justify-center">
          <Download className="size-4" />
          <span>Export CSV Ledger</span>
        </Button>
      </div>

      {/* TOP TAB NAVIGATION BAR (Roomy, Never overlaps, Clearly separated from Report Section) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="w-full pb-3 border-b border-border/60">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full h-auto p-1.5 bg-muted/40 border border-border/80 rounded-2xl gap-2 shadow-sm">
            <TabsTrigger
              value="annual-reports"
              className="h-auto py-3 px-3 sm:px-5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md border border-transparent data-[state=active]:border-border/60"
            >
              <BookOpen className="size-4 text-blue-500 shrink-0" />
              <span>Annual Reports</span>
              {annualReports.some((r) => !r.is_read) && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 shrink-0 leading-none">
                  NEW
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="balance-sheet"
              className="h-auto py-3 px-3 sm:px-5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md border border-transparent data-[state=active]:border-border/60"
            >
              <Scale className="size-4 text-cyan-500 shrink-0" />
              <span>Balance Sheet</span>
            </TabsTrigger>
            <TabsTrigger
              value="income-statement"
              className="h-auto py-3 px-3 sm:px-5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md border border-transparent data-[state=active]:border-border/60"
            >
              <TrendingUp className="size-4 text-emerald-500 shrink-0" />
              <span>Profit & Loss</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="h-auto py-3 px-3 sm:px-5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md border border-transparent data-[state=active]:border-border/60"
            >
              <Landmark className="size-4 text-purple-500 shrink-0" />
              <span>Quarterly Ledger</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. ANNUAL REPORTS TAB */}
        <TabsContent value="annual-reports" className="space-y-6 pt-2">
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
                Annual Reports are automatically compiled upon the completion of <strong>Quarter 4</strong> of each operating year. Currently active: <strong>Year {bank.current_year} · Quarter {bank.current_quarter} of 4</strong>. Advance through Quarter 4 to generate your first Year-End report.
              </CardDescription>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Year Selector Pills (Spacious archive toolbar placed right below navigation) */}
              <div className="p-3 sm:p-4 bg-muted/40 border border-border/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2 shrink-0">
                  <Calendar className="size-4 text-blue-400" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Historical Annual Archives:
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                  {annualReports.map((rep) => (
                    <button
                      key={rep.id}
                      onClick={() => handleSelectReport(rep)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap ${
                        selectedReport?.id === rep.id
                          ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-500/30"
                          : "bg-background hover:bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      <span>Year {rep.year} Report</span>
                      <span className="text-[11px] opacity-75">({rep.calendar_year})</span>
                      {!rep.is_read && (
                        <span className="size-2 rounded-full bg-rose-400 animate-pulse ml-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 15-Section Report Briefcase (Expanded full-width area with generous margins) */}
              {selectedReport && (
                <Card className="border-blue-500/30 shadow-lg overflow-hidden rounded-2xl bg-card/60">
                  <CardHeader className="border-b p-5 sm:p-7 pb-5 bg-muted/20 space-y-4">
                    {/* Top: Header Text & Regulatory Badges */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-blue-400 border-blue-500/30 text-xs py-0.5 px-3">
                          Official Regulatory Filing · Year {selectedReport.year} (Calendar {selectedReport.calendar_year})
                        </Badge>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs py-0.5 px-3">
                          Audited 4-Quarter Package
                        </Badge>
                      </div>
                      <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        {bank.name} — Year {selectedReport.year} Comprehensive Annual Report
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-4xl">
                        Statutory CEO Address, Audited Financial Statements, Human vs. AI Workforce Strategy, and Solvency Disclosures.
                      </CardDescription>
                    </div>

                    {/* Dedicated Filter Bar on its own clear row */}
                    <div className="pt-3 border-t border-border/50">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setActiveSectionKey("all")}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            activeSectionKey === "all"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
                          }`}
                        >
                          All Sections (15)
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSectionKey("ai")}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                            activeSectionKey === "ai"
                              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm"
                              : "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/30"
                          }`}
                        >
                          <Bot className="size-3.5" />
                          <span>Human vs AI Workforce</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSectionKey("exec")}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            activeSectionKey === "exec"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
                          }`}
                        >
                          Financial & Executive
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSectionKey("risk")}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            activeSectionKey === "risk"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
                          }`}
                        >
                          Risk & Regulation
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-6 space-y-6">
                    {/* EXECUTIVE HUMAN VS. AI WORKFORCE DOSSIER (Shown in 'All' and 'Human vs AI' views) */}
                    {selectedReport.human_vs_ai_kpis && (activeSectionKey === "all" || activeSectionKey === "ai") && (
                      <Card className="border-cyan-500/40 bg-gradient-to-br from-blue-950/20 via-background to-cyan-950/20 shadow-lg overflow-hidden">
                        <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/20">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start sm:items-center gap-3">
                              <div className="size-10 sm:size-11 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                                <Bot className="size-5 sm:size-6" />
                              </div>
                              <div>
                                <CardTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                                  <span>Human vs. AI Workforce Strategy & Performance</span>
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                  Quantitative analysis of personnel costs, AI agent automation, throughput efficiency, and net payroll savings.
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold text-xs">
                                {selectedReport.human_vs_ai_kpis.outcome_category}
                              </Badge>
                              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold text-xs">
                                {selectedReport.human_vs_ai_kpis.decision_evaluation}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 sm:p-5 space-y-5">
                          {/* 4 Primary KPI Highlight Cards */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                            <div className="p-3 bg-background/80 rounded-xl border border-blue-500/20 space-y-1">
                              <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-[11px] font-medium flex items-center gap-1">
                                  <Users className="size-3.5 text-blue-400" />
                                  Human Bankers
                                </span>
                              </div>
                              <p className="text-base sm:text-lg font-bold text-foreground font-mono-numbers">
                                {selectedReport.human_vs_ai_kpis.human_count} Personnel
                              </p>
                              <span className="text-[11px] text-muted-foreground block font-mono-numbers">
                                Payroll: {formatCurrency(selectedReport.human_vs_ai_kpis.human_quarterly_cost, currency)}/qtr
                              </span>
                            </div>

                            <div className="p-3 bg-background/80 rounded-xl border border-cyan-500/20 space-y-1">
                              <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-[11px] font-medium flex items-center gap-1">
                                  <Bot className="size-3.5 text-cyan-400" />
                                  AI Agents Deployed
                                </span>
                              </div>
                              <p className="text-base sm:text-lg font-bold text-cyan-400 font-mono-numbers">
                                {selectedReport.human_vs_ai_kpis.ai_count} Units
                              </p>
                              <span className="text-[11px] text-muted-foreground block font-mono-numbers">
                                AI Opex: {formatCurrency(selectedReport.human_vs_ai_kpis.ai_quarterly_cost, currency)}/qtr
                              </span>
                            </div>

                            <div className="p-3 bg-background/80 rounded-xl border border-emerald-500/20 space-y-1">
                              <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-[11px] font-medium flex items-center gap-1">
                                  <TrendingUp className="size-3.5 text-emerald-400" />
                                  Estimated Savings
                                </span>
                              </div>
                              <p className="text-base sm:text-lg font-bold text-emerald-400 font-mono-numbers">
                                {formatCurrency(selectedReport.human_vs_ai_kpis.estimated_human_savings, currency)}
                              </p>
                              <span className="text-[11px] text-emerald-400/80 block">
                                {selectedReport.human_vs_ai_kpis.cost_savings_pct}% Payroll Reduction
                              </span>
                            </div>

                            <div className="p-3 bg-background/80 rounded-xl border border-purple-500/20 space-y-1">
                              <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-[11px] font-medium flex items-center gap-1">
                                  <Cpu className="size-3.5 text-purple-400" />
                                  AI Workload Share
                                </span>
                              </div>
                              <p className="text-base sm:text-lg font-bold text-purple-400 font-mono-numbers">
                                {selectedReport.human_vs_ai_kpis.ai_workload_share_pct}%
                              </p>
                              <span className="text-[11px] text-muted-foreground block font-mono-numbers">
                                {selectedReport.human_vs_ai_kpis.ai_tasks_handled.toLocaleString()} AI Tasks Handled
                              </span>
                            </div>
                          </div>

                          {/* Comparative Performance Matrix Table */}
                          <div className="rounded-xl border border-border/70 overflow-hidden bg-background/60">
                            <div className="p-3 bg-muted/40 border-b border-border/70 flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <BarChart3 className="size-3.5 text-blue-400" />
                                Comparative Workforce Matrix (Quarterly Evaluation)
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                Standard vs Autonomous Model
                              </span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b bg-muted/20 text-muted-foreground text-[11px] uppercase">
                                    <th className="text-left py-2.5 px-3.5">Performance Metric</th>
                                    <th className="text-center py-2.5 px-3.5">Human Employees</th>
                                    <th className="text-center py-2.5 px-3.5">Autonomous AI Agents</th>
                                    <th className="text-right py-2.5 px-3.5">Strategic Outcome</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                  <tr className="hover:bg-muted/10">
                                    <td className="py-2.5 px-3.5 font-medium text-foreground">Total Deployed Count</td>
                                    <td className="py-2.5 px-3.5 text-center font-mono-numbers">{selectedReport.human_vs_ai_kpis.human_count} Officers</td>
                                    <td className="py-2.5 px-3.5 text-center font-mono-numbers text-cyan-400 font-semibold">{selectedReport.human_vs_ai_kpis.ai_count} Agents</td>
                                    <td className="py-2.5 px-3.5 text-right text-muted-foreground">{selectedReport.human_vs_ai_kpis.ai_count > 0 ? "Hybrid Allocation" : "Manual Staffing"}</td>
                                  </tr>
                                  <tr className="hover:bg-muted/10">
                                    <td className="py-2.5 px-3.5 font-medium text-foreground">Quarterly Operating Cost</td>
                                    <td className="py-2.5 px-3.5 text-center font-mono-numbers">{formatCurrency(selectedReport.human_vs_ai_kpis.human_quarterly_cost, currency)}</td>
                                    <td className="py-2.5 px-3.5 text-center font-mono-numbers text-cyan-400">{formatCurrency(selectedReport.human_vs_ai_kpis.ai_quarterly_cost, currency)}</td>
                                    <td className="py-2.5 px-3.5 text-right font-mono-numbers font-semibold text-emerald-400">
                                      {selectedReport.human_vs_ai_kpis.estimated_human_savings > 0 ? `-${formatCurrency(selectedReport.human_vs_ai_kpis.estimated_human_savings, currency)} (Savings)` : "Baseline"}
                                    </td>
                                  </tr>
                                  <tr className="hover:bg-muted/10">
                                    <td className="py-2.5 px-3.5 font-medium text-foreground">Operational Execution Speed</td>
                                    <td className="py-2.5 px-3.5 text-center text-muted-foreground">1.0x (Standard Banking Pace)</td>
                                    <td className="py-2.5 px-3.5 text-center font-semibold text-cyan-400">8.0x High-Velocity Automation</td>
                                    <td className="py-2.5 px-3.5 text-right text-emerald-400 font-medium">Instant 24/7 Processing</td>
                                  </tr>
                                  <tr className="hover:bg-muted/10">
                                    <td className="py-2.5 px-3.5 font-medium text-foreground">Accuracy / Error Guard</td>
                                    <td className="py-2.5 px-3.5 text-center font-mono-numbers">{selectedReport.human_vs_ai_kpis.human_count > 0 ? `${selectedReport.human_vs_ai_kpis.human_productivity_score}%` : "N/A"}</td>
                                    <td className="py-2.5 px-3.5 text-center font-mono-numbers text-cyan-400">{selectedReport.human_vs_ai_kpis.ai_count > 0 ? `${selectedReport.human_vs_ai_kpis.ai_accuracy_score}%` : "98% (Target)"}</td>
                                    <td className="py-2.5 px-3.5 text-right text-muted-foreground">Strict Rule Compliance</td>
                                  </tr>
                                  <tr className="hover:bg-muted/10">
                                    <td className="py-2.5 px-3.5 font-medium text-foreground">Quarterly Task Throughput</td>
                                    <td className="py-2.5 px-3.5 text-center font-mono-numbers">{selectedReport.human_vs_ai_kpis.human_tasks_handled.toLocaleString()} Tasks</td>
                                    <td className="py-2.5 px-3.5 text-center font-mono-numbers text-cyan-400">{selectedReport.human_vs_ai_kpis.ai_tasks_handled.toLocaleString()} Tasks</td>
                                    <td className="py-2.5 px-3.5 text-right font-mono-numbers font-medium">{selectedReport.human_vs_ai_kpis.total_tasks_handled.toLocaleString()} Total Handled</td>
                                  </tr>
                                  <tr className="hover:bg-muted/10">
                                    <td className="py-2.5 px-3.5 font-medium text-foreground">Customer Relationship Model</td>
                                    <td className="py-2.5 px-3.5 text-center text-muted-foreground">High-Touch Advisory</td>
                                    <td className="py-2.5 px-3.5 text-center text-cyan-400">Instant Digital Routing</td>
                                    <td className="py-2.5 px-3.5 text-right text-blue-400 font-medium">{selectedReport.human_vs_ai_kpis.customer_satisfaction_rating}% Trust Score</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Decision vs Outcome Executive Commentary */}
                          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Sparkles className="size-4 text-cyan-400 shrink-0" />
                              <strong className="text-foreground font-semibold">
                                Executive Strategic Decision Evaluation:
                              </strong>
                            </div>
                            <p className="text-muted-foreground leading-relaxed pl-6">
                              {selectedReport.human_vs_ai_kpis.evaluation_summary}
                            </p>
                            <p className="text-[11px] text-cyan-400/90 pl-6 font-mono">
                              Academic Simulation Benchmark: Evaluates management replacement decisions (human hiring vs AI agent automation) against net bank profit and customer service quality.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {/* Render sections with spacious, responsive cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                      {Object.entries(selectedReport.sections)
                        .filter(([key]) => {
                          if (activeSectionKey === "ai") {
                            return key === "human_vs_ai_workforce";
                          }
                          if (activeSectionKey === "exec") {
                            return ["executive_summary", "financial_performance", "profit_and_loss", "assets_and_liabilities", "loan_portfolio", "deposit_growth", "capital_and_liquidity"].includes(key);
                          }
                          if (activeSectionKey === "risk") {
                            return ["security_and_risk", "regulatory_and_compliance", "major_decisions", "important_events", "achievements_and_failures", "recommendations_next_year"].includes(key);
                          }
                          return true;
                        })
                        .map(([key, sec]: [string, AnnualReportSection]) => {
                          const isFullWidth = key === "executive_summary" || key === "recommendations_next_year" || key === "human_vs_ai_workforce";
                          return (
                            <div
                              key={key}
                              className={`p-6 sm:p-7 rounded-2xl border bg-card shadow-sm transition-all space-y-4 min-w-0 ${
                                isFullWidth ? "lg:col-span-2" : ""
                              } ${
                                sec.status === "negative"
                                  ? "border-rose-500/40 bg-rose-500/5"
                                  : sec.status === "warning"
                                  ? "border-amber-500/40 bg-amber-500/5"
                                  : "border-border/80 hover:border-blue-500/50"
                              }`}
                            >
                              <div className="flex items-start sm:items-center justify-between gap-3">
                                <h4 className="font-bold text-base sm:text-lg text-foreground leading-snug flex-1 min-w-0">
                                  {sec.title}
                                </h4>
                                {sec.status && (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs font-semibold shrink-0 whitespace-nowrap px-3 py-1 ${
                                      sec.status === "positive"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                        : sec.status === "warning"
                                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                    }`}
                                  >
                                    {sec.status === "positive" ? (
                                      <CheckCircle2 className="size-3.5 mr-1 inline-block" />
                                    ) : (
                                      <AlertTriangle className="size-3.5 mr-1 inline-block" />
                                    )}
                                    {sec.status.toUpperCase()}
                                  </Badge>
                                )}
                              </div>

                              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line font-normal">
                                {sec.content}
                              </p>

                              {sec.metrics && Object.keys(sec.metrics).length > 0 && (
                                <div
                                  className={`grid gap-2.5 pt-3 border-t border-border/60 text-xs ${
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
                                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/50 min-w-0"
                                    >
                                      <span className="text-muted-foreground text-xs font-medium truncate shrink-0 max-w-[65%]">
                                        {mKey}
                                      </span>
                                      <span className="font-bold text-foreground font-mono-numbers text-xs sm:text-sm text-right truncate">
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
        <TabsContent value="balance-sheet" className="space-y-6 pt-2">
          <Card className="overflow-hidden rounded-2xl border-border/80 shadow-md">
            <CardHeader className="border-b p-5 sm:p-6 pb-4 bg-muted/20">
              <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                <div className="min-w-0">
                  <CardTitle className="text-lg sm:text-xl font-bold break-words">Consolidated Balance Sheet Statement</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-0.5">
                    As of Year {bank.current_year}, Quarter {bank.current_quarter} of 4 · Assets = Liabilities + Shareholder Equity
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shrink-0 self-start sm:self-auto py-1 px-3">
                  BALANCED
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
                {/* Assets */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-blue-400 uppercase tracking-wider border-b pb-2.5">
                    Total Assets
                  </h3>
                  <div className="flex justify-between text-xs sm:text-sm py-2 border-b gap-2">
                    <span className="text-muted-foreground">Cash & Central Bank Reserves</span>
                    <span className="font-mono-numbers font-medium shrink-0">{formatCurrency(Math.round(state.cash_reserves * 0.7), currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm py-2 border-b gap-2">
                    <span className="text-muted-foreground">Sovereign Treasury Securities</span>
                    <span className="font-mono-numbers font-medium shrink-0">{formatCurrency(Math.round(state.cash_reserves * 0.3), currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm py-2 border-b gap-2">
                    <span className="text-muted-foreground">Gross Loan Portfolio</span>
                    <span className="font-mono-numbers font-medium shrink-0">{formatCurrency(state.total_loans_outstanding, currency)}</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-bold pt-3 text-foreground gap-2">
                    <span>Total Assets</span>
                    <span className="font-mono-numbers text-blue-400 shrink-0">{formatCurrency(state.total_assets, currency)}</span>
                  </div>
                </div>

                {/* Liabilities & Equity */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-cyan-400 uppercase tracking-wider border-b pb-2.5">
                    Liabilities & Shareholder Equity
                  </h3>
                  <div className="flex justify-between text-xs sm:text-sm py-2 border-b gap-2">
                    <span className="text-muted-foreground">Customer Deposit Liabilities</span>
                    <span className="font-mono-numbers font-medium shrink-0">{formatCurrency(state.total_deposits, currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm py-2 border-b gap-2">
                    <span className="text-muted-foreground">Paid-in Charter Capital</span>
                    <span className="font-mono-numbers font-medium shrink-0">{formatCurrency(bank.starting_capital, currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm py-2 border-b gap-2">
                    <span className="text-muted-foreground">Retained Earnings Buffer</span>
                    <span className="font-mono-numbers font-medium shrink-0">{formatCurrency(Math.max(0, state.total_equity - bank.starting_capital), currency)}</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-bold pt-3 text-foreground gap-2">
                    <span>Total Liabilities & Equity</span>
                    <span className="font-mono-numbers text-cyan-400 shrink-0">{formatCurrency(state.total_liabilities + state.total_equity, currency)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. PROFIT & LOSS TAB */}
        <TabsContent value="income-statement" className="space-y-6 pt-2">
          <Card className="overflow-hidden rounded-2xl border-border/80 shadow-md">
            <CardHeader className="border-b p-5 sm:p-6 pb-4 bg-muted/20">
              <CardTitle className="text-lg sm:text-xl font-bold break-words">Statement of Comprehensive Income (P&L)</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">Quarterly financial performance, operational margins, and net earnings.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-8 space-y-4 max-w-3xl">
              <div className="flex justify-between text-xs sm:text-sm py-2 border-b gap-2">
                <span className="text-muted-foreground">Net Interest Income (NII)</span>
                <span className="font-mono-numbers font-semibold text-emerald-400 shrink-0">{formatCurrency(state.net_interest_income, currency)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm py-2 border-b gap-2">
                <span className="text-muted-foreground">Non-Interest Fees & Commissions</span>
                <span className="font-mono-numbers font-semibold text-emerald-400 shrink-0">{formatCurrency(state.non_interest_income, currency)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm py-2 border-b gap-2">
                <span className="text-muted-foreground">Operating Expenses (Salaries, AI, Security, IT)</span>
                <span className="font-mono-numbers font-semibold text-rose-400 shrink-0">-{formatCurrency(state.operating_expenses, currency)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm py-2 border-b gap-2">
                <span className="text-muted-foreground">Loan Loss Provisions</span>
                <span className="font-mono-numbers font-semibold text-rose-400 shrink-0">-{formatCurrency(state.loan_loss_provisions, currency)}</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-bold pt-4 border-t-2 border-foreground gap-2">
                <span>Net Quarterly Profit / Loss</span>
                <span className={`font-mono-numbers shrink-0 ${state.net_profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatCurrency(state.net_profit, currency)}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. QUARTERLY HISTORY TAB */}
        <TabsContent value="history" className="space-y-6 pt-2">
          <Card className="overflow-hidden rounded-2xl border-border/80 shadow-md">
            <CardHeader className="border-b p-5 sm:p-6 pb-4 bg-muted/20 flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold break-words">Quarterly Financial Ledger</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-0.5">Complete trajectory across all simulated quarters (4 Quarters per Year, 20 Quarters max).</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono shrink-0 py-1 px-3">
                {history.length} Quarters Recorded
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto scrollbar-thin max-h-[650px] overflow-y-auto">
                <table className="w-full text-xs sm:text-sm min-w-[650px]">
                  <thead className="bg-muted/90 sticky top-0 border-b text-[11px] sm:text-xs text-muted-foreground uppercase backdrop-blur-sm z-10">
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
                      <tr key={`${h.year}-q${h.quarter}-${i}`} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-semibold whitespace-nowrap">Year {h.year} · Q{h.quarter}</td>
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
