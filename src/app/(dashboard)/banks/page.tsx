"use client";

import { useState, useEffect } from "react";
import { BankSlotCard } from "@/components/banks/BankSlotCard";
import { EmptySlotCard } from "@/components/banks/EmptySlotCard";
import { getBankSlots } from "@/lib/storage";
import type { BankSlot } from "@/types/bank";

export default function BanksPage() {
  const [bankSlots, setBankSlots] = useState<BankSlot[]>([]);
  const [loading, setLoading] = useState(true);

  function loadSlots() {
    const slots = getBankSlots();
    setBankSlots(slots);
    setLoading(false);
  }

  useEffect(() => {
    loadSlots();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-96" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            <div className="h-64 bg-muted rounded-xl" />
            <div className="h-64 bg-muted rounded-xl" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Banks</h1>
        <p className="text-muted-foreground mt-1">
          Manage your banking simulations. You have 3 persistent bank slots available.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bankSlots.map((slot) =>
          slot.is_occupied && slot.bank ? (
            <BankSlotCard key={slot.id} slot={slot} onDeleted={loadSlots} />
          ) : (
            <EmptySlotCard key={slot.id} slotNumber={slot.slot_number} />
          )
        )}
      </div>
    </div>
  );
}
