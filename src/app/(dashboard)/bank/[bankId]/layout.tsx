"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Building2,
  Users,
  Bot,
  UserCircle,
  PiggyBank,
  CreditCard,
  Landmark,
  ShieldAlert,
  Zap,
  FileText,
  Settings,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { getBank } from "@/lib/storage";
import type { Bank } from "@/types/bank";

const sidebarLinks = [
  { label: "Overview", href: "", icon: LayoutDashboard },
  { label: "Departments", href: "/departments", icon: Building2 },
  { label: "Workforce", href: "/workforce", icon: Users },
  { label: "AI Management", href: "/workforce/ai-agents", icon: Bot },
  { label: "Customers", href: "/customers", icon: UserCircle },
  { label: "Deposits", href: "/deposits", icon: PiggyBank },
  { label: "Loans", href: "/loans", icon: CreditCard },
  { label: "Treasury", href: "/treasury", icon: Landmark },
  { label: "Risk Management", href: "/risk", icon: ShieldAlert },
  { label: "Events", href: "/events", icon: Zap },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function BankLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const bankId = params.bankId as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bankId) return;
    const b = getBank(bankId);
    if (!b) {
      router.push("/banks");
      return;
    }
    setBank(b);
    setLoading(false);
  }, [bankId, router]);

  if (loading || !bank) {
    return (
      <div className="flex h-[calc(100vh-56px)] items-center justify-center">
        <div className="animate-spin size-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-[#0a0e1a] text-white/70 border-r border-white/5 shrink-0">
        {/* Bank header */}
        <div className="p-4 border-b border-white/10">
          <Link href="/banks" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 mb-3">
            <ArrowLeft className="size-3" /> My Banks
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shrink-0">
              <Building2 className="size-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white text-sm truncate">{bank.name}</p>
              <p className="text-xs text-white/40">
                Y{bank.current_year} Q{bank.current_quarter} · {bank.currency}
              </p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {sidebarLinks.map((link) => (
            <Link
              key={link.label}
              href={`/bank/${bankId}${link.href}`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5 hover:text-white"
            >
              <link.icon className="size-4 shrink-0" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Quarter indicator */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/40">Simulation</span>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
              {bank.status}
            </Badge>
          </div>
          <Button size="sm" className="w-full mt-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 text-xs" asChild>
            <Link href={`/bank/${bankId}/simulation`}>
              Advance Quarter <ChevronRight className="size-3 ml-1" />
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
