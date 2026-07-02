"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSubscriptionManualModeStore } from "@/stores/subscription-manual-mode/subscription-manual-mode-store";
import {
  blockUser,
  fetchPetRegistrationData,
  fetchSubscriptions,
  fetchUserDetails,
  fetchUserPets,
  grantPremium,
  revokePremium,
  unBlockUser,
  unverifyPet,
  updateFoundingDog,
  verifyPet,
} from "@utils/api";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Crown,
  Loader2,
  LogIn,
  Mail,
  PawPrint,
  Phone,
  ShieldAlert,
  ShieldOff,
  User,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

interface UserDetail {
  id: number;
  email: string;
  phone: string;
  auth_type: string;
  name: string;
  gender: "male" | "female" | "prefer_not_to_say";
  is_active: boolean;
  is_verified: boolean;
  is_premium: boolean;
  premium_expires_at: string | null;
  last_login_at: string | null;
  login_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatGender(gender: UserDetail["gender"]) {
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="text-sm font-medium break-all">{value}</div>
      </div>
    </div>
  );
}

function PetDetailedCard({
  pet,
  registrationData,
}: {
  pet: any;
  registrationData?: any;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isFoundingDog, setIsFoundingDog] = useState(
    pet.is_founding_dog || false,
  );
  const [isToggling, setIsToggling] = useState(false);

  const [isVerificationStatus, setIsVerificationStatus] = useState(
    pet.verification_status,
  );
  const [verificationLoading, setVerificationLoading] = useState(false);

  const handleVerifyToggle = async (checked: boolean) => {
    setVerificationLoading(true);
    try {
      if (!checked) {
        await unverifyPet(pet.id);
        setIsVerificationStatus("pending");
        toast.success("Pet has been unverified.");
      } else {
        await verifyPet(pet.id);
        setIsVerificationStatus("approved");
        toast.success("Pet has been verified.");
      }
    } catch {
      toast.error("Failed to update verification status.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleToggleFoundingDog = async (checked: boolean) => {
    setIsToggling(true);
    try {
      await updateFoundingDog(pet.id, checked);
      setIsFoundingDog(checked);
      toast.success(`Founding dog status updated correctly`);
    } catch {
      toast.error("Failed to update founding dog status");
    } finally {
      setIsToggling(false);
    }
  };

  // The primary image stays constant internally
  const primaryImageUrl =
    pet.images?.find((img: any) => img.is_primary)?.image_url ||
    pet.images?.[0]?.image_url;

  // Formatting images for the lightbox plugin
  const slides = pet.images?.map((img: any) => ({ src: img.image_url })) || [];

  const petBreed =
    pet.pet_breeds?.name || pet.pet_categories?.name || "No breed info";

  return (
    <div className="flex flex-col rounded-xl border bg-card/50 overflow-hidden shadow-sm transition-shadow hover:shadow-md relative">
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={slides}
        plugins={[Thumbnails, Zoom]}
      />
      {/* Header: Photo Gallery and Badges */}
      <div className="flex flex-col sm:flex-row border-b">
        <div className="flex flex-col w-full sm:w-64 border-r shrink-0">
          <div
            className="h-56 bg-muted relative group cursor-pointer"
            onClick={() => {
              const idx =
                pet.images?.findIndex(
                  (img: any) => img.image_url === primaryImageUrl,
                ) || 0;
              setLightboxIndex(Math.max(0, idx));
              setLightboxOpen(true);
            }}
          >
            {primaryImageUrl ? (
              <img
                src={primaryImageUrl}
                alt={pet.name || "Pet"}
                className="h-full w-full object-cover group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl text-muted-foreground font-semibold">
                {pet.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <Badge
                variant={pet.is_active ? "default" : "secondary"}
                className="shadow-sm"
              >
                {pet.is_active ? "Active" : "Inactive"}
              </Badge>
              {isVerificationStatus === "approved" && (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 shadow-sm border-transparent text-white">
                  Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Thumbnails to expand lightbox */}
          {pet.images && pet.images.length > 1 && (
            <div className="flex p-2 gap-2 overflow-x-auto no-scrollbar bg-card border-t">
              {pet.images.map((img: any, idx: number) => (
                <button
                  key={img.id}
                  onClick={() => {
                    setLightboxIndex(idx);
                    setLightboxOpen(true);
                  }}
                  className="h-12 w-12 shrink-0 rounded-md overflow-hidden border-2 border-transparent transition-all hover:border-primary opacity-80 hover:opacity-100"
                >
                  <img
                    src={img.image_url}
                    alt="Thumbnail"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Name & Basic Info flex wrapper */}
        <div className="p-5 flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="min-w-0">
              <h3 className="text-xl font-bold truncate">
                {pet.name || "Unknown"}
              </h3>
              {pet.nickname && (
                <p className="text-sm text-muted-foreground italic truncate">
                  "{pet.nickname}"
                </p>
              )}
            </div>

            {/* Verify Action Toggle */}
            <div className="flex items-center space-x-2 bg-muted/30 px-3 py-1.5 rounded-md border shrink-0">
              <Label htmlFor={`verify-${pet.id}`} className="text-sm font-medium whitespace-nowrap cursor-pointer">
                {isVerificationStatus === "approved" ? "Verified" : "Unverified"}
              </Label>
              <Switch
                id={`verify-${pet.id}`}
                checked={isVerificationStatus === "approved"}
                onCheckedChange={handleVerifyToggle}
                disabled={verificationLoading}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-auto pt-2">
            <Badge variant="outline" className="capitalize">
              {petBreed}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {pet.gender}
            </Badge>
            {pet.age !== null && pet.age !== undefined && (
              <Badge variant="outline">{pet.age} yrs</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Extended Details Grid */}
      <div className="p-5 bg-muted/30 text-sm space-y-4 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              Registration Status
            </p>
            <p className="font-medium capitalize">
              {pet.registration_status?.replace("_", " ") || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Vaccination</p>
            <p className="font-medium capitalize">
              {pet.vaccination_status?.replace("_", " ") || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              Spayed / Neutered
            </p>
            <p className="font-medium">
              {pet.is_spayed_neutered ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Birth Date</p>
            <p className="font-medium">
              {pet.birth_date
                ? new Date(pet.birth_date).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Founding Dog</p>
            <div className="flex items-center space-x-2">
              <Switch
                id={`founding-dog-${pet.id}`}
                checked={isFoundingDog}
                onCheckedChange={handleToggleFoundingDog}
                disabled={isToggling}
              />
              <Label
                htmlFor={`founding-dog-${pet.id}`}
                className="text-sm font-medium"
              >
                {isFoundingDog ? "Yes" : "No"}
              </Label>
            </div>
          </div>
        </div>

        {/* Attributes Mapping */}

        {(() => {
          const elements: React.ReactNode[] = [];

          if (
            pet.attribute_selections &&
            typeof pet.attribute_selections === "object" &&
            registrationData?.attributes
          ) {
            Object.entries(pet.attribute_selections).forEach(
              ([attrId, optionIds]) => {
                const attribute = registrationData.attributes.find(
                  (a: any) => String(a.id) === String(attrId),
                );
                if (!attribute) return;

                const optionLabels = (
                  Array.isArray(optionIds) ? optionIds : [optionIds]
                ).map((optId: any) => {
                  const option = attribute.options?.find(
                    (o: any) => String(o.id) === String(optId),
                  );
                  return option?.name || option?.value || `Option #${optId}`;
                });

                elements.push(
                  <div key={`attr-${attrId}`}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      {attribute.name}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {optionLabels.map((lbl: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="default"
                          className="font-normal"
                        >
                          {lbl}
                        </Badge>
                      ))}
                    </div>
                  </div>,
                );
              },
            );
          }

          if (
            pet.preference_selections &&
            typeof pet.preference_selections === "object" &&
            registrationData?.preference_types
          ) {
            Object.entries(pet.preference_selections).forEach(
              ([prefId, optionIds]) => {
                const preference = registrationData.preference_types.find(
                  (p: any) => String(p.id) === String(prefId),
                );
                if (!preference) return;

                const optionLabels = (
                  Array.isArray(optionIds) ? optionIds : [optionIds]
                ).map((optId: any) => {
                  const option = preference.options?.find(
                    (o: any) => String(o.id) === String(optId),
                  );
                  return option?.name || option?.value || `Option #${optId}`;
                });

                elements.push(
                  <div key={`pref-${prefId}`}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      {preference.name}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {optionLabels.map((lbl: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="default"
                          className="font-normal"
                        >
                          {lbl}
                        </Badge>
                      ))}
                    </div>
                  </div>,
                );
              },
            );
          }

          if (elements.length === 0) return null;

          return <div className="pt-4 border-t mt-4 space-y-4">{elements}</div>;
        })()}

        {/* Biographies */}
        {(pet.bark_o_graphy || pet.fun_fact_or_habit || pet.description) && (
          <div className="pt-4 border-t mt-auto space-y-3">
            {pet.bark_o_graphy && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Bark-o-graphy
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {pet.bark_o_graphy}
                </p>
              </div>
            )}
            {pet.fun_fact_or_habit && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Fun Fact / Habit
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {pet.fun_fact_or_habit}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const { id } = use(params);
  const userId = Number(id[0]);

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [pets, setPets] = useState<any[]>([]);
  const [petsLoading, setPetsLoading] = useState(true);
  const [registrationData, setRegistrationData] = useState<any>(null);

  // Manual Premium states
  const manualModeStore = useSubscriptionManualModeStore();
  const [plans, setPlans] = useState<any[]>([]);

  const [isGrantOpen, setIsGrantOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [grantReason, setGrantReason] = useState("Manual upgrade via admin panel");
  const [grantLoading, setGrantLoading] = useState(false);

  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState("Manual revoke via admin panel");
  const [revokeLoading, setRevokeLoading] = useState(false);

  useEffect(() => {
    manualModeStore.fetch();
    fetchSubscriptions({ limit: 100 })
      .then((res) => {
        const subs = res?.data?.data?.data ?? [];
        const plansMap = new Map();
        subs.forEach((sub: any) => {
          if (sub.subscription_plans) {
            plansMap.set(sub.subscription_plans.id, sub.subscription_plans);
          }
        });
        const extractedPlans = Array.from(plansMap.values());
        setPlans(extractedPlans);
      })
      .catch((err) => console.error("Failed to load plans from subscriptions", err));

    fetchPetRegistrationData()
      .then((res) => setRegistrationData(res?.data?.data ?? res?.data))
      .catch((err) =>
        console.error("Failed to fetch pet attributes mapping", err),
      );
    if (isNaN(userId)) {
      setError("Invalid user ID.");
      setLoading(false);
      return;
    }
    fetchUserDetails(userId)
      .then((res) => {
        const data = res?.data?.data ?? res?.data;
        setUser(data);
      })
      .catch(() => setError("Failed to load user details."))
      .finally(() => setLoading(false));

    fetchUserPets(userId)
      .then((res) => {
        console.log(res, "res");
        const data =
          res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
        setPets(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to load user pets", err))
      .finally(() => setPetsLoading(false));
  }, [userId]);

  const activePlans = plans.length > 0 ? plans : [
    { id: 1, name: "Premium Monthly" },
    { id: 2, name: "Premium Quarterly" },
    { id: 3, name: "Premium Yearly" },
  ];

  async function handleGrantPremium() {
    if (!selectedPlanId) {
      toast.error("Please select a subscription plan");
      return;
    }
    setGrantLoading(true);
    try {
      await grantPremium(userId, {
        plan_id: Number(selectedPlanId),
        reason: grantReason,
      });
      toast.success("Premium granted successfully");
      setIsGrantOpen(false);
      // Refresh user details
      const userRes = await fetchUserDetails(userId);
      setUser(userRes?.data?.data ?? userRes?.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to grant premium");
    } finally {
      setGrantLoading(false);
    }
  }

  async function handleRevokePremium() {
    setRevokeLoading(true);
    try {
      await revokePremium(userId, {
        reason: revokeReason,
      });
      toast.success("Premium revoked successfully");
      setIsRevokeOpen(false);
      // Refresh user details
      const userRes = await fetchUserDetails(userId);
      setUser(userRes?.data?.data ?? userRes?.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to revoke premium");
    } finally {
      setRevokeLoading(false);
    }
  }

  async function handleBlockToggle(checked: boolean) {
    if (!user) return;
    setActionLoading(true);
    try {
      if (!checked) {
        await blockUser(userId);
      } else {
        await unBlockUser(userId);
      }
      // Optimistically toggle is_active
      setUser((prev) =>
        prev ? { ...prev, is_active: checked } : prev,
      );
      toast.success(checked ? "User unblocked successfully" : "User blocked successfully");
    } catch {
      toast.error("Failed to update user block status");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6 ">
      {/* Back nav */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 -ml-2 text-muted-foreground"
          asChild
        >
          <Link href="/users">
            <ArrowLeft className="h-4 w-4" />
            Users
          </Link>
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading user…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border bg-card p-8 text-center text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      {!loading && !error && user && (
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Profile card */}
          <div className="sm:col-span-1 rounded-xl border bg-card shadow-sm flex flex-col items-center gap-3 p-6">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-3xl font-semibold text-muted-foreground select-none">
              {user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="text-center">
              <h1 className="text-lg font-semibold">{user.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                #{user.id} · {formatGender(user.gender)}
              </p>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              <Badge variant={user.is_active ? "default" : "destructive"}>
                {user.is_active ? "Active" : "Blocked"}
              </Badge>
              <Badge variant={user.is_verified ? "default" : "secondary"}>
                {user.is_verified ? "Verified" : "Unverified"}
              </Badge>
              {user.is_premium && (
                <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">
                  Premium
                </Badge>
              )}
            </div>

            {/* Block / Unblock action */}
            <div className="flex items-center justify-between w-full mt-4 p-3 border rounded-md bg-muted/20">
              <Label htmlFor={`user-active-${user.id}`} className="text-sm font-medium cursor-pointer">
                {user.is_active ? "Active" : "Blocked"}
              </Label>
              <Switch
                id={`user-active-${user.id}`}
                checked={user.is_active}
                onCheckedChange={handleBlockToggle}
                disabled={actionLoading}
              />
            </div>
          </div>

          {/* Details card */}
          <div className="sm:col-span-2 rounded-xl border bg-card shadow-sm p-5">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Details
            </h2>

            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={user.email}
            />
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={<span className="font-mono">{user.phone}</span>}
            />
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Auth Type"
              value={
                <Badge variant="outline" className="capitalize">
                  {user.auth_type}
                </Badge>
              }
            />
            <InfoRow
              icon={<BadgeCheck className="h-4 w-4" />}
              label="Verification"
              value={
                user.is_verified ? (
                  <span className="text-emerald-600">Verified</span>
                ) : (
                  <span className="text-muted-foreground">Not verified</span>
                )
              }
            />
            <InfoRow
              icon={<Crown className="h-4 w-4" />}
              label="Premium"
              value={
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <span>
                      {user.is_premium ? (
                        <span className="font-semibold text-amber-600 dark:text-amber-500">
                          Yes — expires {formatDate(user.premium_expires_at)}
                        </span>
                      ) : (
                        "No"
                      )}
                    </span>
                    <Link
                      href={`/subscriptions?user_id=${user.id}`}
                      className="text-xs text-primary hover:underline font-medium shrink-0"
                    >
                      View Subscriptions →
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dashed">
                    {manualModeStore.enabled ? (
                      <>
                        <Button
                          variant="outline"
                          size="xs"
                          className="h-7 text-xs border-amber-500/30 text-amber-700 hover:bg-amber-500/5 hover:text-amber-700 dark:text-amber-500"
                          disabled={user.is_premium}
                          onClick={() => {
                            setSelectedPlanId(activePlans[0]?.id ? String(activePlans[0].id) : "");
                            setGrantReason("Manual upgrade via admin panel");
                            setIsGrantOpen(true);
                          }}
                        >
                          Grant Premium
                        </Button>
                        <Button
                          variant="destructive"
                          size="xs"
                          className="h-7 text-xs"
                          disabled={!user.is_premium}
                          onClick={() => {
                            setRevokeReason("Manual revoke via admin panel");
                            setIsRevokeOpen(true);
                          }}
                        >
                          Revoke Premium
                        </Button>
                      </>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic leading-normal">
                        ℹ Manual grant/revoke is disabled (Razorpay active)
                      </span>
                    )}
                  </div>
                </div>
              }
            />
            <InfoRow
              icon={<LogIn className="h-4 w-4" />}
              label="Logins"
              value={`${user.login_count} time${user.login_count !== 1 ? "s" : ""} · Last: ${formatDate(user.last_login_at)}`}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Joined"
              value={formatDate(user.created_at)}
            />
            {user.deleted_at && (
              <InfoRow
                icon={<ShieldAlert className="h-4 w-4 text-destructive" />}
                label="Deleted at"
                value={
                  <span className="text-destructive">
                    {formatDate(user.deleted_at)}
                  </span>
                }
              />
            )}
          </div>
        </div>
      )}

      {/* Pets Content */}
      {!loading && !error && user && (
        <div className="rounded-xl border bg-card shadow-sm p-5 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <PawPrint className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Pets
            </h2>
          </div>
          {petsLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading pets…</span>
            </div>
          ) : pets.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-1 xl:grid-cols-1">
              {pets.map((pet: any, index: number) => (
                <PetDetailedCard
                  key={pet.id || index}
                  pet={pet}
                  registrationData={registrationData}
                />
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-4 text-center">
              This user has no pets.
            </div>
          )}
        </div>
      )}

      {/* Grant/Revoke Dialog Modals */}
      {!loading && !error && user && (
        <>
          {/* Grant Premium Dialog */}
          <Dialog open={isGrantOpen} onOpenChange={setIsGrantOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                  <Crown className="size-5" />
                  Grant Premium Subscription
                </DialogTitle>
                <DialogDescription>
                  Manually assign a premium subscription package to <strong>{user.name}</strong>.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="plan-select" className="text-xs font-semibold">
                    Select Plan
                  </Label>
                  <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                    <SelectTrigger id="plan-select" className="w-full">
                      <SelectValue placeholder="Select subscription plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePlans.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name} {p.price && p.currency ? `(${p.price} ${p.currency})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="grant-reason" className="text-xs font-semibold">
                    Justification / Reason
                  </Label>
                  <Textarea
                    id="grant-reason"
                    value={grantReason}
                    onChange={(e) => setGrantReason(e.target.value)}
                    placeholder="Provide a reason for manual premium grant"
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setIsGrantOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleGrantPremium} disabled={grantLoading}>
                  {grantLoading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Granting...
                    </>
                  ) : (
                    "Grant Premium"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Revoke Premium Dialog */}
          <Dialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-1.5 text-destructive">
                  <AlertTriangle className="size-5" />
                  Revoke Premium Subscription
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to revoke premium access for <strong>{user.name}</strong>? This action takes effect immediately.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="revoke-reason" className="text-xs font-semibold">
                    Revocation Reason
                  </Label>
                  <Textarea
                    id="revoke-reason"
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="Provide a reason for revoking premium"
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setIsRevokeOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={handleRevokePremium} disabled={revokeLoading}>
                  {revokeLoading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Revoking...
                    </>
                  ) : (
                    "Revoke Premium"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
