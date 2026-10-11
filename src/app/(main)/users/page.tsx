"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { fetchUsers } from "@utils/api";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { User, UserPagination } from "../../../../types/users";
import { userColumns } from "./columns";

type FilterKey = "is_active" | "is_premium" | "has_pet";

const FILTER_LABELS = {
  active: "Active",
  inactive: "Inactive",
  premium: "Premium",
  free: "Free",
  noPet: "No pet",
  hasPet: "Has pet",
} as const;

/** `all` = show everyone; missing key defaults to no-pet (has_pet=false). */
function parseHasPet(
  value: string | null,
): boolean | undefined {
  if (value === null) return false;
  if (value === "all") return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return false;
}

function parseBool(value: string | null): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export default function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("limit") ?? "10");
  const isActive = parseBool(searchParams.get("is_active"));
  const isPremium = parseBool(searchParams.get("is_premium"));
  const hasPet = parseHasPet(
    searchParams.has("has_pet") ? searchParams.get("has_pet") : null,
  );
  const query = searchParams.get("q") ?? "";

  // Local state for the input so it feels responsive while debounce is pending
  const [inputValue, setInputValue] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [data, setData] = useState<User[]>([]);
  const [pagination, setPagination] = useState<UserPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  // Persist default "No pet" in the URL so shareable links match what you see
  useEffect(() => {
    if (!searchParams.has("has_pet")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("has_pet", "false");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, pathname, router]);

  // Sync input if URL changes externally (back/forward nav)
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  function handleSearchChange(value: string) {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ q: value || null, page: "1" });
    }, 400);
  }

  function clearSearch() {
    setInputValue("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateParams({ q: null, page: "1" });
  }

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUsers({
        page,
        limit: pageSize,
        ...(query ? { search: query } : {}),
        ...(isActive !== undefined ? { is_active: isActive } : {}),
        ...(isPremium !== undefined ? { is_premium: isPremium } : {}),
        ...(hasPet !== undefined ? { has_pet: hasPet } : {}),
      });
      setData(res?.data?.data?.data ?? []);
      setPagination(res?.data?.data?.pagination ?? null);
    } catch {
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, query, isActive, isPremium, hasPet]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function toggleFilter(key: FilterKey, value: boolean) {
    if (key === "has_pet") {
      // Toggle off → show all users (sentinel "all", not missing — missing re-defaults)
      updateParams({
        has_pet: hasPet === value ? "all" : String(value),
        page: "1",
      });
      return;
    }
    const current = key === "is_active" ? isActive : isPremium;
    updateParams({
      [key]: current === value ? null : String(value),
      page: "1",
    });
  }

  function clearFilters() {
    // Reset status/premium; restore default "No pet"
    updateParams({
      is_active: null,
      is_premium: null,
      has_pet: "false",
      page: "1",
    });
  }

  // Default view is "No pet" only — Clear / badge reflect departure from that
  const hasExtraFilters = isActive !== undefined || isPremium !== undefined;
  const hasPetNonDefault = hasPet !== false;
  const hasFilters = hasExtraFilters || hasPetNonDefault;
  const activeFilterCount =
    [isActive, isPremium].filter((v) => v !== undefined).length +
    (hasPet === false ? 1 : hasPet === true ? 1 : 0);

  const table = useReactTable({
    data,
    columns: userColumns,
    state: { pagination: { pageIndex: page - 1, pageSize } },
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
    rowCount: pagination?.total ?? 0,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: page - 1, pageSize })
          : updater;
      updateParams({
        page: String(next.pageIndex + 1),
        limit: String(next.pageSize),
      });
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          {pagination && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {pagination.total} total users
            </p>
          )}
        </div>

        {/* Search + Filters row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={inputValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search users…"
              className="h-8 w-48 pl-8 pr-7 text-xs"
            />
            {inputValue && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="h-5 w-px bg-border" />

          <span className="flex items-center gap-1.5 text-sm text-muted-foreground pr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </span>

          <Button
            variant={hasPet === false ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => toggleFilter("has_pet", false)}
          >
            {FILTER_LABELS.noPet}
          </Button>
          <Button
            variant={hasPet === true ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => toggleFilter("has_pet", true)}
          >
            {FILTER_LABELS.hasPet}
          </Button>

          <div className="h-5 w-px bg-border" />

          <Button
            variant={isActive === true ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => toggleFilter("is_active", true)}
          >
            {FILTER_LABELS.active}
          </Button>
          <Button
            variant={isActive === false ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => toggleFilter("is_active", false)}
          >
            {FILTER_LABELS.inactive}
          </Button>

          <div className="h-5 w-px bg-border" />

          <Button
            variant={isPremium === true ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => toggleFilter("is_premium", true)}
          >
            {FILTER_LABELS.premium}
          </Button>
          <Button
            variant={isPremium === false ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => toggleFilter("is_premium", false)}
          >
            {FILTER_LABELS.free}
          </Button>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={clearFilters}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table card — unchanged */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading users…</span>
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-destructive">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={loadUsers}
              className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <DataTable
                table={table}
                columns={userColumns}
                onRowClick={(row) => router.push(`/users/${row.original.id}`)}
              />
            </div>
            <div className="border-t py-3">
              <DataTablePagination table={table} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
