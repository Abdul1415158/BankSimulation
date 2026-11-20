"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteBankDialog } from "./DeleteBankDialog";
import { formatDate, formatQuarter } from "@/lib/formatters";
import { BANK_TYPES } from "@/types/bank";
import type { BankSlot } from "@/types/bank";
import {
  Building2,
  Calendar,
  Clock,
  Globe,
  Trash2,
  Play,
  TrendingUp,
} from "lucide-react";
import { cn } from "cn";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  paused: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  bankrupt: "bg-red-500/20 text-red-400 border-red-500/30",
  completed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  seized: "bg-red-600/20 text-red-300 border-red-600/30",
};

const bankBackgrounds: Record<string, string> = {
  retail: "https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80",
  corporate: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  universal: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
};

export function BankSlotCard({ slot, onDeleted }: { slot: BankSlot; onDeleted?: () => void }) {
  const [showDelete, setShowDelete] = useState(false);
  const bank = slot.bank!;

  const bgImage = bankBackgrounds[bank.bank_type] || bankBackgrounds.universal;

  const timeSinceLastPlayed = (() => {
    const diff = Date.now() - new Date(bank.last_played_at).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(bank.last_played_at);
  })();

  return (
    <>
      <Card
        className="relative overflow-hidden rounded-2xl border border-white/10 shadow-lg text-white bg-slate-950 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      >
        {/* Background Banking Architecture Photography with Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-blue-950/80 backdrop-blur-[1px]" />

        <CardContent className="relative p-6 space-y-4 z-10 flex flex-col justify-between min-h-[300px]">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                Slot {slot.slot_number}
              </span>
              <Badge
                variant="outline"
                className={cn("text-xs uppercase font-semibold", statusColors[bank.status])}
              >
                {bank.status}
              </Badge>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">{bank.name}</h3>
                <p className="text-xs text-white/60 mt-0.5">
                  {BANK_TYPES[bank.bank_type]?.label || bank.bank_type}
                </p>
              </div>
              <div className="size-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 p-0.5 shadow-md shrink-0">
                <div className="size-full bg-slate-950/80 rounded-[10px] flex items-center justify-center">
                  <Building2 className="size-5 text-cyan-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 py-2 text-xs border-y border-white/10 text-white/70">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Globe className="size-3.5 text-cyan-400" /> Headquarters</span>
              <span className="font-medium text-white">{bank.city}, {bank.country} ({bank.currency})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Calendar className="size-3.5 text-cyan-400" /> Simulation Period</span>
              <span className="font-mono-numbers font-medium text-white">{formatQuarter(bank.current_year, bank.current_quarter)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><TrendingUp className="size-3.5 text-cyan-400" /> Strategy</span>
              <span className="font-medium text-cyan-300">{bank.initial_strategy.replace("_", " ")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-cyan-400" /> Last Activity</span>
              <span className="text-white/60">{timeSinceLastPlayed}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-1">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold border-0 shadow-md h-9 text-xs"
              size="sm"
            >
              <Link href={`/bank/${bank.id}`}>
                <Play className="size-3.5 mr-1.5 fill-current" />
                Open Bank Command Center
              </Link>
            </Button>
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-950/40 text-xs h-7 px-2"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="size-3.5 mr-1" /> Delete Slot
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteBankDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        bankId={bank.id}
        bankName={bank.name}
        onDeleted={onDeleted}
      />
    </>
  );
}
