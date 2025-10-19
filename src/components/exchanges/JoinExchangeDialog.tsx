"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuthToken } from "@/hooks/useAuthToken";

interface JoinExchangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExchangeJoined: () => void;
  walletAddress?: string;
}

export function JoinExchangeDialog({
  open,
  onOpenChange,
  onExchangeJoined,
  walletAddress,
}: JoinExchangeDialogProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuthToken();

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    if (!walletAddress || !token) {
      toast.error("Please connect your wallet and sign in first");
      return;
    }

    try {
      setLoading(true);

      // Use a dummy exchangeId since we're finding by invite code
      const response = await fetch("/api/exchanges/join/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inviteCode: inviteCode.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to join exchange");
      }

      toast.success(`Joined "${data.exchange.name}" successfully!`);
      setInviteCode("");
      onOpenChange(false);
      onExchangeJoined();
    } catch (error) {
      console.error("Error joining exchange:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to join exchange",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Gift Exchange</DialogTitle>
          <DialogDescription>
            Enter the invite code you received to join an existing gift
            exchange.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite Code *</Label>
            <Input
              id="inviteCode"
              placeholder="e.g., ABC123"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              disabled={loading}
              maxLength={6}
              className="font-mono text-lg tracking-wider"
            />
            <p className="text-sm text-muted-foreground">
              Ask the exchange creator for the 6-character invite code
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleJoin} disabled={loading || !inviteCode.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Join Exchange
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
