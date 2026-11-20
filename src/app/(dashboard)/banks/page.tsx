import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BankSlotCard } from "@/components/banks/BankSlotCard";
import { EmptySlotCard } from "@/components/banks/EmptySlotCard";
import type { BankSlot } from "@/types/bank";

export default async function BanksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch bank slots with their associated banks
  const { data: slots } = await supabase
    .from("bank_slots")
    .select(`
      *,
      bank:banks(*)
    `)
    .eq("user_id", user.id)
    .order("slot_number", { ascending: true });

  // If no slots exist yet (new user, trigger may not have fired), show empty state
  const bankSlots: BankSlot[] = slots && slots.length > 0
    ? (slots as unknown as BankSlot[])
    : [
        { id: "temp-1", user_id: user.id, slot_number: 1 as const, bank_id: null, is_occupied: false, created_at: "", updated_at: "", bank: null },
        { id: "temp-2", user_id: user.id, slot_number: 2 as const, bank_id: null, is_occupied: false, created_at: "", updated_at: "", bank: null },
        { id: "temp-3", user_id: user.id, slot_number: 3 as const, bank_id: null, is_occupied: false, created_at: "", updated_at: "", bank: null },
      ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Banks</h1>
        <p className="text-muted-foreground mt-1">
          Manage your banking simulations. You have 3 bank slots available.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bankSlots.map((slot) =>
          slot.is_occupied && slot.bank ? (
            <BankSlotCard key={slot.id} slot={slot} />
          ) : (
            <EmptySlotCard key={slot.id} slotNumber={slot.slot_number} />
          )
        )}
      </div>
    </div>
  );
}
