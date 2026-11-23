"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setCurrentUser } from "@/lib/storage";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("banker@bankverse.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    setCurrentUser({
      id: `usr-${Date.now()}`,
      email,
      name: name || "Bank Executive",
    });

    setTimeout(() => {
      router.push("/banks");
    }, 350);
  }

  return (
    <Card className="border border-border/80 bg-card/70 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden transition-all">
      <CardHeader className="p-6 sm:p-8 pb-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs font-semibold text-blue-400 border-blue-500/30 gap-1.5 py-0.5 px-2.5 bg-blue-500/5">
            <Sparkles className="size-3 text-blue-400" />
            <span>Executive Portal</span>
          </Badge>
          <span className="text-[11px] text-muted-foreground font-mono">Sim v2.4 Active</span>
        </div>

        <div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Sign in to access your active bank slots, quarterly simulation desk, and regulatory ledger.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-2 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Email Address Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Executive Email</span>
              <span className="text-[10px] text-muted-foreground font-normal">Registered account</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="banker@bankverse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="pl-10 h-11 bg-background/60 border-border/80 focus:border-blue-500 transition-colors text-sm rounded-xl"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-blue-500 hover:text-blue-400 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
                className="pl-10 pr-10 h-11 bg-background/60 border-border/80 focus:border-blue-500 transition-colors text-sm rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-2 pt-1 pb-1">
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/40 border border-border/40 text-[11px] text-muted-foreground">
              <Building2 className="size-3.5 text-blue-400 shrink-0" />
              <span className="truncate">Instant Desk Access</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/40 border border-border/40 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Local Storage Encrypted</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/20 border-0 transition-all gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Opening Bankverse...</span>
              </>
            ) : (
              <>
                <span>Log In & Open Bankverse</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

          {/* Footer Navigation */}
          <div className="pt-2 text-center border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-blue-500 hover:text-blue-400 font-semibold underline-offset-4 hover:underline transition-colors"
              >
                Create free account
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
