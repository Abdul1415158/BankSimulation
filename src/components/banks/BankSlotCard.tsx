"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Eye,
} from "lucide-react";
import { cn } from "cn";

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  bankrupt: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  seized: "bg-red-200 text-red-800",
};

const typeBorderColors: Record<string, string> = {
  retail: "border-l-blue-500",
  corporate: "border-l-violet-500",
  universal: "border-l-cyan-500",
};

export function BankSlotCard({ slot }: { slot: BankSlot }) {
  const [showDelete, setShowDelete] = useState(false);
  const bank = slot.bank!;

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
        className={cn(
          "relative overflow-hidden border-l-4 transition-all hover:shadow-md",
          typeBorderColors[bank.bank_type] || "border-l-blue-500"
        )}
      >
        <CardContent className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  Slot {slot.slot_number}
                </span>
                <Badge
                  variant="secondary"
                  className={cn("text-xs", statusColors[bank.status])}
                >
                  {bank.status}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">{bank.name}</h3>
            </div>
            <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Building2 className="size-5 text-white" />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="size-3.5" />
              <span>{BANK_TYPES[bank.bank_type]?.label || bank.bank_type}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="size-3.5" />
              <span>
                {bank.city}, {bank.country} · {bank.currency}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>{formatQuarter(bank.current_year, bank.current_quarter)}</span>
              <span className="text-muted-foreground/50">·</span>
              <span>Created {formatDate(bank.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-3.5" />
              <span>Last played {timeSinceLastPlayed}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
              size="sm"
            >
              <Link href={`/bank/${bank.id}`}>
                <Play className="size-3.5 mr-1.5" />
                Open Bank
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" disabled>
                <Eye className="size-3.5 mr-1.5" />
                Summary
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="size-3.5" />
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
      />
    </>
  );
}
