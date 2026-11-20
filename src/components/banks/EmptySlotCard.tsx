import Link from "next/link";
import { Plus } from "lucide-react";

export function EmptySlotCard({ slotNumber }: { slotNumber: number }) {
  return (
    <Link
      href={`/banks/create?slot=${slotNumber}`}
      className="group block"
    >
      <div className="relative rounded-xl border-2 border-dashed border-border bg-card p-8 text-center transition-all hover:border-blue-400 hover:bg-blue-50/30 hover:shadow-sm min-h-[280px] flex flex-col items-center justify-center gap-4">
        <span className="absolute top-3 left-3 text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          Slot {slotNumber}
        </span>

        <div className="size-14 rounded-2xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-100 transition-all">
          <Plus className="size-6 text-muted-foreground/50 group-hover:text-blue-500 transition-colors" />
        </div>

        <div>
          <p className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">
            Create New Bank
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Set up a new banking simulation
          </p>
        </div>
      </div>
    </Link>
  );
}
