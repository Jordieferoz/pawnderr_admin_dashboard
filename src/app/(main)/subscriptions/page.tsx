"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { fetchSubscriptions } from "@utils/api";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Subscription,
  SubscriptionPagination,
} from "../../../../types/subscriptions";
import { subscriptionColumns } from "./columns";

const FILTER_LABELS: Record<"active" | "expired" | "cancelled", string> = {
  active: "Active",
  expired: "Expired",
  cancelled: "Cancelled",
};

export default function SubscriptionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("limit") ?? "10");
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "active" ||
    statusParam === "expired" ||
    statusParam === "cancelled"
      ? statusParam
      : undefined;
  const userIdParam = searchParams.get("user_id") ?? "";

  const [data, setData] = useState<Subscription[]>([]);
  const [pagination, setPagination] = useState<SubscriptionPagination | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local state for the User ID input
  const [userIdInput, setUserIdInput] = useState(userIdParam);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local input if URL changes (back/forward navigation)
  useEffect(() => {
    setUserIdInput(userIdParam);
  }, [userIdParam]);

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

  const handleUserIdChange = (value: string) => {
    setUserIdInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const parsedId = value.trim();
      updateParams({ user_id: parsedId || null, page: "1" });
    }, 400);
  };

  const clearUserId = () => {
    setUserIdInput("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateParams({ user_id: null, page: "1" });
  };

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSubscriptions({
        page,
        limit: pageSize,
        ...(status ? { status } : {}),
        ...(userIdParam ? { user_id: Number(userIdParam) } : {}),
        sort: "created_at",
        order: "DESC",
      });
      console.log(res, "res");
      const inner = res?.data?.data?.data;
      const paginationData = res?.data?.data?.pagination;
      setData(inner ?? []);
      setPagination(paginationData ?? null);
    } catch {
      setError("Failed to load subscriptions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, userIdParam]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Build a TanStack table instance (manual pagination)
  const table = useReactTable({
    data,
    columns: subscriptionColumns,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
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

  function setStatusFilter(filterStatus: "active" | "expired" | "cancelled") {
    updateParams({
      status: status === filterStatus ? null : filterStatus,
      page: "1",
    });
  }

  function clearFilters() {
    setUserIdInput("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateParams({ status: null, user_id: null, page: "1" });
  }

  const hasFilters = status !== undefined || !!userIdParam;
  const activeFilterCount =
    (status !== undefined ? 1 : 0) + (userIdParam ? 1 : 0);

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Subscriptions
          </h1>
          {pagination && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {pagination.total} total subscriptions
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* User ID Search input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={userIdInput}
              onChange={(e) => handleUserIdChange(e.target.value)}
              placeholder="Search User ID…"
              className="h-8 w-36 pl-8 pr-7 text-xs font-mono"
              type="text"
            />
            {userIdInput && (
              <button
                onClick={clearUserId}
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

          {/* Status filters */}
          <Button
            variant={status === "active" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setStatusFilter("active")}
          >
            {FILTER_LABELS.active}
          </Button>
          <Button
            variant={status === "expired" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setStatusFilter("expired")}
          >
            {FILTER_LABELS.expired}
          </Button>
          <Button
            variant={status === "cancelled" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setStatusFilter("cancelled")}
          >
            {FILTER_LABELS.cancelled}
          </Button>

          <div className="h-5 w-px bg-border" />

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

      {/* Table card */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Loading overlay */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading subscriptions…</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-destructive">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={loadSubscriptions}
              className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <DataTable
                table={table}
                columns={subscriptionColumns}
                onRowClick={(row) =>
                  router.push(`/users/${row.original.users.id}`)
                }
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
