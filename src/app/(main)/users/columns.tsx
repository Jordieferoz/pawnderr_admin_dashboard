"use client";

import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { User } from "../../../../types/users";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatGender(gender: User["gender"]) {
  switch (gender) {
    case "male":
      return "Male";
    case "female":
      return "Female";
    case "prefer_not_to_say":
      return "Prefer not to say";
    default:
      return gender;
  }
}

export const userColumns: ColumnDef<User>[] = [
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
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name: string = row.getValue("name");
      const email: string = row.original.email;
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
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("phone")}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatGender(row.getValue("gender"))}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "is_verified",
    header: "Verified",
    cell: ({ row }) => {
      const verified: boolean = row.getValue("is_verified");
      return (
        <Badge variant={verified ? "default" : "secondary"}>
          {verified ? "Verified" : "Unverified"}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "is_premium",
    header: "Premium",
    cell: ({ row }) => {
      const premium: boolean = row.getValue("is_premium");
      return (
        <Badge
          variant={premium ? "default" : "outline"}
          className={
            premium
              ? "bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/20"
              : ""
          }
        >
          {premium ? "Premium" : "Free"}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const active: boolean = row.getValue("is_active");
      return (
        <Badge variant={active ? "default" : "destructive"}>
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "profile_completion_percentage",
    header: "Profile",
    cell: ({ row }) => {
      const pct: number = row.getValue("profile_completion_percentage");
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{pct}%</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "login_count",
    header: "Logins",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("login_count")}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "last_login_at",
    header: "Last Login",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.getValue("last_login_at"))}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    header: "Joined",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.getValue("created_at"))}
      </span>
    ),
    enableSorting: false,
  },
];
