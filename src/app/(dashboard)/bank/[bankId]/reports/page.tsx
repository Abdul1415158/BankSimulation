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
    link.setAttribute("download", `${bank?.name || "bank"}_financial_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executive & Regulatory Reports</h1>
          <p className="text-sm text-muted-foreground">
            Official 15-Section Year-End Reports, Supervisory Audits, Balance Sheets, and Multi-Quarter Historical Ledgers.
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
          <Download className="size-4" />
          <span>Export CSV Ledger</span>
        </Button>
      </div>

      {/* FINAL 5-YEAR PERFORMANCE CLIMAX BANNER */}
      {finalReport && (
        <Card className="border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Award className="size-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-amber-950 dark:text-amber-200">
                    5-Year Executive Mandate Concluded · Board of Directors Evaluation
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Final Tenure Rating: <strong className="text-amber-500 font-bold">{finalReport.mandate_grade}</strong> · {finalReport.total_quarters_completed} Quarters Completed
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
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

      <Tabs defaultValue={annualReports.length > 0 ? "annual-reports" : "balance-sheet"} className="w-full">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="annual-reports" className="gap-1.5">
            <BookOpen className="size-4" /> Annual Reports
            {annualReports.some((r) => !r.is_read) && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1">
                NEW
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="balance-sheet" className="gap-1.5">
            <Scale className="size-4" /> Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="income-statement" className="gap-1.5">
            <TrendingUp className="size-4" /> Profit & Loss (P&L)
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <Landmark className="size-4" /> Quarterly History
          </TabsTrigger>
        </TabsList>

        {/* 1. ANNUAL REPORTS (15 SECTIONS) */}
        <TabsContent value="annual-reports" className="space-y-6">
          {annualReports.length === 0 ? (
            <Card className="border-dashed p-8 text-center space-y-3">
              <FileText className="size-12 text-muted-foreground/40 mx-auto" />
              <CardTitle className="text-lg">No Annual Reports Generated Yet</CardTitle>
              <CardDescription className="max-w-md mx-auto text-xs leading-relaxed">
                Annual Reports are automatically compiled upon the completion of <strong>Quarter 5</strong> of each operating year. Currently active: <strong>Year {bank.current_year} · Quarter {bank.current_quarter} of 5</strong>. Advance through Quarter 5 to generate your first Year-End report.
              </CardDescription>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Year list sidebar */}
              <div className="space-y-2 lg:col-span-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Generated Year-End Reports
                </h3>
                {annualReports.map((rep) => (
                  <button
                    key={rep.id}
                    onClick={() => handleSelectReport(rep)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      selectedReport?.id === rep.id
                        ? "border-blue-500 bg-blue-500/10 text-foreground font-semibold"
                        : "border-border hover:border-blue-400/50 bg-card text-muted-foreground"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">Year {rep.year} Report</span>
                        {!rep.is_read && (
                          <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                            UNREAD
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Calendar {rep.calendar_year} · 5 Quarters
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                ))}
              </div>

              {/* 15-Section Document Viewer */}
              {selectedReport && (
                <div className="lg:col-span-3 space-y-6">
                  <Card className="border-blue-500/30 shadow-md">
                    <CardHeader className="border-b pb-4 bg-muted/20">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <Badge variant="outline" className="text-blue-500 border-blue-500/30 text-xs mb-1">
                            Year {selectedReport.year} · Calendar {selectedReport.calendar_year}
                          </Badge>
                          <CardTitle className="text-xl font-bold">
                            {bank.name} — Comprehensive Annual Report
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Executive Address & Supervisory Filings · Generated on {new Date(selectedReport.generated_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs self-start sm:self-auto">
                          Audited Board Document
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6 divide-y divide-border">
                      {Object.entries(selectedReport.sections).map(([key, sec]: [string, AnnualReportSection]) => (
                        <div key={key} className="pt-5 first:pt-0 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                              {sec.title}
                            </h4>
                            {sec.status && (
                              <Badge
                                variant="outline"
                                className={`text-[11px] ${
                                  sec.status === "positive"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                    : sec.status === "warning"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                }`}
                              >
                                {sec.status === "positive" ? (
                                  <CheckCircle2 className="size-3 mr-1" />
                                ) : (
                                  <AlertTriangle className="size-3 mr-1" />
                                )}
                                {sec.status.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {sec.content}
                          </p>

                          {sec.metrics && Object.keys(sec.metrics).length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1.5">
                              {Object.entries(sec.metrics).map(([mKey, mVal]) => (
                                <div key={mKey} className="bg-muted/40 p-2.5 rounded-lg border text-xs">
                                  <span className="text-muted-foreground text-[11px]">{mKey}</span>
                                  <p className="font-semibold text-foreground font-mono-numbers mt-0.5">
                                    {String(mVal)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* 2. BALANCE SHEET */}
        <TabsContent value="balance-sheet" className="space-y-6">
          <Card>
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Consolidated Balance Sheet</CardTitle>
                  <CardDescription className="text-xs">
                    As of Year {bank.current_year}, Quarter {bank.current_quarter} of 5 · Assets = Liabilities + Equity
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
                  <h3 className="font-bold text-sm text-blue-500 uppercase tracking-wider border-b pb-2">
                    Total Assets
                  </h3>
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span>Cash & Central Bank Reserves</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(state.cash_reserves, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span>Gross Loan Portfolio</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(state.total_loans_outstanding, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span>Sovereign Treasury Securities</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(state.cash_reserves * 0.3, currency)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 text-foreground">
                    <span>Total Assets</span>
                    <span className="font-mono-numbers text-blue-500">{formatCurrency(state.total_assets, currency)}</span>
                  </div>
                </div>

                {/* Liabilities & Equity */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-cyan-500 uppercase tracking-wider border-b pb-2">
                    Liabilities & Shareholder Equity
                  </h3>
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span>Customer Deposit Liabilities</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(state.total_deposits, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span>Paid-in Capital</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(bank.starting_capital, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span>Retained Earnings</span>
                    <span className="font-mono-numbers font-medium">{formatCurrency(state.total_equity - bank.starting_capital, currency)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 text-foreground">
                    <span>Total Liabilities & Equity</span>
                    <span className="font-mono-numbers text-cyan-500">{formatCurrency(state.total_liabilities + state.total_equity, currency)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. INCOME STATEMENT */}
        <TabsContent value="income-statement">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Statement of Comprehensive Income (P&L)</CardTitle>
              <CardDescription className="text-xs">Quarterly financial performance and earnings yield.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-w-2xl">
              <div className="flex justify-between text-sm py-1.5 border-b">
                <span className="text-muted-foreground">Net Interest Income (NII)</span>
                <span className="font-mono-numbers font-semibold text-emerald-500">{formatCurrency(state.net_interest_income, currency)}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5 border-b">
                <span className="text-muted-foreground">Non-Interest Fees & Commissions</span>
                <span className="font-mono-numbers font-semibold text-emerald-500">{formatCurrency(state.non_interest_income, currency)}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5 border-b">
                <span className="text-muted-foreground">Operating Expenses (Salaries, AI, Overhead)</span>
                <span className="font-mono-numbers font-semibold text-rose-500">-{formatCurrency(state.operating_expenses, currency)}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5 border-b">
                <span className="text-muted-foreground">Loan Loss Provisions</span>
                <span className="font-mono-numbers font-semibold text-rose-500">-{formatCurrency(state.loan_loss_provisions, currency)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-foreground">
                <span>Net Quarterly Profit</span>
                <span className={`font-mono-numbers ${state.net_profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {formatCurrency(state.net_profit, currency)}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. HISTORY */}
        <TabsContent value="history">
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
                  <tbody className="divide-y">
                    {history.map((h, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-semibold">Year {h.year} Q{h.quarter}</td>
                        <td className="px-4 py-3 text-right font-mono-numbers">{formatCurrency(h.assets, currency, true)}</td>
                        <td className="px-4 py-3 text-right font-mono-numbers">{formatCurrency(h.deposits, currency, true)}</td>
                        <td className="px-4 py-3 text-right font-mono-numbers">{formatCurrency(h.loans, currency, true)}</td>
                        <td className="px-4 py-3 text-right font-mono-numbers font-semibold text-emerald-500">{formatCurrency(h.net_profit, currency, true)}</td>
                        <td className="px-4 py-3 text-center font-mono-numbers">{h.npl_ratio}%</td>
                        <td className="px-4 py-3 text-center font-mono-numbers font-medium text-blue-500">{h.car}%</td>
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
