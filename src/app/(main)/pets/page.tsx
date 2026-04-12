"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  fetchPetRegistrationData,
  fetchPets,
  unverifyPet,
  updateFoundingDog,
  verifyPet,
} from "@utils/api";
import {
  BadgeCheck,
  Crown,
  Loader2,
  PawPrint,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { Pet, createPetColumns } from "./columns";

// ─── Types ────────────────────────────────────────────────────────────────────

type PetPagination = {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};

type FilterState = {
  is_active: boolean | undefined;
  is_founding_dog: boolean | undefined;
  verification_status: string | undefined;
};

// ─── Pet Detail Dialog ────────────────────────────────────────────────────────

function PetDetailDialog({
  pet,
  open,
  onClose,
  registrationData,
  onPetUpdated,
}: {
  pet: Pet | null;
  open: boolean;
  onClose: () => void;
  registrationData: any;
  onPetUpdated?: (petId: number, changes: Partial<Pet>) => void;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isVerified, setIsVerified] = useState(
    pet?.verification_status === "approved",
  );
  const [isFoundingDog, setIsFoundingDog] = useState(
    pet?.is_founding_dog ?? false,
  );
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [foundingLoading, setFoundingLoading] = useState(false);

  // Sync local state when the pet prop changes (different pet opened)
  useEffect(() => {
    setIsVerified(pet?.verification_status === "approved");
    setIsFoundingDog(pet?.is_founding_dog ?? false);
  }, [pet?.id]);

  if (!pet) return null;

  async function handleVerifyToggle(checked: boolean) {
    setVerifyLoading(true);
    try {
      if (checked) {
        await verifyPet(pet!.id);
        setIsVerified(true);
        onPetUpdated?.(pet!.id, { verification_status: "approved" });
        toast.success(`${pet!.name} has been verified.`);
      } else {
        await unverifyPet(pet!.id);
        setIsVerified(false);
        onPetUpdated?.(pet!.id, { verification_status: "pending" });
        toast.success(`${pet!.name} has been unverified.`);
      }
    } catch {
      toast.error("Failed to update verification status.");
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleFoundingDogToggle(checked: boolean) {
    setFoundingLoading(true);
    try {
      await updateFoundingDog(pet!.id, checked);
      setIsFoundingDog(checked);
      onPetUpdated?.(pet!.id, { is_founding_dog: checked });
      toast.success(
        checked
          ? `${pet!.name} marked as Founding Dog.`
          : `${pet!.name} removed from Founding Dogs.`,
      );
    } catch {
      toast.error("Failed to update founding dog status.");
    } finally {
      setFoundingLoading(false);
    }
  }

  if (!pet) return null;

  const primaryImageUrl =
    pet.images?.find((img) => img.is_primary)?.image_url ||
    pet.images?.[0]?.image_url;
  const slides = pet.images?.map((img) => ({ src: img.image_url })) ?? [];

  function resolveAttributeLabels(
    selections: Record<string, number[]> | null,
    masterList: any[],
  ) {
    if (!selections || !masterList) return [];
    return Object.entries(selections)
      .map(([id, optionIds]) => {
        const attr = masterList.find((a: any) => String(a.id) === String(id));
        if (!attr) return null;
        const labels = (Array.isArray(optionIds) ? optionIds : [optionIds]).map(
          (optId: any) => {
            const opt = attr.options?.find(
              (o: any) => String(o.id) === String(optId),
            );
            return opt?.value || opt?.name || `#${optId}`;
          },
        );
        return { name: attr.name, labels };
      })
      .filter(Boolean) as { name: string; labels: string[] }[];
  }

  const attrGroups = resolveAttributeLabels(
    pet.attribute_selections,
    registrationData?.attributes ?? [],
  );
  const prefGroups = resolveAttributeLabels(
    pet.preference_selections,
    registrationData?.preference_types ?? [],
  );

  const verificationMap: Record<string, { label: string; className: string }> =
    {
      approved: {
        label: "Approved",
        className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
      },
      pending: {
        label: "Pending",
        className: "bg-amber-500/15 text-amber-600 border-amber-500/30",
      },
      rejected: {
        label: "Rejected",
        className: "bg-red-500/15 text-red-600 border-red-500/30",
      },
    };
  const verifyCfg = verificationMap[pet.verification_status] ?? {
    label: pet.verification_status,
    className: "",
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <PawPrint className="h-5 w-5 text-muted-foreground" />
              {pet.name}
              {pet.nickname && (
                <span className="text-sm text-muted-foreground font-normal italic">
                  "{pet.nickname}"
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-5 mt-4">
            {/* Image Gallery */}
            {pet.images && pet.images.length > 0 && (
              <div className="space-y-2">
                {/* Primary Image */}
                <div
                  className="relative h-56 rounded-xl overflow-hidden bg-muted cursor-pointer group"
                  onClick={() => {
                    const idx = Math.max(
                      0,
                      pet.images.findIndex(
                        (img) => img.image_url === primaryImageUrl,
                      ),
                    );
                    setLightboxIndex(idx);
                    setLightboxOpen(true);
                  }}
                >
                  {primaryImageUrl ? (
                    <img
                      src={primaryImageUrl}
                      alt={pet.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <PawPrint className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <span className="absolute bottom-2 right-2 text-xs bg-black/60 text-white rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    View full
                  </span>
                </div>

                {/* Thumbnail Strip */}
                {pet.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {pet.images.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => {
                          setLightboxIndex(idx);
                          setLightboxOpen(true);
                        }}
                        className="h-14 w-14 shrink-0 rounded-md overflow-hidden border-2 border-transparent hover:border-primary transition-all opacity-80 hover:opacity-100"
                      >
                        <img
                          src={img.image_url}
                          alt={`Photo ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={pet.is_active ? "default" : "destructive"}>
                {pet.is_active ? "Active" : "Inactive"}
              </Badge>
              {isVerified ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  <BadgeCheck className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className={verifyCfg.className}>
                  {verifyCfg.label}
                </Badge>
              )}
              {isFoundingDog && (
                <Badge className="bg-violet-600 hover:bg-violet-700 text-white gap-1">
                  <Crown className="h-3 w-3" />
                  Founding Dog
                </Badge>
              )}
              {pet.is_spayed_neutered && (
                <Badge variant="outline">Spayed / Neutered</Badge>
              )}
            </div>

            {/* Action Toggles */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2.5 border rounded-lg px-3 py-2 bg-muted/20 min-w-[160px]">
                <div className="flex flex-col">
                  <Label
                    htmlFor={`verify-dialog-${pet.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {isVerified ? "Verified" : "Unverified"}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Verification status
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  {verifyLoading && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  )}
                  <Switch
                    id={`verify-dialog-${pet.id}`}
                    checked={isVerified}
                    onCheckedChange={handleVerifyToggle}
                    disabled={verifyLoading}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 border rounded-lg px-3 py-2 bg-muted/20 min-w-[160px]">
                <div className="flex flex-col">
                  <Label
                    htmlFor={`founding-dialog-${pet.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {isFoundingDog ? "Founding Dog" : "Not Founding Dog"}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Founding dog status
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  {foundingLoading && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  )}
                  <Switch
                    id={`founding-dialog-${pet.id}`}
                    checked={isFoundingDog}
                    onCheckedChange={handleFoundingDogToggle}
                    disabled={foundingLoading}
                  />
                </div>
              </div>
            </div>

            {/* Core Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Breed</p>
                <p className="font-medium">
                  {pet.pet_breeds?.name || pet.pet_categories?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Gender</p>
                <p className="font-medium capitalize">{pet.gender}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Age</p>
                <p className="font-medium">
                  {pet.age != null
                    ? `${pet.age} yr${pet.age !== 1 ? "s" : ""}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Birth Date
                </p>
                <p className="font-medium">
                  {pet.birth_date
                    ? new Date(pet.birth_date).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Weight</p>
                <p className="font-medium">
                  {pet.weight != null ? `${pet.weight} kg` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Height</p>
                <p className="font-medium">
                  {pet.height != null ? `${pet.height} cm` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Vaccination
                </p>
                <p className="font-medium capitalize">
                  {pet.vaccination_status?.replace(/_/g, " ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Registration
                </p>
                <p className="font-medium capitalize">
                  {pet.registration_status?.replace(/_/g, " ") || "—"}
                </p>
              </div>
            </div>

            {/* Bark-o-graphy */}
            {pet.bark_o_graphy && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Bark-o-graphy
                </p>
                <p className="text-sm leading-relaxed">{pet.bark_o_graphy}</p>
              </div>
            )}

            {/* Fun Fact */}
            {pet.fun_fact_or_habit && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Fun Fact / Habit
                </p>
                <p className="text-sm leading-relaxed">
                  {pet.fun_fact_or_habit}
                </p>
              </div>
            )}

            {/* Description */}
            {pet.description && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Description
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {pet.description}
                </p>
              </div>
            )}

            {/* Attribute Selections */}
            {attrGroups.length > 0 && (
              <div className="space-y-3 pt-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-t pt-4">
                  Attributes
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attrGroups.map((group) => (
                    <div key={group.name}>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        {group.name}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.labels.map((lbl, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="font-normal"
                          >
                            {lbl}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preference Selections */}
            {prefGroups.length > 0 && (
              <div className="space-y-3 pt-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-t pt-4">
                  Preferences
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {prefGroups.map((group) => (
                    <div key={group.name}>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        {group.name}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.labels.map((lbl, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="font-normal bg-muted/30"
                          >
                            {lbl}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={slides}
        plugins={[Thumbnails, Zoom]}
      />
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PetsPage() {
  const [data, setData] = useState<Pet[]>([]);
  const [pagination, setPagination] = useState<PetPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    is_active: undefined,
    is_founding_dog: undefined,
    verification_status: undefined,
  });

  // Fetch registration data once
  useEffect(() => {
    fetchPetRegistrationData()
      .then((res) => setRegistrationData(res?.data?.data ?? res?.data))
      .catch(() => console.warn("Could not load pet registration data"));
  }, []);

  const loadPets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPets({
        page,
        limit: pageSize,
        sort: "created_at",
        order: "DESC",
        ...(searchValue ? { search: searchValue } : {}),
        ...(filters.is_active !== undefined
          ? { is_active: filters.is_active }
          : {}),
        ...(filters.is_founding_dog !== undefined
          ? { is_founding_dog: filters.is_founding_dog }
          : {}),
        ...(filters.verification_status
          ? { verification_status: filters.verification_status }
          : {}),
      });
      setData(res?.data?.data?.data ?? []);
      setPagination(res?.data?.data?.pagination ?? null);
    } catch {
      setError("Failed to load pets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchValue, filters]);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  function handleSearchChange(value: string) {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchValue(value);
      setPage(1);
    }, 400);
  }

  function clearSearch() {
    setInputValue("");
    setSearchValue("");
    setPage(1);
  }

  function toggleBoolFilter(
    key: "is_active" | "is_founding_dog",
    value: boolean,
  ) {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
    setPage(1);
  }

  function toggleVerificationStatus(value: string) {
    setFilters((prev) => ({
      ...prev,
      verification_status:
        prev.verification_status === value ? undefined : value,
    }));
    setPage(1);
  }

  function clearFilters() {
    setFilters({
      is_active: undefined,
      is_founding_dog: undefined,
      verification_status: undefined,
    });
    setPage(1);
  }

  const hasFilters =
    filters.is_active !== undefined ||
    filters.is_founding_dog !== undefined ||
    filters.verification_status !== undefined;

  const activeFilterCount = [
    filters.is_active,
    filters.is_founding_dog,
    filters.verification_status,
  ].filter((v) => v !== undefined).length;

  const columns = createPetColumns((pet) => {
    setSelectedPet(pet);
    setDialogOpen(true);
  });

  const table = useReactTable({
    data,
    columns,
    state: { pagination: { pageIndex: page - 1, pageSize } },
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
    rowCount: pagination?.total ?? 0,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: page - 1, pageSize })
          : updater;
      setPage(next.pageIndex + 1);
      setPageSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pets</h1>
          {pagination && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {pagination.total} total pets
            </p>
          )}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={inputValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search pets…"
              className="h-8 w-44 pl-8 pr-7 text-xs"
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

          {/* Filter label */}
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground pr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </span>

          {/* Active / Inactive */}
          <Button
            variant={filters.is_active === true ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => toggleBoolFilter("is_active", true)}
          >
            Active
          </Button>
          <Button
            variant={filters.is_active === false ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => toggleBoolFilter("is_active", false)}
          >
            Inactive
          </Button>

          <div className="h-5 w-px bg-border" />

          {/* Founding Dog */}
          <Button
            variant={filters.is_founding_dog === true ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => toggleBoolFilter("is_founding_dog", true)}
          >
            Founding Dog
          </Button>

          <div className="h-5 w-px bg-border" />

          {/* Verification Status */}
          {(["approved", "pending", "rejected"] as const).map((status) => (
            <Button
              key={status}
              variant={
                filters.verification_status === status ? "default" : "outline"
              }
              size="sm"
              className="h-8 text-xs capitalize"
              onClick={() => toggleVerificationStatus(status)}
            >
              {status}
            </Button>
          ))}

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
        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading pets…</span>
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-destructive">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={loadPets}
              className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <DataTable table={table} columns={columns} />
            </div>
            <div className="border-t py-3">
              <DataTablePagination table={table} />
            </div>
          </>
        )}
      </div>

      {/* Detail Dialog */}
      <PetDetailDialog
        pet={selectedPet}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        registrationData={registrationData}
        onPetUpdated={(petId, changes) => {
          // Update the row in the table in-place
          setData((prev) =>
            prev.map((p) => (p.id === petId ? { ...p, ...changes } : p)),
          );
          // Also update selectedPet state for the dialog badge refresh
          setSelectedPet((prev) =>
            prev && prev.id === petId ? { ...prev, ...changes } : prev,
          );
        }}
      />
    </div>
  );
}
