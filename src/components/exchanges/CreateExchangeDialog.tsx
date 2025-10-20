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
import { Textarea } from "@/components/ui/textarea";
import { useAuthToken } from "@/hooks/useAuthToken";

interface CreateExchangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExchangeCreated: () => void;
  walletAddress?: string;
}

export function CreateExchangeDialog({
  open,
  onOpenChange,
  onExchangeCreated,
  walletAddress,
}: CreateExchangeDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuthToken();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter an exchange name");
      return;
    }

    if (!walletAddress || !token) {
      toast.error("Please connect your wallet and sign in first");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/exchanges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create exchange");
      }

      toast.success("Exchange created successfully!");
      setName("");
      setDescription("");
      onOpenChange(false);
      onExchangeCreated();
    } catch (error) {
      console.error("Error creating exchange:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create exchange",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Gift Exchange</DialogTitle>
          <DialogDescription>
            Create a new gift exchange to coordinate gifts with your friends and
            family.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Exchange Name *</Label>
            <Input
              disabled={loading}
              id="name"
              maxLength={100}
              placeholder="e.g., Smith Family, Work Secret Santa"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              disabled={loading}
              id="description"
              placeholder="What's this exchange for?"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
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
          <Button disabled={loading || !name.trim()} onClick={handleCreate}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Exchange
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
