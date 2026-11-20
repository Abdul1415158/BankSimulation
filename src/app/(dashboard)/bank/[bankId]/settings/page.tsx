import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  Settings as SettingsIcon,
  Shield,
  Sliders,
  Trash2,
  Building2,
  DollarSign,
} from "lucide-react";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ bankId: string }>;
}) {
  const { bankId } = await params;
  const supabase = await createClient();

  const { data: bank } = await supabase
    .from("banks")
    .select("*")
    .eq("id", bankId)
    .single();

  if (!bank) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bank Settings & Governance</h1>
          <p className="text-sm text-muted-foreground">
            Configure institutional parameters, dividend payout policies, and governance controls.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Institutional Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Institutional Profile</CardTitle>
            <CardDescription className="text-xs">
              Basic identification and charter parameters for your banking license.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">Bank Legal Name</Label>
              <Input defaultValue={bank.name} disabled className="bg-muted/50" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Charter Country</Label>
                <Input defaultValue={bank.country} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Operational Currency</Label>
                <Input defaultValue={bank.currency} disabled className="bg-muted/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Bank Type</Label>
                <Input defaultValue={bank.bank_type} disabled className="bg-muted/50 capitalize" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Difficulty Tier</Label>
                <Input defaultValue={bank.difficulty} disabled className="bg-muted/50 capitalize" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Corporate Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Governance & Payout Policies</CardTitle>
            <CardDescription className="text-xs">
              Shareholder return targets and regulatory compliance posture.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="text-sm font-medium">Dividend Payout Ratio</p>
                <p className="text-xs text-muted-foreground">Percentage of quarterly net profit returned to shareholders</p>
              </div>
              <Badge variant="outline" className="font-mono-numbers">10.0%</Badge>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="text-sm font-medium">Risk Appetite Mandate</p>
                <p className="text-xs text-muted-foreground">Governs automated loan approval thresholds</p>
              </div>
              <Badge variant="outline">Balanced Growth</Badge>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="text-sm font-medium">Internal Minimum CAR Floor</p>
                <p className="text-xs text-muted-foreground">Self-imposed minimum above 10.5% statutory floor</p>
              </div>
              <Badge variant="outline" className="text-emerald-600 font-mono-numbers">12.0%</Badge>
            </div>

            <div className="pt-2">
              <Button size="sm">Save Corporate Policies</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
