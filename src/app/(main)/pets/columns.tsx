"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

export type Pet = {
  id: number;
  user_id: number;
  name: string;
  nickname: string | null;
  gender: string;
  birth_date: string | null;
  age: number | null;
  weight: number | null;
  height: number | null;
  description: string | null;
  bark_o_graphy: string | null;
  fun_fact_or_habit: string | null;
  vaccination_status: string | null;
  has_vaccination: boolean;
  is_spayed_neutered: boolean;
  is_active: boolean;
  is_founding_dog: boolean;
  verification_status: string;
  verification_notes: string | null;
  registration_status: string | null;
  attribute_selections: Record<string, number[]> | null;
  preference_selections: Record<string, number[]> | null;
  pet_category_id: number;
  pet_breed_id: number;
  pet_categories: { id: number; name: string } | null;
  pet_breeds: { id: number; name: string } | null;
  images: { id: number; image_url: string; is_primary: boolean }[];
  created_at: string;
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function createPetColumns(
  onViewDetails: (pet: Pet) => void,
): ColumnDef<Pet>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{row.getValue("id")}
        </span>
      ),
      size: 60,
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: "Pet",
      cell: ({ row }) => {
        const pet = row.original;
        const primaryImage = pet.images?.find((img) => img.is_primary)?.image_url || pet.images?.[0]?.image_url;
        return (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-muted shrink-0 border">
              {primaryImage ? (
                <img src={primaryImage} alt={pet.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {pet.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-medium truncate">{pet.name}</span>
              {pet.nickname && (
                <span className="text-xs text-muted-foreground italic truncate">"{pet.nickname}"</span>
              )}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "pet_breeds",
      header: "Breed",
      cell: ({ row }) => {
        const pet = row.original;
        const breed = pet.pet_breeds?.name || pet.pet_categories?.name || "—";
        return <span className="text-sm text-muted-foreground">{breed}</span>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => (
        <span className="text-sm capitalize">{row.getValue("gender")}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "age",
      header: "Age",
      cell: ({ row }) => {
        const age = row.getValue("age") as number | null;
        return <span className="text-sm">{age != null ? `${age} yr${age !== 1 ? "s" : ""}` : "—"}</span>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "verification_status",
      header: "Verification",
      cell: ({ row }) => {
        const status: string = row.getValue("verification_status");
        const map: Record<string, { label: string; className: string }> = {
          approved: { label: "Approved", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
          pending: { label: "Pending", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
          rejected: { label: "Rejected", className: "bg-red-500/15 text-red-600 border-red-500/30" },
        };
        const cfg = map[status] ?? { label: status, className: "" };
        return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "is_founding_dog",
      header: "Founding Dog",
      cell: ({ row }) => {
        const val: boolean = row.getValue("is_founding_dog");
        return (
          <Badge variant={val ? "default" : "outline"} className={val ? "bg-violet-600 hover:bg-violet-700" : ""}>
            {val ? "Yes" : "No"}
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
      accessorKey: "created_at",
      header: "Registered",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.getValue("created_at"))}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(row.original);
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          Details
        </Button>
      ),
      size: 90,
      enableSorting: false,
    },
  ];
}
