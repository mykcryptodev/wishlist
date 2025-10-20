"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
              className="font-mono text-lg tracking-wider"
              disabled={loading}
              id="inviteCode"
              maxLength={6}
              placeholder="e.g., ABC123"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
            />
            <p className="text-sm text-muted-foreground">
              Ask the exchange creator for the 6-character invite code
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={loading}
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button disabled={loading || !inviteCode.trim()} onClick={handleJoin}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Join Exchange
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
