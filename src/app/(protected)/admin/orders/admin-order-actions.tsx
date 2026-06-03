"use client";

import { useTransition } from "react";
import { CheckCircle2, XCircle, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/actions/orders";
import { useToast } from "@/hooks/use-toast";

interface AdminOrderActionsProps {
  orderId: string;
  currentStatus: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
}

export function AdminOrderActions({ orderId, currentStatus }: AdminOrderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleUpdate(status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED") {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status);
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Updated", description: `Order marked as ${status.toLowerCase()}.`, variant: "success" });
      }
    });
  }

  if (currentStatus === "COMPLETED" || currentStatus === "REJECTED") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {currentStatus === "PENDING" && (
        <>
          <Button
            variant="success"
            size="sm"
            disabled={isPending}
            onClick={() => handleUpdate("APPROVED")}
            className="h-7 text-xs gap-1"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={() => handleUpdate("REJECTED")}
            className="h-7 text-xs gap-1"
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </Button>
        </>
      )}
      {currentStatus === "APPROVED" && (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => handleUpdate("COMPLETED")}
          className="h-7 text-xs gap-1"
        >
          <Package2 className="h-3.5 w-3.5" />
          Complete
        </Button>
      )}
    </div>
  );
}
