"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteBank } from "@/app/actions/bank-actions";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankId: string;
  bankName: string;
}

export function DeleteBankDialog({
  open,
  onOpenChange,
  bankId,
  bankName,
}: DeleteBankDialogProps) {
  const router = useRouter();
  const [confirmName, setConfirmName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmName === bankName;

  async function handleDelete() {
    if (!isConfirmed) return;
    setLoading(true);
    setError(null);

    try {
      const result = await deleteBank(bankId);
      if (!result.success) {
        setError(result.error || "Failed to delete bank.");
        return;
      }
      onOpenChange(false);
      setConfirmName("");
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="size-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-lg">
              Delete {bankName}?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm">
            This action cannot be undone. All simulation data, employees,
            customers, loans, and reports for{" "}
            <strong className="text-foreground">{bankName}</strong> will be
            permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="confirmName" className="text-sm">
            Type <strong>{bankName}</strong> to confirm
          </Label>
          <Input
            id="confirmName"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={bankName}
            className="font-medium"
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setConfirmName("");
              setError(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
          >
            {loading && <Loader2 className="size-4 animate-spin mr-2" />}
            Delete Bank
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
