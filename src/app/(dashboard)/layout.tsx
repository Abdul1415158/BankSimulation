"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Landmark, User, LogOut } from "lucide-react";
import { getCurrentUser, logoutUser, UserProfile } from "@/lib/storage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  function handleSignOut() {
    logoutUser();
    router.push("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top header */}
      <header className="h-14 border-b border-border bg-white flex items-center justify-between px-4 sm:px-6 shrink-0">
        <Link href="/banks" className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Landmark className="size-3.5 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight">BANKVERSE</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="size-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <User className="size-3.5 text-white" />
                </div>
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {user?.email || "Banker"}
                </span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name || "Chief Executive"}</p>
              <p className="text-xs text-muted-foreground">{user?.email || "banker@bankverse.com"}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/banks" className="flex items-center w-full" />}>
              <Landmark className="size-4 mr-2" />
              My Banks
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<button type="button" onClick={handleSignOut} className="flex items-center w-full text-red-600" />}>
              <LogOut className="size-4 mr-2 text-red-600" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
