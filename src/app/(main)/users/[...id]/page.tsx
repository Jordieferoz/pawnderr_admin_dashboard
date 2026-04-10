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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  blockUser,
  fetchPetRegistrationData,
  fetchUserDetails,
  fetchUserPets,
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

  const handleVerifyToggle = async () => {
    setVerificationLoading(true);
    try {
      if (isVerificationStatus === "approved") {
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

            {/* Verify Action Dropdown */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={
                    isVerificationStatus === "approved"
                      ? "destructive"
                      : "default"
                  }
                  size="sm"
                  className="shrink-0 gap-1.5"
                  disabled={verificationLoading}
                >
                  {verificationLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isVerificationStatus === "approved" ? (
                    <ShieldOff className="h-3.5 w-3.5" />
                  ) : (
                    <BadgeCheck className="h-3.5 w-3.5" />
                  )}
                  {isVerificationStatus === "approved" ? "Unverify" : "Verify"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    {isVerificationStatus === "approved" ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <BadgeCheck className="h-4 w-4 text-primary" />
                    )}
                    {isVerificationStatus === "approved"
                      ? "Unverify"
                      : "Verify"}{" "}
                    {pet.name}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isVerificationStatus === "approved"
                      ? "This will unverify the pet profile. You can verify them again at any time."
                      : "This will mark the pet as officially verified on the platform."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleVerifyToggle}
                    className={
                      isVerificationStatus === "approved"
                        ? "bg-destructive hover:bg-destructive/90"
                        : ""
                    }
                  >
                    {isVerificationStatus === "approved"
                      ? "Unverify"
                      : "Verify"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
                          variant="secondary"
                          className="font-normal opacity-80"
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
                          variant="outline"
                          className="font-normal bg-muted/30"
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

  useEffect(() => {
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

  async function handleBlockToggle() {
    if (!user) return;
    setActionLoading(true);
    try {
      if (user.is_active) {
        await blockUser(userId);
      } else {
        await unBlockUser(userId);
      }
      // Optimistically toggle is_active
      setUser((prev) =>
        prev ? { ...prev, is_active: !prev.is_active } : prev,
      );
    } catch {
      // No-op: keep existing state on failure
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={user.is_active ? "destructive" : "outline"}
                  size="sm"
                  className="mt-2 w-full gap-1.5"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldOff className="h-3.5 w-3.5" />
                  )}
                  {user.is_active ? "Block User" : "Unblock User"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    {user.is_active ? "Block" : "Unblock"} {user.name}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {user.is_active
                      ? "This will prevent the user from accessing the platform. You can unblock them at any time."
                      : "This will restore the user's access to the platform."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBlockToggle}
                    className={
                      user.is_active
                        ? "bg-destructive hover:bg-destructive/90"
                        : ""
                    }
                  >
                    {user.is_active ? "Block" : "Unblock"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
                user.is_premium
                  ? `Yes — expires ${formatDate(user.premium_expires_at)}`
                  : "No"
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
    </div>
  );
}
