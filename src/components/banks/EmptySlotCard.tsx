import Link from "next/link";
import { Plus, Landmark } from "lucide-react";

export function EmptySlotCard({ slotNumber }: { slotNumber: number }) {
  return (
    <Link
      href={`/banks/create?slot=${slotNumber}`}
      className="group block relative overflow-hidden rounded-2xl border-2 border-dashed border-border/80 transition-all duration-300 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-15 group-hover:opacity-25 transition-opacity duration-300"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-card/80 via-card/95 to-card" />

      <div className="relative p-8 text-center min-h-[300px] flex flex-col items-center justify-center gap-4 z-10">
        <span className="absolute top-4 left-4 text-xs font-semibold text-muted-foreground bg-muted/80 backdrop-blur px-2.5 py-1 rounded-full border border-border">
          Slot {slotNumber} · Available
        </span>

        <div className="size-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-dashed border-blue-400/40 flex items-center justify-center group-hover:scale-110 group-hover:border-blue-500 group-hover:bg-blue-500/20 transition-all duration-300">
          <Plus className="size-7 text-blue-500 transition-colors" />
        </div>

        <div>
          <p className="text-lg font-bold text-foreground group-hover:text-blue-500 transition-colors">
            Establish Bank
          </p>
          <p className="text-xs text-muted-foreground max-w-[200px] mt-1.5 leading-relaxed">
            Configure capital, headquarters, loan spreads, and strategic focus in Slot {slotNumber}
          </p>
        </div>

        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-semibold group-hover:bg-blue-500 group-hover:text-white transition-colors">
          <Landmark className="size-3" />
          <span>Start Simulation</span>
        </div>
      </div>
    </Link>
  );
}
