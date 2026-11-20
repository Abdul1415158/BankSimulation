"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import {
  Zap,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { getBank, getEvents, resolveEvent, CrisisEvent } from "@/lib/storage";
import type { Bank } from "@/types/bank";

export default function EventsPage() {
  const params = useParams();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [events, setEvents] = useState<CrisisEvent[]>([]);

  function reload() {
    if (!bankId) return;
    setBank(getBank(bankId));
    setEvents(getEvents(bankId));
  }

  useEffect(() => {
    reload();
  }, [bankId]);

  if (!bank) return <div className="p-6">Loading crisis events...</div>;

  const currency = bank.currency || "USD";
  const activeEvents = events.filter((e) => !e.resolved);
  const resolvedEvents = events.filter((e) => e.resolved);

  function handleChoose(eventId: string, optId: string) {
    resolveEvent(bankId, eventId, optId);
    reload();
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Economic Events & Crisis Desk</h1>
        <p className="text-sm text-muted-foreground">
          Mitigate cybersecurity threats, employee resignations, and macroeconomic disruptions.
        </p>
      </div>

      {activeEvents.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="size-4" /> Urgent Incidents Requiring Executive Action ({activeEvents.length})
          </h2>
          {activeEvents.map((ev) => (
            <Card key={ev.id} className="border-red-300 bg-red-50/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="destructive" className="text-xs uppercase font-bold">
                    {ev.severity} Severity
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    Year {ev.year}, Q{ev.quarter}
                  </span>
                </div>
                <CardTitle className="text-lg text-foreground mt-2">{ev.title}</CardTitle>
                <CardDescription className="text-sm text-foreground/80 leading-relaxed">
                  {ev.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Mitigation Choices:</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {ev.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between space-y-3 hover:border-blue-400 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm">{opt.label}</p>
                          <span className="font-mono-numbers text-xs font-bold text-red-600">
                            {formatCurrency(opt.cost, currency)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleChoose(ev.id, opt.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                      >
                        Authorize Decision
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-8 text-center space-y-2">
            <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Operational Status Clean</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No active crises or regulatory inquiries are pending this quarter. Maintain capital buffers and surveillance.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resolved Incident Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Historical Crisis Log</CardTitle>
          <CardDescription className="text-xs">Archive of resolved incidents and management decisions.</CardDescription>
        </CardHeader>
        <CardContent>
          {resolvedEvents.length > 0 ? (
            <div className="space-y-3">
              {resolvedEvents.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 text-xs">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{ev.title}</p>
                    <p className="text-muted-foreground">Action executed: {ev.chosen_option || "Mitigated"}</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50">
                    <CheckCircle2 className="size-3 mr-1" /> Resolved
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No historical crisis incidents recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
