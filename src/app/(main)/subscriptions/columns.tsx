"use client";

import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { Subscription } from "../../../../types/subscriptions";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(price: string, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(Number(price));
  } catch (e) {
    return `${price} ${currency}`;
  }
}

export const subscriptionColumns: ColumnDef<Subscription>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        #{row.getValue("id")}
      </span>
    ),
    size: 60,
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: "user",
    accessorFn: (row) => row.users.name,
    header: "User",
    cell: ({ row }) => {
      const name: string = row.original.users.name;
      const email: string = row.original.users.email;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">{email}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "plan",
    accessorFn: (row) => row.subscription_plans.name,
    header: "Plan Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.subscription_plans.name}</span>
    ),
    enableSorting: false,
  },
  {
    id: "pricing",
    header: "Price & Duration",
    cell: ({ row }) => {
      const val = row.original.subscription_plans.duration_value;
      const type = row.original.subscription_plans.duration_type;
      const price = row.original.subscription_plans.price;
      const currency = row.original.subscription_plans.currency;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{formatCurrency(price, currency)}</span>
          <span className="text-xs text-muted-foreground capitalize">{val} {type}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: string = row.getValue("status");
      let variant: "default" | "destructive" | "secondary" = "secondary";
      if (status === "active") variant = "default";
      if (status === "expired") variant = "secondary";
      if (status === "cancelled") variant = "destructive";
      return (
        <Badge variant={variant} className="capitalize">
          {status}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.getValue("start_date"))}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.getValue("end_date"))}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "cancellation_reason",
    header: "Reason",
    cell: ({ row }) => {
      const reason: string | null = row.getValue("cancellation_reason");
      if (!reason) return <span className="text-muted-foreground">—</span>;
      return (
        <div 
          className="max-w-[200px] truncate text-xs text-muted-foreground"
          title={reason}
        >
          {reason}
        </div>
      );
    },
    enableSorting: false,
  },
];
